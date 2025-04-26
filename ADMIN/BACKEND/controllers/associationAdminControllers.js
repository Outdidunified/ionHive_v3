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
        const associationCollection = db.collection('association_details');

        const user = await usersCollection.findOne({ email_id: email, role_id: 4, status: true });

        if (!user || user.password !== password || user.role_id !== 4) {
            return { error: true, status: 401, message: 'Invalid credentials or user is deactivated' };
        }

        // Fetch association details using association_id and check if the status is true
        const getassociationDetails = await associationCollection.findOne({ association_id: user.association_id, status: true });

        // If association details not found or deactivated, return an error
        if (!getassociationDetails) {
            return { status: 404, message: 'association details not found or deactivated' };
        }

        // Generate JWT token
        const token = jwt.sign({ username: user.username }, JWT_SECRET);

        return {
            error: false,
            user: {
                association_name: getassociationDetails.association_name,
                association_id: getassociationDetails.association_id,
                user_id: user.user_id,
                username: user.username,
                email_id: user.email_id,
                role_id: user.role_id,
                reseller_id: user.reseller_id,
                client_id: user.client_id,
                token: token
            }
        };

    } catch (error) {
        console.error(error);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
};

// 2.Dashboard
// Function to fetch chargers assigned to a specific association
async function FetchTotalCharger(association_id) {
    try {
        console.log("Connecting to the database...");
        const db = await database.connectToDatabase();

        if (!db) {
            console.error("Database connection failed!");
            throw new Error("Database connection failed");
        }

        const chargerCollection = db.collection("charger_details");

        // console.log("Fetching chargers for association_id:", association_id);

        const recentChargers = await chargerCollection.find({
            assigned_association_id: association_id
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
async function FetchOnlineCharger(association_id) {
    try {
        const db = await database.connectToDatabase();

        const chargerCollection = db.collection("charger_details");
        const statusCollection = db.collection("charger_status");

        // Get charger IDs assigned to the given association_id
        const assignedChargers = await chargerCollection.find({ assigned_association_id: association_id }).toArray();

        if (!assignedChargers.length) {
            return { totalCount: 0, onlineChargers: [], message: "No chargers assigned to this association" };
        }

        // Extract charger IDs
        const chargerIds = assignedChargers.map(charger => charger.charger_id);
        console.log("Charger IDs assigned to association:", chargerIds);

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
async function FetchOfflineCharger(association_id) {
    try {
        const db = await database.connectToDatabase();

        const chargerCollection = db.collection("charger_details");
        const statusCollection = db.collection("charger_status");

        // Get charger IDs assigned to the given association_id
        const assignedChargers = await chargerCollection.find({ assigned_association_id: association_id }).toArray();

        if (!assignedChargers.length) {
            return { totalCount: 0, offlineChargers: [], message: "No chargers assigned to this association" };
        }

        // Extract charger IDs
        const chargerIds = assignedChargers.map(charger => charger.charger_id);
        console.log("Charger IDs assigned to association:", chargerIds);

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
async function FetchFaultsCharger(association_id) {
    try {
        const db = await database.connectToDatabase();

        const chargerCollection = db.collection("charger_details");
        const statusCollection = db.collection("charger_status");

        // Get charger IDs assigned to the given association_id
        const assignedChargers = await chargerCollection.find({ assigned_association_id: association_id }).toArray();

        if (!assignedChargers.length) {
            return { totalCount: 0, faultyChargers: [], message: "No chargers assigned to this association" };
        }

        // Extract charger IDs
        const chargerIds = assignedChargers.map(charger => charger.charger_id);
        console.log("Charger IDs assigned to association:", chargerIds);

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
async function FetchChargerTotalEnergy(association_id) {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");

        // Get charger IDs assigned to the given association_id
        const assignedChargers = await chargerCollection.find({ assigned_association_id: association_id }).toArray();

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
        console.log("Charger IDs assigned to reseller:", chargerIds);

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

        // Step 1: Calculate Distance Driven by EV
        const distanceDrivenByEV = totalEnergyConsumed / EV_EFFICIENCY;

        // Step 2: Calculate CO2 Emissions from ICE Vehicle
        const CO2_from_ICE = distanceDrivenByEV * ICE_CO2_PER_KM;

        // Step 3: Calculate CO2 Emissions from EV
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

// Fetch Total Charger Charging Sessions for a Specific association
async function FetchTotalChargersSession(association_id) {
    try {
        // console.log("Connecting to the database...");
        const db = await database.connectToDatabase();

        if (!db) {
            console.error("Database connection failed!");
            throw new Error("Database connection failed");
        }

        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");

        // Find all chargers assigned to the given reseller
        const chargers = await chargerCollection.find({ assigned_association_id: association_id }).toArray();

        if (chargers.length === 0) {
            console.log("No chargers found for association_id:", association_id);
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

// Fetch Total App Users for a Specific association
async function FetchTotalUsers(association_id) {
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

        if (!db) {
            // console.error("Database connection failed!");
            throw new Error("Database connection failed");
        }

        // Fetch users assigned to this reseller
        const users = await usersCollection.find({ association_id: association_id }).toArray();

        if (!users.length) {
            return { clientsCount: 0, associationsCount: 0, appUsersCount: 0 };
        }

        // Count App Users (role_id = 5)
        const appUsersCount = users.filter(user => user.role_id === 5).length;

        return {
            appUsersCount
        };
    } catch (error) {
        console.error(`Error fetching user counts: ${error}`);
        throw new Error('Error fetching user counts');
    }
}

// 3.Manage Device
//FetchAllocatedChargerByClientToAssociation
async function FetchAllocatedChargerByClientToAssociation(req) {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            throw new Error('Association ID is required');
        }

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");
        const configCollection = db.collection("socket_gun_config");
        const financeCollection = db.collection("financeDetails");

        // Fetch chargers assigned to the specified association_id
        const chargers = await devicesCollection.find({ assigned_association_id: association_id }).toArray();

        if (!chargers.length) {
            return { status: 404, message: "No chargers were found" };
        }

        // Fetch finance records based on association_id
        const financeData = await financeCollection.find({ association_id }).toArray();

        // Convert financeData into a map for quick lookup by finance_id
        const financeMap = {};
        if (financeData.length) {
            financeData.forEach(financeRecord => {
                const financeID = financeRecord.finance_id;
                const EB_fee = parseFloat(financeRecord.eb_charge) || 0;
                const additionalCharges = [
                    parseFloat(financeRecord.margin) || 0,
                    parseFloat(financeRecord.parking_fee) || 0,
                    parseFloat(financeRecord.convenience_fee) || 0,
                    parseFloat(financeRecord.station_fee) || 0,
                    parseFloat(financeRecord.processing_fee) || 0,
                    parseFloat(financeRecord.service_fee) || 0
                ];
                const totalAdditionalCharges = additionalCharges.reduce((sum, charge) => sum + charge, 0);
                const TotalEBPrice = EB_fee + totalAdditionalCharges;
                const gstPercentage = parseFloat(financeRecord.gst) || 0;
                const gstAmount = (TotalEBPrice * gstPercentage) / 100;
                const totalPrice = (TotalEBPrice + gstAmount).toFixed(3);

                financeMap[financeID] = totalPrice;
            });
        }

        const results = [];

        for (let charger of chargers) {
            const chargerID = charger.charger_id;
            const financeID = charger.finance_id;

            // Get the correct total price based on finance_id
            const total_price = financeMap[financeID];

            const config = await configCollection.findOne({ charger_id: chargerID });

            let connectorDetails = [];
            if (config) {
                let connectorIndex = 1;
                while (config[`connector_${connectorIndex}_type`] !== undefined) {
                    let connectorTypeValue =
                        config[`connector_${connectorIndex}_type`] === 1 ? "Socket" :
                            config[`connector_${connectorIndex}_type`] === 2 ? "Gun" :
                                config[`connector_${connectorIndex}_type`];

                    connectorDetails.push({
                        connector_type: connectorTypeValue,
                        connector_type_name: config[`connector_${connectorIndex}_type_name`]
                    });

                    connectorIndex++;
                }
            }

            let chargerData = {
                ...charger,
                connector_details: connectorDetails.length > 0 ? connectorDetails : null
            };

            // Only add unit_price if finance data exists
            if (total_price !== undefined) {
                chargerData.unit_price = total_price;
            }

            results.push(chargerData);
        }

        return results; // Returning charger details array

    } catch (error) {
        console.error(`Error fetching chargers: ${error.message}`);
        throw new Error('Failed to fetch chargers');
    }
}

//UpdateDevice 
async function UpdateDevice(data) {
    const { modified_by, charger_id, charger_accessibility, wifi_username, wifi_password, lat, long, address, landmark } = data;

    // Validate the input for mandatory fields
    if (!modified_by || !charger_id || !charger_accessibility || !lat || !long || !address || !landmark) {
        const error = new Error('All the fields are required');
        error.statusCode = 400;
        throw error;
    }

    const db = await database.connectToDatabase();
    const devicesCollection = db.collection("charger_details");

    // Check if the charger exists
    const existingCharger = await devicesCollection.findOne({ charger_id });
    if (!existingCharger) {
        const error = new Error('ChargerID not found');
        error.statusCode = 404;
        throw error;
    }

    // Prepare fields to update
    const updateFields = {
        charger_accessibility,
        lat,
        long,
        modified_by,
        modified_date: new Date(),
        address: address || 'Unknown Location',
        landmark,
    };

    if (wifi_username !== undefined && wifi_username !== null) {
        updateFields.wifi_username = wifi_username;
    }

    if (wifi_password !== undefined && wifi_password !== null) {
        updateFields.wifi_password = wifi_password;
    }

    const updateResult = await devicesCollection.updateOne(
        { charger_id },
        { $set: updateFields }
    );

    if (updateResult.matchedCount === 0) {
        const error = new Error('Failed to update charger');
        error.statusCode = 500;
        throw error;
    }

    // Return something if needed
    return { charger_id, updated: true };
}

//DeActivateOrActivate 
async function DeActivateOrActivateCharger(data) {
    const { modified_by, charger_id, status } = data;

    // Validation
    if (!modified_by || !charger_id || typeof status !== 'boolean') {
        const error = new Error('Username, chargerID, and Status (boolean) are required');
        error.statusCode = 400;
        throw error;
    }

    const db = await database.connectToDatabase();
    const devicesCollection = db.collection("charger_details");

    // Check if the charger exists
    const existingCharger = await devicesCollection.findOne({ charger_id });
    if (!existingCharger) {
        const error = new Error('chargerID not found');
        error.statusCode = 404;
        throw error;
    }

    // Update the charger status
    const updateResult = await devicesCollection.updateOne(
        { charger_id },
        {
            $set: {
                status,
                modified_by,
                modified_date: new Date()
            }
        }
    );

    if (updateResult.matchedCount === 0) {
        const error = new Error('Failed to update charger');
        error.statusCode = 500;
        throw error;
    }

    // Return data if needed
    return { charger_id, updated: true, new_status: status };
}

// Function to assignFinance details
async function assignFinance({ _id, charger_id, finance_id }) {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection('charger_details');

        // Validate _id format
        if (!ObjectId.isValid(_id)) {
            return { status: 'Failed', message: 'Invalid _id format' };
        }

        // Check if `_id` exists in `charger_details`
        const existingCharger = await chargerCollection.findOne({ _id: new ObjectId(_id) });

        if (!existingCharger) {
            return { status: 'Failed', message: 'No record found for the given id' };
        }

        // Check if `_id` contains the given `charger_id`
        if (existingCharger.charger_id !== charger_id) {
            return { status: 'Failed', message: 'id and charger_id do not match' };
        }

        // Check if finance_id already exists
        if (existingCharger.finance_id) {
            if (existingCharger.finance_id === finance_id) {
                return { status: 'Failed', message: 'This charger is already assigned to the same finance_id' };
            }
            return { status: 'Failed', message: `This charger is already assigned to finance_id ${existingCharger.finance_id}. Reassigning is not allowed.` };
        }

        // Assign new finance_id
        const updateResult = await chargerCollection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: { finance_id } }
        );

        if (updateResult.modifiedCount > 0) {
            return { status: 'Success', message: 'Finance ID assigned successfully' };
        } else {
            return { status: 'Failed', message: 'Failed to assign finance ID' };
        }

    } catch (error) {
        console.error('Error in assignFinance:', error);
        return { status: 'Failed', message: 'Error assigning finance ID' };
    }
}

// Function to reAssignFinance details
async function reAssignFinance({ _id, charger_id, finance_id }) {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection('charger_details');

        // Validate _id format
        if (!ObjectId.isValid(_id)) {
            return { status: 'Failed', message: 'Invalid _id format' };
        }

        // Check if `_id` exists in `charger_details`
        const existingCharger = await chargerCollection.findOne({ _id: new ObjectId(_id) });

        if (!existingCharger) {
            return { status: 'Failed', message: 'No record found for the given id' };
        }

        // Check if `_id` contains the given `charger_id`
        if (existingCharger.charger_id !== charger_id) {
            return { status: 'Failed', message: 'id and charger_id do not match' };
        }

        // If finance_id is already assigned to the same value, return no change message
        if (existingCharger.finance_id === finance_id) {
            return { status: 'Failed', message: 'No changes detected, finance_id remains the same' };
        }

        // Update finance_id
        const updateResult = await chargerCollection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: { finance_id } }
        );

        if (updateResult.modifiedCount > 0) {
            return { status: 'Success', message: 'Finance ID reassigned successfully' };
        } else {
            return { status: 'Failed', message: 'Failed to reassign finance ID' };
        }

    } catch (error) {
        console.error('Error in reAssignFinance:', error);
        return { status: 'Failed', message: 'Error reassigning finance ID' };
    }
}

// Function to Fetch Finance by Association ID// Function to Fetch Finance by Association ID
async function FetchFinance_dropdown(association_id) {
    try {
        const db = await database.connectToDatabase();
        const financeCollection = db.collection('financeDetails');

        // Fetch finance records based on association_id
        const financeData = await financeCollection.find({ association_id, status: true }).toArray();

        // If no records are found, return an error message
        if (financeData.length === 0) {
            return { status: 'Failed', message: 'No finance records found for this association_id' };
        }

        // Process each finance record to calculate total price
        const processedFinanceData = financeData.map(financeRecord => {
            const EB_fee = parseFloat(financeRecord.eb_charge) || 0;

            // List of additional charges (excluding GST)
            const additionalCharges = [
                parseFloat(financeRecord.margin) || 0,
                parseFloat(financeRecord.parking_fee) || 0,
                parseFloat(financeRecord.convenience_fee) || 0,
                parseFloat(financeRecord.station_fee) || 0,
                parseFloat(financeRecord.processing_fee) || 0,
                parseFloat(financeRecord.service_fee) || 0
            ];

            // Calculate total additional charges (sum of all charges except GST)
            const totalAdditionalCharges = additionalCharges.reduce((sum, charge) => sum + charge, 0);

            // Calculate the base price (including additional charges per unit)
            const TotalEBPrice = EB_fee + totalAdditionalCharges;

            // Apply GST on the total amount
            const gstPercentage = parseFloat(financeRecord.gst) || 0;
            const gstAmount = (TotalEBPrice * gstPercentage) / 100;

            // Final price after adding GST
            const totalprice = (TotalEBPrice + gstAmount).toFixed(3);

            return { ...financeRecord, totalprice };
        });

        return { status: 'Success', data: processedFinanceData, length: financeData.length };
    } catch (error) {
        console.error('Error in fetchFinance:', error);
        return { status: 'Failed', message: 'Error fetching finance data' };
    }
}

// 4.Manage Users
//FetchUser
async function FetchUser(req) {
    try {
        const association_id = req.body.association_id;
        if (!association_id) {
            throw new Error('Association ID is Empty!');
        }
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const rolesCollection = db.collection("user_roles");
        const resellerCollection = db.collection("reseller_details");
        const clientCollection = db.collection("client_details");
        const associationCollection = db.collection("association_details");

        // Query to fetch users with role_id
        const users = await usersCollection.find({ role_id: { $in: [4, 5] }, association_id }).toArray();

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
            reseller_name: resellerMap?.get(user.reseller_id) || null,
            client_name: clientMap?.get(user.client_id) || null,
            association_name: associationMap?.get(user.association_id) || null
        }));

        // Return the users with all details
        return usersWithDetails;
    } catch (error) {
        logger.error(`Error fetching users by role_id: ${error}`);
        throw new Error('Error fetching users by role_id');
    }
}

// Update User
async function UpdateUser(req) {
    const { user_id, username, phone_no, password, wallet_bal, modified_by, status } = req.body;

    // Validate input
    if (!user_id || !username || !password || !modified_by) {
        const error = new Error('User ID, Username, Password, and Modified By are required');
        error.status = 400;
        throw error;
    }

    const db = await database.connectToDatabase();
    const Users = db.collection("users");

    // Check if user exists
    const existingUser = await Users.findOne({ user_id: user_id });
    if (!existingUser) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    // Perform update
    const updateResult = await Users.updateOne(
        { user_id: user_id },
        {
            $set: {
                username: username,
                phone_no: phone_no,
                password: parseInt(password),
                wallet_bal: parseFloat(wallet_bal) || parseFloat(existingUser.wallet_bal),
                modified_date: new Date(),
                modified_by: modified_by,
                status: status,
            }
        }
    );

    if (updateResult.matchedCount === 0) {
        const error = new Error('Failed to update user');
        error.status = 500;
        throw error;
    }

    // Return result if needed (optional)
    return updateResult;
}

// 5.Manage TagID
// FetchAllTagIDs
async function FetchAllTagIDs(req) {
    try {
        const { association_id } = req.body;

        const db = await database.connectToDatabase();
        const tagsCollection = db.collection("tag_id");

        // Fetch all tag IDs
        const tags = await tagsCollection.find({ association_id: association_id }).toArray();

        // If no tags found
        if (!tags || tags.length === 0) {
            return { status: 404, message: "No tags found" };
        }

        // Return found tags
        return { status: 200, data: tags };

    } catch (error) {
        console.error(`Error fetching tag IDs: ${error}`);
        logger.error(`Error fetching tag IDs: ${error}`);
        return { status: 500, message: 'Internal Server Error' };
    }
}

// CreateTagID
async function CreateTagID(req) {
    try {
        const { tag_id, tag_id_expiry_date, association_id } = req.body;

        // Validate required fields
        if (!tag_id || !tag_id_expiry_date) {
            return { status: 400, message: 'Tag ID and Expiry Date are required' };
        } else if (!association_id) {
            return { status: 400, message: 'Association ID is required' };
        }

        const db = await database.connectToDatabase();
        const tagsCollection = db.collection("tag_id");

        // Check if the tag_id already exists
        const existingTag = await tagsCollection.findOne({ tag_id: tag_id });
        if (existingTag) {
            return { status: 400, message: 'Tag ID already exists' };
        }

        // Fetch the highest current ID and increment by 1
        const lastTag = await tagsCollection.find().sort({ id: -1 }).limit(1).toArray();
        const newId = lastTag.length > 0 ? lastTag[0].id + 1 : 1;

        // Insert the new tag_id
        await tagsCollection.insertOne({
            id: newId,
            association_id: parseInt(association_id),
            tag_id: tag_id,
            tag_id_expiry_date: new Date(tag_id_expiry_date),
            tag_id_assigned: false,
            status: true
        });

        return { status: 200, message: 'Tag ID successfully created', id: newId };
    } catch (error) {
        console.error(`Error creating tag ID: ${error}`);
        // If you have a logger, you can log the error here
        if (logger) {
            logger.error(`Error creating tag ID: ${error}`);
        }
        return { status: 500, message: 'An error occurred while creating the tag ID' };
    }
}

// UpdateTagID
async function UpdateTagID(req) {
    try {
        const { id, tag_id, tag_id_expiry_date, status } = req.body;

        // Validate required fields
        if (!id || (!tag_id && !tag_id_expiry_date && status === undefined)) {
            return { status: 400, message: 'ID and at least one field to update are required' };
        }

        const db = await database.connectToDatabase();
        const tagsCollection = db.collection("tag_id");

        // Check if the tag ID exists
        const tag = await tagsCollection.findOne({ id: id });
        if (!tag) {
            return { status: 404, message: 'Tag ID not found' };
        }

        // Check for duplicate tag_id if the tag_id is being updated
        if (tag_id) {
            const duplicateTag = await tagsCollection.findOne({ tag_id: tag_id, id: { $ne: id } });
            if (duplicateTag) {
                return { status: 400, message: 'Tag ID already exists' };
            }
        }

        // Update the tag_id details
        const updateData = {};
        if (tag_id) updateData.tag_id = tag_id;
        if (tag_id_expiry_date) updateData.tag_id_expiry_date = new Date(tag_id_expiry_date);
        if (status !== undefined) updateData.status = status;

        const result = await tagsCollection.updateOne(
            { id: id },
            { $set: updateData }
        );

        if (result.modifiedCount === 0) {
            throw new Error('Failed to update tag ID');
        }

        return { status: 200, message: 'Tag ID successfully updated' };
    } catch (error) {
        console.error(`Error updating tag ID: ${error}`);
        // If you have a logger, you can log the error here
        if (logger) {
            logger.error(`Error updating tag ID: ${error}`);
        }
        return { status: 500, message: 'Internal Server Error' };
    }
}

// DeactivateTagID
async function DeactivateTagID(req) {
    try {
        const { id, status } = req.body;

        // Validate required fields
        if (!id || typeof status !== 'boolean') {
            return { status: 400, message: 'ID and status are required' };
        }

        const db = await database.connectToDatabase();
        const tagsCollection = db.collection("tag_id");

        // Check if the tag ID exists
        const tag = await tagsCollection.findOne({ id: id });
        if (!tag) {
            return { status: 404, message: 'Tag ID not found' };
        }

        // Update the status of the tag ID
        const result = await tagsCollection.updateOne(
            { id: id },
            { $set: { status: status } }
        );

        if (result.modifiedCount === 0) {
            throw new Error('Failed to update tag ID status');
        }

        // Retrieve the updated tag document
        const updatedTag = await tagsCollection.findOne({ id: id });

        return {
            status: 200,
            message: 'Tag ID status successfully updated',
            data: updatedTag
        };
    } catch (error) {
        console.error(`Error updating tag ID status: ${error}`);
        // If you have a logger, you can log the error here
        if (logger) {
            logger.error(`Error updating tag ID status: ${error}`);
        }
        return { status: 500, message: 'Internal Server Error' };
    }
}

// 6.Assign User
// FetchUsersWithSpecificRolesToUnAssign
async function FetchUsersWithSpecificRolesToUnAssign(association_id) {
    if (!association_id) {
        throw new Error("Association ID is required");
    }

    const db = await database.connectToDatabase();
    const usersCollection = db.collection("users");

    const users = await usersCollection.aggregate([
        {
            $match: {
                role_id: { $nin: [1, 2, 3, 4] },
                assigned_association: association_id
            }
        },
        {
            $lookup: {
                from: "user_roles",
                localField: "role_id",
                foreignField: "role_id",
                as: "roleDetails"
            }
        },
        { $unwind: "$roleDetails" },
        {
            $addFields: {
                role_name: "$roleDetails.role_name"
            }
        },
        {
            $lookup: {
                from: "tag_id",
                let: { userTagId: "$tag_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$id", "$$userTagId"] }
                        }
                    }
                ],
                as: "tagDetails"
            }
        },
        {
            $unwind: {
                path: "$tagDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                tag_id: { $ifNull: ["$tagDetails.tag_id", null] }
            }
        }
    ]).toArray();

    return users;
}

