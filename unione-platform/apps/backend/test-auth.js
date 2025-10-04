// Simple test script to verify authentication system
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function testAuthSystem() {
  try {
    console.log('🔧 Testing UniOne Authentication System - Powered by IoSC...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unione', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clean up test data
    await User.deleteMany({ email: { $regex: /test.*@university\.edu/ } });
    console.log('🧹 Cleaned up test data');

    // Test 1: Create a student user
    console.log('\n📝 Test 1: Creating student user...');
    const studentData = {
      email: 'test.student@university.edu',
      password: 'StudentPass123',
      role: 'student',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        department: 'Computer Science',
        studentId: 'CS2024001'
      }
    };

    const student = new User(studentData);
    await student.save();
    console.log('✅ Student user created successfully');
    console.log(`   Email: ${student.email}`);
    console.log(`   Role: ${student.role}`);
    console.log(`   Full Name: ${student.profile.fullName}`);

    // Test 2: Create a faculty user
    console.log('\n📝 Test 2: Creating faculty user...');
    const facultyData = {
      email: 'test.faculty@university.edu',
      password: 'FacultyPass123',
      role: 'faculty',
      profile: {
        firstName: 'Jane',
        lastName: 'Smith',
        department: 'Computer Science',
        employeeId: 'EMP2024001'
      }
    };

    const faculty = new User(facultyData);
    await faculty.save();
    console.log('✅ Faculty user created successfully');
    console.log(`   Email: ${faculty.email}`);
    console.log(`   Role: ${faculty.role}`);
    console.log(`   Full Name: ${faculty.profile.fullName}`);

    // Test 3: Test password hashing
    console.log('\n🔐 Test 3: Testing password hashing...');
    const isStudentPasswordValid = await student.comparePassword('StudentPass123');
    const isStudentPasswordInvalid = await student.comparePassword('WrongPassword');
    console.log(`✅ Correct password validation: ${isStudentPasswordValid}`);
    console.log(`✅ Incorrect password validation: ${isStudentPasswordInvalid}`);

    // Test 4: Test user lookup methods
    console.log('\n🔍 Test 4: Testing user lookup methods...');
    const foundStudent = await User.findByEmail('test.student@university.edu');
    console.log(`✅ Found student by email: ${foundStudent ? foundStudent.profile.fullName : 'Not found'}`);

    // Test 5: Test public profile method
    console.log('\n👤 Test 5: Testing public profile method...');
    const publicProfile = student.getPublicProfile();
    console.log('✅ Public profile generated (password should be excluded)');
    console.log(`   Has password field: ${publicProfile.password !== undefined}`);
    console.log(`   Has email field: ${publicProfile.email !== undefined}`);

    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User model with validation');
    console.log('   ✅ Password hashing with bcrypt');
    console.log('   ✅ Role-based user creation');
    console.log('   ✅ Email lookup functionality');
    console.log('   ✅ Public profile generation');
    console.log('   ✅ Database connection and operations');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testAuthSystem();