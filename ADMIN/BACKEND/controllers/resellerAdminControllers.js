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
            return res.status(401).json({ message: 'Email and Password required' });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection('users');
        const resellerCollection = db.collection('reseller_details');

        const user = await usersCollection.findOne({ email_id: email, role_id: 2, status: true });

        if (!user || user.password !== password || user.role_id !== 2) {
            return res.status(401).json({ message: 'Invalid credentials or user is deactivated' });
        }

        // Check reseller details
        const getResellerDetails = await resellerCollection.findOne({ reseller_id: user.reseller_id, status: true });

        if (!getResellerDetails) {
            return res.status(404).json({ message: 'Reseller details not found or deactivated' });
        }

        // Generate JWT token
        const token = jwt.sign({ username: user.username }, JWT_SECRET);

        return res.status(200).json({
            status: 'Success',
            user: {
                reseller_name: getResellerDetails.reseller_name,
                reseller_id: getResellerDetails.reseller_id,
                user_id: user.user_id,
                username: user.username,
                email_id: user.email_id,
                role_id: user.role_id,
            },
            token
        });

    } catch (error) {
        console.error('Error in authenticate controller:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// 2.Dashboard
// Fetch Total Clients, Associations, and App Users for a Specific Reseller
const FetchTotalUsers = async (req, res) => {
    try {
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

        if (!db) {
            console.error("Database connection failed!");
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const users = await usersCollection.find({ reseller_id }).toArray();

        if (!users.length) {
            return res.status(200).json({
                status: 'Success',
                TotalCounts: {
                    clientsCount: 0,
                    associationsCount: 0,
                    appUsersCount: 0
                }
            });
        }

        const clientsCount = users.filter(user => user.client_id && !user.association_id).length;
        const associationsCount = users.filter(user => user.client_id && user.association_id).length;
        const appUsersCount = users.filter(user => user.role_id === 5).length;

        return res.status(200).json({
            status: 'Success',
            TotalCounts: {
                clientsCount,
                associationsCount,
                appUsersCount
            }
        });

    } catch (error) {
        console.error('Error in FetchTotalUsers controller:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Failed to fetch total clients, associations, and app users'
        });
    }
};

// Function to fetch chargers assigned to a specific reseller
const FetchTotalCharger = async (req, res) => {
    try {
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const db = await database.connectToDatabase();

        if (!db) {
            console.error("Database connection failed!");
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const chargerCollection = db.collection("charger_details");

        const recentChargers = await chargerCollection.find({
            assigned_reseller_id: reseller_id
        }).toArray();

        const totalCount = recentChargers.length;

        if (totalCount === 0) {
            return res.status(200).json({ status: 'Success', totalCount, message: 'No chargers found' });
        }

        return res.status(200).json({
            status: 'Success',
            totalCount,
            data: recentChargers
        });

    } catch (error) {
        console.error('Error in FetchTotalCharger controller:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger details' });
    }
};

// fetch FetchOnlineCharger
const FetchOnlineCharger = async (req, res) => {
    try {
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const db = await database.connectToDatabase();

        if (!db) {
            console.error("Database connection failed!");
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const chargerCollection = db.collection("charger_details");
        const statusCollection = db.collection("charger_status");

        const assignedChargers = await chargerCollection.find({ assigned_reseller_id: reseller_id }).toArray();

        if (!assignedChargers.length) {
            return res.status(200).json({ status: 'Success', totalCount: 0, data: [], message: "No chargers assigned to this reseller" });
        }

        const chargerIds = assignedChargers.map(charger => charger.charger_id);
        const currentTime = new Date();
        const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);

        const onlineChargers = await statusCollection.find({
            charger_id: { $in: chargerIds },
            timestamp: { $gte: oneHourAgo },
            error_code: "NoError"
        }).toArray();

        const totalCount = onlineChargers.length;

        if (totalCount === 0) {
            return res.status(200).json({ status: 'Success', totalCount, data: [], message: "No online chargers found in the last hour" });
        }

        return res.status(200).json({ status: 'Success', totalCount, data: onlineChargers });
    } catch (error) {
        console.error('Error in FetchOnlineCharger controller:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch online chargers' });
    }
};

// fetch FetchOfflineCharger
const FetchOfflineCharger = async (req, res) => {
    try {
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const db = await database.connectToDatabase();

        if (!db) {
            console.error("Database connection failed!");
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const chargerCollection = db.collection("charger_details");
        const statusCollection = db.collection("charger_status");

        const assignedChargers = await chargerCollection.find({ assigned_reseller_id: reseller_id }).toArray();

        if (!assignedChargers.length) {
            return res.status(200).json({ status: 'Success', totalCount: 0, data: [], message: "No chargers assigned to this reseller" });
        }

        const chargerIds = assignedChargers.map(charger => charger.charger_id);
        const currentTime = new Date();
        const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);

        const offlineChargers = await statusCollection.find({
            charger_id: { $in: chargerIds },
            timestamp: { $lt: oneHourAgo }
        }).toArray();

        const totalCount = offlineChargers.length;

        if (totalCount === 0) {
            return res.status(200).json({ status: 'Success', totalCount, data: [], message: "No offline chargers found" });
        }

        return res.status(200).json({ status: 'Success', totalCount, data: offlineChargers });
    } catch (error) {
        console.error('Error in FetchOfflineCharger controller:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch offline chargers' });
    }
};

