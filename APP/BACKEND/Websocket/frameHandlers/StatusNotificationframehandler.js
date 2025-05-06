const dbService = require("../services/dbService");
const logger = require('../../utils/logger');
const { framevalidation } = require("../validation/framevalidation");
const { sendForceDisconnect } = require("../utils/broadcastUtils");

const validateStatusnotification = (data) => {
    return framevalidation(data, "StatusNotification.json");
};

function generateRandomTransactionId() {
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
    const formattedDate = new Date().toISOString();
    // Initialize with correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
    let response = [3, requestId, {}];
    let timeoutId;
    let db;

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

        let chargerErrorCode = errorCode === "NoError" ? errorCode : vendorErrorCode || errorCode;

        if (status === "Available") {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(async () => {
                const result = await dbService.updateCurrentOrActiveUserToNull(uniqueIdentifier, connectorId);
                // if (result) {
                //     // Send force disconnect message using our utility function
                //     sendForceDisconnect(uniqueIdentifier, connectorId, ws, ClientWss,
                //         "No action attempted. Automatically redirecting to home page.");
                // }

                logger.loggerInfo(`ChargerID ${uniqueIdentifier} - End charging session ${result ? "updated" : "not updated"}`);
            }, 50000);

            await dbService.deleteMeterValues(key, meterValuesMap);
            await dbService.NullTagIDInStatus(uniqueIdentifier, connectorId);
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
            chargingSessionID.set(key, generateRandomTransactionId());
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
