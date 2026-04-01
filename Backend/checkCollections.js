const mongoose = require('mongoose');
require('dotenv').config();

async function checkCollections() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔍 Checking database collections...');
    
    const AuthUser = require('./models/AuthUser');
    const Student = require('./models/student');
    const Alumni = require('./models/alumni');
    const University = require('./models/University');
    const Admin = require('./models/Admin');
    
    const authUserCount = await AuthUser.countDocuments();
    const studentCount = await Student.countDocuments();
    const alumniCount = await Alumni.countDocuments();
    const universityCount = await University.countDocuments();
    const adminCount = await Admin.countDocuments();
    
    console.log('📊 Collection Counts:');
    console.log('AuthUser:', authUserCount);
    console.log('Student:', studentCount);
    console.log('Alumni:', alumniCount);
    console.log('University:', universityCount);
    console.log('Admin:', adminCount);
    
    const recentAuthUsers = await AuthUser.find().limit(3).select('email role profileType');
    console.log('\n🔐 Recent AuthUsers:');
    recentAuthUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) -> ${user.profileType}`);
    });
    
    const recentStudents = await Student.find().limit(3).select('name email rollNumber');
    console.log('\n👨‍🎓 Recent Students:');
    recentStudents.forEach(student => {
      console.log(`- ${student.name} (${student.email}) - ${student.rollNumber}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCollections();
