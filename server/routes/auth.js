const express = require('express');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

const router = express.Router();

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// Register a new teacher account (used for initial setup / seeding)
// In a real app this might be admin-only, but for our project it's open
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if a teacher with this email already exists
    const existing = await Teacher.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Create a new Teacher document (password will be hashed by the pre-save hook in Teacher.js)
    const teacher = new Teacher({ name, email, password });
    await teacher.save();

    res.status(201).json({ message: 'Teacher registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Login route: validate email + password, return a JWT token if valid
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the teacher by email in the database
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Use the comparePassword method defined on the Teacher model
    // to check if the entered password matches the stored hash
    const isMatch = await teacher.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Create a JWT token containing the teacher's id and name
    // The token expires in 7 days (teachers don't need to re-login often)
    const token = jwt.sign(
      { id: teacher._id, name: teacher.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return the token and basic teacher info to the frontend
    res.json({
      token,
      teacher: { id: teacher._id, name: teacher.name, email: teacher.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
