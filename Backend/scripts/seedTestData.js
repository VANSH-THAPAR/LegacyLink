const mongoose = require('mongoose');
const AuthUser = require('../models/AuthUser');
const Student = require('../models/student');
const Alumni = require('../models/alumni');
const University = require('../models/University');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

require('dotenv').config();

class TestDataSeeder {
    constructor() {
        this.seedData = {
            students: [
                {
                    name: 'John Doe',
                    email: 'john.student@university.edu',
                    rollNumber: '2021CS101',
                    collegeName: 'Legacy University',
                    course: 'Computer Science',
                    year: '3rd Year',
                    semester: '5th Semester',
                    graduatingYear: 2025,
                    cgpa: 8.5,
                    backlogs: 0,
                    phone: '+1234567890',
                    gender: 'Male',
                    interests: ['Programming', 'AI', 'Web Development'],
                    about: 'Passionate computer science student interested in software development'
                },
                {
                    name: 'Jane Smith',
                    email: 'jane.student@university.edu',
                    rollNumber: '2021CS102',
                    collegeName: 'Legacy University',
                    course: 'Computer Science',
                    year: '3rd Year',
                    semester: '5th Semester',
                    graduatingYear: 2025,
                    cgpa: 9.2,
                    backlogs: 0,
                    phone: '+1234567891',
                    gender: 'Female',
                    interests: ['Data Science', 'Machine Learning', 'Research'],
                    about: 'Computer science student with a passion for data science and machine learning'
                }
            ],
            alumni: [
                {
                    name: 'Robert Johnson',
                    email: 'robert.alumni@university.edu',
                    rollNumber: '2018CS101',
                    collegeName: 'Legacy University',
                    degreeProgram: 'Computer Science',
                    batchYear: 2018,
                    graduatingYear: 2022,
                    company: 'Tech Corp',
                    position: 'Software Engineer',
                    industry: 'Technology',
                    experience: 3,
                    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
                    phone: '+1234567892',
                    gender: 'Male',
                    location: 'San Francisco, CA',
                    about: 'Software engineer with experience in full-stack development'
                },
                {
                    name: 'Sarah Williams',
                    email: 'sarah.alumni@university.edu',
                    rollNumber: '2018CS102',
                    collegeName: 'Legacy University',
                    degreeProgram: 'Computer Science',
                    batchYear: 2018,
                    graduatingYear: 2022,
                    company: 'Data Analytics Inc',
                    position: 'Data Scientist',
                    industry: 'Data Analytics',
                    experience: 3,
                    skills: ['Python', 'Machine Learning', 'Data Analysis', 'SQL'],
                    phone: '+1234567893',
                    gender: 'Female',
                    location: 'New York, NY',
                    about: 'Data scientist specializing in machine learning and predictive analytics'
                }
            ],
            universities: [
                {
                    universityName: 'Legacy University',
                    universityId: 'LEGACY001',
                    email: 'admin@legacyuniversity.edu',
                    adminName: 'Dr. John Smith',
                    adminPosition: 'University Administrator',
                    type: 'Private',
                    established: 1990,
                    website: 'https://legacyuniversity.edu',
                    location: 'Boston, MA',
                    about: 'A leading institution in technology and innovation education'
                }
            ]
        };
    }

