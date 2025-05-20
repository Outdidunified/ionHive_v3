const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const db_conn = require('../config/db');
let db;
const initializeDB = async () => {
  if (!db) {
    db = await db_conn.connectToDatabase();
  }
  return db;
};
initializeDB(); // Initialize the DB connection once

const JWT_SECRET = process.env.JWT_SECRET;

const isAuthenticated = async (req, res, next) => {
  const token = req.headers['authorization'];
  const { user_id, email_id } = req.body;

  if (!token) {
    return res.status(403).json({ message: 'Not authenticated, JWT token is missing!' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user exists and is active in the database
    if (db) {
      const usersCollection = db.collection("users");

      // Build the query dynamically
      const query = {};
      if (user_id) query.user_id = user_id;
      if (email_id) query.email_id = email_id;

      if (Object.keys(query).length === 0) {
        return res.status(400).json({ message: 'Missing user_id or email_id in request body.' });
      }

      const user = await usersCollection.findOne(query);

      if (!user) {
        logger.loggerWarn(`User not found in database: user_id=${user_id}, email_id=${email_id}`);
        return res.status(403).json({
          error: true,
          message: 'User not found in the system!',
          invalidateToken: true
        });
      }

      if (user.status === false) {
        logger.loggerWarn(`User account is inactive: user_id=${user.user_id}, email_id=${user.email_id}`);
        return res.status(403).json({
          error: true,
          message: 'Your account has been deactivated!',
          invalidateToken: true
        });
      }
    }

    // All checks passed
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.loggerSuccess(`Token expired: ${err.message}, IP: ${req.ip}, token: ${token}`);
      return res.status(403).json({
        error: true,
        message: 'Token expired!',
        invalidateToken: true
      });
    }

    logger.loggerError(`Invalid token: ${err.message}, IP: ${req.ip}, token: ${token}`);
    return res.status(403).json({
      error: true,
      message: 'Invalid token!',
      invalidateToken: true
    });
  }
};

module.exports = { isAuthenticated };