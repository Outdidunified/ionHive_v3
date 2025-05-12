const database = require('../config/db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
const { ObjectId } = require("mongodb"); // Import ObjectId
const Emailler = require('../Emailer/controller');
const logger = require('../utils/logger');

// 1.Login Controller
// login function
const authenticate = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 'Failed', message: 'Email and Password required' });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection('users');
        const clientCollection = db.collection('client_details');

        const user = await usersCollection.findOne({ email_id: email, role_id: 3, status: true });

        if (!user || user.password !== password || user.role_id !== 3) {
            return res.status(401).json({ status: 'Failed', message: 'Invalid credentials or user is deactivated' });
        }

        const getclientDetails = await clientCollection.findOne({ client_id: user.client_id, status: true });

        if (!getclientDetails) {
            return res.status(404).json({ status: 'Failed', message: 'Client details not found or deactivated' });
        }

        const token = jwt.sign({ username: user.username }, JWT_SECRET);

        return res.status(200).json({
            status: 'Success',
            user: {
                client_name: getclientDetails.client_name,
                client_id: getclientDetails.client_id,
                reseller_id: user.reseller_id,
                user_id: user.user_id,
                username: user.username,
                email_id: user.email_id,
                role_id: user.role_id,
            },
            token: token
        });

    } catch (error) {
        console.error('Error in authenticate:', error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
};

// 2.Dashboard
// Function to fetch chargers assigned to a specific client
const FetchTotalCharger = async (req, res) => {
    try {
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        const db = await database.connectToDatabase();

        if (!db) {
            console.error("Database connection failed!");
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const chargerCollection = db.collection("charger_details");

        const recentChargers = await chargerCollection.find({
            assigned_client_id: client_id
        }).toArray();

        const totalCount = recentChargers.length;

        if (totalCount === 0) {
            return res.status(200).json({ status: 'Success', totalCount, message: 'No chargers found' });
        }

        return res.status(200).json({ status: 'Success', totalCount, data: recentChargers });

    } catch (error) {
        console.error('Error in FetchTotalCharger:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger details' });
    }
};

// fetch FetchOnlineCharger
async function FetchOnlineCharger(req, res) {
    try {
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        console.log("Fetching online chargers for client_id:", client_id);

        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");
        const statusCollection = db.collection("charger_status");

        // Get chargers assigned to the client
        const assignedChargers = await chargerCollection.find({ assigned_client_id: client_id }).toArray();

        if (!assignedChargers.length) {
            return res.status(200).json({ status: 'Success', totalCount: 0, message: "No chargers assigned to this client" });
        }

        const chargerIds = assignedChargers.map(charger => charger.charger_id);

        const currentTime = new Date();
        const oneHourAgo = new Date(currentTime.getTime() - (1 * 60 * 60 * 1000));

        // Find online chargers
        const onlineChargers = await statusCollection.find({
            charger_id: { $in: chargerIds },
            timestamp: { $gte: oneHourAgo },
            error_code: "NoError"
        }).toArray();

        const totalCount = onlineChargers.length;

        if (totalCount === 0) {
            return res.status(200).json({ status: 'Success', totalCount, message: "No online chargers found in the last hour" });
        }

        return res.status(200).json({ status: 'Success', totalCount, data: onlineChargers });

    } catch (error) {
        console.error('Error in FetchOnlineCharger:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch online chargers' });
    }
}

// fetch FetchOfflineCharger
async function FetchOfflineCharger(req, res) {
    try {
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        console.log("Fetching offline chargers for client_id:", client_id);

        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");
        const statusCollection = db.collection("charger_status");

        // Get chargers assigned to the client
        const assignedChargers = await chargerCollection.find({ assigned_client_id: client_id }).toArray();

        if (!assignedChargers.length) {
            return res.status(200).json({ status: 'Success', totalCount: 0, message: "No chargers assigned to this client" });
        }

        const chargerIds = assignedChargers.map(charger => charger.charger_id);
        console.log("Charger IDs assigned to client:", chargerIds);

        const currentTime = new Date();
        const oneHourAgo = new Date(currentTime.getTime() - (1 * 60 * 60 * 1000));

        // Find offline chargers
        const offlineChargers = await statusCollection.find({
            charger_id: { $in: chargerIds },
            timestamp: { $lt: oneHourAgo }, // Last updated before 1 hour
            // error_code is not checked here, because offline chargers might have any status
        }).toArray();

        const totalCount = offlineChargers.length;

        if (totalCount === 0) {
            return res.status(200).json({ status: 'Success', totalCount, message: "No offline chargers found" });
        }

        return res.status(200).json({ status: 'Success', totalCount, data: offlineChargers });

    } catch (error) {
        console.error('Error in FetchOfflineCharger:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch offline chargers' });
    }
}

// Fetch Faulty Chargers Function
async function FetchFaultsCharger(req, res) {
    try {
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        console.log("Fetching faulty chargers for client_id:", client_id);

        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");
        const statusCollection = db.collection("charger_status");

        // Get charger IDs assigned to the client
        const assignedChargers = await chargerCollection.find({ assigned_client_id: client_id }).toArray();

        if (!assignedChargers.length) {
            return res.status(200).json({ status: 'Success', totalCount: 0, message: "No chargers assigned to this client" });
        }

        const chargerIds = assignedChargers.map(charger => charger.charger_id);
        console.log("Charger IDs assigned to client:", chargerIds);

        const currentTime = new Date();
        const oneHourAgo = new Date(currentTime.getTime() - (1 * 60 * 60 * 1000));

        // Find faulty chargers
        const faultyChargers = await statusCollection.find({
            charger_id: { $in: chargerIds },
            timestamp: { $gte: oneHourAgo }, // Modified within the last 1 hour
            error_code: { $ne: "NoError" }   // error_code not equal to "NoError"
        }).toArray();

        const totalCount = faultyChargers.length;

        if (totalCount === 0) {
            return res.status(200).json({ status: 'Success', totalCount, message: "No faulty chargers found" });
        }

        return res.status(200).json({ status: 'Success', totalCount, data: faultyChargers });

    } catch (error) {
        console.error('Error in FetchFaultsCharger:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch faulty chargers' });
    }
}