    async connect() {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('✅ Connected to MongoDB for seeding');
        } catch (error) {
            console.error('❌ MongoDB connection error:', error);
            process.exit(1);
        }
    }

    async clearExistingData() {
        try {
            console.log('🧹 Clearing existing test data...');
            
            // Clear in order to avoid foreign key issues
            await AuthUser.deleteMany({ 
                $or: [
                    { email: { $regex: /@(student|alumni|admin)\.university\.edu$/ } },
                    { rollNumber: { $regex: /^(2021|2018)/ } }
                ]
            });
            await Student.deleteMany({ 
                rollNumber: { $regex: /^(2021|2018)/ }
            });
            await Alumni.deleteMany({ 
                rollNumber: { $regex: /^(2021|2018)/ }
            });
            await University.deleteMany({ 
                universityId: 'LEGACY001'
            });
            await Admin.deleteMany({ 
                email: { $regex: /admin@.*\.edu$/ }
            });

            console.log('✅ Existing test data cleared');
        } catch (error) {
            console.error('❌ Error clearing data:', error);
        }
    }

    async seedStudents() {
        try {
            console.log('👨‍🎓 Seeding students...');
            
            for (const studentData of this.seedData.students) {
                // Create auth user first
                const hashedPassword = await bcrypt.hash('password123', 10);
                const authUser = new AuthUser({
                    email: studentData.email,
                    rollNumber: studentData.rollNumber,
                    password: hashedPassword,
                    role: 'student'
                });
                await authUser.save();
                
                // Create student profile with authId reference
                const profileData = { ...studentData };
                delete profileData.email; // Remove email from profile data
                
                const student = new Student({
                    ...profileData,
                    authId: authUser._id
                });
                await student.save();
                
                console.log(`✅ Created student: ${studentData.name}`);
            }
        } catch (error) {
            console.error('❌ Error seeding students:', error);
        }
    }

    async seedAlumni() {
        try {
            console.log('👔 Seeding alumni...');
            
            for (const alumniData of this.seedData.alumni) {
                // Create auth user first
                const hashedPassword = await bcrypt.hash('password123', 10);
                const authUser = new AuthUser({
                    email: alumniData.email,
                    rollNumber: alumniData.rollNumber,
                    password: hashedPassword,
                    role: 'alumni'
                });
                await authUser.save();
                
                // Create alumni profile with authId reference
                const profileData = { ...alumniData };
                delete profileData.email; // Remove email from profile data
                
                const alumni = new Alumni({
                    ...profileData,
                    authId: authUser._id
                });
                await alumni.save();
                
                console.log(`✅ Created alumni: ${alumniData.name}`);
            }
        } catch (error) {
            console.error('❌ Error seeding alumni:', error);
        }
    }

    async seedUniversities() {
        try {
            console.log('🏫 Seeding universities...');
            
            for (const universityData of this.seedData.universities) {
                // Create auth user first
                const hashedPassword = await bcrypt.hash('password123', 10);
                const authUser = new AuthUser({
                    email: universityData.email,
                    rollNumber: universityData.universityId,
                    password: hashedPassword,
                    role: 'university'
                });
                await authUser.save();
                
                // Create university profile with authId reference
                const profileData = { ...universityData };
                delete profileData.email; // Remove email from profile data
                
                const university = new University({
                    ...profileData,
                    authId: authUser._id
                });
                await university.save();
                
                console.log(`✅ Created university: ${universityData.universityName}`);
            }
        } catch (error) {
            console.error('❌ Error seeding universities:', error);
        }
    }

    async verifySeeding() {
        try {
            console.log('🔍 Verifying seeded data...');
            
            const authUserCount = await AuthUser.countDocuments();
            const studentCount = await Student.countDocuments();
            const alumniCount = await Alumni.countDocuments();
            const universityCount = await University.countDocuments();
            const adminCount = await Admin.countDocuments();
            
            console.log('📊 Verification Results:');
            console.log(`AuthUsers: ${authUserCount}`);
            console.log(`Students: ${studentCount}`);
            console.log(`Alumni: ${alumniCount}`);
            console.log(`Universities: ${universityCount}`);
            console.log(`Admins: ${adminCount}`);
            
            if (authUserCount === 5 && studentCount === 2 && alumniCount === 2 && universityCount === 1) {
                console.log('✅ All user types seeded successfully!');
            } else {
                console.log('⚠️ Some data might be missing');
            }
        } catch (error) {
            console.error('❌ Error verifying seeding:', error);
        }
    }

    async run() {
        try {
            await this.connect();
            await this.clearExistingData();
            await this.seedStudents();
            await this.seedAlumni();
            await this.seedUniversities();
            await this.verifySeeding();
            
            console.log('\n🎉 Test data seeding completed!');
            console.log('\n🔐 Login Credentials:');
            console.log('==================');
            console.log('All test accounts use password: password123');
            console.log('\nStudent Accounts:');
            console.log('  john.student@university.edu (John Doe)');
            console.log('  jane.student@university.edu (Jane Smith)');
            console.log('\nAlumni Accounts:');
            console.log('  robert.alumni@university.edu (Robert Johnson)');
            console.log('  sarah.alumni@university.edu (Sarah Williams)');
            console.log('\nUniversity Accounts:');
            console.log('  admin@legacyuniversity.edu (Legacy University)');
            
        } catch (error) {
            console.error('❌ Seeding process failed:', error);
        } finally {
            await mongoose.disconnect();
            console.log('\n👋 Database connection closed.');
        }
    }
}

// Run seeder
if (require.main === module) {
    const seeder = new TestDataSeeder();
    seeder.run();
}

module.exports = TestDataSeeder;
