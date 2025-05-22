const database = require('../config/db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';
const { ObjectId } = require("mongodb"); // Import ObjectId
const Emailler = require('../Emailer/controller');
const logger = require('../utils/logger');

// 1.Login Controller
const authenticate = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).json({ message: 'Email and Password required' });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email_id: email, status: true });

        // Check if user exists with the given email
        if (!user) {
            return res.status(401).json({ message: 'Invalid email address or user is deactivated' });
        }

        // Check if password is correct
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Check if user has the required role
        if (user.role_id !== 1) {
            return res.status(401).json({ message: 'Unauthorized role' });
        }

        // Generate JWT token
        const token = jwt.sign({ username: user.username }, JWT_SECRET);

        return res.status(200).json({
            status: 'Success',
            user: {
                user_id: user.user_id,
                username: user.username,
                email_id: user.email_id,
                role_id: user.role_id
            },
            token: token
        });

    } catch (error) {
        console.error('Error in authentication:', error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
};

// 2.Dashboard Controller
// Function to fetch total counts of resellers, clients, associations, and app users
const FetchTotalUsers = async (req, res) => {
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

        // Return total counts in a structured response
        return res.status(200).json({
            status: 'Success',
            totalCounts: {
                resellersCount: resellersCount || 0,
                clientsCount: clientsCount || 0,
                associationsCount: associationsCount || 0,
                appUsersCount: appUsersCount || 0
            }
        });

    } catch (error) {
        console.error(`Error in FetchTotalUsers: ${error.message}`);
        return res.status(500).json({
            status: 'Failed',
            message: 'Failed to fetch total resellers, clients, associations, app users'
        });
    }
};

// fetch total charger
const FetchTotalCharger = async (req, res) => {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");

        // Query to find chargers with a valid assigned_reseller_id (not null or empty)
        const recentChargers = await chargerCollection.find({
            assigned_reseller_id: { $nin: [null, ""] } // Exclude null or empty values
        }).toArray();

        // Get total count of matching chargers
        const totalCount = recentChargers.length;

        // Return the success response with total count and data
        return res.status(200).json({
            status: 'Success',
            totalCount,
            data: recentChargers
        });

    } catch (error) {
        console.error('Error in FetchTotalCharger:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Failed to fetch charger details'
        });
    }
};

// Fetch online chargers that are active and modified within the last hour
const FetchOnlineCharger = async (req, res) => {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_status");

        // Get the current time in UTC
        const currentTime = new Date();

        // Calculate 1 hour ago from the current time
        const oneHourAgo = new Date(currentTime.getTime() - (1 * 60 * 60 * 1000));

        // Query to find chargers modified within the last hour (Online Chargers)
        const onlineChargers = await chargerCollection.find({
            timestamp: { $gte: oneHourAgo },
            error_code: "NoError"
        }).toArray();

        // Get total count of online chargers
        const totalCount = onlineChargers.length;

        // If no online chargers are found, return a message
        if (totalCount === 0) {
            return res.status(200).json({
                status: 'Success',
                totalCount,
                message: "No online chargers found"
            });
        }

        // Return the online chargers and the total count
        return res.status(200).json({
            status: 'Success',
            totalCount,
            data: onlineChargers
        });

    } catch (error) {
        console.error('Error in FetchOnlineCharger:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Failed to fetch online chargers'
        });
    }
};

// Fetch offline chargers (chargers modified more than 1 hour ago)
const FetchOfflineCharger = async (req, res) => {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_status");

        // Get current time
        const currentTime = new Date();
        // Calculate time 1 hour ago
        const oneHourAgo = new Date(currentTime.getTime() - (1 * 60 * 60 * 1000));

        // Query to find offline chargers (not modified in the last 1 hour)
        const offlineChargers = await chargerCollection.find({
            timestamp: { $lt: oneHourAgo } // Chargers modified before one hour ago
        }).toArray();

        // Get total count of offline chargers
        const totalCount = offlineChargers.length;

        // If no offline chargers are found, return a message
        if (totalCount === 0) {
            return res.status(200).json({
                status: 'Success',
                totalCount,
                message: "No offline chargers found"
            });
        }

        // Return the offline chargers and the total count
        return res.status(200).json({
            status: 'Success',
            totalCount,
            data: offlineChargers
        });

    } catch (error) {
        console.error('Error in FetchOfflineCharger:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Failed to fetch offline chargers'
        });
    }
};

// Fetch faulty chargers (chargers with error_code not equal to "NoError")
const FetchFaultsCharger = async (req, res) => {
    try {
        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_status");

        // Get current time
        const currentTime = new Date();
        // Calculate time 1 hour ago
        const oneHourAgo = new Date(currentTime.getTime() - (1 * 60 * 60 * 1000));

        // Query to find faulty chargers (error_code not equal to "NoError")
        const faultyChargers = await chargerCollection.find({
            timestamp: { $gte: oneHourAgo },  // Modified within the last 1 hour
            error_code: { $ne: "NoError" }   // error_code is not "NoError"
        }).toArray();

        // Get total count of faulty chargers
        const totalCount = faultyChargers.length;

        // If no faulty chargers are found, return a message
        if (totalCount === 0) {
            return res.status(200).json({
                status: 'Success',
                totalCount,
                message: "No Fault chargers found"
            });
        }

        // Return the faulty chargers and the total count
        return res.status(200).json({
            status: 'Success',
            totalCount,
            data: faultyChargers
        });

    } catch (error) {
        console.error('Error in FetchFaultsCharger:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Failed to fetch faulty chargers'
        });
    }
};