// Fetch Charger Total Energy Function
async function FetchChargerTotalEnergy(req, res) {
    try {
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        console.log("Fetching total energy for client_id:", client_id);

        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");

        const assignedChargers = await chargerCollection.find({ assigned_client_id: client_id }).toArray();

        if (!assignedChargers.length) {
            return res.status(200).json({
                status: 'Success',
                ChargerTotalEnergy: {
                    totalEnergyConsumed: 0,
                    CO2_from_EV: 0,
                    CO2_from_ICE: 0,
                    CO2_Savings: 0,
                    daytodaytotalEnergyConsumed: [],
                    weeklyTotalEnergyConsumed: [],
                    monthlyTotalEnergyConsumed: [],
                    yearlyTotalEnergyConsumed: [],
                    message: "No chargers assigned to this reseller"
                }
            });
        }

        const chargerIds = assignedChargers.map(charger => charger.charger_id);
        console.log("Charger IDs assigned to reseller:", chargerIds);

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

        const daytodaytotalEnergyConsumed = (await sessionCollection.aggregate([
            matchStage, addFieldsStage,
            { $group: { _id: { $dateToString: { format: "%d/%m/%Y", date: "$start_time" } }, day2daytotalEnergyConsumed: { $sum: "$unit_consummed" } } },
            { $sort: { "_id": -1 } }
        ]).toArray()).map(entry => ({
            date: entry._id,
            totalEnergyConsumed: entry.day2daytotalEnergyConsumed
        }));

        const weeklyTotalEnergyConsumed = (await sessionCollection.aggregate([
            matchStage, addFieldsStage,
            { $group: { _id: { year: { $year: "$start_time" }, week: { $isoWeek: "$start_time" } }, totalEnergyConsumed: { $sum: "$unit_consummed" } } },
            { $sort: { "_id.year": -1, "_id.week": -1 } }
        ]).toArray()).map(entry => ({
            week: `Week ${entry._id.week} of ${entry._id.year}`,
            totalEnergyConsumed: entry.totalEnergyConsumed || 0
        }));

        const monthlyTotalEnergyConsumed = (await sessionCollection.aggregate([
            matchStage, addFieldsStage,
            { $group: { _id: { year: { $year: "$start_time" }, month: { $month: "$start_time" } }, totalEnergyConsumed: { $sum: "$unit_consummed" } } },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]).toArray()).map(entry => ({
            month: `${entry._id.year}-${String(entry._id.month).padStart(2, "0")}`,
            totalEnergyConsumed: entry.totalEnergyConsumed || 0
        }));

        const yearlyTotalEnergyConsumed = (await sessionCollection.aggregate([
            matchStage, addFieldsStage,
            { $group: { _id: { year: { $year: "$start_time" } }, totalEnergyConsumed: { $sum: "$unit_consummed" } } },
            { $match: { "_id.year": { $ne: null } } },
            { $sort: { "_id.year": -1 } }
        ]).toArray()).map(entry => ({
            year: entry._id.year,
            totalEnergyConsumed: entry.totalEnergyConsumed || 0
        }));

        const totalResult = await sessionCollection.aggregate([
            matchStage,
            { $group: { _id: null, totalEnergyConsumed: { $sum: { $toDouble: "$unit_consummed" } } } }
        ]).toArray();

        const totalEnergyConsumed = totalResult.length > 0 ? totalResult[0].totalEnergyConsumed : 0;

        const EV_EFFICIENCY = 6.5;
        const EV_CO2_PER_KWH = 0.02;
        const ICE_CO2_PER_KM = 0.35;

        const distanceDrivenByEV = totalEnergyConsumed / EV_EFFICIENCY;
        const CO2_from_ICE = distanceDrivenByEV * ICE_CO2_PER_KM;
        const CO2_from_EV = totalEnergyConsumed * EV_CO2_PER_KWH;
        const CO2_Savings = CO2_from_ICE - CO2_from_EV;

        res.status(200).json({
            status: 'Success',
            ChargerTotalEnergy: {
                daytodaytotalEnergyConsumed,
                weeklyTotalEnergyConsumed,
                monthlyTotalEnergyConsumed,
                yearlyTotalEnergyConsumed,
                totalEnergyConsumed,
                CO2_from_EV,
                CO2_from_ICE,
                CO2_Savings
            }
        });

    } catch (error) {
        console.error('Error in FetchChargerTotalEnergy:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger total energy' });
    }
}

