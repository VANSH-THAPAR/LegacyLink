const mongoose = require('mongoose');
const AuthUser = require('../models/AuthUser');
const Student = require('../models/student');
const Alumni = require('../models/alumni');
const University = require('../models/University');
const Admin = require('../models/Admin');
const Message = require('../models/Message');

require('dotenv').config();

class DatabaseCleaner {
    async connect() {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('✅ Connected to MongoDB for cleaning');
        } catch (error) {
            console.error('❌ MongoDB connection error:', error);
            process.exit(1);
        }
    }

    async clearAllCollections() {
        try {
            console.log('🧹 Clearing all collections...');
            
            // Clear AuthUser collection
            const authUserResult = await AuthUser.deleteMany({});
            console.log(`✅ Cleared AuthUser collection: ${authUserResult.deletedCount} documents`);

            // Clear StudentProfile collection
            const studentResult = await Student.deleteMany({});
            console.log(`✅ Cleared Student collection: ${studentResult.deletedCount} documents`);

            // Clear AlumniProfile collection
            const alumniResult = await Alumni.deleteMany({});
            console.log(`✅ Cleared Alumni collection: ${alumniResult.deletedCount} documents`);

            // Clear UniversityProfile collection
            const universityResult = await University.deleteMany({});
            console.log(`✅ Cleared University collection: ${universityResult.deletedCount} documents`);

            // Clear Admin collection
            const adminResult = await Admin.deleteMany({});
            console.log(`✅ Cleared Admin collection: ${adminResult.deletedCount} documents`);

            // Clear Message collection
            const messageResult = await Message.deleteMany({});
            console.log(`✅ Cleared Message collection: ${messageResult.deletedCount} documents`);

            console.log('🎉 Database cleared successfully!');

        } catch (error) {
            console.error('❌ Error clearing database:', error);
        }
    }

    async run() {
        try {
            await this.connect();
            await this.clearAllCollections();
        } catch (error) {
            console.error('❌ Database cleaning failed:', error);
        } finally {
            await mongoose.disconnect();
            console.log('\n👋 Database connection closed.');
        }
    }
}

// Run the cleaner
if (require.main === module) {
    const cleaner = new DatabaseCleaner();
    cleaner.run();
}

module.exports = DatabaseCleaner;
