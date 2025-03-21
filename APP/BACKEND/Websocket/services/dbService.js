const db_conn = require('../../config/db');
const logger = require('../../utils/logger');
let db;
const connectToDatabase = async () => {
    if (!db) {
        db = await db_conn.connectToDatabase();
    }
    return db;
};
connectToDatabase(); // Initialize the DB connection once


const updateChargerIP = async (chargerId, ip) => {
    try {
        if (!db) {
            logger.error('Database connection failed.');
            console.error('Database connection failed ');
        }
        await db.collection('charger_details').updateOne({ charger_id: chargerId }, { $set: { ip } });
        await db.collection('charger_status').updateOne({ charger_id: chargerId }, { $set: { client_ip: ip } });
        logger.info(`Updated charger IP: ${chargerId}`);
        console.log(`Updated charger IP: ${chargerId}`);

    } catch (error) {
        logger.error(`Error updating charger IP: ${error.message}`);
        console.error(`Error updating charger IP: ${error.message}`);
    }
};
const checkChargerIdInDatabase = async (charger_id) => {
    try {
        if (!db) {
            logger.error('Database connection failed.');
            console.error('Database connection failed ');
        }
        const collection = db.collection('charger_details');
        const charger = await collection.findOne({ charger_id });

        if (!charger) {
            logger.warn(`Charger ID not found in database: ${charger_id}`);
            console.warn(`Charger ID not found in database: ${charger_id}`);
        }

        return !!charger; // Returns `true` if found, `false` otherwise
    } catch (error) {
        logger.error(`Database error while checking charger ID ${charger_id}: ${error.message}`);
        console.error(`Database error while checking charger ID ${charger_id}: ${error.message}`);
        return false;
    }
};


module.exports = { connectToDatabase, updateChargerIP, checkChargerIdInDatabase };
