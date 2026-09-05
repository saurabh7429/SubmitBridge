const mongoose = require('mongoose');

// Assignment schema - one assignment is created by one teacher
const AssignmentSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  questions: {
    type: String,     // Free-text questions/instructions for students
    required: true,
  },
  maxMarks: {
    type: Number,
    required: true,
  },
  // Reference to the teacher who created this assignment
  // ObjectId links this document to a Teacher document
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',   // 'ref' tells Mongoose which model to use for populate()
    required: true,
  },
}, { timestamps: true }); // createdAt used on dashboard to show "Created on"

module.exports = mongoose.model('Assignment', AssignmentSchema);
