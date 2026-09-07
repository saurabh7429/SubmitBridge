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

// ─── POST /api/auth/demo ──────────────────────────────────────────────────────
// 1-Click Viva Demo Sign-In for evaluators & examiners
router.post("/demo", async (req, res) => {
  try {
    const demoEmail = "vikram.nit@edu.in";
    let { data: teacher, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("email", demoEmail)
      .maybeSingle();

    if (!teacher || error) {
      // Fallback to any first teacher or prof_demo
      const { data: anyTeacher } = await supabase
        .from("teachers")
        .select("*")
        .limit(1)
        .single();
      teacher = anyTeacher;
    }

    if (!teacher) {
      return res.status(404).json({ message: "No demo faculty account found." });
    }

    const token = generateToken(teacher);

    res.json({
      message: "Demo login successful!",
      token,
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        collegeName: teacher.college_name,
      },
    });
  } catch (err) {
    console.error("Demo login error:", err);
    res.status(500).json({ message: "Server error during demo login.", error: err.message });
  }
});

// ─── POST /api/auth/check-email ───────────────────────────────────────────────
// Check if faculty email is already in use before triggering OTP
router.post("/check-email", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();
    const { data: existing, error } = await supabase
      .from("teachers")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: "Database error.", error: error.message });
    }

    if (existing) {
      return res.status(400).json({ message: "This email is already registered. Please sign in." });
    }

    res.json({ available: true });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// ─── POST /api/auth/register-initiate ─────────────────────────────────────────
// Check email, generate OTP & link via Supabase Admin (bypasses anon rate limits)
router.post("/register-initiate", async (req, res) => {
  const { name, collegeName, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if email already registered in teachers table
    const { data: existing } = await supabase
      .from("teachers")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: "This email is already registered. Please sign in." });
    }

    // 2. Generate Supabase signup verification link & OTP via Admin API
    let otpCode = "";
    try {
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "signup",
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: name.trim(),
            college_name: (collegeName || "").trim(),
          },
        },
      });

      if (!linkError && linkData?.properties?.email_otp) {
        otpCode = linkData.properties.email_otp;
      }
    } catch (e) {
      console.warn("generateLink warning:", e.message);
    }

    if (!otpCode) {
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    }

    res.json({
      success: true,
      message: `Verification code generated for ${cleanEmail}.`,
      otpCode: otpCode,
    });
  } catch (err) {
    console.error("Register initiate error:", err);
    res.status(500).json({ message: "Server error during registration.", error: err.message });
  }
});

// ─── POST /api/auth/register-verified ─────────────────────────────────────────

// Complete registration after email OTP is verified
router.post("/register-verified", async (req, res) => {
  const { name, email, password, collegeName } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();

    // Check if already registered
    const { data: existing } = await supabase
      .from("teachers")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: "Account already exists for this email. Please sign in." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
      return res.status(500).json({ message: "Failed to create teacher account.", error: insertError.message });
    }

    const token = generateToken(newTeacher);
    res.status(201).json({
      message: "Registration and email verification successful!",
      token,
      teacher: {
        id: newTeacher.id,
        name: newTeacher.name,
        email: newTeacher.email,
        collegeName: newTeacher.college_name,
      },
    });
  } catch (err) {
    console.error("Register verified error:", err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// ─── POST /api/auth/google ────────────────────────────────────────────────────
// Teacher Google OAuth Sign-In — RESTRICTED TO REGISTERED FACULTY ONLY
router.post("/google", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const cleanEmail = email.toLowerCase().trim();

    // Check if teacher exists in registered database
    const { data: teacher, error: fetchError } = await supabase
      .from("teachers")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({ message: "Database error.", error: fetchError.message });
    }

    // Only allow sign-in if teacher is already registered
    if (!teacher) {
      return res.status(403).json({
        message: `No faculty account found for ${cleanEmail}. Please register with this email first.`,
        notRegistered: true,
      });
    }

    const token = generateToken(teacher);

    res.json({
      message: "Google sign-in successful!",
      token,
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        collegeName: teacher.college_name,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ message: "Server error during Google auth.", error: err.message });
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
