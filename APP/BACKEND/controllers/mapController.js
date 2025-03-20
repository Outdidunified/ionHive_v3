const db_conn = require('../config/db');
const logger = require('../utils/logger');
let db;
const initializeDB = async () => {
    if (!db) {
        db = await db_conn.connectToDatabase();
    }
};
initializeDB(); // Initialize the DB connection once


const EARTH_RADIUS = 6371; // Earth radius in KM
const RADIUS_KM = 80; // Search radius


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
            logger.warn(`Failed to update search filters for user ${user_id} with email ${email_id}.`);
            return res.status(200).json({
                error: false,
                message: 'Failed to update search filters. (no changes found)',
            });
        }

        logger.info(`Search filters updated successfully for user ${user_id} with email ${email_id}.`);
        return res.status(200).json({
            error: false,
            message: 'Search filters updated successfully',
            SearchFilter: updateFields,
            Charging_points: "Want to implement"
        });

    } catch (error) {
        logger.error(`SaveSearchFilter - ${error.message}`);
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
        const financeDetailsCollection = db.collection('finance_details');

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
                    const totalPercentage = [
                        financeRecord.app_charges,
                        financeRecord.other_charges,
                        financeRecord.parking_charges,
                        financeRecord.rent_charges,
                        financeRecord.open_a_eb_charges,
                        financeRecord.open_other_charges
                    ].reduce((sum, charge) => sum + parseFloat(charge || 0), 0);

                    const pricePerUnit = parseFloat(financeRecord.eb_charges || 0);
                    unitPrice = (pricePerUnit + (pricePerUnit * totalPercentage / 100)).toFixed(2);
                }
            }

            return { ...charger, status: status || null, unit_price: unitPrice };
        }));

        logger.info('Successfully fetched favorite chargers', { user_id, count: detailedFavChargers.length });

        return res.status(200).json({
            error: false,
            message: 'Favorite chargers retrieved successfully',
            favChargers: user.favChargers,
            favChargersDetails: detailedFavChargers
        });

    } catch (error) {
        logger.error('Error fetching favorite chargers', { error: error.message });
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};


// STATIONS

// Function to find nearby stations

