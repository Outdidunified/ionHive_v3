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
            return res.status(401).json({
                status: 'Failed',
                message: 'Email and Password required'
            });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection('users');
        const associationCollection = db.collection('association_details');

        const user = await usersCollection.findOne({ email_id: email, role_id: 4, status: true });

        if (!user || user.password !== password || user.role_id !== 4) {
            return res.status(401).json({
                status: 'Failed',
                message: 'Invalid credentials or user is deactivated'
            });
        }

        // Fetch association details using association_id and check if the status is true
        const getassociationDetails = await associationCollection.findOne({ association_id: user.association_id, status: true });

        // If association details not found or deactivated, return an error
        if (!getassociationDetails) {
            return res.status(404).json({
                status: 'Failed',
                message: 'Association details not found or deactivated'
            });
        }

        // Generate JWT token
        const token = jwt.sign({ username: user.username }, JWT_SECRET);

        return res.status(200).json({
            status: 'Success',
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
        });

    } catch (error) {
        console.error('Authentication Error:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
};

// 2.Dashboard
// Function to fetch chargers assigned to a specific association
const FetchTotalCharger = async (req, res) => {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const db = await database.connectToDatabase();

        if (!db) {
            console.error("Database connection failed!");
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const chargerCollection = db.collection("charger_details");

        const recentChargers = await chargerCollection.find({
            assigned_association_id: association_id
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
// Controller function
async function FetchOnlineCharger(req, res) {
    try {
        const association_id = req.body.association_id;

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const db = await database.connectToDatabase();

        const chargerCollection = db.collection("charger_details");
        const statusCollection = db.collection("charger_status");

        // Step 1: Get chargers assigned to the association
        const assignedChargers = await chargerCollection.find({
            assigned_association_id: association_id
        }).toArray();

        if (!assignedChargers.length) {
            return res.status(200).json({
                status: 'Success',
                totalCount: 0,
                onlineChargers: [],
                message: "No chargers assigned to this association"
            });
        }

        // Step 2: Extract charger IDs
        const chargerIds = assignedChargers.map(charger => charger.charger_id);
        console.log("Charger IDs assigned to association:", chargerIds);

        // Step 3: Time filter - last 1 hour
        const currentTime = new Date();
        const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);

        // Step 4: Fetch status where chargers are online
        const onlineChargers = await statusCollection.find({
            charger_id: { $in: chargerIds },
            timestamp: { $gte: oneHourAgo },
            error_code: "NoError"
        }).toArray();

        const totalCount = onlineChargers.length;

        if (totalCount === 0) {
            return res.status(200).json({
                status: 'Success',
                totalCount,
                onlineChargers: [],
                message: "No online chargers found in the last hour"
            });
        }

        // Step 5: Sanitize response to remove circular/BSON issues
        const sanitizedOnline = onlineChargers.map(({ charger_id, timestamp, error_code, status }) => ({
            charger_id,
            timestamp,
            error_code,
            status
        }));

        return res.status(200).json({
            status: 'Success',
            totalCount,
            data: sanitizedOnline
        });
    } catch (error) {
        console.error(`Error fetching online charger details:`, error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Failed to fetch online charger details',
            error: error.message
        });
    }
}

// fetch FetchOfflineCharger
async function FetchOfflineCharger(req, res) {
    try {
        const association_id = req.body.association_id;

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const db = await database.connectToDatabase();

        const chargerCollection = db.collection("charger_details");
        const statusCollection = db.collection("charger_status");

        // Get charger IDs assigned to the given association_id
        const assignedChargers = await chargerCollection.find({ assigned_association_id: association_id }).toArray();

        if (!assignedChargers.length) {
            return res.status(200).json({ status: 'Success', totalCount: 0, offlineChargers: [], message: "No chargers assigned to this association" });
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
        }).toArray();

        const totalCount = offlineChargers.length;

        if (totalCount === 0) {
            return res.status(200).json({ status: 'Success', totalCount, offlineChargers: [], message: "No offline chargers found" });
        }

        return res.status(200).json({ status: 'Success', totalCount, data: offlineChargers });
    } catch (error) {
        console.error(`Error fetching offline charger details: ${error}`);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch offline charger details' });
    }
}

// Fetch Faulty Chargers Function
async function FetchFaultsCharger(req, res) {
    try {
        const association_id = req.body.association_id;

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const db = await database.connectToDatabase();

        const chargerCollection = db.collection("charger_details");
        const statusCollection = db.collection("charger_status");

        // Get charger IDs assigned to the given association_id
        const assignedChargers = await chargerCollection.find({ assigned_association_id: association_id }).toArray();

        if (!assignedChargers.length) {
            return res.status(200).json({ status: 'Success', totalCount: 0, faultyChargers: [], message: "No chargers assigned to this association" });
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
            return res.status(200).json({ status: 'Success', totalCount, faultyChargers: [], message: "No faulty chargers found" });
        }

        return res.status(200).json({ status: 'Success', totalCount, data: faultyChargers });
    } catch (error) {
        console.error(`Error fetching faulty charger details: ${error}`);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch faulty charger details' });
    }
}

// Fetch Charger Total Energy Function
async function FetchChargerTotalEnergy(req, res) {
    try {
        const association_id = req.body.association_id;

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const db = await database.connectToDatabase();
        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");

        // Get charger IDs assigned to the given association_id
        const assignedChargers = await chargerCollection.find({ assigned_association_id: association_id }).toArray();

        if (!assignedChargers.length) {
            return res.status(200).json({
                status: 'Success',
                totalEnergyConsumed: 0,
                CO2_from_EV: 0,
                CO2_from_ICE: 0,
                CO2_Savings: 0,
                daytodaytotalEnergyConsumed: [],
                weeklyTotalEnergyConsumed: [],
                monthlyTotalEnergyConsumed: [],
                yearlyTotalEnergyConsumed: [],
                message: "No chargers assigned to this reseller"
            });
        }

        // Extract charger IDs
        const chargerIds = assignedChargers.map(charger => charger.charger_id);
        console.log("Charger IDs assigned to reseller:", chargerIds);

        // Aggregation Stages (as before)...
        // (Add the necessary aggregation logic for day-to-day, weekly, monthly, and yearly energy consumption)

        // Example: Total energy consumption and CO2 calculation
        const totalResult = await sessionCollection.aggregate([
            { $match: { charger_id: { $in: chargerIds }, unit_consummed: { $ne: null } } },
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

        // Return the result
        return res.status(200).json({
            status: 'Success',
            daytodaytotalEnergyConsumed: [], // Include your result data here
            weeklyTotalEnergyConsumed: [], // Include your result data here
            monthlyTotalEnergyConsumed: [], // Include your result data here
            yearlyTotalEnergyConsumed: [], // Include your result data here
            totalEnergyConsumed,
            CO2_from_EV,
            CO2_from_ICE,
            CO2_Savings
        });

    } catch (error) {
        console.error(`Error fetching Charger Total Energy details: ${error}`);
        return res.status(500).json({
            status: 'Failed',
            message: 'Failed to fetch charger total energy details',
        });
    }
}

// Fetch Total Charger Charging Sessions for a Specific association
async function FetchTotalChargersSession(req, res) {
    try {
        const { association_id } = req.body; // Get association_id from request body

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const db = await database.connectToDatabase();
        if (!db) {
            console.error("Database connection failed!");
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");

        // Find all chargers assigned to the given reseller
        const chargers = await chargerCollection.find({ assigned_association_id: association_id }).toArray();

        if (chargers.length === 0) {
            console.log("No chargers found for association_id:", association_id);
            return res.status(404).json({ status: 'Failed', message: 'No chargers found for this association' });
        }

        // Extract charger IDs
        const chargerIds = chargers.map(charger => charger.charger_id);

        // Count total sessions where charger_id matches the found chargers
        const totalCount = await sessionCollection.countDocuments({ charger_id: { $in: chargerIds } });

        return res.status(200).json({
            status: 'Success',
            totalCount
        });
    } catch (error) {
        console.error(`Error fetching charger session count: ${error}`);
        return res.status(500).json({ status: 'Failed', message: 'Error fetching charger session count' });
    }
}

// Fetch Total App Users for a Specific association
async function FetchTotalUsers(req, res) {
    try {
        const { association_id } = req.body; // Get association_id from request body

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const db = await database.connectToDatabase();
        if (!db) {
            console.error("Database connection failed!");
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const usersCollection = db.collection("users");

        // Fetch users assigned to this reseller
        const users = await usersCollection.find({ association_id: association_id }).toArray();

        if (users.length === 0) {
            return res.status(404).json({ status: 'Failed', message: 'No users found for this association' });
        }

        // Count App Users (role_id = 5)
        const appUsersCount = users.filter(user => user.role_id === 5).length;

        return res.status(200).json({
            status: 'Success',
            appUsersCount
        });
    } catch (error) {
        console.error(`Error fetching user counts: ${error}`);
        return res.status(500).json({ status: 'Failed', message: 'Error fetching user counts' });
    }
}

// 3.Manage Device
// Fetch Allocated Charger by client to association
async function FetchAllocatedChargerByClientToAssociation(req, res) {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'Association ID is required' });
        }

        const db = await database.connectToDatabase();
        if (!db) {
            console.error("Database connection failed!");
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const devicesCollection = db.collection("charger_details");
        const configCollection = db.collection("socket_gun_config");
        const financeCollection = db.collection("financeDetails");
        const stationCollection = db.collection("charging_stations");

        // Fetch chargers assigned to the specified association_id
        const chargers = await devicesCollection.find({ assigned_association_id: association_id }).toArray();

        if (chargers.length === 0) {
            return res.status(404).json({ status: 'Failed', message: 'No chargers found for the association' });
        }

        // Fetch finance records based on association_id
        const financeData = await financeCollection.find({ association_id }).toArray();

        // Create a map of finance_id to total price
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
            const assignedStationID = charger.assigned_station_id;

            // Get the correct total price based on finance_id
            const total_price = financeMap[financeID];

            // Fetch connector configuration
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

            // Fetch station details
            let stationDetails = null;
            if (assignedStationID) {
                stationDetails = await stationCollection.findOne({ station_id: assignedStationID });
            }

            // Combine all data
            let chargerData = {
                ...charger,
                connector_details: connectorDetails.length > 0 ? connectorDetails : null,
                unit_price: total_price !== undefined ? total_price : null,
                station_details: stationDetails || null
            };

            results.push(chargerData);
        }

        return res.status(200).json({ status: 'Success', data: results });

    } catch (error) {
        console.error(`Error fetching chargers: ${error.message}`);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch chargers' });
    }
}

//UpdateDevice 
async function UpdateDevice(req, res) {
    const { modified_by, charger_id, charger_accessibility, wifi_username, wifi_password, lat, long, address, landmark } = req.body;

    try {
        // Validate the input for mandatory fields
        if (!modified_by || !charger_id || !charger_accessibility || !lat || !long || !address || !landmark) {
            return res.status(400).json({ status: 'Failed', message: 'All the fields are required' });
        }

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Check if the charger exists
        const existingCharger = await devicesCollection.findOne({ charger_id });
        if (!existingCharger) {
            return res.status(404).json({ status: 'Failed', message: 'ChargerID not found' });
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
            return res.status(500).json({ status: 'Failed', message: 'Failed to update charger' });
        }

        // Return success response
        return res.status(200).json({ status: 'Success', message: 'Charger updated successfully', data: { charger_id, updated: true } });

    } catch (error) {
        console.error('Error updating charger:', error);
        return res.status(error.statusCode || 500).json({ status: 'Failed', message: error.message || 'Internal Server Error' });
    }
}

// DeActivateOrActivateCharger
async function DeActivateOrActivateCharger(req, res) {
    const { modified_by, charger_id, status } = req.body;

    try {
        // Validation
        if (!modified_by || !charger_id || typeof status !== 'boolean') {
            return res.status(400).json({ status: 'Failed', message: 'Username, chargerID, and Status (boolean) are required' });
        }

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        // Check if the charger exists
        const existingCharger = await devicesCollection.findOne({ charger_id });
        if (!existingCharger) {
            return res.status(404).json({ status: 'Failed', message: 'ChargerID not found' });
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
            return res.status(500).json({ status: 'Failed', message: 'Failed to update charger' });
        }

        // Return success data
        return res.status(200).json({ status: 'Success', message: 'Charger updated successfully', data: { charger_id, updated: true, new_status: status } });

    } catch (error) {
        console.error('Error in DeActivateOrActivateCharger:', error);
        return res.status(error.statusCode || 500).json({ status: 'Failed', message: error.message || 'Internal Server Error' });
    }
}


//Manage Station

// POST /addChargingStation
async function addChargingStation(req, res) {
  try {
    const {
      association_id,
      location_id,            
      station_address,
      landmark,
      network,
      availability,
      accessibility,
      latitude,
      longitude,
      charger_type,
      chargers,
      created_by
    } = req.body;

    if (
      !association_id ||
      !location_id ||         
      !station_address ||
      !landmark ||
      !network ||
      !availability ||
      !accessibility ||
      !created_by ||
      latitude === undefined ||
      longitude === undefined ||
      !charger_type
    ) {
      return res.status(400).json({
        status: 'Failed',
        message: 'All fields are required'
      });
    }

    const db = await database.connectToDatabase();
    const stationCollection = db.collection("charging_stations");

    // Generate next station_id
    const lastStation = await stationCollection.find().sort({ station_id: -1 }).limit(1).toArray();
    const station_id = lastStation.length > 0 ? lastStation[0].station_id + 1 : 1;

    // Optional check for concurrency
    const existing = await stationCollection.findOne({ station_id });
    if (existing) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Station ID already exists'
      });
    }

    await stationCollection.insertOne({
      station_id,
      association_id,
      location_id,            // save location_id here
      station_address,
      landmark,
      network,
      availability,
      accessibility,
      latitude,
      longitude,
      charger_type,
      chargers,
      status: true,
      created_by,
      created_at: new Date(),
      modified_by: null,
      modified_at: null,
    });

    return res.status(201).json({
      status: 'Success',
      message: 'Charging station added'
    });

  } catch (err) {
    console.error('Error in addChargingStation controller:', err);
    return res.status(500).json({
      status: 'Failed',
      message: 'Internal server error'
    });
  }
}