// Fetch Faulty Chargers Function
const FetchFaultsCharger = async (req, res) => {
    try {
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");
        const statusCollection = db.collection("charger_status");

        const assignedChargers = await chargerCollection.find({ assigned_reseller_id: reseller_id }).toArray();

        if (!assignedChargers.length) {
            return res.status(200).json({ status: 'Success', totalCount: 0, data: [], message: "No chargers assigned to this reseller" });
        }

        const chargerIds = assignedChargers.map(charger => charger.charger_id);
        const currentTime = new Date();
        const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);

        const faultyChargers = await statusCollection.find({
            timestamp: { $gte: oneHourAgo },
            charger_id: { $in: chargerIds },
            error_code: { $ne: "NoError" }
        }).toArray();

        const totalCount = faultyChargers.length;

        if (totalCount === 0) {
            return res.status(200).json({ status: 'Success', totalCount, data: [], message: "No faulty chargers found" });
        }

        return res.status(200).json({ status: 'Success', totalCount, data: faultyChargers });
    } catch (error) {
        console.error('Error in FetchFaultsCharger controller:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch faulty chargers' });
    }
};

// Fetch Charger Total Energy Function
async function FetchChargerTotalEnergy(req, res) {
    try {
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");

        const assignedChargers = await chargerCollection.find({ assigned_reseller_id: reseller_id }).toArray();

        if (!assignedChargers.length) {
            return res.status(200).json({
                status: 'Success',
                message: "No chargers assigned to this reseller",
                totalEnergyConsumed: 0,
                CO2_from_EV: 0,
                CO2_from_ICE: 0,
                CO2_Savings: 0,
                daytodaytotalEnergyConsumed: [],
                weeklyTotalEnergyConsumed: [],
                monthlyTotalEnergyConsumed: [],
                yearlyTotalEnergyConsumed: []
            });
        }

        const chargerIds = assignedChargers.map(charger => charger.charger_id);

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
            .filter(entry => entry._id !== null)
            .map(entry => ({
                date: entry._id,
                totalEnergyConsumed: entry.day2daytotalEnergyConsumed
            }));

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

        const yearlyResult = await sessionCollection.aggregate([
            matchStage, addFieldsStage,
            {
                $group: {
                    _id: { year: { $year: "$start_time" } },
                    totalEnergyConsumed: { $sum: "$unit_consummed" }
                }
            },
            { $match: { "_id.year": { $ne: null } } },
            { $sort: { "_id.year": -1 } }
        ]).toArray();

        const yearlyTotalEnergyConsumed = yearlyResult.map(entry => ({
            year: entry._id.year,
            totalEnergyConsumed: entry.totalEnergyConsumed || 0
        }));

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

        const EV_EFFICIENCY = 6.5;
        const EV_CO2_PER_KWH = 0.02;
        const ICE_CO2_PER_KM = 0.35;

        const distanceDrivenByEV = totalEnergyConsumed / EV_EFFICIENCY;
        const CO2_from_ICE = distanceDrivenByEV * ICE_CO2_PER_KM;
        const CO2_from_EV = totalEnergyConsumed * EV_CO2_PER_KWH;
        const CO2_Savings = CO2_from_ICE - CO2_from_EV;

        return res.status(200).json({
            status: 'Success',
            totalEnergyConsumed,
            CO2_from_EV,
            CO2_from_ICE,
            CO2_Savings,
            daytodaytotalEnergyConsumed,
            weeklyTotalEnergyConsumed,
            monthlyTotalEnergyConsumed,
            yearlyTotalEnergyConsumed
        });

    } catch (error) {
        console.error(`Error fetching Charger Total Energy details: ${error}`);
        return res.status(500).json({
            status: 'Failed',
            message: 'Failed to fetch charger total energy'
        });
    }
}

// Fetch Total Charger Charging Sessions for a Specific Reseller
const FetchTotalChargersSession = async (req, res) => {
    try {
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");

        const chargers = await chargerCollection.find({ assigned_reseller_id: reseller_id }).toArray();

        if (chargers.length === 0) {
            return res.status(200).json({
                status: 'Success',
                totalCount: 0,
                message: 'No chargers found for the given reseller'
            });
        }

        const chargerIds = chargers.map(charger => charger.charger_id);

        const totalCount = await sessionCollection.countDocuments({ charger_id: { $in: chargerIds } });

        return res.status(200).json({
            status: 'Success',
            totalCount
        });

    } catch (error) {
        console.error(`Error in FetchTotalChargersSession Controller: ${error}`);
        return res.status(500).json({
            status: 'Failed',
            message: 'Error fetching charger session count'
        });
    }
};