// Fetch Total Charger Charging Sessions for a Specific client
async function FetchTotalChargersSession(req, res) {
    try {
        const { client_id } = req.body; // Get client_id from request body

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        console.log("Connecting to the database...");
        const db = await database.connectToDatabase();

        if (!db) {
            console.error("Database connection failed!");
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");

        // Find all chargers assigned to the given reseller
        const chargers = await chargerCollection.find({ assigned_client_id: client_id }).toArray();

        if (chargers.length === 0) {
            console.log("No chargers found for client_id:", client_id);
            return res.status(404).json({ status: 'Failed', message: 'No chargers found for this client' });
        }

        // Extract charger IDs
        const chargerIds = chargers.map(charger => charger.charger_id);

        // Count total sessions where charger_id matches the found chargers
        const totalCount = await sessionCollection.countDocuments({ charger_id: { $in: chargerIds } });

        return res.status(200).json({ status: 'Success', totalCount });
    } catch (error) {
        console.error(`Error fetching charger session count: ${error}`);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger session count' });
    }
}

// Fetch Total Associations, and App Users for a Specific client
async function FetchTotalUsers(req, res) {
    try {
        const { client_id } = req.body; // Get client_id from request body

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        const db = await database.connectToDatabase();

        if (!db) {
            console.error("Database connection failed!");
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const usersCollection = db.collection("users");

        // Fetch users assigned to this reseller
        const users = await usersCollection.find({ client_id: client_id }).toArray();

        if (users.length === 0) {
            console.log("No users found for client_id:", client_id);
            return res.status(404).json({ status: 'Failed', message: 'No users found for this client' });
        }

        // Count Associations (client_id and association_id exist)
        const associationsCount = users.filter(user => user.client_id && user.association_id).length;

        // Count App Users (role_id = 5)
        const appUsersCount = users.filter(user => user.role_id === 5).length;

        return res.status(200).json({
            status: 'Success',
            totalCounts: {
                associationsCount,
                appUsersCount
            }
        });
    } catch (error) {
        console.error(`Error fetching user counts: ${error}`);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch total associations, and app users' });
    }
}

// 3.Manage Device
// FetchAllocatedCharger
async function FetchAllocatedCharger(req, res) {
    try {
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");
        const configCollection = db.collection("socket_gun_config");

        // Aggregation to fetch chargers with association details and append unit_price
        const chargersWithClients = await devicesCollection.aggregate([
            {
                $match: { assigned_client_id: { $ne: null }, assigned_client_id: client_id }
            },
            {
                $lookup: {
                    from: 'association_details',
                    localField: 'assigned_association_id',
                    foreignField: 'association_id',
                    as: 'associationDetails'
                }
            },
            {
                $unwind: '$associationDetails'
            },
            {
                $addFields: {
                    association_name: '$associationDetails.association_name',
                    //unit_price: financeDetails.eb_charges // Append unit_price to each charger (optional)
                }
            },
            {
                $project: {
                    associationDetails: 0 // Exclude the full associationDetails object
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

        if (results.length === 0) {
            return res.status(404).json({ status: 'Failed', message: 'No allocated chargers found for this client' });
        }

        return res.status(200).json({ status: 'Success', data: results });
    } catch (error) {
        console.error(`Error fetching allocated chargers: ${error}`);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch allocated chargers' });
    }
}
 
// Controller DeActivateOrActivateCharger
async function DeActivateOrActivateCharger(req, res) {
    const { modified_by, charger_id, status } = req.body;

    // Validate input
    if (!modified_by || !charger_id || typeof status !== 'boolean') {
        return res.status(400).json({ status: 'Failed', message: 'Username, chargerID, and Status (boolean) are required' });
    }

    try {
        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Check if the charger exists
        const existingCharger = await devicesCollection.findOne({ charger_id: charger_id });
        if (!existingCharger) {
            return res.status(404).json({ status: 'Failed', message: 'chargerID not found' });
        }

        // Perform the update
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
            return res.status(500).json({ status: 'Failed', message: 'Failed to update charger' });
        }

        return res.status(200).json({ status: 'Success', message: 'Charger updated successfully' });
    } catch (error) {
        console.error('Error in DeActivateOrActivateCharger controller:', error);
        logger.error(error);
        return res.status(500).json({ status: 'Error', message: 'Something went wrong while updating charger' });
    }
}

// Controller FetchUnAllocatedCharger
async function FetchUnAllocatedCharger(req, res) {
    const { client_id } = req.body;

    // Validate input
    if (!client_id) {
        return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
    }

    try {
        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");
        const configCollection = db.collection("socket_gun_config");

        // Aggregation to fetch unallocated chargers with no association assigned
        const chargersWithoutAssociations = await devicesCollection.aggregate([
            {
                $match: { assigned_association_id: null, assigned_client_id: client_id }
            },
            {
                $lookup: {
                    from: 'association_details',
                    localField: 'assigned_association_id',
                    foreignField: 'association_id',
                    as: 'associationDetails'
                }
            },
            {
                $addFields: {
                    association_name: { $arrayElemAt: ['$associationDetails.association_name', 0] }
                }
            },
            {
                $project: {
                    associationDetails: 0
                }
            }
        ]).toArray();

        const results = [];

        for (let charger of chargersWithoutAssociations) {
            const chargerID = charger.charger_id;

            // Fetch corresponding socket/gun configuration
            const config = await configCollection.findOne({ charger_id: chargerID });

            let connectorDetails = [];

            if (config) {
                let connectorIndex = 1;
                while (config[`connector_${connectorIndex}_type`] !== undefined) {
                    let connectorTypeValue;
                    if (config[`connector_${connectorIndex}_type`] === 1) {
                        connectorTypeValue = "Socket";
                    } else if (config[`connector_${connectorIndex}_type`] === 2) {
                        connectorTypeValue = "Gun";
                    }

                    connectorDetails.push({
                        connector_type: connectorTypeValue || config[`connector_${connectorIndex}_type`],
                        connector_type_name: config[`connector_${connectorIndex}_type_name`]
                    });

                    connectorIndex++;
                }
            }

            results.push({
                ...charger,
                connector_details: connectorDetails.length > 0 ? connectorDetails : null
            });
        }

        return res.status(200).json({ status: 'Success', data: results });
    } catch (error) {
        console.error('Error in FetchUnAllocatedCharger controller:', error);
        return res.status(500).json({ status: 'Error', message: 'Failed to fetch unallocated chargers' });
    }
}

// Controller FetchAssociationUserToAssginCharger
async function FetchAssociationUserToAssginCharger(req, res) {
    const { client_id } = req.body;

    // Validate input
    if (!client_id) {
        return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
    }

    try {
        const db = await database.connectToDatabase();
        const associationCollection = db.collection("association_details");

        const users = await associationCollection.find({ client_id: parseInt(client_id), status: true }).toArray();

        if (users.length === 0) {
            return res.status(404).json({ status: 'Failed', message: 'No users found for the given client_id' });
        }

        return res.status(200).json({ status: 'Success', data: users });

    } catch (error) {
        console.error('Error in FetchAssociationUserToAssginCharger controller:', error);
        logger.error('Error in FetchAssociationUserToAssginCharger controller:', error);
        return res.status(500).json({ status: 'Error', message: 'Failed to fetch users' });
    }
}

// Controller FetchUnAllocatedChargerToAssgin
async function FetchUnAllocatedChargerToAssgin(req, res) {
    const { client_id } = req.body;

    // Validate input
    if (!client_id) {
        return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
    }

    try {
        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        const chargers = await devicesCollection.find({ assigned_association_id: null, assigned_client_id: client_id, status: true }).toArray();

        if (chargers.length === 0) {
            return res.status(404).json({ status: 'Failed', message: 'No unallocated chargers found for the given client_id' });
        }

        return res.status(200).json({ status: 'Success', data: chargers });

    } catch (error) {
        console.error('Error in FetchUnAllocatedChargerToAssgin controller:', error);
        logger.error('Error in FetchUnAllocatedChargerToAssgin controller:', error);
        return res.status(500).json({ status: 'Error', message: 'Failed to fetch unallocated chargers' });
    }
}

// Controller AssginChargerToAssociation
async function AssginChargerToAssociation(req, res) {
    const { association_id, charger_id, client_commission, modified_by } = req.body;

    // Validate required fields
    if (!association_id || !charger_id || !modified_by || !client_commission) {
        return res.status(400).json({ status: 'Failed', message: 'Association ID, Charger ID(s), client_commission, and Modified By are required' });
    }

    try {
        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Ensure charger_id is treated as an array
        const chargerIdsArray = Array.isArray(charger_id) ? charger_id : [charger_id];

        // Check if all the chargers exist
        const existingChargers = await devicesCollection.find({
            charger_id: { $in: chargerIdsArray }
        }).toArray();

        if (existingChargers.length !== chargerIdsArray.length) {
            return res.status(404).json({ status: 'Failed', message: 'One or more chargers not found' });
        }

        // Update chargers
        const result = await devicesCollection.updateMany(
            { charger_id: { $in: chargerIdsArray } },
            {
                $set: {
                    assigned_association_id: association_id,
                    client_commission: client_commission,
                    assigned_association_date: new Date(),
                    modified_date: new Date(),
                    modified_by
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(500).json({ status: 'Failed', message: 'Failed to assign chargers to association' });
        }

        return res.status(200).json({ status: 'Success', message: 'Chargers Successfully Assigned' });

    } catch (error) {
        console.error('Error in AssginChargerToAssociation controller:', error);
        return res.status(500).json({ status: 'Error', message: error.message || 'Failed to assign charger to association' });
    }
}

// 4.Manage Association
// Controller FetchAssociationUser
async function FetchAssociationUser(req, res) {
    try {
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Client ID is required'
            });
        }

        const db = await database.connectToDatabase();
        const associationCollection = db.collection("association_details");

        const users = await associationCollection.find({ client_id: parseInt(client_id) }).toArray();

        if (users.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No association found for the provided client_id'
            });
        }

        const reseller_ids = users.map(user => user.reseller_id);
        const client_ids = users.map(user => user.client_id);

        // Fetch reseller and client data
        const resellerCollection = db.collection("reseller_details");
        const resellers = await resellerCollection.find({ reseller_id: { $in: reseller_ids } }).toArray();

        const clientCollection = db.collection("client_details");
        const clients = await clientCollection.find({ client_id: { $in: client_ids } }).toArray();

        // Create maps for name lookup
        const resellerMap = Object.fromEntries(resellers.map(r => [r.reseller_id, r.reseller_name]));
        const clientMap = Object.fromEntries(clients.map(c => [c.client_id, c.client_name]));

        // Attach readable names to association users
        const result = users.map(user => ({
            ...user,
            reseller_name: resellerMap[user.reseller_id] || 'Unknown Reseller',
            client_name: clientMap[user.client_id] || 'Unknown Client'
        }));

        return res.status(200).json({
            status: 'Success',
            data: result
        });

    } catch (error) {
        console.error('Error in FetchAssociationUser controller:', error);
        return res.status(500).json({
            status: 'Error',
            message: 'Database error while fetching association users'
        });
    }
}

// Controller FetchChargerDetailsWithSession
async function FetchChargerDetailsWithSession(req, res) {
    try {
        const { association_id } = req.body;

        // Validate association_id
        if (!association_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Association ID is required'
            });
        }

        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");

        const result = await chargerCollection.aggregate([
            {
                $match: { assigned_association_id: association_id }
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
                            else: []
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    charger_id: 1,
                    assigned_association_id: 1,
                    client_commission: 1,
                    sessiondata: 1
                }
            }
        ]).toArray();

        if (!result || result.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No chargers found for the specified Association ID'
            });
        }

        return res.status(200).json({
            status: 'Success',
            data: result
        });

    } catch (error) {
        console.error(`Error in FetchChargerDetailsWithSession: ${error}`);
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to fetch charger details with session'
        });
    }
}