// PUT /updateChargingStation
async function updateChargingStation(req, res) {
  try {
    const { station_id, modified_by, location_id, chargers, ...updates } = req.body;

    if (!station_id) {
      return res.status(400).json({ status: 'Failed', message: 'station_id is required' });
    }

    if (!modified_by) {
      return res.status(400).json({ status: 'Failed', message: 'modified_by is required' });
    }

    if (!location_id) {
      return res.status(400).json({ status: 'Failed', message: 'location_id is required' });
    }

    const db = await database.connectToDatabase();
    const stationCollection = db.collection("charging_stations");

    updates.modified_at = new Date();
    updates.modified_by = modified_by;
    updates.location_id = location_id;  // update location_id

    const result = await stationCollection.updateOne(
      { station_id },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ status: 'Failed', message: 'Station not found' });
    }

    return res.status(200).json({ status: 'Success', message: 'Station updated' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'Failed', message: 'Internal server error' });
  }
}




// POST /getStationsByAssociation
async function getStationsByAssociation(req, res) {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const db = await database.connectToDatabase();
        const stationCollection = db.collection("charging_stations");

        const stations = await stationCollection.find({ association_id }).toArray();

        return res.status(200).json({ status: 'Success', data: stations });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'Failed', message: 'Internal server error' });
    }
}

