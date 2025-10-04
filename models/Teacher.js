const mongoose = require('mongoose');
const baseUserSchema = require('./BaseUser');

/**
 * Teacher Model
 * Extends BaseUser with Teacher-specific fields and methods
 * Teachers are created and managed by Admins
 */
const teacherSchema = new mongoose.Schema({
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
    default: 'teacher',
    immutable: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Teacher must be created by an Admin'],
    immutable: true
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [100, 'Subject name cannot exceed 100 characters']
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  }
});

// Merge base user fields
teacherSchema.add(baseUserSchema);

// Indexes for efficient querying
teacherSchema.index({ createdBy: 1 });
teacherSchema.index({ department: 1 });
teacherSchema.index({ isActive: 1 });
teacherSchema.index({ createdAt: -1 });

// Virtual full name
teacherSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual check if newly created
teacherSchema.virtual('isNewlyCreated').get(function () {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt > oneDayAgo;
});

// ---------- STATIC METHODS ----------

// Find teachers by admin
teacherSchema.statics.findByAdmin = function (adminId) {
  return this.find({ createdBy: adminId });
};

// Find active teachers
teacherSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Pagination + Filtering
teacherSchema.statics.findWithPagination = function (options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = -1,
    isActive,
    department,
    search,
    createdBy
  } = options;

  const query = {};

  if (typeof isActive === 'boolean') query.isActive = isActive;
  if (createdBy) query.createdBy = createdBy;
  if (department) query.department = department;

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } }
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

// Teacher statistics
teacherSchema.statics.getStatistics = async function () {
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

// Validate teacher creation
teacherSchema.statics.validateTeacherData = function (teacherData) {
  const errors = [];

  if (!teacherData.username || teacherData.username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (
    !teacherData.email ||
    !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(teacherData.email)
  ) {
    errors.push('Valid email is required');
  }

  if (!teacherData.firstName || teacherData.firstName.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!teacherData.lastName || teacherData.lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (!teacherData.createdBy) {
    errors.push('Teacher must be created by an Admin');
  }

  if (teacherData.password) {
    const passwordValidation = this.validatePasswordStrength(teacherData.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  return { isValid: errors.length === 0, errors };
};

// ---------- INSTANCE METHODS ----------

// Activate teacher
teacherSchema.methods.activate = async function () {
  this.isActive = true;
  return this.save();
};

// Deactivate teacher
teacherSchema.methods.deactivate = async function () {
  this.isActive = false;
  return this.save();
};

// Complete first login
teacherSchema.methods.completeFirstLogin = async function () {
  this.isFirstLogin = false;
  this.lastLogin = new Date();
  return this.save();
};

// Update profile
teacherSchema.methods.updateProfile = async function (updateData) {
  const allowedUpdates = ['firstName', 'lastName', 'email', 'department', 'subject'];
  const updates = {};

  allowedUpdates.forEach((field) => {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  });

  if (updates.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(updates.email)) {
    throw new Error('Invalid email format');
  }

  Object.assign(this, updates);
  return this.save();
};

// Change password
teacherSchema.methods.changePassword = async function (currentPassword, newPassword) {
  const isCurrentPasswordValid = await this.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  const passwordValidation = this.constructor.validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
  }

  this.password = newPassword;
  this.isFirstLogin = false;
  this.loginAttempts = 0;
  this.lockUntil = undefined;

  return this.save();
};

// Pre-save validation for createdBy
teacherSchema.pre('save', async function (next) {
  if (this.isNew && this.createdBy) {
    try {
      const Admin = mongoose.model('Admin');
      const admin = await Admin.findById(this.createdBy);
      if (!admin) return next(new Error('Invalid Admin reference'));
    } catch (error) {
      return next(new Error('Error validating Admin reference'));
    }
  }
  next();
});

teacherSchema.set('toJSON', { virtuals: true });
teacherSchema.set('toObject', { virtuals: true });

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
