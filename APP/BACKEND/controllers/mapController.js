const db_conn = require('../config/db');
const logger = require('../utils/logger');
const dbService = require('../Websocket/services/dbService');

let db;
const initializeDB = async () => {
    if (!db) {
        db = await db_conn.connectToDatabase();
    }
    return db;
};
initializeDB(); // Initialize the DB connection once

const EARTH_RADIUS_KM = 6371;
const RADIUS_KM = 100;

// MANAGE GENERIC FILTER  //TODO - 1
// Saved Filter
const SaveSearchFilter = async (req, res) => {
    try {
        const { user_id, email_id, vehicleType, charger_type, connectorType, availability, chargers, accessType, amenities } = req.body;

        // Validate user_id and email_id
        if (!user_id || !email_id ||
            !Number.isInteger(Number(user_id)) || typeof email_id !== 'string') {
            return res.status(400).json({
                error: true,
                message: 'Invalid input: user_id must be an integer, email_id must be a string.',
            });
        }

        if (!db) {
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

        // Build the update object only with provided fields
        let updateFields = {};

        if (vehicleType !== undefined) updateFields.vehicleType = vehicleType;
        if (connectorType !== undefined) updateFields.connectorType = connectorType;
        if (availability !== undefined) updateFields.availability = availability;
        if (chargers !== undefined) updateFields.chargers = chargers;
        if (accessType !== undefined) updateFields.accessType = accessType;
        if (amenities !== undefined) updateFields.amenities = amenities;
        if (charger_type !== undefined) updateFields.charger_type = charger_type;


        if (Object.keys(updateFields).length === 0) {
            return res.status(200).json({
                error: false,
                message: 'No valid search filters provided.',
            });
        }

        // Update the user's search filters without affecting missing fields
        const updateResult = await usersCollection.updateOne(
            { user_id: user_id, email_id },
            { $set: { SearchFilter: updateFields } }
        );

        if (updateResult.modifiedCount === 0) {
            logger.loggerWarn(`Failed to update search filters for user ${user_id} with email ${email_id}.`);
            return res.status(200).json({
                error: false,
                message: 'Failed to update search filters. (no changes found)',
            });
        }

        logger.loggerSuccess(`Search filters updated successfully for user ${user_id} with email ${email_id}.`);
        return res.status(200).json({
            error: false,
            message: 'Search filters updated successfully',
            SearchFilter: updateFields,
            Charging_points: "Want to implement"
        });

    } catch (error) {
        logger.loggerError(`SaveSearchFilter - ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
        });
    }
};
// Fetch Saved Filter //TODO - on hold until doing Stations it cant be  done
const fetchSavedSearchFilter = async (req, res) => {
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
        const usersCollection = db.collection('users');
        const chargerDetailsCollection = db.collection('charger_details');
        const chargerStatusCollection = db.collection('charger_status');
        const financeDetailsCollection = db.collection('financeDetails');

        // Find user and retrieve favorite chargers
        const user = await usersCollection.findOne(
            { user_id: Number(user_id), email_id },
            { projection: { favChargers: 1, _id: 0 } }
        );

        if (!user?.favChargers?.length) {
            return res.status(200).json({
                error: false,
                message: 'No favorite chargers found for this user',
                favChargers: []
            });
        }

        // Extract charger IDs
        const favChargerIds = user.favChargers
            .filter(item => typeof item === "object" && item.charger_id)
            .map(item => String(item.charger_id));


        // Fetch charger details
        const favChargers = await chargerDetailsCollection.find({
            charger_id: { $in: favChargerIds },
            status: true
        }).toArray();

        // Fetch detailed charger info
        const detailedFavChargers = await Promise.all(favChargers.map(async (charger) => {
            const chargerId = charger.charger_id;
            const status = await chargerStatusCollection.findOne({ charger_id: chargerId });

            let unitPrice = null;
            if (charger.finance_id) {
                const financeRecord = await financeDetailsCollection.findOne({ finance_id: charger.finance_id });

                if (financeRecord) {
                    const pricePerUnit = await dbService.getPricePerUnit(chargerId);

                    unitPrice = pricePerUnit;
                }
            }

            return { ...charger, status: status || null, unit_price: unitPrice };
        }));

        logger.loggerSuccess('Successfully fetched favorite chargers', { user_id, count: detailedFavChargers.length });

        return res.status(200).json({
            error: false,
            message: 'Favorite chargers retrieved successfully',
            favChargers: user.favChargers,
            favChargersDetails: detailedFavChargers
        });

    } catch (error) {
        logger.loggerError('Error fetching favorite chargers', { error: error.message });
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};


// STATIONS
// Function to find nearby stations
// Function to find nearby stations
const getNearbyStations = async (req, res) => {
    try {
        const { latitude, longitude, user_id, email_id } = req.body;

        if (!latitude || !longitude || !user_id || !email_id) {
            return res.status(400).json({
                error: true,
                message: "Latitude, Longitude, User ID, and Email are required",
            });
        }

        if (!db) {
            logger.loggerError("Database connection failed");
            return res.status(500).json({
                error: true,
                message: "Database connection failed. Please try again later.",
            });
        }

        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const stationsCollection = db.collection("charging_stations");
        const usersCollection = db.collection("users");

        // Step 1: Fetch the user's saved stations (favStations)
        const user = await usersCollection.findOne({ user_id: user_id, email_id: email_id });
        if (!user) {
            return res.status(404).json({
                error: true,
                message: "User not found",
            });
        }

        const favStations = user.favStations || [];
        const savedStationIds = favStations
            .filter(station => station.status === true) // Only include stations with status: true
            .map(station => station.station_id);

        // Constants for distance calculation
        const EARTH_RADIUS_KM = 6371; // Radius of Earth in KM
        const PI = Math.PI;
        const DEG_TO_RAD = PI / 180;

        const userLatRad = lat * DEG_TO_RAD;
        const userLonRad = lon * DEG_TO_RAD;

        // Step 2: Fetch nearby stations
        const nearbyStations = await stationsCollection.aggregate([
            {
                $addFields: {
                    latRad: { $multiply: ["$latitude", DEG_TO_RAD] },
                    lonRad: { $multiply: ["$longitude", DEG_TO_RAD] },
                }
            },
            {
                $addFields: {
                    dLat: { $subtract: ["$latRad", userLatRad] },
                    dLon: { $subtract: ["$lonRad", userLonRad] }
                }
            },
            {
                $addFields: {
                    a: {
                        $add: [
                            { $pow: [{ $sin: { $divide: ["$dLat", 2] } }, 2] },
                            {
                                $multiply: [
                                    { $cos: userLatRad },
                                    { $cos: "$latRad" },
                                    { $pow: [{ $sin: { $divide: ["$dLon", 2] } }, 2] }
                                ]
                            }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    distance: {
                        $round: [
                            {
                                $multiply: [
                                    2,
                                    EARTH_RADIUS_KM,
                                    { $atan2: [{ $sqrt: "$a" }, { $sqrt: { $subtract: [1, "$a"] } }] }
                                ]
                            },
                            2
                        ]
                    }
                }
            },
            { $match: { distance: { $lte: 100 } } }, // RADIUS_KM can be replaced here
            {
                $lookup: {
                    from: "charger_details",
                    localField: "chargers",
                    foreignField: "charger_id",
                    as: "charger_details"
                }
            },
            {
                $project: {
                    _id: 0,
                    station_id: 1,
                    location_id: 1,
                    station_address: 1,
                    landmark: 1,
                    network: 1,
                    availability: 1,
                    accessibility: 1,
                    latitude: 1,
                    longitude: 1,
                    charger_type: 1,
                    distance: 1,
                    charger_details: {
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
            },
            { $sort: { distance: 1 } }
        ]).toArray();

        // Step 3: Add saved_station field to each nearby station
        const updatedStations = nearbyStations.map(station => {
            const isSaved = savedStationIds.includes(station.station_id);
            return {
                ...station,
                saved_station: isSaved // Add saved_station key with true/false
            };
        });

        logger.loggerSuccess(`Found ${updatedStations.length} nearby stations & retrieved successfully`);

        return res.status(200).json({
            error: false,
            message: "Nearby charging stations retrieved successfully",
            stations: updatedStations
        });

    } catch (error) {
        logger.loggerError(`Error fetching nearby stations: ${error.message}`);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
            error_details: error.message
        });
    }
};

// MANAGE ACTIVE CHARGER'S OF SPECIFIC USER
// Fetch active charging sessions of a user
const fetchActiveChargersOfUser = async (req, res) => {
    try {
        const { email_id } = req.body;

        if (!db) {
            logger.loggerError('Database connection failed.');
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.'
            });
        }

        const userDetailsCollection = db.collection('users');
        const chargerDetailsCollection = db.collection('charger_details');
        const chargerStatusCollection = db.collection('charger_status');
        const financeDetailsCollection = db.collection('financeDetails');

        // Fetch user details
        const user = await userDetailsCollection.findOne({ email_id: email_id });
        if (!user) {
            logger.loggerWarn(`User not found with email: ${email_id}`);
            return res.status(404).json({
                error: true,
                message: 'User not found'
            });
        }

        // Fetch all chargers with active status
        const allChargers = await chargerDetailsCollection.find({ status: true }).toArray();

        // Filter chargers where the user is an active connector
        const userActiveChargers = allChargers.filter(charger =>
            Object.keys(charger).some(key =>
                key.startsWith("current_or_active_user_for_connector_") && charger[key] === email_id
            )
        );

        // If no active chargers are found, return an error response
        if (userActiveChargers.length === 0) {
            logger.loggerInfo(`No active charging found for user: ${email_id}`);
            return res.status(200).json({
                error: false,
                message: 'No active charging found!',
                data: []
            });
        }

        // Fetch additional details for active chargers
        const activeChargers = await Promise.all(userActiveChargers.flatMap(async (charger) => {
            const chargerId = charger.charger_id;
            const financeId = charger.finance_id;

            // Find all connector IDs used by the user
            const connectorIds = Object.keys(charger)
                .filter(key => key.startsWith("current_or_active_user_for_connector_") && charger[key] === email_id)
                .map(key => key.split("_").pop()); // Extract connector numbers

            // Fetch charger status and prepare response for each connector ID
            return Promise.all(connectorIds.map(async (connectorId) => {
                // Fetch charger status
                const status = await chargerStatusCollection.findOne({
                    charger_id: chargerId,
                    connector_id: parseInt(connectorId)
                });

                // Calculate unit price
                let unitPrice = null;
                if (financeId) {
                    const financeRecord = await financeDetailsCollection.findOne({ finance_id: financeId });
                    if (financeRecord) {
                        const pricePerUnit = await dbService.getPricePerUnit(chargerId);
                        // Final price after adding GST
                        unitPrice = pricePerUnit;
                    }
                }

                return {
                    charger_id: chargerId,
                    connector_id: connectorId, // Include all connectors used by the user
                    model: charger.model,
                    type: charger.type,
                    vendor: charger.vendor,
                    lat: charger.lat,
                    long: charger.long,
                    address: charger.address,
                    landmark: charger.landmark,
                    unit_price: parseFloat(unitPrice || 0).toFixed(2),
                    status: status || null
                };
            }));
        }));

        // Flatten the nested array
        const flattenedChargers = activeChargers.flat();

        logger.loggerSuccess(`Successfully fetched ${flattenedChargers.length} active chargers for user: ${email_id}`);
        return res.status(200).json({
            error: false,
            message: 'Active chargers retrieved successfully',
            data: flattenedChargers
        });
    } catch (error) {
        logger.loggerError(`Error in fetchActiveChargersOfUser: ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error_details: error.message
        });
    }
};

module.exports = {
    // MANAGE GENERIC FILTER 
    SaveSearchFilter,
    fetchSavedSearchFilter,
    // STATIONS
    getNearbyStations,
    // MANAGE ACTIVE CHARGER'S OF SPECIFIC USER
    fetchActiveChargersOfUser
};




