const jwt = require('jsonwebtoken');

// this middleware runs before any protected route to check the user is logged in
module.exports = (req, res, next) => {
  // the frontend sends the token in the Authorization header like: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // verify the token and pull out the user id we stored inside it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
