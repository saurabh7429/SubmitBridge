const jwt = require("jsonwebtoken");

// Auth middleware to protect teacher-only routes
// Verifies the Bearer JWT token from the Authorization header
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "submitbridge_secret",
    );
    req.teacher = decoded; // Contains { id, name, email, collegeName }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
