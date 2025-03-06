const { MongoClient } = require('mongodb');

const url = 'mongodb+srv://outdid:outdid@cluster0.t16a63a.mongodb.net/';
const dbName = 'EV_PHASE_III'; //For Co-production

let client;

//database connection
async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(url);
        try {
            await client.connect();
            console.log('Connected to the database');
        } catch (error) {
            console.error('Error connecting to the database:', error);
            throw error;
        }
    }

    return client.db(dbName);
}

module.exports = { connectToDatabase };