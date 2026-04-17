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
        // For a single college website, just use the User model
        const user = await User.findById(userId);
        console.log('📋 User found in User model:', user ? user.email : 'Not found');
        return user;
    } catch (error) {
        console.error('Error finding user:', error);
        return null;
    }
};

// [GET] /api/events - Get all approved events
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log('🔍 GET /api/events - req.user:', req.user);
        
        const { type, format, search, status = 'Approved', page = 1, limit = 10 } = req.query;
        
        // Simple query - just get approved events
        let query = { 
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
        
        // Simple check - just verify user role
        if (req.user.role !== 'university' && req.user.role !== 'admin') {
            console.log('❌ User not university admin:', req.user.role);
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
        
        // Simple role check
        if (req.user.role !== 'alumni') {
            console.log('❌ User not alumni:', req.user.role);
            return res.status(403).json({ msg: 'Only Alumni can create event requests' });
        }

        const {
            title, description, type, format, date, time, duration,
            location, venue, onlineMeetingLink, maxAttendees, tags,
            prerequisites, learningOutcomes, materials, imageUrl,
            priority = 'Medium', googleMeetRequested = false
        } = req.body;

        // Generate random gradient image if no imageUrl provided
        let finalImageUrl = imageUrl;
        if (!finalImageUrl || finalImageUrl.trim() === '') {
            const gradientImages = [
                'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Purple gradient
                'https://images.unsplash.com/photo-1557682260-96773eb01377?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Blue gradient
                'https://images.unsplash.com/photo-1642177293068-0f74e047df04?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Pink gradient
                'https://images.unsplash.com/photo-1557683316-0b75e1e5a12?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Green gradient
                'https://www.istockphoto.com/vector/abstract-colorful-gradient-background-gm1459963808-494245015?utm_source=unsplash&utm_medium=affiliate&utm_campaign=adp_photos_sponsored&utm_content=https%3A%2F%2Funsplash.com%2Fs%2Fphotos%2Fpurple%3Fasset%3D%255B%2522Photos%2522%252C%257B%2522slug%2522%253A%2522blue-to-purple-gradient-eICUFSeirc0%2522%257D%255D&utm_term=blue%3A%3A%3A%3A40f7d4b6-73ff-4481-9926-791265b25fdd' // Orange gradient
            ];
            const randomImage = gradientImages[Math.floor(Math.random() * gradientImages.length)];
            finalImageUrl = randomImage;
        }

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
            prerequisites, learningOutcomes, materials, 
            imageUrl: finalImageUrl, // Use the generated or provided image
            
            // Request Details
            requester: req.user.id,
            university: req.user.id, // Use user ID as university for now
            collegeName: 'Chitkara', // Hardcode since it's single college
            priority,
            googleMeetRequested,
            
            // Initial history entry
            history: [{
                action: 'Submitted',
                performedBy: req.user.id,
                comments: 'Event request submitted for approval'
            }]
        });

        const savedRequest = await eventRequest.save();
        
        // Populate for response
        const populatedRequest = await EventRequest.findById(savedRequest._id)
            .populate('requester', 'name profilePicture email')
            .populate('university', 'universityName');

        console.log('✅ Event request created:', savedRequest.title);

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

