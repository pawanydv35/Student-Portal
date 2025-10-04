const mongoose = require('mongoose');
const baseUserSchema = require('./BaseUser');

/**
 * SuperAdmin Model
 * Extends BaseUser with SuperAdmin-specific fields and methods
 * There should only be one SuperAdmin account in the system
 */
const superAdminSchema = new mongoose.Schema({
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
    default: 'superadmin',
    immutable: true // Cannot be changed after creation
  }
});

// Add base user schema fields
superAdminSchema.add(baseUserSchema);

// Virtual for full name
superAdminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure only one SuperAdmin can exist
superAdminSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingSuperAdmin = await this.constructor.findOne({});
    if (existingSuperAdmin) {
      const error = new Error('Only one SuperAdmin account is allowed');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Static method to get the SuperAdmin (should only be one)
superAdminSchema.statics.getSuperAdmin = async function() {
  return this.findOne({});
};

// Static method to initialize SuperAdmin with default credentials
superAdminSchema.statics.initializeDefault = async function(credentials = {}) {
  const existingSuperAdmin = await this.findOne({});
  if (existingSuperAdmin) {
    throw new Error('SuperAdmin already exists');
  }

  const defaultCredentials = {
    username: credentials.username || 'superadmin',
    email: credentials.email || 'superadmin@unione.edu',
    password: credentials.password || 'SuperAdmin123!',
    firstName: credentials.firstName || 'Super',
    lastName: credentials.lastName || 'Admin',
    isActive: true
  };

  const superAdmin = new this(defaultCredentials);
  await superAdmin.save();
  return superAdmin;
};

// Instance method to get admin management statistics
superAdminSchema.methods.getAdminStats = async function() {
  const Admin = mongoose.model('Admin');
  
  const totalAdmins = await Admin.countDocuments({});
  const activeAdmins = await Admin.countDocuments({ isActive: true });
  const inactiveAdmins = await Admin.countDocuments({ isActive: false });
  const recentLogins = await Admin.countDocuments({
    lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  });

  return {
    total: totalAdmins,
    active: activeAdmins,
    inactive: inactiveAdmins,
    recentLogins
  };
};

// Instance method to get system overview
superAdminSchema.methods.getSystemOverview = async function() {
  try {
    const Admin = mongoose.model('Admin');
    const Teacher = mongoose.model('Teacher');

    const [adminStats, teacherStats] = await Promise.all([
      Admin.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
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
      ]),
      Teacher.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
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
      ])
    ]);

    return {
      admins: adminStats[0] || { total: 0, active: 0, recentLogins: 0 },
      teachers: teacherStats[0] || { total: 0, active: 0, recentLogins: 0 },
      lastUpdated: new Date()
    };
  } catch (error) {
    // If Admin or Teacher models don't exist yet, return default stats
    return {
      admins: { total: 0, active: 0, recentLogins: 0 },
      teachers: { total: 0, active: 0, recentLogins: 0 },
      lastUpdated: new Date()
    };
  }
};

// Instance method to validate admin creation data
superAdminSchema.methods.validateAdminData = function(adminData) {
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

  if (adminData.password) {
    const passwordValidation = this.constructor.validatePasswordStrength(adminData.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Ensure virtual fields are serialized
superAdminSchema.set('toJSON', { virtuals: true });
superAdminSchema.set('toObject', { virtuals: true });

const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);

module.exports = SuperAdmin;