const dbService = require("../services/dbService");
const logger = require("../../utils/logger");
const { framevalidation } = require("../validation/framevalidation");

const validateAuthorize = (data) => {
    return framevalidation(data, "Authorize.json"); // Ensure correct schema is used
};

const handleAuthorize = async (uniqueIdentifier, requestPayload, requestId, wsConnections) => {
    // Initialize with correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
    let response = [3, requestId];

    // Validate request payload
    const validationResult = validateAuthorize(requestPayload);
    if (!validationResult.isValid) {
        logger.loggerError(`Authorization validation failed: ${JSON.stringify(validationResult.errors)}`);
        response[2] = { idTagInfo: { status: "Invalid" } };
        return response;
    }

    try {
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
            // We'll handle broadcasting in the WebsocketHandler.js
            logger.loggerSuccess("Authorization successful, ready for broadcast.");
            // Return the authData as part of the response for broadcasting
            response[3] = authData;
        }
    } catch (error) {
        logger.loggerError(`Error in handleAuthorize: ${error.message}`);
        response[2] = { idTagInfo: { status: "InternalError" } };
    }

    return response;
};

module.exports = { handleAuthorize };
