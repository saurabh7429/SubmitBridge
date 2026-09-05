// Load environment variables from .env file FIRST (before anything else)
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import our route files
const authRoutes = require('./routes/auth');
const assignmentRoutes = require('./routes/assignments');
const submissionRoutes = require('./routes/submissions');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

// cors: allows the React frontend (running on port 3000) to make API calls to
// this server (running on port 5000) without browser CORS errors
app.use(cors());

// express.json: parses incoming JSON request bodies (for req.body to work)
app.use(express.json());

// Serve uploaded PDF files as static files
// e.g., GET /uploads/1720000000000-file.pdf will return the actual file
// This is how the teacher downloads/views student submissions
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────

// All auth routes (login, register) are prefixed with /api/auth
app.use('/api/auth', authRoutes);

// All assignment routes are prefixed with /api/assignments
app.use('/api/assignments', assignmentRoutes);

// All submission routes are prefixed with /api/submissions
app.use('/api/submissions', submissionRoutes);

// Root route — simple health check to confirm server is running
app.get('/', (req, res) => {
  res.json({ message: 'SubmitBridge API is running!' });
});

// ─── Database Connection ──────────────────────────────────────────────────────

// mongoose.connect connects to MongoDB using the URI from .env
// Once connected, start the Express server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);  // Exit the process if DB connection fails
  });
