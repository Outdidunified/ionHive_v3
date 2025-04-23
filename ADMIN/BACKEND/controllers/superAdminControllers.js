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

        const user = await usersCollection.findOne({ email_id: email, status: true });

        if (!user || user.password !== password || user.role_id !== 1) {
            return { error: true, status: 401, message: 'Invalid credentials' };
        }

        // Generate JWT token
        const token = jwt.sign({ username: user.username }, JWT_SECRET);

        return {
            error: false,
            user: {
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

// 2.Dashboard Controller
// Function to fetch total counts of resellers, clients, associations, and app users
async function FetchTotalUsers() {
    try {
        const db = await database.connectToDatabase();

        // Collections
        const resellersCollection = db.collection("reseller_details");
        const clientsCollection = db.collection("client_details");
        const associationsCollection = db.collection("association_details");
        const usersCollection = db.collection("users");

        // Count Resellers from reseller_details
        const resellersCount = await resellersCollection.countDocuments();

        // Count Clients from client_details
        const clientsCount = await clientsCollection.countDocuments();

        // Count Associations from association_details
        const associationsCount = await associationsCollection.countDocuments();

        // Count App Users (role_id = 5) from users table
        const appUsersCount = await usersCollection.countDocuments({ role_id: 5 });

        return {
            resellersCount: resellersCount || 0,
            clientsCount: clientsCount || 0,
            associationsCount: associationsCount || 0,
            appUsersCount: appUsersCount || 0
        };
    } catch (error) {
        console.error(`Error fetching user counts: ${error}`);
        throw new Error('Error fetching user counts');
    }
}

// fetch total charger
async function FetchTotalCharger() {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");

        // Query to find chargers with a valid assigned_reseller_id (not null or empty)
        const recentChargers = await chargerCollection.find({
            assigned_reseller_id: { $nin: [null, ""] } // Exclude null or empty values
        }).toArray();

        // Get total count of matching chargers
        const totalCount = recentChargers.length;

        return { totalCount, recentChargers };
    } catch (error) {
        logger.error(`Error fetching charger details: ${error}`);
        throw new Error('Error fetching charger details');
    }
}

// fetch FetchOnlineCharger
async function FetchOnlineCharger() {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_status");

        // Get the current time in UTC
        const currentTime = new Date();

        // Calculate 1 hour ago from the current time
        const oneHourAgo = new Date(currentTime.getTime() - (1 * 60 * 60 * 1000));

        // console.log(`Current Time: ${currentTime}`);
        // console.log(`Checking chargers modified after: ${oneHourAgo}`);

        // Query to find chargers modified within the last hour (Online Chargers)
        const onlineChargers = await chargerCollection.find({
            timestamp: { $gte: oneHourAgo },
            error_code: "NoError"
        }).toArray();

        // Get total count of online chargers
        const totalCount = onlineChargers.length;

        // If no online chargers are found, return a message
        if (totalCount === 0) {
            return { totalCount, onlineChargers: [], message: "No online chargers found" };
        }

        return { totalCount, onlineChargers };
    } catch (error) {
        logger.error(`Error fetching online charger details: ${error}`);
        throw new Error('Error fetching online charger details');
    }
}

// fetch FetchOfflineCharger
async function FetchOfflineCharger() {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_status");

        // Get current time
        const currentTime = new Date();
        // Calculate time 1 hour ago
        const oneHourAgo = new Date(currentTime.getTime() - (1 * 60 * 60 * 1000));

        // Query to find offline chargers (not modified in the last 1 hour)
        const offlineChargers = await chargerCollection.find({
            timestamp: { $lt: oneHourAgo }, // Chargers modified before one hour ago
            // error_code: "NoError"       // error_code is NOT "NoError"
        }).toArray();

        // Get total count of offline chargers
        const totalCount = offlineChargers.length;

        // If no offline chargers are found, return a message
        if (totalCount === 0) {
            return { totalCount, offlineChargers: [], message: "No offline chargers found" };
        }

        return { totalCount, offlineChargers };
    } catch (error) {
        logger.error(`Error fetching offline charger details: ${error}`);
        throw new Error('Error fetching offline charger details');
    }
}

// Fetch Faulty Chargers Function
async function FetchFaultsCharger() {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_status");

        // Get current time
        const currentTime = new Date();
        // Calculate time 1 hour ago
        const oneHourAgo = new Date(currentTime.getTime() - (1 * 60 * 60 * 1000));

        // Query to find chargers that are faulty (error_code is NOT "NoError")
        const faultyChargers = await chargerCollection.find({
            timestamp: { $gte: oneHourAgo },  // Modified within the last 1 hour
            error_code: { $ne: "NoError" }       // error_code is NOT "NoError"
        }).toArray();

        // Get total count of faulty chargers
        const totalCount = faultyChargers.length;

        // If no Fault chargers are found, return a message
        if (totalCount === 0) {
            return { totalCount, faultyChargers: [], message: "No Fault chargers found" };
        }

        return { totalCount, faultyChargers };
    } catch (error) {
        logger.error(`Error fetching faulty charger details: ${error}`);
        throw new Error('Error fetching faulty charger details');
    }
}

