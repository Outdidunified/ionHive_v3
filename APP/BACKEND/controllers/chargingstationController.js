const db_conn = require('../config/db');
const logger = require('../utils/logger');
const { wsConnections } = require('../data/MapModules');

let db;
const initializeDB = async () => {
    if (!db) {
        db = await db_conn.connectToDatabase();
    }
    return db;
};
initializeDB(); // Initialize the DB connection once

// STATIONS
// SAVE STATIONS
// Save, Remove and Fetch Stations
const SaveStations = async (req, res) => {
    try {
        const { user_id, email_id, station_id, status } = req.body;

        // Validate request body
        if (!user_id || !email_id || !station_id || status === undefined) {
            return res.status(400).json({
                error: true,
                message: 'Missing required fields: user_id, email_id, station_id, or status',
            });
        }

        if (!db) {
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }

        const usersCollection = db.collection('users');
        const stationsCollection = db.collection('charging_stations');

        // Find user by user_id and email_id
        const user = await usersCollection.findOne({ user_id, email_id });

        if (!user) {
            return res.status(404).json({
                error: true,
                message: 'User not found',
            });
        }

        // Find the station in the database
        const station = await stationsCollection.findOne({ station_id: Number(station_id) });

        if (!station) {
            return res.status(404).json({
                error: true,
                message: 'Station not found',
            });
        }

        // Initialize favorite stations array if it doesn't exist
        let updatedFavStations = user.favStations || [];

        // Check if station already exists in favStations
        const index = updatedFavStations.findIndex(favStation =>
            favStation.station_id === station_id ||
            (favStation.station_id === Number(station_id))
        );

        if (index !== -1) {
            if (status === false) {
                // Remove station if status is false
                logger.loggerSuccess(`Removing favorite station ${station_id} for user ${user_id}`);
                updatedFavStations.splice(index, 1);
            } else {
                // Update status if station exists
                logger.loggerSuccess(`Updating favorite station ${station_id} status for user ${user_id}`);
                updatedFavStations[index].status = status;
            }
        } else if (status === true) {
            // Add new station if it does not exist
            logger.loggerSuccess(`Adding new favorite station ${station_id} for user ${user_id}`);

            // Only save station_id and location_id with status
            const stationToSave = {
                station_id: station.station_id,
                location_id: station.location_id,
                status: true
            };

            updatedFavStations.push(stationToSave);
        }

        // Update the user's favorite stations array
        const updateResult = await usersCollection.updateOne(
            { user_id, email_id },
            { $set: { favStations: updatedFavStations } }
        );

        if (updateResult.modifiedCount === 0) {
            logger.loggerWarn(`No changes made to favorite stations for user ${user_id}`);
            return res.status(200).json({
                error: false,
                message: 'No changes made to favorite stations',
                updatedFavStations,
            });
        }

        logger.loggerSuccess(`Favorite stations updated successfully for user ${user_id}`);

        return res.status(200).json({
            error: false,
            message: status ? 'Favorite station updated successfully' : 'Favorite station removed successfully',
            updatedFavStations,
        });

    } catch (error) {
        logger.loggerError(`Error updating favorite station for user_id=${req.body.user_id}, email_id=${req.body.email_id}: ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};
// fetch Stations 
const fetchSavedStations = async (req, res) => {
    try {
        const { user_id, email_id } = req.body;

        // Validate request parameters
        if (!user_id || isNaN(user_id) || !email_id || typeof email_id !== 'string' || email_id.trim() === '') {
            return res.status(400).json({
                error: true,
                message: 'Invalid input: user_id must be a valid number and email_id must be a non-empty string',
            });
        }

        if (!db) {
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }

        const usersCollection = db.collection("users");
        const stationsCollection = db.collection("charging_stations");

        // Find user and retrieve favorite stations
        const user = await usersCollection.findOne(
            { user_id, email_id },
            { projection: { favStations: 1, _id: 0 } }
        );

        if (!user) {
            return res.status(404).json({
                error: true,
                message: "User not found",
            });
        }

        // If no favorite stations, return empty array
        if (!user.favStations || user.favStations.length === 0) {
            logger.loggerInfo(`No favorite stations found for user: ${user_id}`);
            return res.status(200).json({
                error: false,
                message: "No favorite stations found",
                favStations: [],
            });
        }

        // Get the complete station data for each favorite station
        const completeStationDetails = await Promise.all(
            user.favStations.map(async (favStation) => {
                try {
                    if (!favStation || typeof favStation !== 'object') {
                        logger.loggerWarn(`Invalid favorite station data for user ${user_id}`);
                        return null;
                    }

                    // Convert station_id to number if it's not already
                    const stationId = typeof favStation.station_id === 'number'
                        ? favStation.station_id
                        : Number(favStation.station_id);

                    // Fetch complete station details from the database
                    const stationData = await stationsCollection.findOne(
                        { station_id: stationId },
                        { projection: { _id: 0 } }
                    );

                    // If station no longer exists in the database
                    if (!stationData) {
                        logger.loggerWarn(`Station ${stationId} not found in database, using minimal saved data`);
                        return {
                            station_id: stationId,
                            location_id: favStation.location_id,
                            status: favStation.status,
                            missing_data: true
                        };
                    }

                    // Return complete station data with favorite status
                    return {
                        ...stationData,
                        status: favStation.status // Keep the favorite status
                    };
                } catch (error) {
                    logger.loggerError(`Error fetching data for station ${favStation.station_id}: ${error.message}`);
                    return {
                        station_id: favStation.station_id,
                        location_id: favStation.location_id,
                        status: favStation.status,
                        error: true
                    };
                }
            })
        );

        // Filter out any null values
        const filteredStationDetails = completeStationDetails.filter(station => station !== null);

        logger.loggerSuccess(`Favorite stations retrieved successfully for user: ${user_id}`);

        return res.status(200).json({
            error: false,
            message: "Favorite stations retrieved successfully",
            favStations: filteredStationDetails,
        });

    } catch (error) {
        logger.loggerError(`Error fetching favorite stations for user_id=${req.body?.user_id}, email_id=${req.body?.email_id}: ${error.message}`);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
// Remove Station
const RemoveStation = async (req, res) => {
    try {
        const { user_id, email_id, station_id } = req.body;

        // Validate request body
        if (!user_id || !email_id || !station_id) {
            return res.status(400).json({
                error: true,
                message: 'Missing required fields: user_id, email_id, or station_id',
            });
        }

        if (!db) {
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }

        const usersCollection = db.collection('users');

        // Find user by user_id and email_id
        const user = await usersCollection.findOne({ user_id, email_id });

        if (!user) {
            return res.status(404).json({
                error: true,
                message: 'User not found',
            });
        }

        // Check if user has any favorite stations
        if (!user.favStations || user.favStations.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'No favorite stations found for this user',
            });
        }

        // Convert station_id to number for consistent comparison
        const stationIdNum = typeof station_id === 'number' ? station_id : Number(station_id);

        // Find the station in the user's favorites
        const index = user.favStations.findIndex(station =>
            typeof station === 'object' &&
            (station.station_id === station_id || station.station_id === stationIdNum)
        );

        if (index === -1) {
            return res.status(404).json({
                error: true,
                message: 'Station not found in user favorites',
            });
        }

        // Remove the station from favorites
        const updatedFavStations = [...user.favStations];
        updatedFavStations.splice(index, 1);

        // Update the user's favorite stations array
        const updateResult = await usersCollection.updateOne(
            { user_id, email_id },
            { $set: { favStations: updatedFavStations } }
        );

        if (updateResult.modifiedCount === 0) {
            logger.loggerWarn(`No changes made to favorite stations for user ${user_id}`);
            return res.status(200).json({
                error: false,
                message: 'No changes made to favorite stations',
                updatedFavStations,
            });
        }

        logger.loggerSuccess(`Station ${station_id} removed from favorites for user ${user_id}`);

        return res.status(200).json({
            error: false,
            message: 'Station removed from favorites successfully',
            updatedFavStations,
        });

    } catch (error) {
        logger.loggerError(`Error removing station for user_id=${req.body.user_id}, email_id=${req.body.email_id}: ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};
// GET SPECIFIC STATION'S CHARGER DETAILS WITH CONNECTORS
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
            logger.loggerError('Database connection failed.');
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

        logger.loggerSuccess(`Successfully retrieved charger details for station_id: ${station_id}`);
        return res.status(200).json({
            error: false,
            message: 'Charger details retrieved successfully.',
            chargers: chargersWithConfig
        });

    } catch (error) {
        logger.loggerError(`Error in getSpecificStationsChargerDetailsWithConnector: ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error_details: error.message
        });
    }
};

// MANAGE CHARGING SESSION FOR USER
// Update Connector User
const updateConnectorUser = async (req, res) => {
    try {
        const { charger_id, email_id, user_id, connector_id } = req.body;

        if (!db) {
            logger.loggerError('Database connection failed.');
            return res.status(500).json({
                message: 'Database connection failed. Please try again later.'
            });
        }

        const evDetailsCollection = db.collection('charger_details');
        const usersCollection = db.collection('users');
        const socketGunConfigCollection = db.collection('socket_gun_config');
        const chargerStatusCollection = db.collection('charger_status');
        // const financeDetailsCollection = db.collection('finance_details');
        const financeDetailsCollection = db.collection('financeDetails');

        const chargerDetails = await evDetailsCollection.findOne({ charger_id: charger_id, status: true });
        const socketGunConfig = await socketGunConfigCollection.findOne({ charger_id: charger_id });


        const connectorField = `current_or_active_user_for_connector_${connector_id}`;
        if (!chargerDetails.hasOwnProperty(connectorField)) {
            const errorMessage = 'Invalid connector ID!';
            return res.status(400).json({ message: errorMessage });
        }

        if (chargerDetails[connectorField] && email_id !== chargerDetails[connectorField]) {
            const errorMessage = 'Connector is already in use!';
            return res.status(400).json({ message: errorMessage });
        }

        const userRecord = await usersCollection.findOne({ user_id: user_id });



        const walletBalance = userRecord.wallet_bal;
        const minBal = 2;
        if (walletBalance === undefined || isNaN(walletBalance) || walletBalance < minBal) {
            const errorMessage = `Your wallet balance is not enough to charge (minimum ${minBal} Rs required)`;
            return res.status(400).json({ message: errorMessage });
        }


        // Update the user field in the chargerDetails
        let currect_user = {};
        currect_user[connectorField] = email_id;

        const connectorIdTypeField = `connector_${connector_id}_type`;
        const connectorTypeValue = socketGunConfig[connectorIdTypeField];
        if (connectorTypeValue === 1) { // Assuming 1 stands for 'socket'
            const fetchChargerStatus = await chargerStatusCollection.findOne({ charger_id: charger_id, connector_id: connector_id, connector_type: 1 });

            if (fetchChargerStatus && fetchChargerStatus.charger_status !== 'Charging' && fetchChargerStatus.charger_status !== 'Preparing') {

                const result = await sendPreparingStatus(wsConnections, charger_id, connector_id);

                if (!result) {
                    const errorMessage = 'Device not connected to the server';
                    return res.status(500).json({ message: errorMessage });
                }
            }
        }

        const updateResult = await evDetailsCollection.updateOne(
            { charger_id: charger_id },
            { $set: currect_user }
        );

        if (updateResult.modifiedCount !== 1) {
            logger.loggerWarn('Failed to update current_or_active username for the connector');
        }


        const financeRecord = await financeDetailsCollection.findOne({ finance_id: chargerDetails.finance_id });

        if (!financeRecord) {
            throw new Error(`Finance details for finance_id ${chargerDetails.finance_id} not found.`);
        }


        const EB_fee = parseFloat(financeRecord.eb_charge) + parseFloat(financeRecord.margin);

        // List of additional charges (excluding GST)
        const additionalCharges = [
            parseFloat(financeRecord.parking_fee),     // Parking fee
            parseFloat(financeRecord.convenience_fee), // Convenience fee
            parseFloat(financeRecord.station_fee),     // Station fee
            parseFloat(financeRecord.processing_fee),  // Processing fee
            parseFloat(financeRecord.service_fee)      // Service fee
        ];

        // Calculate total additional charges (sum of all charges except GST)
        const totalAdditionalCharges = additionalCharges.reduce((sum, charge) => sum + (charge || 0), 0);

        // Calculate the base price (including additional charges per unit)
        const TotalEBPrice = (EB_fee + totalAdditionalCharges);

        // Apply GST on the total amount
        const gstPercentage = financeRecord.gst;
        const gstAmount = (TotalEBPrice * gstPercentage) / 100;

        // Final price after adding GST
        const totalPrice = TotalEBPrice + gstAmount;

        // Respond with the charger details
        res.status(200).json({ message: 'Success', unitPrice: totalPrice.toFixed(2) });

    } catch (error) {
        logger.loggerError('Error updating connector user:', error);
        const errorMessage = 'Internal Server Error';
        return res.status(500).json({ message: errorMessage });
    }
};

// Helper function to send preparing status
async function sendPreparingStatus(wsConnections, charger_id, connector_id) {
    try {
        const wsToSendTo = wsConnections.get(charger_id);

        if (!wsToSendTo) {
            logger.loggerWarn(`WebSocket client not found for charger ID: ${charger_id}`);
            return false;
        }

        // Send a message to prepare the connector
        const preparingMessage = {
            type: 'preparing',
            connectorId: Number(connector_id)
        };

        wsToSendTo.send(JSON.stringify(preparingMessage));
        logger.loggerInfo(`Preparing message sent for charger ID: ${charger_id}, connector ID: ${connector_id}`);

        return true;
    } catch (error) {
        logger.loggerError(`Error sending preparing status: ${error.message}`);
        return false;
    }
}

module.exports = {
    // SAVE STATIONS
    SaveStations,
    fetchSavedStations,
    RemoveStation,
    // GET SPECIFIC STATION'S CHARGER DETAILS WITH CONNECTORS
    getSpecificStationsChargerDetailsWithConnector,
    // MANAGE CHARGING SESSION FOR USER
    updateConnectorUser
};




