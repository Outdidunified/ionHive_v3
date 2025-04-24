const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Ensure log directory exists
const logsDirectory = 'Log';
if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory, { recursive: true });
}

const logFilename = path.join(logsDirectory, 'ChargerLog.log');
// ANSI color codes for terminal output
const ansiReset = '\x1B[0m';
const ansiGreen = '\x1B[32m';
const ansiRed = '\x1B[31m';
const ansiBlue = '\x1B[34m';
const ansiYellow = '\x1B[33m';
const ansiOrange = '\x1B[38;5;214m'; // Orange ANSI color
const ansiCyan = '\x1B[36m'; // Cyan for Ping Pong logs


// Define custom log levels
const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        success: 3,  // Custom level for success messages
        debug: 4,     // Custom debug level
        pingpong: 5,  // Custom level for WebSocket ping/pong logs

    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'orange', // Change info color to orange
        success: 'green', // Change success color to green
        debug: 'blue',
        pingpong: 'cyan',

    },
};


// Define log format with colors
const consoleFormat = winston.format.printf(({ level, message, timestamp }) => {
    let colorizedMessage = message;

    switch (level) {
        case 'info':
            colorizedMessage = `${ansiOrange}${message}${ansiReset}`;
            break;
        case 'error':
            colorizedMessage = `${ansiRed}${message}${ansiReset}`;
            break;
        case 'warn':
            colorizedMessage = `${ansiYellow}${message}${ansiReset}`;
            break;
        case 'success':
            colorizedMessage = `${ansiGreen}${message}${ansiReset}`;
            break;
        case 'debug':
            colorizedMessage = `${ansiBlue}${message}${ansiReset}`;
            break;
        case 'pingpong':
            colorizedMessage = `${ansiCyan}${message}${ansiReset}`;
            break;
    }

    return `${timestamp} [${level.toUpperCase()}]: ${colorizedMessage}`;
});

// Define log format for file (without colors)
const fileFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Create Winston logger with console and file transports
const logger = winston.createLogger({
    levels: customLevels.levels,
    level: 'pingpong',  // Allow debug-level logging
    format: winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }), // Ensures timestamps are available
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }), // Ensures timestamp in console
                consoleFormat
            ),
        }),
        new winston.transports.File({
            filename: logFilename,
            format: winston.format.combine(
                winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
                fileFormat
            ),
        }),
    ],
});

// Apply custom colors to Winston
winston.addColors(customLevels.colors);

// Custom logging functions
const loggerInfo = (message) => logger.info(message);
const loggerError = (message) => logger.error(message);
const loggerWarn = (message) => logger.warn(message);
const loggerSuccess = (message) => logger.log('success', message);
const loggerDebug = (message) => logger.log('debug', message);
const loggerPingPong = (message) => logger.log('pingpong', message);

module.exports = { loggerInfo, loggerError, loggerWarn, loggerSuccess, loggerDebug, loggerPingPong };
