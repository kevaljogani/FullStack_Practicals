const express = require('express');
const { body, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
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

// @route   GET /api/resources
// @desc    Get all resources
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { category, subject, department, semester, year, search, type } = req.query;
    
    let query = { isApproved: true, isPublic: true };
    
    if (category) query.category = category;
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (department) query.department = { $regex: department, $options: 'i' };
    if (semester) query.semester = parseInt(semester);
    if (year) query.year = parseInt(year);
    if (type) query.fileType = { $regex: type, $options: 'i' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const resources = await Resource.find(query)
      .populate('uploader', 'name profile.department profile.course')
      .populate('approvedBy', 'name')
      .select('-downloads -ratings')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Resource.countDocuments(query);

    res.json({
      resources,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resources/:id
// @desc    Get resource by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploader', 'name profile.department profile.course')
      .populate('approvedBy', 'name')
      .populate('ratings.user', 'name profile.profilePicture')
      .populate('downloads.user', 'name');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user can access this resource
    if (!resource.isApproved || !resource.isPublic) {
      if (!req.user) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      const isOwner = resource.uploader._id.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(404).json({ message: 'Resource not found' });
      }
    }

    // Increment view count
    resource.viewCount += 1;
    await resource.save();

    res.json({ resource });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/resources
// @desc    Upload new resource
// @access  Private
router.post('/', [
  auth,
  upload.single('resource'),
  handleMulterError,
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['notes', 'assignments', 'past-papers', 'books', 'presentations', 'videos', 'other']).withMessage('Invalid category'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('semester').optional().isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('year').optional().isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const { title, description, category, subject, department, semester, year, tags } = req.body;

    const resource = new Resource({
      title,
      description,
      category,
      subject,
      department,
      semester: semester ? parseInt(semester) : undefined,
      year: year ? parseInt(year) : undefined,
      uploader: req.user.id,
      fileUrl: `/uploads/resources/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      tags: tags ? JSON.parse(tags) : [],
      isApproved: req.user.role === 'admin' // Auto-approve for admins
    });

    await resource.save();
    await resource.populate('uploader', 'name profile.department profile.course');

    // Create notification for admins if not auto-approved
    if (!resource.isApproved) {
      const admins = await User.find({ role: 'admin' });
      await createNotification(
        admins,
        'resource_uploaded',
        'New Resource Pending Approval',
        `${req.user.name} uploaded a new resource: ${title}`,
        { entityType: 'Resource', entityId: resource._id }
      );
    }

    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource
    });
  } catch (error) {
    console.error('Upload resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/resources/:id
// @desc    Update resource details
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').optional().isIn(['notes', 'assignments', 'past-papers', 'books', 'presentations', 'videos', 'other']).withMessage('Invalid category'),
  body('subject').optional().trim().notEmpty().withMessage('Subject cannot be empty'),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  body('semester').optional().isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('year').optional().isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check permissions
    const isOwner = resource.uploader.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this resource' });
    }

    // Update fields
    const updateFields = ['title', 'description', 'category', 'subject', 'department', 'semester', 'year', 'tags'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        resource[field] = req.body[field];
      }
    });

    await resource.save();
    await resource.populate('uploader', 'name profile.department profile.course');

    res.json({
      message: 'Resource updated successfully',
      resource
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/resources/:id/download
// @desc    Download resource
// @access  Private
router.post('/:id/download', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!resource.isApproved || !resource.isPublic) {
      return res.status(403).json({ message: 'Resource not available for download' });
    }

    // Check if already downloaded by this user
    const alreadyDownloaded = resource.downloads.some(
      download => download.user.toString() === req.user.id
    );

    if (!alreadyDownloaded) {
      resource.downloads.push({ user: req.user.id });
      await resource.save();
    }

    res.json({ 
      message: 'Download recorded successfully',
      fileUrl: resource.fileUrl,
      fileName: resource.fileName
    });
  } catch (error) {
    console.error('Download resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/resources/:id/bookmark
// @desc    Bookmark/unbookmark resource
// @access  Private
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const user = await User.findById(req.user.id);
    const bookmarkIndex = user.bookmarkedResources.findIndex(
      bookmark => bookmark.toString() === resource._id.toString()
    );

    if (bookmarkIndex > -1) {
      // Remove bookmark
      user.bookmarkedResources.splice(bookmarkIndex, 1);
      await user.save();
      res.json({ message: 'Resource removed from bookmarks', bookmarked: false });
    } else {
      // Add bookmark
      user.bookmarkedResources.push(resource._id);
      await user.save();
      res.json({ message: 'Resource bookmarked', bookmarked: true });
    }
  } catch (error) {
    console.error('Bookmark resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/resources/:id/rate
// @desc    Rate resource
// @access  Private
router.post('/:id/rate', [
  auth,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (!resource.isApproved || !resource.isPublic) {
      return res.status(400).json({ message: 'Cannot rate this resource' });
    }

    // Check if user already rated
    const existingRatingIndex = resource.ratings.findIndex(
      r => r.user.toString() === req.user.id
    );

    if (existingRatingIndex > -1) {
      // Update existing rating
      resource.ratings[existingRatingIndex].rating = rating;
      resource.ratings[existingRatingIndex].comment = comment || '';
    } else {
      // Add new rating
      resource.ratings.push({
        user: req.user.id,
        rating,
        comment: comment || ''
      });
    }

    await resource.save();

    res.json({ 
      message: existingRatingIndex > -1 ? 'Rating updated successfully' : 'Rating added successfully'
    });
  } catch (error) {
    console.error('Rate resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/resources/:id/approve
// @desc    Approve resource (admin only)
// @access  Private/Admin
router.put('/:id/approve', adminAuth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.isApproved = true;
    resource.approvedBy = req.user.id;
    resource.approvedAt = new Date();
    await resource.save();

    // Notify uploader
    await createNotification(
      [resource.uploader],
      'resource_approved',
      'Resource Approved',
      `Your resource "${resource.title}" has been approved`,
      { entityType: 'Resource', entityId: resource._id }
    );

    res.json({ message: 'Resource approved successfully' });
  } catch (error) {
    console.error('Approve resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resources/pending/admin
// @desc    Get pending resources (admin only)
// @access  Private/Admin
router.get('/pending/admin', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const resources = await Resource.find({ isApproved: false })
      .populate('uploader', 'name profile.department profile.course')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Resource.countDocuments({ isApproved: false });

    res.json({
      resources,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get pending resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resources/my/uploads
// @desc    Get user's uploaded resources
// @access  Private
router.get('/my/uploads', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const resources = await Resource.find({ uploader: req.user.id })
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Resource.countDocuments({ uploader: req.user.id });

    res.json({
      resources,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get user resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/resources/:id
// @desc    Delete resource
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check permissions
    const isOwner = resource.uploader.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    // Remove from users' bookmarks
    await User.updateMany(
      { bookmarkedResources: resource._id },
      { $pull: { bookmarkedResources: resource._id } }
    );

    await Resource.findByIdAndDelete(req.params.id);

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