//assign stations to charger 

async function assignChargerToStation(req, res) {
  try {
    const { charger_id, station_id, association_id, modified_by } = req.body;

    if (!charger_id || !station_id || !association_id || !modified_by) {
      return res.status(400).json({
        status: 'Failed',
        message: 'charger_id, station_id, association_id, and modified_by are required',
      });
    }

    const db = await database.connectToDatabase();
    const stationCollection = db.collection("charging_stations");
    const chargerCollection = db.collection("charger_details");

    // Fetch charger
    const charger = await chargerCollection.findOne({ charger_id });
    if (!charger) {
      return res.status(404).json({ status: 'Failed', message: 'Charger not found' });
    }

    // Fetch station
    const station = await stationCollection.findOne({ station_id, association_id });
    if (!station) {
      return res.status(404).json({ status: 'Failed', message: 'Station not found for this association' });
    }

    // Check if charger or station is inactive
    if (charger.status === false) {
      return res.status(403).json({ status: 'Failed', message: 'Cannot assign. Charger is inactive.' });
    }
    if (station.status === false) {
      return res.status(403).json({ status: 'Failed', message: 'Cannot assign. Station is inactive.' });
    }

    // Check if charger is already assigned
    if (charger.assigned_station_id) {
      const existingStation = await stationCollection.findOne({ station_id: charger.assigned_station_id });
      if (existingStation) {
        if (charger.assigned_station_id === station_id) {
          return res.status(200).json({
            status: 'AlreadyAssigned',
            message: 'Charger is already assigned to this station',
          });
        } else {
          return res.status(409).json({
            status: 'AlreadyAssigned',
            message: 'Charger is already assigned to another station',
          });
        }
      } else {
        // The station referenced in assigned_station_id does not exist; proceed with assignment
        await chargerCollection.updateOne(
          { charger_id },
          { $unset: { assigned_station_id: "" } }
        );
      }
    }

    // Assign charger to station
    await stationCollection.updateOne(
      { station_id, association_id },
      {
        $addToSet: { chargers: charger_id },
        $set: { modified_by, modified_at: new Date() },
      }
    );

    // Update charger assignment
    await chargerCollection.updateOne(
      { charger_id },
      {
        $set: {
          assigned_station_id: station_id,
          modified_by,
          modified_at: new Date(),
        },
      }
    );

    return res.status(200).json({
      status: 'Success',
      message: 'Charger successfully assigned to station',
    });
  } catch (err) {
    console.error("Error assigning charger:", err);
    return res.status(500).json({ status: 'Failed', message: 'Internal server error' });
  }
}


async function removeChargerFromStation(req, res) {
  try {
    const { station_id, charger_id, association_id, modified_by } = req.body;

    if (!station_id || !charger_id || !association_id || !modified_by) {
      return res.status(400).json({ status: 'Failed', message: 'Missing required fields' });
    }

    const db = await database.connectToDatabase();
    const stationCollection = db.collection("charging_stations");
    const chargerCollection = db.collection("charger_details");

    // Check if station exists
    const station = await stationCollection.findOne({ station_id, association_id });
    if (!station) {
      return res.status(404).json({ status: 'Failed', message: 'Station not found for this association' });
    }

    // Remove charger_id from the station's chargers array
    await stationCollection.updateOne(
      { station_id, association_id },
      { 
        $pull: { chargers: charger_id },
        $set: { modified_by, modified_at: new Date() }
      }
    );

    // Clear assigned_station_id from the charger
    await chargerCollection.updateOne(
      { charger_id },
      {
        $unset: { assigned_station_id: "" },
        $set: { modified_by, modified_at: new Date() }
      }
    );

    return res.status(200).json({ status: 'Success', message: 'Charger removed from station' });
  } catch (err) {
    console.error("Error removing charger:", err);
    return res.status(500).json({ status: 'Failed', message: 'Internal server error' });
  }
}










// Function to assignFinance details
// Controller assignFinance function
async function assignFinance(req, res) {
    try {
        const { _id, charger_id, finance_id } = req.body;

        // Validate required fields
        if (!_id || !charger_id || !finance_id) {
            return res.status(400).json({
                status: 'Failed',
                message: '_id, charger_id, and finance_id are required'
            });
        }

        // Call the function to assign finance
        const result = await processAssignFinance(_id, charger_id, finance_id);

        // Check the result and return appropriate response
        return res.status(result.status === 'Success' ? 201 : 400).json(result);

    } catch (error) {
        console.error('Error in assignFinance controller:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Failed to assign finance entry'
        });
    }
}

