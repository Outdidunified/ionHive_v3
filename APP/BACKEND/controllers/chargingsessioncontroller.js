const db_conn = require('../config/db');
const logger = require('../utils/logger');
let db;
const initializeDB = async () => {
    if (!db) {
        db = await db_conn.connectToDatabase();
    }
    return db;
};
initializeDB(); // Initialize the DB connection once

// MANAGE LAST STATUS
const fetchLastStatus = async (req, res) => {
    const { charger_id, connector_id, connector_type, email_id, user_id } = req.body;

    try {
        // Validate input types
        if (typeof charger_id !== 'string' || !Number.isInteger(connector_type) || !Number.isInteger(connector_id) || !user_id || isNaN(user_id) || !email_id || typeof email_id !== 'string' || email_id.trim() === '') {
            return res.status(400).json({
                error: true,
                message: 'Invalid input types: charger_id must be a string, connector_id must be an integer, connector_type must be a initeger.',
            });
        }


        if (!db) {
            logger.loggerError('Database connection failed.');
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }
        const usersCollection = db.collection('users');

        // Find the user with both user_id and email_id
        const user = await usersCollection.findOne({ user_id: user_id, email_id });

        if (!user) {
            return res.status(404).json({
                error: true,
                message: 'User not found.',
            });
        }

        const latestStatus = await db.collection('charger_status').findOne({
            charger_id: charger_id,
            connector_id: connector_id,
            connector_type: connector_type
        });

        const fetchCapacity = await db.collection('charger_details').findOne({ charger_id: charger_id });

        if (!fetchCapacity) {
            return res.status(404).json({
                error: true,
                message: `ChargerID - ${charger_id} not found in charger_details`
            });
        }

        const convertedCapacity = fetchCapacity.max_power / 1000;

        if (latestStatus) {
            const responseData = {
                charger_id: latestStatus.charger_id,
                connector_id: latestStatus.connector_id,
                connector_type: latestStatus.connector_type,
                charger_status: latestStatus.charger_status,
                timestamp: latestStatus.timestamp,
                error_code: latestStatus.error_code,
                ChargerCapacity: convertedCapacity
            };
            logger.loggerSuccess(`ChargerID: ${charger_id}, ConnectorID: ${connector_id} - Last status fetched successfully`);
            return res.status(200).json({
                error: false,
                message: 'Last status fetched successfully',
                data: responseData,
            });
        } else {
            logger.loggerWarn(`ChargerID: ${charger_id}, ConnectorID: ${connector_id} - No last status found`);
            return res.status(404).json({
                error: true,
                message: `ChargerID - ${charger_id}, ConnectorID - ${connector_id} No last data found`
            });
        }
    } catch (error) {
        logger.loggerError(`Error in fetchLastStatus: ChargerID: ${charger_id}, ConnectorID: ${connector_id} - ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error_details: error.message
        });
    }
};

module.exports = {
    fetchLastStatus
};




