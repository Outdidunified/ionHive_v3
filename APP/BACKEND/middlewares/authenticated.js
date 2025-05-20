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


// Middleware to check if the user is authenticated
const isAuthenticated = async (req, res, next) => {
  const token = req.headers['authorization'];
  const { user_id, email_id } = req.body;


  if (!token) return res.status(403).json({ message: 'Not authenticated, JWTtoken is missing !' });

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user exists and is active in the database
    if (db) {
      const usersCollection = db.collection("users");
      const user = await usersCollection.findOne({
        user_id: user_id,
      });

      // If user not found or status is false, invalidate the token
      if (!user) {
        logger.loggerWarn(`User not found in database: ${user_id}, ${user.email_id}`);
        return res.status(403).json({
          error: true,
          message: 'User not found in the system!',
          invalidateToken: true
        });
      }

      // Check if user status is false
      if (user.status === false) {
        logger.loggerWarn(`User account is inactive: UserID: ${user_id}, Email ID: ${user.email_id}`);
        return res.status(403).json({
          error: true,
          message: 'Your account has been deactivated!',
          invalidateToken: true
        });
      }
    }

    // If all checks pass, attach decoded token data to request
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.loggerSuccess(`Token expiry: ${err.message}, IP: ${req.ip}, token: ${token}`);
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