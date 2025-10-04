const Teacher = require('../models/Teacher');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Register Teacher
exports.registerTeacher = async (req, res) => {
  try {
    const teacherData = req.body;
    const { isValid, errors } = Teacher.validateTeacherData(teacherData);

    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const teacher = new Teacher(teacherData);
    await teacher.save();

    res.status(201).json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Login Teacher
exports.loginTeacher = async (req, res) => {
  try {
    const { username, password } = req.body;
    const teacher = await Teacher.findByEmailOrUsername(username);

    if (!teacher) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await teacher.comparePassword(password);
    if (!isMatch) {
      await teacher.incLoginAttempts();
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await teacher.resetLoginAttempts();
    teacher.lastLogin = new Date();
    await teacher.save();

    const token = jwt.sign({ id: teacher._id, role: teacher.role }, config.env.jwt.secret, {
      expiresIn: config.env.jwt.expiresIn
    });

    res.status(200).json({ success: true, token, teacher });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Teacher Profile
exports.getProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.status(200).json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Teacher Profile
exports.updateProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const updatedTeacher = await teacher.updateProfile(req.body);
    res.status(200).json({ success: true, teacher: updatedTeacher });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    await teacher.changePassword(currentPassword, newPassword);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
