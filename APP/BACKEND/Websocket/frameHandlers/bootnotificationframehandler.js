const dbService = require("../services/dbService");
const logger = require('../../utils/logger');
const { validateBootNotification } = require("../../middlewares/validation/indexValidation");

const handleBootNotification = async (uniqueIdentifier, requestPayload, requestId) => {
    let response = [3, requestId, {}];
    const errors = validateBootNotification(requestPayload);

    if (errors.length === 0) {
        const updateData = {
            vendor: requestPayload.chargePointVendor,
            model: requestPayload.chargePointModel,
            type: requestPayload.meterType,
            modified_date: new Date(),
        };

        const updateResult = await dbService.updateChargerDetails(uniqueIdentifier, updateData);

        if (updateResult) {
            logger.loggerSuccess(`ChargerID: ${uniqueIdentifier} - Updated charger details successfully`);
            const status = await dbService.checkChargerTagId(uniqueIdentifier, requestPayload.connectorId);
            response.push({ status, currentTime: new Date().toISOString(), interval: 15 });
        } else {
            logger.loggerError(`ChargerID: ${uniqueIdentifier} - Failed to update charger details`);
            response.push({ status: "Rejected" });
        }
    } else {
        logger.loggerError(`Validation failed for BootNotification: ${errors.join(", ")}`);
        response.push({ status: "Rejected", errors });
    }

    return response;
};

module.exports = { handleBootNotification };
