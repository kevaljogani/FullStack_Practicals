const express = require('express');
const { body, validationResult } = require('express-validator');
const ForumPost = require('../models/ForumPost');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Helper function to create notification
const createNotification = async (recipients, type, title, message, relatedEntity) => {
  const notifications = recipients.map(recipient => ({
    recipient: recipient._id || recipient,
    type,
    title,
    message,
    relatedEntity
  }));

  await Notification.insertMany(notifications);
};

// @route   GET /api/forum
// @desc    Get all forum posts
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { category, search, tag, pinned } = req.query;
    
    let query = { isApproved: true };
    
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (pinned === 'true') query.isPinned = true;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await ForumPost.find(query)
      .populate('author', 'name profile.profilePicture profile.department profile.course')
      .populate('replies.author', 'name profile.profilePicture')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ForumPost.countDocuments(query);

    res.json({
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/forum/:id
// @desc    Get forum post by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name profile.profilePicture profile.department profile.course')
      .populate('replies.author', 'name profile.profilePicture profile.department profile.course')
      .populate('likes.user', 'name')
      .populate('replies.likes.user', 'name');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.isApproved && req.user) {
      const isOwner = post.author._id.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(404).json({ message: 'Post not found' });
      }
    } else if (!post.isApproved) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    res.json({ post });
  } catch (error) {
    console.error('Get forum post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/forum
// @desc    Create new forum post
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('content').trim().isLength({ min: 10, max: 5000 }).withMessage('Content must be between 10 and 5000 characters'),
  body('category').isIn(['general', 'academics', 'tech', 'sports', 'cultural', 'help', 'announcements']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, tags } = req.body;

    const post = new ForumPost({
      title,
      content,
      category,
      author: req.user.id,
      tags: tags || [],
      isApproved: req.user.role === 'admin' // Auto-approve for admins
    });

    await post.save();
    await post.populate('author', 'name profile.profilePicture profile.department profile.course');

    // Create notification for admins if not auto-approved
    if (!post.isApproved) {
      const admins = await User.find({ role: 'admin' });
      await createNotification(
        admins,
        'forum_reply',
        'New Forum Post Pending Approval',
        `${req.user.name} created a new post: ${title}`,
        { entityType: 'ForumPost', entityId: post._id }
      );
    }

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create forum post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/forum/:id
// @desc    Update forum post
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('content').optional().trim().isLength({ min: 10, max: 5000 }).withMessage('Content must be between 10 and 5000 characters'),
  body('category').optional().isIn(['general', 'academics', 'tech', 'sports', 'cultural', 'help', 'announcements']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check permissions
    const isOwner = post.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    // Update fields
    const updateFields = ['title', 'content', 'category', 'tags'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

    await post.save();
    await post.populate('author', 'name profile.profilePicture profile.department profile.course');

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update forum post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/forum/:id/reply
// @desc    Add reply to forum post
// @access  Private
router.post('/:id/reply', [
  auth,
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Reply content must be between 1 and 2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.isApproved) {
      return res.status(400).json({ message: 'Cannot reply to unapproved post' });
    }

    if (post.isLocked) {
      return res.status(400).json({ message: 'Cannot reply to locked post' });
    }

    const { content } = req.body;

    const reply = {
      content,
      author: req.user.id
    };

    post.replies.push(reply);
    await post.save();

    await post.populate('replies.author', 'name profile.profilePicture profile.department profile.course');

    // Notify post author if different user
    if (post.author.toString() !== req.user.id) {
      await createNotification(
        [post.author],
        'forum_reply',
        'New Reply to Your Post',
        `${req.user.name} replied to your post: ${post.title}`,
        { entityType: 'ForumPost', entityId: post._id }
      );
    }

    const newReply = post.replies[post.replies.length - 1];

    res.status(201).json({
      message: 'Reply added successfully',
      reply: newReply
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/forum/:id/like
// @desc    Like/unlike forum post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user.id
    );

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      await post.save();
      res.json({ message: 'Post unliked', liked: false });
    } else {
      // Like
      post.likes.push({ user: req.user.id });
      await post.save();

      // Notify post author if different user
      if (post.author.toString() !== req.user.id) {
        await createNotification(
          [post.author],
          'forum_like',
          'Someone Liked Your Post',
          `${req.user.name} liked your post: ${post.title}`,
          { entityType: 'ForumPost', entityId: post._id }
        );
      }

      res.json({ message: 'Post liked', liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/forum/:id/reply/:replyId/like
// @desc    Like/unlike forum post reply
// @access  Private
router.post('/:id/reply/:replyId/like', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const reply = post.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const likeIndex = reply.likes.findIndex(
      like => like.user.toString() === req.user.id
    );

    if (likeIndex > -1) {
      // Unlike
      reply.likes.splice(likeIndex, 1);
    } else {
      // Like
      reply.likes.push({ user: req.user.id });

      // Notify reply author if different user
      if (reply.author.toString() !== req.user.id) {
        await createNotification(
          [reply.author],
          'forum_like',
          'Someone Liked Your Reply',
          `${req.user.name} liked your reply in: ${post.title}`,
          { entityType: 'ForumPost', entityId: post._id }
        );
      }
    }

    await post.save();

    res.json({ 
      message: likeIndex > -1 ? 'Reply unliked' : 'Reply liked',
      liked: likeIndex === -1
    });
  } catch (error) {
    console.error('Like reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/forum/:id/pin
// @desc    Pin/unpin forum post (admin only)
// @access  Private/Admin
router.put('/:id/pin', adminAuth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({ 
      message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`,
      isPinned: post.isPinned
    });
  } catch (error) {
    console.error('Pin post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/forum/:id/lock
// @desc    Lock/unlock forum post (admin only)
// @access  Private/Admin
router.put('/:id/lock', adminAuth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isLocked = !post.isLocked;
    await post.save();

    res.json({ 
      message: `Post ${post.isLocked ? 'locked' : 'unlocked'} successfully`,
      isLocked: post.isLocked
    });
  } catch (error) {
    console.error('Lock post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/forum/:id/approve
// @desc    Approve forum post (admin only)
// @access  Private/Admin
router.put('/:id/approve', adminAuth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isApproved = true;
    await post.save();

    // Notify author
    await createNotification(
      [post.author],
      'forum_reply',
      'Post Approved',
      `Your post "${post.title}" has been approved`,
      { entityType: 'ForumPost', entityId: post._id }
    );

    res.json({ message: 'Post approved successfully' });
  } catch (error) {
    console.error('Approve post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/forum/:id
// @desc    Delete forum post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check permissions
    const isOwner = post.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await ForumPost.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/forum/:id/reply/:replyId
// @desc    Delete forum post reply
// @access  Private
router.delete('/:id/reply/:replyId', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const reply = post.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check permissions
    const isOwner = reply.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    post.replies.pull(req.params.replyId);
    await post.save();

    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
