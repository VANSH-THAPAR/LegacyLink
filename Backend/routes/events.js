const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const { User } = require('../models/UnifiedUser');

// [GET] /api/events - Get all events (Scoped to College)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) return res.status(404).json({ msg: 'User not found' });

        const { type, search } = req.query;
        
        // Scope to college
        let query = { collegeName: currentUser.collegeName };
        
        if (type && type !== 'All') {
            query.type = type;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const events = await Event.find(query)
            .populate('organizer', 'name profilePicture')
            .sort({ date: 1 });

        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// [POST] /api/events - Create Event (Alumni Only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'alumni') {
            return res.status(403).json({ msg: 'Only Alumni can create events' });
        }

        const { title, description, type, date, location, time } = req.body;

        const newEvent = new Event({
            title,
            description,
            type,
            date,
            time,
            location,
            organizer: req.user.id,
            collegeName: user.collegeName // Save scope
        });

        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// [POST] /api/events/:id/register - Register for event
router.post('/:id/register', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        // Check if already registered
        if (event.attendees.includes(req.user.id)) {
            return res.status(400).json({ msg: 'Already registered' });
        }

        event.attendees.push(req.user.id);
        await event.save();
        
        res.json({ msg: 'Registered successfully', attendees: event.attendees.length });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
