const mongoose = require('mongoose');

// Submission schema - stores student's answer PDF and details
const SubmissionSchema = new mongoose.Schema({
  // Reference to which assignment this submission belongs to
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  studentName: {
    type: String,
    required: true,
    trim: true,
  },
  rollNumber: {
    type: String,
    required: true,
    trim: true,
  },
  // File path on the server where the uploaded PDF is stored
  // e.g., "uploads/1720000000000-assignment.pdf"
  pdfPath: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,  // Automatically set to current time when submitted
  },
});

// Compound unique index: same student (rollNumber) cannot have duplicate
// submissions for the same assignment. We handle re-submission by updating
// (overwriting) the existing record instead of creating a new one.
SubmissionSchema.index({ assignmentId: 1, rollNumber: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