// Create User Function
async function CreateUserAutomatic(role_id, client_id, reseller_id, association_id, username, email_id, phone_no, created_by) {
    try {
        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const UserRole = db.collection("user_roles");

        // Check if the role ID exists
        console.log(role_id, 'role_id');
        const existingRole = await UserRole.findOne({ role_id: role_id });
        if (!existingRole) {
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

        // Get the next user_id
        const lastUser = await Users.find().sort({ user_id: -1 }).limit(1).toArray();
        const newUserId = lastUser.length > 0 ? lastUser[0].user_id + 1 : 1;

        // Generate a random 4-digit password
        const randomPassword = Math.floor(1000 + Math.random() * 9000);

        // Insert the user
        const result = await Users.insertOne({
            role_id: role_id,
            reseller_id: reseller_id,
            client_id: client_id,
            association_id: association_id,
            user_id: newUserId,
            username: username,
            password: randomPassword,
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

        // Email & Response
        if (result.insertedId) {
            console.log("User inserted successfully. Sending email...");
            const emailSent = await Emailler.EmailConfigForassociationUser(email_id, randomPassword);
            return {
                success: true,
                message: emailSent ? "User created and email sent" : "User created, but email failed"
            };
        } else {
            return { success: false, message: "User creation failed" };
        }

    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, message: error.message };
    }
}

// Controller CreateAssociationUser
async function CreateAssociationUser(req, res) {
    try {
        const {
            reseller_id,
            client_id,
            association_name,
            association_phone_no,
            association_email_id,
            association_address,
            created_by
        } = req.body;

        // Validate required fields
        if (!association_name || !association_phone_no || !association_email_id || !association_address || !created_by || !reseller_id || !client_id) {
            return res.status(400).json({
                status: 'Failure',
                message: 'Reseller ID, Client ID, Association Name, Phone Number, Email ID, Address, and Created By are required'
            });
        }

        const db = await database.connectToDatabase();
        const associationCollection = db.collection("association_details");
        const roleCollection = db.collection("user_roles");

        const role_id = 4; // Association Admin role ID

        // Check if Association Role is active
        const associationRole = await roleCollection.findOne({ role_id });

        if (!associationRole) {
            return res.status(404).json({
                status: 'Failure',
                message: "Association role not found in system."
            });
        }

        if (associationRole.status === false) {
            return res.status(400).json({
                status: 'Failure',
                message: "Association role is deactivated. Cannot create association & user."
            });
        }

        // Check for duplicate name/email
        const existingAssociation = await associationCollection.findOne({
            $or: [
                { association_email_id },
                { association_name }
            ]
        });

        if (existingAssociation) {
            return res.status(400).json({
                status: 'Failure',
                message: 'Association with this Association name / Email ID already exists'
            });
        }

        // Generate new association ID
        const lastAssociation = await associationCollection.find().sort({ association_id: -1 }).limit(1).toArray();
        const newAssociationId = lastAssociation.length > 0 ? lastAssociation[0].association_id + 1 : 1;

        // Insert new association
        const result = await associationCollection.insertOne({
            association_id: newAssociationId,
            client_id,
            reseller_id,
            association_name,
            association_phone_no,
            association_email_id,
            association_address,
            association_wallet: 0.00,
            created_date: new Date(),
            modified_date: null,
            created_by,
            modified_by: null,
            status: true
        });

        if (!result.acknowledged) {
            return res.status(500).json({
                status: 'Failure',
                message: 'Failed to create association'
            });
        }

        console.log(`Association created: ID ${newAssociationId}`);

        // Auto-create user
        const userCreationResult = await CreateUserAutomatic(
            role_id,
            client_id,
            reseller_id,
            newAssociationId,
            association_name,
            association_email_id,
            association_phone_no,
            created_by
        );

        if (!userCreationResult.success) {
            return res.status(200).json({
                status: 'Success',
                message: 'Association created. But user creation failed: ' + userCreationResult.message
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'Association and user created successfully'
        });

    } catch (error) {
        console.error("CreateAssociationUser error:", error);
        return res.status(500).json({
            status: 'Error',
            message: 'Internal Server Error'
        });
    }
}

// Controller UpdateAssociationUser
async function UpdateAssociationUser(req, res) {
    try {
        const {
            association_id,
            association_name,
            association_phone_no,
            association_address,
            association_wallet,
            modified_by,
            status
        } = req.body;

        // Validate required fields
        if (!association_id || !association_name || !association_wallet || !association_phone_no || !association_address || !modified_by) {
            return res.status(400).json({
                status: 'Failure',
                message: 'Association ID, Association Name, Phone Number, Wallet, Address, and Modified By are required'
            });
        }

        const db = await database.connectToDatabase();
        const associationCollection = db.collection("association_details");

        // Check if the association exists
        const existingAssociation = await associationCollection.findOne({ association_id });
        if (!existingAssociation) {
            return res.status(404).json({
                status: 'Failure',
                message: 'Association not found'
            });
        }

        // Prepare update data
        const updateData = {
            association_name,
            association_phone_no,
            association_wallet: parseFloat(association_wallet) || parseFloat(existingAssociation.association_wallet),
            association_address,
            modified_date: new Date(),
            modified_by
        };

        // Include status only if provided
        if (status !== undefined) {
            updateData.status = status;
        }

        const result = await associationCollection.updateOne(
            { association_id },
            { $set: updateData }
        );

        if (result.modifiedCount > 0) {
            return res.status(200).json({
                status: 'Success',
                message: 'Association updated successfully'
            });
        } else {
            return res.status(400).json({
                status: 'Failure',
                message: 'No changes made or failed to update association'
            });
        }

    } catch (error) {
        console.error("Function Error - UpdateAssociationUser:", error);
        return res.status(500).json({
            status: 'Error',
            message: 'Internal Server Error'
        });
    }
}

// Controller UpdateClientCommission
async function UpdateClientCommission(req, res) {
    try {
        const { chargerID, client_commission, modified_by } = req.body;

        if (!chargerID || client_commission === undefined || !modified_by) {
            return res.status(400).json({
                status: 'Failure',
                message: 'Commission update fields are not available'
            });
        }

        const db = await database.connectToDatabase();
        const ChargerCollection = db.collection("charger_details");

        const where = { charger_id: chargerID };
        const update = {
            $set: {
                client_commission: client_commission,
                modified_by: modified_by,
                modified_date: new Date()
            }
        };

        const result = await ChargerCollection.updateOne(where, update);

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                status: 'Failure',
                message: 'Record not found to update client commission'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'Commission updated successfully'
        });

    } catch (error) {
        console.error('Error in update commission:', error);
        return res.status(500).json({
            status: 'Error',
            message: 'Internal Server Error'
        });
    }
}

// 5.Manage User
// Controller FetchUsers
async function FetchUsers(req, res) {
    try {
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(409).json({
                status: 'Failed',
                message: 'Client ID is required'
            });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const rolesCollection = db.collection("user_roles");
        const resellerCollection = db.collection("reseller_details");
        const clientCollection = db.collection("client_details");
        const associationCollection = db.collection("association_details");

        const users = await usersCollection.find({ role_id: { $in: [3, 4] }, client_id }).toArray();

        const roleIds = [...new Set(users.map(user => user.role_id))];
        const resellerIds = [...new Set(users.map(user => user.reseller_id))];
        const clientIds = [...new Set(users.map(user => user.client_id))];
        const associationIds = [...new Set(users.map(user => user.association_id))];

        const [roles, resellers, clients, associations] = await Promise.all([
            rolesCollection.find({ role_id: { $in: roleIds } }).toArray(),
            resellerCollection.find({ reseller_id: { $in: resellerIds } }).toArray(),
            clientCollection.find({ client_id: { $in: clientIds } }).toArray(),
            associationCollection.find({ association_id: { $in: associationIds } }).toArray()
        ]);

        const roleMap = new Map(roles.map(role => [role.role_id, role.role_name]));
        const resellerMap = new Map(resellers.map(reseller => [reseller.reseller_id, reseller.reseller_name]));
        const clientMap = new Map(clients.map(client => [client.client_id, client.client_name]));
        const associationMap = new Map(associations.map(association => [association.association_id, association.association_name]));

        const usersWithDetails = users.map(user => ({
            ...user,
            role_name: roleMap.get(user.role_id) || 'Unknown',
            reseller_name: resellerMap.get(user.reseller_id) || null,
            client_name: clientMap.get(user.client_id) || null,
            association_name: associationMap.get(user.association_id) || null
        }));

        return res.status(200).json({
            status: 'Success',
            data: usersWithDetails
        });

    } catch (error) {
        console.error('Error in FetchUsers controller:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Database error occurred while fetching users'
        });
    }
}