// Fetch Charger Total Energy Function
async function FetchChargerTotalEnergy() {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("device_session_details");

        // Ensure we process valid documents
        const matchStage = {
            $match: {
                start_time: { $ne: null },
                stop_time: { $ne: null },
                unit_consummed: { $ne: null }
            }
        };

        // Convert start_time to Date
        const addFieldsStage = {
            $addFields: {
                start_time: { $toDate: "$start_time" },
            }
        };

        // Aggregate to sum all unit_consummed values
        const resultDayToDay = await chargerCollection.aggregate([
            {
                $addFields: {
                    start_time: { $toDate: "$start_time" } // Convert start_time string to Date
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%d/%m/%Y", date: "$start_time" } }, // Format date as DD/MM/YYYY
                    day2daytotalEnergyConsumed: { $sum: { $toDouble: "$unit_consummed" } } // Convert unit_consummed to number and sum
                }
            },
            {
                $sort: { "_id": -1 } // Sort by date (latest first)
            }
        ]).toArray();

        // Convert result to expected format
        const daytodaytotalEnergyConsumed = resultDayToDay
            .filter(entry => entry._id !== null) // Remove entries where date is null
            .map(entry => ({
                date: entry._id,
                totalEnergyConsumed: entry.day2daytotalEnergyConsumed
            }));

        // Weekly Aggregation
        const weeklyAggregation = [
            matchStage,
            addFieldsStage,
            {
                $group: {
                    _id: {
                        year: { $year: "$start_time" },
                        week: { $isoWeek: "$start_time" }
                    },
                    totalEnergyConsumed: { $sum: { $toDouble: "$unit_consummed" } }
                }
            },
            { $sort: { "_id.year": -1, "_id.week": -1 } }
        ];

        // Monthly Aggregation
        const monthlyAggregation = [
            matchStage,
            addFieldsStage,
            {
                $group: {
                    _id: {
                        year: { $year: "$start_time" },
                        month: { $month: "$start_time" }
                    },
                    totalEnergyConsumed: { $sum: { $toDouble: "$unit_consummed" } }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ];

        // Yearly Aggregation
        const yearlyAggregation = [
            matchStage,
            addFieldsStage,
            {
                $group: {
                    _id: { year: { $year: "$start_time" } },
                    totalEnergyConsumed: { $sum: { $toDouble: "$unit_consummed" } }
                }
            },
            { $sort: { "_id.year": -1 } }
        ];

        // Execute Aggregations correctly
        const [weeklyResult, monthlyResult, yearlyResult] = await Promise.all([
            chargerCollection.aggregate(weeklyAggregation).toArray(),
            chargerCollection.aggregate(monthlyAggregation).toArray(),
            chargerCollection.aggregate(yearlyAggregation).toArray(),
        ]);

        const weeklyTotalEnergyConsumed = weeklyResult.map(entry => ({
            week: `Week ${entry._id.week} of ${entry._id.year}`,
            totalEnergyConsumed: entry.totalEnergyConsumed || 0
        }));

        const monthlyTotalEnergyConsumed = monthlyResult.map(entry => ({
            month: `${entry._id.year}-${String(entry._id.month).padStart(2, "0")}`, // Ensure proper formatting
            totalEnergyConsumed: entry.totalEnergyConsumed || 0
        }));

        const yearlyTotalEnergyConsumed = yearlyResult.map(entry => ({
            year: entry._id.year,
            totalEnergyConsumed: entry.totalEnergyConsumed || 0
        }));

        // Aggregate to sum all unit_consummed values
        const result = await chargerCollection.aggregate([
            {
                $group: {
                    _id: null,
                    totalEnergyConsumed: { $sum: { $toDouble: "$unit_consummed" } }
                }
            }
        ]).toArray();

        // Extract total energy consumed
        const totalEnergyConsumed = result.length > 0 ? result[0].totalEnergyConsumed : 0;
        // Constants
        const EV_EFFICIENCY = 6.5; // km per kWh
        const EV_CO2_PER_KWH = 0.02; // kg CO2 per kWh
        const ICE_CO2_PER_KM = 0.35; // kg CO2 per km

        //  Calculate Distance Driven by EV
        const distanceDrivenByEV = totalEnergyConsumed / EV_EFFICIENCY;

        //  Calculate CO2 Emissions from ICE Vehicle
        const CO2_from_ICE = distanceDrivenByEV * ICE_CO2_PER_KM;

        // Calculate CO2 Emissions from EV
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

// Fetch total charger charging sessions
async function FetchTotalChargersSession() {
    try {
        const db = await database.connectToDatabase();
        const sessionCollection = db.collection("device_session_details");

        // Get total count of sessions based on `_id`
        const totalCount = await sessionCollection.countDocuments();

        return { totalCount };
    } catch (error) {
        console.error(`Error fetching charger session count: ${error}`);
        throw new Error('Error fetching charger session count');
    }
}

// 3.Manage Device Controller
// Function to Fetch allocated chargers
async function FetchAllocatedChargers() {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");
        const resellerCollection = db.collection("reseller_details");
        const clientCollection = db.collection("client_details");
        const associationCollection = db.collection("association_details");
        const configCollection = db.collection("socket_gun_config");

        const chargers = await chargerCollection.find().toArray();

        const resellerIds = new Set();
        const clientIds = new Set();
        const associationIds = new Set();
        const chargerIds = [];

        for (const charger of chargers) {
            if (charger.assigned_reseller_id) resellerIds.add(charger.assigned_reseller_id);
            if (charger.assigned_client_id) clientIds.add(charger.assigned_client_id);
            if (charger.assigned_association_id) associationIds.add(charger.assigned_association_id);
            if (charger.charger_id) chargerIds.push(charger.charger_id);
        }

        // Batch fetch related data
        const [resellers, clients, associations, configs] = await Promise.all([
            resellerCollection.find({ reseller_id: { $in: [...resellerIds] } }).toArray(),
            clientCollection.find({ client_id: { $in: [...clientIds] } }).toArray(),
            associationCollection.find({ association_id: { $in: [...associationIds] } }).toArray(),
            configCollection.find({ charger_id: { $in: chargerIds } }).toArray()
        ]);

        // Create lookup maps
        const resellerMap = new Map(resellers.map(r => [r.reseller_id, r.reseller_email_id]));
        const clientMap = new Map(clients.map(c => [c.client_id, c.client_email_id]));
        const associationMap = new Map(associations.map(a => [a.association_id, a.association_email_id]));
        const configMap = new Map(configs.map(c => [c.charger_id, c]));

        const allocatedChargers = [];

        for (const charger of chargers) {
            if (
                charger.assigned_reseller_id ||
                charger.assigned_client_id ||
                charger.assigned_association_id
            ) {
                const chargerInfo = { ...charger };

                // Get emails from maps
                chargerInfo.reseller_email_id = resellerMap.get(charger.assigned_reseller_id) || null;
                chargerInfo.client_email_id = clientMap.get(charger.assigned_client_id) || null;
                chargerInfo.association_email_id = associationMap.get(charger.assigned_association_id) || null;

                const config = configMap.get(charger.charger_id);
                const connectorDetails = [];

                if (config) {
                    let connectorIndex = 1;
                    while (config[`connector_${connectorIndex}_type`] !== undefined) {
                        const rawType = config[`connector_${connectorIndex}_type`];
                        const typeName = config[`connector_${connectorIndex}_type_name`];

                        let connectorTypeValue;
                        if (rawType === 1) connectorTypeValue = "Socket";
                        else if (rawType === 2) connectorTypeValue = "Gun";
                        else connectorTypeValue = rawType;

                        connectorDetails.push({
                            connector_type: connectorTypeValue,
                            connector_type_name: typeName
                        });

                        connectorIndex++;
                    }
                }

                chargerInfo.connector_details = connectorDetails.length > 0 ? connectorDetails : null;
                allocatedChargers.push(chargerInfo);
            }
        }

        return { status: 200, data: allocatedChargers };
    } catch (error) {
        console.error(`Error fetching allocated charger: ${error}`);
        return { status: 500, message: 'Error fetching allocated charger' };
    }
}

//FetchCharger(Which are un-allocated to reseller)
async function FetchCharger() {
    try {
        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");
        const configCollection = db.collection("socket_gun_config");

        // Fetch all chargers where assigned_reseller_id is null
        const chargers = await devicesCollection.find({ assigned_reseller_id: null }).toArray();

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

            // If there are no connector details, the charger will have an empty connector_details array
            results.push({
                ...charger,
                connector_details: connectorDetails.length > 0 ? connectorDetails : null
            });
        }

        return results;
    } catch (error) {
        console.error(`Error fetching chargers: ${error}`);
        throw new Error('Failed to fetch chargers with connector details');
    }
}

// insert / update socket configurations
const insertORupdateSocketGunConfig = async (chargerID, connectors) => {
    try {
        const connectorTypes = {};
        let socketCount = 0;
        let gunCount = 0;

        // Loop through the connectors array and assign the connector type and increment the counters
        connectors.forEach((connector) => {
            const { connector_id, connector_type, type_name } = connector;

            // Map incoming connector_type to database values (1 for Socket, 2 for Gun)
            if (connector_type === 'Socket') {
                connectorTypes[`connector_${connector_id}_type`] = 1;
                socketCount++;
            } else if (connector_type === 'Gun') {
                connectorTypes[`connector_${connector_id}_type`] = 2;
                gunCount++;
            }

            // Add the type_name as connector_X_type_name
            connectorTypes[`connector_${connector_id}_type_name`] = type_name;
        });

        const db = await database.connectToDatabase();
        const configCollection = db.collection('socket_gun_config');
        const existingConfig = await configCollection.findOne({ charger_id: chargerID });

        if (existingConfig) {
            // Prepare fields to update and unset
            let updateFields = {};
            let unsetFields = {};

            // Iterate through existing connector fields to find which ones to remove
            Object.keys(existingConfig).forEach((field) => {
                const match = field.match(/connector_(\d+)_type/);
                if (match) {
                    const connectorIndex = match[1];
                    const connectorExists = connectors.some(connector => connector.connector_id == connectorIndex);

                    if (!connectorExists) {
                        // Mark for deletion if the connector does not exist in the new input
                        unsetFields[`connector_${connectorIndex}_type`] = "";
                        unsetFields[`connector_${connectorIndex}_type_name`] = "";
                    }
                }
            });

            // Update fields that are in the new connectors array
            updateFields = {
                ...connectorTypes,
                modified_date: new Date(),
                socket_count: socketCount,
                gun_connector: gunCount
            };

            // Perform the update operation
            await configCollection.updateOne(
                { charger_id: chargerID },
                {
                    $set: updateFields,
                    $unset: unsetFields // This will remove unwanted fields
                }
            );

        } else {
            // If no existing config, insert a new one
            const socketGunConfig = {
                charger_id: chargerID,
                ...connectorTypes,
                created_date: new Date(),
                modified_date: null,
                socket_count: socketCount,
                gun_connector: gunCount
            };

            await configCollection.insertOne(socketGunConfig);
        }

        // Update or insert charger details in the `charger_details` collection as needed
        const chargerDetails = {
            charger_id: chargerID,
            created_date: new Date(),
        };

        const chargerDetailsCollection = db.collection('charger_details');
        const existingChargerDetails = await chargerDetailsCollection.findOne({ charger_id: chargerID });

        // Logic to unset unwanted fields in charger_details
        let unsetChargerFields = {};

        // Iterate through existing fields to find which ones to unset
        Object.keys(existingChargerDetails || {}).forEach((field) => {
            const match = field.match(/tag_id_for_connector_(\d+)/);
            if (match) {
                const connectorIndex = match[1];
                const connectorExists = connectors.some(connector => connector.connector_id == connectorIndex);

                if (!connectorExists) {
                    // Mark for deletion if the connector does not exist in the new input
                    unsetChargerFields[`tag_id_for_connector_${connectorIndex}`] = "";
                    unsetChargerFields[`tag_id_for_connector_${connectorIndex}_in_use`] = "";
                    unsetChargerFields[`transaction_id_for_connector_${connectorIndex}`] = "";
                    unsetChargerFields[`current_or_active_user_for_connector_${connectorIndex}`] = "";
                }
            }
        });

        // Initialize missing fields in existingChargerDetails
        const updateFields = {};
        const totalConnectors = connectors.length;

        for (let i = 1; i <= totalConnectors; i++) {
            if (!existingChargerDetails || !existingChargerDetails.hasOwnProperty(`tag_id_for_connector_${i}`) || existingChargerDetails[`tag_id_for_connector_${i}`] === null) {
                updateFields[`tag_id_for_connector_${i}`] = null;
            }

            if (!existingChargerDetails || !existingChargerDetails.hasOwnProperty(`tag_id_for_connector_${i}_in_use`) || existingChargerDetails[`tag_id_for_connector_${i}_in_use`] === null) {
                updateFields[`tag_id_for_connector_${i}_in_use`] = null;
            }

            if (!existingChargerDetails || !existingChargerDetails.hasOwnProperty(`transaction_id_for_connector_${i}`) || existingChargerDetails[`transaction_id_for_connector_${i}`] === null) {
                updateFields[`transaction_id_for_connector_${i}`] = null;
            }

            if (!existingChargerDetails || !existingChargerDetails.hasOwnProperty(`current_or_active_user_for_connector_${i}`) || existingChargerDetails[`current_or_active_user_for_connector_${i}`] === null) {
                updateFields[`current_or_active_user_for_connector_${i}`] = null;
            }
        }

        updateFields['socket_count'] = socketCount;
        updateFields['gun_connector'] = gunCount;

        if (existingChargerDetails) {
            if (Object.keys(updateFields).length > 0 || Object.keys(unsetChargerFields).length > 0) {
                await chargerDetailsCollection.updateOne(
                    { charger_id: chargerID },
                    {
                        $set: updateFields,
                        $unset: unsetChargerFields // This will remove unwanted fields
                    }
                );
            }
        } else {
            // If no existing charger details, insert new details
            for (let i = 1; i <= totalConnectors; i++) {
                chargerDetails[`tag_id_for_connector_${i}`] = null;
                chargerDetails[`tag_id_for_connector_${i}_in_use`] = null;
                chargerDetails[`transaction_id_for_connector_${i}`] = null;
                chargerDetails[`current_or_active_user_for_connector_${i}`] = null;
            }

            chargerDetails['socket_count'] = socketCount;
            chargerDetails['gun_connector'] = gunCount;

            await chargerDetailsCollection.insertOne(chargerDetails);
        }

        // Return true if the operation was successful
        return true;

    } catch (error) {
        console.error(`Error processing ChargerID: ${chargerID} - ${error.message}`);
        return false; // Return false in case of error
    }
};

//CreateCharger
async function CreateCharger(req, res) {
    try {
        const { charger_id, charger_model, charger_type, max_current, max_power, wifi_module, bluetooth_module, created_by, vendor, connectors } = req.body;

        // Validate the input
        if (!charger_id || !charger_model || !charger_type || !max_current ||
            !max_power || !created_by || !vendor || !wifi_module || !bluetooth_module || !connectors) {
            return res.status(400).json({ message: 'Charger ID, charger_model, charger_type, Max Current, Max Power, connectors, and Created By are required' });
        }

        // Convert wifi_module and bluetooth_module to boolean
        const wifiModuleBoolean = wifi_module && wifi_module.toLowerCase() === 'true';
        const bluetoothModuleBoolean = bluetooth_module && bluetooth_module.toLowerCase() === 'true';

        console.log("wifi_module:", wifi_module, "Converted:", wifiModuleBoolean);
        console.log("bluetooth_module:", bluetooth_module, "Converted:", bluetoothModuleBoolean);

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Check if charger with the same charger_id already exists
        const existingCharger = await devicesCollection.findOne({ charger_id });
        if (existingCharger) {
            return res.status(409).json({ message: `Charger with ID ${charger_id} already exists` });
        }

        // Insert the new device
        const insertResult = await devicesCollection.insertOne({
            charger_id,
            model: null,
            type: null,
            wifi_module: wifiModuleBoolean,
            bluetooth_module: bluetoothModuleBoolean,
            vendor,
            charger_model,
            charger_type,
            gun_connector: null,
            max_current,
            max_power,
            socket_count: null,
            ip: null,
            lat: null,
            long: null,
            short_description: null,
            charger_accessibility: 1,
            superadmin_commission: null,
            reseller_commission: null,
            client_commission: null,
            assigned_reseller_id: null,
            assigned_reseller_date: null,
            assigned_client_id: null,
            assigned_client_date: null,
            assigned_association_id: null,
            assigned_association_date: null,
            finance_id: null,
            wifi_username: null,
            wifi_password: null,
            created_by,
            created_date: new Date(),
            modified_by: null,
            modified_date: null,
            status: true
        });

        if (insertResult.acknowledged) {
            const insertSocketResult = await insertORupdateSocketGunConfig(charger_id, connectors);
            if (insertSocketResult) {
                return res.status(200).json({ status: 'Success', message: 'Charger created successfully' });
            } else {
                return res.status(200).json({ status: 'Success', message: 'Charger created successfully, but connectors details not inserted' });
            }
        } else {
            return res.status(400).json({ status: 'Failed', message: 'Charger creation failed' });
        }
    } catch (error) {
        console.error(error);
        logger.error(`Error creating device: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// updatecharger details
async function UpdateCharger(req, res) {
    try {
        const { _id, charger_id, charger_model, charger_type, vendor, max_current, max_power, wifi_module, bluetooth_module, modified_by, connectors } = req.body;

        // Validate the input - ensure charger_id and other required fields are provided
        if (!_id || !charger_id || !vendor || !max_current || !charger_model || !charger_type || !max_power || !wifi_module || !bluetooth_module || !modified_by) {
            return res.status(400).json({ message: ' id, Charger ID, charger_model, charger_type, Vendor, Max Current, Max Power, and Modified By are required' });
        }

        // Convert wifi_module and bluetooth_module to boolean safely
        const wifiModuleBoolean = wifi_module && wifi_module.toLowerCase() === 'true';
        const bluetoothModuleBoolean = bluetooth_module && bluetooth_module.toLowerCase() === 'true';

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Find the existing charger by _id
        const existingCharger = await devicesCollection.findOne({ _id: new ObjectId(_id) });

        if (!existingCharger) {
            return res.status(404).json({ message: 'Charger not found' });
        }

        // Check if the charger_id is being changed
        if (charger_id !== existingCharger.charger_id) {
            const chargerIdExists = await devicesCollection.findOne({
                charger_id,
                _id: { $ne: new ObjectId(_id) } // make sure the match is not the same document
            });

            if (chargerIdExists) {
                return res.status(409).json({ message: 'Charger ID already exists. Please use a unique Charger ID.' });
            }
        }

        // Proceed to update the charger
        const updateResult = await devicesCollection.updateOne(
            { _id: new ObjectId(_id) },
            {
                $set: {
                    charger_id,
                    charger_model,
                    charger_type,
                    wifi_module: wifiModuleBoolean,
                    bluetooth_module: bluetoothModuleBoolean,
                    vendor,
                    max_current,
                    max_power,
                    modified_by,
                    modified_date: new Date()
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(500).json({ message: 'Failed to update charger' });
        }

        // Update connectors/sockets
        const success = await insertORupdateSocketGunConfig(charger_id, connectors);

        if (success) {
            return res.status(200).json({ status: 'Success', message: 'Charger and connectors updated successfully' });
        } else {
            return res.status(500).json({ message: 'Failed to update charger connectors' });
        }

    } catch (error) {
        console.error('UpdateCharger error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

//FetchUnAllocatedChargerToAssgin
async function FetchUnAllocatedChargerToAssgin(req, res) {
    try {
        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Query to fetch chargers where assigned_reseller_id is null
        const chargers = await devicesCollection.find({ assigned_reseller_id: null, status: true }).toArray();

        return chargers; // Only return data, don't send response
    } catch (error) {
        console.error(`Error fetching chargers: ${error}`);
        throw new Error('Failed to fetch chargers'); // Throw error, handle in route
    }
}

//FetchResellersToAssgin
async function FetchResellersToAssgin(req, res) {
    try {
        const db = await database.connectToDatabase();
        const resellerCollection = db.collection("reseller_details");

        // Query to fetch all resellers
        const resellers = await resellerCollection.find({ status: true }).toArray();

        if (!resellers || resellers.length === 0) {
            return res.status(404).json({ message: 'No resellers found' });
        }

        // Return the reseller data
        return res.status(200).json({ status: 'Success', data: resellers });

    } catch (error) {
        console.error(error);
        logger.error(`Error fetching resellers: ${error}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// AssignChargerToReseller
async function AssignChargerToReseller(req, res) {
    try {
        const { reseller_id, charger_ids, modified_by } = req.body;

        // Validate required fields
        if (!reseller_id || !charger_ids || !modified_by) {
            return res.status(400).json({ message: 'Reseller ID, Charger IDs, and Modified By are required' });
        }

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Ensure charger_ids is an array
        let chargerIdsArray = Array.isArray(charger_ids) ? charger_ids : [charger_ids];

        // Check if all the chargers exist
        const existingChargers = await devicesCollection.find({ charger_id: { $in: chargerIdsArray } }).toArray();

        if (existingChargers.length !== chargerIdsArray.length) {
            return res.status(404).json({ message: 'One or more chargers not found' });
        }

        // Update the reseller details for all chargers
        const result = await devicesCollection.updateMany(
            { charger_id: { $in: chargerIdsArray } },
            {
                $set: {
                    assigned_reseller_id: reseller_id,
                    charger_accessibility: 2,
                    superadmin_commission: "0",
                    assigned_reseller_date: new Date(),
                    modified_date: new Date(),
                    modified_by
                }
            }
        );

        if (result.matchedCount === 0) {
            throw new Error('Failed to assign chargers to reseller');
        }

        return res.status(200).json({ message: 'Chargers Successfully Assigned' });

    } catch (error) {
        console.error(`Error assigning chargers to reseller: ${error}`);
        logger.error(`Error assigning chargers to reseller: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// fetch connector type name
async function fetchConnectorTypeName(req) {
    try {
        const { connector_type } = req.body;

        if (!connector_type) {
            console.error(`All fields are required`);
            return { error: true, status: 401, message: 'All fields are required' };
        }

        const db = await database.connectToDatabase();
        const OutputTypeCollection = db.collection('output-type_config');

        const fetchResults = await OutputTypeCollection.find({
            output_type: connector_type,
            status: true
        }).toArray();

        if (!fetchResults || fetchResults.length === 0) {
            console.error(`No details found for provided connector types`);
            return { error: true, status: 401, message: 'No details were found' };
        }

        // Map results to an array of output_type_names
        const outputTypeNames = fetchResults.map(result => ({
            output_type_name: result.output_type_name
        }));

        return { error: false, status: 200, message: outputTypeNames };

    } catch (error) {
        console.error(error);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
}

//DeActivateOrActivate charger
async function DeActivateOrActivateCharger(req) {
    try {
        const { modified_by, charger_id, status } = req.body;

        // Validate input
        if (!modified_by || !charger_id || typeof status !== 'boolean') {
            return { error: true, status: 400, message: 'Username, charger ID, and status (boolean) are required' };
        }

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Check if charger exists
        const existingCharger = await devicesCollection.findOne({ charger_id });
        if (!existingCharger) {
            return { error: true, status: 404, message: 'Charger ID not found' };
        }

        // Update the status
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
            return { error: true, status: 500, message: 'Failed to update charger' };
        }

        return { error: false, status: 200, message: 'Charger updated successfully' };
    } catch (error) {
        console.error('Controller error:', error);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
}

// 4. Manage Reseller Controller
//FetchResellers
async function FetchResellers(req, res) {
    try {
        const db = await database.connectToDatabase();
        const resellerCollection = db.collection("reseller_details");

        // Query to fetch all resellers
        const resellers = await resellerCollection.find({}).toArray();

        if (!resellers || resellers.length === 0) {
            return res.status(200).json({ message: 'No resellers found' });
        }

        // Return the reseller data
        return res.status(200).json({ status: 'Success', data: resellers });

    } catch (error) {
        console.error(error);
        logger.error(`Error fetching resellers: ${error}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

//FetchAssignedClients
async function FetchAssignedClients(req, res) {
    try {
        const { reseller_id } = req.body;
        // Validate reseller_id
        if (!reseller_id) {
            return res.status(400).json({ message: 'Reseller ID is required' });
        }

        const db = await database.connectToDatabase();
        const clientCollection = db.collection("client_details");

        // Query to fetch clients for the specific reseller_id
        const clients = await clientCollection.find({ reseller_id: reseller_id }).toArray();

        if (!clients || clients.length === 0) {
            return res.status(404).json({ message: 'No client details found for the specified reseller_id' });
        }

        // Return the client data
        return res.status(200).json({ status: 'Success', data: clients });

    } catch (error) {
        console.error(error);
        logger.error(`Error fetching clients: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// FetchChargerDetailsWithSession
async function FetchChargerDetailsWithSession(req) {
    try {
        const { reseller_id } = req.body;

        // Validate reseller_id
        if (!reseller_id) {
            throw new Error('Reseller ID is required');
        }

        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");

        // Aggregation pipeline to fetch charger details with sorted session data
        const result = await chargerCollection.aggregate([
            {
                $match: { assigned_reseller_id: reseller_id }
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
                    status: 1,
                    sessiondata: 1
                }
            }
        ]).toArray();


        if (!result || result.length === 0) {
            throw new Error('No chargers found for the specified reseller_id');
        }

        // Sort sessiondata within each chargerID based on the first session's stop_time
        result.forEach(charger => {
            if (charger.sessiondata.length > 1) {
                charger.sessiondata.sort((a, b) => new Date(b.stop_time) - new Date(a.stop_time));
            }
        });

        return result;

    } catch (error) {
        console.error(error);
        logger.error(`Error fetching charger details: ${error.message}`);
        throw error;
    }
}

// Create User
async function CreateUserAutomatic(role_id, reseller_id, username, email_id, phone_no, created_by) {
    try {

        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const UserRole = db.collection("user_roles");

        // Check if the role ID exists
        const existingRole = await UserRole.findOne({ role_id: role_id });
        if (!existingRole) {
            console.log("Role ID does not exist");
            return; // Stop execution if the role ID is invalid
        }

        // Check if this role_id + email_id combo already exists
        const duplicateEmailWithRole = await Users.findOne({
            role_id: role_id,
            email_id: email_id
        });

        if (duplicateEmailWithRole) {
            return { success: false, message: "This email is already registered under the same role" };
        }

        // Use aggregation to fetch the highest user_id
        const lastUser = await Users.find().sort({ user_id: -1 }).limit(1).toArray();
        let newUserId = lastUser.length > 0 ? lastUser[0].user_id + 1 : 1; // Default to 1 if no users exist

        // Generate a random 4-digit password
        const randomPassword = Math.floor(1000 + Math.random() * 9000);

        // Insert the new user
        const result = await Users.insertOne({
            role_id: role_id,
            reseller_id: reseller_id,
            client_id: null,
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

        // Check if insertion was successful before sending email
        if (result.insertedId) {
            console.log("User inserted successfully. Sending email...");
            const emailSent = await Emailler.EmailConfigForResellerUser(email_id, randomPassword);
            if (emailSent) {
                console.log("User created and email sent successfully.");
            } else {
                console.log("User created, but email sending failed.");
            }
        } else {
            console.log("User insertion failed, email will not be sent.");
        }
    } catch (error) {
        console.error("Error creating user:", error);
        logger.error(error);
    }
}

//Create Reseller 
async function CreateReseller(req) {
    try {
        const {
            reseller_name,
            reseller_phone_no,
            reseller_email_id,
            reseller_address,
            created_by
        } = req.body;

        // Validate required fields
        if (!reseller_name || !reseller_phone_no || !reseller_email_id || !reseller_address || !created_by) {
            return {
                status: 400,
                success: false,
                message: 'Reseller Name, Phone Number, Email ID, Address, and Created By are required'
            };
        }

        const db = await database.connectToDatabase();
        const resellerCollection = db.collection("reseller_details");
        const roleCollection = db.collection("user_roles");

        const role_id = 2; // Assuming 2 is the role ID for Reseller Admin

        // Check if Reseller Role is active
        const resellerRole = await roleCollection.findOne({ role_id: role_id });

        if (!resellerRole) {
            return {
                status: 404,
                success: false,
                message: "Reseller role not found in the system."
            };
        }

        if (resellerRole.status === false) {
            return {
                status: 403,
                success: false,
                message: "Reseller role is deactivated. Cannot create reseller & user."
            };
        }

        // Check if reseller with same name/email exists
        const existingReseller = await resellerCollection.findOne({
            $or: [
                { reseller_email_id: reseller_email_id },
                { reseller_name: reseller_name }
            ]
        });

        if (existingReseller) {
            return {
                status: 400,
                success: false,
                message: 'Reseller name or Email ID already exists'
            };
        }

        // Get next reseller_id
        const lastReseller = await resellerCollection.find().sort({ reseller_id: -1 }).limit(1).toArray();
        const newResellerId = lastReseller.length > 0 ? lastReseller[0].reseller_id + 1 : 1;

        // Insert new reseller
        const result = await resellerCollection.insertOne({
            reseller_id: newResellerId,
            reseller_name,
            reseller_phone_no,
            reseller_email_id,
            reseller_address,
            reseller_wallet: 0.00,
            created_date: new Date(),
            modified_date: null,
            created_by,
            modified_by: null,
            status: true
        });

        if (result.insertedId) {
            // Create user automatically
            await CreateUserAutomatic(role_id, newResellerId, reseller_name, reseller_email_id, reseller_phone_no, created_by);
            return {
                status: 200,
                success: true,
                message: 'Reseller and associated user created successfully'
            };
        } else {
            return {
                status: 500,
                success: false,
                message: 'Failed to create reseller'
            };
        }

    } catch (error) {
        console.error("Error creating reseller:", error);
        logger.error(`Error creating reseller: ${error}`);
        return {
            status: 500,
            success: false,
            message: 'Internal Server Error'
        };
    }
}

//UpdateReseller 
async function UpdateReseller(req, res) {
    try {
        const {
            reseller_id,
            reseller_phone_no,
            reseller_address,
            reseller_wallet,
            modified_by,
            status
        } = req.body;

        // Validate required fields
        if (!reseller_id || !reseller_phone_no || !reseller_address || !reseller_wallet || !modified_by || typeof status !== 'boolean') {
            return res.status(400).json({ message: 'Reseller ID, Name, Phone Number,reseller_wallet,  status, Email ID, Address, and Modified By are required' });
        }

        const db = await database.connectToDatabase();
        const resellerCollection = db.collection("reseller_details");

        // Check if the reseller exists
        const existingReseller = await resellerCollection.findOne({ reseller_id: reseller_id });

        if (!existingReseller) {
            return res.status(404).json({ message: 'Reseller not found' });
        }

        // Update the reseller details
        const result = await resellerCollection.updateOne(
            { reseller_id: reseller_id },
            {
                $set: {
                    reseller_phone_no,
                    reseller_address,
                    reseller_wallet: parseFloat(reseller_wallet),
                    modified_date: new Date(),
                    modified_by,
                    status
                }
            }
        );

        if (result.modifiedCount === 0) {
            throw new Error('Failed to update reseller');
        }

        return res.status(200).json({ message: 'Reseller updated successfully' });

    } catch (error) {
        console.error(error);
        logger.error(`Error updating reseller: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// 5.Manage User Controller
// Fetch user details
async function FetchUser() {
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const rolesCollection = db.collection("user_roles");
        const resellerCollection = db.collection("reseller_details");
        const clientCollection = db.collection("client_details");
        const associationCollection = db.collection("association_details");

        // Query to fetch all users
        const users = await usersCollection.find().toArray();

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
        logger.error(`Error fetching users: ${error}`);
        throw new Error('Error fetching users');
    }
}

//FetchSpecificUserRoleForSelection
async function FetchSpecificUserRoleForSelection() {
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("user_roles");

        // Query to fetch all reseller_id and reseller_name
        const roles = await usersCollection.find(
            { role_id: { $in: [1, 2] }, status: true }, // Filter to fetch role_id 1 and 2
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

// FetchResellerForSelection
async function FetchResellerForSelection() {
    try {
        // Connect to the database
        const db = await database.connectToDatabase();
        const resellersCollection = db.collection("reseller_details");
        const usersCollection = db.collection("users");

        // Fetch all reseller_id from the users table
        const userResellerIds = await usersCollection.distinct("reseller_id");

        // Query to fetch resellers not present in the users table
        const resellers = await resellersCollection.find(
            {
                status: true,
                reseller_id: { $nin: userResellerIds } // Exclude resellers already present in users table
            },
            {
                projection: {
                    reseller_id: 1,
                    reseller_name: 1,
                    _id: 0 // Exclude _id from the result
                }
            }
        ).toArray();

        // Return the filtered resellers data
        return resellers;
    } catch (error) {
        logger.error(`Error fetching resellers: ${error}`);
        throw new Error('Error fetching resellers');
    }
}

// Controller to Create a New User
async function CreateUser(req) {
    try {
        const { role_id, reseller_id, username, email_id, password, phone_no, wallet_bal, created_by } = req.body;

        // Required fields validation
        if (!username || !role_id || !email_id || !password || !created_by) {
            return { success: false, message: 'Username, Role ID, Email ID, Password, and Created By are required' };
        }

        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const UserRole = db.collection("user_roles");

        // Check if the role exists
        const existingRole = await UserRole.findOne({ role_id: parseInt(role_id) });
        if (!existingRole) {
            return { success: false, message: 'Invalid Role ID' };
        }

        // Check if user with the same role and email already exists
        const existingUser = await Users.findOne({ role_id: parseInt(role_id), email_id });
        if (existingUser) {
            return { success: false, message: 'This email is already registered under the same role' };
        }

        // Get next user_id
        const lastUser = await Users.find().sort({ user_id: -1 }).limit(1).toArray();
        const newUserId = lastUser.length ? lastUser[0].user_id + 1 : 1;

        // Insert user
        const insertResult = await Users.insertOne({
            role_id: parseInt(role_id),
            reseller_id: reseller_id || null,
            client_id: null,
            association_id: null,
            user_id: newUserId,
            tag_id: null,
            assigned_association: null,
            username,
            email_id,
            password: password.toString(), // store hashed password ideally!
            phone_no: phone_no || null,
            wallet_bal: parseFloat(wallet_bal) || 0,
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

        if (!insertResult.insertedId) {
            return { success: false, message: 'User creation failed' };
        }

        return { success: true };

    } catch (error) {
        console.error('Error creating user:', error);
        logger?.error?.(error);
        return { success: false, message: 'Internal Server Error' };
    }
}

// Update User
async function UpdateUser(req) {
    try {
        const { user_id, username, phone_no, password, wallet_bal, modified_by, status } = req.body;

        // Input validation
        if (!user_id || !username || !password || !modified_by) {
            return { success: false, message: 'User ID, Username, Password, and Modified By are required' };
        }

        const db = await database.connectToDatabase();
        const Users = db.collection("users");

        // Check if user exists
        const existingUser = await Users.findOne({ user_id: parseInt(user_id) });
        if (!existingUser) {
            return { success: false, message: 'User not found' };
        }

        // Update user
        const updateResult = await Users.updateOne(
            { user_id: parseInt(user_id) },
            {
                $set: {
                    username,
                    phone_no: phone_no || existingUser.phone_no,
                    wallet_bal: wallet_bal !== undefined ? parseFloat(wallet_bal) : existingUser.wallet_bal,
                    modified_date: new Date(),
                    password: password.toString(), // You should hash the password ideally
                    modified_by,
                    status: status !== undefined ? status : existingUser.status
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            return { success: false, message: 'No changes were made to the user' };
        }

        return { success: true, message: 'User updated successfully' };

    } catch (error) {
        console.error('Error updating user:', error);
        logger?.error?.(error);
        return { success: false, message: 'Internal Server Error' };
    }
}

// 6.Manage User Role Controller
//FetchUserRole
async function FetchUserRole() {
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("user_roles");

        // Query to fetch all roles from usersCollection
        const user_roles = await usersCollection.find().toArray();

        // Return the role data
        return user_roles;
    } catch (error) {
        logger.error(`Error fetching user roles: ${error}`);
        throw new Error('Error fetching user roles');
    }
}

// Create UserRole
async function CreateUserRole(req) {
    try {
        const { created_by, rolename } = req.body;

        // Validate input
        if (!created_by || !rolename) {
            return { success: false, message: 'Username and Role Name are required' };
        }

        const db = await database.connectToDatabase();
        const UserRole = db.collection("user_roles");

        // Aggregate for existing role name and max role_id
        const [aggregationResult] = await UserRole.aggregate([
            {
                $facet: {
                    existingRole: [
                        { $match: { role_name: rolename } },
                        { $limit: 1 }
                    ],
                    lastRole: [
                        { $sort: { role_id: -1 } },
                        { $limit: 1 }
                    ]
                }
            }
        ]).toArray();

        const existingRole = aggregationResult.existingRole[0];
        const lastRole = aggregationResult.lastRole[0];

        if (existingRole) {
            return { success: false, message: 'Role Name already exists' };
        }

        const newRoleId = lastRole ? lastRole.role_id + 1 : 1;

        await UserRole.insertOne({
            role_id: newRoleId,
            role_name: rolename,
            created_date: new Date(),
            created_by,
            modified_by: null,
            modified_date: null,
            status: true
        });

        return { success: true, message: 'New user role created successfully' };

    } catch (error) {
        console.error('Error in CreateUserRole controller:', error);
        logger?.error?.(error);
        return { success: false, message: 'Internal Server Error while creating user role' };
    }
}

// UpdateUserRole
async function UpdateUserRole(req) {
    try {
        const { role_id, role_name, modified_by } = req.body;

        if (!role_id || !role_name || !modified_by) {
            return { success: false, message: 'Role ID, Role Name, and Modified By are required' };
        }

        const db = await database.connectToDatabase();
        const UserRole = db.collection("user_roles");

        // Check if the role exists
        const existingRole = await UserRole.findOne({ role_id });
        if (!existingRole) {
            return { success: false, message: 'Role ID not found' };
        }

        // Check for duplicate role name (not same ID)
        const existingRoleName = await UserRole.findOne({ role_name });
        if (existingRoleName && existingRoleName.role_id !== role_id) {
            return { success: false, message: 'Role name already exists' };
        }

        // Update role
        const updateResult = await UserRole.updateOne(
            { role_id },
            {
                $set: {
                    role_name,
                    modified_by,
                    modified_date: new Date()
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            return { success: false, message: 'No changes made to the role' };
        }

        return { success: true, message: 'Role updated successfully' };

    } catch (error) {
        console.error('Error in UpdateUserRole:', error);
        logger?.error?.(error);
        return { success: false, message: 'Internal Server Error' };
    }
}

//DeActivateOrActivate UserRole
async function DeActivateOrActivateUserRole(req) {
    try {
        const { modified_by, role_id, status } = req.body;

        // Validate the input
        if (!modified_by || !role_id || typeof status !== 'boolean') {
            return { success: false, message: 'Modified by, Role ID, and Status (boolean) are required' };
        }

        const db = await database.connectToDatabase();
        const UserRole = db.collection("user_roles");

        // Check if the role exists
        const existingRole = await UserRole.findOne({ role_id });
        if (!existingRole) {
            return { success: false, message: 'Role not found' };
        }

        // Update role's status
        const updateResult = await UserRole.updateOne(
            { role_id },
            {
                $set: {
                    status,
                    modified_by,
                    modified_date: new Date()
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return { success: false, message: 'Failed to update user role status' };
        }

        return { success: true, message: `User role ${status ? 'activated' : 'deactivated'} successfully` };

    } catch (error) {
        console.error('Error in DeActivateOrActivateUserRole controller:', error);
        logger?.error?.(error);
        return { success: false, message: 'Internal Server Error while updating user role status' };
    }
}

// 7.Output Type Config Controller
// fetch Output Type details
async function fetchOutputType(req) {
    try {
        // if (!req || !req.body) {
        //     return { error: true, status: 400, message: 'Request body is missing' };
        // }

        let id;
        let fetchResult;

        // Check if req and req.body exist
        if (req && req.body) {
            // Destructure id from req.body if it exists
            ({ id } = req.body);
        }
        //  const { id } = req.body;
        const db = await database.connectToDatabase();
        const OutputTypeCollection = db.collection('output-type_config');

        //   let fetchResult;

        if (id) {
            fetchResult = await OutputTypeCollection.findOne({ id });

            if (!fetchResult) {
                return { error: true, status: 404, message: `No details found for id: ${id}` };
            }

        } else {
            fetchResult = await OutputTypeCollection.find().toArray();

            if (!fetchResult || fetchResult.length === 0) {
                return { error: true, status: 404, message: 'No output type details found' };
            }
        }

        return { error: false, status: 200, message: fetchResult };

    } catch (error) {
        console.error('Error in fetchOutputType:', error);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
}

// update Output Type details
async function updateOutputType(req) {
    try {
        const { id, output_type_name, modified_by } = req.body;

        if (!id || !output_type_name || !modified_by) {
            console.error(`All fields are required`);
            return { error: true, status: 401, message: 'All fields are required' };
        }

        const db = await database.connectToDatabase();
        const OutputTypeCollection = db.collection('output-type_config');

        // Check if the output type with the same name exists, excluding the current record being updated
        const existingType = await OutputTypeCollection.findOne({
            output_type_name: output_type_name,
            id: { $ne: id } // Exclude the current record
        });

        if (existingType) {
            return { error: true, status: 400, message: 'Output type with this name already exists' };
        }

        const updateResult = await OutputTypeCollection.updateOne(
            { id: id },
            {
                $set: {
                    output_type_name: output_type_name,
                    modified_by: modified_by,
                    modified_date: new Date()
                }
            }
        );

        // Check if the update was successful
        if (updateResult.matchedCount === 0) {
            return { error: true, status: 404, message: 'Output type not found' };
        }

        if (updateResult.modifiedCount === 1) {
            return { error: false, status: 200, message: 'Updated successfully' };
        } else {
            console.error(`Updation Failed, Please try again`);
            return { error: true, status: 500, message: 'Failed to update output type' };
        }

    } catch (error) {
        console.error(error);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
}

// De activate Output Type details
async function DeActivateOutputType(req) {
    try {
        const { id, modified_by, status } = req.body;
        if (!id || !modified_by || status === undefined) {
            console.error(`All fields are required`);
            return { error: true, status: 401, message: 'All fields are required' };
        }

        const db = await database.connectToDatabase();
        const OutputTypeCollection = db.collection('output-type_config');

        const updateResult = await OutputTypeCollection.updateOne(
            { id: id },
            {
                $set: {
                    status: status,
                    modified_by: modified_by,
                    modified_date: new Date(),
                }
            }
        );

        if (updateResult.modifiedCount === 1) {
            return { error: false, status: 200, message: 'De-Activated/Activated successfully' };
        } else {
            console.error(`De-Activated Failed, Please try again`);
            return { error: true, status: 401, message: 'Something went wrong, Please try again !' };
        }
    } catch (error) {
        console.error(error);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
}

// create Output type details
async function createOutputType(req) {
    try {
        const { output_type, output_type_name, created_by } = req.body;

        if (!output_type || !output_type_name || !created_by) {
            console.error(`All fields are required`);
            return { error: true, status: 401, message: 'All fields are required' };
        }

        const db = await database.connectToDatabase();
        const OutputTypeCollection = db.collection('output-type_config');

        const existingType = await OutputTypeCollection.findOne({ output_type: output_type, output_type_name: output_type_name });
        if (existingType) {
            return { error: true, status: 400, message: 'Output type already exists' };
        }

        // Fetch the highest current ID and increment by 1
        const lastId = await OutputTypeCollection.find().sort({ id: -1 }).limit(1).toArray();
        const newId = lastId.length > 0 ? lastId[0].id + 1 : 1;

        const insertResult = await OutputTypeCollection.insertOne({
            id: newId,
            output_type: output_type,
            output_type_name: output_type_name,
            created_by: created_by,
            created_date: new Date(),
            status: true
        });

        // Check if the insert was successful
        if (insertResult.acknowledged === true) {
            return { error: false, status: 200, message: 'Output type created successfully' };
        } else {
            return { error: true, status: 500, message: 'Failed to create output type' };
        }

    } catch (error) {
        console.error(error);
        return { error: true, status: 500, message: 'Internal Server Error' };
    }
}

// 8.Withdrawal Controller
// Function to fetch payment request details
async function FetchPaymentRequest() {
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const withdrawalCollection = db.collection("withdrawal_details");
        const roleCollection = db.collection("user_roles");

        //  Fetch all withdrawal requests
        const withdrawalDetails = await withdrawalCollection.find({}).toArray();
        if (!withdrawalDetails.length) {
            return { status: 'Failed', message: 'No withdrawal requests found' };
        }

        //  Fetch all user roles once
        const userRoles = await roleCollection.find({}).toArray();

        // Map withdrawal details to user + role info
        const results = await Promise.all(withdrawalDetails.map(async (withdrawal) => {
            const user = await usersCollection.findOne({ user_id: withdrawal.user_id }) || null;

            // Match user's role_id with user_roles collection to get role_name
            let roleName = null;
            if (user) {
                const matchedRole = userRoles.find(role => role.role_id === user.role_id);
                roleName = matchedRole ? matchedRole.role_name : null;
            }

            return {
                withdrawal,
                user: user ? { ...user, role_name: roleName } : null
            };
        }));

        return results;
    } catch (error) {
        console.error('Error fetching payment request details:', error);
        throw new Error('Error fetching payment request details');
    }
}

// Function to update payment request status
async function UpdatePaymentRequestStatus(_id, user_id, withdrawal_approved_status, withdrawal_approved_by, withdrawal_rejected_message = null) {
    try {
        const db = await database.connectToDatabase();
        const withdrawalCollection = db.collection("withdrawal_details");
        const resellerCollection = db.collection("reseller_details");
        const clientCollection = db.collection("client_details");
        const associationCollection = db.collection("association_details");

        const objectId = new ObjectId(_id);
        const withdrawalDetails = await withdrawalCollection.findOne({ _id: objectId });

        if (!withdrawalDetails) {
            return { status: 'Failed', message: 'Withdrawal request not found' };
        }

        // console.log("Withdrawal Details:", withdrawalDetails);

        const identifierMapping = [
            { key: 'reseller_id', collection: resellerCollection, walletField: 'reseller_wallet' },
            { key: 'client_id', collection: clientCollection, walletField: 'client_wallet' },
            { key: 'association_id', collection: associationCollection, walletField: 'association_wallet' }
        ];

        let entityType = identifierMapping.find(type => withdrawalDetails[type.key]);
        if (!entityType) {
            return { status: 'Failed', message: 'No valid entity found' };
        }

        let entityId = withdrawalDetails[entityType.key];
        let entityCollection = entityType.collection;
        let walletField = entityType.walletField;

        const entityDetails = await entityCollection.findOne({ [entityType.key]: entityId });

        if (!entityDetails) {
            return { status: 'Failed', message: `${entityType.key} not found in respective collection` };
        }

        // console.log(`${entityType.key} Details =>`, entityDetails);

        if (withdrawal_approved_status.toLowerCase() === "completed") {
            const updatedWalletAmount = entityDetails[walletField] - withdrawalDetails.totalWithdrawalAmount;

            if (updatedWalletAmount < 0) {
                return { status: 'Failed', message: 'Insufficient balance in wallet' };
            }

            const walletUpdateResult = await entityCollection.updateOne(
                { [entityType.key]: entityId },
                { $set: { [walletField]: updatedWalletAmount } }
            );

            if (walletUpdateResult.modifiedCount > 0) {
                console.log(`Wallet updated: ${entityType.key} ${entityId} | New Wallet Balance: ${updatedWalletAmount}`);
            } else {
                return { status: 'Failed', message: 'Failed to update wallet balance' };
            }
        }

        const withdrawal_approved_date = new Date();
        let updateFields = {
            withdrawal_approved_status,
            withdrawal_approved_by,
            withdrawal_approved_date,
            rca_admin_notification_status: "unread"
        };

        if (withdrawal_approved_status.toLowerCase() === "rejected") {
            updateFields.withdrawal_rejected_message = withdrawal_rejected_message || "No reason provided";
        } else {
            updateFields.withdrawal_rejected_message = null;
        }

        const updateResult = await withdrawalCollection.updateOne(
            { _id: objectId },
            { $set: updateFields }
        );

        if (updateResult.modifiedCount > 0) {
            return { status: 'Success', message: 'Payment request status updated successfully' };
        } else {
            return { status: 'Failed', message: 'No changes made or update failed' };
        }

    } catch (error) {
        console.error('Error in UpdatePaymentRequestStatus function:', error);
        return { status: 'Failed', message: `Internal server error: ${error.message}` };
    }
}

// Function to fetch payment request details with unread notification count
async function FetchPaymentNotification() {
    try {
        const db = await database.connectToDatabase();
        const withdrawalCollection = db.collection("withdrawal_details");
        const usersCollection = db.collection("users");

        // Fetch all withdrawal requests
        const withdrawalDetails = await withdrawalCollection.find({}).toArray();

        if (!withdrawalDetails.length) {
            return { status: 'Failed', message: 'No withdrawal requests found' };
        }

        // Count unread notifications
        const unreadNotifications = withdrawalDetails.filter(w => w.superadmin_notification_status === "unread").length;

        // Fetch related user details for each withdrawal request
        const results = await Promise.all(withdrawalDetails.map(async (withdrawal) => {
            const user = await usersCollection.findOne({ user_id: withdrawal.user_id });

            // If withdrawal has unread notification, include user details
            let withdrawal_notification = null;
            if (withdrawal.superadmin_notification_status === "unread" && user) {
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
        throw new Error('Error fetching payment notification');
    }
}

// Function to MarkNotificationRead
async function MarkNotificationRead(_id, superadmin_notification_status) {
    try {
        // Connect to the database
        const db = await database.connectToDatabase();
        const withdrawalCollection = db.collection("withdrawal_details");

        // Convert _id to ObjectId
        const objectId = new ObjectId(_id);

        // Fetch the current status of the notification
        const withdrawal = await withdrawalCollection.findOne({ _id: objectId });

        // Check if it's already marked as "read"
        if (withdrawal.superadmin_notification_status === "read") {
            return { status: 'Failed', message: 'Notification already marked as read' };
        }

        // Prepare update fields
        let updateFields = {
            superadmin_notification_status
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
// Function to fetch specific charger revenue list
async function FetchSpecificChargerRevenue() {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");
        const resellerCollection = db.collection("reseller_details");
        const clientCollection = db.collection("client_details");
        const associationCollection = db.collection("association_details");

        // Fetch all chargers
        const chargers = await chargerCollection.find().toArray();

        const revenueData = await Promise.all(chargers.map(async (charger) => {
            // Fetch reseller email id
            const reseller = await resellerCollection.findOne({ reseller_id: charger.assigned_reseller_id });
            const reseller_email_id = reseller ? reseller.reseller_email_id : null;

            // Fetch client email id
            const client = await clientCollection.findOne({ client_id: charger.assigned_client_id });
            const client_email_id = client ? client.client_email_id : null;

            // Fetch association email id
            const association = await associationCollection.findOne({ association_id: charger.assigned_association_id });
            const association_email_id = association ? association.association_email_id : null;

            // Fetch session revenue details where start_time and stop_time are not null
            const sessions = await sessionCollection.find({
                charger_id: charger.charger_id,
                start_time: { $ne: null },
                stop_time: { $ne: null }
            }).toArray();

            // Calculate the total revenue as a sum
            const TotalRevenue = sessions.reduce((sum, session) => {
                return sum +
                    parseFloat(session.reseller_commission || 0) +
                    parseFloat(session.association_commission || 0) +
                    parseFloat(session.client_commission || 0);
            }, 0);

            return {
                charger_id: charger.charger_id,
                reseller_email_id,
                client_email_id,
                association_email_id,
                TotalRevenue: TotalRevenue.toFixed(3) // Ensure three decimal places
            };
        }));

        return { revenueData };
    } catch (error) {
        console.error(`Error fetching specific charger revenue: ${error}`);
        throw new Error('Error fetching specific charger revenue');
    }
}

// Function to fetch charger list with all cost with revenue
async function FetchChargerListWithAllCostWithRevenue() {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");

        // Fetch all chargers
        const chargers = await chargerCollection.find().toArray();

        const revenueData = await Promise.all(chargers.map(async (charger) => {
            // Fetch session revenue details for the specific charger where start_time and stop_time are not null
            const sessions = await sessionCollection.find({
                charger_id: charger.charger_id,
                start_time: { $ne: null },
                stop_time: { $ne: null }
            }).toArray();

            if (sessions.length === 0) {
                return null; // Exclude chargers with no sessions
            }

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
                    reseller_revenue: parseFloat(session.reseller_commission || 0).toFixed(3),
                    client_revenue: parseFloat(session.client_commission || 0).toFixed(3),
                    association_revenue: parseFloat(session.association_commission || 0).toFixed(3),
                    totalRevenue: (
                        parseFloat(session.reseller_commission || 0) +
                        parseFloat(session.client_commission || 0) +
                        parseFloat(session.association_commission || 0)
                    ).toFixed(3),
                })),
            };
        }));

        return { revenueData };
    } catch (error) {
        console.error(`Error fetching charger revenue: ${error}`);
        throw new Error('Error fetching charger revenue');
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

// Fetch report device
async function FetchReportDevice() {
    try {
        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Fetch all chargers (without any filter)
        const chargers = await devicesCollection.find({}).toArray();

        return chargers; // Returning complete data
    } catch (error) {
        console.error(`Error fetching chargers: ${error}`);
        throw new Error('Failed to fetch unallocated chargers');
    }
}

// Device report validations
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

   // console.log("Valid Dates:");
   // console.log("From Date:", fromDate.toISOString()); // Expecting "YYYY-MM-DDT00:00:00.000Z"
   // console.log("To Date:", toDate.toISOString()); // Expecting "YYYY-MM-DDT23:59:59.999Z"

    return { fromDate, toDate, status: 200 };
}

// DeviceReport Controller
async function DeviceReport(body) {
    try {
        const { from_date, to_date, device_id } = body;

        // Input validation
        if (!from_date || !to_date || !device_id) {
            console.warn('Missing required parameters in request');
            return {
                status: 400,
                data: { message: 'from_date, to_date, and device_id are required!' }
            };
        }

        const db = await database.connectToDatabase();
        const Collection = db.collection('device_session_details');

        const validateDate = validateAndConvertDates(from_date, to_date);
        if (validateDate.status !== 200) {
            return {
                status: validateDate.status,
                data: { message: validateDate.message }
            };
        }

        // Fetch sessions in date range for the device
        const sessions = await Collection.find({
            charger_id: device_id,
            stop_time: {
                $gte: validateDate.fromDate.toISOString(),
                $lte: validateDate.toDate.toISOString()
            }
        }).sort({ stop_time: -1 }).toArray();

        if (!sessions || sessions.length === 0) {
            return {
                status: 404,
                data: { message: 'No device report found for the given period and device ID!' }
            };
        }

        // Calculate total revenue and kWh
        const totalRevenue = sessions.reduce((sum, s) => sum + Number(s.price || 0), 0);
        const totalKWH = sessions.reduce((sum, s) => sum + parseFloat(s.unit_consummed || 0), 0);

        // Format response
        const responseData = {
            device_id,
            totalKWH: totalKWH.toFixed(3),
            totalRevenue: totalRevenue.toFixed(2),
            sessions: sessions.map((s) => ({
                session_id: s.session_id || 'N/A',
                user: s.user || 'N/A',
                start_time: s.start_time ? new Date(s.start_time).toLocaleString() : 'N/A',
                stop_time: s.stop_time ? new Date(s.stop_time).toLocaleString() : 'N/A',
                unit_consumed: s.unit_consummed ? `${s.unit_consummed} kWh` : '0 kWh',
                price: s.price ? `Rs. ${Number(s.price).toFixed(2)}` : 'Rs. 0.00'
            }))
        };

        console.log('Device Report data fetched successfully');
        return {
            status: 200,
            data: { data: responseData }
        };

    } catch (error) {
        console.error('Error fetching device revenue report data:', error);
        return {
            status: 500,
            data: { message: 'Internal Server Error' }
        };
    }
}

// 10.Profile Controller
//FetchUserProfile
async function FetchUserProfile(req) {
    const { user_id } = req.body;

    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

        // Query to fetch the user by user_id
        const user = await usersCollection.findOne({ user_id: parseInt(user_id) });

        if (!user) {
            return { status: 404, message: 'User not found' };
        }

        const { socket, ...sanitizedProfile } = user;

        return { status: 200, data: sanitizedProfile };

    } catch (error) {
        logger.error(`Error fetching user: ${error}`);
        return { status: 500, message: 'Internal Server Error' };
    }
}

// UpdateUserProfile
async function UpdateUserProfile(req) {
    const { user_id, username, phone_no, password, modified_by, status } = req.body;

    try {
        // Input validation
        if (!user_id || !username || !phone_no || !password || !modified_by || typeof status !== 'boolean') {
            return { status: 400, message: 'User ID, Username, Phone Number, Password, Modified By, and Status are required' };
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

        // Check if user exists
        const existingUser = await usersCollection.findOne({ user_id });
        if (!existingUser) {
            return { status: 404, message: 'User not found' };
        }

        // Update user profile
        const updateResult = await usersCollection.updateOne(
            { user_id },
            {
                $set: {
                    username,
                    phone_no,
                    password,
                    modified_by,
                    modified_date: new Date(),
                    status
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return { status: 500, message: 'Failed to update user profile' };
        }

        return { status: 200, data: { user_id, username, phone_no, status }, message: 'User profile updated successfully' };
    } catch (error) {
        console.error(error);
        logger.error(`Error updating user profile: ${error}`);
        return { status: 500, message: 'Internal Server Error' };
    }
}

// 11.OCCP Config

module.exports = {
    authenticate, FetchTotalUsers, FetchTotalCharger, FetchOnlineCharger, FetchOfflineCharger, FetchFaultsCharger, FetchChargerTotalEnergy,
    FetchTotalChargersSession, FetchAllocatedChargers, FetchCharger, CreateCharger, UpdateCharger, FetchUnAllocatedChargerToAssgin, fetchConnectorTypeName, DeActivateOrActivateCharger,
    FetchResellersToAssgin, AssignChargerToReseller, FetchResellers, FetchAssignedClients, FetchChargerDetailsWithSession, CreateReseller, UpdateReseller,
    FetchUser, FetchSpecificUserRoleForSelection, FetchResellerForSelection, CreateUser, UpdateUser, FetchUserRole, CreateUserRole, UpdateUserRole, DeActivateOrActivateUserRole,
    fetchOutputType, updateOutputType, DeActivateOutputType, createOutputType, FetchPaymentRequest, UpdatePaymentRequestStatus, FetchPaymentNotification, MarkNotificationRead,
    FetchSpecificChargerRevenue, FetchChargerListWithAllCostWithRevenue, FetchReportDevice, DeviceReport, FetchUserProfile, UpdateUserProfile,
};