// AddUserToAssociation
async function AddUserToAssociation(req, res) {
    try {
        const { association_id, email_id, phone_no, modified_by } = req.body;

        if (!association_id || !email_id || !modified_by) {
            return res.status(400).json({ status: 'Failed', message: 'Association ID, Email ID, and Modified By are required' });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({
            $and: [
                { email_id: email_id },
                { role_id: 5 },
                { status: true }
            ]
        });

        if (!existingUser) {
            return res.status(404).json({ status: 'Failed', message: 'User not found' });
        }

        if (existingUser.assigned_association !== null) {
            return res.status(400).json({ status: 'Failed', message: 'User is already assigned' });
        }

        const result = await usersCollection.updateOne(
            { user_id: existingUser.user_id },
            {
                $set: {
                    assigned_association: parseInt(association_id),
                    modified_date: new Date(),
                    modified_by: modified_by
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ status: 'Failed', message: 'Failed to assign user to association' });
        }

        return res.status(200).json({ status: 'Success', message: 'User successfully assigned to association' });

    } catch (error) {
        console.error('Error in AddUserToAssociation:', error);
        return res.status(500).json({ status: 'Failed', message: error.message || 'Internal server error' });
    }
}

// Function to Assign Tag ID to User
async function AssignTagIdToUser(data) {
    const { user_id, tag_id, modified_by } = data;

    if (!user_id || !tag_id || !modified_by) {
        throw new Error('All fields are required');
    }

    const db = await database.connectToDatabase();
    const usersCollection = db.collection("users");
    const tagIdCollection = db.collection("tag_id");

    const existingUser = await usersCollection.findOne({ user_id: user_id, status: true });
    if (!existingUser) {
        throw new Error('User with this details does not exist/Deactivated');
    }

    const existingTagId = await tagIdCollection.findOne({ tag_id: tag_id, status: true });
    if (!existingTagId) {
        throw new Error('Tag ID does not exist or is not active');
    }

    // Unassign old tag from user, if any
    if (existingUser.tag_id) {
        await tagIdCollection.updateOne(
            { id: existingUser.tag_id },
            { $set: { tag_id_assigned: false } }
        );
    }

    const userUpdateResult = await usersCollection.updateOne(
        { user_id: user_id },
        {
            $set: {
                tag_id: parseInt(existingTagId.id),
                modified_date: new Date(),
                modified_by
            }
        }
    );

    const tagUpdateResult = await tagIdCollection.updateOne(
        { tag_id: tag_id },
        { $set: { tag_id_assigned: true } }
    );

    if (userUpdateResult.modifiedCount === 0 || tagUpdateResult.modifiedCount === 0) {
        throw new Error('Failed to assign tag ID to user');
    }

    return { message: 'Tag ID assigned successfully to user' };
}

//FetchTagIdToAssign
async function FetchTagIdToAssign(data) {
    const { association_id, user_id } = data;

    const db = await database.connectToDatabase();
    const tagsCollection = db.collection("tag_id");

    const tags = await tagsCollection.find({
        association_id: association_id,
        tag_id_assigned: false,
        status: true
    }).toArray();

    if (!tags || tags.length === 0) {
        return { status: 404, message: "No tags found" };
    }

    return tags;
}

// RemoveUserFromAssociation
async function RemoveUserFromAssociation(req) {
    try {
        const { user_id, association_id, modified_by } = req.body;

        if (!user_id || !association_id || !modified_by) {
            return { status: 400, message: 'User ID, association_id and Modified By are required' };
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const tagCollection = db.collection("tag_id");

        const user = await usersCollection.findOne({ user_id: user_id, assigned_association: association_id });

        if (!user) return { status: 404, message: 'User does not exist' };

        if (user.tag_id !== null) {
            const tagResult = await tagCollection.updateOne(
                { id: user.tag_id },
                { $set: { tag_id_assigned: false } }
            );
            if (tagResult.modifiedCount === 0) {
                return { status: 500, message: 'Failed to remove tag id assigned' };
            }
        }

        const result = await usersCollection.updateOne(
            { user_id: user_id },
            {
                $set: {
                    assigned_association: null,
                    tag_id: null,
                    modified_date: new Date(),
                    modified_by
                }
            }
        );

        if (result.modifiedCount === 0) {
            return { status: 500, message: 'Failed to remove user from association' };
        }

        return { status: 200, message: 'User successfully removed from association' };

    } catch (error) {
        console.error(`Error removing user from association: ${error}`);
        logger.error(`Error removing user from association: ${error}`);
        return { status: 500, message: 'Internal Server Error' };
    }
}


// 7.Manage Finance
// Function to Create Finance Entry
async function createFinance({ eb_charge, margin, gst, parking_fee, convenience_fee, station_fee, processing_fee, service_fee, association_id, created_by }) {
    try {
        const db = await database.connectToDatabase();
        const financeCollection = db.collection('financeDetails');

        // Auto-increment finance_id
        const financeCount = await financeCollection.countDocuments();
        const finance_id = financeCount + 1;

        // Create finance object
        const newFinance = {
            finance_id,
            eb_charge: eb_charge.toString(),
            margin: margin.toString(),
            gst: gst.toString(),
            parking_fee: parking_fee.toString(),
            convenience_fee: convenience_fee.toString(), // Keep original spelling
            station_fee: station_fee.toString(),
            processing_fee: processing_fee.toString(),
            service_fee: service_fee.toString(),
            association_id: parseInt(association_id),
            created_by,
            modified_by: null,
            status: true,
            created_date: new Date().toISOString(),
            modified_date: null,
        };

        // Insert into MongoDB
        const result = await financeCollection.insertOne(newFinance);

        // Check if the insertion was successful
        if (result.acknowledged) {
            return { status: 'Success', message: 'Finance details saved successfully', data: newFinance };
        } else {
            return { status: 'Failed', message: 'Failed to save finance details' };
        }

    } catch (error) {
        console.error('Error in createFinance:', error);
        return { status: 'Failed', message: 'Error saving finance details' };
    }
}

// Function to Fetch Finance by Association ID// Function to Fetch Finance by Association ID
async function fetchFinance(association_id) {
    try {
        const db = await database.connectToDatabase();
        const financeCollection = db.collection('financeDetails');

        // Fetch finance records based on association_id
        const financeData = await financeCollection.find({ association_id }).toArray();

        // If no records are found, return an error message
        if (financeData.length === 0) {
            return { status: 'Failed', message: 'No finance records found for this association_id' };
        }

        // Process each finance record to calculate total price
        const processedFinanceData = financeData.map(financeRecord => {
            const EB_fee = parseFloat(financeRecord.eb_charge) || 0;

            // List of additional charges (excluding GST)
            const additionalCharges = [
                parseFloat(financeRecord.margin) || 0,
                parseFloat(financeRecord.parking_fee) || 0,
                parseFloat(financeRecord.convenience_fee) || 0,
                parseFloat(financeRecord.station_fee) || 0,
                parseFloat(financeRecord.processing_fee) || 0,
                parseFloat(financeRecord.service_fee) || 0
            ];

            // Calculate total additional charges (sum of all charges except GST)
            const totalAdditionalCharges = additionalCharges.reduce((sum, charge) => sum + charge, 0);

            // Calculate the base price (including additional charges per unit)
            const TotalEBPrice = EB_fee + totalAdditionalCharges;

            // Apply GST on the total amount
            const gstPercentage = parseFloat(financeRecord.gst) || 0;
            const gstAmount = (TotalEBPrice * gstPercentage) / 100;

            // Final price after adding GST
            const totalprice = (TotalEBPrice + gstAmount).toFixed(3);

            return { ...financeRecord, totalprice };
        });

        return { status: 'Success', data: processedFinanceData, length: financeData.length };
    } catch (error) {
        console.error('Error in fetchFinance:', error);
        return { status: 'Failed', message: 'Error fetching finance data' };
    }
}

// Function to Update Finance Entry (Validate _id & association_id)
async function updateFinance({
    _id, finance_id, eb_charge, margin, gst, parking_fee, convenience_fee,
    station_fee, processing_fee, service_fee, association_id, status, modified_by
}) {
    try {
        const db = await database.connectToDatabase();
        const financeCollection = db.collection('financeDetails');

        // Validate _id format
        if (!ObjectId.isValid(_id)) {
            return { status: 'Failed', message: 'Invalid _id format' };
        }

        // Ensure finance_id is an integer
        finance_id = parseInt(finance_id);

        // Check if _id exists and matches the given finance_id
        const existingFinance = await financeCollection.findOne({ _id: new ObjectId(_id) });

        if (!existingFinance) {
            return { status: 'Failed', message: 'No record found for the given _id' };
        }

        if (parseInt(existingFinance.finance_id) !== finance_id) {
            return { status: 'Failed', message: 'finance_id does not match the record associated with _id' };
        }

        // Convert fields to correct types, using `??` to handle undefined values
        const updatedData = {
            eb_charge: (eb_charge ?? "").toString(),
            margin: (margin ?? "").toString(),
            gst: (gst ?? "").toString(),
            parking_fee: (parking_fee ?? "").toString(),
            convenience_fee: (convenience_fee ?? "").toString(), // Ensure it's handled
            station_fee: (station_fee ?? "").toString(),
            processing_fee: (processing_fee ?? "").toString(),
            service_fee: (service_fee ?? "").toString(),
            association_id: parseInt(association_id),
            status: status === "true" || status === true, // Convert to Boolean
            modified_by,
            modified_date: new Date().toISOString()
        };

        // Perform the update
        const updateResult = await financeCollection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: updatedData }
        );

        return updateResult.modifiedCount > 0
            ? { status: 'Success', message: 'Finance details updated successfully' }
            : { status: 'Success', message: 'No changes detected, but update request was successful' };

    } catch (error) {
        console.error('Error in updateFinance:', error);
        return { status: 'Failed', message: 'Error updating finance details' };
    }
}

