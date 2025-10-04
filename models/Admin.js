const mongoose = require('mongoose');
const baseUserSchema = require('./BaseUser');

/**
 * Admin Model
 * Extends BaseUser with Admin-specific fields and methods
 * Admins are created and managed by SuperAdmin
 */
const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    default: 'admin',
    immutable: true // Cannot be changed after creation
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdmin',
    required: [true, 'Admin must be created by a SuperAdmin'],
    immutable: true // Cannot be changed after creation
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  }
});

// Add base user schema fields
adminSchema.add(baseUserSchema);

// Create indexes for efficient querying (email and username are already indexed via unique: true in BaseUser)
adminSchema.index({ createdBy: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ createdAt: -1 });

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual to check if admin is newly created (within last 24 hours)
adminSchema.virtual('isNewlyCreated').get(function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt > oneDayAgo;
});

// Static method to find admins by SuperAdmin creator
adminSchema.statics.findByCreator = function(superAdminId) {
  return this.find({ createdBy: superAdminId });
};

// Static method to find active admins
adminSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find admins with pagination and filtering
adminSchema.statics.findWithPagination = function(options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = -1,
    isActive,
    search,
    createdBy
  } = options;

  const query = {};
  
  // Filter by active status if specified
  if (typeof isActive === 'boolean') {
    query.isActive = isActive;
  }
  
  // Filter by creator if specified
  if (createdBy) {
    query.createdBy = createdBy;
  }
  
  // Search in username, email, firstName, or lastName
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder };

  return this.find(query)
    .populate('createdBy', 'username email firstName lastName')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get admin statistics
adminSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } },
        inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
        firstLoginPending: { $sum: { $cond: ['$isFirstLogin', 1, 0] } },
        recentLogins: {
          $sum: {
            $cond: [
              { $gte: ['$lastLogin', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    active: 0,
    inactive: 0,
    firstLoginPending: 0,
    recentLogins: 0
  };
};

// Static method to validate admin creation data
adminSchema.statics.validateAdminData = function(adminData) {
  const errors = [];

  if (!adminData.username || adminData.username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (!adminData.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(adminData.email)) {
    errors.push('Valid email is required');
  }

  if (!adminData.firstName || adminData.firstName.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!adminData.lastName || adminData.lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (!adminData.createdBy) {
    errors.push('Admin must be created by a SuperAdmin');
  }

  if (adminData.password) {
    const passwordValidation = this.validatePasswordStrength(adminData.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Instance method to activate admin account
adminSchema.methods.activate = async function() {
  this.isActive = true;
  return this.save();
};

// Instance method to deactivate admin account
adminSchema.methods.deactivate = async function() {
  this.isActive = false;
  return this.save();
};

// Instance method to mark first login as completed
adminSchema.methods.completeFirstLogin = async function() {
  this.isFirstLogin = false;
  this.lastLogin = new Date();
  return this.save();
};

// Instance method to get teacher statistics for this admin
adminSchema.methods.getTeacherStats = async function() {
  try {
    const Teacher = mongoose.model('Teacher');
    
    const stats = await Teacher.aggregate([
      { $match: { createdBy: this._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
          firstLoginPending: { $sum: { $cond: ['$isFirstLogin', 1, 0] } },
          recentLogins: {
            $sum: {
              $cond: [
                { $gte: ['$lastLogin', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    return stats[0] || {
      total: 0,
      active: 0,
      inactive: 0,
      firstLoginPending: 0,
      recentLogins: 0
    };
  } catch (error) {
    // If Teacher model doesn't exist yet, return default stats
    return {
      total: 0,
      active: 0,
      inactive: 0,
      firstLoginPending: 0,
      recentLogins: 0
    };
  }
};

// Instance method to get teachers created by this admin
adminSchema.methods.getTeachers = function(options = {}) {
  try {
    const Teacher = mongoose.model('Teacher');
    const {
      isActive,
      department,
      limit = 10,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = -1
    } = options;

    const query = { createdBy: this._id };
    
    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }
    
    if (department) {
      query.department = department;
    }

    const sort = { [sortBy]: sortOrder };

    return Teacher.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  } catch (error) {
    // If Teacher model doesn't exist yet, return empty array
    return Promise.resolve([]);
  }
};

// Instance method to update admin profile
adminSchema.methods.updateProfile = async function(updateData) {
  const allowedUpdates = ['firstName', 'lastName', 'email'];
  const updates = {};

  // Only allow specific fields to be updated
  allowedUpdates.forEach(field => {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  });

  // Validate email format if being updated
  if (updates.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(updates.email)) {
    throw new Error('Invalid email format');
  }

  Object.assign(this, updates);
  return this.save();
};

// Instance method to change password
adminSchema.methods.changePassword = async function(currentPassword, newPassword) {
  // Verify current password
  const isCurrentPasswordValid = await this.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Validate new password strength
  const passwordValidation = this.constructor.validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
  }

  // Update password (will be hashed by pre-save middleware)
  this.password = newPassword;
  this.isFirstLogin = false; // Mark first login as completed if changing password
  
  // Reset login attempts when password is changed
  this.loginAttempts = 0;
  this.lockUntil = undefined;

  return this.save();
};

// Pre-save middleware to validate createdBy reference
adminSchema.pre('save', async function(next) {
  if (this.isNew && this.createdBy) {
    try {
      const SuperAdmin = mongoose.model('SuperAdmin');
      const superAdmin = await SuperAdmin.findById(this.createdBy);
      if (!superAdmin) {
        return next(new Error('Invalid SuperAdmin reference'));
      }
    } catch (error) {
      return next(new Error('Error validating SuperAdmin reference'));
    }
  }
  next();
});

// Ensure virtual fields are serialized
adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;