// [PUT] /api/events/requests/:id/approve - Approve event request (University Admin Only)
router.put('/requests/:id/approve', authMiddleware, async (req, res) => {
    try {
        console.log('🔍 PUT /api/events/requests/:id/approve - req.user:', req.user);
        
        // Simple role check
        if (req.user.role !== 'university' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Only University Admin can approve event requests' });
        }

        const { approvalComments, createGoogleMeet = false } = req.body;
        
        const eventRequest = await EventRequest.findById(req.params.id);
        if (!eventRequest) return res.status(404).json({ msg: 'Event request not found' });

        if (eventRequest.status !== 'Pending' && eventRequest.status !== 'Under Review') {
            return res.status(400).json({ msg: 'Event request cannot be approved in current status' });
        }

        // Generate random gradient image if no imageUrl provided
        let finalImageUrl = eventRequest.imageUrl;
        if (!finalImageUrl || finalImageUrl.trim() === '') {
            const gradientImages = [
                'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Purple gradient
                'https://images.unsplash.com/photo-1557682260-96773eb01377?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Blue gradient
                'https://images.unsplash.com/photo-1642177293068-0f74e047df04?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Pink gradient
                'https://images.unsplash.com/photo-1557683316-0b75e1e5a12?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Green gradient
                'https://www.istockphoto.com/vector/abstract-colorful-gradient-background-gm1459963808-494245015?utm_source=unsplash&utm_medium=affiliate&utm_campaign=adp_photos_sponsored&utm_content=https%3A%2F%2Funsplash.com%2Fs%2Fphotos%2Fpurple%3Fasset%3D%255B%2522Photos%2522%252C%257B%2522slug%2522%253A%2522blue-to-purple-gradient-eICUFSeirc0%2522%257D%255D&utm_term=blue%3A%3A%3A%3A40f7d4b6-73ff-4481-9926-791265b25fdd' // Orange gradient
            ];
            const randomImage = gradientImages[Math.floor(Math.random() * gradientImages.length)];
            finalImageUrl = randomImage;
        }

        // Create the actual event
        const event = new Event({
            title: eventRequest.title,
            description: eventRequest.description,
            type: eventRequest.type,
            format: eventRequest.format,
            date: eventRequest.date,
            time: eventRequest.time,
            duration: eventRequest.duration,
            location: eventRequest.location,
            venue: eventRequest.venue,
            onlineMeetingLink: eventRequest.onlineMeetingLink,
            maxAttendees: eventRequest.maxAttendees,
            tags: eventRequest.tags,
            prerequisites: eventRequest.prerequisites,
            learningOutcomes: eventRequest.learningOutcomes,
            materials: eventRequest.materials,
            imageUrl: finalImageUrl, // Use the generated or provided image
            
            // Request Details
            organizer: eventRequest.requester,
            university: eventRequest.university,
            collegeName: eventRequest.collegeName,
            status: 'Approved',
            approvedBy: req.user.id,
            approvedAt: new Date()
        });

        await event.save();

        // Update the request
        eventRequest.status = 'Approved';
        eventRequest.approvedBy = req.user.id;
        eventRequest.approvedAt = new Date();
        eventRequest.approvalComments = approvalComments;
        eventRequest.relatedEvent = event._id;
        eventRequest.history.push({
            action: 'Approved',
            performedBy: req.user.id,
            comments: approvalComments || 'Event request approved'
        });

        await eventRequest.save();

        console.log('✅ Event request approved:', eventRequest.title);

        res.json({
            message: 'Event request approved successfully',
            event,
            request: eventRequest
        });
    } catch (err) {
        console.error('❌ Error in PUT /api/events/requests/:id/approve:', err);
        res.status(500).send('Server Error');
    }
});

// [PUT] /api/events/requests/:id/reject - Reject event request (University Admin Only)
router.put('/requests/:id/reject', authMiddleware, async (req, res) => {
    try {
        console.log('🔍 PUT /api/events/requests/:id/reject - req.user:', req.user);
        
        const userId = req.user.id;
        const userRole = req.user.role;
        
        const user = await getUserFromRole(userId, userRole);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        if (userRole !== 'university' && userRole !== 'admin') {
            return res.status(403).json({ msg: 'Only University Admin can reject event requests' });
        }

        const { rejectionReason, resubmissionRequired = false, resubmissionDeadline } = req.body;
        
        const eventRequest = await EventRequest.findById(req.params.id);
        if (!eventRequest) return res.status(404).json({ msg: 'Event request not found' });

        if (eventRequest.status !== 'Pending' && eventRequest.status !== 'Under Review') {
            return res.status(400).json({ msg: 'Event request cannot be rejected in current status' });
        }

        eventRequest.status = resubmissionRequired ? 'Resubmission Required' : 'Rejected';
        eventRequest.reviewedBy = userId;
        eventRequest.reviewedAt = new Date();
        eventRequest.rejectionReason = rejectionReason;
        eventRequest.resubmissionDeadline = resubmissionDeadline;
        
        eventRequest.history.push({
            action: resubmissionRequired ? 'Resubmission Required' : 'Rejected',
            performedBy: userId,
            comments: rejectionReason
        });

        await eventRequest.save();

        console.log('✅ Event request rejected:', eventRequest.title);

        res.json({
            message: `Event request ${resubmissionRequired ? 'sent back for resubmission' : 'rejected'} successfully`,
            request: eventRequest
        });
    } catch (err) {
        console.error('❌ Error in PUT /api/events/requests/:id/reject:', err);
        res.status(500).send('Server Error');
    }
});

