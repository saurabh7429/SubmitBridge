const jwt = require('jsonwebtoken');

// Auth middleware - protects routes that only logged-in teachers can access
// It reads the JWT token from the "Authorization" header and validates it
const authMiddleware = (req, res, next) => {
  // The frontend sends the token as: "Bearer <token>"
  const authHeader = req.headers['authorization'];

  // If no Authorization header is present, reject the request
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided. Access denied.' });
  }

  // Split "Bearer <token>" and extract just the token part
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token missing. Access denied.' });
  }

  try {
    // jwt.verify checks if the token is valid and not expired
    // It also decodes the payload (we stored teacherId inside the token when we created it)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded teacher info to the request so route handlers can use it
    req.teacher = decoded;

    // Call next() to pass control to the actual route handler
    next();
  } catch (err) {
    // Token is invalid or expired
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
