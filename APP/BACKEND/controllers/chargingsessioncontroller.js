const db_conn = require('../config/db');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const { wsConnections, uniqueKey, TagID } = require('../data/MapModules');

let db;
const initializeDB = async () => {
    if (!db) {
        db = await db_conn.connectToDatabase();
    }
    return db;
};
initializeDB(); // Initialize the DB connection once


// MANAGE LAST STATUS
const fetchLastStatus = async (req, res) => {
    const { charger_id, connector_id, connector_type, email_id, user_id } = req.body;

    try {
        // Validate input types
        if (typeof charger_id !== 'string' || !Number.isInteger(connector_type) || !Number.isInteger(connector_id) || !user_id || isNaN(user_id) || !email_id || typeof email_id !== 'string' || email_id.trim() === '') {
            return res.status(400).json({
                error: true,
                message: 'Invalid input types: charger_id must be a string, connector_id must be an integer, connector_type must be a initeger.',
            });
        }


        if (!db) {
            logger.loggerError('Database connection failed.');
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

        const latestStatus = await db.collection('charger_status').findOne({
            charger_id: charger_id,
            connector_id: connector_id,
            connector_type: connector_type
        });

        const fetchCapacity = await db.collection('charger_details').findOne({ charger_id: charger_id });

        if (!fetchCapacity) {
            return res.status(404).json({
                error: true,
                message: `ChargerID - ${charger_id} not found in charger_details`
            });
        }

        const convertedCapacity = fetchCapacity.max_power / 1000;

        if (latestStatus) {
            const responseData = {
                charger_id: latestStatus.charger_id,
                connector_id: latestStatus.connector_id,
                connector_type: latestStatus.connector_type,
                charger_status: latestStatus.charger_status,
                timestamp: latestStatus.timestamp,
                error_code: latestStatus.error_code,
                ChargerCapacity: convertedCapacity
            };
            logger.loggerSuccess(`ChargerID: ${charger_id}, ConnectorID: ${connector_id} - Last status fetched successfully`);
            return res.status(200).json({
                error: false,
                message: 'Last status fetched successfully',
                data: responseData,
            });
        } else {
            logger.loggerWarn(`ChargerID: ${charger_id}, ConnectorID: ${connector_id} - No last status found`);
            return res.status(404).json({
                error: true,
                message: `ChargerID - ${charger_id}, ConnectorID - ${connector_id} No last data found`
            });
        }
    } catch (error) {
        logger.loggerError(`Error in fetchLastStatus: ChargerID: ${charger_id}, ConnectorID: ${connector_id} - ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error_details: error.message
        });
    }
};

// Function to generate a random Tag ID
async function generateTagID() {
    const prefix = 'T'; // Single character prefix to ensure the total length is 7
    const randomNum = Math.floor(Math.random() * 1000000); // Generates a random number up to 6 digits
    const tagId = `${prefix}${randomNum.toString().padStart(6, '0')}`; // Combine and pad to ensure 7 characters

    return tagId;
}

// START CHARGER
const startCharger = async (req, res) => {
    const { charger_id, user_id, connector_id, connector_type, email_id } = req.body;

    try {
        // Validate required fields
        if (!charger_id || !connector_id || !connector_type) {
            logger.loggerWarn(`Missing required parameters for startCharger: id=${charger_id}, connector_id=${connector_id}, connector_type=${connector_type}`);
            return res.status(400).json({
                error: true,
                message: 'Charger ID, Connector ID, and Connector Type are required.'
            });
        }

        // Validate user if user_id and email_id are provided
        if (user_id && email_id) {
            if (!db) {
                logger.loggerError('Database connection failed.');
                return res.status(500).json({
                    error: true,
                    message: 'Database connection failed. Please try again later.',
                });
            }

            const usersCollection = db.collection('users');
            const user = await usersCollection.findOne({ user_id: Number(user_id), email_id });

            if (!user) {
                logger.loggerWarn(`User ID: ${user_id}, Email: ${email_id} - User not found`);
                return res.status(404).json({
                    error: true,
                    message: 'User not found.'
                });
            }
        }

        const wsToSendTo = wsConnections.get(charger_id);

        if (!wsToSendTo) {
            logger.loggerWarn(`WebSocket client not found for charger ID: ${charger_id}`);
            return res.status(404).json({
                error: true,
                message: `Charger ID not available in the WebSocket client for device ID: ${charger_id}`
            });
        }

        // Generate unique ID for this transaction
        const uniqueId = uuidv4();
        uniqueKey.set(charger_id, uniqueId);
        const Key = uniqueKey.get(charger_id);

        // Generate tag ID
        const tagId = await generateTagID();
        TagID.set(charger_id, tagId);
        const Tag_ID = TagID.get(charger_id);

        // Generate the field names for the connector
        const connectorTagIdField = `tag_id_for_connector_${connector_id}`;
        const connectorTagIdInUseField = `tag_id_for_connector_${connector_id}_in_use`;
        const connectorUserField = `current_or_active_user_for_connector_${connector_id}`;

        // Create remote start request
        const remoteStartRequest = [2, Key, "RemoteStartTransaction", {
            "connectorId": Number(connector_id),
            "idTag": Tag_ID
        }];

        // Send the request to the WebSocket
        wsToSendTo.send(JSON.stringify(remoteStartRequest));
        logger.loggerInfo(`RemoteStartRequest sent: ${JSON.stringify(remoteStartRequest)}`);

        // Update the charger details in the database
        const chargerDetailsCollection = db.collection('charger_details');
        const updateResult = await chargerDetailsCollection.updateOne(
            { charger_id: charger_id },
            {
                $set: {
                    [connectorTagIdField]: tagId,
                    [connectorTagIdInUseField]: false,
                    [connectorUserField]: email_id || user_id // Store the user identifier
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            logger.loggerWarn(`Charger ID: ${charger_id} not found in the charger_details table.`);
            return res.status(404).json({
                error: true,
                message: 'Charger ID not found in the charger_details table.'
            });
        } else if (updateResult.modifiedCount === 0) {
            logger.loggerWarn(`Failed to update the charger details with the tag ID for Charger ID: ${charger_id}`);
            return res.status(500).json({
                error: true,
                message: 'Failed to update the charger details with the tag ID.'
            });
        }

        logger.loggerSuccess(`StartCharger message sent to the WebSocket client for device ID: ${charger_id}, Connector ID: ${connector_id}, Connector Type: ${connector_type}`);
        return res.status(200).json({
            error: false,
            message: `StartCharger message sent to the WebSocket client for device ID: ${charger_id}, Connector ID: ${connector_id}, Connector Type: ${connector_type}`
        });
    } catch (error) {
        logger.loggerError(`Error in startCharger: ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error_details: error.message
        });
    }
};

