const dbService = require("../services/dbService");
const logger = require("../../utils/logger");
const { framevalidation } = require("../validation/framevalidation");
const db_conn = require('../../config/db');

// Validate StopTransaction request
const validateStopTransaction = (data) => {
    return framevalidation(data, "StopTransaction.json");
};

// Get meter values from the map
const getMeterValues = (key, meterValuesMap) => {
    if (!meterValuesMap.has(key)) {
        meterValuesMap.set(key, {});
    }
    return meterValuesMap.get(key);
};

// Calculate the difference between first and last meter values
const calculateDifference = async (firstMeterValues, lastMeterValues, uniqueIdentifier, connectorId, sessionId) => {
    try {
        // Calculate units consumed
        const unitsConsumed = lastMeterValues - firstMeterValues;

        // Get price per unit for this connector
        const pricePerUnit = await dbService.getPricePerUnit(uniqueIdentifier, connectorId);

        // Calculate total price
        const sessionPrice = unitsConsumed * pricePerUnit;

        logger.loggerInfo(`Session calculation for ${uniqueIdentifier}, connector ${connectorId}: ${unitsConsumed} units at ${pricePerUnit} per unit = ${sessionPrice}`);

        return { unit: unitsConsumed, sessionPrice };
    } catch (error) {
        logger.loggerError(`Error calculating session difference: ${error.message}`);
        return { unit: 0, sessionPrice: 0 };
    }
};

// Get username for the connector
const getUsername = async (uniqueIdentifier, connectorId) => {
    try {
        return await dbService.getUserEmail(uniqueIdentifier, connectorId);
    } catch (error) {
        logger.loggerError(`Error getting username: ${error.message}`);
        return null;
    }
};

// Handle charging session data
const handleChargingSession = async (uniqueIdentifier, connectorId, startTime, stopTime, unit, sessionPrice, user, sessionId, connectorType, errorCode) => {
    try {
        const db = await dbService.connectToDatabase();

        // Create session data object
        const sessionData = {
            charger_id: uniqueIdentifier,
            connector_id: parseInt(connectorId),
            start_time: startTime,
            stop_time: stopTime,
            units_consumed: unit || 0,
            session_price: sessionPrice || 0,
            user_email: user,
            session_id: sessionId,
            connector_type: connectorType || 'Unknown',
            error_code: errorCode || 'NoError',
            created_date: new Date()
        };

        // Insert session data into charging_sessions collection
        const result = await db.collection('charging_sessions').insertOne(sessionData);

        if (result.insertedId) {
            logger.loggerSuccess(`Charging session data saved for ChargerID ${uniqueIdentifier}, ConnectorID ${connectorId}, SessionID ${sessionId}`);

            // Update user wallet balance if session price is available
            if (sessionPrice > 0 && user) {
                const userResult = await db.collection('users').updateOne(
                    { email_id: user },
                    { $inc: { wallet_bal: -sessionPrice } }
                );

                if (userResult.modifiedCount > 0) {
                    logger.loggerSuccess(`User ${user} wallet balance updated: -${sessionPrice}`);
                } else {
                    logger.loggerError(`Failed to update wallet balance for user ${user}`);
                }
            }

            return true;
        } else {
            logger.loggerError(`Failed to save charging session data for ChargerID ${uniqueIdentifier}, ConnectorID ${connectorId}`);
            return false;
        }
    } catch (error) {
        logger.loggerError(`Error handling charging session: ${error.message}`);
        return false;
    }
};

