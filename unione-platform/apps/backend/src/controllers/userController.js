const { validationResult } = require('express-validator');
const User = require('../models/User');
const Course = require('../models/Course');
const { userCache, cache } = require('../config/redis');

// Get user profile (already handled in authController, but keeping for consistency)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses', 'code name instructor')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date()
        }
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_ERROR',
        message: 'Failed to get user profile',
        timestamp: new Date()
      }
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
          timestamp: new Date()
        }
      });
    }

    const { profile } = req.body;
    const userId = req.user._id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date()
        }
      });
    }

    // Update profile fields
    if (profile.firstName) user.profile.firstName = profile.firstName;
    if (profile.lastName) user.profile.lastName = profile.lastName;
    if (profile.department) user.profile.department = profile.department;
    if (profile.avatar) user.profile.avatar = profile.avatar;

    // Role-specific updates
    if (user.role === 'student' && profile.studentId) {
      user.profile.studentId = profile.studentId;
    }
    if ((user.role === 'faculty' || user.role === 'admin') && profile.employeeId) {
      user.profile.employeeId = profile.employeeId;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_FIELD',
          message: `${field} already exists`,
          timestamp: new Date()
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update profile',
        timestamp: new Date()
      }
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
          timestamp: new Date()
        }
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date()
        }
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect',
          timestamp: new Date()
        }
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PASSWORD_CHANGE_ERROR',
        message: 'Failed to change password',
        timestamp: new Date()
      }
    });
  }
};

// Get user's enrolled courses
const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate({
        path: 'enrolledCourses',
        select: 'code name description instructor semester year',
        populate: {
          path: 'instructor',
          select: 'profile.firstName profile.lastName profile.department'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date()
        }
      });
    }

    res.json({
      success: true,
      data: {
        courses: user.enrolledCourses
      }
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COURSES_ERROR',
        message: 'Failed to get enrolled courses',
        timestamp: new Date()
      }
    });
  }
};

// Admin functions

// Get all users (Admin only) - Optimized for scaling
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, department, search, cursor } = req.query;
    const limitNum = Math.min(parseInt(limit), 100); // Cap at 100 for performance

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (department) filter['profile.department'] = new RegExp(department, 'i');
    
    // Use cursor-based pagination for better performance with large datasets
    if (cursor) {
      filter._id = { $gt: cursor };
    }

    // Use text search for better performance when searching
    if (search) {
      if (search.length >= 3) { // Minimum 3 characters for text search
        filter.$text = { $search: search };
      } else {
        // Fallback to regex for shorter searches
        filter.$or = [
          { email: new RegExp(search, 'i') },
          { 'profile.firstName': new RegExp(search, 'i') },
          { 'profile.lastName': new RegExp(search, 'i') },
          { 'profile.studentId': new RegExp(search, 'i') },
          { 'profile.employeeId': new RegExp(search, 'i') }
        ];
      }
    }

    // Build query with optimized sorting
    let query = User.find(filter)
      .select('-password')
      .limit(limitNum + 1); // Get one extra to check if there are more

    // Sort by relevance if text search, otherwise by _id for cursor pagination
    if (search && search.length >= 3) {
      query = query.sort({ score: { $meta: 'textScore' }, _id: 1 });
    } else {
      query = query.sort({ _id: 1 });
    }

    const users = await query.exec();
    
    // Check if there are more results
    const hasMore = users.length > limitNum;
    if (hasMore) users.pop(); // Remove the extra item

    const nextCursor = hasMore && users.length > 0 ? users[users.length - 1]._id : null;

    // For traditional pagination (when not using cursor), get total count
    let total = null;
    let pages = null;
    if (!cursor) {
      // Only count when necessary and cache the result
      const countCacheKey = `users:count:${role || 'all'}:${department || 'all'}:${search || 'none'}`;
      total = await cache.get(countCacheKey);
      
      if (total === null) {
        total = await User.countDocuments(filter);
        await cache.set(countCacheKey, total, 300); // Cache for 5 minutes
      }
      
      pages = Math.ceil(total / limitNum);
    }

    res.json({
      success: true,
      data: {
        users,
        pagination: cursor ? {
          cursor: nextCursor,
          hasMore,
          limit: limitNum
        } : {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages,
          hasMore,
          nextCursor
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USERS_FETCH_ERROR',
        message: 'Failed to fetch users',
        timestamp: new Date()
      }
    });
  }
};

// Create user (Admin only)
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
          timestamp: new Date()
        }
      });
    }

    const { email, password, role, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists',
          timestamp: new Date()
        }
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      role,
      profile
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_FIELD',
          message: `${field} already exists`,
          timestamp: new Date()
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'USER_CREATION_ERROR',
        message: 'Failed to create user',
        timestamp: new Date()
      }
    });
  }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
          timestamp: new Date()
        }
      });
    }

    const { userId } = req.params;
    const { role, profile, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date()
        }
      });
    }

    // Update fields
    if (role) user.role = role;
    if (profile) {
      Object.keys(profile).forEach(key => {
        if (profile[key] !== undefined) {
          user.profile[key] = profile[key];
        }
      });
    }
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_UPDATE_ERROR',
        message: 'Failed to update user',
        timestamp: new Date()
      }
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
          timestamp: new Date()
        }
      });
    }

    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          timestamp: new Date()
        }
      });
    }

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_DELETE_SELF',
          message: 'Cannot delete your own account',
          timestamp: new Date()
        }
      });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_DELETE_ERROR',
        message: 'Failed to delete user',
        timestamp: new Date()
      }
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getEnrolledCourses,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};