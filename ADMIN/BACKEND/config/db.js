const { MongoClient } = require('mongodb');

const url = 'mongodb+srv://outdid:outdid@cluster0.t16a63a.mongodb.net/';
const dbName = 'EV_PHASE_2_UAT'; //For Testing

let client;
let db;

//database connection
async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(url);
        try {
            await client.connect();
            console.log('Connected to the database');
            db = client.db(dbName);

            // Handle process termination
            process.on("SIGINT", async () => {
                await client.close();
                console.log("Database connection closed.");
                process.exit(0);
            });
        } catch (error) {
            console.error('Error connecting to the database:', error);
            throw error;
        }
    }

    return db;
}

module.exports = { connectToDatabase };