// STOP CHARGER
const stopCharger = async (req, res) => {
    const { charger_id, connector_id } = req.body;

    try {
        // Validate required fields
        if (!charger_id || !connector_id) {
            logger.loggerWarn(`Missing required parameters for stopCharger: id=${charger_id}, connector_id=${connector_id}`);
            return res.status(400).json({
                error: true,
                message: 'Charger ID and Connector ID are required.'
            });
        }

        const wsToSendTo = wsConnections.get(charger_id);

        if (!wsToSendTo) {
            logger.loggerWarn(`WebSocket client not found for charger ID: ${charger_id}`);
            return res.status(404).json({
                error: true,
                message: `Charger ID not available in the WebSocket client for device ID: ${charger_id}`
            });
        }

        // Generate unique ID for this transaction
        const uniqueId = uuidv4();
        uniqueKey.set(charger_id, uniqueId);
        const Key = uniqueKey.get(charger_id);

        // Get the transaction ID from the database
        if (!db) {
            logger.loggerError('Database connection failed.');
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }

        const chargerStatusCollection = db.collection('charger_status');
        const chargerStatus = await chargerStatusCollection.findOne({
            charger_id: charger_id,
            connector_id: Number(connector_id),
            charger_status: 'Charging'
        });

        if (!chargerStatus || !chargerStatus.transaction_id) {
            logger.loggerWarn(`No active charging session found for Charger ID: ${charger_id}, Connector ID: ${connector_id}`);
            return res.status(404).json({
                error: true,
                message: 'No active charging session found.'
            });
        }

        // Create remote stop request
        const remoteStopRequest = [2, Key, "RemoteStopTransaction", {
            "transactionId": chargerStatus.transaction_id
        }];

        // Send the request to the WebSocket
        wsToSendTo.send(JSON.stringify(remoteStopRequest));
        logger.loggerInfo(`RemoteStopRequest sent: ${JSON.stringify(remoteStopRequest)}`);

        logger.loggerSuccess(`StopCharger message sent to the WebSocket client for device ID: ${charger_id}, Connector ID: ${connector_id}`);
        return res.status(200).json({
            error: false,
            message: `StopCharger message sent to the WebSocket client for device ID: ${charger_id}, Connector ID: ${connector_id}`
        });
    } catch (error) {
        logger.loggerError(`Error in stopCharger: ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error_details: error.message
        });
    }
};

// UPDATE AUTO STOP SETTINGS
const updateAutoStopSettings = async (req, res) => {
    const {
        user_id,
        email_id,
        updateUserTimeVal,
        updateUserUnitVal,
        updateUserPriceVal,
        updateUserTime_isChecked,
        updateUserUnit_isChecked,
        updateUserPrice_isChecked
    } = req.body;

    try {
        // Validate user_id
        if (!user_id || !Number.isInteger(Number(user_id))) {
            return res.status(400).json({
                error: true,
                message: 'Invalid input: user_id must be a valid integer.'
            });
        }

        if (!db) {
            logger.loggerError('Database connection failed.');
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }

        // If email_id is provided, verify the user
        if (email_id) {
            const usersCollection = db.collection('users');
            const user = await usersCollection.findOne({ user_id: Number(user_id), email_id });

            if (!user) {
                logger.loggerWarn(`User ID: ${user_id}, Email: ${email_id} - User not found`);
                return res.status(404).json({
                    error: true,
                    message: 'User not found.'
                });
            }
        }

        const updateFields = {};

        // Dynamically add fields to updateFields if they are provided
        if (updateUserTimeVal !== undefined) {
            updateFields.autostop_time = parseInt(updateUserTimeVal);
        }
        if (updateUserUnitVal !== undefined) {
            updateFields.autostop_unit = parseFloat(updateUserUnitVal);
        }
        if (updateUserPriceVal !== undefined) {
            updateFields.autostop_price = parseFloat(updateUserPriceVal);
        }
        if (updateUserTime_isChecked !== undefined) {
            updateFields.autostop_time_is_checked = updateUserTime_isChecked;
        }
        if (updateUserUnit_isChecked !== undefined) {
            updateFields.autostop_unit_is_checked = updateUserUnit_isChecked;
        }
        if (updateUserPrice_isChecked !== undefined) {
            updateFields.autostop_price_is_checked = updateUserPrice_isChecked;
        }

        // If no valid fields are provided, return an error
        if (Object.keys(updateFields).length === 0) {
            logger.loggerWarn(`User ID: ${user_id} - No valid fields provided for update`);
            return res.status(400).json({
                error: true,
                message: 'No valid fields provided for update'
            });
        }

        const usersCollection = db.collection('users');

        // Update the user details
        const result = await usersCollection.updateOne(
            { user_id: Number(user_id) },
            { $set: updateFields }
        );

        if (result.modifiedCount === 1) {
            logger.loggerSuccess(`User ID: ${user_id} - Auto-stop settings updated successfully`);
            return res.status(200).json({
                error: false,
                message: 'Auto-stop settings updated successfully'
            });
        } else if (result.matchedCount === 1) {
            logger.loggerInfo(`User ID: ${user_id} - No changes made to auto-stop settings`);
            return res.status(200).json({
                error: false,
                message: 'No changes made to auto-stop settings'
            });
        } else {
            logger.loggerWarn(`User ID: ${user_id} - User not found`);
            return res.status(404).json({
                error: true,
                message: 'User not found'
            });
        }
    } catch (error) {
        logger.loggerError(`Error in updateAutoStopSettings: User ID: ${user_id} - ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error_details: error.message
        });
    }
};

