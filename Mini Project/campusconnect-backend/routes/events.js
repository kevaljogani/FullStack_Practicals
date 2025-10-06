const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
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

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { category, status, search, upcoming, showPending } = req.query;
    
    // Base query - for regular users, only show approved events
    // For admins, show all events if showPending is true
    let query = {};
    
    if (req.user?.role === 'admin' && showPending === 'true') {
      // Admin viewing pending events
      query.isApproved = false;
    } else {
      // Regular users or admin viewing approved events
      query.isApproved = true;
    }
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = 'upcoming';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name profile.department profile.course')
      .populate('participants.user', 'name profile.profilePicture')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email profile')
      .populate('participants.user', 'name profile.profilePicture profile.department profile.course');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is organizer or admin to show non-approved events
    if (!event.isApproved && req.user) {
      const isOwner = event.organizer._id.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(404).json({ message: 'Event not found' });
      }
    } else if (!event.isApproved) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['academic', 'sports', 'cultural', 'technical', 'social', 'workshop', 'seminar', 'other']).withMessage('Invalid category'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('maxParticipants').isInt({ min: 1 }).withMessage('Max participants must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, date, time, location, maxParticipants, tags } = req.body;

    // Check if date is in the future
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      return res.status(400).json({ message: 'Event date must be in the future' });
    }

    const event = new Event({
      title,
      description,
      category,
      date: eventDate,
      time,
      location,
      maxParticipants,
      organizer: req.user.id,
      tags: tags || [],
      isApproved: req.user.role === 'admin' // Auto-approve for admins
    });

    await event.save();
    await event.populate('organizer', 'name profile.department profile.course');

    // Create notification for admins if not auto-approved
    if (!event.isApproved) {
      const admins = await User.find({ role: 'admin' });
      await createNotification(
        admins,
        'event_created',
        'New Event Pending Approval',
        `${req.user.name} created a new event: ${title}`,
        { entityType: 'Event', entityId: event._id }
      );
    }

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').optional().isIn(['academic', 'sports', 'cultural', 'technical', 'social', 'workshop', 'seminar', 'other']).withMessage('Invalid category'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('time').optional().notEmpty().withMessage('Time is required'),
  body('location').optional().trim().notEmpty().withMessage('Location is required'),
  body('maxParticipants').optional().isInt({ min: 1 }).withMessage('Max participants must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check permissions
    const isOwner = event.organizer.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    // Update fields
    const updateFields = ['title', 'description', 'category', 'date', 'time', 'location', 'maxParticipants', 'tags'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    // Check if new date is in the future
    if (req.body.date) {
      const eventDate = new Date(req.body.date);
      if (eventDate <= new Date()) {
        return res.status(400).json({ message: 'Event date must be in the future' });
      }
    }

    await event.save();
    await event.populate('organizer', 'name profile.department profile.course');

    // Notify participants about update
    if (event.participants.length > 0) {
      const participants = await User.find({ 
        _id: { $in: event.participants.map(p => p.user) }
      });
      
      await createNotification(
        participants,
        'event_updated',
        'Event Updated',
        `Event "${event.title}" has been updated`,
        { entityType: 'Event', entityId: event._id }
      );
    }

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/join
// @desc    Join an event
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isApproved) {
      return res.status(400).json({ message: 'Cannot join unapproved event' });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'Cannot join this event' });
    }

    // Check if already joined
    const alreadyJoined = event.participants.some(
      participant => participant.user.toString() === req.user.id
    );

    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined this event' });
    }

    // Check if event is full
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Add participant
    event.participants.push({ user: req.user.id });
    await event.save();

    // Add to user's joined events
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { joinedEvents: event._id }
    });

    res.json({ message: 'Successfully joined the event' });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/leave
