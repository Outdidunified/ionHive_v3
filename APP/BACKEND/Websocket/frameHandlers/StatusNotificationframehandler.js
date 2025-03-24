const dbService = require("../services/dbService");
const logger = require('../../utils/logger');


const handleStatusNotification = async (uniqueIdentifier, requestId, currentVal, previousResults) => {
    const formattedDate = new Date().toISOString();
    let response = [3, requestId, { currentTime: formattedDate }];

    try {
        const result = await dbService.updateTime(uniqueIdentifier, undefined);
        currentVal.set(uniqueIdentifier, result);

        if (currentVal.get(uniqueIdentifier) === true) {
            if (previousResults.get(uniqueIdentifier) === false) {
                console.log(`ChargerID - ${uniqueIdentifier} terminated and trying to reconnect!`);
                return { terminate: true }; // Signal to terminate the WebSocket
            }
        }

        previousResults.set(uniqueIdentifier, result);
    } catch (error) {
        logger.loggerError(`Error handling Heartbeat for ChargerID ${uniqueIdentifier}: ${error.message}`);
        response = [3, requestId, { status: "Error", message: "Internal server error" }];
    }

    return response;
};

module.exports = { handleStatusNotification };
