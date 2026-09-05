const express = require('express');
const QRCode = require('qrcode');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ─── POST /api/assignments ────────────────────────────────────────────────────
// Create a new assignment (teacher only — protected by authMiddleware)
// After saving, it generates and returns a QR code for the submission link
router.post('/', authMiddleware, async (req, res) => {
  const { subject, questions, maxMarks } = req.body;

  try {
    // Create a new assignment linked to the logged-in teacher (from JWT payload)
    const assignment = new Assignment({
      subject,
      questions,
      maxMarks,
      teacherId: req.teacher.id,  // req.teacher is set by authMiddleware
    });

    await assignment.save();

    // Build the student-facing submission link using the new assignment's MongoDB _id
    // The frontend will handle /submit/:id as a page
    const submissionLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/submit/${assignment._id}`;

    // Generate a QR code as a base64 data URL (can be directly used in <img src="...">)
    const qrCode = await QRCode.toDataURL(submissionLink);

    res.status(201).json({
      assignment,
      submissionLink,
      qrCode,  // base64 PNG image of the QR code
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ─── GET /api/assignments ─────────────────────────────────────────────────────
// Get all assignments created by the logged-in teacher (for the dashboard)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Find assignments where teacherId matches the logged-in teacher
    // Sort by newest first
    const assignments = await Assignment.find({ teacherId: req.teacher.id })
      .sort({ createdAt: -1 });

    // For each assignment, count how many submissions have been made
    // Promise.all runs all the count queries at the same time (in parallel) for speed
    const assignmentsWithCount = await Promise.all(
      assignments.map(async (a) => {
        const count = await Submission.countDocuments({ assignmentId: a._id });
        return {
          ...a.toObject(),    // Convert Mongoose document to plain JS object
          submissionCount: count,
        };
      })
    );

    res.json(assignmentsWithCount);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ─── GET /api/assignments/:id ─────────────────────────────────────────────────
// Get a single assignment by ID (teacher view — shows detail + submissions list)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    // Make sure the assignment exists
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    // Make sure the logged-in teacher owns this assignment
    if (assignment.teacherId.toString() !== req.teacher.id) {
      return res.status(403).json({ message: 'Access denied. Not your assignment.' });
    }

    // Get all submissions for this assignment, sorted by newest first
    const submissions = await Submission.find({ assignmentId: req.params.id })
      .sort({ submittedAt: -1 });

    // Re-generate the QR code for the submission link to show on the detail page
    const submissionLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/submit/${assignment._id}`;
    const qrCode = await QRCode.toDataURL(submissionLink);

    res.json({ assignment, submissions, submissionLink, qrCode });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
