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


// GET SPECIFIC STATION'S CHARGER DETAILS WITH CONNECTORS
// Fetch the specific station's charger details with connectors

const SearchSpecificChargerDetails = async (req, res) => {
    try {
        const { user_id, email_id, charger_id } = req.body;

        // Validate input
        if (!user_id || !email_id || !charger_id) {
            return res.status(400).json({
                error: true,
                message: 'Missing required fields: user_id, email_id, and charger_id are required.',
            });
        }

        if (!Number.isInteger(Number(user_id)) || typeof email_id !== 'string' || typeof charger_id !== 'string') {
            return res.status(400).json({
                error: true,
                message: 'Invalid input: user_id must be an integer, email_id and charger_id must be strings.',
            });
        }

        if (!db) {
            logger.loggerError('Database connection failed.');
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }

        const chargersCollection = db.collection("charger_details");
        const socketGunConfigCollection = db.collection("socket_gun_config");
        const chargerStatusCollection = db.collection("charger_status");

        // Fetch the specific charger
        const charger = await chargersCollection.findOne(
            { charger_id: charger_id },
            {
                projection: {
                    _id: 0,
                    charger_id: 1,
                    model: 1,
                    type: 1,
                    vendor: 1,
                    charger_model: 1,
                    charger_type: 1,
                    gun_connector: 1,
                    max_current: 1,
                    max_power: 1,
                    socket_count: 1,
                    lat: 1,
                    long: 1,
                    finance_id: 1,
                    status: 1,
                    address: 1,
                    landmark: 1
                }
            }
        );

        if (!charger) {
            return res.status(404).json({
                error: true,
                message: 'Charger not found with the given charger_id.',
            });
        }

        // Fetch socket & gun configuration
        const config = await socketGunConfigCollection.findOne({ charger_id: charger_id }) || {};

        // Fetch charger statuses
        const chargerStatuses = await chargerStatusCollection.find(
            { charger_id: charger_id },
            { projection: { _id: 0, charger_id: 1, connector_id: 1, charger_status: 1 } }
        ).toArray();

        // Construct connectors dynamically
        const connectors = Object.keys(config)
            .filter(key => /^connector_\d+_type$/.test(key))
            .map(key => {
                const connectorIndex = key.match(/\d+/)[0];

                const matchingStatus = chargerStatuses.find(
                    status => status.connector_id === parseInt(connectorIndex)
                );

                return {
                    connector_id: parseInt(connectorIndex),
                    connector_type: config[key] || null,
                    connector_type_name: config[`connector_${connectorIndex}_type_name`] || null,
                    charger_status: matchingStatus ? matchingStatus.charger_status : " - "
                };
            });

        // Merge into charger response
        const chargerWithConnectors = {
            ...charger,
            connectors
        };

        logger.loggerSuccess(`Successfully retrieved charger details for charger_id: ${charger_id}`);
        return res.status(200).json({
            error: false,
            message: 'Charger details retrieved successfully.',
            charger: chargerWithConnectors
        });

    } catch (error) {
        logger.loggerError(`Error in SearchSpecificChargerDetails: ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error_details: error.message
        });
    }
};



module.exports = {
    // GET SPECIFIC STATION'S CHARGER DETAILS WITH CONNECTORS
    SearchSpecificChargerDetails
};




