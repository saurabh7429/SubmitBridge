const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

const router = express.Router();

// ─── Multer Configuration ─────────────────────────────────────────────────────
// Multer is a middleware for handling file uploads (multipart/form-data)
// We configure it to save files to the "uploads" folder on the server

const storage = multer.diskStorage({
  // destination: where to save the uploaded file
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  // filename: what to name the file on disk (timestamp + original name avoids collisions)
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// fileFilter: only allow PDF files (check MIME type AND file extension)
const fileFilter = function (req, file, cb) {
  const isPdf =
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/x-pdf' ||
    file.originalname.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    cb(null, true);   // Accept the file
  } else {
    cb(new Error('Only PDF files are allowed.'), false);  // Reject non-PDF files
  }
};

// Initialize multer with storage config, file filter, and a 10MB size limit
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB in bytes
});

// ─── GET /api/submissions/assignment/:assignmentId ────────────────────────────
// Public route: Get the assignment details so the student can see questions
// (No auth needed — this is the student-facing page accessed via link/QR)
router.get('/assignment/:assignmentId', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ─── POST /api/submissions/:assignmentId ──────────────────────────────────────
// Student submits their PDF for an assignment
// If the same roll number already submitted for this assignment, we OVERWRITE it
router.post('/:assignmentId', upload.single('pdf'), async (req, res) => {
  const { studentName, rollNumber } = req.body;
  const { assignmentId } = req.params;

  // upload.single('pdf') puts the uploaded file info into req.file
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a PDF file.' });
  }

  try {
    // Check that the assignment actually exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      // Delete the uploaded file since we won't store this submission
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    // Check if this student already submitted for this assignment
    const existing = await Submission.findOne({ assignmentId, rollNumber });

    if (existing) {
      // ── Re-submission: delete the old PDF file ──
      // existing.pdfPath is a relative path like "uploads/oldfile.pdf"
      // We need the absolute path to delete it from the filesystem
      const oldFilePath = path.join(__dirname, '../', existing.pdfPath);

      // Only try to delete if the file actually exists on disk
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Update the existing submission record with new data
      existing.studentName = studentName;
      existing.pdfPath = `uploads/${req.file.filename}`;  // Relative path stored in DB
      existing.submittedAt = Date.now();
      await existing.save();

      return res.json({ message: 'Submission updated successfully.', submission: existing });
    }

    // ── New submission: create a new record ──
    const submission = new Submission({
      assignmentId,
      studentName,
      rollNumber,
      pdfPath: `uploads/${req.file.filename}`,  // Relative path stored in DB
    });

    await submission.save();
    res.status(201).json({ message: 'Submission successful!', submission });
  } catch (err) {
    // If anything goes wrong after a file was uploaded, clean it up
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
