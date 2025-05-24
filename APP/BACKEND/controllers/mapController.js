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
// Fetch Saved Filter
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
const getNearbyStations = async (req, res) => {
    try {
        const { latitude, longitude, user_id, email_id } = req.body;

        // Only require latitude and longitude
        if (!latitude || !longitude) {
            return res.status(400).json({
                error: true,
                message: "Latitude and Longitude are required",
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
        const chargerStatusCollection = db.collection("charger_status");
        const financeDetailsCollection = db.collection("financeDetails");

        // Initialize variables for user data
        let savedStationIds = [];
        let userAuthenticated = false;
        let userAssignedAssociation = null;

        // Check for user data
        try {
            const hasUserId = user_id && (Number.isInteger(Number(user_id)) || typeof user_id === 'number');
            const hasEmailId = email_id && typeof email_id === 'string';

            if ((hasUserId || hasEmailId) && db) {
                const usersCollection = db.collection("users");
                let query = {};

                if (hasUserId) query.user_id = parseInt(user_id);
                if (hasEmailId) query.email_id = email_id;

                logger.loggerInfo(`Looking up user with query: ${JSON.stringify(query)}`);
                const user = await usersCollection.findOne(query);

                if (user) {
                    userAuthenticated = true;
                    const favStations = user.favStations || [];
                    savedStationIds = favStations
                        .filter(station => station.status === true)
                        .map(station => station.station_id);

                    userAssignedAssociation = user.assigned_association;

                    logger.loggerInfo(`User found: ID=${user.user_id}, Email=${user.email_id}. Found ${savedStationIds.length} saved stations. Assigned Association: ${userAssignedAssociation}`);

                    if (user.status === false) {
                        logger.loggerWarn(`User account is inactive: UserID: ${user.user_id}, Email ID: ${user.email_id}`);
                        return res.status(403).json({
                            error: true,
                            message: 'Your account has been deactivated!',
                            invalidateToken: true
                        });
                    }
                } else {
                    logger.loggerWarn(`User not found with provided credentials. Continuing without user data.`);
                }
            } else {
                logger.loggerInfo('No valid user credentials provided. Continuing in guest mode.');
            }
        } catch (userError) {
            logger.loggerError(`Error fetching user data: ${userError.message}`);
        }

        // Constants for distance calculation
        const EARTH_RADIUS_KM = 6371;
        const PI = Math.PI;
        const DEG_TO_RAD = PI / 180;

        const userLatRad = lat * DEG_TO_RAD;
        const userLonRad = lon * DEG_TO_RAD;

        // Step 1: Fetch nearby stations with charger details
        const nearbyStations = await stationsCollection.aggregate([
            {
                $addFields: {
                    lat_num: {
                        $convert: {
                            input: "$latitude",
                            to: "double",
                            onError: 0.0
                        }
                    },
                    lon_num: {
                        $convert: {
                            input: "$longitude",
                            to: "double",
                            onError: 0.0
                        }
                    }
                }
            },
            {
                $addFields: {
                    latRad: { $multiply: ["$lat_num", DEG_TO_RAD] },
                    lonRad: { $multiply: ["$lon_num", DEG_TO_RAD] },
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
            { $match: { distance: { $lte: 100 } } },
            {
                $lookup: {
                    from: "charger_details",
                    localField: "chargers",
                    foreignField: "charger_id",
                    as: "charger_details"
                }
            },
            // Step 2: Filter charger_details based on accessibility and assigned_association_id
            {
                $set: {
                    charger_details: {
                        $filter: {
                            input: "$charger_details",
                            as: "charger",
                            cond: {
                                $and: [
                                    { $eq: ["$$charger.status", true] }, // Only include chargers with status: true
                                    {
                                        $or: [
                                            // Public chargers (charger_accessibility: 1) with non-null assigned_association_id
                                            {
                                                $and: [
                                                    { $eq: ["$$charger.charger_accessibility", 1] },
                                                    { $ne: ["$$charger.assigned_association_id", null] }
                                                ]
                                            },
                                            // Private chargers (charger_accessibility: 2) with matching assigned_association_id
                                            userAuthenticated && userAssignedAssociation !== null
                                                ? {
                                                    $and: [
                                                        { $eq: ["$$charger.charger_accessibility", 2] },
                                                        {
                                                            $or: [
                                                                { $eq: ["$$charger.assigned_association_id", userAssignedAssociation] },
                                                                { $eq: [{ $type: "$$charger.assigned_association_id" }, "missing"] } // Fixed: Check if field is missing
                                                            ]
                                                        }
                                                    ]
                                                }
                                                : { $eq: [1, 2] } // Dummy condition to exclude private chargers if no user association
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            // Step 3: Log the filtered charger_details for debugging
            {
                $set: {
                    charger_count: { $size: "$charger_details" } // Add a field to log the number of chargers after filtering
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
                    latitude: "$lat_num",
                    longitude: "$lon_num",
                    charger_type: 1,
                    distance: 1,
                    charger_count: 1, // Include for debugging
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
                        landmark: 1,
                        charger_accessibility: 1,
                        assigned_association_id: 1 // Include for debugging
                    }
                }
            },
            { $sort: { distance: 1 } }
        ]).toArray();

        // Log the number of chargers per station for debugging
        // nearbyStations.forEach(station => {
        //     logger.loggerInfo(`Station ${station.station_id}: ${station.charger_count} chargers after filtering`);
        // });

        // Step 4: Process stations - add saved_station field, update accessibility, and enrich charger_details
        const updatedStations = await Promise.all(nearbyStations.map(async station => {
            const isSaved = userAuthenticated ? savedStationIds.includes(station.station_id) : false;

            // Enrich charger_details with status and unit_price
            const enrichedChargerDetails = await Promise.all((station.charger_details || []).map(async charger => {
                const chargerId = charger.charger_id;

                // Fetch charger status
                const status = await chargerStatusCollection.find({ charger_id: chargerId }).toArray();

                // Calculate unit price
                let unitPrice = null;
                let PriceDetails = {};
                const financeId = charger.finance_id;

                if (financeId) {
                    const financeRecord = await financeDetailsCollection.findOne({ finance_id: financeId });

                    if (financeRecord) {
                        const EB_fee = parseFloat(financeRecord.eb_charge) + parseFloat(financeRecord.margin);
                        const additionalCharges = [
                            parseFloat(financeRecord.parking_fee),
                            parseFloat(financeRecord.convenience_fee),
                            parseFloat(financeRecord.station_fee),
                            parseFloat(financeRecord.processing_fee),
                            parseFloat(financeRecord.service_fee)
                        ];
                        const totalAdditionalCharges = additionalCharges.reduce((sum, charge) => sum + (charge || 0), 0);
                        const TotalEBPrice = (EB_fee + totalAdditionalCharges);
                        const gstPercentage = financeRecord.gst;
                        const gstAmount = (TotalEBPrice * gstPercentage) / 100;
                        unitPrice = TotalEBPrice + gstAmount;

                        PriceDetails = {
                            EB_Fee: EB_fee,
                            Parking_fee: parseFloat(financeRecord.parking_fee).toFixed(2),
                            convenience_fee: parseFloat(financeRecord.convenience_fee).toFixed(2),
                            station_fee: parseFloat(financeRecord.station_fee).toFixed(2),
                            processing_fee: parseFloat(financeRecord.processing_fee).toFixed(2),
                            service_fee: parseFloat(financeRecord.service_fee).toFixed(2),
                            gst: parseFloat(gstAmount).toFixed(2),
                            gstPercentage: gstPercentage
                        };
                    }
                }

                return {
                    ...charger,
                    status: status.length > 0 ? status : null,
                    unit_price: unitPrice ? parseFloat(unitPrice).toFixed(2) : null,
                    PriceDetails
                };
            }));

            // Update charger_details with enriched data
            station.charger_details = enrichedChargerDetails;

            // Determine station accessibility based on chargers
            let hasPublicChargers = false;
            let hasPrivateChargers = false;

            if (station.charger_details && station.charger_details.length > 0) {
                for (const charger of station.charger_details) {
                    if (charger.charger_accessibility === 1) {
                        hasPublicChargers = true;
                    } else if (charger.charger_accessibility === 2) {
                        hasPrivateChargers = true;
                    }
                }

                let stationAccessibility;
                if (hasPublicChargers && hasPrivateChargers) {
                    stationAccessibility = "Hybrid";
                } else if (hasPublicChargers) {
                    stationAccessibility = "Public";
                } else if (hasPrivateChargers) {
                    stationAccessibility = "Private";
                } else {
                    stationAccessibility = station.accessibility;
                }

                // if (stationAccessibility !== station.accessibility) {
                //     try {
                //         await stationsCollection.updateOne(
                //             { station_id: station.station_id },
                //             { $set: { accessibility: stationAccessibility } }
                //         );
                //         logger.loggerInfo(`Updated station ${station.station_id} accessibility to ${stationAccessibility}`);
                //     } catch (updateError) {
                //         logger.loggerError(`Error updating station accessibility: ${updateError.message}`);
                //     }
                // }

                station.accessibility = stationAccessibility;
            }

            // Remove charger_count from the final response
            delete station.charger_count;

            return {
                ...station,
                saved_station: isSaved
            };
        }));

        // Log accessibility statistics
        const accessibilityStats = {
            Public: updatedStations.filter(s => s.accessibility === "Public").length,
            Private: updatedStations.filter(s => s.accessibility === "Private").length,
            Hybrid: updatedStations.filter(s => s.accessibility === "Hybrid").length,
            Other: updatedStations.filter(s => !["Public", "Private", "Hybrid"].includes(s.accessibility)).length
        };

        logger.loggerSuccess(`Found ${updatedStations.length} nearby stations & retrieved successfully`);
        logger.loggerInfo(`Station accessibility breakdown: ${JSON.stringify(accessibilityStats)}`);

        return res.status(200).json({
            error: false,
            message: "Nearby charging stations retrieved successfully",
            stations: updatedStations,
            accessibility_stats: {
                public_count: accessibilityStats.Public,
                private_count: accessibilityStats.Private,
                hybrid_count: accessibilityStats.Hybrid,
                other_count: accessibilityStats.Other
            }
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




