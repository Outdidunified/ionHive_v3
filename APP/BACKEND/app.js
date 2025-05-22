const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const path = require('path');
const { loggerInfo, loggerError, loggerDebug, loggerWarn } = require('./utils/logger');
const { initializeWebSocket, setShutdownState } = require('./Websocket/Websocket');

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
const WS_PORT = process.env.WS_PORT || 7003;
const WS_PORT_CLIENT = process.env.WS_PORT_CLIENT || 7004;

// Initialize Express app
const app = express();

// Initialize HTTP servers for WebSocket
const webSocketHttpServer = http.createServer();
const clientWebSocketHttpServer = http.createServer();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(bodyParser.json());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads/vehicle_images')));

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
const routes = ['auth', 'profile', 'session', 'wallet', 'map', 'chargingstation', 'chargingsession', 'ocpp', 'search'];
routes.forEach((route) => app.use(`/${route}`, require(`./routes/${route}Route`)));

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

// Create HTTP Server
const httpServer = http.createServer(app);

// Import database connection
const dbService = require('./config/db');

// Store WebSocket server instances
let wsServer, wsClientServer;

// Start Servers Function
const startServer = (server, port, name) => {
    return new Promise((resolve, reject) => {
        server.listen(port, () => {
            loggerDebug(`${name} listening on port ${port}`);
            resolve();
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                loggerError(`${name} failed to start: Port ${port} is already in use`);
            } else {
                loggerError(`${name} failed to start: ${err.message}`);
            }
            reject(err);
        });
    });
};

// Start servers after database connection is established
const startServers = async () => {
    try {
        // Ensure database connection is established
        await dbService.connectToDatabase();
        loggerDebug('Database connection established.');

        // Start servers
        await Promise.all([
            startServer(httpServer, HTTP_PORT, 'HTTP Server'),
            startServer(webSocketHttpServer, WS_PORT, 'WebSocket Server'),
            startServer(clientWebSocketHttpServer, WS_PORT_CLIENT, 'Client WebSocket Server'),
        ]);

        // Initialize WebSockets and store server instances
        const wsResult = initializeWebSocket(webSocketHttpServer, clientWebSocketHttpServer);
        if (!wsResult || typeof wsResult !== 'object' || !wsResult.wsServer || !wsResult.wsClientServer) {
            throw new Error('initializeWebSocket did not return valid WebSocket server instances');
        }
        wsServer = wsResult.wsServer;
        wsClientServer = wsResult.wsClientServer;

        loggerInfo('All servers started successfully.');
    } catch (error) {
        loggerError(`Failed to start servers: ${error.message}`);
        await shutdown();
        process.exit(1);
    }
};

// WebSocket Connection Logging
const logWebSocketConnection = (server, name, port) => {
    server.on('connection', (ws, req) => {
        const clientIp = req.socket.remoteAddress;
        loggerInfo(`New ${name} connection on port ${port} from ${clientIp}`);
        ws.on('error', (err) => loggerError(`${name} connection error: ${err.message}`));
        ws.on('close', () => loggerInfo(`${name} connection closed from ${clientIp}`));
    });
    server.on('error', (err) => loggerError(`${name} error: ${err.message}`));
};

// Start the servers and set up WebSocket logging
startServers().then(() => {
    if (wsServer && wsClientServer) {
        logWebSocketConnection(wsServer, 'WebSocket Server', WS_PORT);
        logWebSocketConnection(wsClientServer, 'Client WebSocket Server', WS_PORT_CLIENT);
    }
});

// Graceful Shutdown
let isShuttingDown = false;

const shutdown = async () => {
    if (isShuttingDown) {
        loggerInfo('Shutdown already in progress, ignoring additional signal.');
        return;
    }
    isShuttingDown = true;

    // Notify WebSocket handlers of shutdown
    setShutdownState(true);

    loggerInfo('⚠ Initiating server shutdown...');

    try {
        // Stop accepting new HTTP connections
        await new Promise((resolve, reject) => {
            httpServer.close((err) => {
                if (err) {
                    loggerError(`HTTP server close error: ${err.message}`);
                    return reject(err);
                }
                loggerInfo('HTTP server closed.');
                resolve();
            });
        });

        // Close WebSocket server
        await new Promise((resolve, reject) => {
            if (wsServer) {
                wsServer.clients.forEach((client) => {
                    try {
                        if (client.readyState === client.OPEN) {
                            client.terminate();
                            loggerDebug(`Terminated WebSocket client connection.`);
                        }
                    } catch (err) {
                        loggerError(`Error terminating WebSocket client: ${err.message}`);
                    }
                });
                wsServer.close((err) => {
                    if (err) {
                        loggerError(`WebSocket server close error: ${err.message}`);
                        return reject(err);
                    }
                    loggerInfo('WebSocket server closed.');
                    resolve();
                });
            } else {
                loggerInfo('No WebSocket server instance to close.');
                resolve();
            }
        });

        // Close Client WebSocket server
        await new Promise((resolve, reject) => {
            if (wsClientServer) {
                wsClientServer.clients.forEach((client) => {
                    try {
                        if (client.readyState === client.OPEN) {
                            client.terminate();
                            loggerDebug(`Terminated Client WebSocket client connection.`);
                        }
                    } catch (err) {
                        loggerError(`Error terminating Client WebSocket client: ${err.message}`);
                    }
                });
                wsClientServer.close((err) => {
                    if (err) {
                        loggerError(`Client WebSocket server close error: ${err.message}`);
                        return reject(err);
                    }
                    loggerInfo('Client WebSocket server closed.');
                    resolve();
                });
            } else {
                loggerInfo('No Client WebSocket server instance to close.');
                resolve();
            }
        });

        // Close HTTP servers for WebSocket
        await Promise.all([
            new Promise((resolve, reject) => {
                webSocketHttpServer.close((err) => {
                    if (err) {
                        loggerError(`WebSocket HTTP server close error: ${err.message}`);
                        return reject(err);
                    }
                    loggerInfo('WebSocket HTTP server closed.');
                    resolve();
                });
            }),
            new Promise((resolve, reject) => {
                clientWebSocketHttpServer.close((err) => {
                    if (err) {
                        loggerError(`Client WebSocket HTTP server close error: ${err.message}`);
                        return reject(err);
                    }
                    loggerInfo('Client WebSocket HTTP server closed.');
                    resolve();
                });
            }),
        ]);

        // Close database connection
        try {
            await dbService.closeConnection();
            loggerInfo('Database connection closed.');
        } catch (err) {
            loggerError(`Failed to close database connection: ${err.message}`);
        }

        loggerInfo('All servers and connections closed successfully.');
        process.exit(0);
    } catch (error) {
        loggerError(`Shutdown failed: ${error.message}`);
        process.exit(1);
    }
};

// Handle termination signals
const handleSignal = (signal) => {
    loggerInfo(`Received ${signal}. Starting shutdown...`);
    shutdown();
};

// Remove existing listeners to prevent multiple triggers
process.removeAllListeners('SIGINT');
process.removeAllListeners('SIGTERM');

process.on('SIGINT', () => handleSignal('SIGINT'));
process.on('SIGTERM', () => handleSignal('SIGTERM'));

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
    loggerError(`Uncaught Exception: ${err.message}`);
    shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    loggerError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    shutdown();
});