// Function to process the finance assignment
async function processAssignFinance(_id, charger_id, finance_id) {
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
        console.error('Error in processAssignFinance:', error);
        return { status: 'Failed', message: 'Error assigning finance ID' };
    }
}

// Controller reAssignFinance function
async function reAssignFinance(req, res) {
    try {
        const { _id, charger_id, finance_id } = req.body;

        // Validate required fields
        if (!_id || !charger_id || !finance_id) {
            return res.status(400).json({
                status: 'Failed',
                message: '_id, charger_id, and finance_id are required'
            });
        }

        const db = await database.connectToDatabase();
        const chargerCollection = db.collection('charger_details');

        // Validate _id format
        if (!ObjectId.isValid(_id)) {
            return res.status(400).json({ status: 'Failed', message: 'Invalid _id format' });
        }

        // Check if `_id` exists in `charger_details`
        const existingCharger = await chargerCollection.findOne({ _id: new ObjectId(_id) });

        if (!existingCharger) {
            return res.status(400).json({ status: 'Failed', message: 'No record found for the given id' });
        }

        // Check if `_id` contains the given `charger_id`
        if (existingCharger.charger_id !== charger_id) {
            return res.status(400).json({ status: 'Failed', message: 'id and charger_id do not match' });
        }

        // If finance_id is already assigned to the same value, return no change message
        if (existingCharger.finance_id === finance_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'No changes detected, finance_id remains the same'
            });
        }

        // Update finance_id
        const updateResult = await chargerCollection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: { finance_id } }
        );

        if (updateResult.modifiedCount > 0) {
            return res.status(201).json({
                status: 'Success',
                message: 'Finance ID reassigned successfully'
            });
        } else {
            return res.status(500).json({
                status: 'Failed',
                message: 'Failed to reassign finance ID'
            });
        }

    } catch (error) {
        console.error('Error in reAssignFinance:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Error reassigning finance ID'
        });
    }
}

// Controller FetchFinance_dropdown function
async function FetchFinance_dropdown(req, res) {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'association_id is required'
            });
        }

        const db = await database.connectToDatabase();
        const financeCollection = db.collection('financeDetails');

        // Fetch finance records based on association_id
        const financeData = await financeCollection.find({ association_id, status: true }).toArray();

        // If no records are found, return an error message
        if (financeData.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No finance records found for this association_id'
            });
        }

        // Process each finance record to calculate total price
        const processedFinanceData = financeData.map(financeRecord => {
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

            const totalprice = (TotalEBPrice + gstAmount).toFixed(3);

            return { ...financeRecord, totalprice };
        });

        return res.status(200).json({
            status: 'Success',
            data: processedFinanceData,
            length: processedFinanceData.length
        });

    } catch (error) {
        console.error('Error in FetchFinance_dropdown:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Error fetching finance data'
        });
    }
}

// 4.Manage Users
// Controller FetchUsers function
async function FetchUsers(req, res) {
    try {
        const association_id = req.body.association_id;

        if (!association_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Association ID is required'
            });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const rolesCollection = db.collection("user_roles");
        const resellerCollection = db.collection("reseller_details");
        const clientCollection = db.collection("client_details");
        const associationCollection = db.collection("association_details");

        const users = await usersCollection.find({ role_id: { $in: [4, 5] }, association_id }).toArray();

        if (!users || users.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No users found for this association'
            });
        }

        const roleIds = [...new Set(users.map(user => user.role_id))];
        const resellerIds = [...new Set(users.map(user => user.reseller_id))];
        const clientIds = [...new Set(users.map(user => user.client_id))];
        const associationIds = [...new Set(users.map(user => user.association_id))];

        // Fetch roles
        const roles = await rolesCollection.find({ role_id: { $in: roleIds } }).toArray();
        const roleMap = new Map(roles.map(role => [role.role_id, role.role_name]));

        // Fetch resellers
        const resellers = await resellerCollection.find({ reseller_id: { $in: resellerIds } }).toArray();
        const resellerMap = new Map(resellers.map(reseller => [reseller.reseller_id, reseller.reseller_name]));

        // Fetch clients
        const clients = await clientCollection.find({ client_id: { $in: clientIds } }).toArray();
        const clientMap = new Map(clients.map(client => [client.client_id, client.client_name]));

        // Fetch associations
        const associations = await associationCollection.find({ association_id: { $in: associationIds } }).toArray();
        const associationMap = new Map(associations.map(association => [association.association_id, association.association_name]));

        // Attach additional details
        const usersWithDetails = users.map(user => ({
            ...user,
            role_name: roleMap.get(user.role_id) || 'Unknown',
            reseller_name: resellerMap.get(user.reseller_id) || null,
            client_name: clientMap.get(user.client_id) || null,
            association_name: associationMap.get(user.association_id) || null
        }));

        return res.status(200).json({
            status: 'Success',
            data: usersWithDetails,
            length: usersWithDetails.length
        });

    } catch (error) {
        console.error('Error in FetchUsers Controller:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error while fetching users'
        });
    }
}

// Controller UpdateUser function
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

        // Check if user exists
        const existingUser = await Users.findOne({ user_id });
        if (!existingUser) {
            return res.status(404).json({
                status: 'Failed',
                message: 'User not found'
            });
        }

        // Perform update
        const updateResult = await Users.updateOne(
            { user_id },
            {
                $set: {
                    username,
                    phone_no,
                    password: parseInt(password),
                    wallet_bal: wallet_bal ? parseFloat(wallet_bal) : existingUser.wallet_bal,
                    modified_date: new Date(),
                    modified_by,
                    status
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(500).json({
                status: 'Failed',
                message: 'Failed to update user'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'User updated successfully'
        });

    } catch (error) {
        console.error('UpdateUser Controller Error:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// 5.Manage TagID
// Controller FetchAllTagIDs function
async function FetchAllTagIDs(req, res) {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Association ID is required'
            });
        }

        const db = await database.connectToDatabase();
        const tagsCollection = db.collection("tag_id");

        // Fetch tags
        const tags = await tagsCollection.find({ association_id }).toArray();

        if (!tags || tags.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No tags found'
            });
        }

        return res.status(200).json({
            status: 'Success',
            data: tags
        });

    } catch (error) {
        console.error('FetchAllTagIDs Controller Error:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// Controller CreateTagID function
async function CreateTagID(req, res) {
    try {
        const { tag_id, tag_id_expiry_date, association_id } = req.body;

        // Validate required fields
        if (!tag_id || !tag_id_expiry_date) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Tag ID and Expiry Date are required'
            });
        }
        if (!association_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Association ID is required'
            });
        }

        const db = await database.connectToDatabase();
        const tagsCollection = db.collection("tag_id");

        // Check if tag already exists
        const existingTag = await tagsCollection.findOne({ tag_id: tag_id });
        if (existingTag) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Tag ID already exists'
            });
        }

        // Fetch highest id and generate new id
        const lastTag = await tagsCollection.find().sort({ id: -1 }).limit(1).toArray();
        const newId = lastTag.length > 0 ? lastTag[0].id + 1 : 1;

        // Insert new tag
        await tagsCollection.insertOne({
            id: newId,
            association_id: parseInt(association_id),
            tag_id: tag_id,
            tag_id_expiry_date: new Date(tag_id_expiry_date),
            tag_id_assigned: false,
            status: true
        });

        return res.status(200).json({
            status: 'Success',
            message: 'Tag ID successfully created',
            id: newId
        });

    } catch (error) {
        console.error('CreateTagID Controller Error:', error);
        if (logger) {
            logger.error('CreateTagID Controller Error:', error);
        }
        return res.status(500).json({
            status: 'Failed',
            message: 'An error occurred while creating the tag ID'
        });
    }
}