// Controller FetchSpecificUserRoleForSelection
async function FetchSpecificUserRoleForSelection(req, res) {
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("user_roles");

        // Query to fetch all reseller_id and reseller_name
        const roles = await usersCollection.find(
            { role_id: { $in: [4] }, status: true }, // Filter to fetch role_id 4
            {
                projection: {
                    role_id: 1,
                    role_name: 1,
                    _id: 0 // Exclude _id from the result
                }
            }
        ).toArray();

        if (roles.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No roles found for the selection'
            });
        }

        return res.status(200).json({
            status: 'Success',
            data: roles
        });

    } catch (error) {
        console.error('Error fetching specific user role:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal server error occurred while fetching roles'
        });
    }
}

// Controller FetchAssociationForSelection
async function FetchAssociationForSelection(req, res) {
    try {
        const { client_id } = req.body;

        // Validate client_id
        if (!client_id) {
            return res.status(409).json({
                status: 'Failed',
                message: 'Client ID is required'
            });
        }

        const db = await database.connectToDatabase();
        const associationsCollection = db.collection("association_details");
        const usersCollection = db.collection("users");

        // Fetch associations that the user does not have
        const userAssociationIds = await usersCollection.distinct("association_id");

        const associations = await associationsCollection.find(
            {
                status: true,
                client_id: client_id,
                association_id: { $nin: userAssociationIds }
            },
            {
                projection: {
                    association_id: 1,
                    association_name: 1,
                    _id: 0
                }
            }
        ).toArray();

        if (associations.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No associations found for the provided client ID'
            });
        }

        return res.status(200).json({
            status: 'Success',
            data: associations
        });

    } catch (error) {
        console.error('Error in FetchAssociationForSelection controller:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal server error occurred while fetching association details'
        });
    }
}

