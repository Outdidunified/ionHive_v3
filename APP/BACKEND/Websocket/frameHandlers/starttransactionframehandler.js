const dbService = require("../services/dbService");
const logger = require("../../utils/logger");
const { framevalidation } = require("../validation/framevalidation");
const Chargercontrollers = require("../Chargercontrollers");

const validateStartTransaction = (data) => {
    return framevalidation(data, "StartTransaction.json"); // Ensure correct schema is used
};

const generateRandomTransactionId = () => {
    return Math.floor(100000 + Math.random() * 900000); // Random 6-digit transaction ID
};

const handleStartTransaction = async (uniqueIdentifier, requestPayload, requestId, wsConnections) => {
    // Initialize with correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
    let response = [3, requestId];

    // Validate request payload
    const validationResult = validateStartTransaction(requestPayload);
    if (!validationResult.isValid) {
        logger.loggerError(`StartTransaction validation failed: ${JSON.stringify(validationResult.errors)}`);
        response[2] = { idTagInfo: { status: "Invalid" } };
        return response;
    }

    try {
        const { idTag, connectorId, meterStart, timestamp } = requestPayload;
        const { status, expiryDate } = await dbService.checkAuthorization(uniqueIdentifier, idTag);

        logger.loggerInfo(`Authorization status: ${status} for idTag: ${idTag}`);

        if (status !== "Accepted") {
            response[2] = { idTagInfo: { status } };
            return response;
        }

        const generatedTransactionId = generateRandomTransactionId();
        const updateField = `transaction_id_for_connector_${connectorId}`;
        const connectorTagIdField = `tag_id_for_connector_${connectorId}`;
        const connectorTagIdInUseField = `tag_id_for_connector_${connectorId}_in_use`;

        const updateResult = await dbService.updateChargerTransaction(uniqueIdentifier, {
            [updateField]: generatedTransactionId,
            [connectorTagIdField]: idTag,
            [connectorTagIdInUseField]: true
        });

        if (!updateResult) {
            throw new Error("Failed to update charger transaction.");
        }

        response[2] = {
            transactionId: generatedTransactionId,
            idTagInfo: {
                status,
                expiryDate: expiryDate || new Date().toISOString()
            }
        };

        logger.loggerSuccess(`Transaction started for Charger: ${uniqueIdentifier}, Transaction ID: ${generatedTransactionId}`);

        // Prepare status notification for broadcasting
        const authData = [
            2,
            requestId,
            "StatusNotification",
            {
                connectorId,
                errorCode: "NoError",
                TagIDStatus: status,
                timestamp: new Date().toISOString()
            }
        ];
        // Add broadcast data to response for WebsocketHandler to handle
        response.push(authData);
        logger.loggerSuccess("StatusNotification ready for broadcast.");

        // AutoStop logic
        const user = await dbService.getUserEmail(uniqueIdentifier, connectorId, idTag);
        const autoStopConfig = await dbService.getAutostop(user);

        if (autoStopConfig.isTimeChecked && autoStopConfig.time_value) {
            const autoStopTimeInMs = autoStopConfig.time_value * 60 * 1000; // Convert minutes to milliseconds

            setTimeout(async () => {
                logger.loggerInfo(`AutoStop triggered for User: ${user}`);
                const stopResult = await Chargercontrollers.chargerStopCall(uniqueIdentifier, connectorId, wsConnections);
                if (stopResult) {
                    logger.loggerSuccess(`AutoStop: Charger stopped successfully.`);
                } else {
                    logger.loggerError(`AutoStop: Error stopping charger.`);
                }
            }, autoStopTimeInMs);
        }

    } catch (error) {
        logger.loggerError(`Error in handleStartTransaction: ${error.message}`);
        response[2] = { idTagInfo: { status: "InternalError" } };
    }

    return response;
};

module.exports = { handleStartTransaction };
