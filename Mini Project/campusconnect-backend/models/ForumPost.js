const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [5000, 'Content cannot be more than 5000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Post category is required'],
    enum: ['general', 'academics', 'tech', 'sports', 'cultural', 'help', 'announcements']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Reply cannot be more than 2000 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  viewCount: {
    type: Number,
    default: 0
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    size: Number
  }]
}, {
  timestamps: true
});

// Virtual for like count
forumPostSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for reply count
forumPostSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Index for better performance
forumPostSchema.index({ category: 1, createdAt: -1 });
forumPostSchema.index({ author: 1 });
forumPostSchema.index({ tags: 1 });
forumPostSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('ForumPost', forumPostSchema);