// 8.Withdraw
// FetchCommissionAmtAssociation
async function FetchCommissionAmtAssociation(req) {
    const { user_id } = req.body;
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const associationsCollection = db.collection("association_details");

        // Fetch the user with the specified user_id
        const user = await usersCollection.findOne({ user_id: user_id });

        if (!user) {
            return { status: 404, message: 'User not found' };
        }

        // Extract association_id from the user object
        const associationId = user.association_id;

        if (!associationId) {
            return { status: 404, message: 'Association ID not found for this user' };
        }

        // Fetch the association with the specified association_id
        const association = await associationsCollection.findOne({ association_id: associationId });

        if (!association) {
            return { status: 404, message: 'Association not found' };
        }

        // Extract association_wallet from association object
        const associationWallet = association.association_wallet;

        return { status: 200, data: associationWallet }; // Return status and data

    } catch (error) {
        console.error(`Error fetching association wallet balance: ${error}`);
        logger.error(`Error fetching association wallet balance: ${error}`);
        return { status: 500, message: 'Internal Server Error' }; // Return status and message
    }
}

// Controller to save user bank details
async function saveUserBankDetails(req) {
    try {
        const { accountHolderName, bankName, accountNumber, ifscNumber, created_by, user_id } = req.body;

        // Validate input
        if (!accountHolderName || !bankName || !accountNumber || !ifscNumber || !created_by || !user_id) {
            return { status: 400, message: 'All bank details are required' };
        }

        const db = await database.connectToDatabase();
        const BankDetails = db.collection("bank_details");

        // Optional: Check if account number already exists
        // const existingAccountNumber = await BankDetails.findOne({ accountNumber });
        // if (existingAccountNumber) {
        //     return { status: 400, message: 'Bank details for this account number already exist' };
        // }

        // Check if bank details already exist for the user
        const existingUserBankDetails = await BankDetails.findOne({ user_id });
        if (existingUserBankDetails) {
            return { status: 400, message: 'User already has bank details registered' };
        }

        // Insert bank details
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

        return { status: 201, message: 'Bank details saved successfully' };

    } catch (error) {
        console.error('Error saving bank details:', error);
        logger.error(error); // Assumes a logger utility is available
        return { status: 500, message: 'Internal Server Error' };
    }
}