// Fetch Charger Total Energy details
const FetchChargerTotalEnergy = async (req, res) => {
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

        // Aggregation pipelines for day-to-day, weekly, monthly, and yearly energy consumption
        const resultDayToDay = await chargerCollection.aggregate([
            { $addFields: { start_time: { $toDate: "$start_time" } } },
            { $group: { _id: { $dateToString: { format: "%d/%m/%Y", date: "$start_time" } }, day2daytotalEnergyConsumed: { $sum: { $toDouble: "$unit_consummed" } } } },
            { $sort: { "_id": -1 } }
        ]).toArray();

        const daytodaytotalEnergyConsumed = resultDayToDay
            .filter(entry => entry._id !== null)
            .map(entry => ({
                date: entry._id,
                totalEnergyConsumed: entry.day2daytotalEnergyConsumed
            }));

        // Weekly, Monthly, and Yearly Aggregation
        const weeklyAggregation = [matchStage, addFieldsStage, { $group: { _id: { year: { $year: "$start_time" }, week: { $isoWeek: "$start_time" } }, totalEnergyConsumed: { $sum: { $toDouble: "$unit_consummed" } } } }, { $sort: { "_id.year": -1, "_id.week": -1 } }];
        const monthlyAggregation = [matchStage, addFieldsStage, { $group: { _id: { year: { $year: "$start_time" }, month: { $month: "$start_time" } }, totalEnergyConsumed: { $sum: { $toDouble: "$unit_consummed" } } } }, { $sort: { "_id.year": -1, "_id.month": -1 } }];
        const yearlyAggregation = [matchStage, addFieldsStage, { $group: { _id: { year: { $year: "$start_time" } }, totalEnergyConsumed: { $sum: { $toDouble: "$unit_consummed" } } } }, { $sort: { "_id.year": -1 } }];

        // Execute Aggregations
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
            month: `${entry._id.year}-${String(entry._id.month).padStart(2, "0")}`,
            totalEnergyConsumed: entry.totalEnergyConsumed || 0
        }));

        const yearlyTotalEnergyConsumed = yearlyResult.map(entry => ({
            year: entry._id.year,
            totalEnergyConsumed: entry.totalEnergyConsumed || 0
        }));

        // Aggregate for total energy consumption
        const result = await chargerCollection.aggregate([
            { $group: { _id: null, totalEnergyConsumed: { $sum: { $toDouble: "$unit_consummed" } } } }
        ]).toArray();

        const totalEnergyConsumed = result.length > 0 ? result[0].totalEnergyConsumed : 0;

        // Constants for CO2 savings calculations
        const EV_EFFICIENCY = 6.5; // km per kWh
        const EV_CO2_PER_KWH = 0.02; // kg CO2 per kWh
        const ICE_CO2_PER_KM = 0.35; // kg CO2 per km

        const distanceDrivenByEV = totalEnergyConsumed / EV_EFFICIENCY;
        const CO2_from_ICE = distanceDrivenByEV * ICE_CO2_PER_KM;
        const CO2_from_EV = totalEnergyConsumed * EV_CO2_PER_KWH;
        const CO2_Savings = CO2_from_ICE - CO2_from_EV;

        return res.status(200).json({
            status: 'Success',
            data: {
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
        console.error('Error fetching Charger Total Energy:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Failed to fetch charger total energy details'
        });
    }
};

// Fetch Total Charger Session count
const FetchTotalChargersSession = async (req, res) => {
    try {
        const db = await database.connectToDatabase();
        const sessionCollection = db.collection("device_session_details");

        // Get the total count of sessions based on _id
        const totalCount = await sessionCollection.countDocuments();

        // Send a success response with the total count
        return res.status(200).json({
            status: 'Success',
            totalCount
        });
    } catch (error) {
        console.error('Error fetching total charger session count:', error);

        // Send a failed response if an error occurs
        return res.status(500).json({
            status: 'Failed',
            message: 'Failed to fetch charger session count'
        });
    }
};

// 3.Manage Device Controller
// Function to Fetch allocated chargers
const FetchAllocatedChargers = async (req, res) => {
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

        // Fetch related data
        const [resellers, clients, associations, configs] = await Promise.all([
            resellerCollection.find({ reseller_id: { $in: [...resellerIds] } }).toArray(),
            clientCollection.find({ client_id: { $in: [...clientIds] } }).toArray(),
            associationCollection.find({ association_id: { $in: [...associationIds] } }).toArray(),
            configCollection.find({ charger_id: { $in: chargerIds } }).toArray()
        ]);

        // Create maps for lookup
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

                        let connectorTypeValue = rawType === 1 ? "Socket" :
                            rawType === 2 ? "Gun" :
                                rawType;

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

        return res.status(200).json({
            status: 'Success',
            data: allocatedChargers
        });

    } catch (error) {
        console.error('Error fetching allocated chargers:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Failed to fetch allocated chargers'
        });
    }
};