// Controller CreateUser
async function CreateUser(req, res) {
    try {
        const {
            role_id,
            reseller_id,
            client_id,
            association_id,
            username,
            email_id,
            password,
            phone_no,
            created_by
        } = req.body;

        // Validate required fields
        if (!username || !role_id || !email_id || !password || !created_by || !reseller_id || !client_id || !association_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Username, Role ID, Email, Password, Created By, Reseller ID, Client ID, and Association ID are required'
            });
        }

        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const UserRole = db.collection("user_roles");

        // Check if the role_id exists
        const existingRole = await UserRole.findOne({ role_id });
        if (!existingRole) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Invalid Role ID'
            });
        }

        // Check for duplicate email under the same role
        const duplicateEmailWithRole = await Users.findOne({ role_id, email_id });
        if (duplicateEmailWithRole) {
            return res.status(409).json({
                status: 'Failed',
                message: 'This email is already registered under the same role'
            });
        }

        // Generate new user_id based on the last user
        const lastUser = await Users.find().sort({ user_id: -1 }).limit(1).toArray();
        const newUserId = lastUser.length > 0 ? lastUser[0].user_id + 1 : 1;

        // Insert the new user data
        const insertResult = await Users.insertOne({
            role_id,
            reseller_id,
            client_id,
            association_id,
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
            return res.status(200).json({
                status: 'Success',
                message: 'New user created successfully'
            });
        } else {
            return res.status(500).json({
                status: 'Failed',
                message: 'User creation failed'
            });
        }

    } catch (error) {
        console.error('Controller Error in CreateUser:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// Controller UpdateUser
async function UpdateUser(req, res) {
    try {
        const { user_id, username, phone_no, password, wallet_bal, modified_by, status } = req.body;

        // Validate required fields
        if (!user_id || !username || !password || !modified_by) {
            return res.status(400).json({
                status: 'Failed',
                message: 'User ID, Username, Password, and Modified By are required'
            });
        }

        const db = await database.connectToDatabase();
        const Users = db.collection("users");

        // Check if the user exists
        const existingUser = await Users.findOne({ user_id });
        if (!existingUser) {
            return res.status(404).json({
                status: 'Failed',
                message: 'User not found'
            });
        }

        // Update user details
        const updateResult = await Users.updateOne(
            { user_id },
            {
                $set: {
                    username,
                    phone_no,
                    wallet_bal: parseFloat(wallet_bal) || parseFloat(existingUser.wallet_bal),
                    modified_date: new Date(),
                    modified_by,
                    status,
                    password: parseInt(password)
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(500).json({
                status: 'Failed',
                message: 'Failed to update user'
            });
        }

        // Return success response
        return res.status(200).json({
            status: 'Success',
            message: 'User updated successfully'
        });

    } catch (error) {
        console.error('Controller Error in UpdateUser:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// 6.Withdrawal
// Controller saveUserBankDetails
async function saveUserBankDetails(req, res) {
    try {
        const {
            accountHolderName,
            bankName,
            accountNumber,
            ifscNumber,
            created_by,
            user_id
        } = req.body;

        // Validate the input
        if (!accountHolderName || !bankName || !accountNumber || !ifscNumber || !created_by || !user_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'All bank details are required'
            });
        }

        const db = await database.connectToDatabase();
        const BankDetails = db.collection("bank_details");
        const usersCollection = db.collection("users");

        // Check if the user exists
        const existingUser = await usersCollection.findOne({ user_id });
        if (!existingUser) {
            return res.status(404).json({
                status: 'Failed',
                message: 'User not found'
            });
        }

        // Check if bank details already exist for the user
        const existingUserBankDetails = await BankDetails.findOne({ user_id });
        if (existingUserBankDetails) {
            return res.status(400).json({
                status: 'Failed',
                message: 'User already has bank details registered'
            });
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

        return res.status(201).json({
            status: 'Success',
            message: 'Bank details saved successfully'
        });

    } catch (error) {
        console.error('Controller Error in saveUserBankDetails:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// Controller fetchUserBankDetails
async function fetchUserBankDetails(req, res) {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'User ID is required'
            });
        }

        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const BankDetails = db.collection("bank_details");

        const user = await Users.findOne({ user_id });

        if (!user) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No user found'
            });
        }

        const bankDetails = await BankDetails.findOne({ user_id });

        if (!bankDetails) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No bank details found for this user'
            });
        }

        return res.status(200).json({
            status: 'Success',
            data: bankDetails
        });

    } catch (error) {
        console.error('Controller Error in fetchUserBankDetails:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// Controller updateUserBankDetails
async function updateUserBankDetails(req, res) {
    try {
        const { _id, user_id, accountHolderName, bankName, accountNumber, ifscNumber, modified_by } = req.body;

        if (!_id || !user_id || !accountNumber) {
            return res.status(400).json({
                status: 'Failed',
                message: 'User ID, Account Number, and Bank ID are required'
            });
        }

        const objectId = new ObjectId(_id);

        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const BankDetails = db.collection("bank_details");

        const existingUser = await Users.findOne({ user_id });
        if (!existingUser) {
            return res.status(404).json({
                status: 'Failed',
                message: 'User not found'
            });
        }

        const existingBankDetails = await BankDetails.findOne({ _id: objectId });
        if (!existingBankDetails) {
            return res.status(404).json({
                status: 'Failed',
                message: 'Bank details not found'
            });
        }

        const updateFields = {
            ...(accountHolderName && { accountHolderName }),
            ...(accountNumber && { accountNumber }),
            ...(bankName && { bankName }),
            ...(ifscNumber && { ifscNumber }),
            modified_by,
            modified_date: new Date()
        };

        const result = await BankDetails.updateOne(
            { _id: objectId },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                status: 'Failed',
                message: 'No changes made to bank details'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'Bank details updated successfully'
        });

    } catch (error) {
        console.error('Controller Error in updateUserBankDetails:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// Function to ApplyWithdrawal
const ApplyWithdrawal = async (req, res) => {
    const { user_id, withdrawalAmount, accountHolderName, accountNumber, bankName, withdrawal_req_by, ifscNumber } = req.body;

    try {
        // Validate required fields
        if (!user_id || !withdrawalAmount || !accountHolderName || !accountNumber || !bankName || !withdrawal_req_by || !ifscNumber) {
            return res.status(400).json({ status: 'Failed', message: 'Missing required fields' });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const clientCollection = db.collection("client_details");
        const bankDetailsCollection = db.collection("bank_details");
        const withdrawalCollection = db.collection("withdrawal_details");

        // Check if user exists
        const user = await usersCollection.findOne({ user_id });
        if (!user) return res.status(404).json({ status: 'Failed', message: 'User not found' });

        // Check if client exists
        const client = await clientCollection.findOne({ client_id: user.client_id });
        if (!client) return res.status(404).json({ status: 'Failed', message: 'Client not found' });

        // Check if bank details exist
        const bankDetails = await bankDetailsCollection.findOne({ user_id });
        if (!bankDetails) return res.status(404).json({ status: 'Failed', message: 'No bank details found for this user' });

        // Check if the user has any pending or in-progress withdrawal requests
        const existingWithdrawals = await withdrawalCollection.find({ user_id }).toArray();
        const hasPendingWithdrawal = existingWithdrawals.some(w => w.withdrawal_approved_status !== "Rejected" && w.withdrawal_approved_status !== "Completed");

        if (hasPendingWithdrawal) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Withdrawal already in process or pending. Request again after payment.'
            });
        }

        // Validate withdrawal amount and commission (2% deduction)
        const commissionAmount = (withdrawalAmount * 2) / 100;
        const totalAmountAfterCommission = withdrawalAmount - commissionAmount;

        if (totalAmountAfterCommission <= 0) {
            return res.status(400).json({ status: 'Failed', message: 'Invalid withdrawal amount after commission deduction.' });
        }

        // Create withdrawal request
        const withdrawalData = {
            client_id: user.client_id,
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

        return res.status(200).json({ status: 'Success', message: 'Withdrawal request submitted successfully. Your payment will be processed soon.' });

    } catch (error) {
        console.error('Error processing withdrawal request:', error);
        return res.status(500).json({ status: 'Failed', message: 'Error processing withdrawal request' });
    }
};

// Function to fetch payment request details
const FetchPaymentRequest = async (req, res) => {
    const { user_id } = req.body; // Get user_id from request body

    try {
        // Validate required fields
        if (!user_id) {
            return res.status(400).json({ status: 'Failed', message: 'user_id is required' });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const clientCollection = db.collection("client_details");
        const withdrawalCollection = db.collection("withdrawal_details");

        // Fetch user details
        const user = await usersCollection.findOne({ user_id });
        if (!user) return res.status(404).json({ status: 'Failed', message: 'User not found' });

        // If user has a client_id, fetch client details
        let clientData = null;
        if (user.client_id) {
            clientData = await clientCollection.findOne({ client_id: user.client_id });
        }

        // Fetch all withdrawal details related to user_id
        const withdrawalDetails = await withdrawalCollection.find({ user_id }).toArray();

        // Return all the fetched data
        return res.status(200).json({
            status: 'Success',
            user,
            clientData,
            withdrawalDetails
        });

    } catch (error) {
        console.error('Error in FetchPaymentRequest:', error);
        return res.status(500).json({ status: 'Failed', message: 'Error fetching payment request details' });
    }
};

// Function to fetch payment request details with unread notification count
const FetchPaymentNotification = async (req, res) => {
    const { user_id } = req.body; // Get user_id from request body

    try {
        // Validate required fields
        if (!user_id) {
            return res.status(400).json({ status: 'Failed', message: 'user_id is required' });
        }

        const db = await database.connectToDatabase();
        const withdrawalCollection = db.collection("withdrawal_details");
        const usersCollection = db.collection("users");

        // Ensure user_id is a number (if stored as a number in DB)
        if (typeof user_id !== "number") {
            return res.status(400).json({ status: 'Failed', message: 'Invalid user_id' });
        }

        // Fetch user details
        const user = await usersCollection.findOne({ user_id });
        if (!user) {
            return res.status(404).json({ status: 'Failed', message: 'User not found' });
        }

        // Fetch all withdrawal details related to user_id
        const withdrawalDetails = await withdrawalCollection.find({ user_id }).toArray();

        if (withdrawalDetails.length === 0) {
            return res.status(404).json({ status: 'Failed', message: 'No withdrawal requests found' });
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

        return res.status(200).json({
            status: 'Success',
            data: results
        });

    } catch (error) {
        console.error('Error fetching payment notification:', error);
        return res.status(500).json({ status: 'Failed', message: 'Error fetching payment notification' });
    }
};

// Function to MarkNotificationRead
const MarkNotificationRead = async (req, res) => {
    const { _id, rca_admin_notification_status } = req.body;

    try {
        // Validate required fields
        if (!_id || !rca_admin_notification_status) {
            return res.status(400).json({ status: 'Failed', message: 'Missing required fields' });
        }

        // Connect to the database
        const db = await database.connectToDatabase();
        const withdrawalCollection = db.collection("withdrawal_details");

        // Convert _id to ObjectId
        const objectId = new ObjectId(_id);

        // Fetch the current status of the notification
        const withdrawal = await withdrawalCollection.findOne({ _id: objectId });

        // Check if it's already marked as "read"
        if (withdrawal.rca_admin_notification_status === "read") {
            return res.status(400).json({ status: 'Failed', message: 'Notification already marked as read' });
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
            return res.status(200).json({ status: 'Success', message: 'Notification marked as read successfully' });
        } else {
            return res.status(400).json({ status: 'Failed', message: 'Failed to mark notification read' });
        }

    } catch (error) {
        console.error('Error in MarkNotificationRead function:', error);
        return res.status(500).json({ status: 'Failed', message: `Internal server error: ${error.message}` });
    }
};

// FetchCommissionAmtClient
const FetchCommissionAmtClient = async (req, res) => {
    const { user_id } = req.body;

    try {
        if (!user_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'User ID is required'
            });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const clientsCollection = db.collection("client_details");

        const user = await usersCollection.findOne({ user_id });

        if (!user) {
            return res.status(404).json({
                status: 'Failed',
                message: 'User not found'
            });
        }

        const clientId = user.client_id;

        if (!clientId) {
            return res.status(404).json({
                status: 'Failed',
                message: 'Client ID not found for this user'
            });
        }

        const client = await clientsCollection.findOne({ client_id: clientId });

        if (!client) {
            return res.status(404).json({
                status: 'Failed',
                message: 'Client not found'
            });
        }

        return res.status(200).json({
            status: 'Success',
            data: client.client_wallet || 0
        });

    } catch (error) {
        console.error(`Error in FetchCommissionAmtClient controller: ${error}`);
        return res.status(500).json({
            status: 'Failed',
            message: 'Database error while fetching client commission amount'
        });
    }
};

// 7.Manage Device & Revenue Report Controller
// FetchReportDevice
const FetchReportDevice = async (req, res) => {
    try {
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(400).json({
                status: 'Failed',
                message: "Client ID is required."
            });
        }

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Fetch chargers that belong to the specified client_id
        const chargers = await devicesCollection.find({ assigned_client_id: client_id }).toArray();

        // Validation: Check if chargers exist for the client_id
        if (chargers.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: "No chargers found for this Client ID."
            });
        }

        return res.status(200).json({
            status: 'Success',
            data: chargers
        });

    } catch (error) {
        console.error(`Error fetching chargers: ${error}`);
        return res.status(500).json({
            status: 'Failed',
            message: "Failed to fetch chargers."
        });
    }
};

// Validation fo device reports
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

// DeviceReport
async function DeviceReport(req, res) {
    try {
        const { from_date, to_date, device_id } = req.body;

        // Input validation
        if (!from_date || !to_date || !device_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'from_date, to_date, and device_id are required!'
            });
        }

        const db = await database.connectToDatabase();
        const Collection = db.collection('device_session_details');

        const validateDate = validateAndConvertDates(from_date, to_date);
        if (validateDate.status !== 200) {
            return res.status(validateDate.status).json({
                status: 'Failed',
                message: validateDate.message
            });
        }

        // Fetch session details
        const sessions = await Collection.find({
            charger_id: device_id,
            stop_time: {
                $gte: validateDate.fromDate.toISOString(),
                $lte: validateDate.toDate.toISOString()
            }
        }).sort({ stop_time: -1 }).toArray();

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No device report found for the given period and device ID!'
            });
        }

        // Calculating totals
        const totalRevenue = sessions.reduce((sum, session) => sum + Number(session.price || 0), 0);
        const totalKWH = sessions.reduce((sum, session) => sum + parseFloat(session.unit_consummed || 0), 0);

        // Preparing final data
        const responseData = {
            device_id,
            totalKWH: totalKWH.toFixed(3),
            totalRevenue: totalRevenue.toFixed(2),
            sessions: sessions.map((session) => ({
                session_id: session.session_id || 'N/A',
                user: session.user || 'N/A',
                start_time: session.start_time ? new Date(session.start_time).toLocaleString() : 'N/A',
                stop_time: session.stop_time ? new Date(session.stop_time).toLocaleString() : 'N/A',
                unit_consumed: session.unit_consummed ? `${session.unit_consummed} kWh` : '0 kWh',
                price: session.price ? `Rs. ${Number(session.price).toFixed(2)}` : 'Rs. 0.00'
            }))
        };

        console.log('Device Report data fetched successfully');
        return res.status(200).json({
            status: 'Success',
            data: responseData
        });

    } catch (error) {
        console.error('Error in DeviceReport:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// Route to fetch specific charger revenue list
async function FetchSpecificChargerRevenue(req, res) {
    try {
        const { client_id } = req.body;

        // Validate client_id input
        if (!client_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'client_id is required'
            });
        }

        // Fetch both revenueData and TotalChargerRevenue
        const { revenueData, TotalChargerRevenue, status, message } = await fetchRevenueData(client_id);

        if (status !== "Success") {
            return res.status(500).json({
                status: 'Failed',
                message: message || 'Failed to fetch specific charger revenue'
            });
        }

        // Successful response with data
        res.status(200).json({
            status: "Success",
            revenueData,
            TotalChargerRevenue
        });

    } catch (error) {
        console.error('Error in FetchSpecificChargerRevenue route:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Unexpected server error'
        });
    }
}