// @desc    Leave an event
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is participant
    const participantIndex = event.participants.findIndex(
      participant => participant.user.toString() === req.user.id
    );

    if (participantIndex === -1) {
      return res.status(400).json({ message: 'You are not a participant of this event' });
    }

    // Remove participant
    event.participants.splice(participantIndex, 1);
    await event.save();

    // Remove from user's joined events
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { joinedEvents: event._id }
    });

    res.json({ message: 'Successfully left the event' });
  } catch (error) {
    console.error('Leave event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id/approve
// @desc    Approve an event (admin only)
// @access  Private/Admin
router.put('/:id/approve', adminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.isApproved = true;
    await event.save();

    // Notify organizer
    await createNotification(
      [event.organizer],
      'event_created',
      'Event Approved',
      `Your event "${event.title}" has been approved`,
      { entityType: 'Event', entityId: event._id }
    );

    res.json({ message: 'Event approved successfully' });
  } catch (error) {
    console.error('Approve event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check permissions
    const isOwner = event.organizer.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Notify participants if event has participants
    if (event.participants.length > 0) {
      const participants = await User.find({ 
        _id: { $in: event.participants.map(p => p.user) }
      });
      
      await createNotification(
        participants,
        'event_cancelled',
        'Event Cancelled',
        `Event "${event.title}" has been cancelled`,
        { entityType: 'Event', entityId: event._id }
      );

      // Remove from users' joined events
      await User.updateMany(
        { _id: { $in: event.participants.map(p => p.user) } },
        { $pull: { joinedEvents: event._id } }
      );
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/image
// @desc    Upload event image
// @access  Private
router.post('/:id/image', 
  auth, 
  upload.single('eventImage'), 
  handleMulterError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Check permissions
      const isOwner = event.organizer.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized to update this event' });
      }

      event.imageUrl = `/uploads/events/${req.file.filename}`;
      await event.save();

      res.json({ 
        message: 'Event image updated successfully',
        imageUrl: event.imageUrl
      });
    } catch (error) {
      console.error('Upload event image error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/events/my/events
// @desc    Get current user's events (created and joined)
// @access  Private
router.get('/my/events', auth, async (req, res) => {
  try {
    const { type = 'all' } = req.query; // 'created', 'joined', 'all'
    
    let query = {};
    
    if (type === 'created') {
      query.organizer = req.user.id;
    } else if (type === 'joined') {
      query = {
        'participants.user': req.user.id,
        organizer: { $ne: req.user.id }
      };
    } else {
      // All events - created or joined
      query = {
        $or: [
          { organizer: req.user.id },
          { 'participants.user': req.user.id }
        ]
      };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email profile')
      .populate('participants.user', 'name profile.profilePicture')
      .sort({ date: 1 });

    const eventsWithStatus = events.map(event => ({
      ...event.toObject(),
      isOrganizer: event.organizer._id.toString() === req.user.id,
      isParticipant: event.participants.some(p => p.user._id.toString() === req.user.id)
    }));

    res.json({ events: eventsWithStatus });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id/approve
// @desc    Approve event (Admin only)
// @access  Private (Admin)
router.put('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.isApproved) {
      return res.status(400).json({ message: 'Event is already approved' });
    }

    event.isApproved = true;
    await event.save();

    // Notify organizer
    await createNotification(
      [event.organizer._id],
      'event_approved',
      'Event Approved',
      `Your event "${event.title}" has been approved and is now live!`,
      { entityType: 'Event', entityId: event._id }
    );

    res.json({ 
      message: 'Event approved successfully',
      event 
    });
  } catch (error) {
    console.error('Approve event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id/reject
// @desc    Reject event (Admin only)
// @access  Private (Admin)
router.put('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { reason } = req.body;
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.isApproved) {
      return res.status(400).json({ message: 'Cannot reject an approved event' });
    }

    // Delete the event instead of keeping rejected events
    await Event.findByIdAndDelete(req.params.id);

    // Notify organizer
    await createNotification(
      [event.organizer._id],
      'event_rejected',
      'Event Rejected',
      `Your event "${event.title}" has been rejected. ${reason ? `Reason: ${reason}` : ''}`,
      { entityType: 'Event', entityId: null }
    );

    res.json({ 
      message: 'Event rejected and removed successfully'
    });
  } catch (error) {
    console.error('Reject event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/admin/pending
// @desc    Get pending events for admin approval
// @access  Private (Admin)
router.get('/admin/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const events = await Event.find({ isApproved: false })
      .populate('organizer', 'name email profile')
      .sort({ createdAt: -1 });

    res.json({ events });
  } catch (error) {
    console.error('Get pending events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
