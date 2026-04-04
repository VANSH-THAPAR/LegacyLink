const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const EventRequest = require('../models/EventRequest');
const { User, University } = require('../models/UnifiedUser');
const Alumni = require('../models/Alumni');
const Student = require('../models/Student');
const UniversityModel = require('../models/University');

// Helper function to get user from correct collection based on role
const getUserFromRole = async (userId, role) => {
    try {
        if (role === 'alumni') {
            return await Alumni.findOne({ authId: userId });
        } else if (role === 'student') {
            return await Student.findOne({ authId: userId });
        } else if (role === 'university') {
            return await UniversityModel.findOne({ authId: userId });
        }
        // Fallback to User model
        return await User.findById(userId);
    } catch (error) {
        console.error('Error finding user by role:', error);
        return null;
    }
};

// [GET] /api/events - Get all approved events (Scoped to College)
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log('🔍 GET /api/events - req.user:', req.user);
        
        const userId = req.user.id;
        const userRole = req.user.role;
        
        if (!userId) {
            console.log('❌ No user ID found in req.user:', req.user);
            return res.status(401).json({ msg: 'Invalid user token' });
        }
        
        console.log('🔍 User ID:', userId, 'Role:', userRole);
        
        const currentUser = await getUserFromRole(userId, userRole);
        if (!currentUser) {
            console.log('❌ User not found in database:', userId, 'Role:', userRole);
            return res.status(404).json({ msg: 'User not found' });
        }

        console.log('✅ User found:', currentUser.email, 'Role:', userRole);

        const { type, format, search, status = 'Approved', page = 1, limit = 10 } = req.query;
        
        // Scope to college
        let query = { 
            collegeName: currentUser.collegeName,
            status: status
        };
        
        console.log('🔍 Query:', query);

        if (type && type !== 'All') {
            query.type = type;
        }
        
        if (format && format !== 'All') {
            query.format = format;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const skip = (page - 1) * limit;
        
        console.log('🔍 Fetching events...');
        const events = await Event.find(query)
            .populate('organizer', 'name profilePicture')
            .populate('university', 'universityName')
            .sort({ date: 1, isFeatured: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Event.countDocuments(query);
        
        console.log('✅ Found', events.length, 'events');
        
        res.json({
            events,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('❌ Error in GET /api/events:', err);
        res.status(500).send('Server Error');
    }
});

// [GET] /api/events/requests - Get event requests (University Admin Only)
router.get('/requests', authMiddleware, async (req, res) => {
    try {
        console.log('🔍 GET /api/events/requests - req.user:', req.user);
        
        const userId = req.user.id;
        const userRole = req.user.role;
        
        const user = await getUserFromRole(userId, userRole);
        if (!user) {
            console.log('❌ User not found:', userId, 'Role:', userRole);
            return res.status(404).json({ msg: 'User not found' });
        }
        
        console.log('✅ User found:', user.email, 'Role:', userRole);
        
        if (userRole !== 'university' && userRole !== 'admin') {
            console.log('❌ User not university admin:', userRole);
            return res.status(403).json({ msg: 'Only University Admin can view event requests' });
        }

        const { status, priority, page = 1, limit = 10 } = req.query;
        
        let query = {};
        if (status && status !== 'All') {
            query.status = status;
        }
        if (priority && priority !== 'All') {
            query.priority = priority;
        }

        const skip = (page - 1) * limit;
        
        console.log('🔍 Query for event requests:', query);
        
        const requests = await EventRequest.find(query)
            .populate('requester', 'name profilePicture email')
            .populate('university', 'universityName')
            .populate('reviewedBy', 'name')
            .populate('approvedBy', 'name')
            .sort({ priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await EventRequest.countDocuments(query);
        
        console.log('✅ Found', requests.length, 'event requests');
        
        res.json({
            requests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('❌ Error in GET /api/events/requests:', err);
        res.status(500).send('Server Error');
    }
});

// [POST] /api/events/requests - Create event request (Alumni Only)
router.post('/requests', authMiddleware, async (req, res) => {
    try {
        console.log('🔍 POST /api/events/requests - req.user:', req.user);
        console.log('🔍 Request body:', req.body);
        
        const userId = req.user.id;
        const userRole = req.user.role;
        
        if (!userId) {
            console.log('❌ No user ID found in req.user:', req.user);
            return res.status(401).json({ msg: 'Invalid user token' });
        }
        
        console.log('🔍 User ID:', userId, 'Role:', userRole);
        
        const user = await getUserFromRole(userId, userRole);
        if (!user) {
            console.log('❌ User not found in database:', userId, 'Role:', userRole);
            return res.status(404).json({ msg: 'User not found' });
        }
        
        console.log('✅ User found:', user.email, 'Role:', userRole);
        
        if (userRole !== 'alumni') {
            console.log('❌ User not alumni:', userRole);
            return res.status(403).json({ msg: 'Only Alumni can create event requests' });
        }

        const {
            title, description, type, format, date, time, duration,
            location, venue, onlineMeetingLink, maxAttendees, tags,
            prerequisites, learningOutcomes, materials, imageUrl,
            priority = 'Medium', googleMeetRequested = false
        } = req.body;

        // Validate required fields based on format
        if (format === 'Offline' || format === 'Hybrid') {
            if (!location || !venue) {
                return res.status(400).json({ msg: 'Location and venue are required for offline/hybrid events' });
            }
        }
        
        if (format === 'Online' || format === 'Hybrid') {
            // Allow either online meeting link OR Google Meet assistance request
            if (!onlineMeetingLink && !googleMeetRequested) {
                return res.status(400).json({ msg: 'Either provide an online meeting link or request Google Meet assistance' });
            }
        }

        const eventRequest = new EventRequest({
            // Event Details
            title, description, type, format, date, time, duration,
            location, venue, onlineMeetingLink, maxAttendees, tags,
            prerequisites, learningOutcomes, materials, imageUrl,
            
            // Request Details
            requester: userId,
            university: user._id,
            collegeName: user.collegeName,
            priority,
            googleMeetRequested,
            
            // Initial history entry
            history: [{
                action: 'Submitted',
                performedBy: userId,
                comments: 'Event request submitted for approval'
            }]
        });

        const savedRequest = await eventRequest.save();
        
        // Populate for response
        const populatedRequest = await EventRequest.findById(savedRequest._id)
            .populate('requester', 'name profilePicture email')
            .populate('university', 'universityName');

        console.log('✅ Event request created:', populatedRequest.title);
        
        res.status(201).json(populatedRequest);
    } catch (err) {
        console.error('❌ Error in POST /api/events/requests:', err);
        res.status(500).send('Server Error');
    }
});

// [GET] /api/events/:id - Get single event details
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name profilePicture email')
            .populate('university', 'universityName')
            .populate('attendees.user', 'name profilePicture email');

        if (!event) return res.status(404).json({ msg: 'Event not found' });

        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
