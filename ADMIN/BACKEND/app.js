// Load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');

// Core Modules and Dependencies
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger.js');

// Import Routes
const SuperAdminRoute = require('./routes/superAdminRoute.js');
const ResellerAdminRoute = require('./routes/resellerAdminRoute.js');
const ClientAdminRoute = require('./routes/clientAdminRoute.js');
const AssociationAdminRoute = require('./routes/associationAdminRoute.js');

// Initialize Express App
const app = express();

// Middleware: Secure HTTP Headers
app.use(helmet());

// Middleware: CORS - Allow all origins (can be restricted later)
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
}));

// Middleware: Parse incoming JSON
app.use(express.json({ type: 'application/json' }));


// Middleware: Rate Limiting to prevent DoS attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                 // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
// Uncomment to enable rate limiting
// app.use(limiter);
app.use('/uploads', cors(), express.static(path.join(__dirname, 'uploads')));

// Logger Middleware for Incoming Requests
app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});

// Register Routes
app.use('/superadmin', SuperAdminRoute);
app.use('/reselleradmin', ResellerAdminRoute);
app.use('/clientadmin', ClientAdminRoute);
app.use('/associationadmin', AssociationAdminRoute);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'An error occurred, please try again later.',
    });
});

// Create HTTP Server
const httpServer = http.createServer(app);

// Set Port
const HTTP_PORT = process.env.HTTP_PORT;

// Start Server
httpServer.listen(HTTP_PORT, () => {
    const logMessage = `HTTP Server listening on port ${HTTP_PORT}`;
    console.log(logMessage);
    logger.info(logMessage);
});