// Helper function to fetch the revenue data
async function fetchRevenueData(client_id) {
    try {
        const db = await database.connectToDatabase();
        if (!db) {
            return { status: "Error", message: "Database connection failed" };
        }

        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");
        const associationCollection = db.collection("association_details");

        // Convert client_id to Integer (to match MongoDB data type)
        const clientId = parseInt(client_id);

        // Fetch chargers assigned to this client
        const chargers = await chargerCollection.find({ assigned_client_id: clientId }).toArray();

        if (!chargers.length) {
            return { status: "Success", message: "No chargers found for this client", revenueData: [], TotalChargerRevenue: "0.000" };
        }

        let TotalChargerRevenue = 0; // Initialize total revenue

        const revenueData = await Promise.all(chargers.map(async (charger) => {
            // Fetch association email based on assigned_association_id
            const association = await associationCollection.findOne({ association_id: charger.assigned_association_id });
            const association_email_id = association?.association_email_id || null;

            // Fetch session revenue details
            const sessions = await sessionCollection.find({
                charger_id: charger.charger_id,
                start_time: { $ne: null },
                stop_time: { $ne: null }
            }).toArray();

            // Calculate revenue for this charger
            const Revenue = sessions.reduce((sum, session) => {
                return sum + parseFloat(session.client_commission || 0);
            }, 0);

            // Add this charger's revenue to total revenue
            TotalChargerRevenue += Revenue;

            return {
                charger_id: charger.charger_id,
                association_email_id,
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
async function FetchChargerListWithAllCostWithRevenue(req, res) {
    try {
        const { client_id } = req.body;

        // Validate client_id input
        if (!client_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'client_id is required'
            });
        }

        const db = await database.connectToDatabase();
        if (!db) {
            return res.status(500).json({ status: "Error", message: "Database connection failed" });
        }

        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");
        const associationCollection = db.collection("association_details");

        // Convert client_id to Integer (to match MongoDB data type)
        const clientId = parseInt(client_id);

        // Fetch chargers assigned to this client
        const chargers = await chargerCollection.find({ assigned_client_id: clientId }).toArray();

        if (!chargers.length) {
            return res.status(404).json({
                status: "Success",
                message: "No chargers found for this client",
                revenueData: []
            });
        }

        const revenueData = await Promise.all(chargers.map(async (charger) => {
            // Fetch association email based on assigned_association_id
            const association = await associationCollection.findOne({ association_id: charger.assigned_association_id });
            const association_email_id = association?.association_email_id || null;

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
                    association_email_id,
                    Revenue: parseFloat(session.client_commission || 0).toFixed(3),
                })),
            };
        }));

        // Success response
        return res.status(200).json({
            status: "Success",
            revenueData,
        });

    } catch (error) {
        console.error(`Error in FetchChargerListWithAllCostWithRevenue: ${error.message}`);
        return res.status(500).json({
            status: 'Failed',
            message: 'Failed to fetch charger list with all cost and revenue'
        });
    }
}

