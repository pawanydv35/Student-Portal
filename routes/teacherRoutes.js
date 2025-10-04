const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// Teacher authentication & management routes
router.post('/register', teacherController.registerTeacher);
router.post('/login', teacherController.loginTeacher);
router.get('/profile/:id', teacherController.getProfile);
router.put('/profile/:id', teacherController.updateProfile);
router.put('/change-password/:id', teacherController.changePassword);

module.exports = router;