// MANAGE STARTTIME 
const fetchStartedAt = async (req, res) => {
    const { charger_id, connector_id, connector_type, email_id, user_id } = req.body;

    try {
        // Validate input types
        if (typeof charger_id !== 'string' ||
            !Number.isInteger(Number(connector_id)) ||
            !Number.isInteger(Number(connector_type)) ||
            !email_id || typeof email_id !== 'string' || email_id.trim() === '') {
            return res.status(400).json({
                error: true,
                message: 'Invalid input types: charger_id must be a string, connector_id and connector_type must be integers, email_id must be a non-empty string.'
            });
        }

        if (!db) {
            logger.loggerError('Database connection failed.');
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }

        const usersCollection = db.collection('users');

        // Find the user with both user_id and email_id
        const user = await usersCollection.findOne({ email_id });

        if (!user) {
            return res.status(404).json({
                error: true,
                message: 'User not found.',
            });
        }

        // Fetch the latest session based on start_time
        const fetchSessionDetails = await db.collection('device_session_details').findOne(
            {
                charger_id,
                connector_id: Number(connector_id),
                connector_type: Number(connector_type),
                stop_time: null,
                email_id: email_id
            },
            { sort: { start_time: -1 } } // Get the latest session
        );

        // Check if a session was found
        if (!fetchSessionDetails) {
            logger.loggerWarn(`ChargerID: ${charger_id}, ConnectorID: ${connector_id}, Email: ${email_id} - No active session found`);
            return res.status(404).json({
                error: true,
                message: 'No active session found'
            });
        }

        logger.loggerSuccess(`ChargerID: ${charger_id}, ConnectorID: ${connector_id}, Email: ${email_id} - Session start time fetched successfully`);
        return res.status(200).json({
            error: false,
            message: 'Session start time fetched successfully',
            data: fetchSessionDetails.start_time
        });
    } catch (error) {
        logger.loggerError(`Error in fetchStartedAt: ChargerID: ${charger_id}, ConnectorID: ${connector_id}, Email: ${email_id} - ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error_details: error.message
        });
    }
};

// END CHARGING SESSION
const endChargingSession = async (req, res) => {
    const { charger_id, connector_id, email_id } = req.body;

    try {
        // Validate input types
        if (typeof charger_id !== 'string' || !Number.isInteger(Number(connector_id)) || typeof email_id !== 'string') {
            return res.status(400).json({
                error: true,
                message: 'Invalid input types: charger_id must be a string, connector_id must be an integer, and email_id must be a string.'
            });
        }

        if (!db) {
            logger.loggerError('Database connection failed.');
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }

        const chargerDetailsCollection = db.collection('charger_details');
        const chargerStatusCollection = db.collection('charger_status');

        // Find the charger status
        const chargerStatus = await chargerStatusCollection.findOne({ charger_id, connector_id });

        if (!chargerStatus) {
            logger.loggerWarn(`ChargerID: ${charger_id}, ConnectorID: ${connector_id} - Charger status not found!`);
            return res.status(404).json({
                error: true,
                message: 'Charger status not found!'
            });
        }

        const connectorField = `current_or_active_user_for_connector_${connector_id}`;
        const chargerDetails = await chargerDetailsCollection.findOne({ charger_id });

        if (!chargerDetails) {
            logger.loggerWarn(`ChargerID: ${charger_id} - Charger details not found!`);
            return res.status(404).json({
                error: true,
                message: `ChargerID - ${charger_id} not found in charger_details`
            });
        }

        // Check if the current user matches the email_id provided
        if (chargerDetails[connectorField] !== email_id) {
            logger.loggerWarn(`ChargerID: ${charger_id}, ConnectorID: ${connector_id} - The email does not match the active user.`);
            return res.status(400).json({
                error: true,
                message: 'The provided email does not match the active user for this connector.'
            });
        }

        if (chargerStatus.charger_status === 'Finishing') {
            if (chargerDetails[connectorField] === null) {
                logger.loggerSuccess(`ChargerID: ${charger_id}, ConnectorID: ${connector_id} - The charging session is already ended.`);
                return res.status(200).json({
                    error: false,
                    message: 'The charging session is already ended.'
                });
            } else {
                const result = await chargerDetailsCollection.updateOne(
                    { charger_id },
                    { $set: { [connectorField]: null } }
                );

                if (result.modifiedCount === 0) {
                    logger.loggerWarn(`ChargerID: ${charger_id}, ConnectorID: ${connector_id} - Failed to update the charging session`);
                    return res.status(500).json({
                        error: true,
                        message: 'Failed to update the charging session'
                    });
                }

                logger.loggerSuccess(`ChargerID: ${charger_id}, ConnectorID: ${connector_id} - End Charging session updated successfully.`);
                return res.status(200).json({
                    error: false,
                    message: 'End Charging session updated successfully.'
                });
            }
        }

        // If the status is one of the acceptable ones, proceed with ending the session
        if (['Available', 'Faulted', 'Unavailable'].includes(chargerStatus.charger_status)) {
            if (chargerDetails[connectorField] === null) {
                logger.loggerSuccess(`ChargerID: ${charger_id}, ConnectorID: ${connector_id} - The charging session is already ended.`);
                return res.status(200).json({
                    error: false,
                    message: 'The charging session is already ended.'
                });
            }

            const result = await chargerDetailsCollection.updateOne(
                { charger_id },
                { $set: { [connectorField]: null } }
            );

            if (result.modifiedCount === 0) {
                logger.loggerWarn(`ChargerID: ${charger_id}, ConnectorID: ${connector_id} - Failed to update the charging session`);
                return res.status(500).json({
                    error: true,
                    message: 'Failed to update the charging session'
                });
            }

            logger.loggerSuccess(`ChargerID: ${charger_id}, ConnectorID: ${connector_id} - End Charging session updated successfully.`);
            return res.status(200).json({
                error: false,
                message: 'End Charging session updated successfully.'
            });
        } else {
            logger.loggerWarn(`ChargerID: ${charger_id}, ConnectorID: ${connector_id} - Status is not in Available/Faulted/Finishing/Unavailable`);
            return res.status(200).json({
                error: false,
                message: 'OK'
            });
        }
    } catch (error) {
        logger.loggerError(`Error in endChargingSession: ChargerID: ${charger_id}, ConnectorID: ${connector_id} - ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error_details: error.message
        });
    }
};


