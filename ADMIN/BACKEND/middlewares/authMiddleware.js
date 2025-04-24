const jwt = require('jsonwebtoken');

// Use environment variable or fallback secret
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Check if Authorization header exists
    if (!authHeader) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Access denied. Invalid token format.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach decoded payload to request
        next(); // Proceed to next middleware or route
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized. Invalid or expired token.' });
    }
};

module.exports = verifyToken;
