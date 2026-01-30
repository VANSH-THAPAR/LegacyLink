const express = require('express');
const router = express.Router();
const Opportunity = require('../models/opportunitySchema');
const { Alumni, User } = require('../models/UnifiedUser'); // Use UnifiedUser
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/opportunities
// @desc    Get all opportunities with filters (Scoped to College)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Fetch current user to determine college scope
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(401).json({ success: false, msg: 'User not found' });
        }

        const { 
            type, 
            location, 
            locationType,
            category, 
            skills, 
            search, 
            sort = 'newest',
            limit = 50,
            page = 1
        } = req.query;

        // Build query
        let query = { 
            isActive: true,
            collegeName: currentUser.collegeName // Filter by college
        };

        if (type) query.type = type;
        if (locationType) query.locationType = locationType;
        if (category) query.category = category;
        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim());
            query.skills = { $in: skillsArray };
        }
        if (location && location !== 'all') {
            query.location = { $regex: location, $options: 'i' };
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { skills: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Sorting
        let sortOption = {};
        switch(sort) {
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            case 'deadline':
                sortOption = { deadline: 1 };
                break;
            case 'popular':
                sortOption = { views: -1, applications: -1 };
                break;
            case 'featured':
                sortOption = { isFeatured: -1, createdAt: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        const skip = (page - 1) * limit;

        const opportunities = await Opportunity.find(query)
            .populate('postedBy', 'name profilePicture batchYear profession CompanyName LinkedInURL')
            .sort(sortOption)
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        const total = await Opportunity.countDocuments(query);

        res.json({
            success: true,
            data: opportunities,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching opportunities:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Server error while fetching opportunities' 
        });
    }
});

// @route   GET /api/opportunities/:id
// @desc    Get single opportunity by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id)
            .populate('postedBy', 'name profilePicture batchYear profession CompanyName LinkedInURL universityEmail');

        if (!opportunity) {
            return res.status(404).json({ 
                success: false, 
                msg: 'Opportunity not found' 
            });
        }

        // Increment view count
        opportunity.views += 1;
        await opportunity.save();

        res.json({
            success: true,
            data: opportunity
        });
    } catch (error) {
        console.error('Error fetching opportunity:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Server error while fetching opportunity' 
        });
    }
});

// @route   POST /api/opportunities
// @desc    Create new opportunity (Alumni only)
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        // Verify user is alumni
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ 
                success: false, 
                msg: 'Only alumni can post opportunities' 
            });
        }

        const {
            title,
            description,
            type,
            company,
            companyLogo,
            location,
            locationType,
            stipend,
            duration,
            skills,
            applyLink,
            contactEmail,
            linkedinUrl,
            deadline,
            category,
            experienceLevel,
            isFeatured
        } = req.body;

        // Validation
        if (!title || !description || !type || !company || !location) {
            return res.status(400).json({ 
                success: false, 
                msg: 'Please provide all required fields' 
            });
        }

        // Fetch the posting alumni user to get their collegeName
        const postingUser = await User.findById(req.user.id);
        if (!postingUser) {
             return res.status(404).json({ success: false, msg: 'User not found' });
        }

        const newOpportunity = new Opportunity({
            title,
            description,
            type,
            company,
            companyLogo: companyLogo || '',
            postedBy: req.user.id,
            collegeName: postingUser.collegeName, // Save college context
            location,
            locationType: locationType || 'on-site',
            stipend,
            duration,
            skills: skills || [],
            applyLink,
            contactEmail,
            linkedinUrl,
            deadline,
            category: category || 'other',
            experienceLevel: experienceLevel || 'any',
            isFeatured: isFeatured || false
        });

        const savedOpportunity = await newOpportunity.save();
        
        // Populate alumni details before sending response
        await savedOpportunity.populate('postedBy', 'name profilePicture batchYear profession CompanyName');

        res.status(201).json({
            success: true,
            msg: 'Opportunity posted successfully',
            data: savedOpportunity
        });
    } catch (error) {
        console.error('Error creating opportunity:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Server error while creating opportunity' 
        });
    }
});

// @route   PUT /api/opportunities/:id
// @desc    Update opportunity (Alumni who posted it only)
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({ 
                success: false, 
                msg: 'Opportunity not found' 
            });
        }

        // Check if user is the one who posted it
        if (opportunity.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                msg: 'Not authorized to update this opportunity' 
            });
        }

        const updatedOpportunity = await Opportunity.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).populate('postedBy', 'name ProfilePicture batchYear profession CompanyName');

        res.json({
            success: true,
            msg: 'Opportunity updated successfully',
            data: updatedOpportunity
        });
    } catch (error) {
        console.error('Error updating opportunity:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Server error while updating opportunity' 
        });
    }
});

// @route   DELETE /api/opportunities/:id
// @desc    Delete opportunity (Alumni who posted it only)
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({ 
                success: false, 
                msg: 'Opportunity not found' 
            });
        }

        // Check if user is the one who posted it
        if (opportunity.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                msg: 'Not authorized to delete this opportunity' 
            });
        }

        await Opportunity.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            msg: 'Opportunity deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting opportunity:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Server error while deleting opportunity' 
        });
    }
});

// @route   POST /api/opportunities/:id/bookmark
// @desc    Bookmark/unbookmark opportunity (Students only)
// @access  Private
router.post('/:id/bookmark', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ 
                success: false, 
                msg: 'Only students can bookmark opportunities' 
            });
        }

        const opportunity = await Opportunity.findById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({ 
                success: false, 
                msg: 'Opportunity not found' 
            });
        }

        const isBookmarked = opportunity.bookmarkedBy.includes(req.user.id);

        if (isBookmarked) {
            // Remove bookmark
            opportunity.bookmarkedBy = opportunity.bookmarkedBy.filter(
                id => id.toString() !== req.user.id
            );
        } else {
            // Add bookmark
            opportunity.bookmarkedBy.push(req.user.id);
        }

        await opportunity.save();

        res.json({
            success: true,
            msg: isBookmarked ? 'Bookmark removed' : 'Opportunity bookmarked',
            isBookmarked: !isBookmarked
        });
    } catch (error) {
        console.error('Error bookmarking opportunity:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Server error while bookmarking opportunity' 
        });
    }
});

// @route   POST /api/opportunities/:id/apply
// @desc    Track application (increment counter)
// @access  Private
router.post('/:id/apply', authMiddleware, async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({ 
                success: false, 
                msg: 'Opportunity not found' 
            });
        }

        opportunity.applications += 1;
        await opportunity.save();

        res.json({
            success: true,
            msg: 'Application tracked successfully'
        });
    } catch (error) {
        console.error('Error tracking application:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Server error while tracking application' 
        });
    }
});

// @route   GET /api/opportunities/my/posted
// @desc    Get opportunities posted by logged-in alumni
// @access  Private
router.get('/my/posted', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ 
                success: false, 
                msg: 'Only alumni can view their posted opportunities' 
            });
        }

        const opportunities = await Opportunity.find({ postedBy: req.user.id })
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            data: opportunities
        });
    } catch (error) {
        console.error('Error fetching posted opportunities:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Server error while fetching opportunities' 
        });
    }
});

module.exports = router;