// GET UPDATED CHARGING DETAILS
const getUpdatedChargingDetails = async (req, res) => {
    const { charger_id, connector_id, email_id } = req.body;

    try {
        // Validate input types
        if (typeof charger_id !== 'string' ||
            !Number.isInteger(Number(connector_id)) ||
            !email_id || typeof email_id !== 'string' || email_id.trim() === '') {
            return res.status(400).json({
                error: true,
                message: 'Invalid input types: charger_id must be a string, connector_id must be an integer, email_id must be a non-empty string.'
            });
        }

        if (!db) {
            logger.loggerError('Database connection failed.');
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }

        // Find the charging session
        const chargingSessionResult = await db.collection('device_session_details')
            .find({
                charger_id: charger_id,
                connector_id: Number(connector_id),
                email_id: email_id
            })
            .sort({ stop_time: -1 })
            .limit(1)
            .next();

        if (!chargingSessionResult) {
            logger.loggerWarn(`ChargerID: ${charger_id}, ConnectorID: ${connector_id}, Email: ${email_id} - Charging session not found`);
            return res.status(404).json({
                error: true,
                message: 'Charging session not found'
            });
        }

        // Find the user
        const userResult = await db.collection('users').findOne({ email_id: email_id });

        if (!userResult) {
            logger.loggerWarn(`Email: ${email_id} - User not found`);
            return res.status(404).json({
                error: true,
                message: 'User not found'
            });
        }

        // Calculate updated EB_fee
        const EB_fee = parseFloat(chargingSessionResult.EB_fee || 0);
        const associationCommission = parseFloat(chargingSessionResult.association_commission || 0);
        chargingSessionResult.EB_fee = (EB_fee + associationCommission).toFixed(2); // Sum and format to 2 decimals

        // Remove association_commission from the response
        delete chargingSessionResult.association_commission;

        const combinedResult = {
            chargingSession: chargingSessionResult,
            user: userResult
        };

        logger.loggerSuccess(`ChargerID: ${charger_id}, ConnectorID: ${connector_id}, Email: ${email_id} - Updated charging details fetched successfully`);
        return res.status(200).json({
            error: false,
            message: 'Updated charging details fetched successfully',
            data: combinedResult
        });
    } catch (error) {
        logger.loggerError(`Error in getUpdatedChargingDetails: ChargerID: ${charger_id}, ConnectorID: ${connector_id}, Email: ${email_id} - ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error_details: error.message
        });
    }
};

module.exports = {
    fetchLastStatus,
    fetchStartedAt,
    endChargingSession,
    getUpdatedChargingDetails,
    updateAutoStopSettings,
    startCharger,
    stopCharger
};




