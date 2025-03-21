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



// STATIONS
// Fetch the specific station's charger details with connectors
const getSpecificStationsChargerDetailsWithConnector = async (req, res) => {
    try {
        const { user_id, email_id, station_id, location_id } = req.body;


        // Validate input
        if (!user_id || !email_id || !station_id || !location_id) {
            return res.status(400).json({
                error: true,
                message: 'Missing required fields: user_id, email_id, station_id, and location_id are required.',
            });
        }

        if (!Number.isInteger(Number(user_id)) || typeof email_id !== 'string' ||
            !Number.isInteger(Number(station_id)) || typeof location_id !== 'string') {
            return res.status(400).json({
                error: true,
                message: 'Invalid input: user_id and station_id must be integers, email_id must be a string, and location_id must be a string.',
            });
        }

        if (!db) {
            logger.error('Database connection failed.');
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }

        const stationsCollection = db.collection("charging_stations");
        const chargersCollection = db.collection("charger_details");
        const socketGunConfigCollection = db.collection("socket_gun_config");
        const chargerStatusCollection = db.collection("charger_status");

        // Fetch station's chargers
        const station = await stationsCollection.findOne(
            { station_id: Number(station_id), location_id: location_id },
            { projection: { _id: 0, chargers: 1 } }
        );

        if (!station || !station.chargers || station.chargers.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'No chargers found for this station.',
            });
        }

        // Fetch charger details
        const chargerDetails = await chargersCollection.find(
            { charger_id: { $in: station.chargers } }
        ).project({
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
        }).toArray();

        // Fetch socket & gun configurations dynamically
        const chargerIds = chargerDetails.map(charger => charger.charger_id);
        const socketGunConfigs = await socketGunConfigCollection.find(
            { charger_id: { $in: chargerIds } }
        ).toArray();

        // Fetch charger statuses
        const chargerStatuses = await chargerStatusCollection.find(
            { charger_id: { $in: chargerIds } },
            { projection: { _id: 0, charger_id: 1, connector_id: 1, charger_status: 1 } }
        ).toArray();

        // Process charger configurations dynamically
        const chargersWithConfig = chargerDetails.map(charger => {
            const config = socketGunConfigs.find(cfg => cfg.charger_id === charger.charger_id) || {};

            // Extract all connector types dynamically
            const connectors = Object.keys(config)
                .filter(key => /^connector_\d+_type$/.test(key))
                .map((key, index) => {
                    const connectorIndex = key.match(/\d+/)[0];

                    // Find matching status from charger_status collection
                    const matchingStatus = chargerStatuses.find(
                        status => status.charger_id === charger.charger_id && status.connector_id === parseInt(connectorIndex)
                    );

                    return {
                        connector_id: parseInt(connectorIndex),
                        connector_type: config[key] || null,
                        connector_type_name: config[`connector_${connectorIndex}_type_name`] || null,
                        charger_status: matchingStatus ? matchingStatus.charger_status : " - " // Assign status if found
                    };
                });

            return {
                ...charger,
                connectors
            };
        });

        logger.info(`Successfully retrieved charger details for station_id: ${station_id}`);
        return res.status(200).json({
            error: false,
            message: 'Charger details retrieved successfully.',
            chargers: chargersWithConfig
        });

    } catch (error) {
        logger.error(`Error in getSpecificStationsChargerDetailsWithConnector: ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error_details: error.message
        });
    }
};


module.exports = {
    // STATIONS
    getSpecificStationsChargerDetailsWithConnector
};




