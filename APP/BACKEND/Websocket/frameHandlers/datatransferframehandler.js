const logger = require('../../utils/logger');
const { framevalidation } = require("../validation/framevalidation");

const validateDataTransfer = (data) => {
    return framevalidation(data, "DataTransfer.json");
};
const handleDataTransfer = async (requestPayload, requestId) => {
    const validationResult = validateDataTransfer(requestPayload);

    if (validationResult.error) {
        logger.loggerError(`Validation failed for DataTransfer: ${JSON.stringify(validationResult.details)}`);
        return [3, requestId, { status: "Rejected", errors: validationResult.details }];
    }

    // If valid, return success response (or further processing)
    return [3, requestId, { status: "Accepted" }];
};

module.exports = { handleDataTransfer };