// Controller UpdateTagID function
async function UpdateTagID(req, res) {
    try {
        const { id, tag_id, tag_id_expiry_date, status } = req.body;

        // Validate required fields
        if (!id || (!tag_id && !tag_id_expiry_date && status === undefined)) {
            return res.status(400).json({
                status: 'Failed',
                message: 'ID and at least one field to update are required'
            });
        }

        const db = await database.connectToDatabase();
        const tagsCollection = db.collection("tag_id");

        // Check if tag exists
        const tag = await tagsCollection.findOne({ id: id });
        if (!tag) {
            return res.status(404).json({
                status: 'Failed',
                message: 'Tag ID not found'
            });
        }

        // Check for duplicate tag_id if updating tag_id
        if (tag_id) {
            const duplicateTag = await tagsCollection.findOne({
                tag_id: tag_id,
                id: { $ne: id }
            });
            if (duplicateTag) {
                return res.status(400).json({
                    status: 'Failed',
                    message: 'Tag ID already exists'
                });
            }
        }

        // Prepare fields to update
        const updateData = {};
        if (tag_id) updateData.tag_id = tag_id;
        if (tag_id_expiry_date) updateData.tag_id_expiry_date = new Date(tag_id_expiry_date);
        if (status !== undefined) updateData.status = status;

        const result = await tagsCollection.updateOne(
            { id: id },
            { $set: updateData }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                status: 'Failed',
                message: 'No changes made to the Tag ID'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'Tag ID successfully updated'
        });

    } catch (error) {
        console.error('UpdateTagID Controller Error:', error);
        if (logger) {
            logger.error('UpdateTagID Controller Error:', error);
        }
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// Controller DeactivateOrActivateTagID function
async function DeactivateOrActivateTagID(req, res) {
    try {
        const { id, status } = req.body;

        // Validate required fields
        if (!id || typeof status !== 'boolean') {
            return res.status(400).json({
                status: 'Failed',
                message: 'ID and valid status (true/false) are required'
            });
        }

        const db = await database.connectToDatabase();
        const tagsCollection = db.collection("tag_id");

        // Check if tag exists
        const tag = await tagsCollection.findOne({ id: id });
        if (!tag) {
            return res.status(404).json({
                status: 'Failed',
                message: 'Tag ID not found'
            });
        }

        // Update tag status
        const result = await tagsCollection.updateOne(
            { id: id },
            { $set: { status: status } }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                status: 'Failed',
                message: 'No changes made to the Tag ID status'
            });
        }

        // Fetch updated tag
        const updatedTag = await tagsCollection.findOne({ id: id });

        return res.status(200).json({
            status: 'Success',
            message: 'Tag ID status successfully updated',
            data: updatedTag
        });

    } catch (error) {
        console.error('DeactivateOrActivateTagID Controller Error:', error);
        if (logger) {
            logger.error('DeactivateOrActivateTagID Controller Error:', error);
        }
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// 6.Assign User
// Controller FetchUsersWithSpecificRolesToUnAssign function
async function FetchUsersWithSpecificRolesToUnAssign(req, res) {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Association ID is required'
            });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

        const users = await usersCollection.aggregate([
            {
                $match: {
                    role_id: { $nin: [1, 2, 3, 4] }, // Exclude roles 1-4
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

        if (!users || users.length === 0) {
            return res.status(200).json({
                status: 'Success',
                message: 'No users found',
                data: []
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'Users fetched successfully',
            data: users
        });

    } catch (error) {
        console.error('Error in FetchUsersWithSpecificRolesToUnAssign:', error);
        if (logger) {
            logger.error('Error in FetchUsersWithSpecificRolesToUnAssign:', error);
        }
        return res.status(500).json({
            status: 'Failed',
            message: error.message || 'Internal Server Error'
        });
    }
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

// Controller AssignTagIdToUser function
async function AssignTagIdToUser(req, res) {
    try {
        const { user_id, tag_id, modified_by } = req.body;

        if (!user_id || !tag_id || !modified_by) {
            return res.status(400).json({
                status: 'Failed',
                message: 'All fields are required'
            });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const tagIdCollection = db.collection("tag_id");

        const existingUser = await usersCollection.findOne({ user_id: user_id, status: true });
        if (!existingUser) {
            return res.status(404).json({
                status: 'Failed',
                message: 'User with these details does not exist/Deactivated'
            });
        }

        const existingTagId = await tagIdCollection.findOne({ tag_id: tag_id, status: true });
        if (!existingTagId) {
            return res.status(404).json({
                status: 'Failed',
                message: 'Tag ID does not exist or is not active'
            });
        }

        // Unassign old tag from user if present
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
            return res.status(500).json({
                status: 'Failed',
                message: 'Failed to assign tag ID to user'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'Tag ID assigned successfully to user'
        });

    } catch (error) {
        console.error('Error in AssignTagIdToUser:', error);
        return res.status(500).json({
            status: 'Failed',
            message: error.message || 'Internal Server Error'
        });
    }
}

// Controller FetchTagIdToAssign function
async function FetchTagIdToAssign(req, res) {
    try {
        const { association_id, user_id } = req.body;

        if (!association_id) {
            return res.status(400).json({
                status: 'Failed',
                message: 'Association ID is required'
            });
        }

        const db = await database.connectToDatabase();
        const tagsCollection = db.collection("tag_id");

        const tags = await tagsCollection.find({
            association_id: association_id,
            tag_id_assigned: false,
            status: true
        }).toArray();

        if (!tags || tags.length === 0) {
            return res.status(404).json({
                status: 'Failed',
                message: 'No tags found'
            });
        }

        return res.status(200).json({
            status: 'Success',
            data: tags
        });

    } catch (error) {
        console.error('Error in FetchTagIdToAssign:', error);
        return res.status(500).json({
            status: 'Failed',
            message: error.message || 'Internal Server Error'
        });
    }
}

// Controller function for RemoveUserFromAssociation
async function RemoveUserFromAssociation(req, res) {
    try {
        const { user_id, association_id, modified_by } = req.body;

        if (!user_id || !association_id || !modified_by) {
            return res.status(400).json({
                status: 'Failed',
                message: 'User ID, association_id, and Modified By are required'
            });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const tagCollection = db.collection("tag_id");

        const user = await usersCollection.findOne({ user_id: user_id, assigned_association: association_id });

        if (!user) {
            return res.status(404).json({
                status: 'Failed',
                message: 'User does not exist'
            });
        }

        if (user.tag_id !== null) {
            const tagResult = await tagCollection.updateOne(
                { id: user.tag_id },
                { $set: { tag_id_assigned: false } }
            );
            if (tagResult.modifiedCount === 0) {
                return res.status(500).json({
                    status: 'Failed',
                    message: 'Failed to remove tag id assigned'
                });
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
            return res.status(500).json({
                status: 'Failed',
                message: 'Failed to remove user from association'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'User successfully removed from association'
        });

    } catch (error) {
        console.error(`Error removing user from association: ${error}`);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error'
        });
    }
}

// 7.Manage Finance
// Function to Create Finance Entry
async function createFinance(req, res) {
    const { eb_charge, margin, gst, parking_fee, convenience_fee, station_fee, processing_fee, service_fee, association_id, created_by } = req.body;

    try {
        // Validate required fields
        if (!eb_charge || !gst || !association_id || !created_by) {
            return res.status(400).json({ status: 'Failed', message: 'eb_charge, gst, created_by, and association_id are required' });
        }

        // Auto-increment finance_id and create finance object
        const db = await database.connectToDatabase();
        const financeCollection = db.collection('financeDetails');

        const financeCount = await financeCollection.countDocuments();
        const finance_id = financeCount + 1;

        const newFinance = {
            finance_id,
            eb_charge: eb_charge.toString(),
            margin: margin.toString(),
            gst: gst.toString(),
            parking_fee: parking_fee.toString(),
            convenience_fee: convenience_fee.toString(),
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
            return res.status(201).json({ status: 'Success', message: 'Finance details saved successfully', data: newFinance });
        } else {
            return res.status(500).json({ status: 'Failed', message: 'Failed to save finance details' });
        }

    } catch (error) {
        console.error('Error in createFinance:', error);
        return res.status(500).json({ status: 'Failed', message: 'Error saving finance details' });
    }
}

// Function to Fetch Finance by Association ID
async function fetchFinance(req, res) {
    const { association_id } = req.body;

    try {
        // Validate required fields
        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const db = await database.connectToDatabase();
        const financeCollection = db.collection('financeDetails');

        // Fetch finance records based on association_id
        const financeData = await financeCollection.find({ association_id }).toArray();

        // If no records are found, return an error message
        if (financeData.length === 0) {
            return res.status(404).json({ status: 'Failed', message: 'No finance records found for this association_id' });
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

        return res.status(200).json({ status: 'Success', data: processedFinanceData, length: financeData.length });

    } catch (error) {
        console.error('Error in fetchFinance:', error);
        return res.status(500).json({ status: 'Failed', message: 'Error fetching finance data' });
    }
}

// Function to Update Finance Entry (Validate _id & association_id)
async function updateFinance(req, res) {
    let {
        _id, finance_id, eb_charge, margin, gst, parking_fee, convenience_fee,
        station_fee, processing_fee, service_fee, association_id, status, modified_by
    } = req.body;

    try {
        // Validate required fields
        if (!_id || !finance_id || !eb_charge || !gst || !association_id || !modified_by) {
            return res.status(400).json({
                status: 'Failed',
                message: '_id, finance_id, eb_charge, gst, modified_by, and association_id are required'
            });
        }

        // Validate _id format
        if (!ObjectId.isValid(_id)) {
            return res.status(400).json({ status: 'Failed', message: 'Invalid _id format' });
        }

        const db = await database.connectToDatabase();
        const financeCollection = db.collection('financeDetails');

        const parsedFinanceId = parseInt(finance_id);
        const parsedAssociationId = parseInt(association_id);

        // Check if _id exists and matches the given finance_id
        const existingFinance = await financeCollection.findOne({ _id: new ObjectId(_id) });

        if (!existingFinance) {
            return res.status(404).json({ status: 'Failed', message: 'No record found for the given _id' });
        }

        if (parseInt(existingFinance.finance_id) !== parsedFinanceId) {
            return res.status(400).json({ status: 'Failed', message: 'finance_id does not match the record associated with _id' });
        }

        // Convert fields to correct types
        const updatedData = {
            eb_charge: (eb_charge ?? "").toString(),
            margin: (margin ?? "").toString(),
            gst: (gst ?? "").toString(),
            parking_fee: (parking_fee ?? "").toString(),
            convenience_fee: (convenience_fee ?? "").toString(),
            station_fee: (station_fee ?? "").toString(),
            processing_fee: (processing_fee ?? "").toString(),
            service_fee: (service_fee ?? "").toString(),
            association_id: parsedAssociationId,
            status: status === "true" || status === true,
            modified_by,
            modified_date: new Date().toISOString()
        };

        // Perform the update
        const updateResult = await financeCollection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: updatedData }
        );

        if (updateResult.modifiedCount > 0) {
            return res.status(200).json({ status: 'Success', message: 'Finance details updated successfully' });
        } else {
            return res.status(200).json({ status: 'Success', message: 'No changes detected, but update request was successful' });
        }

    } catch (error) {
        console.error('Error in updateFinance:', error);
        return res.status(500).json({ status: 'Failed', message: 'Error updating finance details' });
    }
}

// 8.Withdraw
// Fetch Commission Amount Association
async function FetchCommissionAmtAssociation(req, res) {
    const { user_id } = req.body;

    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const associationsCollection = db.collection("association_details");

        // Fetch the user with the specified user_id
        const user = await usersCollection.findOne({ user_id: user_id });

        if (!user) {
            return res.status(404).json({ status: 'Failed', message: 'User not found' });
        }

        // Extract association_id from the user object
        const associationId = user.association_id;

        if (!associationId) {
            return res.status(404).json({ status: 'Failed', message: 'Association ID not found for this user' });
        }

        // Fetch the association with the specified association_id
        const association = await associationsCollection.findOne({ association_id: associationId });

        if (!association) {
            return res.status(404).json({ status: 'Failed', message: 'Association not found' });
        }

        // Extract association_wallet from association object
        const associationWallet = association.association_wallet;

        return res.status(200).json({ status: 'Success', data: associationWallet }); // Return status and data

    } catch (error) {
        console.error(`Error fetching association wallet balance: ${error}`);
        logger.error(`Error fetching association wallet balance: ${error}`);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' }); // Return status and message
    }
}

// Controller to save user bank details
async function saveUserBankDetails(req, res) {
    try {
        const { accountHolderName, bankName, accountNumber, ifscNumber, created_by, user_id } = req.body;

        // Validate input
        if (!accountHolderName || !bankName || !accountNumber || !ifscNumber || !created_by || !user_id) {
            return res.status(400).json({ status: 'Failed', message: 'All bank details are required' });
        }

        const db = await database.connectToDatabase();
        const BankDetails = db.collection("bank_details");

        // Check if bank details already exist for the user
        const existingUserBankDetails = await BankDetails.findOne({ user_id });
        if (existingUserBankDetails) {
            return res.status(400).json({ status: 'Failed', message: 'User already has bank details registered' });
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

        return res.status(201).json({ status: 'Success', message: 'Bank details saved successfully' });

    } catch (error) {
        console.error('Error saving bank details:', error);
        logger.error(error); // Assumes a logger utility is available
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// Controller to fetch user bank details
async function fetchUserBankDetails(req, res) {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ status: 'Failed', message: 'User ID is required' });
        }

        const db = await database.connectToDatabase();
        const Users = db.collection("users");
        const BankDetails = db.collection("bank_details");

        // Check if user exists
        const user = await Users.findOne({ user_id });
        if (!user) {
            return res.status(404).json({ status: 'Failed', message: 'No user found' });
        }

        // Fetch bank details for the user
        const bankDetails = await BankDetails.findOne({ user_id });
        if (!bankDetails) {
            return res.status(404).json({ status: 'Failed', message: 'No bank details found for this user' });
        }

        return res.status(200).json({ status: 'Success', message: 'Success', data: bankDetails });

    } catch (error) {
        console.error('Error fetching bank details:', error);
        logger.error(error); // Assumes a logger utility is available
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// Controller: updateUserBankDetails
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
            return res.status(400).json({ status: 'Failed', message: 'No changes made to bank details' });
        }

        return res.status(200).json({ status: 'Success', message: 'Bank details updated successfully' });

    } catch (error) {
        console.error('Error updating bank details:', error);
        logger.error(error); // Assumes a logger utility is available
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// Function to Apply Withdrawal
async function ApplyWithdrawal(req, res) {
    try {
        const { user_id, withdrawalAmount, accountHolderName, accountNumber, bankName, withdrawal_req_by, ifscNumber } = req.body;

        if (!user_id || !withdrawalAmount || !accountHolderName || !accountNumber || !bankName || !withdrawal_req_by || !ifscNumber) {
            return res.status(400).json({ status: 'Failed', message: 'Missing required fields' });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const associationCollection = db.collection("association_details");
        const bankDetailsCollection = db.collection("bank_details");
        const withdrawalCollection = db.collection("withdrawal_details");

        // Check if user exists
        const user = await usersCollection.findOne({ user_id });
        if (!user) return res.status(404).json({ status: 'Failed', message: 'User not found' });

        // Check if association exists
        const association = await associationCollection.findOne({ association_id: user.association_id });
        if (!association) return res.status(404).json({ status: 'Failed', message: 'Association not found' });

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
            superadmin_notification_status: "unread"
        };

        await withdrawalCollection.insertOne(withdrawalData);

        return res.status(200).json({ status: 'Success', message: 'Withdrawal request submitted successfully. Your payment will be processed soon.' });

    } catch (error) {
        console.error('Error processing withdrawal request:', error);
        return res.status(500).json({ status: 'Failed', message: 'Error processing withdrawal request' });
    }
}

// Function to Fetch Payment Request Details
async function FetchPaymentRequest(req, res) {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ status: 'Failed', message: 'user_id is required' });
        }

        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");
        const associationCollection = db.collection("association_details");
        const withdrawalCollection = db.collection("withdrawal_details");

        // Fetch user details
        const user = await usersCollection.findOne({ user_id });
        if (!user) {
            return res.status(404).json({ status: 'Failed', message: 'User not found' });
        }

        // If user has an association_id, fetch association details
        let associationData = null;
        if (user.association_id) {
            associationData = await associationCollection.findOne({ association_id: user.association_id });
        }

        // Fetch all withdrawal details related to user_id
        const withdrawalDetails = await withdrawalCollection.find({ user_id }).toArray();

        // Return all the fetched data
        return res.status(200).json({
            status: 'Success',
            user,
            associationData,
            withdrawalDetails
        });
    } catch (error) {
        console.error('Error fetching payment request details:', error);
        return res.status(500).json({ status: 'Failed', message: 'Error fetching payment request details' });
    }
}

