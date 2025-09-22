const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { Student, Alumni, University } = require('../models/User');

// Mock event data - in production, this would be a separate Event model
const mockEvents = [
    {
        id: 1,
        title: 'Cracking the PM Interview',
        speaker: 'Rohan Mehta',
        date: '2025-09-25',
        type: 'Career Talk',
        description: 'Join Rohan Mehta, a Senior PM at Google, as he shares insider tips and strategies to ace your product management interviews.',
        imageUrl: 'https://placehold.co/800x400/0891b2/ffffff?text=PM+Interview+Workshop',
        attendees: 120,
        maxAttendees: 200
    },
    {
        id: 2,
        title: 'Designing for the Future',
        speaker: 'Priya Singh',
        date: '2025-10-02',
        type: 'Workshop',
        description: 'A hands-on workshop with Microsoft\'s UX Lead, Priya Singh. Learn the latest trends in user experience and interface design.',
        imageUrl: 'https://placehold.co/800x400/4f46e5/ffffff?text=Design+Workshop',
        attendees: 85,
        maxAttendees: 150
    },
    {
        id: 3,
        title: 'Data Science in E-Commerce',
        speaker: 'Vikram Rao',
        date: '2025-10-10',
        type: 'Webinar',
        description: 'Vikram Rao from Amazon breaks down how data science is revolutionizing the e-commerce landscape.',
        imageUrl: 'https://placehold.co/800x400/059669/ffffff?text=Data+Science+Talk',
        attendees: 150,
        maxAttendees: 300
    }
];

// [GET] /api/events - Get all events
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { type, search } = req.query;
        
        let filteredEvents = mockEvents;
        
        if (type && type !== 'All') {
            filteredEvents = filteredEvents.filter(event => event.type === type);
        }
        
        if (search) {
            filteredEvents = filteredEvents.filter(event => 
                event.title.toLowerCase().includes(search.toLowerCase()) ||
                event.speaker.toLowerCase().includes(search.toLowerCase()) ||
                event.description.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        res.json(filteredEvents);
    } catch (err) {
        console.error('Get events error:', err.message);
        res.status(500).send('Server Error');
    }
});

// [GET] /api/events/:id - Get specific event
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const event = mockEvents.find(e => e.id === parseInt(req.params.id));
        
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }
        
        res.json(event);
    } catch (err) {
        console.error('Get event error:', err.message);
        res.status(500).send('Server Error');
    }
});

// [POST] /api/events/:id/register - Register for an event
router.post('/:id/register', authMiddleware, async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const event = mockEvents.find(e => e.id === eventId);
        
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }
        
        if (event.attendees >= event.maxAttendees) {
            return res.status(400).json({ msg: 'Event is full' });
        }
        
        // In a real app, you'd save this registration to a database
        // For now, we'll just increment the attendee count
        event.attendees += 1;
        
        res.json({ 
            msg: 'Successfully registered for event',
            event: event
        });
    } catch (err) {
        console.error('Event registration error:', err.message);
        res.status(500).send('Server Error');
    }
});

// [POST] /api/events - Create new event (for universities/alumni)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, date, type, maxAttendees = 100 } = req.body;
        
        if (!title || !description || !date || !type) {
            return res.status(400).json({ msg: 'Title, description, date, and type are required' });
        }
        
        const newEvent = {
            id: mockEvents.length + 1,
            title,
            description,
            date,
            type,
            speaker: req.user.role === 'alumni' ? req.user.name : 'University',
            imageUrl: `https://placehold.co/800x400/0891b2/ffffff?text=${encodeURIComponent(title)}`,
            attendees: 0,
            maxAttendees: parseInt(maxAttendees),
            createdBy: req.user.id
        };
        
        mockEvents.push(newEvent);
        
        res.status(201).json({
            msg: 'Event created successfully',
            event: newEvent
        });
    } catch (err) {
        console.error('Create event error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
