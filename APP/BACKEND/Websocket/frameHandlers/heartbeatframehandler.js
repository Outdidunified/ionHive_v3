const dbService = require("../services/dbService");
const logger = require('../../utils/logger');
const { framevalidation } = require("../validation/framevalidation");

const validateHeartbeat = (data) => {
    return framevalidation(data, "Heartbeat.json");
};

const handleHeartbeat = async (uniqueIdentifier, requestPayload, requestId, currentVal, previousResults, ws) => {
    const validationResult = validateHeartbeat(requestPayload);

    if (validationResult.error) {
        logger.loggerError(`Validation failed for Heartbeat: ${JSON.stringify(validationResult.details)}`);
        return [3, requestId, { status: "Rejected", errors: validationResult.details }];
    }
    ws.lastHeartbeat = Date.now();
    const formattedDate = new Date().toISOString();
    let response = [3, requestId, { currentTime: formattedDate }];

    try {
        const result = await dbService.updateTime(uniqueIdentifier, undefined);
        currentVal.set(uniqueIdentifier, result);

        if (currentVal.get(uniqueIdentifier) === true) {
            if (previousResults.get(uniqueIdentifier) === false) {
                logger.loggerWarn(`ChargerID - ${uniqueIdentifier} terminated and trying to reconnect!`);
                return { terminate: true }; // Signal WebSocket termination
            }
        }

        previousResults.set(uniqueIdentifier, result);
    } catch (error) {
        logger.loggerError(`Error handling Heartbeat for ChargerID ${uniqueIdentifier}: ${error.message}`);
        response = [3, requestId, { status: "Error", message: "Internal server error" }];
    }

    return response;
};

module.exports = { handleHeartbeat };
