const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');

const url = process.env.MONGODB_URI || 'mongodb+srv://outdid:outdid@cluster0.t16a63a.mongodb.net/';
// const dbName = process.env.MONGODB_DB_NAME || 'EV_PHASE_III'; // DEV
const dbName = process.env.MONGODB_DB_NAME || 'EV_V3_UAT'; // UAT

let client;

//database connection
async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(url);
        try {
            await client.connect();
            logger.loggerSuccess('Connected to the database');
        } catch (error) {
            logger.loggerError(`Error connecting to the database: ${error}`);
            throw error;
        }
    }

    return client.db(dbName);
}

/**
 * Close the database connection
 * @returns {Promise<boolean>} - Whether the connection was closed successfully
 */
async function closeConnection() {
    try {
        if (client) {
            await client.close();
            logger.loggerInfo('Database connection closed successfully');
            client = null; // Reset the client
            return true;
        }
        return false;
    } catch (error) {
        logger.loggerError(`Error closing database connection: ${error.message}`);
        return false;
    }
}

/**
 * Get the MongoDB client instance
 * @returns {MongoClient|null} - The MongoDB client or null if not connected
 */
function getClient() {
    return client;
}

module.exports = {
    connectToDatabase,
    closeConnection,
    getClient
};