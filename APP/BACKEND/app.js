const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const bodyParser = require('body-parser');

const app = express();

// Load environment variables from .env file
dotenv.config();

// Middlewares
app.use(cors()); // Enable CORS
app.use(express.json()); // Enable JSON Parsing
app.use(helmet()); // Secure HTTP Headers with Helmet
app.use(bodyParser.json());

// Logger Middleware
app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});

// Set route path
const auth = require('./routes/authRoute');
const profile = require('./routes/profileRoute');
app.use('/auth', auth);
app.use('/profile', profile);

// Default route for unknown endpoints
app.use((req, res) => {
    res.status(404).json({ error: true, message: 'Route not found' });
});

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: true, message: 'Something went wrong!' });
});

// Create an HTTP server using Express app
const httpServer = http.createServer(app);

// Define HTTP server port
const HTTP_PORT = process.env.HTTP_PORT || 3000; // Default to 3000 if not set

// Start the HTTP server
httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP Server listening on port ${HTTP_PORT}`);
    logger.info(`HTTP Server listening on port ${HTTP_PORT}`);
});
