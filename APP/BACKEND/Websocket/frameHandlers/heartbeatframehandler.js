const dbService = require("../services/dbService");
const logger = require('../../utils/logger');
const { framevalidation } = require("../validation/framevalidation");

const validateHeartbeat = (data) => {
    return framevalidation(data, "Heartbeat.json");
};

const handleHeartbeat = async (uniqueIdentifier, requestPayload, requestId, currentVal, previousResults, ws) => {
    // Initialize with correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
    let response = [3, requestId];

    try {
        const validationResult = validateHeartbeat(requestPayload);

        if (validationResult.error) {
            logger.loggerError(`Validation failed for Heartbeat: ${JSON.stringify(validationResult.details)}`);
            response[2] = { currentTime: new Date().toISOString() };

            // Add metadata for internal use
            response.metadata = {
                success: false,
                error: "Validation failed",
                details: validationResult.details
            };

            return response;
        }

        // Update the last heartbeat timestamp
        ws.lastHeartbeat = Date.now();
        ws.isAlive = true;

        const formattedDate = new Date().toISOString();
        response[2] = { currentTime: formattedDate };

        const result = await dbService.updateTime(uniqueIdentifier, undefined);

        // Store the current result
        currentVal.set(uniqueIdentifier, result);

        // Check for reconnection attempts
        if (currentVal.get(uniqueIdentifier) === true) {
            if (previousResults.get(uniqueIdentifier) === false) {
                logger.loggerWarn(`ChargerID - ${uniqueIdentifier} terminated and trying to reconnect!`);

                // Add metadata for internal use
                response.metadata = {
                    success: false,
                    terminate: true,
                    error: "Charger terminated and trying to reconnect"
                };

                return response;
            }
        }

        // Store the previous result for next comparison
        previousResults.set(uniqueIdentifier, result);

        // Add metadata for internal use
        response.metadata = {
            success: true
        };
    } catch (error) {
        logger.loggerError(`Error handling Heartbeat for ChargerID ${uniqueIdentifier}: ${error.message}`);
        response[2] = { currentTime: new Date().toISOString() };

        // Add metadata for internal use
        response.metadata = {
            success: false,
            error: error.message
        };
    }

    return response;
};

module.exports = { handleHeartbeat };
