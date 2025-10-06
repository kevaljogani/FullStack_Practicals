const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const ForumPost = require('../models/ForumPost');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    const adminDepartment = adminUser.profile?.department;

    // Department-based filtering for regular admins
    let departmentFilter = {};
    if (adminDepartment && adminUser.role === 'admin') {
      departmentFilter = { 'profile.department': adminDepartment };
    }

    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student', ...departmentFilter });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeUsers = await User.countDocuments({ isActive: true, ...departmentFilter });
    
    // Events - admins see only their department events
    let eventFilter = {};
    if (adminDepartment) {
      const departmentUsers = await User.find({ 'profile.department': adminDepartment }).select('_id');
      const departmentUserIds = departmentUsers.map(u => u._id);
      eventFilter = { organizer: { $in: departmentUserIds } };
    }

    const totalEvents = await Event.countDocuments(eventFilter);
    const approvedEvents = await Event.countDocuments({ isApproved: true, ...eventFilter });
    const pendingEvents = await Event.countDocuments({ isApproved: false, ...eventFilter });
    const upcomingEvents = await Event.countDocuments({ 
      date: { $gte: new Date() }, 
      isApproved: true,
      ...eventFilter
    });
    
    const totalForumPosts = await ForumPost.countDocuments();
    const totalResources = await Resource.countDocuments();
    const totalNotifications = await Notification.countDocuments();
    
    // Recent activity - filtered by department
    const recentUsers = await User.find(departmentFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt profile');
    
    const recentEvents = await Event.find(eventFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('organizer', 'name email profile')
      .select('title category date isApproved organizer createdAt');
    
    const recentPosts = await ForumPost.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'name profile')
      .select('title category author createdAt');

    // Department statistics
    const departmentStats = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$profile.department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly stats for charts
    const currentDate = new Date();
    const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
    
    const monthlyUserStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          ...departmentFilter
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    const monthlyEventStats = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          ...eventFilter
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalStudents,
        totalAdmins,
        activeUsers,
        totalEvents,
        approvedEvents,
        pendingEvents,
        upcomingEvents,
        totalForumPosts,
        totalResources,
        totalNotifications,
        adminDepartment
      },
      recentActivity: {
        users: recentUsers,
        events: recentEvents,
        posts: recentPosts
      },
      charts: {
        monthlyUsers: monthlyUserStats,
        monthlyEvents: monthlyEventStats
      },
      departmentStats
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/reports
// @desc    Generate admin reports
// @access  Private/Admin
router.get('/reports', adminAuth, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let reportData = {};

    switch (type) {
      case 'users':
        reportData = await User.find(query)
          .select('name email role isActive lastLogin createdAt')
          .sort({ createdAt: -1 });
        break;

      case 'events':
        reportData = await Event.find(query)
          .populate('organizer', 'name email')
          .sort({ createdAt: -1 });
        break;

      case 'forum':
        reportData = await ForumPost.find(query)
          .populate('author', 'name email')
          .sort({ createdAt: -1 });
        break;

      case 'resources':
        reportData = await Resource.find(query)
          .populate('uploadedBy', 'name email')
          .sort({ createdAt: -1 });
        break;

      default:
        // General report with all data
        const users = await User.find(query).select('name email role createdAt');
        const events = await Event.find(query).populate('organizer', 'name');
        const posts = await ForumPost.find(query).populate('author', 'name');
        const resources = await Resource.find(query).populate('uploadedBy', 'name');
        
        reportData = {
          users,
          events,
          posts,
          resources,
          summary: {
            totalUsers: users.length,
            totalEvents: events.length,
            totalPosts: posts.length,
            totalResources: resources.length
          }
        };
    }

    res.json({
      type: type || 'general',
      dateRange: { startDate, endDate },
      data: reportData,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Admin reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private/Admin
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { role, status, search } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('name email role isActive lastLogin createdAt profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/toggle-status
// @desc    Toggle user active status
// @access  Private/Admin
router.put('/users/:id/toggle-status', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/pending-events
// @desc    Get pending events for approval (department-based)
// @access  Private/Admin
router.get('/pending-events', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const adminUser = await User.findById(req.user.id);
    const adminDepartment = adminUser.profile?.department;

    // Department-based filtering - admin can only approve events from their department
    let eventFilter = { isApproved: false };
    
    if (adminDepartment) {
      // Find all users from the same department
      const departmentUsers = await User.find({ 
        'profile.department': adminDepartment 
      }).select('_id');
      const departmentUserIds = departmentUsers.map(u => u._id);
      eventFilter.organizer = { $in: departmentUserIds };
    }

    const events = await Event.find(eventFilter)
      .populate('organizer', 'name email profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(eventFilter);

    res.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      adminDepartment
    });
  } catch (error) {
    console.error('Pending events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/events/:id/approve
// @desc    Approve an event (department-based)
// @access  Private/Admin
router.put('/events/:id/approve', adminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const adminUser = await User.findById(req.user.id);
    const adminDepartment = adminUser.profile?.department;
    const eventOrganizerDepartment = event.organizer.profile?.department;

    // Check if admin can approve this event (same department)
    if (adminDepartment && eventOrganizerDepartment !== adminDepartment) {
      return res.status(403).json({ 
        message: 'You can only approve events from your department' 
      });
    }

    event.isApproved = true;
    event.approvedBy = req.user.id;
    event.approvedAt = new Date();
    await event.save();

    // Notify organizer
    await Notification.create({
      recipient: event.organizer._id,
      type: 'event_approved',
      title: 'Event Approved',
      message: `Your event "${event.title}" has been approved by ${adminUser.name}`,
      relatedEntity: { entityType: 'Event', entityId: event._id }
    });

    res.json({ 
      message: 'Event approved successfully',
      event: {
        ...event.toObject(),
        approvedBy: adminUser.name
      }
    });
  } catch (error) {
    console.error('Approve event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/events/:id/reject
// @desc    Reject an event (department-based)
// @access  Private/Admin
router.put('/events/:id/reject', adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const event = await Event.findById(req.params.id).populate('organizer');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const adminUser = await User.findById(req.user.id);
    const adminDepartment = adminUser.profile?.department;
    const eventOrganizerDepartment = event.organizer.profile?.department;

    // Check if admin can reject this event (same department)
    if (adminDepartment && eventOrganizerDepartment !== adminDepartment) {
      return res.status(403).json({ 
        message: 'You can only reject events from your department' 
      });
    }

    // Notify organizer before deletion
    await Notification.create({
      recipient: event.organizer._id,
      type: 'event_rejected',
      title: 'Event Rejected',
      message: `Your event "${event.title}" has been rejected by ${adminUser.name}. ${reason ? `Reason: ${reason}` : ''}`,
      relatedEntity: { entityType: 'Event', entityId: event._id }
    });

    // Delete the rejected event
    await Event.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Event rejected and removed successfully',
      reason 
    });
  } catch (error) {
    console.error('Reject event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (admin only)
// @access  Private/Admin
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting other admins
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(req.params.id);
    
    // Clean up user's data
    await Event.deleteMany({ organizer: req.params.id });
    await ForumPost.deleteMany({ author: req.params.id });
    await Resource.deleteMany({ uploadedBy: req.params.id });
    await Notification.deleteMany({ recipient: req.params.id });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/posts
// @desc    Get all forum posts with pagination
// @access  Private/Admin
router.get('/posts', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await ForumPost.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ForumPost.countDocuments();

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/resources
// @desc    Get all resources with pagination
// @access  Private/Admin
router.get('/resources', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const resources = await Resource.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Resource.countDocuments();

    res.json({
      resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/content-moderation
// @desc    Get content for moderation (posts, resources, etc.)
// @access  Private/Admin
router.get('/content-moderation', adminAuth, async (req, res) => {
  try {
    const { type } = req.query;
    
    let content = {};
    
    if (!type || type === 'posts') {
      const flaggedPosts = await ForumPost.find({ 
        $or: [
          { reportCount: { $gt: 0 } },
          { isHidden: true }
        ]
      })
      .populate('author', 'name email profile')
      .sort({ reportCount: -1, createdAt: -1 })
      .limit(20);
      
      content.posts = flaggedPosts;
    }
    
    if (!type || type === 'resources') {
      const flaggedResources = await Resource.find({ 
        $or: [
          { reportCount: { $gt: 0 } },
          { isActive: false }
        ]
      })
      .populate('uploadedBy', 'name email profile')
      .sort({ reportCount: -1, createdAt: -1 })
      .limit(20);
      
      content.resources = flaggedResources;
    }
    
    if (!type || type === 'users') {
      const flaggedUsers = await User.find({ 
        $or: [
          { reportCount: { $gt: 0 } },
          { isActive: false }
        ]
      })
      .select('name email profile reportCount isActive createdAt')
      .sort({ reportCount: -1, createdAt: -1 })
      .limit(20);
      
      content.users = flaggedUsers;
    }

    res.json({
      content,
      totalReports: {
        posts: await ForumPost.countDocuments({ reportCount: { $gt: 0 } }),
        resources: await Resource.countDocuments({ reportCount: { $gt: 0 } }),
        users: await User.countDocuments({ reportCount: { $gt: 0 } })
      }
    });
  } catch (error) {
    console.error('Content moderation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/moderate/:type/:id
// @desc    Moderate content (hide/unhide, activate/deactivate)
// @access  Private/Admin
router.put('/moderate/:type/:id', adminAuth, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { action, reason } = req.body;
    
    let Model, result;
    
    switch (type) {
      case 'post':
        Model = ForumPost;
        break;
      case 'resource':
        Model = Resource;
        break;
      case 'user':
        Model = User;
        break;
      default:
        return res.status(400).json({ message: 'Invalid content type' });
    }

    const item = await Model.findById(id);
    if (!item) {
      return res.status(404).json({ message: `${type} not found` });
    }

    switch (action) {
      case 'hide':
        if (type === 'post') {
          item.isHidden = true;
        } else if (type === 'resource') {
          item.isActive = false;
        } else if (type === 'user') {
          item.isActive = false;
        }
        break;
      case 'unhide':
        if (type === 'post') {
          item.isHidden = false;
        } else if (type === 'resource') {
          item.isActive = true;
        } else if (type === 'user') {
          item.isActive = true;
        }
        break;
      case 'clear-reports':
        item.reportCount = 0;
        break;
    }

    await item.save();

    // Log moderation action
    const adminUser = await User.findById(req.user.id);
    console.log(`Moderation: ${adminUser.name} ${action} ${type} ${id} - Reason: ${reason || 'No reason provided'}`);

    res.json({
      message: `${type} ${action} successfully`,
      item
    });
  } catch (error) {
    console.error('Moderation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/settings
// @desc    Get admin settings and system configuration
// @access  Private/Admin
router.get('/settings', adminAuth, async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    
    // System settings (these could be stored in a separate Settings model)
    const settings = {
      contentModeration: {
        autoHideThreshold: 5, // Auto-hide content after 5 reports
        requireApproval: true,
        notifyModerators: true
      },
      eventApproval: {
        requireApproval: true,
        departmentBased: true,
        autoApproveAdmins: true
      },
      userManagement: {
        allowSelfRegistration: true,
        requireEmailVerification: false,
        defaultRole: 'student'
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        digestFrequency: 'daily'
      }
    };

    // Department statistics for settings context
    const departmentStats = await User.aggregate([
      { $group: { _id: '$profile.department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      settings,
      adminInfo: {
        name: adminUser.name,
        email: adminUser.email,
        department: adminUser.profile?.department,
        permissions: ['content_moderation', 'user_management', 'event_approval']
      },
      systemInfo: {
        totalUsers: await User.countDocuments(),
        totalEvents: await Event.countDocuments(),
        totalPosts: await ForumPost.countDocuments(),
        departmentStats
      }
    });
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
