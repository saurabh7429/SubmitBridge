require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const assignmentRoutes = require("./routes/assignments");
const submissionRoutes = require("./routes/submissions");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({ origin: true, credentials: true }));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    name: "SubmitBridge API",
    version: "1.0.0",
    status: "online",
    database: "Supabase PostgreSQL",
    storage: "Supabase Storage",
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error.",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SubmitBridge Server running at http://localhost:${PORT}`);
});
