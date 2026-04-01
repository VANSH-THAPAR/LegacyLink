const mongoose = require('mongoose');
const { Student } = require('./models/User');
require('dotenv').config();

async function checkStudents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const totalStudents = await Student.countDocuments({role: 'student'});
    console.log('Total students:', totalStudents);
    
    const eligibleDefault = await Student.countDocuments({
      role: 'student', 
      cgpa: {$gte: 6.0}, 
      backlogs: {$lte: 0}
    });
    console.log('Students with CGPA >= 6.0 and backlogs <= 0:', eligibleDefault);
    
    const eligibleWithBacklogs = await Student.countDocuments({
      role: 'student', 
      cgpa: {$gte: 6.0}, 
      backlogs: {$lte: 2}
    });
    console.log('Students with CGPA >= 6.0 and backlogs <= 2:', eligibleWithBacklogs);
    
    // Show sample students
    const sampleStudents = await Student.find({role: 'student'}).limit(5).select('name email cgpa backlogs course year');
    console.log('Sample students:');
    console.log(JSON.stringify(sampleStudents, null, 2));
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

checkStudents();
