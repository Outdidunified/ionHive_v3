const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  const token = req.headers['authorization'];


  if (!token) return res.status(401).json({ message: 'Not authenticated, JWTtoken is missing !' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded token data to request
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.loggerSuccess(`Token expiry: ${err.message}, IP: ${req.ip}, token: ${token}`);
      return res.status(401).json({ error: true, message: 'Token expired!' });
    }
    logger.loggerError(`Invalid token: ${err.message}, IP: ${req.ip}, token: ${token}`);
    return res.status(401).json({ error: true, message: 'Invalid token!' });
  }
};

module.exports = { isAuthenticated };