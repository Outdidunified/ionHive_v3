const winston = require('winston');
const path = require('path');

const logsDirectory = 'Log';
const logFilename = path.join(logsDirectory, 'ChargerLog.log');

// Configure the logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: logFilename })
    ]
});

module.exports = logger;