// Function to Fetch Payment Notification with Unread Notification Count
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

        return res.status(200).json({
            status: 'Success',
            data: results
        });

    } catch (error) {
        console.error('Error fetching payment notification:', error);
        return res.status(500).json({ status: 'Failed', message: 'Error fetching payment notification' });
    }
}

// Function to Mark Notification as Read
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

        // Check if the notification is already marked as "read"
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
            return res.status(400).json({ status: 'Failed', message: 'Failed to mark notification as read' });
        }

    } catch (error) {
        console.error('Error in MarkNotificationRead function:', error);
        return res.status(500).json({ status: 'Failed', message: `Internal server error: ${error.message}` });
    }
}

// 9.Manage Report
// Fetch Report Device Function
async function FetchReportDevice(req, res) {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'Association ID is required.' });
        }

        const db = await database.connectToDatabase();
        const devicesCollection = db.collection("charger_details");

        const chargers = await devicesCollection.find({ assigned_association_id: association_id }).toArray();

        if (chargers.length === 0) {
            return res.status(404).json({ status: 'Failed', message: 'No chargers found for this Association ID.' });
        }

        return res.status(200).json({ status: 'Success', data: chargers });

    } catch (error) {
        console.error(`Error fetching chargers: ${error}`);
        return res.status(500).json({ status: 'Failed', message: 'Failed to fetch chargers.' });
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

// DeviceReport function
async function DeviceReport(req, res) {
    try {
        const { from_date, to_date, device_id } = req.body;

        // Validate the request parameters
        if (!from_date || !to_date || !device_id) {
            console.log('Missing required parameters in request');
            return res.status(400).json({ status: 'Failed', message: 'from_date, to_date, and device_id are required!' });
        }

        const db = await database.connectToDatabase();
        const Collection = db.collection('device_session_details');

        // Validate the dates
        const validateDate = validateAndConvertDates(from_date, to_date);
        if (validateDate.status !== 200) {
            return res.status(validateDate.status).json({ status: 'Failed', message: validateDate.message });
        }

        // Fetch sessions from the database
        const sessions = await Collection.find({
            charger_id: device_id,
            stop_time: {
                $gte: validateDate.fromDate.toISOString(),
                $lte: validateDate.toDate.toISOString()
            }
        }).sort({ stop_time: -1 }).toArray();

        // If no sessions found, return an error
        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ status: 'Failed', message: 'No device report found for the given period and device ID!' });
        }

        // Calculate total revenue and KWH
        const totalRevenue = sessions.reduce((sum, session) => sum + Number(session.price || 0), 0);
        const totalKWH = sessions.reduce((sum, session) => sum + parseFloat(session.unit_consummed || 0), 0);

        // Prepare response data
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
        return res.status(200).json({ status: 'Success', data: responseData });

    } catch (error) {
        console.error('Error fetching device revenue report data:', error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// FetchSpecificChargerRevenue function
async function FetchSpecificChargerRevenue(req, res) {
    try {
        const { association_id } = req.body;

        // Validate the request parameters
        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const db = await database.connectToDatabase();
        if (!db) {
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");

        // Convert association_id to Integer (to match MongoDB data type)
        const associationId = parseInt(association_id);

        // Fetch chargers assigned to this association
        const chargers = await chargerCollection.find({ assigned_association_id: associationId }).toArray();
        console.log("Chargers found:", chargers);

        if (!chargers.length) {
            return res.status(200).json({
                status: "Success",
                message: "No chargers found for this client",
                revenueData: [],
                TotalChargerRevenue: "0.000"
            });
        }

        let TotalChargerRevenue = 0; // Initialize total revenue

        const revenueData = await Promise.all(chargers.map(async (charger) => {
            // Fetch session revenue details for each charger
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

        return res.status(200).json({
            status: 'Success',
            revenueData,
            TotalChargerRevenue: TotalChargerRevenue.toFixed(3) // Return total revenue across all chargers
        });

    } catch (error) {
        console.error(`Error fetching specific charger revenue: ${error.message}`);
        return res.status(500).json({ status: 'Failed', message: 'Error fetching specific charger revenue' });
    }
}

// FetchChargerListWithAllCostWithRevenue function
async function FetchChargerListWithAllCostWithRevenue(req, res) {
    try {
        const { association_id } = req.body;

        // Validate request input
        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const db = await database.connectToDatabase();
        if (!db) {
            return res.status(500).json({ status: 'Failed', message: 'Database connection failed' });
        }

        const chargerCollection = db.collection("charger_details");
        const sessionCollection = db.collection("device_session_details");

        const associationId = parseInt(association_id);

        // Fetch chargers
        const chargers = await chargerCollection.find({ assigned_association_id: associationId }).toArray();

        if (!chargers.length) {
            return res.status(200).json({
                status: "Success",
                message: "No chargers found for this association",
                revenueData: [],
            });
        }

        // Generate revenue data per charger
        const revenueData = await Promise.all(chargers.map(async (charger) => {
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

        return res.status(200).json({
            status: 'Success',
            revenueData,
        });

    } catch (error) {
        console.error('Error in FetchChargerListWithAllCostWithRevenue:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Error fetching charger list with cost and revenue'
        });
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
// FetchUserProfile function
async function FetchUserProfile(req, res) {
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
            return res.status(404).json({ status: 'Failed', message: 'User not found' });
        }

        const userProfile = result[0];

        return res.status(200).json({
            status: 'Success',
            data: userProfile
        });

    } catch (error) {
        console.error(`Error fetching user: ${error}`);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
}

// Controller: UpdateUserProfile
async function UpdateUserProfile(req, res) {
    const { user_id, username, phone_no, password } = req.body;

    // Validate the input
    if (!user_id || !username || !phone_no || !password) {
        return res.status(400).json({ status: 'Failed', message: 'User ID, Username, Phone Number, and Password are required' });
    }

    try {
        const db = await database.connectToDatabase();
        const usersCollection = db.collection("users");

        // Check if the user exists
        const existingUser = await usersCollection.findOne({ user_id: user_id });
        if (!existingUser) {
            return res.status(404).json({ status: 'Failed', message: 'User not found' });
        }

        // Update the user profile
        const updateResult = await usersCollection.updateOne(
            { user_id: user_id },
            {
                $set: {
                    username,
                    phone_no,
                    password: parseInt(password),
                    modified_by: username,
                    modified_date: new Date(),
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(500).json({ status: 'Failed', message: 'Failed to update user profile' });
        }

        return res.status(200).json({ status: 'Success', message: 'User profile updated successfully' });

    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ status: 'Failed', message: error.message || 'Internal Server Error' });
    }
}

// Controller: UpdateAssociationProfile
async function UpdateAssociationProfile(req, res) {
    const { association_id, modified_by, association_phone_no, association_address } = req.body;

    // Validate required fields
    if (!association_id || !modified_by || !association_phone_no ) {
        return res.status(400).json({ status: 'Failed', message: 'Association ID, Modified By, Phone Number, are required' });
    }

    try {
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
            return res.status(404).json({ status: 'Failed', message: 'Association not found' });
        }

        if (updateResult.modifiedCount === 0) {
            return res.status(400).json({ status: 'Failed', message: 'No changes made to association profile' });
        }

        return res.status(200).json({ status: 'Success', message: 'Association profile updated successfully' });

    } catch (error) {
        console.error('Error updating association profile:', error);
        return res.status(500).json({ status: 'Failed', message: error.message || 'Internal Server Error' });
    }
}

module.exports = {
    authenticate, FetchTotalCharger, FetchOnlineCharger, FetchOfflineCharger, FetchFaultsCharger, FetchChargerTotalEnergy, FetchTotalChargersSession, FetchTotalUsers,
    FetchAllocatedChargerByClientToAssociation, UpdateDevice, DeActivateOrActivateCharger, assignFinance, reAssignFinance, FetchFinance_dropdown,
    FetchUsers, UpdateUser, FetchAllTagIDs, CreateTagID, UpdateTagID, DeactivateOrActivateTagID,
    FetchUsersWithSpecificRolesToUnAssign, AddUserToAssociation, AssignTagIdToUser, FetchTagIdToAssign, RemoveUserFromAssociation, createFinance, fetchFinance, updateFinance,
    FetchReportDevice, DeviceReport, FetchSpecificChargerRevenue, FetchChargerListWithAllCostWithRevenue,
    FetchCommissionAmtAssociation, saveUserBankDetails, fetchUserBankDetails, updateUserBankDetails, ApplyWithdrawal, FetchPaymentRequest, FetchPaymentNotification, MarkNotificationRead,
    FetchUserProfile, UpdateUserProfile, UpdateAssociationProfile,addChargingStation,getStationsByAssociation,updateChargingStation,assignChargerToStation,removeChargerFromStation
};