//FetchCharger(Which are un-allocated to reseller)
async function FetchCharger(req, res) {
    try {
        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");
        const configCollection = db.collection("socket_gun_config");

        const chargers = await devicesCollection.find({ assigned_reseller_id: null }).toArray();

        const results = [];

        for (let charger of chargers) {
            const chargerID = charger.charger_id;
            const config = await configCollection.findOne({ charger_id: chargerID });

            let connectorDetails = [];

            if (config) {
                let connectorIndex = 1;
                while (config[`connector_${connectorIndex}_type`] !== undefined) {
                    let typeVal = config[`connector_${connectorIndex}_type`];
                    let typeName = config[`connector_${connectorIndex}_type_name`];

                    connectorDetails.push({
                        connector_type: typeVal === 1 ? "Socket" : typeVal === 2 ? "Gun" : typeVal,
                        connector_type_name: typeName
                    });

                    connectorIndex++;
                }
            }

            results.push({
                ...charger,
                connector_details: connectorDetails.length > 0 ? connectorDetails : null
            });
        }

        res.status(200).json({ status: 'Success', data: results });
    } catch (error) {
        console.error('Error in FetchCharger controller:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch chargers with connector details' });
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

        // Validate required fields
        if (!charger_id || !charger_model || !charger_type || !max_current ||
            !max_power || !created_by || !vendor || !wifi_module || !bluetooth_module || !connectors) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Required fields: charger_id, charger_model, charger_type, max_current, max_power, wifi_module, bluetooth_module, vendor, connectors, created_by'
            });
        }

        const wifiModuleBoolean = wifi_module.toLowerCase() === 'true';
        const bluetoothModuleBoolean = bluetooth_module.toLowerCase() === 'true';

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        const existingCharger = await devicesCollection.findOne({ charger_id });
        if (existingCharger) {
            return res.status(409).json({
                status: 'Failed',
                message: `Charger with ID ${charger_id} already exists`
            });
        }

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
                return res.status(200).json({
                    status: 'Success',
                    message: 'Charger created successfully with connectors'
                });
            } else {
                return res.status(200).json({
                    status: 'Success',
                    message: 'Charger created, but connectors not inserted'
                });
            }
        } else {
            return res.status(400).json({
                status: 'Failed',
                message: 'Charger creation failed'
            });
        }
    } catch (error) {
        console.error('CreateCharger Error:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// updatecharger details
const UpdateCharger = async (req, res) => {
    try {
        const {
            _id,
            charger_id,
            charger_model,
            charger_type,
            vendor,
            max_current,
            max_power,
            wifi_module,
            bluetooth_module,
            modified_by,
            connectors
        } = req.body;

        // Validate required fields
        if (
            !_id || !charger_id || !vendor || !max_current || !charger_model ||
            !charger_type || !max_power || !wifi_module || !bluetooth_module || !modified_by
        ) {
            return res.status(400).json({
                status: 'Failed',
                message: 'id, Charger ID, charger_model, charger_type, Vendor, Max Current, Max Power, wifi_module, bluetooth_module, and Modified By are required.'
            });
        }

        // Convert modules to boolean
        const wifiModuleBoolean = wifi_module.toString().toLowerCase() === 'true';
        const bluetoothModuleBoolean = bluetooth_module.toString().toLowerCase() === 'true';

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Check if charger exists
        const existingCharger = await devicesCollection.findOne({ _id: new ObjectId(_id) });
        if (!existingCharger) {
            return res.status(404).json({ status: 'Failed', message: 'Charger not found.' });
        }

        // Check for unique charger_id
        if (charger_id !== existingCharger.charger_id) {
            const chargerIdExists = await devicesCollection.findOne({
                charger_id,
                _id: { $ne: new ObjectId(_id) }
            });

            if (chargerIdExists) {
                return res.status(409).json({
                    status: 'Failed',
                    message: 'Charger ID already exists. Please use a unique Charger ID.'
                });
            }
        }

        // Update charger details
        const updateResult = await devicesCollection.updateOne(
            { _id: new ObjectId(_id) },
            {
                $set: {
                    charger_id,
                    charger_model,
                    charger_type,
                    vendor,
                    max_current,
                    max_power,
                    wifi_module: wifiModuleBoolean,
                    bluetooth_module: bluetoothModuleBoolean,
                    modified_by,
                    modified_date: new Date()
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(500).json({ status: 'Failed', message: 'Failed to update charger.' });
        }

        // Update connectors
        const success = await insertORupdateSocketGunConfig(charger_id, connectors);

        if (success) {
            return res.status(200).json({
                status: 'Success',
                message: 'Charger and connectors updated successfully.'
            });
        } else {
            return res.status(500).json({
                status: 'Failed',
                message: 'Charger updated, but failed to update connectors.'
            });
        }

    } catch (error) {
        console.error('UpdateCharger error:', error);
        return res.status(500).json({
            status: 'Error',
            message: 'Internal Server Error'
        });
    }
};

// FetchUnAllocatedChargerToAssgin
async function FetchUnAllocatedChargerToAssgin(req, res) {
    try {
        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        const chargers = await devicesCollection.find({
            assigned_reseller_id: null,
            status: true
        }).toArray();

        if (!chargers || chargers.length === 0) {
            return res.status(404).json({ status: 'Failed', message: 'No unallocated chargers found' });
        }

        // Safely stringify/parse if needed
        const safeChargers = JSON.parse(JSON.stringify(chargers));
        return res.status(200).json({ status: 'Success', data: safeChargers });

    } catch (error) {
        console.error(`Error fetching unallocated chargers: ${error}`);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch unallocated chargers' });
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

// AssginChargerToReseller
async function AssginChargerToReseller(req, res) {
    try {
        const { reseller_id, charger_ids, modified_by } = req.body;

        if (!reseller_id || !charger_ids || !modified_by) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Reseller ID, Charger IDs, and Modified By are required'
            });
        }

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        const chargerIdsArray = Array.isArray(charger_ids) ? charger_ids : [charger_ids];

        const existingChargers = await devicesCollection.find({
            charger_id: { $in: chargerIdsArray }
        }).toArray();

        if (existingChargers.length !== chargerIdsArray.length) {
            return res.status(404).json({
                status: 'Failed',
                message: 'One or more chargers not found'
            });
        }

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
            return res.status(500).json({
                status: 'Failed',
                message: 'Failed to assign chargers to reseller'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'Chargers Successfully Assigned'
        });

    } catch (error) {
        console.error(`Error assigning chargers to reseller: ${error}`);
        logger.error(`Error assigning chargers to reseller: ${error}`);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// fetch connector type name
async function fetchConnectorTypeName(req, res) {
    try {
        const { connector_type } = req.body;

        if (!connector_type) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Connector type is required'
            });
        }

        const db = await database.connectToDatabase();
        const OutputTypeCollection = db.collection('output-type_config');

        const fetchResults = await OutputTypeCollection.find({
            output_type: connector_type,
            status: true
        }).toArray();

        if (!fetchResults || fetchResults.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No details found for the provided connector type'
            });
        }

        const outputTypeNames = fetchResults.map(result => ({
            output_type_name: result.output_type_name
        }));

        return res.status(200).json({
            status: 'Success',
            data: outputTypeNames
        });

    } catch (error) {
        console.error('Error fetching connector type name:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

//DeActivateOrActivate charger
async function DeActivateOrActivateCharger(req, res) {
    try {
        const { modified_by, charger_id, status } = req.body;

        // Validate input
        if (!modified_by || !charger_id || typeof status !== 'boolean') {
            return res.status(400).json({
                status: 'Failed',
                message: 'Username, charger ID, and status (boolean) are required'
            });
        }

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Check if charger exists
        const existingCharger = await devicesCollection.findOne({ charger_id });
        if (!existingCharger) {
            return res.status(404).json({
                status: 'Failed',
                message: 'Charger ID not found'
            });
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
            return res.status(500).json({
                status: 'Failed',
                message: 'Failed to update charger'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'Charger updated successfully'
        });

    } catch (error) {
        console.error('Controller error:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// 4. Manage Reseller Controller
// FetchResellers
async function FetchResellers(req, res) {
    try {
        const db = await database.connectToDatabase();
        const resellerCollection = db.collection("reseller_details");

        // Query to fetch all resellers
        const resellers = await resellerCollection.find({}).toArray();

        if (!resellers || resellers.length === 0) {
            return res.status(200).json({
                status: 'Success',
                message: 'No resellers found'
            });
        }

        // Return the reseller data
        return res.status(200).json({
            status: 'Success',
            data: resellers
        });

    } catch (error) {
        console.error('Error fetching resellers:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// FetchAssignedClients
async function FetchAssignedClients(req, res) {
    try {
        const { reseller_id } = req.body;

        // Validate reseller_id
        if (!reseller_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Reseller ID is required'
            });
        }

        const db = await database.connectToDatabase();
        const clientCollection = db.collection("client_details");

        // Query to fetch clients for the specific reseller_id
        const clients = await clientCollection.find({ reseller_id: reseller_id }).toArray();

        if (!clients || clients.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No client details found for the specified reseller_id'
            });
        }

        // Return the client data
        return res.status(200).json({
            status: 'Success',
            data: clients
        });

    } catch (error) {
        console.error('Error fetching clients:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// FetchChargerDetailsWithSession
async function FetchChargerDetailsWithSession(req, res) {
    try {
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ success: false, message: 'Reseller ID is required' });
        }

        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");

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
            return res.status(404).json({ success: false, message: 'No chargers found for the specified reseller_id' });
        }

        // Sort sessiondata manually if needed
        result.forEach(charger => {
            if (charger.sessiondata.length > 1) {
                charger.sessiondata.sort((a, b) => new Date(b.stop_time) - new Date(a.stop_time));
            }
        });

        return res.status(200).json({ success: true, data: result });

    } catch (error) {
        console.error('Controller error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
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

// Create Reseller 
const CreateReseller = async (req, res) => {
    try {
        const {
            reseller_name,
            reseller_phone_no,
            reseller_email_id,
            reseller_address,
            created_by
        } = req.body;

        if (!reseller_name || !reseller_phone_no || !reseller_email_id || !reseller_address || !created_by) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Reseller Name, Phone Number, Email ID, Address, and Created By are required'
            });
        }

        const db = await database.connectToDatabase();
        const resellerCollection = db.collection("reseller_details");
        const roleCollection = db.collection("user_roles");

        const role_id = 2; // Assuming 2 = Reseller Admin

        const resellerRole = await roleCollection.findOne({ role_id });

        if (!resellerRole) {
            return res.status(404).json({
                status: 'Failed',
                message: "Reseller role not found in the system."
            });
        }

        if (!resellerRole.status) {
            return res.status(403).json({
                status: 'Failed',
                message: "Reseller role is deactivated. Cannot create reseller & user."
            });
        }

        const existingReseller = await resellerCollection.findOne({
            $or: [
                { reseller_email_id },
                { reseller_name }
            ]
        });

        if (existingReseller) {
            const duplicateFields = [];
        
            if (existingReseller.reseller_email_id === reseller_email_id) {
                duplicateFields.push("Email ID");
            }
        
            if (existingReseller.reseller_name === reseller_name) {
                duplicateFields.push("Reseller Name");
            }
        
            return res.status(400).json({
                status: 'Failed',
                message: `${duplicateFields.join(" and ")} already exists`
            });
        }

        const lastReseller = await resellerCollection.find().sort({ reseller_id: -1 }).limit(1).toArray();
        const newResellerId = lastReseller.length > 0 ? lastReseller[0].reseller_id + 1 : 1;

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
            await CreateUserAutomatic(
                role_id,
                newResellerId,
                reseller_name,
                reseller_email_id,
                reseller_phone_no,
                created_by
            );
            return res.status(200).json({
                status: 'Success',
                message: 'Reseller and associated user created successfully'
            });
        } else {
            return res.status(500).json({
                status: 'Failed',
                message: 'Failed to create reseller'
            });
        }

    } catch (error) {
        console.error("Error creating reseller:", error);
        logger.error(`Error creating reseller: ${error}`);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
};

// Update Reseller 
const UpdateReseller = async (req, res) => {
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
        if (
            !reseller_id ||
            !reseller_phone_no ||
            !reseller_address ||
            !reseller_wallet ||
            !modified_by ||
            typeof status !== 'boolean'
        ) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Reseller ID, Phone Number, Address, Wallet, Status, and Modified By are required'
            });
        }

        const db = await database.connectToDatabase();
        const resellerCollection = db.collection("reseller_details");

        const existingReseller = await resellerCollection.findOne({ reseller_id });

        if (!existingReseller) {
            return res.status(404).json({
                status: 'Failed',
                message: 'Reseller not found'
            });
        }

        const result = await resellerCollection.updateOne(
            { reseller_id },
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
            return res.status(500).json({
                status: 'Failed',
                message: 'Failed to update reseller'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'Reseller updated successfully'
        });

    } catch (error) {
        console.error('Error in UpdateReseller:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
};

// 5.Manage User Controller
// Fetch User Details
async function FetchUsers(req, res) {
    try {
        const db = await database.connectToDatabase();

        const usersCollection = db.collection("users");
        const rolesCollection = db.collection("user_roles");
        const resellerCollection = db.collection("reseller_details");
        const clientCollection = db.collection("client_details");
        const associationCollection = db.collection("association_details");

        // Fetch all users
        const users = await usersCollection.find().toArray();

        if (!users.length) {
            return res.status(200).json({
                error: false,
                message: 'No users found',
                data: []
            });
        }

        // Extract unique IDs
        const roleIds = [...new Set(users.map(user => user.role_id).filter(Boolean))];
        const resellerIds = [...new Set(users.map(user => user.reseller_id).filter(Boolean))];
        const clientIds = [...new Set(users.map(user => user.client_id).filter(Boolean))];
        const associationIds = [...new Set(users.map(user => user.association_id).filter(Boolean))];

        // Parallel fetching
        const [roles, resellers, clients, associations] = await Promise.all([
            rolesCollection.find({ role_id: { $in: roleIds } }).toArray(),
            resellerCollection.find({ reseller_id: { $in: resellerIds } }).toArray(),
            clientCollection.find({ client_id: { $in: clientIds } }).toArray(),
            associationCollection.find({ association_id: { $in: associationIds } }).toArray()
        ]);

        // Mapping data
        const roleMap = new Map(roles.map(role => [role.role_id, role.role_name]));
        const resellerMap = new Map(resellers.map(r => [r.reseller_id, r.reseller_name]));
        const clientMap = new Map(clients.map(c => [c.client_id, c.client_name]));
        const associationMap = new Map(associations.map(a => [a.association_id, a.association_name]));

        // Enrich users
        const usersWithDetails = users.map(user => ({
            ...user,
            role_name: roleMap.get(user.role_id) || 'Unknown',
            reseller_name: resellerMap.get(user.reseller_id) || null,
            client_name: clientMap.get(user.client_id) || null,
            association_name: associationMap.get(user.association_id) || null
        }));

        return res.status(200).json({
            error: false,
            message: 'Users fetched successfully',
            data: usersWithDetails
        });

    } catch (error) {
        logger.error(`Error fetching users: ${error}`);
        return res.status(500).json({
            error: true,
            message: 'Failed to fetch users'
        });
    }
}

// Fetch Specific User Role For Selection
async function FetchSpecificUserRoleForSelection(req, res) {
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("user_roles");

        // Fetch roles with role_id 1 or 2 and status = true
        const roles = await usersCollection.find(
            { role_id: { $in: [1, 2] }, status: true },
            {
                projection: {
                    role_id: 1,
                    role_name: 1,
                    _id: 0
                }
            }
        ).toArray();

        return res.status(200).json({
            error: false,
            message: 'Roles fetched successfully',
            data: roles
        });

    } catch (error) {
        logger.error(`Error fetching roles: ${error}`);
        return res.status(500).json({
            error: true,
            message: 'Failed to fetch roles'
        });
    }
}

// FetchResellerForSelection
const FetchResellerForSelection = async (req, res) => {
    try {
        // Connect to the database
        const db = await database.connectToDatabase();
        const resellersCollection = db.collection("reseller_details");
        const usersCollection = db.collection("users");

        // Fetch all reseller_ids from the users table
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

        // Handle the case if no resellers are found
        if (resellers.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No resellers available for selection.'
            });
        }

        // Return the filtered resellers data
        return res.status(200).json({
            status: 'Success',
            data: resellers
        });
    } catch (error) {
        logger.error(`Error fetching resellers: ${error}`);
        return res.status(500).json({
            status: 'Error',
            message: 'Internal Server Error. Failed to fetch reseller data.'
        });
    }
};

// Controller to Create a New User
const CreateUser = async (req, res) => {
    try {
        const {
            role_id,
            reseller_id,
            username,
            email_id,
            password,
            phone_no,
            wallet_bal,
            created_by
        } = req.body;

        // Required fields validation
        if (!username || !role_id || !email_id || password === undefined || !created_by) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Username, Role ID, Email ID, Password, and Created By are required'
            });
        }

        // Ensure password is a valid number
        const numericPassword = parseInt(password, 10);

        // Validate if the password is a number
        if (isNaN(numericPassword)) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Password must be a numeric value'
            });
        }

        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const UserRole = db.collection("user_roles");

        // Validate if the role exists
        const existingRole = await UserRole.findOne({ role_id: parseInt(role_id) });
        if (!existingRole) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Invalid Role ID'
            });
        }

        // Check if a user with the same role and email exists
        const existingUser = await Users.findOne({
            role_id: parseInt(role_id),
            email_id
        });
        if (existingUser) {
            return res.status(400).json({
                status: 'Failed',
                message: 'This email is already registered under the same role'
            });
        }

        // Get next user_id
        const lastUser = await Users.find().sort({ user_id: -1 }).limit(1).toArray();
        const newUserId = lastUser.length ? lastUser[0].user_id + 1 : 1;

        // Insert new user
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
            password: numericPassword,  // Store the password as a number
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
            return res.status(500).json({
                status: 'Failed',
                message: 'User creation failed'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'New user created successfully'
        });

    } catch (error) {
        console.error('Error creating user:', error);
        logger?.error?.(error);

        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error while creating user'
        });
    }
};