// Debug route to check database contents
router.get('/debug', authMiddleware, async (req, res) => {
    try {
        console.log('🔍 Debug route called');
        
        // Check all collections
        const eventRequests = await EventRequest.find({});
        const events = await Event.find({});
        const universities = await UniversityModel.find({});
        const alumni = await Alumni.find({});
        const students = await Student.find({});
        
        res.json({
            eventRequests: {
                count: eventRequests.length,
                items: eventRequests.map(er => ({ title: er.title, status: er.status, collegeName: er.collegeName }))
            },
            events: {
                count: events.length,
                items: events.map(e => ({ title: e.title, status: e.status, collegeName: e.collegeName }))
            },
            universities: {
                count: universities.length,
                items: universities.map(u => ({ universityName: u.universityName, authId: u.authId }))
            },
            alumni: {
                count: alumni.length,
                items: alumni.map(a => ({ name: a.name, authId: a.authId, collegeName: a.collegeName }))
            },
            students: {
                count: students.length,
                items: students.map(s => ({ name: s.name, authId: s.authId, collegeName: s.collegeName }))
            }
        });
    } catch (err) {
        console.error('Debug error:', err);
        res.status(500).send('Debug error');
    }
});

// [POST] /api/events/:id/register - Register for an event (Student Only)
router.post('/:id/register', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ msg: 'Only students can register for events' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        const isRegistered = event.attendees.some(a => a.user.toString() === req.user.id);
        if (isRegistered) {
            return res.status(400).json({ msg: 'You are already registered for this event' });
        }

        if (event.currentAttendees >= event.maxAttendees) {
            return res.status(400).json({ msg: 'Event is full' });
        }

        event.attendees.push({
            user: req.user.id,
            registeredAt: new Date(),
            attended: true // marking as attended for now so they can give feedback and score
        });
        event.currentAttendees += 1;
        await event.save();
        
        // Give alumni +100 score for a successful meeting (registration/attendance in this case)
        const organizer = await Alumni.findById(event.organizer);
        if (organizer) {
            organizer.engagementScore += 100;
            await organizer.save();
        }

        res.json({ message: 'Successfully registered for the event' });
    } catch (err) {
        console.error('Error registering:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// [POST] /api/events/:id/unregister - Unregister from an event
router.post('/:id/unregister', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        const initialLength = event.attendees.length;
        event.attendees = event.attendees.filter(a => a.user.toString() !== req.user.id);
        
        if (event.attendees.length < initialLength) {
            event.currentAttendees -= 1;
            await event.save();
        }

        res.json({ message: 'Successfully unregistered from the event' });
    } catch (err) {
        console.error('Error unregistering:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// [POST] /api/events/:id/feedback - Rate an event
router.post('/:id/feedback', authMiddleware, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ msg: 'Valid rating is required' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        const existingFeedback = event.feedback.find(f => f.user.toString() === req.user.id);
        if (existingFeedback) {
            return res.status(400).json({ msg: 'You have already rated this event' });
        }

        event.feedback.push({
            user: req.user.id,
            rating,
            comment,
            submittedAt: new Date()
        });
        await event.save();

        const scoreAddition = rating * 10;
        if (event.organizer) {
            const organizer = await Alumni.findById(event.organizer);
            if (organizer) {
                organizer.engagementScore += scoreAddition;
                await organizer.save();
            }
        }

        res.json({ msg: 'Feedback submitted successfully' });
    } catch (err) {
        console.error('Error adding feedback:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
