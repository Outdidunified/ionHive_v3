const dbService = require("../services/dbService");
const logger = require("../../utils/logger");
const { framevalidation } = require("../validation/framevalidation");

const validateAuthorize = (data) => {
    return framevalidation(data, "Authorize.json"); // Ensure correct schema is used
};

const handleAuthorize = async (uniqueIdentifier, requestPayload, requestId, wsConnections) => {
    // Initialize with correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
    let response = [3, requestId];

    try {
        // Validate request payload
        const validationResult = validateAuthorize(requestPayload);
        if (!validationResult.isValid) {
            logger.loggerError(`Authorization validation failed: Frame Recived - ${JSON.stringify(requestPayload)}, Errors: ${JSON.stringify(validationResult.errors)}`);
            response[2] = { idTagInfo: { status: "Invalid" } };

            // Add metadata for internal use
            response.metadata = {
                success: false,
                error: "Validation failed",
                details: validationResult.errors
            };

            return response;
        }

        const idTag = requestPayload.idTag;
        const { status, expiryDate, connectorId } = await dbService.checkAuthorization(uniqueIdentifier, idTag);
        logger.loggerInfo(`Authorization status: ${status} for idTag: ${idTag}`);

        response[2] = { idTagInfo: { status, expiryDate: expiryDate || new Date().toISOString() } };

        if (status !== "Invalid") {
            let authData = [
                2,
                "lyw5bpqwo7ehtwzi",
                "StatusNotification",
                {
                    connectorId: connectorId,
                    errorCode: "NoError",
                    TagIDStatus: status,
                    timestamp: new Date().toISOString(),
                },
            ];

            // Add metadata for internal use with broadcast data
            response.metadata = {
                success: true,
                broadcastData: true,
                authData: authData
            };

            logger.loggerSuccess("Authorization successful, ready for broadcast.");
        } else {
            // Add metadata for internal use without broadcast data
            response.metadata = {
                success: true,
                broadcastData: false
            };
        }
    } catch (error) {
        logger.loggerError(`Error in handleAuthorize: ${error.message}`);
        response[2] = { idTagInfo: { status: "InternalError" } };

        // Add metadata for internal use
        response.metadata = {
            success: false,
            error: error.message
        };
    }

    return response;
};

module.exports = { handleAuthorize };
