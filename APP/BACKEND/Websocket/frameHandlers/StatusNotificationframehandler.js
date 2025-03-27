const dbService = require("../services/dbService");
const logger = require('../../utils/logger');
const { framevalidation } = require("../validation/framevalidation");

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
    clientIpAddress
) => {
    const formattedDate = new Date().toISOString();
    let response = [3, requestId, { currentTime: formattedDate }];
    let timeoutId;
    const db = await dbService.connectToDatabase();

    try {
        // Validate requestPayload
        const validationErrors = validateStatusnotification(requestPayload);
        if (validationErrors.length > 0) {
            logger.loggerError(`Validation failed for StatusNotification: ${JSON.stringify(validationErrors)}`);
            return [3, requestId, { status: "Rejected", errors: validationErrors }];
        }

        const { connectorId, errorCode, status, timestamp, vendorErrorCode } = requestPayload;
        const key = `${uniqueIdentifier}_${connectorId}`;

        // Fetch Connector Type
        const socketGunConfig = await db.collection("socket_gun_config").findOne({ charger_id: uniqueIdentifier });

        if (!socketGunConfig) {
            logger.loggerError(`SocketGun Config not found for charger_id: ${uniqueIdentifier}`);
            return [3, requestId, { status: "Error", message: "Charger config not found" }];
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

    } catch (error) {
        logger.loggerError(`Error handling StatusNotification for ChargerID ${uniqueIdentifier}: ${error.message}`);
        response = [3, requestId, { status: "Error", message: "Internal server error" }];
    }

    return response;
};

module.exports = { handleStatusNotification };
