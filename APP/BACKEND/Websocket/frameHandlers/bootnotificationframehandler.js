const dbService = require("../services/dbService");
const logger = require('../../utils/logger');
const { framevalidation } = require("../validation/framevalidation");

const validateBootNotification = (data) => {
    return framevalidation(data, "BootNotification.json");
};

const handleBootNotification = async (uniqueIdentifier, requestPayload, requestId) => {
    // Initialize with correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
    let response = [3, requestId];
    const validationResult = validateBootNotification(requestPayload);

    if (!validationResult.error) {
        const updateData = {
            vendor: requestPayload.chargePointVendor,
            model: requestPayload.chargePointModel,
            type: requestPayload.meterType,
            modified_date: new Date(),
        };

        const updateResult = await dbService.updateChargerDetails(uniqueIdentifier, updateData);

        if (updateResult) {
            logger.loggerSuccess(`ChargerID: ${uniqueIdentifier} - Updated charger details successfully`);
            // BootNotification doesn't include connectorId, so we'll use "Accepted" status directly
            // Set the payload as the third element (OCPP 1.6 compliant)
            response[2] = { status: "Accepted", currentTime: new Date().toISOString(), interval: 15 };

            // If there's broadcast data to be added, add it as a fourth element
            // This will be handled specially in the WebsocketHandler
            response[3] = { broadcastData: true };
        } else {
            logger.loggerError(`ChargerID: ${uniqueIdentifier} - Failed to update charger details`);
            response[2] = { status: "Rejected" };
        }
    } else {
        logger.loggerError(`Validation failed for BootNotification: ${JSON.stringify(validationResult.details)}`);
        response[2] = { status: "Rejected", errors: validationResult.details };
    }

    return response;
};

module.exports = { handleBootNotification };
