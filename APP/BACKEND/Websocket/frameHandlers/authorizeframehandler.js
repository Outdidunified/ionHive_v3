const dbService = require("../services/dbService");
const logger = require("../../utils/logger");
const { framevalidation } = require("../validation/framevalidation");

const validateAuthorize = (data) => {
    return framevalidation(data, "Authorize.json"); // Ensure correct schema is used
};

const handleAuthorize = async (uniqueIdentifier, requestPayload, requestId) => {
    const { broadcastMessage } = require("../WebsocketHandler");

    let response = [3, requestId, {}];

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
            broadcastMessage(uniqueIdentifier, authData);
            logger.loggerSuccess("AuthData successfully broadcasted.");
        }
    } catch (error) {
        logger.loggerError(`Error in handleAuthorize: ${error.message}`);
        response[2] = { idTagInfo: { status: "InternalError" } };
    }

    return response;
};

module.exports = { handleAuthorize };