// 3.Manage Device
// Controller to fetch unallocated chargers
async function FetchUnAllocatedCharger(req, res) {
    try {
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const db = await database.connectToDatabase();
        if (!db) {
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const devicesCollection = db.collection("charger_details");
        const configCollection = db.collection("socket_gun_config");

        const chargers = await devicesCollection.find({ assigned_client_id: null, assigned_reseller_id: reseller_id }).toArray();

        if (!chargers.length) {
            return res.status(404).json({ status: "Failed", message: "No unallocated chargers found", data: [] });
        }

        const results = [];

        for (let charger of chargers) {
            const chargerID = charger.charger_id;

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
        console.error(`Error in FetchUnAllocatedCharger controller: ${error.message}`);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch unallocated chargers' });
    }
}

// Controller to fetch allocated chargers
async function FetchAllocatedCharger(req, res) {
    try {
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const db = await database.connectToDatabase();
        if (!db) {
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const devicesCollection = db.collection("charger_details");
        const configCollection = db.collection("socket_gun_config");

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
            { $unwind: "$clientDetails" },
            {
                $addFields: {
                    client_name: "$clientDetails.client_name"
                }
            },
            {
                $project: {
                    clientDetails: 0
                }
            }
        ]).toArray();

        if (!chargersWithClients.length) {
            return res.status(404).json({ status: "Failed", message: "No allocated chargers found", data: [] });
        }

        const results = [];

        for (let charger of chargersWithClients) {
            const chargerID = charger.charger_id;

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
        console.error(`Error in FetchAllocatedCharger controller: ${error.message}`);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch allocated chargers' });
    }
}

// Controller to DeActivate or Activate Charger
async function DeActivateOrActivateCharger(req, res) {
    try {
        const { modified_by, charger_id, status } = req.body;

        if (!modified_by || !charger_id || typeof status !== 'boolean') {
            return res.status(400).json({ status: 'Failed', message: 'modified_by, charger_id, and status (boolean) are required' });
        }

        const db = await database.connectToDatabase();
        if (!db) {
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const devicesCollection = db.collection("charger_details");

        const existingCharger = await devicesCollection.findOne({ charger_id: charger_id });
        if (!existingCharger) {
            return res.status(404).json({ status: 'Failed', message: 'Charger not found' });
        }

        if (existingCharger.assigned_client_id == null) {
            return res.status(400).json({ status: 'Failed', message: 'Cannot deactivate an allocated charger' });
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
            return res.status(500).json({ status: 'Failed', message: 'Failed to update charger status' });
        }

        return res.status(200).json({ status: 'Success', message: 'Charger status updated successfully' });

    } catch (error) {
        console.error(`Error in DeActivateOrActivateCharger controller: ${error.message}`);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// Controller to Fetch Client Users to Assign Charger
async function FetchClientUserToAssginCharger(req, res) {
    try {
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const db = await database.connectToDatabase();
        if (!db) {
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const resellersCollection = db.collection("client_details");

        const users = await resellersCollection.find({ reseller_id: parseInt(reseller_id), status: true }).toArray();

        if (!users || users.length === 0) {
            return res.status(404).json({ status: 'Failed', message: 'No active users found for this reseller' });
        }

        return res.status(200).json({ status: 'Success', data: users });

    } catch (error) {
        console.error(`Error in FetchClientUserToAssginCharger controller: ${error.message}`);
        logger.error(`Error in FetchClientUserToAssginCharger controller: ${error.message}`);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// Controller to Fetch Unallocated Chargers to Assign
async function FetchUnAllocatedChargerToAssgin(req, res) {
    try {
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const db = await database.connectToDatabase();
        if (!db) {
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const devicesCollection = db.collection("charger_details");

        const chargers = await devicesCollection.find({
            assigned_client_id: null,
            assigned_reseller_id: reseller_id,
            status: true
        }).toArray();

        if (!chargers || chargers.length === 0) {
            return res.status(404).json({ status: 'Failed', message: 'No unallocated chargers found for this reseller' });
        }

        return res.status(200).json({ status: 'Success', data: chargers });

    } catch (error) {
        console.error(`Error in FetchUnAllocatedChargerToAssgin controller: ${error.message}`);
        logger.error(`Error in FetchUnAllocatedChargerToAssgin controller: ${error.message}`);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// Controller to Assign Charger to Client
async function AssginChargerToClient(req, res) {
    try {
        const { client_id, charger_id, modified_by, reseller_commission } = req.body;

        // Validate required fields
        if (!client_id || !charger_id || !modified_by || !reseller_commission) {
            return res.status(400).json({ status: 'Failed', message: 'client_id, charger_id, modified_by, and reseller_commission are required' });
        }

        const db = await database.connectToDatabase();
        if (!db) {
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const devicesCollection = db.collection("charger_details");

        // Ensure charger_ids is an array
        const chargerIdsArray = Array.isArray(charger_id) ? charger_id : [charger_id];

        // Check if all the chargers exist
        const existingChargers = await devicesCollection.find({ charger_id: { $in: chargerIdsArray } }).toArray();

        if (existingChargers.length !== chargerIdsArray.length) {
            return res.status(404).json({ status: 'Failed', message: 'One or more chargers not found' });
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
            return res.status(500).json({ status: 'Failed', message: 'Failed to assign chargers to reseller' });
        }

        return res.status(200).json({ status: 'Success', message: 'Chargers Successfully Assigned' });

    } catch (error) {
        console.error(`Error in AssginChargerToClient controller: ${error.message}`);
        logger.error(`Error assigning chargers to reseller: ${error.message}`);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// 4.Manage Client
// Fetch Clients
async function getAllClients(req, res) {
    try {
        const { reseller_id } = req.body;
        const db = await database.connectToDatabase();
        if (!db) {
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const clientCollection = db.collection("client_details");

        const clientList = await clientCollection.find({ reseller_id: parseInt(reseller_id) }).toArray();

        if (!clientList || clientList.length === 0) {
            return res.status(404).json({ status: 'Failed', message: 'No clients found' });
        }

        return res.status(200).json({ status: 'Success', data: clientList });

    } catch (error) {
        console.error('Error fetching client details:', error);
        logger.error(`Error fetching client details: ${error}`);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// Controller to Fetch Assigned Association
async function FetchAssignedAssociation(req, res) {
    try {
        const { client_id } = req.body;

        // Validate client_id
        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'Client ID is required' });
        }

        const db = await database.connectToDatabase();
        if (!db) {
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const AssociationCollection = db.collection("association_details");

        // Query to fetch Association for the specific client_id
        const Association = await AssociationCollection.find({ client_id: client_id }).toArray();

        if (!Association || Association.length === 0) {
            return res.status(404).json({ status: 'Failed', message: 'No Association details found for the specified client_id' });
        }

        // Return the Association data
        return res.status(200).json({
            status: 'Success',
            message: 'Association details fetched successfully',
            data: Association
        });

    } catch (error) {
        console.error('Error fetching Association:', error);
        logger.error(`Error fetching Association: ${error}`);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// Controller to Fetch Charger Details With Session
async function FetchChargerDetailsWithSession(req, res) {
    try {
        const { client_id } = req.body;

        // Validate client_id
        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'Client ID is required' });
        }

        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");

        // Aggregation pipeline
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
            return res.status(404).json({ status: 'Failed', message: 'No chargers found for the specified client_id' });
        }

        // Sort sessiondata within each chargerID based on stop_time
        result.forEach(charger => {
            if (charger.sessiondata.length > 1) {
                charger.sessiondata.sort((a, b) => new Date(b.stop_time) - new Date(a.stop_time));
            }
        });

        return res.status(200).json({ status: 'Success', data: result });

    } catch (error) {
        console.error(`Error fetching charger details: ${error.message}`);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
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
async function addNewClient(req, res) {
    try {
        const { reseller_id, client_name, client_phone_no, client_email_id, client_address, created_by } = req.body;

        // Validate required fields
        if (!reseller_id || !client_name || !client_phone_no || !client_email_id || !client_address || !created_by) {
            return res.status(400).json({ status: 'Failed', message: "Required fields are missing!" });
        }

        const db = await database.connectToDatabase();
        const clientCollection = db.collection("client_details");
        const roleCollection = db.collection("user_roles");

        const role_id = 3; // Role ID for clients

        // Check if Client Role is active
        const clientRole = await roleCollection.findOne({ role_id: role_id });
        if (!clientRole) {
            return res.status(404).json({ status: 'Failed', message: "Client role not found in the system." });
        }
        if (clientRole.status === false) {
            return res.status(400).json({ status: 'Failed', message: "Client role is deactivated. Cannot create client & user." });
        }

        // Check if client_email_id or client_name already exists
        const existingClient = await clientCollection.findOne({
            $or: [{ client_email_id: client_email_id }, { client_name: client_name }]
        });

        if (existingClient) {
            return res.status(409).json({ status: 'Failed', message: "Client with this name or email already exists" });
        }

        // Get the highest client_id and increment
        const lastClient = await clientCollection.find().sort({ client_id: -1 }).limit(1).toArray();
        let nextClientId = lastClient.length > 0 ? lastClient[0].client_id + 1 : 1;

        // Insert new client
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
            return res.status(500).json({ status: 'Failed', message: "Failed to create client" });
        }

        console.log(`New client added successfully with client_id ${nextClientId}`);

        // Step 5: Create user automatically
        const userCreationResult = await CreateUserAutomatic(role_id, nextClientId, reseller_id, client_name, client_email_id, client_phone_no, created_by);

        if (!userCreationResult.success) {
            console.log("User creation failed:", userCreationResult.message);
        } else {
            console.log("User creation result:", userCreationResult.message);
        }

        return res.status(200).json({ status: 'Success', message: 'Client created successfully' });

    } catch (error) {
        console.error("Error in addNewClient:", error.message);
        return res.status(500).json({ status: 'Failed', message: "Internal Server Error" });
    }
}

// Update Client
async function updateClient(req, res) {
    try {
        const { client_id, client_name, client_phone_no, client_address, modified_by, status, client_wallet } = req.body;

        const db = await database.connectToDatabase();
        const clientCollection = db.collection("client_details");

        // Validate required fields
        if (!client_id || !client_name || !client_phone_no || !client_address || !modified_by || client_wallet === undefined) {
            return res.status(400).json({ status: 'Failed', message: "Client update fields are missing" });
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

        if (result.matchedCount === 0) {
            return res.status(404).json({ status: 'Failed', message: "Client not found to update" });
        }

        console.log(`Client updated successfully with client_id ${client_id}`);
        return res.status(200).json({ status: 'Success', message: 'Client updated successfully' });

    } catch (error) {
        console.error("Error in updateClient:", error.message);
        return res.status(500).json({ status: 'Failed', message: "Internal Server Error" });
    }
}

// Update Commission
async function updateCommission(req, res) {
    try {
        const { chargerID, reseller_commission, modified_by } = req.body;
        const db = await database.connectToDatabase();
        const ChargerCollection = db.collection("charger_details");

        // Validate required fields
        if (!chargerID || reseller_commission === undefined || !modified_by) {
            return res.status(400).json({ status: 'Failed', message: "Commission update fields are missing" });
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

        if (result.matchedCount === 0) {
            return res.status(404).json({ status: 'Failed', message: "Charger not found to update commission" });
        }

        console.log(`Reseller commission updated successfully for charger_id ${chargerID}`);
        return res.status(200).json({ status: 'Success', message: "Commission updated successfully" });

    } catch (error) {
        console.error("Error in updateCommission:", error.message);
        return res.status(500).json({ status: 'Failed', message: "Internal Server Error" });
    }
}
 
// DeActivate or Activate Client
async function DeActivateClient(req, res) {
    try {
        const { client_id, modified_by, status } = req.body;

        if (!client_id || !modified_by || !status) {
            return res.status(400).json({ status: 'Failed', message: 'Missing required fields' });
        }

        const db = await database.connectToDatabase();
        const clientCollection = db.collection("client_details");

        // Check if the client exists
        const existingUser = await clientCollection.findOne({ client_id: client_id });
        if (!existingUser) {
            return res.status(404).json({ status: 'Failed', message: 'Client not found' });
        }

        // Update client status
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

        if (updateResult.modifiedCount === 0) {
            return res.status(500).json({ status: 'Failed', message: 'Failed to update client status' });
        }

        console.log(`Client ${client_id} status updated to ${status} successfully`);
        return res.status(200).json({ status: 'Success', message: 'Client status updated successfully' });

    } catch (error) {
        console.error('Error in DeActivateClient:', error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// 5.Manage User
// Fetch Users
async function FetchUsers(req, res) {
    try {
        const reseller_id = req.body.reseller_id;

        if (!reseller_id) {
            return res.status(409).json({ status: 'Failed', message: 'Reseller ID is Empty!' });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const rolesCollection = db.collection("user_roles");
        const resellerCollection = db.collection("reseller_details");
        const clientCollection = db.collection("client_details");
        const associationCollection = db.collection("association_details");

        // Query to fetch users with role_id 2 or 3
        const users = await usersCollection.find({ role_id: { $in: [2, 3] }, reseller_id }).toArray();

        if (!users.length) {
            return res.status(404).json({ status: 'Failed', message: 'No users found for given reseller ID' });
        }

        // Extract all unique ids
        const roleIds = [...new Set(users.map(user => user.role_id))];
        const resellerIds = [...new Set(users.map(user => user.reseller_id))];
        const clientIds = [...new Set(users.map(user => user.client_id))];
        const associationIds = [...new Set(users.map(user => user.association_id))];

        // Fetch related data
        const [roles, resellers, clients, associations] = await Promise.all([
            rolesCollection.find({ role_id: { $in: roleIds } }).toArray(),
            resellerCollection.find({ reseller_id: { $in: resellerIds } }).toArray(),
            clientCollection.find({ client_id: { $in: clientIds } }).toArray(),
            associationCollection.find({ association_id: { $in: associationIds } }).toArray()
        ]);

        // Create lookup maps
        const roleMap = new Map(roles.map(role => [role.role_id, role.role_name]));
        const resellerMap = new Map(resellers.map(reseller => [reseller.reseller_id, reseller.reseller_name]));
        const clientMap = new Map(clients.map(client => [client.client_id, client.client_name]));
        const associationMap = new Map(associations.map(association => [association.association_id, association.association_name]));

        // Attach additional details
        const usersWithDetails = users.map(user => ({
            ...user,
            role_name: roleMap.get(user.role_id) || 'Unknown',
            reseller_name: resellerMap.get(user.reseller_id) || null,
            client_name: clientMap.get(user.client_id) || null,
            association_name: associationMap.get(user.association_id) || null
        }));

        return res.status(200).json({ status: 'Success', data: usersWithDetails });

    } catch (error) {
        console.error('Error in FetchUsers:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch users' });
    }
}

// Fetch Specific User Role For Selection
async function FetchSpecificUserRoleForSelection(req, res) {
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("user_roles");

        // Query to fetch specific roles
        const roles = await usersCollection.find(
            { role_id: { $in: [3] }, status: true },
            {
                projection: {
                    role_id: 1,
                    role_name: 1,
                    _id: 0
                }
            }
        ).toArray();

        if (!roles.length) {
            return res.status(404).json({ status: 'Failed', message: 'No roles found' });
        }

        return res.status(200).json({ status: 'Success', data: roles });

    } catch (error) {
        console.error('Error in FetchSpecificUserRoleForSelection:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch specific user roles' });
    }
}

// FetchClientForSelection
async function FetchClientForSelection(req, res) {
    try {
        const reseller_id = req.body.reseller_id;

        if (!reseller_id) {
            return res.status(409).json({ status: 'Failed', message: 'Reseller ID is empty!' });
        }

        const db = await database.connectToDatabase();
        const clientsCollection = db.collection("client_details");
        const usersCollection = db.collection("users");

        // Fetch all client_ids already linked with users
        const userClientIds = await usersCollection.distinct("client_id");

        // Fetch available clients excluding already linked client_ids
        const clients = await clientsCollection.find(
            {
                status: true,
                reseller_id: reseller_id,
                client_id: { $nin: userClientIds }
            },
            {
                projection: {
                    client_id: 1,
                    client_name: 1,
                    _id: 0
                }
            }
        ).toArray();

        if (!clients.length) {
            return res.status(404).json({ status: 'Failed', message: 'No clients found' });
        }

        return res.status(200).json({ status: 'Success', data: clients });

    } catch (error) {
        console.error('Error in FetchClientForSelection:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch clients' });
    }
}

// Create User
async function CreateUser(req, res) {
    try {
        const { role_id, reseller_id, client_id, username, email_id, password, phone_no, created_by } = req.body;

        // Validate input
        if (!username || !role_id || !email_id || !password || !created_by || !reseller_id || !client_id) {
            return res.status(400).json({ status: 'Failed', message: 'Username, Role ID, Email, reseller id, client id, Password, and Created By are required' });
        }

        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const UserRole = db.collection("user_roles");

        // Check if the role ID exists
        const existingRole = await UserRole.findOne({ role_id: role_id });
        if (!existingRole) {
            return res.status(400).json({ status: 'Failed', message: 'Invalid Role ID' });
        }

        // Check for duplicate email with the same role
        const duplicateEmailWithRole = await Users.findOne({ role_id: role_id, email_id: email_id });
        if (duplicateEmailWithRole) {
            return res.status(409).json({ status: 'Failed', message: "This email is already registered under the same role" });
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
            password: parseInt(password), // Consider hashing this for security
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
            return res.status(200).json({ status: 'Success', message: 'New user created successfully' });
        } else {
            return res.status(500).json({ status: 'Failed', message: 'User creation failed' });
        }

    } catch (error) {
        console.error("Error creating user:", error);
        logger.error(error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// Update User
async function UpdateUser(req, res) {
    try {
        const { user_id, username, phone_no, password, wallet_bal, modified_by, status } = req.body;

        // Validate input
        if (!user_id || !username || !password || !modified_by) {
            return res.status(400).json({ status: 'Failed', message: 'User ID, Username, Password, and Modified By are required' });
        }

        const db = await database.connectToDatabase();
        const Users = db.collection("users");

        // Check if user exists
        const existingUser = await Users.findOne({ user_id: user_id });
        if (!existingUser) {
            return res.status(404).json({ status: 'Failed', message: 'User not found' });
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
                    password: parseInt(password), // Consider hashing the password for security
                    status: status,
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(500).json({ status: 'Failed', message: 'Failed to update user' });
        }

        return res.status(200).json({ status: 'Success', message: 'User updated successfully' });

    } catch (error) {
        console.error("Error in UpdateUser:", error);
        logger.error(error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// 6.Withdrawal
// Fetch Commission Amount for Reseller
async function FetchCommissionAmtReseller(req, res) {
    const { user_id } = req.body;

    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const resellersCollection = db.collection("reseller_details");

        // Fetch the user with the specified user_id
        const user = await usersCollection.findOne({ user_id: user_id });

        if (!user) {
            return res.status(404).json({ status: 'Failed', message: 'User not found' });
        }

        // Extract reseller_id from the user object
        const resellerId = user.reseller_id;

        if (!resellerId) {
            return res.status(404).json({ status: 'Failed', message: 'Reseller ID not found for this user' });
        }

        // Fetch the reseller with the specified reseller_id
        const reseller = await resellersCollection.findOne({ reseller_id: resellerId });

        if (!reseller) {
            return res.status(404).json({ status: 'Failed', message: 'Reseller not found' });
        }

        // Extract reseller_wallet from reseller object
        const resellerWallet = reseller.reseller_wallet;

        // Return the commission amount (reseller_wallet)
        return res.status(200).json({ status: 'Success', data: resellerWallet });

    } catch (error) {
        console.error(`Error fetching reseller wallet balance: ${error}`);
        logger.error(`Error fetching reseller wallet balance: ${error}`);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
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
async function fetchUserBankDetails(req, res) {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: true, message: 'User ID is required' });
        }

        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const BankDetails = db.collection("bank_details");

        const user = await Users.findOne({ user_id });

        if (!user) {
            return res.status(404).json({ error: true, message: 'No user found' });
        }

        const bankDetails = await BankDetails.findOne({ user_id: user.user_id });

        if (!bankDetails) {
            return res.status(404).json({ error: true, message: 'No bank details found for this user' });
        }

        return res.status(200).json({ error: false, data: bankDetails });

    } catch (error) {
        console.error('Controller error:', error);
        logger.error(error);
        return res.status(500).json({ error: true, message: 'Internal Server Error' });
    }
}

// updateUserBankDetails
async function updateUserBankDetails(req, res) {
    try {
        const { _id, user_id, accountHolderName, bankName, accountNumber, ifscNumber, modified_by } = req.body;

        if (!_id || !user_id || !accountNumber) {
            return res.status(400).json({ status: 'Failed', message: 'User ID, Account Number, and Bank ID are required' });
        }

        const objectId = new ObjectId(_id);
        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const BankDetails = db.collection("bank_details");

        const existingUser = await Users.findOne({ user_id });
        if (!existingUser) {
            return res.status(404).json({ status: 'Failed', message: 'User not found' });
        }

        const existingBankDetails = await BankDetails.findOne({ _id: objectId });
        if (!existingBankDetails) {
            return res.status(404).json({ status: 'Failed', message: 'Bank details not found' });
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
            return res.status(400).json({ status: 'Failed', message: 'No changes made to bank details' });
        }

        return res.status(200).json({ status: 'Success', message: 'Bank details updated successfully' });

    } catch (error) {
        console.error('Controller Error:', error);
        logger.error(error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// Function to ApplyWithdrawal
async function ApplyWithdrawal(req, res) {
    try {
        const { user_id, withdrawalAmount, accountHolderName, accountNumber, bankName, withdrawal_req_by, ifscNumber } = req.body;

        if (!user_id || !withdrawalAmount || !accountHolderName || !accountNumber || !bankName || !withdrawal_req_by || !ifscNumber) {
            return res.status(400).json({ status: 'Failed', message: 'Missing required fields' });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const resellersCollection = db.collection("reseller_details");
        const bankDetailsCollection = db.collection("bank_details");
        const withdrawalCollection = db.collection("withdrawal_details");

        // Check if user exists
        const user = await usersCollection.findOne({ user_id });
        if (!user) {
            return res.status(404).json({ status: 'Failed', message: 'User not found' });
        }

        // Check if reseller exists
        const reseller = await resellersCollection.findOne({ reseller_id: user.reseller_id });
        if (!reseller) {
            return res.status(404).json({ status: 'Failed', message: 'Reseller not found' });
        }

        // Check if bank details exist
        const bankDetails = await bankDetailsCollection.findOne({ user_id });
        if (!bankDetails) {
            return res.status(404).json({ status: 'Failed', message: 'No bank details found for this user' });
        }

        // Check if any pending or in-progress withdrawal requests
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

        return res.status(200).json({ status: 'Success', message: 'Withdrawal request submitted successfully. Your payment will be processed soon.' });

    } catch (error) {
        console.error('Error processing withdrawal request:', error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// Function to fetch payment request details
async function FetchPaymentRequest(req, res) {
    try {
        const { user_id } = req.body; // Get user_id from request body

        if (!user_id) {
            return res.status(400).json({ status: 'Failed', message: 'user_id is required' });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const resellersCollection = db.collection("reseller_details");
        const withdrawalCollection = db.collection("withdrawal_details");

        // Fetch user details
        const user = await usersCollection.findOne({ user_id });
        if (!user) {
            return res.status(404).json({ status: 'Failed', message: 'User not found' });
        }

        // If user has a reseller_id, fetch reseller details
        let resellerData = null;
        if (user.reseller_id) {
            resellerData = await resellersCollection.findOne({ reseller_id: user.reseller_id });
        }

        // Fetch all withdrawal details related to user_id
        const withdrawalDetails = await withdrawalCollection.find({ user_id }).toArray();

        return res.status(200).json({
            status: 'Success',
            data: {
                user,
                resellerData,
                withdrawalDetails
            }
        });
    } catch (error) {
        console.error('Error fetching payment request details:', error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// Function to fetch payment request details with unread notification count
async function FetchPaymentNotification(req, res) {
    try {
        const { user_id } = req.body; // Get user_id from request body

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

        return res.status(200).json({ status: 'Success', data: results });

    } catch (error) {
        console.error('Error fetching payment notification:', error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// Function to mark notification as read
async function MarkNotificationRead(req, res) {
    try {
        const { _id, rca_admin_notification_status } = req.body;

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

        if (!withdrawal) {
            return res.status(404).json({ status: 'Failed', message: 'Notification not found' });
        }

        // Check if it's already marked as "read"
        if (withdrawal.rca_admin_notification_status === "read") {
            return res.status(400).json({ status: 'Failed', message: 'Notification already marked as read' });
        }

        // Prepare update fields
        const updateFields = {
            rca_admin_notification_status
        };

        // Update the withdrawal request
        const updateResult = await withdrawalCollection.updateOne(
            { _id: objectId },
            { $set: updateFields }
        );

        if (updateResult.modifiedCount > 0) {
            return res.status(200).json({ status: 'Success', message: 'Notification marked as read successfully' });
        } else {
            return res.status(400).json({ status: 'Failed', message: 'Failed to mark notification as read' });
        }

    } catch (error) {
        console.error('Error in MarkNotificationRead function:', error);
        return res.status(500).json({ status: 'Failed', message: 'Internal server error' });
    }
}

// 7.Manage Device & Revenue Report Controller
//FetchReportDevice
async function FetchReportDevice(req, res) {
    try {
        const { reseller_id } = req.body;

        // Validation
        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: "Reseller ID is required." });
        }

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Find chargers by reseller_id
        const chargers = await devicesCollection.find({ assigned_reseller_id: reseller_id }).toArray();

        if (chargers.length === 0) {
            return res.status(404).json({ status: 'Failed', message: "No chargers found for this reseller ID." });
        }

        const safeChargers = JSON.parse(JSON.stringify(chargers));
        return res.status(200).json({ status: 'Success', data: safeChargers });

    } catch (error) {
        console.error('Error in FetchReportDevice:', error);
        return res.status(500).json({ status: 'Failed', message: "Failed to fetch chargers." });
    }
}

// DeviceReport Validations
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

// DeviceReport Controller
async function DeviceReport(req, res) {
    try {
        const { from_date, to_date, device_id } = req.body;

        // Validation
        if (!from_date || !to_date || !device_id) {
            return res.status(400).json({ status: 'Failed', message: 'from_date, to_date, and device_id are required!' });
        }

        const db = await database.connectToDatabase();
        const Collection = db.collection('device_session_details');

        const validateDate = validateAndConvertDates(from_date, to_date);
        if (validateDate.status !== 200) {
            return res.status(validateDate.status).json({ status: 'Failed', message: validateDate.message });
        }

        const sessions = await Collection.find({
            charger_id: device_id,
            stop_time: {
                $gte: validateDate.fromDate.toISOString(),
                $lte: validateDate.toDate.toISOString()
            }
        }).sort({ stop_time: -1 }).toArray();

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ status: 'Failed', message: 'No device report found for the given period and device ID!' });
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
                start_time: session.start_time ? new Date(session.start_time).toLocaleString() : 'N/A',
                stop_time: session.stop_time ? new Date(session.stop_time).toLocaleString() : 'N/A',
                unit_consumed: session.unit_consummed ? `${session.unit_consummed} kWh` : '0 kWh',
                price: session.price ? `Rs. ${Number(session.price).toFixed(2)}` : 'Rs. 0.00'
            }))
        };

        return res.status(200).json({ status: 'Success', data: responseData });

    } catch (error) {
        console.error('Controller Error:', error);
        logger.error(error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// Controller to fetch specific charger revenue list
async function FetchSpecificChargerRevenue(req, res) {
    try {
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const db = await database.connectToDatabase();
        if (!db) {
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");
        const clientCollection = db.collection("client_details");

        // Convert reseller_id to Integer (to match MongoDB stored type)
        const resellerId = parseInt(reseller_id);

        // Fetch chargers assigned to this reseller
        const chargers = await chargerCollection.find({ assigned_reseller_id: resellerId }).toArray();

        if (!chargers.length) {
            return res.status(404).json({
                status: "Failed",
                message: "No chargers found for this reseller",
                revenueData: [],
                TotalChargerRevenue: "0.000"
            });
        }

        let TotalChargerRevenue = 0;

        const revenueData = await Promise.all(chargers.map(async (charger) => {
            const client = await clientCollection.findOne({ reseller_id: resellerId });
            const client_email_id = client?.client_email_id || null;

            const sessions = await sessionCollection.find({
                charger_id: charger.charger_id,
                start_time: { $ne: null },
                stop_time: { $ne: null }
            }).toArray();

            const Revenue = sessions.reduce((sum, session) => {
                return sum + parseFloat(session.reseller_commission || 0);
            }, 0);

            TotalChargerRevenue += Revenue;

            return {
                charger_id: charger.charger_id,
                client_email_id,
                Revenue: Revenue.toFixed(3)
            };
        }));

        return res.status(200).json({
            status: "Success",
            revenueData,
            TotalChargerRevenue: TotalChargerRevenue.toFixed(3)
        });

    } catch (error) {
        console.error(`Error in FetchSpecificChargerRevenue controller: ${error.message}`);
        return res.status(500).json({ status: 'Failed', message: 'Error fetching specific charger revenue' });
    }
}

// Controller to fetch charger list with all cost and revenue
async function FetchChargerListWithAllCostWithRevenue(req, res) {
    try {
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const db = await database.connectToDatabase();
        if (!db) {
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");
        const clientCollection = db.collection("client_details");

        const resellerId = parseInt(reseller_id);

        const chargers = await chargerCollection.find({ assigned_reseller_id: resellerId }).toArray();

        if (!chargers.length) {
            return res.status(404).json({
                status: "Failed",
                message: "No chargers found for this reseller",
                revenueData: []
            });
        }

        const revenueData = await Promise.all(chargers.map(async (charger) => {
            const client = await clientCollection.findOne({ reseller_id: resellerId });
            const client_email_id = client?.client_email_id || null;

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

        return res.status(200).json({
            status: "Success",
            revenueData,
        });

    } catch (error) {
        console.error(`Error in FetchChargerListWithAllCostWithRevenue controller: ${error.message}`);
        return res.status(500).json({ status: 'Failed', message: 'Error fetching charger list with all cost and revenue' });
    }
}

// 8.Profile Controller
//FetchUserProfile
const FetchUserProfile = async (req, res) => {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'user_id is required'
            });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

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
            return res.status(404).json({
                status: 'Failed',
                message: 'User not found'
            });
        }

        return res.status(200).json({
            status: 'Success',
            data: result[0]
        });

    } catch (error) {
        console.error('Error in FetchUserProfile:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
};

//UpdateUserProfile
const UpdateUserProfile = async (req, res) => {
    const { user_id, username, phone_no, password } = req.body;

    try {
        // Validate required fields
        if (!user_id || !username || !phone_no || !password) {
            return res.status(400).json({
                status: 'Failed',
                message: 'User ID, username, phone number, and password are required'
            });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

        // Check if the user exists
        const existingUser = await usersCollection.findOne({ user_id });
        if (!existingUser) {
            return res.status(404).json({
                status: 'Failed',
                message: 'User not found'
            });
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
            return res.status(404).json({
                status: 'Failed',
                message: 'User not found'
            });
        }

        if (updateResult.modifiedCount === 0) {
            return res.status(400).json({
                status: 'Failed',
                message: 'No changes made to the user profile'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'User profile updated successfully'
        });

    } catch (error) {
        console.error(`Error updating user profile: ${error}`);
        logger.error(error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
};

//UpdateResellerProfile
const UpdateResellerProfile = async (req, res) => {
    const { reseller_id, modified_by, reseller_phone_no, reseller_address } = req.body;

    try {
        // Validate required fields
        if (!reseller_id || !modified_by || !reseller_phone_no || !reseller_address) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Reseller ID, modified_by, phone number, and reseller address are required'
            });
        }

        const db = await database.connectToDatabase();
        const resellerCollection = db.collection("reseller_details");

        // Update the reseller profile
        const updateResult = await resellerCollection.updateOne(
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
            return res.status(404).json({
                status: 'Failed',
                message: 'Reseller not found'
            });
        }

        if (updateResult.modifiedCount === 0) {
            return res.status(400).json({
                status: 'Failed',
                message: 'No changes made to the reseller profile'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'Reseller profile updated successfully'
        });

    } catch (error) {
        console.error(`Error updating reseller profile: ${error}`);
        logger.error(`Error updating reseller profile: ${error}`);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
};

module.exports = {
    authenticate, FetchTotalUsers, FetchTotalCharger, FetchOnlineCharger, FetchOfflineCharger, FetchFaultsCharger, FetchChargerTotalEnergy, FetchTotalChargersSession,
    FetchAllocatedCharger, FetchUnAllocatedCharger, DeActivateOrActivateCharger, AssginChargerToClient, FetchClientUserToAssginCharger, FetchUnAllocatedChargerToAssgin,
    getAllClients, FetchAssignedAssociation, FetchChargerDetailsWithSession, addNewClient, updateClient, DeActivateClient, updateCommission,
    FetchUsers, FetchSpecificUserRoleForSelection, FetchClientForSelection, CreateUser, UpdateUser,
    FetchCommissionAmtReseller, saveUserBankDetails, fetchUserBankDetails, updateUserBankDetails, ApplyWithdrawal, FetchPaymentRequest, FetchPaymentNotification, MarkNotificationRead, 
    FetchReportDevice, DeviceReport, FetchSpecificChargerRevenue, FetchChargerListWithAllCostWithRevenue,
    FetchUserProfile, UpdateUserProfile, UpdateResellerProfile,
};