// 8.Profile Controller
//FetchUserProfile
async function FetchUserProfile(req, res) {
    const { user_id } = req.body;

    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

        // Aggregation pipeline to join users and client_details collections
        const result = await usersCollection.aggregate([
            { $match: { user_id: parseInt(user_id) } },
            {
                $lookup: {
                    from: 'client_details',
                    localField: 'client_id',
                    foreignField: 'client_id',
                    as: 'client_details'
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
                    client_details: 1
                }
            }
        ]).toArray();

        if (result.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'User not found'
            });
        }

        const userProfile = result[0];

        // Success response
        return res.status(200).json({
            status: 'Success',
            data: userProfile
        });

    } catch (error) {
        console.error('Error in FetchUserProfile:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// Controller Update User Profile
async function UpdateUserProfile(req, res) {
    const { user_id, username, phone_no, password } = req.body;

    try {
        // Validate the input
        if (!user_id || !username || !phone_no || !password) {
            return res.status(400).json({
                status: 'Failed',
                message: 'User ID, Username, Phone Number, and Password are required'
            });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

        // Check if user exists
        const existingUser = await usersCollection.findOne({ user_id });
        if (!existingUser) {
            return res.status(404).json({
                status: 'Failed',
                message: 'User not found'
            });
        }

        // Update user
        const updateResult = await usersCollection.updateOne(
            { user_id },
            {
                $set: {
                    username,
                    phone_no,
                    password: parseInt(password),
                    modified_by: username,
                    modified_date: new Date()
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(500).json({
                status: 'Failed',
                message: 'Failed to update user profile'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'User profile updated successfully'
        });

    } catch (error) {
        console.error('Controller Error:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// Controller Update Client Profile
async function UpdateClientProfile(req, res) {
    const { client_id, modified_by, client_phone_no, client_address } = req.body;

    try {
        // Validate required fields
        if (!client_id || !modified_by || !client_phone_no || !client_address) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Client ID, modified_by, phone number, and client address are required'
            });
        }

        const db = await database.connectToDatabase();
        const clientCollection = db.collection("client_details");

        const updateResult = await clientCollection.updateOne(
            { client_id: client_id },
            {
                $set: {
                    client_phone_no: client_phone_no,
                    client_address: client_address,
                    modified_by: modified_by,
                    modified_date: new Date()
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'Client not found'
            });
        }

        if (updateResult.modifiedCount === 0) {
            return res.status(500).json({
                status: 'Failed',
                message: 'Failed to update client profile'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'Client profile updated successfully'
        });

    } catch (error) {
        console.error('Controller Error:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

module.exports = {
    authenticate, FetchTotalCharger, FetchOnlineCharger, FetchOfflineCharger, FetchFaultsCharger, FetchChargerTotalEnergy, FetchTotalChargersSession, FetchTotalUsers,
    FetchAllocatedCharger, DeActivateOrActivateCharger, FetchUnAllocatedCharger, FetchAssociationUserToAssginCharger, FetchUnAllocatedChargerToAssgin, AssginChargerToAssociation,
    FetchAssociationUser, FetchChargerDetailsWithSession, CreateAssociationUser, UpdateAssociationUser, UpdateClientCommission,
    FetchUsers, FetchSpecificUserRoleForSelection, FetchAssociationForSelection, CreateUser, UpdateUser,
    saveUserBankDetails, fetchUserBankDetails, updateUserBankDetails, ApplyWithdrawal, FetchPaymentRequest, FetchPaymentNotification, MarkNotificationRead, FetchCommissionAmtClient, 
    FetchReportDevice, DeviceReport, FetchSpecificChargerRevenue, FetchChargerListWithAllCostWithRevenue, FetchUserProfile, UpdateUserProfile, UpdateClientProfile,
};