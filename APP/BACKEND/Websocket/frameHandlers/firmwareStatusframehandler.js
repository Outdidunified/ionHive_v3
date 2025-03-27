const logger = require('../../utils/logger');
const { framevalidation } = require("../validation/framevalidation");

const validateFirmwareStatusNotification = (data) => {
    return framevalidation(data, "FirmwareStatusNotification.json");
};
const handleFirmwareStatusNotification = async (requestPayload, requestId) => {
    const validationResult = validateFirmwareStatusNotification(requestPayload);

    if (validationResult.error) {
        logger.loggerError(`Validation failed for FirmwareStatusNotification: ${JSON.stringify(validationResult.details)}`);
        return [3, requestId, { status: "Rejected", errors: validationResult.details }];
    }

    // If valid, return success response (or further processing)
    return [3, requestId, { status: "Accepted" }];
};

module.exports = { handleFirmwareStatusNotification };


