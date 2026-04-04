// Debug script to check university user and events
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { User, University } = require('./Backend/models/UnifiedUser');
const UniversityModel = require('./Backend/models/University');
const Event = require('./Backend/models/Event');
const EventRequest = require('./Backend/models/EventRequest');

async function debugSystem() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/legacylink');
        console.log('✅ Connected to MongoDB');

        // Check university user
        const universityId = '69ccf2374093672cab4a3f98';
        console.log('\n🔍 Checking university user:', universityId);
        
        const universityFromUnified = await University.findOne({ authId: universityId });
        console.log('📋 University from UnifiedUser:', universityFromUnified ? 'Found' : 'Not found');
        
        const universityFromModel = await UniversityModel.findOne({ authId: universityId });
        console.log('📋 University from UniversityModel:', universityFromModel ? 'Found' : 'Not found');
        
        if (universityFromModel) {
            console.log('📊 University details:', {
                _id: universityFromModel._id,
                universityName: universityFromModel.universityName,
                email: universityFromModel.email,
                authId: universityFromModel.authId
            });
        }

        // Check EventRequests
        console.log('\n🔍 Checking EventRequests...');
        const eventRequests = await EventRequest.find({});
        console.log('📊 EventRequests found:', eventRequests.length);
        
        eventRequests.forEach((req, i) => {
            console.log(`📋 Request ${i + 1}:`, {
                title: req.title,
                status: req.status,
                collegeName: req.collegeName,
                requester: req.requester
            });
        });

        // Check Events
        console.log('\n🔍 Checking Events...');
        const events = await Event.find({});
        console.log('📊 Events found:', events.length);
        
        events.forEach((event, i) => {
            console.log(`📋 Event ${i + 1}:`, {
                title: event.title,
                status: event.status,
                collegeName: event.collegeName,
                organizer: event.organizer
            });
        });

        // Check if there are any approved events for students
        console.log('\n🔍 Checking approved events for students...');
        const studentId = '69ccd8726a2ca7d5dc6f9efc';
        const student = await User.findById(studentId);
        console.log('📋 Student found:', student ? 'Yes' : 'No');
        
        if (student) {
            const approvedEvents = await Event.find({ 
                collegeName: student.collegeName,
                status: 'Approved'
            });
            console.log('📊 Approved events for student college:', approvedEvents.length);
        }

    } catch (error) {
        console.error('❌ Debug error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

debugSystem();