// Update User
const UpdateUser = async (req, res) => {
    try {
        const { user_id, username, phone_no, password, wallet_bal, modified_by, status } = req.body;
        
        // Input validation
        if (!user_id || !username || password === undefined || !modified_by) {
            return res.status(400).json({
                status: 'Failed',
                message: 'User ID, Username, Password, and Modified By are required'
            });
        }

        const db = await database.connectToDatabase();
        const Users = db.collection("users");

        // Check if user exists
        const existingUser = await Users.findOne({ user_id: parseInt(user_id) });
        if (!existingUser) {
            return res.status(404).json({
                status: 'Failed',
                message: 'User not found'
            });
        }

        // Ensure password is an integer
        const numericPassword = parseInt(password, 10);

        // Validate if password is a valid number
        if (isNaN(numericPassword)) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Password must be a numeric value'
            });
        }

        // Update user details
        const updateResult = await Users.updateOne(
            { user_id: parseInt(user_id) },
            {
                $set: {
                    username,
                    phone_no: phone_no || existingUser.phone_no,
                    wallet_bal: wallet_bal !== undefined ? parseFloat(wallet_bal) : existingUser.wallet_bal,
                    modified_date: new Date(),
                    password: numericPassword,  // Store the password as a number (int)
                    modified_by,
                    status: status !== undefined ? status : existingUser.status
                }
            }
        );

        // If no documents were modified, it means no changes were made
        if (updateResult.modifiedCount === 0) {
            return res.status(400).json({
                status: 'Failed',
                message: 'No changes were made to the user'
            });
        }

        // Return success response
        return res.status(200).json({
            status: 'Success',
            message: 'User updated successfully'
        });

    } catch (error) {
        console.error('Error updating user:', error);
        logger?.error?.(error);

        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error while updating user'
        });
    }
};

