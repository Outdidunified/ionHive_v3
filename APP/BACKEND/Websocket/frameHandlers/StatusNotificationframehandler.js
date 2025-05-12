const dbService = require("../services/dbService");
const logger = require('../../utils/logger');
const { framevalidation } = require("../validation/framevalidation");
const { sendForceDisconnect } = require("../utils/broadcastUtils");
const clientConnectionUtils = require("../utils/clientConnectionUtils");
const timeUtils = require('../../utils/timeUtils');

// Map to store timeout IDs for each charger-connector combination
const timeoutMap = new Map();

const validateStatusnotification = (data) => {
    return framevalidation(data, "StatusNotification.json");
};

function generateRandomSessionId() {
    return Math.floor(1000000 + Math.random() * 9000000); // Generates a random number between 1000000 and 9999999
}

const handleStatusNotification = async (
    uniqueIdentifier,
    requestPayload,
    requestId,
    sessionFlags,
    startedChargingSet,
    charging_states,
    chargingSessionID,
    chargerStartTime,
    chargerStopTime,
    meterValuesMap,
    clientIpAddress,
    ws,
    ClientWss
) => {
    const formattedDate = timeUtils.getCurrentIST();
    // Initialize with correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
    let response = [3, requestId, {}];
    let db;
    let GenerateChargingSessionID;

    try {
        db = await dbService.connectToDatabase();

        // Validate requestPayload
        const validationResult = validateStatusnotification(requestPayload);
        if (validationResult.error) {
            logger.loggerError(`Validation failed for StatusNotification: ${JSON.stringify(validationResult.details)}`);

            // Add metadata for internal use
            response.metadata = {
                success: false,
                error: "Validation failed",
                details: validationResult.details
            };

            return response;
        }

        const { connectorId, errorCode, status, timestamp, vendorErrorCode } = requestPayload;
        const key = `${uniqueIdentifier}_${connectorId}`;

        // Fetch Connector Type
        const socketGunConfig = await db.collection("socket_gun_config").findOne({ charger_id: uniqueIdentifier });

        if (!socketGunConfig) {
            logger.loggerError(`SocketGun Config not found for charger_id: ${uniqueIdentifier}`);

            // Add metadata for internal use
            response.metadata = {
                success: false,
                error: "Charger config not found"
            };

            return response;
        }

        const connectorTypeValue = socketGunConfig[`connector_${connectorId}_type`] || "Unknown";

        // Prepare Data for Saving
        const keyValPair = {
            charger_id: uniqueIdentifier,
            connector_id: connectorId,
            connector_type: connectorTypeValue,
            charger_status: status,
            timestamp: new Date(timestamp),
            client_ip: clientIpAddress || null,
            error_code: errorCode !== "InternalError" ? errorCode : vendorErrorCode,
            created_date: new Date(),
            modified_date: null
        };

        await dbService.SaveChargerStatus(JSON.stringify(keyValPair), connectorId);

        // Also update error code in device_session_details if it exists
        try {
            const db = await dbService.connectToDatabase();
            const key = `${uniqueIdentifier}_${connectorId}`;
            const sessionId = chargingSessionID ? chargingSessionID.get(key) : null;

            if (sessionId) {
                const DeviceSessionDetailsCollection = db.collection('device_session_details');
                const updateResult = await DeviceSessionDetailsCollection.updateOne(
                    {
                        charger_id: uniqueIdentifier,
                        connector_id: parseInt(connectorId),
                        session_id: sessionId
                    },
                    {
                        $set: {
                            error_code: errorCode !== "InternalError" ? errorCode : (vendorErrorCode || "InternalError"),
                            vendor_error_code: vendorErrorCode || null,
                            status: status
                        }

                    }
                );

                if (updateResult.modifiedCount > 0) {
                    logger.loggerSuccess(`Updated error code in device_session_details for session ID: ${sessionId}`);
                } else if (updateResult.matchedCount > 0) {
                    logger.loggerInfo(`No changes needed for error code in device_session_details for session ID: ${sessionId}`);
                } else {
                    logger.loggerWarn(`No matching session found to update error code for session ID: ${sessionId}`);
                }
            }
        } catch (error) {
            logger.loggerError(`Error updating error code in device_session_details: ${error.message}`);
        }

        let chargerErrorCode = errorCode === "NoError" ? errorCode : vendorErrorCode || errorCode;

        // Broadcast status change to specific clients subscribed to this charger and connector
        try {
            // Create a status update message
            const statusUpdate = {
                type: "statusUpdate",
                status: status,
                errorCode: chargerErrorCode,
                timestamp: formattedDate,
                connectorId: connectorId,
                info: {
                    chargerModel: requestPayload.info || null,
                    vendorId: requestPayload.vendorId || null,
                    vendorErrorCode: vendorErrorCode || null
                }
            };

            // Broadcast to specific clients subscribed to this charger and connector
            logger.loggerInfo(`Broadcasting status update for charger ${uniqueIdentifier}, connector ${connectorId}: ${status}`);
            clientConnectionUtils.broadcastToSubscribedClients(uniqueIdentifier, connectorId, statusUpdate, ClientWss, ws);
        } catch (broadcastError) {
            logger.loggerError(`Error broadcasting status update: ${broadcastError.message}`);
        }

        if (status === "Available") {
            // Clear any existing timeout for this charger-connector combination
            if (timeoutMap.has(key)) {
                clearTimeout(timeoutMap.get(key));
                logger.loggerInfo(`Cleared existing timeout for ${key}`);
            }

            // Set a new timeout for this charger-connector combination
            const newTimeoutId = setTimeout(async () => {
                const result = await dbService.updateCurrentOrActiveUserToNull(uniqueIdentifier, connectorId);
                if (result) {
                    // Send force disconnect message using our utility function
                    sendForceDisconnect(uniqueIdentifier, connectorId, ws, ClientWss,
                        "No action attempted. Automatically redirecting to home page.");
                }

                logger.loggerInfo(`ChargerID ${uniqueIdentifier}, ConnectorID ${connectorId} - End charging session ${result ? "updated" : "not updated"}`);

                // Remove the timeout from the map once it's executed
                timeoutMap.delete(key);
            }, 50000);

            // Store the timeout ID in the map
            timeoutMap.set(key, newTimeoutId);
            logger.loggerInfo(`Set new timeout for ${key}`);

            await dbService.deleteMeterValues(key, meterValuesMap);
            await dbService.NullTagIDInStatus(uniqueIdentifier, connectorId);
        } else {
            // Clear any existing timeout for this charger-connector combination
            if (timeoutMap.has(key)) {
                clearTimeout(timeoutMap.get(key));
                timeoutMap.delete(key);
                logger.loggerInfo(`Cleared timeout for ${key} due to status: ${status}`);
            }
        }

        if (status === "Preparing") {
            sessionFlags.set(key, 0);
            startedChargingSet.delete(key);
            charging_states.set(key, false);
            await dbService.deleteMeterValues(key, meterValuesMap);
            await dbService.NullTagIDInStatus(uniqueIdentifier, connectorId);
        }

        if (status === "Charging" && !startedChargingSet.has(key)) {
            sessionFlags.set(key, 1);
            charging_states.set(key, true);
            chargerStartTime.set(key, timestamp);
            startedChargingSet.add(key);
            // Only set a new session ID if one doesn't already exist
            if (!chargingSessionID.has(key)) {
                const GenerateChargingSessionID = Math.floor(1000000 + Math.random() * 9000000); // 7-digit session ID
                chargingSessionID.set(key, GenerateChargingSessionID);
                logger.loggerInfo(`Generated new session ID ${GenerateChargingSessionID} for ${key} in StatusNotification`);
            } else {
                logger.loggerInfo(`Using existing session ID ${chargingSessionID.get(key)} for ${key} in StatusNotification`);
            }
        }

        if (["SuspendedEV", "Faulted", "Unavailable"].includes(status) && charging_states.get(key)) {
            sessionFlags.set(key, 1);
            chargerStopTime.set(key, timestamp);
            startedChargingSet.delete(key);
        }

        if (status === "Finishing" && charging_states.get(key)) {
            charging_states.set(key, false);
            startedChargingSet.delete(key);
        }


        // Add metadata for successful processing
        response.metadata = {
            success: true,
            broadcastData: true
        };
    } catch (error) {
        logger.loggerError(`Error handling StatusNotification for ChargerID ${uniqueIdentifier}: ${error.message}`);

        // If we have connector ID information, clean up any timeouts for this charger-connector
        if (requestPayload && requestPayload.connectorId) {
            const errorKey = `${uniqueIdentifier}_${requestPayload.connectorId}`;
            if (timeoutMap.has(errorKey)) {
                clearTimeout(timeoutMap.get(errorKey));
                timeoutMap.delete(errorKey);
                logger.loggerInfo(`Cleared timeout for ${errorKey} due to error`);
            }
        }

        // Ensure we have a valid OCPP response even in case of error
        response = [3, requestId, {}];

        // Add metadata for internal use
        response.metadata = {
            success: false,
            error: error.message
        };
    }

    return response;
};

module.exports = { handleStatusNotification };
