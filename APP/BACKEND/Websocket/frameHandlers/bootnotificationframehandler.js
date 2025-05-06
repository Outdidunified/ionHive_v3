const dbService = require("../services/dbService");
const logger = require('../../utils/logger');
const { framevalidation } = require("../validation/framevalidation");

const validateBootNotification = (data) => {
    return framevalidation(data, "BootNotification.json");
};

const handleBootNotification = async (uniqueIdentifier, requestPayload, requestId) => {
    // Initialize with correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
    let response = [3, requestId];

    try {
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
                response[2] = {
                    status: "Accepted",
                    currentTime: new Date().toISOString(),
                    interval: 15
                };

                // Add metadata for internal use
                // This will be processed by the WebsocketHandler before sending to the client
                response.metadata = {
                    broadcastData: true,
                    success: true
                };
            } else {
                logger.loggerError(`ChargerID: ${uniqueIdentifier} - Failed to update charger details`);
                response[2] = {
                    status: "Rejected"
                };

                // Add metadata for internal use
                response.metadata = {
                    success: false,
                    error: "Failed to update charger details in database"
                };
            }
        } else {
            logger.loggerError(`Validation failed for BootNotification: ${JSON.stringify(validationResult.details)}`);
            response[2] = {
                status: "Rejected"
            };

            // Add metadata for internal use
            response.metadata = {
                success: false,
                error: "Validation failed",
                details: validationResult.details
            };
        }
    } catch (error) {
        logger.loggerError(`Error processing BootNotification for ${uniqueIdentifier}: ${error.message}`);
        response[2] = {
            status: "Rejected"
        };

        // Add metadata for internal use
        response.metadata = {
            success: false,
            error: error.message
        };
    }

    return response;
};

module.exports = { handleBootNotification };