const getNearbyStations = async (req, res) => {
    try {
        const { latitude, longitude, user_id, email_id } = req.body;


        // Validate required parameters
        if (!latitude || !longitude || !user_id || !email_id) {
            return res.status(400).json({
                error: true,
                message: "Latitude, Longitude, User ID, and Email are required",
            });
        }

        // Ensure database connection exists
        if (!db) {
            logger.error("Database connection failed");
            return res.status(500).json({
                error: true,
                message: "Database connection failed. Please try again later.",
            });
        }


        const stationsCollection = db.collection("charging_stations");

        // Fetch nearby stations using aggregation
        const nearbyStations = await stationsCollection.aggregate([
            {
                $addFields: {
                    latitudeRadians: { $multiply: ["$latitude", Math.PI / 180] },
                    longitudeRadians: { $multiply: ["$longitude", Math.PI / 180] },
                    userLatitudeRadians: { $multiply: [latitude, Math.PI / 180] },
                    userLongitudeRadians: { $multiply: [longitude, Math.PI / 180] }
                }
            },
            {
                $addFields: {
                    distance: {
                        $multiply: [
                            EARTH_RADIUS,
                            {
                                $acos: {
                                    $add: [
                                        {
                                            $multiply: [
                                                { $sin: "$latitudeRadians" },
                                                { $sin: "$userLatitudeRadians" }
                                            ]
                                        },
                                        {
                                            $multiply: [
                                                { $cos: "$latitudeRadians" },
                                                { $cos: "$userLatitudeRadians" },
                                                { $cos: { $subtract: ["$longitudeRadians", "$userLongitudeRadians"] } }
                                            ]
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            },
            { $match: { distance: { $lte: RADIUS_KM } } }, // Filter stations within radius
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
                    // chargers: 1,
                    distance: 1, // Include calculated distance
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
                    } // Include only necessary charger details
                }
            },
            { $sort: { distance: 1 } } // Sort nearest first
        ]).toArray();

        logger.info(`Found ${nearbyStations.length} nearby stations`);

        return res.status(200).json({
            error: false,
            message: "Nearby charging stations retrieved successfully",
            stations: nearbyStations
        });

    } catch (error) {
        logger.error(`Error fetching nearby stations: ${error.message}`);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
            error_details: error.message
        });
    }
};

// const getNearbyStations = async (req, res) => {
//     try {
//         const { latitude, longitude, user_id, email_id } = req.body;

//         logger.info(`Received request for nearby stations - User: ${user_id}, Email: ${email_id}`);

//         if (!latitude || !longitude || !user_id || !email_id) {
//             logger.warn("Missing required parameters in request body");
//             return res.status(400).json({
//                 error: true,
//                 message: "Latitude, Longitude, User ID, and Email are required",
//             });
//         }

//         if (!db) {
//             logger.error("Database connection failed");
//             return res.status(500).json({
//                 error: true,
//                 message: "Database connection failed. Please try again later.",
//             });
//         }

//         logger.info("Database connection successful. Fetching nearby stations...");

//         const stationsCollection = db.collection("charging_stations");
//         const nearbyStations = await stationsCollection.aggregate([
//             {
//                 $addFields: {
//                     latitudeRadians: { $multiply: ["$latitude", Math.PI / 180] },
//                     longitudeRadians: { $multiply: ["$longitude", Math.PI / 180] },
//                     userLatitudeRadians: { $multiply: [latitude, Math.PI / 180] },
//                     userLongitudeRadians: { $multiply: [longitude, Math.PI / 180] }
//                 }
//             },
//             {
//                 $addFields: {
//                     distance: {
//                         $multiply: [
//                             EARTH_RADIUS,
//                             {
//                                 $acos: {
//                                     $add: [
//                                         {
//                                             $multiply: [
//                                                 { $sin: "$latitudeRadians" },
//                                                 { $sin: "$userLatitudeRadians" }
//                                             ]
//                                         },
//                                         {
//                                             $multiply: [
//                                                 { $cos: "$latitudeRadians" },
//                                                 { $cos: "$userLatitudeRadians" },
//                                                 { $cos: { $subtract: ["$longitudeRadians", "$userLongitudeRadians"] } }
//                                             ]
//                                         }
//                                     ]
//                                 }
//                             }
//                         ]
//                     }
//                 }
//             },
//             { $match: { distance: { $lte: RADIUS_KM } } }, // Filter within radius
//             {
//                 $lookup: {
//                     from: "charger_details",
//                     localField: "chargers",
//                     foreignField: "charger_id",
//                     as: "charger_details"
//                 }
//             },
//             { $unwind: { path: "$charger_details", preserveNullAndEmptyArrays: true } },
//             {
//                 $lookup: {
//                     from: "socket_gun_config",
//                     localField: "charger_details.charger_id",
//                     foreignField: "charger_id",
//                     as: "socket_gun_config" // Ensure it matches in $map
//                 }
//             },
//             { $unwind: { path: "$socket_gun_config", preserveNullAndEmptyArrays: true } },
//             {
//                 $group: {
//                     _id: "$station_id",
//                     station_id: { $first: "$station_id" },
//                     location_id: { $first: "$location_id" },
//                     station_address: { $first: "$station_address" },
//                     landmark: { $first: "$landmark" },
//                     network: { $first: "$network" },
//                     availability: { $first: "$availability" },
//                     accessibility: { $first: "$accessibility" },
//                     latitude: { $first: "$latitude" },
//                     longitude: { $first: "$longitude" },
//                     charger_type: { $first: "$charger_type" },
//                     chargers: { $first: "$chargers" },
//                     distance: { $first: "$distance" },
//                     charger_details: {
//                         $push: {
//                             charger_id: "$charger_details.charger_id",
//                             model: "$charger_details.model",
//                             type: "$charger_details.type",
//                             vendor: "$charger_details.vendor",
//                             charger_model: "$charger_details.charger_model",
//                             charger_type: "$charger_details.charger_type",
//                             status: "$charger_details.status",
//                             address: "$charger_details.address",
//                             landmark: "$charger_details.landmark",
//                             socket_gun_config: {
//                                 $arrayToObject: {
//                                     $map: {
//                                         input: { $ifNull: ["$socket_gun_config", []] }, // Ensure it's an array
//                                         as: "config",
//                                         in: [
//                                             {
//                                                 k: { $concat: ["connector_", { $toString: "$$config.connector_id" }, "_type"] },
//                                                 v: "$$config.connector_type"
//                                             },
//                                             {
//                                                 k: { $concat: ["connector_", { $toString: "$$config.connector_id" }, "_type_name"] },
//                                                 v: "$$config.connector_type_name"
//                                             },
//                                             {
//                                                 k: { $concat: ["connector_", { $toString: "$$config.connector_id" }, "_output_type_name"] },
//                                                 v: "$$config.connector_output_type_name"
//                                             },
//                                             {
//                                                 k: { $concat: ["connector_", { $toString: "$$config.connector_id" }, "_socket_count"] },
//                                                 v: "$$config.socket_count"
//                                             },
//                                             {
//                                                 k: { $concat: ["connector_", { $toString: "$$config.connector_id" }, "_gun_connector"] },
//                                                 v: "$$config.gun_connector"
//                                             }
//                                         ]
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     station_id: 1,
//                     location_id: 1,
//                     station_address: 1,
//                     landmark: 1,
//                     network: 1,
//                     availability: 1,
//                     accessibility: 1,
//                     latitude: 1,
//                     longitude: 1,
//                     charger_type: 1,
//                     chargers: 1,
//                     distance: 1, // Include calculated distance
//                     charger_details: 1 // Includes nested socket_gun_config
//                 }
//             },
//             { $sort: { distance: 1 } } // Sort nearest first
//         ]).toArray();

//         logger.info(`Found ${nearbyStations.length} nearby stations`);

//         return res.status(200).json({
//             error: false,
//             message: "Nearby charging stations retrieved successfully",
//             stations: nearbyStations
//         });

//     } catch (error) {
//         logger.error(`Error fetching nearby stations: ${error.message}`);
//         return res.status(500).json({
//             error: true,
//             message: "Internal Server Error",
//             error_details: error.message
//         });
//     }
// };


module.exports = {
    // MANAGE GENERIC FILTER 
    SaveSearchFilter,
    fetchSavedSearchFilter,

    getNearbyStations,
};




