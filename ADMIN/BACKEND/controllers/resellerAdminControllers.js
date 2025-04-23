const database = require('../config/db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
const { ObjectId } = require("mongodb"); // Import ObjectId
const Emailler = require('../Emailer/controller');
const logger = require('../utils/logger');

// 1.Login Controller
// login function
const authenticate = async (req) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return { error: true, status: 401, message: 'Email and Password required' };
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection('users');
        const resellerCollection = db.collection('reseller_details');

        const user = await usersCollection.findOne({ email_id: email, role_id: 2, status: true });

        if (!user || user.password !== password || user.role_id !== 2) {
            return { error: true, status: 401, message: 'Invalid credentials or user is deactivated' };
        }

        // Fetch reseller details using reseller_id and check if the status is true
        const getResellerDetails = await resellerCollection.findOne({ reseller_id: user.reseller_id, status: true });

        // If reseller details not found or deactivated, return an error
        if (!getResellerDetails) {
            return { status: 404, message: 'Reseller details not found or deactivated' };
        }

        // Generate JWT token
        const token = jwt.sign({ username: user.username }, JWT_SECRET);

        return {
            error: false,
            user: {
                reseller_name: getResellerDetails.reseller_name,
                reseller_id: getResellerDetails.reseller_id,
                user_id: user.user_id,
                username: user.username,
                email_id: user.email_id,
                role_id: user.role_id,
                token: token
            }
        };

    } catch (error) {
        console.error(error);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
};

// 2.Dashboard
// Fetch Total Clients, Associations, and App Users for a Specific Reseller
async function FetchTotalUsers(reseller_id) {
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

        if (!db) {
            console.error("Database connection failed!");
            throw new Error("Database connection failed");
        }

        // Fetch users assigned to this reseller
        const users = await usersCollection.find({ reseller_id: reseller_id }).toArray();

        if (!users.length) {
            return { clientsCount: 0, associationsCount: 0, appUsersCount: 0 };
        }

        // Count Clients (client_id exists, association_id is null)
        const clientsCount = users.filter(user => user.client_id && !user.association_id).length;

        // Count Associations (client_id and association_id exist)
        const associationsCount = users.filter(user => user.client_id && user.association_id).length;

        // Count App Users (role_id = 5)
        const appUsersCount = users.filter(user => user.role_id === 5).length;

        return {
            clientsCount,
            associationsCount,
            appUsersCount
        };
    } catch (error) {
        console.error(`Error fetching user counts: ${error}`);
        throw new Error('Error fetching user counts');
    }
}

// Function to fetch chargers assigned to a specific reseller
async function FetchTotalCharger(reseller_id) {
    try {
        console.log("Connecting to the database...");
        const db = await database.connectToDatabase();

        if (!db) {
            console.error("Database connection failed!");
            throw new Error("Database connection failed");
        }

        const chargerCollection = db.collection("charger_details");

        // console.log("Fetching chargers for reseller_id:", reseller_id);

        const recentChargers = await chargerCollection.find({
            assigned_reseller_id: reseller_id
        }).toArray();

        console.log("Fetched chargers:", recentChargers);

        const totalCount = recentChargers.length; // Get total count of matched chargers

        return { totalCount, recentChargers };
    } catch (error) {
        console.error(`Error fetching charger details: ${error}`);
        throw new Error('Error fetching charger details');
    }
}

// fetch FetchOnlineCharger
async function FetchOnlineCharger(reseller_id) {
    try {
        const db = await database.connectToDatabase();

        const chargerCollection = db.collection("charger_details");
        const statusCollection = db.collection("charger_status");

        // Get charger IDs assigned to the given reseller_id
        const assignedChargers = await chargerCollection.find({ assigned_reseller_id: reseller_id }).toArray();

        if (!assignedChargers.length) {
            return { totalCount: 0, onlineChargers: [], message: "No chargers assigned to this reseller" };
        }

        // Extract charger IDs
        const chargerIds = assignedChargers.map(charger => charger.charger_id);
        // console.log("Charger IDs assigned to reseller:", chargerIds);

        // Get the current time in UTC and calculate one hour ago
        const currentTime = new Date();
        const oneHourAgo = new Date(currentTime.getTime() - (1 * 60 * 60 * 1000));

        // Fetch online chargers from charger_status table
        const onlineChargers = await statusCollection.find({
            charger_id: { $in: chargerIds },
            timestamp: { $gte: oneHourAgo }, // Last modified within 1 hour
            error_code: "NoError"
        }).toArray();

        const totalCount = onlineChargers.length;

        if (totalCount === 0) {
            return { totalCount, onlineChargers: [], message: "No online chargers found in the last hour" };
        }

        return { totalCount, onlineChargers };
    } catch (error) {
        console.error(`Error fetching online charger details: ${error}`);
        throw new Error('Error fetching online charger details');
    }
}

// fetch FetchOfflineCharger
async function FetchOfflineCharger(reseller_id) {
    try {
        const db = await database.connectToDatabase();

        const chargerCollection = db.collection("charger_details");
        const statusCollection = db.collection("charger_status");

        // Get charger IDs assigned to the given reseller_id
        const assignedChargers = await chargerCollection.find({ assigned_reseller_id: reseller_id }).toArray();

        if (!assignedChargers.length) {
            return { totalCount: 0, offlineChargers: [], message: "No chargers assigned to this reseller" };
        }

        // Extract charger IDs
        const chargerIds = assignedChargers.map(charger => charger.charger_id);
       // console.log("Charger IDs assigned to reseller:", chargerIds);

        // Get the current time in UTC and calculate one hour ago
        const currentTime = new Date();
        const oneHourAgo = new Date(currentTime.getTime() - (1 * 60 * 60 * 1000));

        // Fetch offline chargers from charger_status table
        const offlineChargers = await statusCollection.find({
            charger_id: { $in: chargerIds },
            timestamp: { $lt: oneHourAgo }, // Not modified in the last 1 hour
            // error_code: "NoError"
        }).toArray();

        const totalCount = offlineChargers.length;

        if (totalCount === 0) {
            return { totalCount, offlineChargers: [], message: "No offline chargers found" };
        }

        return { totalCount, offlineChargers };
    } catch (error) {
        console.error(`Error fetching offline charger details: ${error}`);
        throw new Error('Error fetching offline charger details');
    }
}

// Fetch Faulty Chargers Function
async function FetchFaultsCharger(reseller_id) {
    try {
        const db = await database.connectToDatabase();

        const chargerCollection = db.collection("charger_details");
        const statusCollection = db.collection("charger_status");

        // Get charger IDs assigned to the given reseller_id
        const assignedChargers = await chargerCollection.find({ assigned_reseller_id: reseller_id }).toArray();

        if (!assignedChargers.length) {
            return { totalCount: 0, faultyChargers: [], message: "No chargers assigned to this reseller" };
        }

        // Extract charger IDs
        const chargerIds = assignedChargers.map(charger => charger.charger_id);
       // console.log("Charger IDs assigned to reseller:", chargerIds);

        // Get current time
        const currentTime = new Date();
        // Calculate time 1 hour ago
        const oneHourAgo = new Date(currentTime.getTime() - (1 * 60 * 60 * 1000));

        // Fetch faulty chargers from charger_status table
        const faultyChargers = await statusCollection.find({
            timestamp: { $gte: oneHourAgo },  // Modified within the last 1 hour
            charger_id: { $in: chargerIds },
            error_code: { $ne: "NoError" } // Find all chargers where error_code is NOT "NoError"
        }).toArray();

        const totalCount = faultyChargers.length;

        if (totalCount === 0) {
            return { totalCount, faultyChargers: [], message: "No faulty chargers found" };
        }

        return { totalCount, faultyChargers };
    } catch (error) {
        console.error(`Error fetching faulty charger details: ${error}`);
        throw new Error('Error fetching faulty charger details');
    }
}