// 6.Manage User Role Controller
//FetchUserRole
const FetchUserRoles = async (req, res) => {
    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("user_roles");

        // Query to fetch all roles from usersCollection
        const user_roles = await usersCollection.find().toArray();

        // If no roles found, return a failed status
        if (user_roles.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No user roles found'
            });
        }

        // Return the user roles data
        return res.status(200).json({
            status: 'Success',
            data: user_roles
        });

    } catch (error) {
        console.error('Error fetching user roles:', error);
        logger?.error?.(error);

        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error while fetching user roles'
        });
    }
};

// Create UserRole
const CreateUserRole = async (req, res) => {
    try {
        const { created_by, rolename } = req.body;

        // Validate input
        if (!created_by || !rolename) {
            return res.status(400).json({ status: 'Failed', message: 'Username and Role Name are required' });
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
            return res.status(400).json({ status: 'Failed', message: 'Role Name already exists' });
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

        return res.status(200).json({ status: 'Success', message: 'New user role created successfully' });

    } catch (error) {
        console.error('Error in CreateUserRole controller:', error);
        logger?.error?.(error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error while creating user role' });
    }
};

// UpdateUserRole
const UpdateUserRole = async (req, res) => {
    try {
        const { role_id, role_name, modified_by } = req.body;

        // Validate input
        if (!role_id || !role_name || !modified_by) {
            return res.status(400).json({ status: 'Failed', message: 'Role ID, Role Name, and Modified By are required' });
        }

        const db = await database.connectToDatabase();
        const UserRole = db.collection("user_roles");

        // Check if the role exists
        const existingRole = await UserRole.findOne({ role_id });
        if (!existingRole) {
            return res.status(400).json({ status: 'Failed', message: 'Role ID not found' });
        }

        // Check for duplicate role name (not same ID)
        const existingRoleName = await UserRole.findOne({ role_name });
        if (existingRoleName && existingRoleName.role_id !== role_id) {
            return res.status(400).json({ status: 'Failed', message: 'Role name already exists' });
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
            return res.status(400).json({ status: 'Failed', message: 'No changes made to the role' });
        }

        return res.status(200).json({ status: 'Success', message: 'Role updated successfully' });

    } catch (error) {
        console.error('Error in UpdateUserRole controller:', error);
        logger?.error?.(error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error while updating user role' });
    }
};

//DeActivateOrActivate UserRole
const DeActivateOrActivateUserRole = async (req, res) => {
    try {
        const { modified_by, role_id, status } = req.body;

        // Validate the input
        if (!modified_by || !role_id || typeof status !== 'boolean') {
            return res.status(400).json({ status: 'Failed', message: 'Modified by, Role ID, and Status (boolean) are required' });
        }

        const db = await database.connectToDatabase();
        const UserRole = db.collection("user_roles");

        // Check if the role exists
        const existingRole = await UserRole.findOne({ role_id });
        if (!existingRole) {
            return res.status(400).json({ status: 'Failed', message: 'Role not found' });
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
            return res.status(400).json({ status: 'Failed', message: 'Failed to update user role status' });
        }

        return res.status(200).json({ status: 'Success', message: `User role ${status ? 'activated' : 'deactivated'} successfully` });

    } catch (error) {
        console.error('Error in DeActivateOrActivateUserRole controller:', error);
        logger?.error?.(error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error while updating user role status' });
    }
};

// 7.Output Type Config Controller
// fetch Output Type details
const fetchAllOutputType = async (req, res) => {
    try {
        let id;
        let fetchResult;

        // Check if req and req.body exist
        if (req && req.body) {
            ({ id } = req.body); // Destructure id from req.body if it exists
        }

        const db = await database.connectToDatabase();
        const OutputTypeCollection = db.collection('output-type_config');

        if (id) {
            // Fetch details by ID
            fetchResult = await OutputTypeCollection.findOne({ id });

            if (!fetchResult) {
                return res.status(404).json({ message: `No details found for id: ${id}` });
            }
        } else {
            // Fetch all output types
            fetchResult = await OutputTypeCollection.find().toArray();

            if (!fetchResult || fetchResult.length === 0) {
                return res.status(404).json({ message: 'No output type details found' });
            }
        }

        return res.status(200).json({ status: 'Success', data: fetchResult });

    } catch (error) {
        console.error('Error in fetchOutputType:', error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
};

// create Output type details
const createOutputType = async (req, res) => {
    try {
        const { output_type, output_type_name, created_by } = req.body;

        // Input validation: Check if all required fields are present
        if (!output_type || !output_type_name || !created_by) {
            console.error(`All fields are required`);
            return res.status(401).json({ message: 'All fields are required' });
        }

        const db = await database.connectToDatabase();
        const OutputTypeCollection = db.collection('output-type_config');

        // Check if the output type already exists
        const existingType = await OutputTypeCollection.findOne({ output_type: output_type, output_type_name: output_type_name });
        if (existingType) {
            return res.status(400).json({ message: 'Output type already exists' });
        }

        // Fetch the highest current ID and increment by 1
        const lastId = await OutputTypeCollection.find().sort({ id: -1 }).limit(1).toArray();
        const newId = lastId.length > 0 ? lastId[0].id + 1 : 1;

        // Insert new output type config
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
            return res.status(200).json({ status: 'Success', message: 'Output type created successfully' });
        } else {
            return res.status(500).json({ status: 'Failed', message: 'Failed to create output type' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
};

// update Output Type details
const updateOutputType = async (req, res) => {
    try {
        const { id, output_type_name, modified_by } = req.body;

        // Input validation: Check if all required fields are present
        if (!id || !output_type_name || !modified_by) {
            console.error(`All fields are required`);
            return res.status(401).json({ message: 'All fields are required' });
        }

        const db = await database.connectToDatabase();
        const OutputTypeCollection = db.collection('output-type_config');

        // Check if the output type with the same name exists, excluding the current record being updated
        const existingType = await OutputTypeCollection.findOne({
            output_type_name: output_type_name,
            id: { $ne: id } // Exclude the current record
        });

        if (existingType) {
            return res.status(400).json({ message: 'Output type with this name already exists' });
        }

        // Perform the update operation
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
            return res.status(404).json({ message: 'Output type not found' });
        }

        if (updateResult.modifiedCount === 1) {
            return res.status(200).json({ status: 'Success', message: 'Updated successfully' });
        } else {
            console.error(`Updation Failed, Please try again`);
            return res.status(500).json({ status: 'Failed', message: 'Failed to update output type' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
};

// De activate Output Type details
const DeActivateOutputType = async (req, res) => {
    try {
        const { id, modified_by, status } = req.body;

        // Input validation: Check if all required fields are present
        if (!id || !modified_by || status === undefined) {
            console.error(`All fields are required`);
            return res.status(401).json({ message: 'All fields are required' });
        }

        const db = await database.connectToDatabase();
        const OutputTypeCollection = db.collection('output-type_config');

        // Perform the update operation (deactivate or activate the output type)
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

        // Check if the update was successful
        if (updateResult.modifiedCount === 1) {
            return res.status(200).json({ status: 'Success', message: 'De-Activated/Activated successfully' });
        } else {
            console.error(`De-activation Failed, Please try again`);
            return res.status(401).json({ status: 'Failed', message: 'Something went wrong, Please try again!' });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
};

// 8.Withdrawal Controller
// Controller Function
async function FetchPaymentRequest(req, res) {
    try {
        const db = await database.connectToDatabase();
        if (!db) {
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const usersCollection = db.collection("users");
        const withdrawalCollection = db.collection("withdrawal_details");
        const roleCollection = db.collection("user_roles");

        // Fetch all withdrawal requests
        const withdrawalDetails = await withdrawalCollection.find({}).toArray();
        if (!withdrawalDetails.length) {
            return res.status(404).json({ status: 'Failed', message: 'No withdrawal requests found' });
        }

        // Fetch all user roles once
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

        return res.status(200).json({ status: 'Success', data: results });
    } catch (error) {
        console.error('Error fetching payment request details:', error);
        return res.status(500).json({ status: 'Failed', message: 'Error fetching payment request details' });
    }
}

// Function to update payment request status
const UpdatePaymentRequestStatus = async (req, res) => {
    const {
        _id,
        user_id,
        withdrawal_approved_status,
        withdrawal_approved_by,
        withdrawal_rejected_message = null
    } = req.body;

    if (!_id || !user_id || !withdrawal_approved_status || !withdrawal_approved_by) {
        return res.status(400).json({
            status: 'Failed',
            message: 'Missing required fields: _id, user_id, withdrawal_approved_status, or withdrawal_approved_by'
        });
    }

    try {
        const db = await database.connectToDatabase();
        const withdrawalCollection = db.collection("withdrawal_details");
        const resellerCollection = db.collection("reseller_details");
        const clientCollection = db.collection("client_details");
        const associationCollection = db.collection("association_details");

        const objectId = new ObjectId(_id);
        const withdrawalDetails = await withdrawalCollection.findOne({ _id: objectId });

        if (!withdrawalDetails) {
            return res.status(404).json({ status: 'Failed', message: 'Withdrawal request not found' });
        }

        const identifierMapping = [
            { key: 'reseller_id', collection: resellerCollection, walletField: 'reseller_wallet' },
            { key: 'client_id', collection: clientCollection, walletField: 'client_wallet' },
            { key: 'association_id', collection: associationCollection, walletField: 'association_wallet' }
        ];

        const entityType = identifierMapping.find(type => withdrawalDetails[type.key]);
        if (!entityType) {
            return res.status(400).json({ status: 'Failed', message: 'No valid entity found' });
        }

        const entityId = withdrawalDetails[entityType.key];
        const entityCollection = entityType.collection;
        const walletField = entityType.walletField;

        const entityDetails = await entityCollection.findOne({ [entityType.key]: entityId });
        if (!entityDetails) {
            return res.status(404).json({ status: 'Failed', message: `${entityType.key} not found in respective collection` });
        }

        if (withdrawal_approved_status.toLowerCase() === "completed") {
            const updatedWalletAmount = entityDetails[walletField] - withdrawalDetails.totalWithdrawalAmount;

            if (updatedWalletAmount < 0) {
                return res.status(400).json({ status: 'Failed', message: 'Insufficient balance in wallet' });
            }

            const walletUpdateResult = await entityCollection.updateOne(
                { [entityType.key]: entityId },
                { $set: { [walletField]: updatedWalletAmount } }
            );

            if (walletUpdateResult.modifiedCount === 0) {
                return res.status(500).json({ status: 'Failed', message: 'Failed to update wallet balance' });
            }
        }

        const withdrawal_approved_date = new Date();
        const updateFields = {
            withdrawal_approved_status,
            withdrawal_approved_by,
            withdrawal_approved_date,
            rca_admin_notification_status: "unread",
            withdrawal_rejected_message: withdrawal_approved_status.toLowerCase() === "rejected"
                ? withdrawal_rejected_message || "No reason provided"
                : null
        };

        const updateResult = await withdrawalCollection.updateOne(
            { _id: objectId },
            { $set: updateFields }
        );

        if (updateResult.modifiedCount > 0) {
            return res.status(200).json({ status: 'Success', message: 'Payment request status updated successfully' });
        } else {
            return res.status(400).json({ status: 'Failed', message: 'No changes made or update failed' });
        }

    } catch (error) {
        console.error('Error in UpdatePaymentRequestStatus:', error);
        return res.status(500).json({
            status: 'Failed',
            message: `Internal server error: ${error.message}`
        });
    }
};

// Function to fetch payment request details with unread notification count
async function FetchPaymentNotification(req, res) {
    try {
        const db = await database.connectToDatabase();
        const withdrawalCollection = db.collection("withdrawal_details");
        const usersCollection = db.collection("users");

        // Fetch all withdrawal requests
        const withdrawalDetails = await withdrawalCollection.find({}).toArray();

        if (!withdrawalDetails.length) {
            return res.status(200).json({ status: 'Failed', message: 'No withdrawal requests found' });
        }

        // Count unread notifications
        const unreadNotifications = withdrawalDetails.filter(w => w.superadmin_notification_status === "unread").length;

        // Map over withdrawalDetails and fetch user info for unread notifications
        const results = await Promise.all(withdrawalDetails.map(async (withdrawal) => {
            const user = await usersCollection.findOne({ user_id: withdrawal.user_id });

            let withdrawal_notification = null;
            if (withdrawal.superadmin_notification_status === "unread" && user) {
                withdrawal_notification = {
                    _id: withdrawal._id,
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
        return res.status(500).json({ status: 'Error', message: 'Error fetching payment notification' });
    }
}

// Function to MarkNotificationRead
async function MarkNotificationRead(req, res) {
    const { _id, superadmin_notification_status } = req.body;

    try {
        const db = await database.connectToDatabase();
        const withdrawalCollection = db.collection("withdrawal_details");
        const objectId = new ObjectId(_id);

        const withdrawal = await withdrawalCollection.findOne({ _id: objectId });

        if (!withdrawal) {
            return res.status(404).json({ status: 'Failed', message: 'Notification not found' });
        }

        if (withdrawal.superadmin_notification_status === "read") {
            return res.json({ status: 'Failed', message: 'Notification already marked as read' });
        }

        const updateResult = await withdrawalCollection.updateOne(
            { _id: objectId },
            { $set: { superadmin_notification_status } }
        );

        if (updateResult.modifiedCount > 0) {
            return res.json({ status: 'Success', message: 'Mark notification read successfully' });
        } else {
            return res.json({ status: 'Failed', message: 'No changes made or update failed' });
        }

    } catch (error) {
        console.error('Error in MarkNotificationRead:', error);
        return res.status(500).json({ status: 'Failed', message: `Internal server error: ${error.message}` });
    }
}

// 9.Manage Device & Revenue Report Controller
// Function to fetch specific charger revenue list
const FetchSpecificChargerRevenue = async (req, res) => {
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

        return res.status(200).json({
            status: 'Success',
            revenueData
        });
    } catch (error) {
        console.error('Error in FetchSpecificChargerRevenue controller:', error);
        logger?.error?.(error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error while fetching specific charger revenue'
        });
    }
};

// Function to fetch charger list with all cost with revenue
const FetchChargerListWithAllCostWithRevenue = async (req, res) => {
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

        return res.status(200).json({
            status: 'Success',
            revenueData
        });
    } catch (error) {
        console.error('Error in FetchChargerListWithAllCostWithRevenue controller:', error);
        logger?.error?.(error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error while fetching charger list with all cost and revenue'
        });
    }
};

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
const FetchReportDevice = async (req, res) => {
    try {
        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Fetch all chargers (without any filter)
        const chargers = await devicesCollection.find({}).toArray();

        if (!chargers || chargers.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No chargers found'
            });
        }

        return res.status(200).json({
            status: 'Success',
            data: chargers
        });
    } catch (error) {
        console.error('Error in FetchReportDevice controller:', error);
        logger?.error?.(error); // Log the error if logger exists
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error while fetching chargers'
        });
    }
};

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

    return { fromDate, toDate, status: 200 };
}

// DeviceReport Controller
const DeviceReport = async (req, res) => {
    try {
        const { from_date, to_date, device_id } = req.body;

        // Input validation
        if (!from_date || !to_date || !device_id) {
            console.warn('Missing required parameters in request');
            return res.status(400).json({ message: 'from_date, to_date, and device_id are required!' });
        }

        const db = await database.connectToDatabase();
        const Collection = db.collection('device_session_details');

        const validateDate = validateAndConvertDates(from_date, to_date);
        if (validateDate.status !== 200) {
            return res.status(validateDate.status).json({ message: validateDate.message });
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
            return res.status(404).json({ message: 'No device report found for the given period and device ID!' });
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
        return res.status(200).json({ data: responseData });

    } catch (error) {
        console.error('Error fetching device revenue report data:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// 10.Profile Controller
//FetchUserProfile
const FetchUserProfile = async (req, res) => {
    const { user_id } = req.body;

    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

        // Query to fetch the user by user_id
        const user = await usersCollection.findOne({ user_id: parseInt(user_id) });

        if (!user) {
            return res.status(404).json({ status: 'Failed', message: 'User not found' });
        }

        const { socket, ...sanitizedProfile } = user;

        return res.status(200).json({ status: 'Success', data: sanitizedProfile });

    } catch (error) {
        console.error('Error in FetchUserProfile controller:', error);
        logger?.error?.(error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
};

// UpdateUserProfile
const UpdateUserProfile = async (req, res) => {
    const { user_id, username, phone_no, password, modified_by, status } = req.body;

    try {
        // Input validation
        if (!user_id || !username || !phone_no || !password || !modified_by || typeof status !== 'boolean') {
            return res.status(400).json({ status: 'Failed', message: 'User ID, Username, Phone Number, Password, Modified By, and Status are required' });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

        // Check if user exists
        const existingUser = await usersCollection.findOne({ user_id });
        if (!existingUser) {
            return res.status(404).json({ status: 'Failed', message: 'User not found' });
        }

        // Update user profile
        const updateResult = await usersCollection.updateOne(
            { user_id },
            {
                $set: {
                    username,
                    phone_no,
                    password: parseInt(password),
                    modified_by,
                    modified_date: new Date(),
                    status
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(500).json({ status: 'Failed', message: 'Failed to update user profile' });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'User profile updated successfully',
            data: { user_id, username, phone_no, status }
        });
    } catch (error) {
        console.error('Error in UpdateUserProfile controller:', error);
        logger?.error?.(error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
};


//Vehicle_Model

//Add vehicle

const CreateVehicleModel = async (req, res) => {
  const {
    model,
    type,
    vehicle_company,
    battery_size_kwh,
    charger_type,
    created_by  // new field
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ status: 'Failed', message: 'Vehicle image is required' });
  }

  // Prepend '/uploads/' to the filename before saving
  const vehicle_image = `/uploads/${req.file.filename}`;

  try {
    if (
      !model || !type || !vehicle_company ||
      !battery_size_kwh || !charger_type || !vehicle_image || !created_by
    ) {
      return res.status(400).json({
        status: 'Failed',
        message: 'All fields are required including created_by'
      });
    }

    const db = await database.connectToDatabase();
    const vehicleCollection = db.collection("vehicle_models");

    // Generate next vehicle_id
    const lastVehicle = await vehicleCollection.find().sort({ vehicle_id: -1 }).limit(1).toArray();
    const vehicle_id = lastVehicle.length > 0 ? lastVehicle[0].vehicle_id + 1 : 1;

    const existing = await vehicleCollection.findOne({ vehicle_id });
    if (existing) {
      return res.status(400).json({ status: 'Failed', message: 'Vehicle ID already exists' });
    }

    await vehicleCollection.insertOne({
      vehicle_id,
      model,
      type,
      vehicle_company,
      battery_size_kwh,
      charger_type,
      vehicle_image,  // Now has the '/uploads/' prefix
      status: true,
      created_date: new Date(),
      created_by,         
      modified_date: null,
      modified_by: null,  
    });

    return res.status(201).json({ status: 'Success', message: 'Vehicle model created successfully' });
  } catch (error) {
    console.error('Error in CreateVehicleModel controller:', error);
    return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
  }
};



//Show all Vehicles

const GetAllVehicleModels = async (req, res) => {
    try {
        const db = await database.connectToDatabase();
        const vehicleCollection = db.collection("vehicle_models");

        const vehicles = await vehicleCollection.find({}).toArray();

        return res.status(200).json({ status: 'Success', data: vehicles });
    } catch (error) {
        console.error('Error in GetAllVehicleModels controller:', error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
};

//update the vehicles
const UpdateVehicleModel = async (req, res) => {
  const {
    vehicle_id,
    model,
    type,
    vehicle_company,
    battery_size_kwh,
    charger_type,
    modified_by
  } = req.body;

const vehicle_image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Validate all required fields
    if (
      !vehicle_id || !model || !type || !vehicle_company ||
      !battery_size_kwh || !charger_type || !modified_by
    ) {
      return res.status(400).json({
        status: 'Failed',
        message: 'All fields except image are required including modified_by'
      });
    }

    // Convert vehicle_id to number
    const numericVehicleId = Number(vehicle_id);
    if (isNaN(numericVehicleId)) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Vehicle ID must be a valid number'
      });
    }

    const db = await database.connectToDatabase();
    const vehicleCollection = db.collection("vehicle_models");

    // Find existing vehicle by numeric ID
    const existing = await vehicleCollection.findOne({ vehicle_id: numericVehicleId });
    if (!existing) {
      return res.status(404).json({ status: 'Failed', message: 'Vehicle Id not found' });
    }

    const updateData = {
      model,
      type,
      vehicle_company,
      battery_size_kwh,
      charger_type,
      modified_date: new Date(),
      modified_by,
    };

    if (vehicle_image) {
      updateData.vehicle_image = vehicle_image;
    }

    const updateResult = await vehicleCollection.updateOne(
      { vehicle_id: numericVehicleId },
      { $set: updateData }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(500).json({ status: 'Failed', message: 'Failed to update vehicle model' });
    }

    return res.status(200).json({
      status: 'Success',
      message: 'Vehicle model updated successfully',
      data: {
        vehicle_id: numericVehicleId,
        ...updateData
      }
    });

  } catch (error) {
    console.error('Error in UpdateVehicleModel controller:', error);
    return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
  }
};


const UpdateVehicleModelStatus = async (req, res) => {
  const { vehicle_id, status, modified_by } = req.body;

  try {
    if (!vehicle_id || typeof status !== 'boolean' || !modified_by) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Vehicle ID, status (boolean) and modified_by are required'
      });
    }

    const db = await database.connectToDatabase();
    const vehicleCollection = db.collection("vehicle_models");

    // Use string vehicle_id directly (no parseInt)
    const result = await vehicleCollection.updateOne(
      { vehicle_id: vehicle_id },
      { $set: { status, modified_date: new Date(), modified_by } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Vehicle model not found'
      });
    }

    return res.status(200).json({
      status: 'Success',
      message: `Vehicle model has been ${status ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error in UpdateVehicleModelStatus controller:', error);
    return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
  }
};

module.exports = {
    authenticate, FetchTotalUsers, FetchTotalCharger, FetchOnlineCharger, FetchOfflineCharger, FetchFaultsCharger, FetchChargerTotalEnergy,
    FetchTotalChargersSession, FetchAllocatedChargers, FetchCharger, CreateCharger, UpdateCharger, FetchUnAllocatedChargerToAssgin, fetchConnectorTypeName, DeActivateOrActivateCharger,
    FetchResellersToAssgin, AssginChargerToReseller, FetchResellers, FetchAssignedClients, FetchChargerDetailsWithSession, CreateReseller, UpdateReseller,
    FetchUsers, FetchSpecificUserRoleForSelection, FetchResellerForSelection, CreateUser, UpdateUser, FetchUserRoles, CreateUserRole, UpdateUserRole, DeActivateOrActivateUserRole,
    fetchAllOutputType, updateOutputType, DeActivateOutputType, createOutputType, FetchPaymentRequest, UpdatePaymentRequestStatus, FetchPaymentNotification, MarkNotificationRead,
    FetchSpecificChargerRevenue, FetchChargerListWithAllCostWithRevenue, FetchReportDevice, DeviceReport, FetchUserProfile, UpdateUserProfile,CreateVehicleModel,GetAllVehicleModels,UpdateVehicleModel,UpdateVehicleModelStatus
};