// Controller to fetch user bank details
async function fetchUserBankDetails(req) {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return { status: 400, message: 'User ID is required' };
        }

        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const BankDetails = db.collection("bank_details");

        // Check if user exists
        const user = await Users.findOne({ user_id });
        if (!user) {
            return { status: 404, message: 'No user found' };
        }

        // Fetch bank details for the user
        const bankDetails = await BankDetails.findOne({ user_id });
        if (!bankDetails) {
            return { status: 404, message: 'No bank details found for this user' };
        }

        return { status: 200, message: 'Success', data: bankDetails };

    } catch (error) {
        console.error('Error fetching bank details:', error);
        logger.error(error); // Assumes a logger utility is available
        return { status: 500, message: 'Internal Server Error' };
    }
}

// Controller: updateUserBankDetails
async function updateUserBankDetails(req) {
    try {
        const { _id, user_id, accountHolderName, bankName, accountNumber, ifscNumber, modified_by } = req.body;

        if (!_id || !user_id || !accountNumber) {
            return { status: 400, message: 'User ID, Account Number, and Bank ID are required' };
        }

        const objectId = new ObjectId(_id);
        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const BankDetails = db.collection("bank_details");

        const existingUser = await Users.findOne({ user_id });
        if (!existingUser) {
            return { status: 404, message: 'User not found' };
        }

        const existingBankDetails = await BankDetails.findOne({ _id: objectId });
        if (!existingBankDetails) {
            return { status: 404, message: 'Bank details not found' };
        }

        const updateFields = {
            ...(accountHolderName && { accountHolderName }),
            ...(bankName && { bankName }),
            ...(accountNumber && { accountNumber }),
            ...(ifscNumber && { ifscNumber }),
            modified_by,
            modified_date: new Date()
        };

        const result = await BankDetails.updateOne(
            { _id: objectId },
            { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
            return { status: 400, message: 'No changes made to bank details' };
        }

        return { status: 200, message: 'Bank details updated successfully' };
    } catch (error) {
        console.error('Error updating bank details:', error);
        logger.error(error); // Assumes a logger utility is available
        return { status: 500, message: 'Internal Server Error' };
    }
}

// Function to ApplyWithdrawal
async function ApplyWithdrawal(user_id, withdrawalAmount, accountHolderName, accountNumber, bankName, withdrawal_req_by, ifscNumber) {
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const associationCollection = db.collection("association_details");
        const bankDetailsCollection = db.collection("bank_details");
        const withdrawalCollection = db.collection("withdrawal_details");

        // Check if user exists
        const user = await usersCollection.findOne({ user_id });
        if (!user) return { status: 'Failed', message: 'User not found' };

        // Check if association exists
        const association = await associationCollection.findOne({ association_id: user.association_id });
        if (!association) return { status: 'Failed', message: 'Association not found' };

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
            association_id: user.association_id,
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
        const associationCollection = db.collection("association_details");
        const withdrawalCollection = db.collection("withdrawal_details");

        // Fetch user details
        const user = await usersCollection.findOne({ user_id });
        if (!user) return { status: 'Failed', message: 'User not found' };

        // If user has a association_id, fetch association details
        let associationData = null;
        if (user.association_id) {
            associationData = await associationCollection.findOne({ association_id: user.association_id });
        }

        // Fetch all withdrawal details related to user_id
        const withdrawalDetails = await withdrawalCollection.find({ user_id }).toArray();

        // Return all the fetched data
        return {
            status: 'Success',
            user,
            associationData,
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

// 9.Manage Report
//FetchReportDevice
async function FetchReportDevice(req) {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            return { success: false, message: "Association ID is required." };
        }

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        const chargers = await devicesCollection.find({ assigned_association_id: association_id }).toArray();

        if (chargers.length === 0) {
            return { success: false, message: "No chargers found for this Association ID." };
        }

        return chargers;

    } catch (error) {
        console.error(`Error fetching chargers: ${error}`);
        return { success: false, message: "Failed to fetch chargers." };
    }
}

// Device report validation
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
            console.log('Missing required parameters in request');
            return { status: 400, message: 'from_date, to_date, and device_id are required!' };
        }

        const db = await database.connectToDatabase();
        const Collection = db.collection('device_session_details');

        const validateDate = validateAndConvertDates(from_date, to_date);
        if (validateDate.status !== 200) {
            return { status: validateDate.status, message: validateDate.message };
        }

        const sessions = await Collection.find({
            charger_id: device_id,
            stop_time: {
                $gte: validateDate.fromDate.toISOString(),
                $lte: validateDate.toDate.toISOString()
            }
        }).sort({ stop_time: -1 }).toArray();

        if (!sessions || sessions.length === 0) {
            return { status: 404, message: 'No device report found for the given period and device ID!' };
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

        console.log('Device Report data fetched successfully');
        return { status: 200, data: responseData };

    } catch (error) {
        console.error('Error fetching device revenue report data:', error);
        return { status: 500, message: 'Internal Server Error' };
    }
}

