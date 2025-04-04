const dbService = require("../services/dbService");
const logger = require("../../utils/logger");
const { framevalidation } = require("../validation/framevalidation");
const { broadcastMessage } = require("../WebsocketHandler");
const Chargercontrollers = require("../Chargercontrollers");

const validateMeterValues = (data) => {
    return framevalidation(data, "MeterValues.json"); // Ensure correct schema is used
};


const handleMeterValues = async (uniqueIdentifier, requestPayload, requestId, wsConnections) => {
    let response = [3, requestId, {}];

    // Validate request payload
    const validationResult = validateMeterValues(requestPayload);
    if (!validationResult.isValid) {
        logger.loggerError(`Metervalue validation failed: ${JSON.stringify(validationResult.errors)}`);
        response[2] = { idTagInfo: { status: "Invalid" } };
        return response;
    }

    try {


    } catch (error) {
        logger.loggerError(`Error in handleMeterValues: ${error.message}`);
        response[2] = { idTagInfo: { status: "InternalError" } };
    }

    return response;
};

module.exports = { handleMeterValues };
