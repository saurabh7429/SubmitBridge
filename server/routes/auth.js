const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../supabase");
const authMiddleware = require("../middleware/auth");

// Helper to generate JWT token
const generateToken = (teacher) => {
  return jwt.sign(
    {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      collegeName: teacher.college_name,
    },
    process.env.JWT_SECRET || "submitbridge_secret",
    { expiresIn: "7d" },
  );
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// Register a new teacher account
router.post("/register", async (req, res) => {
  const { name, email, password, collegeName } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long." });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();

    // Check if teacher with this email already exists
    const { data: existing, error: findError } = await supabase
      .from("teachers")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (findError) {
      return res
        .status(500)
        .json({ message: "Database error.", error: findError.message });
    }

    if (existing) {
      return res
        .status(400)
        .json({ message: "Email is already registered. Please log in." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new teacher into Supabase
    const { data: newTeacher, error: insertError } = await supabase
      .from("teachers")
      .insert([
        {
          name: name.trim(),
          email: cleanEmail,
          password: hashedPassword,
          college_name: (collegeName || "").trim(),
        },
      ])
      .select("id, name, email, college_name")
      .single();

    if (insertError) {
      return res
        .status(500)
        .json({
          message: "Failed to create teacher account.",
          error: insertError.message,
        });
    }

    const token = generateToken(newTeacher);

    res.status(201).json({
      message: "Registration successful!",
      token,
      teacher: {
        id: newTeacher.id,
        name: newTeacher.name,
        email: newTeacher.email,
        collegeName: newTeacher.college_name,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res
      .status(500)
      .json({
        message: "Server error during registration.",
        error: err.message,
      });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Log in an existing teacher
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();

    // Fetch teacher record
    const { data: teacher, error: fetchError } = await supabase
      .from("teachers")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (fetchError || !teacher) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Compare entered password with stored bcrypt hash
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = generateToken(teacher);

    res.json({
      message: "Login successful!",
      token,
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        collegeName: teacher.college_name,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ message: "Server error during login.", error: err.message });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Fetch current logged in teacher details
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const { data: teacher, error } = await supabase
      .from("teachers")
      .select("id, name, email, college_name, created_at")
      .eq("id", req.teacher.id)
      .single();

    if (error || !teacher) {
      return res.status(404).json({ message: "Teacher profile not found." });
    }

    res.json({ teacher });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

module.exports = router;
