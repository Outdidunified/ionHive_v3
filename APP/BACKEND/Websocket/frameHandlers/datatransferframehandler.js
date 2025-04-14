const logger = require('../../utils/logger');
const { framevalidation } = require("../validation/framevalidation");

const validateDataTransfer = (data) => {
    return framevalidation(data, "DataTransfer.json");
};
const handleDataTransfer = async (requestPayload, requestId) => {
    // Initialize with correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
    let response = [3, requestId];

    try {
        const validationResult = validateDataTransfer(requestPayload);

        if (validationResult.error) {
            logger.loggerError(`Validation failed for DataTransfer: ${JSON.stringify(validationResult.details)}`);
            response[2] = { status: "Rejected" };

            // Add metadata for internal use
            response.metadata = {
                success: false,
                error: "Validation failed",
                details: validationResult.details
            };

            return response;
        }

        // If valid, return success response
        response[2] = { status: "Accepted" };

        // Add metadata for internal use
        response.metadata = {
            success: true,
            vendorId: requestPayload.vendorId,
            messageId: requestPayload.messageId
        };
    } catch (error) {
        logger.loggerError(`Error in handleDataTransfer: ${error.message}`);
        response[2] = { status: "Rejected" };

        // Add metadata for internal use
        response.metadata = {
            success: false,
            error: error.message
        };
    }

    return response;
};

module.exports = { handleDataTransfer };

