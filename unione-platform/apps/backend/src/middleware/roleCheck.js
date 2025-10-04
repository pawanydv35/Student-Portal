// Role-based access control middleware
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
          timestamp: new Date()
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          timestamp: new Date()
        }
      });
    }

    next();
  };
};

// Specific role middleware functions
const requireAdmin = requireRole('admin');
const requireFaculty = requireRole('faculty', 'admin');
const requireStudent = requireRole('student', 'faculty', 'admin');

// Check if user is faculty or admin
const isFacultyOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
        timestamp: new Date()
      }
    });
  }

  if (!['faculty', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Access denied. Faculty or Admin role required',
        timestamp: new Date()
      }
    });
  }

  next();
};

// Check if user can access specific course (enrolled student, instructor, or admin)
const canAccessCourse = async (req, res, next) => {
  try {
    const courseId = req.params.courseId || req.body.courseId;
    
    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'COURSE_ID_REQUIRED',
          message: 'Course ID is required',
          timestamp: new Date()
        }
      });
    }

    // Admin can access any course
    if (req.user.role === 'admin') {
      return next();
    }

    // Load course to check instructor
    const Course = require('../models/Course');
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COURSE_NOT_FOUND',
          message: 'Course not found',
          timestamp: new Date()
        }
      });
    }

    // Faculty can access if they are the instructor
    if (req.user.role === 'faculty' && course.instructor.toString() === req.user._id.toString()) {
      return next();
    }

    // Students can access if they are enrolled
    if (req.user.role === 'student' && course.enrolledStudents.includes(req.user._id)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'COURSE_ACCESS_DENIED',
        message: 'You do not have access to this course',
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Course access check error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'ACCESS_CHECK_ERROR',
        message: 'Error checking course access',
        timestamp: new Date()
      }
    });
  }
};

module.exports = {
  requireRole,
  requireAdmin,
  requireFaculty,
  requireStudent,
  isFacultyOrAdmin,
  canAccessCourse
};