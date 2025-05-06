const logger = require('../../utils/logger');
const { framevalidation } = require("../validation/framevalidation");

const validateFirmwareStatusNotification = (data) => {
    return framevalidation(data, "FirmwareStatusNotification.json");
};
const handleFirmwareStatusNotification = async (requestPayload, requestId) => {
    // Initialize with correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
    let response = [3, requestId];

    try {
        const validationResult = validateFirmwareStatusNotification(requestPayload);

        if (validationResult.error) {
            logger.loggerError(`Validation failed for FirmwareStatusNotification: ${JSON.stringify(validationResult.details)}`);
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
            firmwareStatus: requestPayload.status
        };
    } catch (error) {
        logger.loggerError(`Error in handleFirmwareStatusNotification: ${error.message}`);
        response[2] = { status: "Rejected" };

        // Add metadata for internal use
        response.metadata = {
            success: false,
            error: error.message
        };
    }

    return response;
};

module.exports = { handleFirmwareStatusNotification };


