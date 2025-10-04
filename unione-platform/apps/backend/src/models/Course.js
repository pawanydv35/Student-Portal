const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 2020,
    max: 2030
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    allowDiscussions: {
      type: Boolean,
      default: true
    },
    geofenceRequired: {
      type: Boolean,
      default: true
    },
    attendanceThreshold: {
      type: Number,
      default: 75,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
courseSchema.index({ code: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ semester: 1, year: 1 });

// Virtual for enrolled student count
courseSchema.virtual('enrolledCount').get(function() {
  return this.enrolledStudents.length;
});

// Ensure virtual fields are serialized
courseSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Course', courseSchema);