// Handle StopTransaction requests
const handleStopTransaction = async (
    uniqueIdentifier,
    requestPayload,
    requestId,
    wsConnections,
    sessionFlags,
    charging_states,
    startedChargingSet,
    chargerStopTime,
    meterValuesMap,
    chargingSessionID
) => {
    // Initialize with correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
    let response = [3, requestId];

    try {
        // Validate request payload
        const validationResult = validateStopTransaction(requestPayload);
        if (validationResult.error) {
            logger.loggerError(`StopTransaction validation failed: ${JSON.stringify(validationResult.details)}`);
            response[2] = { idTagInfo: { status: "Invalid" } };

            // Add metadata for internal use
            response.metadata = {
                success: false,
                error: "Validation failed",
                details: validationResult.details
            };

            return response;
        }
        // Get the idTag and transactionId from the request
        const { idTag, transactionId, timestamp, meterStop } = requestPayload;

        // Get the connector ID from the transaction ID
        let connectorId;
        try {
            connectorId = await dbService.getConnectorId(uniqueIdentifier, transactionId);
        } catch (error) {
            logger.loggerError(`Error getting connector ID: ${error.message}`);
            response[2] = { idTagInfo: { status: "Invalid" } };

            // Add metadata for internal use
            response.metadata = {
                success: false,
                error: `Error getting connector ID: ${error.message}`
            };

            return response;
        }

        // Check authorization
        const { status, expiryDate } = await dbService.checkAuthorization(uniqueIdentifier, idTag);

        logger.loggerInfo(`ChargerID ${uniqueIdentifier} - StopTransaction authorization status: ${status}`);

        // Create the response
        response[2] = {
            idTagInfo: {
                status,
                expiryDate: expiryDate || new Date().toISOString()
            }
        };

        // Update the in-use status
        const updateResult = await dbService.updateInUse(uniqueIdentifier, idTag, connectorId);

        // Create a composite key for the connector
        const key = `${uniqueIdentifier}_${connectorId}`;

        // Update the charging state
        if (charging_states.get(key) === true) {
            sessionFlags.set(key, 1);
            chargerStopTime.set(key, timestamp);
            charging_states.set(key, false);
            startedChargingSet.delete(key);
            logger.loggerSuccess(`ChargerID ${uniqueIdentifier}, ConnectorID ${connectorId}: Charging stopped.`);

            // Save the final meter value
            try {
                const chargerValue = JSON.stringify({
                    charger_id: uniqueIdentifier,
                    connectorId: parseInt(connectorId),
                    meterStop: meterStop,
                    timestamp: timestamp,
                    transactionId: transactionId
                });

                await dbService.SaveChargerValue(chargerValue);
                logger.loggerSuccess(`Final meter value saved for ChargerID ${uniqueIdentifier}, ConnectorID ${connectorId}`);
            } catch (error) {
                logger.loggerError(`Error saving final meter value: ${error.message}`);
            }
        }

        // Process session data if session flag is set
        if (sessionFlags.get(key) === 1) {
            sessionFlags.set(key, 0);
            let unit;
            let sessionPrice;

            // Get meter values for this session
            const meterValues = getMeterValues(key, meterValuesMap);

            // Calculate energy consumption and price if meter values are available
            if (meterValues.firstMeterValues !== undefined && meterValues.lastMeterValues !== undefined) {
                ({ unit, sessionPrice } = await calculateDifference(
                    meterValues.firstMeterValues,
                    meterValues.lastMeterValues,
                    uniqueIdentifier,
                    connectorId,
                    chargingSessionID.get(key)
                ));

                logger.loggerInfo(`Energy consumed during charging session: ${unit} Unit's - Price: ${sessionPrice}`);

                // Delete meter values after processing
                if (meterValuesMap.has(key)) {
                    meterValuesMap.delete(key);
                }
            } else {
                logger.loggerWarn("StartMeterValues or LastMeterValues is not available.");
            }

            // Get user for this session
            const user = await getUsername(uniqueIdentifier, connectorId);

            // Get start and stop times
            const startTime = chargerStartTime.get(key);
            const stopTime = chargerStopTime.get(key);

            // Fetch connector type
            const db = await dbService.connectToDatabase();
            const socketGunConfig = await db.collection('socket_gun_config').findOne({ charger_id: uniqueIdentifier });
            const connectorIdTypeField = `connector_${connectorId}_type`;
            const connectorTypeValue = socketGunConfig ? socketGunConfig[connectorIdTypeField] : null;

            // Handle charging session data if user is available
            if (user) {
                await handleChargingSession(
                    uniqueIdentifier,
                    connectorId,
                    startTime,
                    stopTime,
                    unit,
                    sessionPrice,
                    user,
                    chargingSessionID.get(key),
                    connectorTypeValue,
                    "NoError"
                );
            } else {
                logger.loggerWarn(`ChargerID ${uniqueIdentifier}: User is ${user}, so can't update the session price and commission.`);
            }

            // Update current or active user to null if charging has stopped
            if (charging_states.get(key) === false) {
                const result = await dbService.updateCurrentOrActiveUserToNull(uniqueIdentifier, connectorId);
                chargingSessionID.delete(key);

                if (result === true) {
                    logger.loggerInfo(`ChargerID ${uniqueIdentifier} ConnectorID ${connectorId} Stop - End charging session is updated successfully.`);
                } else {
                    logger.loggerWarn(`ChargerID ${uniqueIdentifier} ConnectorID ${connectorId} - End charging session is not updated.`);
                }
            } else {
                logger.loggerWarn('End charging session is not updated - while stop only it will work');
            }

            // Reset start and stop times
            chargerStartTime.set(key, null);
            chargerStopTime.set(key, null);
        }

        // Prepare status notification for broadcasting
        const statusNotification = [
            2,
            requestId,
            "StatusNotification",
            {
                connectorId: parseInt(connectorId),
                errorCode: "NoError",
                status: "Available",
                timestamp: new Date().toISOString()
            }
        ];

        // Add metadata with broadcast data for internal use
        response.metadata = {
            success: true,
            broadcastData: true,
            statusNotification: statusNotification
        };

        logger.loggerSuccess("StatusNotification ready for broadcast.");

    } catch (error) {
        logger.loggerError(`Error in handleStopTransaction: ${error.message}`);
        response[2] = { idTagInfo: { status: "InternalError" } };

        // Add metadata for internal use
        response.metadata = {
            success: false,
            error: error.message
        };
    }

    return response;
};

module.exports = { handleStopTransaction };