const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');

const url = process.env.MONGODB_URI || 'mongodb+srv://outdid:outdid@cluster0.t16a63a.mongodb.net/';
const dbName = process.env.MONGODB_DB_NAME || 'EV_PHASE_III'; //For Co-production

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

module.exports = { connectToDatabase };