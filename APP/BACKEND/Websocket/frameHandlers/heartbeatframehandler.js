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

    // Update the last heartbeat timestamp
    ws.lastHeartbeat = Date.now();
    ws.isAlive = true;

    const formattedDate = new Date().toISOString();
    let response = [3, requestId, { currentTime: formattedDate }];

    try {
        const result = await dbService.updateTime(uniqueIdentifier, undefined);

        // Store the current result
        currentVal.set(uniqueIdentifier, result);

        // Check for reconnection attempts
        if (currentVal.get(uniqueIdentifier) === true) {
            if (previousResults.get(uniqueIdentifier) === false) {
                logger.loggerWarn(`ChargerID - ${uniqueIdentifier} terminated and trying to reconnect!`);
                return { terminate: true }; // Signal WebSocket termination
            }
        }

        // Store the previous result for next comparison
        previousResults.set(uniqueIdentifier, result);
    } catch (error) {
        logger.loggerError(`Error handling Heartbeat for ChargerID ${uniqueIdentifier}: ${error.message}`);
        response = [3, requestId, { status: "Error", message: "Internal server error" }];
    }

    return response;
};

module.exports = { handleHeartbeat };