// Route to fetch specific charger revenue list
async function FetchSpecificChargerRevenue(association_id) {
    try {
        const db = await database.connectToDatabase();
        if (!db) {
            return { status: "Error", message: "Database connection failed" };
        }

        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");

        // Convert association_id to Integer (to match MongoDB data type)
        const associationId = parseInt(association_id);

        // Fetch chargers assigned to this association
        const chargers = await chargerCollection.find({ assigned_association_id: associationId }).toArray();
        console.log("Chargers found:", chargers);

        if (!chargers.length) {
            return { status: "Success", message: "No chargers found for this client", revenueData: [], TotalChargerRevenue: "0.000" };
        }

        let TotalChargerRevenue = 0; // Initialize total revenue

        const revenueData = await Promise.all(chargers.map(async (charger) => {

            // Fetch session revenue details
            const sessions = await sessionCollection.find({
                charger_id: charger.charger_id,
                start_time: { $ne: null },
                stop_time: { $ne: null }
            }).toArray();

            // Calculate revenue for this charger
            const Revenue = sessions.reduce((sum, session) => {
                return sum + parseFloat(session.association_commission || 0);
            }, 0);

            // Add this charger's revenue to total revenue
            TotalChargerRevenue += Revenue;

            return {
                charger_id: charger.charger_id,
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
async function FetchChargerListWithAllCostWithRevenue(association_id) {
    try {
        const db = await database.connectToDatabase();
        if (!db) {
            return { status: "Error", message: "Database connection failed" };
        }

        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");

        // Convert association_id to Integer (to match MongoDB data type)
        const associationId = parseInt(association_id);

        // Fetch chargers assigned to this association
        const chargers = await chargerCollection.find({ assigned_association_id: associationId }).toArray();
        console.log("Chargers found:", chargers);

        if (!chargers.length) {
            return { status: "Success", message: "No chargers found for this client", revenueData: [], TotalChargerRevenue: "0.000" };
        }

        const revenueData = await Promise.all(chargers.map(async (charger) => {

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
                    customerName: session.user,
                    start_time: session.start_time,
                    stop_time: session.stop_time,
                    duration: calculateDuration(session.start_time, session.stop_time),
                    location: session.location,
                    energyConsumed: session.unit_consummed,
                    price: session.price,
                    Revenue: parseFloat(session.association_commission || 0).toFixed(3),
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

// Function to calculate duration from start_time to stop_time
function calculateDuration(start, stop) {
    if (!start || !stop) return "Invalid Time";

    const startTime = new Date(start);
    const stopTime = new Date(stop);

    if (isNaN(startTime) || isNaN(stopTime) || stopTime < startTime) {
        return "Invalid Time";
    }

    const durationMs = stopTime - startTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    return hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : `${minutes}m ${seconds}s`;
}

// 10.Profile
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
                    from: 'association_details',
                    localField: 'association_id',
                    foreignField: 'association_id',
                    as: 'association_details'
                }
            },
            {
                $project: {
                    _id: 0,
                    user_id: 1,
                    username: 1,
                    email_id: 1,
                    phone_no: 1,
                    wallet_bal: 1,
                    password: 1,
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
                    association_details: 1
                }
            }
        ]).toArray();

        if (result.length === 0) {
            return { status: 404, message: 'User not found' };
        }

        const userProfile = result[0];

        return { status: 200, data: userProfile };

    } catch (error) {
        logger.error(`Error fetching user: ${error}`);
        return { status: 500, message: 'Internal Server Error' };
    }
}

// Controller: UpdateUserProfile
async function UpdateUserProfile(req) {
    const { user_id, username, phone_no, password } = req.body;

    // Validate the input
    if (!user_id || !username || !phone_no || !password) {
        throw new Error('User ID, Username, Phone Number, and Password are required');
    }

    const db = await database.connectToDatabase();
    const usersCollection = db.collection("users");

    // Check if the user exists
    const existingUser = await usersCollection.findOne({ user_id: user_id });
    if (!existingUser) {
        throw new Error('User not found');
    }

    // Update the user profile
    const updateResult = await usersCollection.updateOne(
        { user_id: user_id },
        {
            $set: {
                username,
                phone_no,
                password,
                modified_by: username,
                modified_date: new Date(),
            }
        }
    );

    if (updateResult.matchedCount === 0) {
        throw new Error('Failed to update user profile');
    }
}

// Controller: UpdateAssociationProfile
async function UpdateAssociationProfile(req) {
    const { association_id, modified_by, association_phone_no, association_address } = req.body;

    // Validate required fields
    if (!association_id || !modified_by || !association_phone_no || !association_address) {
        throw new Error('Association ID, Modified By, Phone Number, and Association Address are required');
    }

    const db = await database.connectToDatabase();
    const clientCollection = db.collection("association_details");

    // Update the association profile
    const updateResult = await clientCollection.updateOne(
        { association_id },
        {
            $set: {
                association_phone_no,
                association_address,
                modified_date: new Date(),
                modified_by
            }
        }
    );

    if (updateResult.matchedCount === 0) {
        throw new Error('Association not found');
    }

    if (updateResult.modifiedCount === 0) {
        throw new Error('No changes made to association profile');
    }
}

module.exports = {
    authenticate, FetchTotalCharger, FetchOnlineCharger, FetchOfflineCharger, FetchFaultsCharger, FetchChargerTotalEnergy, FetchTotalChargersSession, FetchTotalUsers,
    FetchAllocatedChargerByClientToAssociation, UpdateDevice, DeActivateOrActivateCharger, assignFinance, reAssignFinance, FetchFinance_dropdown,
    FetchUser, UpdateUser, FetchAllTagIDs, CreateTagID, UpdateTagID, DeactivateTagID,
    FetchUsersWithSpecificRolesToUnAssign, AddUserToAssociation, AssignTagIdToUser, FetchTagIdToAssign, RemoveUserFromAssociation, createFinance, fetchFinance, updateFinance,
    FetchReportDevice, downloadDeviceReport, FetchSpecificChargerRevenue, FetchChargerListWithAllCostWithRevenue,
    FetchCommissionAmtAssociation, saveUserBankDetails, fetchUserBankDetails, updateUserBankDetails, ApplyWithdrawal, FetchPaymentRequest, FetchPaymentNotification, MarkNotificationRead,
    FetchUserProfile, UpdateUserProfile, UpdateAssociationProfile,
};