// Fetch Charger Total Energy Function
async function FetchChargerTotalEnergy(reseller_id) {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");

        // Get charger IDs assigned to the given reseller_id
        const assignedChargers = await chargerCollection.find({ assigned_reseller_id: reseller_id }).toArray();

        if (!assignedChargers.length) {
            return {
                totalEnergyConsumed: 0,
                CO2_from_EV: 0,
                CO2_from_ICE: 0,
                CO2_Savings: 0,
                daytodaytotalEnergyConsumed: [],
                weeklyTotalEnergyConsumed: [],
                monthlyTotalEnergyConsumed: [],
                yearlyTotalEnergyConsumed: [],
                message: "No chargers assigned to this reseller"
            };
        }

        // Extract charger IDs
        const chargerIds = assignedChargers.map(charger => charger.charger_id);
       // console.log("Charger IDs assigned to reseller:", chargerIds);

        // Aggregation Stages
        const matchStage = {
            $match: {
                start_time: { $ne: null },
                unit_consummed: { $ne: null },
                charger_id: { $in: chargerIds }
            }
        };

        const addFieldsStage = {
            $addFields: {
                start_time: { $toDate: "$start_time" },
                unit_consummed: { $toDouble: "$unit_consummed" }
            }
        };

        // Daily Aggregation
        const resultDayToDay = await sessionCollection.aggregate([
            matchStage, addFieldsStage,
            {
                $group: {
                    _id: { $dateToString: { format: "%d/%m/%Y", date: "$start_time" } },
                    day2daytotalEnergyConsumed: { $sum: "$unit_consummed" }
                }
            },
            { $sort: { "_id": -1 } }
        ]).toArray();

        const daytodaytotalEnergyConsumed = resultDayToDay
            .filter(entry => entry._id !== null) // Remove entries where date is null
            .map(entry => ({
                date: entry._id,
                totalEnergyConsumed: entry.day2daytotalEnergyConsumed
            }));

        // Weekly Aggregation
        const weeklyResult = await sessionCollection.aggregate([
            matchStage, addFieldsStage,
            {
                $group: {
                    _id: { year: { $year: "$start_time" }, week: { $isoWeek: "$start_time" } },
                    totalEnergyConsumed: { $sum: "$unit_consummed" }
                }
            },
            { $sort: { "_id.year": -1, "_id.week": -1 } }
        ]).toArray();

        const weeklyTotalEnergyConsumed = weeklyResult.map(entry => ({
            week: `Week ${entry._id.week} of ${entry._id.year}`,
            totalEnergyConsumed: entry.totalEnergyConsumed || 0
        }));

        // Monthly Aggregation
        const monthlyResult = await sessionCollection.aggregate([
            matchStage, addFieldsStage,
            {
                $group: {
                    _id: { year: { $year: "$start_time" }, month: { $month: "$start_time" } },
                    totalEnergyConsumed: { $sum: "$unit_consummed" }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]).toArray();

        const monthlyTotalEnergyConsumed = monthlyResult.map(entry => ({
            month: `${entry._id.year}-${String(entry._id.month).padStart(2, "0")}`,
            totalEnergyConsumed: entry.totalEnergyConsumed || 0
        }));

        // Yearly Aggregation (Remove null values)
        const yearlyResult = await sessionCollection.aggregate([
            matchStage, addFieldsStage,
            {
                $group: {
                    _id: { year: { $year: "$start_time" } },
                    totalEnergyConsumed: { $sum: "$unit_consummed" }
                }
            },
            { $match: { "_id.year": { $ne: null } } }, // Remove null years
            { $sort: { "_id.year": -1 } }
        ]).toArray();

        const yearlyTotalEnergyConsumed = yearlyResult.map(entry => ({
            year: entry._id.year,
            totalEnergyConsumed: entry.totalEnergyConsumed || 0
        }));

        // Aggregate total energy from sessionCollection
        const totalResult = await sessionCollection.aggregate([
            matchStage,
            {
                $group: {
                    _id: null,
                    totalEnergyConsumed: { $sum: { $toDouble: "$unit_consummed" } }
                }
            }
        ]).toArray();

        const totalEnergyConsumed = totalResult.length > 0 ? totalResult[0].totalEnergyConsumed : 0;

        // Constants
        const EV_EFFICIENCY = 6.5; // km per kWh
        const EV_CO2_PER_KWH = 0.02; // kg CO2 per kWh
        const ICE_CO2_PER_KM = 0.35; // kg CO2 per km

        //  Calculate Distance Driven by EV
        const distanceDrivenByEV = totalEnergyConsumed / EV_EFFICIENCY;

        //  Calculate CO2 Emissions from ICE Vehicle
        const CO2_from_ICE = distanceDrivenByEV * ICE_CO2_PER_KM;

        //  Calculate CO2 Emissions from EV
        const CO2_from_EV = totalEnergyConsumed * EV_CO2_PER_KWH;

        // Step 4: Calculate CO2 Savings
        const CO2_Savings = CO2_from_ICE - CO2_from_EV;

        return {
            daytodaytotalEnergyConsumed,
            weeklyTotalEnergyConsumed,
            monthlyTotalEnergyConsumed,
            yearlyTotalEnergyConsumed,
            totalEnergyConsumed,
            CO2_from_EV,
            CO2_from_ICE,
            CO2_Savings
        };

    } catch (error) {
        console.error(`Error fetching Charger Total Energy details: ${error}`);
        throw new Error('Error fetching Charger Total Energy details');
    }
}

// Fetch Total Charger Charging Sessions for a Specific Reseller
async function FetchTotalChargersSession(reseller_id) {
    try {
        console.log("Connecting to the database...");
        const db = await database.connectToDatabase();

        if (!db) {
            console.error("Database connection failed!");
            throw new Error("Database connection failed");
        }

        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");

        // Find all chargers assigned to the given reseller
        const chargers = await chargerCollection.find({ assigned_reseller_id: reseller_id }).toArray();

        if (chargers.length === 0) {
            console.log("No chargers found for reseller_id:", reseller_id);
            return { totalCount: 0 };
        }

        // Extract charger IDs
        const chargerIds = chargers.map(charger => charger.charger_id);

        // Count total sessions where charger_id matches the found chargers
        const totalCount = await sessionCollection.countDocuments({ charger_id: { $in: chargerIds } });

        return { totalCount };
    } catch (error) {
        console.error(`Error fetching charger session count: ${error}`);
        throw new Error('Error fetching charger session count');
    }
}

// 3.Manage Device
//Fetch allocated charger
async function FetchAllocatedCharger(req) {
    try {
        const { reseller_id } = req.body;
        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");
        const configCollection = db.collection("socket_gun_config");

        // Aggregation to fetch chargers with client names
        const chargersWithClients = await devicesCollection.aggregate([
            {
                $match: { assigned_client_id: { $ne: null }, assigned_reseller_id: reseller_id }
            },
            {
                $lookup: {
                    from: 'client_details',
                    localField: 'assigned_client_id',
                    foreignField: 'client_id',
                    as: 'clientDetails'
                }
            },
            {
                $unwind: '$clientDetails'
            },
            {
                $addFields: {
                    client_name: '$clientDetails.client_name',
                    //unit_price: financeDetails.eb_charges // Append unit_price to each charger (optional)
                }
            },
            {
                $project: {
                    clientDetails: 0 // Exclude the full clientDetails object
                }
            }
        ]).toArray();

        const results = [];

        for (let charger of chargersWithClients) {
            const chargerID = charger.charger_id;

            // Fetch corresponding socket/gun configuration
            const config = await configCollection.findOne({ charger_id: chargerID });

            let connectorDetails = []; // Initialize as an array

            if (config) {
                // Loop over connector configurations dynamically
                let connectorIndex = 1;
                while (config[`connector_${connectorIndex}_type`] !== undefined) {
                    // Map connector types: 1 -> "Socket", 2 -> "Gun"
                    let connectorTypeValue;
                    if (config[`connector_${connectorIndex}_type`] === 1) {
                        connectorTypeValue = "Socket";
                    } else if (config[`connector_${connectorIndex}_type`] === 2) {
                        connectorTypeValue = "Gun";
                    }

                    // Push connector details to the array
                    connectorDetails.push({
                        connector_type: connectorTypeValue || config[`connector_${connectorIndex}_type`],
                        connector_type_name: config[`connector_${connectorIndex}_type_name`]
                    });

                    connectorIndex++; // Move to the next connector
                }
            }

            // If there are no connector details, the charger will have an empty connector_details array
            results.push({
                ...charger,
                connector_details: connectorDetails.length > 0 ? connectorDetails : null
            });
        }

        return results; // Only return data, don't send response
    } catch (error) {
        console.error(`Error fetching chargers: ${error}`);
        throw new Error('Failed to fetch chargers');
    }
}

//Fetch unAllocated charger
async function FetchUnAllocatedCharger(req) {
    try {
        const { reseller_id } = req.body;
        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");
        const configCollection = db.collection("socket_gun_config");

        // Fetch chargers that are not allocated to any client
        const chargers = await devicesCollection.find({ assigned_client_id: null, assigned_reseller_id: reseller_id }).toArray();

        const results = [];

        for (let charger of chargers) {
            const chargerID = charger.charger_id;

            // Fetch corresponding socket/gun configuration
            const config = await configCollection.findOne({ charger_id: chargerID });

            let connectorDetails = []; // Initialize as an array

            if (config) {
                // Loop over connector configurations dynamically
                let connectorIndex = 1;
                while (config[`connector_${connectorIndex}_type`] !== undefined) {
                    // Map connector types: 1 -> "Socket", 2 -> "Gun"
                    let connectorTypeValue;
                    if (config[`connector_${connectorIndex}_type`] === 1) {
                        connectorTypeValue = "Socket";
                    } else if (config[`connector_${connectorIndex}_type`] === 2) {
                        connectorTypeValue = "Gun";
                    }

                    // Push connector details to the array
                    connectorDetails.push({
                        connector_type: connectorTypeValue || config[`connector_${connectorIndex}_type`],
                        connector_type_name: config[`connector_${connectorIndex}_type_name`]
                    });

                    connectorIndex++; // Move to the next connector
                }
            }

            // Append the connector details to each charger
            results.push({
                ...charger,
                connector_details: connectorDetails.length > 0 ? connectorDetails : null
            });
        }

        return results; // Only return data, don't send response
    } catch (error) {
        console.error(`Error fetching chargers: ${error}`);
        throw new Error('Failed to fetch chargers');
    }
}

//DeActivate or activate charger
async function DeActivateOrActivateCharger(req) {
    try {
        const { modified_by, charger_id, status } = req.body;

        if (!modified_by || !charger_id || typeof status !== 'boolean') {
            return { error: true, status: 400, message: 'Username, chargerID, and Status (boolean) are required' };
        }

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        const existingCharger = await devicesCollection.findOne({ charger_id: charger_id });
        if (!existingCharger) {
            return { error: true, status: 404, message: 'chargerID not found' };
        }

        if (existingCharger.assigned_client_id == null) {
            return { error: true, status: 400, message: 'Cannot deactivate an allocated charger' };
        }

        const updateResult = await devicesCollection.updateOne(
            { charger_id: charger_id },
            {
                $set: {
                    status: status,
                    modified_by: modified_by,
                    modified_date: new Date()
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return { error: true, status: 500, message: 'Failed to update charger' };
        }

        return { error: false, message: 'Charger status updated successfully' };
    } catch (error) {
        console.error(error);
        logger.error(error);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
}

//Fetch client user to assgin charger
async function FetchClientUserToAssginCharger(req) {
    try {
        const { reseller_id } = req.body;
        const db = await database.connectToDatabase();
        const resellersCollection = db.collection("client_details");

        const users = await resellersCollection.find({ reseller_id: parseInt(reseller_id), status: true }).toArray();

        return users;

    } catch (error) {
        console.error(`Error fetching client details: ${error}`);
        logger.error(`Error fetching client details: ${error}`);
        throw new Error('Error fetching client details');
    }
}

//Fetch unAllocated charger to assgin
async function FetchUnAllocatedChargerToAssgin(req) {
    try {
        const { reseller_id } = req.body
        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        const chargers = await devicesCollection.find({ assigned_client_id: null, assigned_reseller_id: reseller_id, status: true }).toArray();
        return chargers; // Only return data, don't send response
    } catch (error) {
        console.error(`Error fetching chargers: ${error}`);
        throw new Error('Failed to fetch chargers'); // Throw error, handle in route
    }
}

//Assgin charger to client 
async function AssginChargerToClient(req) {
    try {
        const { client_id, charger_id, modified_by, reseller_commission } = req.body;

        // Validate required fields
        if (!client_id || !charger_id || !modified_by || !reseller_commission) {
            return { error: true, status: 400, message: 'Reseller ID, Charger IDs, reseller commission and Modified By are required' };
        }

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Ensure charger_ids is an array
        const chargerIdsArray = Array.isArray(charger_id) ? charger_id : [charger_id];

        // Check if all the chargers exist
        const existingChargers = await devicesCollection.find({ charger_id: { $in: chargerIdsArray } }).toArray();

        if (existingChargers.length !== chargerIdsArray.length) {
            return { error: true, status: 404, message: 'One or more chargers not found' };
        }

        // Update the reseller details for all chargers
        const result = await devicesCollection.updateMany(
            { charger_id: { $in: chargerIdsArray } },
            {
                $set: {
                    assigned_client_id: client_id,
                    reseller_commission,
                    assigned_client_date: new Date(),
                    modified_date: new Date(),
                    modified_by
                }
            }
        );

        if (result.modifiedCount === 0) {
            return { error: true, status: 500, message: 'Failed to assign chargers to reseller' };
        }

        return { error: false, status: 200, message: 'Chargers Successfully Assigned' };

    } catch (error) {
        console.error('Controller Error:', error);
        logger.error(`Error assigning chargers to reseller: ${error}`);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
}

// 4.Manage Client
//FetchClients
async function FetchClients(req) {
    try {
        const { reseller_id } = req.body;
        const db = await database.connectToDatabase();
        const clientCollection = db.collection("client_details");

        const clientList = await clientCollection.find({ reseller_id: parseInt(reseller_id) }).toArray();

        return clientList;

    } catch (error) {
        console.error(`Error fetching client details: ${error}`);
        logger.error(`Error fetching client details: ${error}`);
        throw new Error('Error fetching client details');
    }
}

// FetchAssignedAssociation Controller
async function FetchAssignedAssociation(req) {
    try {
        const { client_id } = req.body;

        // Validate client_id
        if (!client_id) {
            return { error: true, status: 400, message: 'Client ID is required' };
        }

        const db = await database.connectToDatabase();
        const AssociationCollection = db.collection("association_details");

        // Query to fetch Association for the specific client_id
        const Association = await AssociationCollection.find({ client_id: client_id }).toArray();

        if (!Association || Association.length === 0) {
            return { error: true, status: 404, message: 'No Association details found for the specified client_id' };
        }

        // Return the Association data
        return {
            error: false,
            status: 200,
            data: Association,
            message: 'Association details fetched successfully'
        };

    } catch (error) {
        console.error(error);
        logger.error(`Error fetching Association: ${error}`);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
}

//FetchChargerDetailsWithSession
async function FetchChargerDetailsWithSession(req) {
    try {
        const { client_id } = req.body;

        // Validate client_id
        if (!client_id) {
            throw new Error('Client ID is required');
        }

        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");

        // Aggregation pipeline to fetch charger details with sorted session data
        const result = await chargerCollection.aggregate([
            {
                $match: { assigned_client_id: client_id }
            },
            {
                $lookup: {
                    from: "device_session_details",
                    localField: "charger_id",
                    foreignField: "charger_id",
                    as: "sessions"
                }
            },
            {
                $addFields: {
                    chargerID: "$charger_id",
                    reseller_commission: "$reseller_commission",
                    sessiondata: {
                        $cond: {
                            if: { $gt: [{ $size: "$sessions" }, 0] },
                            then: {
                                $map: {
                                    input: {
                                        $sortArray: {
                                            input: "$sessions",
                                            sortBy: { stop_time: -1 }
                                        }
                                    },
                                    as: "session",
                                    in: "$$session"
                                }
                            },
                            else: ["No session found"]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    chargerID: 1,
                    sessiondata: 1,
                    reseller_commission: 1,

                }
            }
        ]).toArray();
        if (!result || result.length === 0) {
            throw new Error('No chargers found for the specified client_id');
        }

        // Sort sessiondata within each chargerID based on the first session's stop_time
        result.forEach(charger => {
            if (charger.sessiondata.length > 1) {
                charger.sessiondata.sort((a, b) => new Date(b.stop_time) - new Date(a.stop_time));
            }
        });

        return result;

    } catch (error) {
        console.error(`Error fetching charger details: ${error.message}`);
        throw error;
    }
}

// Create User Function
async function CreateUserAutomatic(role_id, client_id, reseller_id, username, email_id, phone_no, created_by) {
    try {
        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const UserRole = db.collection("user_roles");

        // Check if the role ID exists
        const existingRole = await UserRole.findOne({ role_id: role_id });
        if (!existingRole) {
            console.log("Role ID does not exist");
            return { success: false, message: "Invalid Role ID" };
        }

        // Check if this role_id + email_id combo already exists
        const duplicateEmailWithRole = await Users.findOne({
            role_id: role_id,
            email_id: email_id
        });

        if (duplicateEmailWithRole) {
            return { success: false, message: "This email is already registered under the same role" };
        }

        // Get the highest user_id and increment
        const lastUser = await Users.find().sort({ user_id: -1 }).limit(1).toArray();
        let newUserId = lastUser.length > 0 ? lastUser[0].user_id + 1 : 1;

        // Generate a random 4-digit password
        const randomPassword = Math.floor(1000 + Math.random() * 9000);

        // Insert the new user
        const result = await Users.insertOne({
            role_id: role_id,
            reseller_id: reseller_id,
            client_id: client_id,
            association_id: null,
            user_id: newUserId,
            username: username,
            password: randomPassword, // Store the random password
            phone_no: phone_no,
            email_id: email_id,
            wallet_bal: 0,
            autostop_price: null,
            autostop_price_is_checked: null,
            autostop_time: null,
            autostop_time_is_checked: null,
            autostop_unit: null,
            autostop_unit_is_checked: null,
            tag_id: null,
            assigned_association: null,
            created_by: created_by,
            created_date: new Date(),
            modified_by: null,
            modified_date: null,
            status: true
        });

        if (result.insertedId) {
            console.log("User inserted successfully. Sending email...");
            const emailSent = await Emailler.EmailConfigForclientUser(email_id, randomPassword);
            return { success: true, message: emailSent ? "User created and email sent" : "User created, but email failed" };
        } else {
            console.log("User insertion failed.");
            return { success: false, message: "User creation failed" };
        }
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, message: error.message };
    }
}

// Create Client Function
async function addNewClient(req) {
    try {
        const { reseller_id, client_name, client_phone_no, client_email_id, client_address, created_by } = req.body;

        // Validate required fields
        if (!reseller_id || !client_name || !client_phone_no || !client_email_id || !client_address || !created_by) {
            throw new Error("Required fields are missing!");
        }

        const db = await database.connectToDatabase();
        const clientCollection = db.collection("client_details");
        const roleCollection = db.collection("user_roles");

        const role_id = 3; // Role ID for clients

        //  Check if Client Role is active
        const clientRole = await roleCollection.findOne({ role_id: role_id });

        if (!clientRole) {
            throw new Error("Client role not found in the system.");
        }

        if (clientRole.status === false) {
            throw new Error("Client role is deactivated. Cannot create client & user.");
        }

        //  Check if client_email_id or client_name already exists
        const existingClient = await clientCollection.findOne({
            $or: [{ client_email_id: client_email_id }, { client_name: client_name }]
        });

        if (existingClient) {
            throw new Error("Client with this name or email already exists");
        }

        //  Get the highest client_id and increment
        const lastClient = await clientCollection.find().sort({ client_id: -1 }).limit(1).toArray();
        let nextClientId = lastClient.length > 0 ? lastClient[0].client_id + 1 : 1;

        // Step 4: Insert new client
        const newClient = {
            client_id: nextClientId,
            reseller_id,
            client_name,
            client_phone_no,
            client_email_id,
            client_address,
            client_wallet: 0.00,
            created_by,
            created_date: new Date(),
            status: true
        };

        const result = await clientCollection.insertOne(newClient);
        if (!result.acknowledged) {
            throw new Error("Failed to create client");
        }

        console.log(`New client added successfully with client_id ${nextClientId}`);

        // Step 5: Create user automatically
        const userCreationResult = await CreateUserAutomatic(role_id, nextClientId, reseller_id, client_name, client_email_id, client_phone_no, created_by);

        if (!userCreationResult.success) {
            console.log("User creation failed:", userCreationResult.message);
        } else {
            console.log("User creation result:", userCreationResult.message);
        }

        return true;

    } catch (error) {
        console.error("Error in addNewClient:", error.message);
        throw error;
    }
}

async function updateCommission(req) {
    try {
        const { chargerID, reseller_commission, modified_by } = req.body;
        const db = await database.connectToDatabase();
        const ChargerCollection = db.collection("charger_details");

        if (!chargerID || reseller_commission === undefined || !modified_by) {
            throw new Error(`Commission update fields are not available`);
        }
        const where = { charger_id: chargerID };
        const update = {
            $set: {
                reseller_commission: reseller_commission,
                modified_by: modified_by,
                modified_date: new Date()
            }
        };

        const result = await ChargerCollection.updateOne(where, update);

        if (result.modifiedCount === 0) {
            throw new Error(`Record not found to update reseller commission`);
        }

        return true;

    } catch (error) {
        logger.error(`Error in update commission: ${error}`);
        throw new Error(error.message)
    }
}

//UpdateClient
async function updateClient(req) {
    try {
        const { client_id, client_name, client_phone_no, client_address, modified_by, status, client_wallet } = req.body;
        const db = await database.connectToDatabase();
        const clientCollection = db.collection("client_details");

        if (!client_id || !client_name || !client_phone_no || !client_address || !modified_by || !client_wallet) {
            throw new Error(`Client update fields are not available`);
        }

        const where = { client_id: client_id };

        const updateDoc = {
            $set: {
                client_name: client_name,
                client_phone_no: client_phone_no,
                client_address: client_address,
                client_wallet: parseFloat(client_wallet),
                status: status,
                modified_by: modified_by,
                modified_date: new Date()
            }
        };

        const result = await clientCollection.updateOne(where, updateDoc);

        if (result.modifiedCount === 0) {
            throw new Error(`Client not found to update`);
        }

        return true;

    } catch (error) {
        logger.error(`Error in update client: ${error}`);
        throw new Error(error.message)
    }
}
 
// DeActivate or Activate Client
async function DeActivateClient(req) {
    const { client_id, modified_by, status } = req.body;

    try {
        const db = await database.connectToDatabase();
        const clientCollection = db.collection("client_details");

        // Check if the user exists
        const existingUser = await clientCollection.findOne({ client_id: client_id });
        if (!existingUser) {
            return { error: true, status: 404, message: 'User not found' };
        }

        // Update user status
        const updateResult = await clientCollection.updateOne(
            { client_id: client_id },
            {
                $set: {
                    status: status,
                    modified_by: modified_by,
                    modified_date: new Date()
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return { error: true, status: 500, message: 'Failed to update status' };
        }

        return { error: false, status: 200, message: 'Client status updated successfully' };

    } catch (error) {
        logger.error(`Error in deactivating client: ${error}`);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
}

// 5.Manage User
//FetchUser
async function FetchUser(req) {
    try {
        const reseller_id = req.body.reseller_id;
       
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const rolesCollection = db.collection("user_roles");
        const resellerCollection = db.collection("reseller_details");
        const clientCollection = db.collection("client_details");
        const associationCollection = db.collection("association_details");

        // Query to fetch users with role_id 1 or 2
        const users = await usersCollection.find({ role_id: { $in: [2, 3] }, reseller_id }).toArray();

        // Extract all unique role_ids, reseller_ids, client_ids, and association_ids from users
        const roleIds = [...new Set(users.map(user => user.role_id))];
        const resellerIds = [...new Set(users.map(user => user.reseller_id))];
        const clientIds = [...new Set(users.map(user => user.client_id))];
        const associationIds = [...new Set(users.map(user => user.association_id))];

        // Fetch roles based on role_ids
        const roles = await rolesCollection.find({ role_id: { $in: roleIds } }).toArray();
        const roleMap = new Map(roles.map(role => [role.role_id, role.role_name]));

        // Fetch resellers based on reseller_ids
        let resellers, resellerMap;
        if (resellerIds) {
            resellers = await resellerCollection.find({ reseller_id: { $in: resellerIds } }).toArray();
            resellerMap = new Map(resellers.map(reseller => [reseller.reseller_id, reseller.reseller_name]));
        }

        // Fetch clients based on client_ids
        let clients, clientMap;
        if (clientIds) {
            clients = await clientCollection.find({ client_id: { $in: clientIds } }).toArray();
            clientMap = new Map(clients.map(client => [client.client_id, client.client_name]));
        }

        // Fetch associations based on association_ids
        let associations, associationMap;
        if (associationIds) {
            associations = await associationCollection.find({ association_id: { $in: associationIds } }).toArray();
            associationMap = new Map(associations.map(association => [association.association_id, association.association_name]));
        }

        // Attach additional details to each user
        const usersWithDetails = users.map(user => ({
            ...user,
            role_name: roleMap.get(user.role_id) || 'Unknown',
            reseller_name: resellerMap.get(user.reseller_id) || null,
            client_name: clientMap.get(user.client_id) || null,
            association_name: associationMap.get(user.association_id) || null
        }));

        // Return the users with all details
        return usersWithDetails;
    } catch (error) {
        logger.error(`Error fetching users by role_id: ${error}`);
        throw new Error('Error fetching users by role_id');
    }
}

//FetchSpecificUserRoleForSelection
async function FetchSpecificUserRoleForSelection() {
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("user_roles");

        // Query to fetch all reseller_id and reseller_name
        const roles = await usersCollection.find(
            { role_id: { $in: [3] }, status: true }, // Filter to fetch role_id 1 and 2
            {
                projection: {
                    role_id: 1,
                    role_name: 1,
                    _id: 0 // Exclude _id from the result
                }
            }
        ).toArray();
        // Return the users data
        return roles;
    } catch (error) {
        logger.error(`Error fetching users: ${error}`);
        throw new Error('Error fetching users');
    }
}
// FetchClientForSelection
async function FetchClientForSelection(req) {
    try {
        // Get the reseller_id from the request body
        const reseller_id = req.body.reseller_id;

        // Connect to the database
        const db = await database.connectToDatabase();
        const clientsCollection = db.collection("client_details");
        const usersCollection = db.collection("users");

        // Fetch all reseller_id from the users table
        const userClientIds = await usersCollection.distinct("client_id");

        // Query to fetch the specified client_id but exclude those already in users table
        const clients = await clientsCollection.find(
            {
                status: true,
                reseller_id: reseller_id,
                client_id: { $nin: userClientIds } // Exclude clients whose client_id is in the list from the users table
            },
            {
                projection: {
                    client_id: 1,
                    client_name: 1,
                    _id: 0 // Exclude _id from the result
                }
            }
        ).toArray();

        return clients;
    } catch (error) {
        // Log the error
        logger.error(`Error fetching clients: ${error}`);
        throw new Error('Error fetching clients');
    }
}

// Create User
async function CreateUser(req) {
    try {
        const { role_id, reseller_id, client_id, username, email_id, password, phone_no, created_by } = req.body;

        // Validate input
        if (!username || !role_id || !email_id || !password || !created_by || !reseller_id || !client_id) {
            return { error: true, status: 400, message: 'Username, Role ID, Email, reseller id, client id, Password, and Created By are required' };
        }

        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const UserRole = db.collection("user_roles");

        // Check if the role ID exists
        const existingRole = await UserRole.findOne({ role_id: role_id });
        if (!existingRole) {
            return { error: true, status: 400, message: 'Invalid Role ID' };
        }

        // Check for duplicate email with same role
        const duplicateEmailWithRole = await Users.findOne({ role_id: role_id, email_id: email_id });
        if (duplicateEmailWithRole) {
            return { error: true, status: 409, message: "This email is already registered under the same role" };
        }

        // Determine new user_id
        const lastUser = await Users.find().sort({ user_id: -1 }).limit(1).toArray();
        const newUserId = lastUser.length > 0 ? lastUser[0].user_id + 1 : 1;

        // Insert new user
        const insertResult = await Users.insertOne({
            role_id,
            reseller_id,
            client_id,
            association_id: null,
            user_id: newUserId,
            tag_id: null,
            assigned_association: null,
            username,
            email_id,
            password: parseInt(password),
            phone_no,
            wallet_bal: 0,
            autostop_time: null,
            autostop_unit: null,
            autostop_price: null,
            autostop_time_is_checked: null,
            autostop_unit_is_checked: null,
            autostop_price_is_checked: null,
            created_by,
            created_date: new Date(),
            modified_by: null,
            modified_date: null,
            status: true
        });

        if (insertResult.insertedId) {
            return { error: false, status: 200, message: 'New user created successfully' };
        } else {
            return { error: true, status: 500, message: 'User creation failed' };
        }

    } catch (error) {
        console.error("Error creating user:", error);
        logger.error(error);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
}

// Update User
async function UpdateUser(req) {
    try {
        const { user_id, username, phone_no, password, wallet_bal, modified_by, status } = req.body;

        // Validate input
        if (!user_id || !username || !password || !modified_by) {
            return { error: true, status: 400, message: 'User ID, Username, Password, and Modified By are required' };
        }

        const db = await database.connectToDatabase();
        const Users = db.collection("users");

        // Check if user exists
        const existingUser = await Users.findOne({ user_id: user_id });
        if (!existingUser) {
            return { error: true, status: 404, message: 'User not found' };
        }

        // Update the user
        const updateResult = await Users.updateOne(
            { user_id: user_id },
            {
                $set: {
                    username: username,
                    phone_no: phone_no,
                    wallet_bal: parseFloat(wallet_bal) || parseFloat(existingUser.wallet_bal),
                    modified_date: new Date(),
                    modified_by: modified_by,
                    password: parseInt(password),
                    status: status,
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return { error: true, status: 500, message: 'Failed to update user' };
        }

        return { error: false, status: 200, message: 'User updated successfully' };

    } catch (error) {
        console.error("Error in UpdateUser:", error);
        logger.error(error);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
}
// 6.Withdrawal
// FetchCommissionAmtReseller
async function FetchCommissionAmtReseller(req, res) {
    const { user_id } = req.body;
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const resellersCollection = db.collection("reseller_details");

        // Fetch the user with the specified user_id
        const user = await usersCollection.findOne({ user_id: user_id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract reseller_id from the user object
        const resellerId = user.reseller_id;

        if (!resellerId) {
            return res.status(404).json({ message: 'Reseller ID not found for this user' });
        }

        // Fetch the reseller with the specified reseller_id
        const reseller = await resellersCollection.findOne({ reseller_id: resellerId });

        if (!reseller) {
            return res.status(404).json({ message: 'Reseller not found' });
        }

        // Extract reseller_wallet from reseller object
        const resellerWallet = reseller.reseller_wallet;

        return resellerWallet;


    } catch (error) {
        console.error(`Error fetching reseller wallet balance: ${error}`);
        logger.error(`Error fetching reseller wallet balance: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// saveUserBankDetails
async function saveUserBankDetails(req) {
    try {
        const { accountHolderName, bankName, accountNumber, ifscNumber, created_by, user_id } = req.body;

        // Validate the input
        if (!accountHolderName || !bankName || !accountNumber || !ifscNumber || !created_by || !user_id) {
            return { error: true, status: 400, message: 'All bank details are required' };
        }

        const db = await database.connectToDatabase();
        const BankDetails = db.collection("bank_details");
        const usersCollection = db.collection("users");

        // Check if the user exists
        const existingUser = await usersCollection.findOne({ user_id: user_id });
        if (!existingUser) {
            return { error: true, status: 404, message: 'User not found' };
        }

        // Check if the bank details already exist for this user
        const existingUserBankDetails = await BankDetails.findOne({ user_id });
        if (existingUserBankDetails) {
            return { error: true, status: 400, message: 'User already has bank details registered' };
        }

        // Insert new bank details
        await BankDetails.insertOne({
            accountHolderName,
            bankName,
            accountNumber,
            ifscNumber,
            created_by,
            user_id,
            created_date: new Date(),
            modified_by: null,
            modified_date: null,
            status: true
        });

        return { error: false, status: 201, message: 'Bank details saved successfully' };

    } catch (error) {
        console.error("Error in saveUserBankDetails:", error);
        logger.error(error);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
}

// fetchUserBankDetails
async function fetchUserBankDetails(req) {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return { error: true, status: 400, message: 'User ID is required' };
        }

        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const BankDetails = db.collection("bank_details");

        const user = await Users.findOne({ user_id });

        if (!user) {
            return { error: true, status: 404, message: 'No user found' };
        }

        const bankDetails = await BankDetails.findOne({ user_id: user.user_id });

        if (!bankDetails) {
            return { error: true, status: 404, message: 'No bank details found for this user' };
        }

        return { error: false, status: 200, data: bankDetails };

    } catch (error) {
        console.error('Controller error:', error);
        logger.error(error);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
}

// updateUserBankDetails
async function updateUserBankDetails(req) {
    try {
        const { _id, user_id, accountHolderName, bankName, accountNumber, ifscNumber, modified_by } = req.body;

        if (!_id || !user_id || !accountNumber) {
            return { error: true, status: 400, message: 'User ID, Account Number, and Bank ID are required' };
        }

        const objectId = new ObjectId(_id);
        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const BankDetails = db.collection("bank_details");

        const existingUser = await Users.findOne({ user_id });
        if (!existingUser) {
            return { error: true, status: 404, message: 'User not found' };
        }

        const existingBankDetails = await BankDetails.findOne({ _id: objectId });
        if (!existingBankDetails) {
            return { error: true, status: 404, message: 'Bank details not found' };
        }

        const updateFields = {
            ...(accountHolderName && { accountHolderName }),
            ...(accountNumber && { accountNumber }),
            ...(bankName && { bankName }),
            ...(ifscNumber && { ifscNumber }),
            modified_by,
            modified_date: new Date()
        };

        const result = await BankDetails.updateOne({ _id: objectId }, { $set: updateFields });

        if (result.modifiedCount === 0) {
            return { error: true, status: 400, message: 'No changes made to bank details' };
        }

        return { error: false, status: 200, message: 'Bank details updated successfully' };

    } catch (error) {
        console.error('Controller Error:', error);
        logger.error(error);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
}

// Function to ApplyWithdrawal
async function ApplyWithdrawal(user_id, withdrawalAmount, accountHolderName, accountNumber, bankName, withdrawal_req_by, ifscNumber) {
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const resellersCollection = db.collection("reseller_details");
        const bankDetailsCollection = db.collection("bank_details");
        const withdrawalCollection = db.collection("withdrawal_details");

        // Check if user exists
        const user = await usersCollection.findOne({ user_id });
        if (!user) return { status: 'Failed', message: 'User not found' };

        // Check if reseller exists
        const reseller = await resellersCollection.findOne({ reseller_id: user.reseller_id });
        if (!reseller) return { status: 'Failed', message: 'Reseller not found' };

        // Check if bank details exist
        const bankDetails = await bankDetailsCollection.findOne({ user_id });
        if (!bankDetails) return { status: 'Failed', message: 'No bank details found for this user' };

        // Check if the user has any pending or in-progress withdrawal requests
        const existingWithdrawals = await withdrawalCollection.find({ user_id }).toArray();
        const hasPendingWithdrawal = existingWithdrawals.some(w => w.withdrawal_approved_status !== "Rejected" && w.withdrawal_approved_status !== "Completed");

        if (hasPendingWithdrawal) {
            return {
                status: 'Failed',
                message: 'Withdrawal already in process or pending. Request again after payment.'
            };
        }

        // Validate withdrawal amount and commission (2% deduction)
        const commissionAmount = (withdrawalAmount * 2) / 100;
        const totalAmountAfterCommission = withdrawalAmount - commissionAmount;

        if (totalAmountAfterCommission <= 0) {
            return { status: 'Failed', message: 'Invalid withdrawal amount after commission deduction.' };
        }

        // Create withdrawal request
        const withdrawalData = {
            reseller_id: user.reseller_id,
            user_id,
            totalWithdrawalAmount: withdrawalAmount,
            withdrawalAmount: totalAmountAfterCommission,
            commissionAmount,
            accountHolderName,
            accountNumber,
            bankName,
            withdrawal_req_by,
            withdrawal_req_date: new Date(),
            ifscNumber,
            withdrawal_approved_status: "Pending",
            withdrawal_approved_by: null,
            withdrawal_approved_date: null,
            superadmin_notification_status: "unread" // New field
        };

        await withdrawalCollection.insertOne(withdrawalData);

        return { status: 'Success', message: 'Withdrawal request submitted successfully. Your payment will be processed soon.' };
    } catch (error) {
        console.error('Error processing withdrawal request:', error);
        return { status: 'Failed', message: 'Error processing withdrawal request' };
    }
}

// Function to fetch payment request details
async function FetchPaymentRequest(user_id) {
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const resellersCollection = db.collection("reseller_details");
        const withdrawalCollection = db.collection("withdrawal_details");

        // Fetch user details
        const user = await usersCollection.findOne({ user_id });
        if (!user) return { status: 'Failed', message: 'User not found' };

        // If user has a reseller_id, fetch reseller details
        let resellerData = null;
        if (user.reseller_id) {
            resellerData = await resellersCollection.findOne({ reseller_id: user.reseller_id });
        }

        // Fetch all withdrawal details related to user_id
        const withdrawalDetails = await withdrawalCollection.find({ user_id }).toArray();

        // Return all the fetched data
        return {
            status: 'Success',
            user,
            resellerData,
            withdrawalDetails
        };
    } catch (error) {
        console.error(`Error fetching payment request details: ${error}`);
        return { status: 'Failed', message: 'Error fetching payment request details' };
    }
}

// Function to fetch payment request details with unread notification count
async function FetchPaymentNotification(user_id) {
    try {
        const db = await database.connectToDatabase();
        const withdrawalCollection = db.collection("withdrawal_details");
        const usersCollection = db.collection("users");

        // Ensure user_id is a number (if stored as a number in DB)
        if (typeof user_id !== "number") {
            return { status: 'Failed', message: 'Invalid user_id' };
        }

        // Fetch user details
        const user = await usersCollection.findOne({ user_id });
        if (!user) {
            return { status: 'Failed', message: 'User not found' };
        }

        // Fetch all withdrawal details related to user_id
        const withdrawalDetails = await withdrawalCollection.find({ user_id }).toArray();

        if (withdrawalDetails.length === 0) {
            return { status: 'Failed', message: 'No withdrawal requests found' };
        }

        // Count unread notifications
        const unreadNotifications = withdrawalDetails.filter(w => w.rca_admin_notification_status === "unread").length;

        // Fetch related user details for each withdrawal request
        const results = await Promise.all(withdrawalDetails.map(async (withdrawal) => {
            const user = await usersCollection.findOne({ user_id: withdrawal.user_id });

            // If withdrawal has unread notification, include user details
            let withdrawal_notification = null;
            if (withdrawal.rca_admin_notification_status === "unread" && user) {
                withdrawal_notification = {
                    _id: withdrawal._id, // Include _id in the notification details
                    user_id: withdrawal.user_id,
                    withdrawal_approved_status: withdrawal.withdrawal_approved_status || "Unknown",
                    username: user.username || "Unknown",
                    email_id: user.email_id || "Unknown",
                    phone_no: user.phone_no || "Unknown"
                };
            }

            return {
                notificationCount: unreadNotifications,
                withdrawal_notification,
            };
        }));
        return results;
    } catch (error) {
        console.error('Error fetching payment notification:', error);
        return { status: 'Failed', message: 'Error fetching payment notification' };
    }
}

// Function to MarkNotificationRead
async function MarkNotificationRead(_id, rca_admin_notification_status) {
    try {
        // Connect to the database
        const db = await database.connectToDatabase();
        const withdrawalCollection = db.collection("withdrawal_details");

        // Convert _id to ObjectId
        const objectId = new ObjectId(_id);

        // Fetch the current status of the notification
        const withdrawal = await withdrawalCollection.findOne({ _id: objectId });

        // Check if it's already marked as "read"
        if (withdrawal.rca_admin_notification_status === "read") {
            return { status: 'Failed', message: 'Notification already marked as read' };
        }

        // Prepare update fields
        let updateFields = {
            rca_admin_notification_status
        };

        // Update the withdrawal request
        const updateResult = await withdrawalCollection.updateOne(
            { _id: objectId }, // Use ObjectId
            { $set: updateFields }
        );

        // Check if the update was successful
        if (updateResult.modifiedCount > 0) {
            return { status: 'Success', message: 'Mark notification read successfully' };
        } else {
            return { status: 'Failed', message: 'No mark notification read failed' };
        }

    } catch (error) {
        console.error('Error in MarkNotificationRead function:', error);
        return { status: 'Failed', message: `Internal server error: ${error.message}` };
    }
}

// 9.Manage Device & Revenue Report Controller
//FetchReportDevice
async function FetchReportDevice(req) {
    try {
        const { reseller_id } = req.body;

        // Validation: Check if reseller_id is provided
        if (!reseller_id) {
            return { success: false, message: "Reseller ID is required." };
        }

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Fetch chargers that belong to the specified reseller_id
        const chargers = await devicesCollection.find({ assigned_reseller_id: reseller_id }).toArray();

        // Validation: Check if chargers exist for the reseller_id
        if (chargers.length === 0) {
            return { success: false, message: "No chargers found for this reseller ID." };
        }

        return chargers;

    } catch (error) {
        console.error(`Error fetching chargers: ${error}`);
        return { success: false, message: "Failed to fetch chargers." };
    }
}

function validateAndConvertDates(from_date, to_date) {
    // Regular expression to match YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(from_date) || !dateRegex.test(to_date)) {
        return { status: 400, message: 'Invalid date format! Expected format: YYYY-MM-DD' };
    }

    // Convert string dates to Date objects
    const fromDate = new Date(`${from_date}T00:00:00.000Z`); // Start of the day (12:00 AM UTC)
    const toDate = new Date(`${to_date}T23:59:59.999Z`); // End of the day (11:59 PM UTC)

    // Ensure date conversion is valid
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return { status: 400, message: 'Invalid date! Please give valid date.' };
    }

    console.log("Valid Dates:");
    console.log("From Date:", fromDate.toISOString()); // Expecting "YYYY-MM-DDT00:00:00.000Z"
    console.log("To Date:", toDate.toISOString()); // Expecting "YYYY-MM-DDT23:59:59.999Z"

    return { fromDate, toDate, status: 200 };
}

// downloadDeviceReport
async function downloadDeviceReport(req) {
    try {
        const { from_date, to_date, device_id } = req.body;

        if (!from_date || !to_date || !device_id) {
            return {
                error: true,
                status: 400,
                message: 'from_date, to_date, and device_id are required!'
            };
        }

        const db = await database.connectToDatabase();
        const Collection = db.collection('device_session_details');

        const validateDate = validateAndConvertDates(from_date, to_date);
        if (validateDate.status !== 200) {
            return {
                error: true,
                status: validateDate.status,
                message: validateDate.message
            };
        }

        const sessions = await Collection.find({
            charger_id: device_id,
            stop_time: {
                $gte: validateDate.fromDate.toISOString(),
                $lte: validateDate.toDate.toISOString()
            }
        }).sort({ stop_time: -1 }).toArray();

        if (!sessions || sessions.length === 0) {
            return {
                error: true,
                status: 404,
                message: 'No device report found for the given period and device ID!'
            };
        }

        const totalRevenue = sessions.reduce((sum, session) => sum + Number(session.price || 0), 0);
        const totalKWH = sessions.reduce((sum, session) => sum + parseFloat(session.unit_consummed || 0), 0);

        const responseData = {
            device_id,
            totalKWH: totalKWH.toFixed(3),
            totalRevenue: totalRevenue.toFixed(2),
            sessions: sessions.map((session) => ({
                session_id: session.session_id || 'N/A',
                user: session.user || 'N/A',
                start_time: new Date(session.start_time).toLocaleString() || 'N/A',
                stop_time: new Date(session.stop_time).toLocaleString() || 'N/A',
                unit_consumed: session.unit_consummed ? `${session.unit_consummed} kWh` : '0 kWh',
                price: session.price ? `Rs. ${Number(session.price).toFixed(2)}` : 'Rs. 0.00'
            }))
        };

        return {
            error: false,
            status: 200,
            data: responseData
        };

    } catch (error) {
        console.error('Controller Error:', error);
        logger.error(error);
        return {
            error: true,
            status: 500,
            message: 'Internal Server Error'
        };
    }
}

// Route to fetch specific charger revenue list
async function FetchSpecificChargerRevenue(reseller_id) {
    try {
        const db = await database.connectToDatabase();
        if (!db) {
            return { status: "Error", message: "Database connection failed" };
        }

        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");
        const clientCollection = db.collection("client_details");

        // Convert reseller_id to Integer (to match MongoDB data type)
        const resellerId = parseInt(reseller_id);

        // Fetch chargers assigned to this reseller
        const chargers = await chargerCollection.find({ assigned_reseller_id: resellerId }).toArray();
        // console.log("Chargers found:", chargers);

        if (!chargers.length) {
            return { status: "Success", message: "No chargers found for this reseller", revenueData: [], TotalChargerRevenue: "0.000" };
        }

        let TotalChargerRevenue = 0; // Store total revenue across all chargers

        const revenueData = await Promise.all(chargers.map(async (charger) => {
            // Fetch client email based on reseller_id
            const client = await clientCollection.findOne({ reseller_id: resellerId });
            const client_email_id = client?.client_email_id || null;

            // Fetch session revenue details
            const sessions = await sessionCollection.find({
                charger_id: charger.charger_id,
                start_time: { $ne: null },
                stop_time: { $ne: null }
            }).toArray();

            // Calculate revenue for this charger
            const Revenue = sessions.reduce((sum, session) => {
                return sum + parseFloat(session.reseller_commission || 0);
            }, 0);

            // Add this charger's revenue to total revenue
            TotalChargerRevenue += Revenue;

            return {
                charger_id: charger.charger_id,
                client_email_id,
                Revenue: Revenue.toFixed(3)
            };
        }));

        return {
            status: "Success",
            revenueData,
            TotalChargerRevenue: TotalChargerRevenue.toFixed(3) // Return total revenue across all chargers
        };
    } catch (error) {
        console.error(`Error fetching specific charger revenue: ${error.message}`);
        return { status: "Error", message: "Error fetching specific charger revenue" };
    }
}

// Route to fetch charger list with all cost with revenue
async function FetchChargerListWithAllCostWithRevenue(reseller_id) {
    try {
        const db = await database.connectToDatabase();
        if (!db) {
            return { status: "Error", message: "Database connection failed" };
        }

        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");
        const clientCollection = db.collection("client_details");

        // Convert reseller_id to Integer (to match MongoDB data type)
        const resellerId = parseInt(reseller_id);

        // Fetch chargers assigned to this reselle
        const chargers = await chargerCollection.find({ assigned_reseller_id: resellerId }).toArray();
        console.log("Chargers found:", chargers);

        if (!chargers.length) {
            return { status: "Success", message: "No chargers found for this client", revenueData: [], TotalChargerRevenue: "0.000" };
        }

        const revenueData = await Promise.all(chargers.map(async (charger) => {
            // Fetch client email based on reseller_id
            const client = await clientCollection.findOne({ reseller_id: resellerId });
            const client_email_id = client?.client_email_id || null;

            // Fetch session revenue details
            const sessions = await sessionCollection.find({
                charger_id: charger.charger_id,
                start_time: { $ne: null },
                stop_time: { $ne: null }
            }).toArray();

            return {
                charger_id: charger.charger_id,
                sessions: sessions.map(session => ({
                    charger_id: charger.charger_id,
                    session_id: session.session_id,
                    client_email_id,
                    Revenue: parseFloat(session.reseller_commission || 0).toFixed(3),
                })),
            };
        }));

        return {
            status: "Success",
            revenueData,
        };
    } catch (error) {
        console.error(`Error fetching specific charger revenue: ${error.message}`);
        return { status: "Error", message: "Error fetching specific charger revenue" };
    }
}

// 8.Profile Controller
//FetchUserProfile
async function FetchUserProfile(req) {
    const { user_id } = req.body;

    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

        // Aggregation pipeline to join users and reseller_details collections
        const result = await usersCollection.aggregate([
            { $match: { user_id: parseInt(user_id) } },
            {
                $lookup: {
                    from: 'reseller_details',
                    localField: 'reseller_id',
                    foreignField: 'reseller_id',
                    as: 'reseller_details'
                }
            },
            {
                $project: {
                    _id: 0,
                    user_id: 1,
                    username: 1,
                    email_id: 1,
                    phone_no: 1,
                    password: 1,
                    wallet_bal: 1,
                    autostop_time: 1,
                    autostop_unit: 1,
                    autostop_price: 1,
                    autostop_time_is_checked: 1,
                    autostop_unit_is_checked: 1,
                    autostop_price_is_checked: 1,
                    created_date: 1,
                    modified_date: 1,
                    created_by: 1,
                    modified_by: 1,
                    status: 1,
                    reseller_details: 1
                }
            }
        ]).toArray();

        if (result.length === 0) {
            return { status: 404, message: 'User not found' };
        }

        const userProfile = result[0];

        return { status: 200, data: userProfile };

    } catch (error) {
        logger.error(`Error fetching user profile: ${error}`);
        return { status: 500, message: 'Internal Server Error' };
    }
}

//UpdateUserProfile
async function UpdateUserProfile(req) {
    const { user_id, username, phone_no, password } = req.body;

    try {
        // Validate required fields
        if (!user_id || !username || !phone_no || !password) {
            return {
                error: true,
                status: 400,
                message: 'User ID, username, phone number, and password are required'
            };
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

        // Check if the user exists
        const existingUser = await usersCollection.findOne({ user_id });
        if (!existingUser) {
            return {
                error: true,
                status: 404,
                message: 'User not found'
            };
        }

        const updateResult = await usersCollection.updateOne(
            { user_id },
            {
                $set: {
                    username,
                    phone_no,
                    password,
                    modified_date: new Date(),
                    modified_by: username
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return {
                error: true,
                status: 404,
                message: 'User not found'
            };
        }

        if (updateResult.modifiedCount === 0) {
            return {
                error: true,
                status: 400,
                message: 'No changes made to the user profile'
            };
        }

        return {
            error: false,
            status: 200,
            message: 'User profile updated successfully'
        };
    } catch (error) {
        console.error(`Error updating user profile: ${error}`);
        logger.error(error);
        return {
            error: true,
            status: 500,
            message: 'Internal Server Error'
        };
    }
}

//UpdateResellerProfile
async function UpdateResellerProfile(req) {
    const { reseller_id, modified_by, reseller_phone_no, reseller_address } = req.body;

    try {
        // Validate required fields
        if (!reseller_id || !modified_by || !reseller_phone_no || !reseller_address) {
            return {
                error: true,
                status: 400,
                message: 'Reseller ID, modified_by, phone number, and reseller address are required'
            };
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("reseller_details");

        // Update the reseller profile
        const updateResult = await usersCollection.updateOne(
            { reseller_id },
            {
                $set: {
                    reseller_phone_no,
                    reseller_address,
                    modified_date: new Date(),
                    modified_by
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return {
                error: true,
                status: 404,
                message: 'Reseller not found'
            };
        }

        if (updateResult.modifiedCount === 0) {
            return {
                error: true,
                status: 400,
                message: 'No changes made to the reseller profile'
            };
        }

        return {
            error: false,
            status: 200,
            message: 'Reseller profile updated successfully'
        };

    } catch (error) {
        console.error(`Error updating Reseller profile: ${error}`);
        logger.error(`Error updating Reseller profile: ${error}`);
        return {
            error: true,
            status: 500,
            message: 'Internal Server Error'
        };
    }
}

module.exports = {
    authenticate, FetchTotalUsers, FetchTotalCharger, FetchOnlineCharger, FetchOfflineCharger, FetchFaultsCharger, FetchChargerTotalEnergy, FetchTotalChargersSession,
    FetchAllocatedCharger, FetchUnAllocatedCharger, DeActivateOrActivateCharger, AssginChargerToClient, FetchClientUserToAssginCharger, FetchUnAllocatedChargerToAssgin,
    FetchClients, FetchAssignedAssociation, FetchChargerDetailsWithSession, addNewClient, updateClient, DeActivateClient, updateCommission,
    FetchUser, FetchSpecificUserRoleForSelection, FetchClientForSelection, CreateUser, UpdateUser,
    FetchCommissionAmtReseller, saveUserBankDetails, fetchUserBankDetails, updateUserBankDetails, ApplyWithdrawal, FetchPaymentRequest, FetchPaymentNotification, MarkNotificationRead, 
    FetchReportDevice, downloadDeviceReport, FetchSpecificChargerRevenue, FetchChargerListWithAllCostWithRevenue,
    FetchUserProfile, UpdateUserProfile, UpdateResellerProfile,
};