const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const path = require("path");
const logger = require('./utils/logger');
const { loggerInfo, loggerError, loggerDebug, loggerWarn } = require('./utils/logger');
const { initializeWebSocket } = require('./Websocket/Websocket');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['HTTP_PORT', 'WS_PORT', 'WS_PORT_CLIENT'];
requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        loggerError(`Missing environment variable: ${envVar}`);
        process.exit(1);
    }
});

// Define ports from environment
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const WS_PORT = process.env.WS_PORT || 8050;
const WS_PORT_CLIENT = process.env.WS_PORT_CLIENT || 7050;

// Initialize Express app
const app = express();

// Initialize WebSocket servers
const webSocketServer = http.createServer();
const clientWebSocketServer = http.createServer();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(bodyParser.json());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use("/uploads", express.static(path.join(__dirname, "public/uploads/vehicle_images")));

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 1000,
    message: 'Too many requests, please try again later.',
});
app.use(apiLimiter);

// Request Logger Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        loggerInfo(`${req.method} ${req.url} from ${req.ip} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Standard API Response Middleware
app.use((req, res, next) => {
    res.success = (data, message = 'Success') => res.json({ error: false, message, data });
    res.fail = (message = 'Something went wrong', statusCode = 500) => res.status(statusCode).json({ error: true, message });
    next();
});

// Routes
const routes = ['auth', 'profile', 'session', 'wallet', 'map', 'chargingstation'];
routes.forEach(route => app.use(`/${route}`, require(`./routes/${route}Route`)));

// Handle 404 - Not Found
app.use((req, res) => {
    loggerWarn(`404 Not Found: ${req.method} ${req.url} from ${req.ip}`);
    res.status(404).json({ error: true, message: 'Route not found' });
});

// Global Error Handling
app.use((err, req, res, next) => {
    loggerError(`Error: ${err.message}`);
    res.status(500).json({ error: true, message: 'Something went wrong!' });
});

// Start Servers Function
const startServer = (server, port, name) => {
    server.listen(port, () => {
        loggerDebug(`${name} listening on port ${port}`);  // Logs in blue (debug level)
    }).on('error', (err) => {
        loggerError(`${name} failed to start: ${err.message}`);
    });
};

// Create HTTP Server
const httpServer = http.createServer(app);

// Start Servers
startServer(httpServer, HTTP_PORT, 'HTTP Server');
startServer(webSocketServer, WS_PORT, 'WebSocket Server');
startServer(clientWebSocketServer, WS_PORT_CLIENT, 'Client WebSocket Server');

// Now initialize WebSockets after servers are listening
initializeWebSocket(webSocketServer, clientWebSocketServer);

// WebSocket Connection Logging
const logWebSocketConnection = (server, name, port) => {
    server.on('connection', () => loggerInfo(`New ${name} connection on port ${port}`));
    server.on('error', (err) => loggerError(`${name} Error: ${err.message}`));
};

logWebSocketConnection(webSocketServer, 'WebSocket Server', WS_PORT);
logWebSocketConnection(clientWebSocketServer, 'Client WebSocket Server', WS_PORT_CLIENT);

// Graceful Shutdown
let isShuttingDown = false;

const shutdown = () => {
    if (isShuttingDown) return; // Prevent duplicate execution
    isShuttingDown = true;

    loggerError('⚠ Shutting down server...');
    httpServer.close(() => loggerInfo('HTTP server closed.'));
    webSocketServer.close(() => loggerInfo('WebSocket server closed.'));
    clientWebSocketServer.close(() => loggerInfo('Client WebSocket server closed.'));

    setTimeout(() => process.exit(0), 100);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
