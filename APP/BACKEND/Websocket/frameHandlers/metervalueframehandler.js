const dbService = require("../services/dbService");
const logger = require("../../utils/logger");
const { framevalidation } = require("../validation/framevalidation");
const Chargercontrollers = require("../Chargercontrollers");

const validateMeterValues = (data) => {
    return framevalidation(data, "MeterValues.json"); // Ensure correct schema is used
};


const handleMeterValues = async (uniqueIdentifier, requestPayload, requestId, wsConnections, meterValuesMap, sessionFlags, chargingSessionID, ClientWss) => {
    // Initialize with correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
    let response = [3, requestId];

    // Validate request payload
    const validationResult = validateMeterValues(requestPayload);
    if (!validationResult.isValid) {
        logger.loggerError(`Metervalue validation failed: ${JSON.stringify(validationResult.errors)}`);
        response[2] = { idTagInfo: { status: "Invalid" } };
        return response;
    }

    try {
        const connectorId = requestPayload.connectorId;
        const key = `${uniqueIdentifier}_${connectorId}`; // Create a composite key
        const UniqueChargingSessionId = chargingSessionID.get(key); // Use the current session ID
        const sendTo = wsConnections.get(uniqueIdentifier);
        const clientIpAddress = sendTo?.socket?.remoteAddress || "unknown";

        // Get meter values for this session using the helper function
        let meterValues = getMeterValues(key);

        let autostopSettings;

        // Process meter values
        if (requestPayload.meterValue && requestPayload.meterValue.length > 0) {
            // If this is the first meter value for this session
            if (!meterValues.firstMeterValues && !meterValues.connectorId) {
                // Get user and autostop settings
                const user = await dbService.getUserEmail(uniqueIdentifier, connectorId);
                autostopSettings = await dbService.getAutostop(user);
                meterValues.autostopSettings = autostopSettings;

                // Capture first meter values
                meterValues.connectorId = connectorId;
                meterValues.firstMeterValues = await captureMetervalues(requestId, requestPayload, uniqueIdentifier, clientIpAddress, UniqueChargingSessionId, connectorId);
                meterValues.lastMeterValues = meterValues.firstMeterValues;

                logger.loggerInfo(`First MeterValues for ${uniqueIdentifier} for Connector ${connectorId}: ${meterValues.firstMeterValues}`);
                logger.loggerInfo(`Last MeterValues for ${uniqueIdentifier} for Connector ${connectorId}: ${meterValues.lastMeterValues}`);
            } else {
                // Update last meter values
                autostopSettings = meterValues.autostopSettings;
                meterValues.lastMeterValues = await captureMetervalues(requestId, requestPayload, uniqueIdentifier, clientIpAddress, UniqueChargingSessionId, connectorId);
                logger.loggerInfo(`Last MeterValues for ${uniqueIdentifier} for Connector ${connectorId}: ${meterValues.lastMeterValues}`);
            }

            // Process meter values and handle autostop
            await processMeterValues(
                meterValues.firstMeterValues,
                meterValues.lastMeterValues,
                autostopSettings,
                uniqueIdentifier,
                connectorId,
                wsConnections,
                sendTo,
                ClientWss
            );

            // Update the meter values map
            meterValuesMap.set(key, meterValues);
        }

    } catch (error) {
        logger.loggerError(`Error in handleMeterValues: ${error.message}`);
        response[2] = { idTagInfo: { status: "InternalError" } };
    }

    return response;
};

// Helper function to process meter values and handle autostop
const processMeterValues = async (firstMeter, lastMeter, settings, identifier, connector, wsConnections, ws, ClientWss) => {
    try {
        if (!settings) {
            logger.loggerWarn(`No autostop settings found for ${identifier}, connector ${connector}`);
            return;
        }

        // Unit-based autostop
        if (settings.isUnitChecked && settings.unit_value) {
            logger.loggerInfo('Unit autostop - processing');
            await autostop_unit(firstMeter, lastMeter, settings, identifier, connector, wsConnections);
        }

        // Price-based autostop
        if (settings.isPriceChecked && settings.price_value) {
            logger.loggerInfo('Price autostop - processing');
            await autostop_price(firstMeter, lastMeter, settings, identifier, connector, wsConnections);
        }

        // Calculate and broadcast live price
        const { livePrice, unit_consumed } = await calculateLivePrice(firstMeter, lastMeter, settings, identifier, connector);

        // Prepare broadcast message with live price
        const sendLivePrice = [
            2,
            "oyw5b1rw3deh4rzi",
            "ChargerLivePrice",
            {
                connectorId: connector,
                livePrice: livePrice,
                unit_consumed: unit_consumed,
                timestamp: new Date().toISOString()
            }
        ];

        logger.loggerInfo(`ChargerID ${identifier} - Live price ${livePrice}`);

        // Add broadcast data to response for WebsocketHandler to handle
        if (ClientWss && ws) {
            // Create a JSON message to broadcast
            const jsonMessage = JSON.stringify({ DeviceID: identifier, message: sendLivePrice });

            // Broadcast to all clients except the sender
            ClientWss.clients.forEach(client => {
                if (client !== ws && client.readyState === 1) { // 1 = WebSocket.OPEN
                    client.send(jsonMessage, (error) => {
                        if (error) {
                            logger.loggerError(`Error sending message: ${error.message}`);
                        }
                    });
                }
            });
        }
    } catch (error) {
        logger.loggerError(`Error in processMeterValues: ${error.message}`);
    }
};

// Helper function to extract meter value from the meterValue array
const extractMeterValue = (meterValueArray) => {
    try {
        if (!meterValueArray || !Array.isArray(meterValueArray) || meterValueArray.length === 0) {
            return 0;
        }

        // Look for Energy.Active.Import.Register which is typically the main meter reading
        for (const meterValue of meterValueArray) {
            if (meterValue.sampledValue && Array.isArray(meterValue.sampledValue)) {
                for (const sample of meterValue.sampledValue) {
                    if (sample.measurand === "Energy.Active.Import.Register" || !sample.measurand) {
                        return parseFloat(sample.value);
                    }
                }
            }
        }

        // If no specific measurand found, try to get the first value
        if (meterValueArray[0].sampledValue && meterValueArray[0].sampledValue[0]) {
            return parseFloat(meterValueArray[0].sampledValue[0].value);
        }

        return 0;
    } catch (error) {
        logger.loggerError(`Error in extractMeterValue: ${error.message}`);
        return 0;
    }
};

// Helper function to get meter values from the map
const getMeterValues = (key) => {
    if (!meterValuesMap.has(key)) {
        meterValuesMap.set(key, {});
    }
    return meterValuesMap.get(key);
};

// Helper function to capture meter values from the request
async function captureMetervalues(requestId, requestData, uniqueIdentifier, clientIpAddress, UniqueChargingSessionId, connectorId) {
    try {
        if (!requestData.meterValue || !requestData.meterValue.length) {
            return 0;
        }

        // Extract the meter value using the helper function
        const meterValue = extractMeterValue(requestData.meterValue);

        // Create a key-value pair for database storage
        const keyValuePair = {};

        // Add all sampled values to the key-value pair
        if (requestData.meterValue[0].sampledValue && Array.isArray(requestData.meterValue[0].sampledValue)) {
            requestData.meterValue[0].sampledValue.forEach((sampledValue) => {
                const measurand = sampledValue.measurand || 'Value';
                const value = sampledValue.value;
                keyValuePair[measurand] = value;
            });
        }

        // Add metadata
        const currentTime = new Date().toISOString();
        keyValuePair.charger_id = uniqueIdentifier;
        keyValuePair.Timestamp = currentTime;
        keyValuePair.clientIP = clientIpAddress;
        keyValuePair.SessionID = UniqueChargingSessionId;
        keyValuePair.connectorId = connectorId;
        keyValuePair.requestId = requestId;

        // Store in database
        const ChargerValue = JSON.stringify(keyValuePair);
        await dbService.SaveChargerValue(ChargerValue);
        await dbService.updateTime(uniqueIdentifier, connectorId);

        // Log the captured meter value
        logger.loggerInfo(`Captured meter value for ${uniqueIdentifier}, connector ${connectorId}: ${meterValue}`);

        return meterValue;
    } catch (error) {
        logger.loggerError(`Error capturing meter values: ${error.message}`);
        return 0;
    }
};

// Helper function for unit-based autostop
const autostop_unit = async (firstMeter, lastMeter, settings, identifier, connector, wsConnections) => {
    try {
        if (!settings.isUnitChecked || !settings.unit_value) {
            return;
        }

        const unitsConsumed = lastMeter - firstMeter;
        logger.loggerInfo(`Units consumed: ${unitsConsumed}, limit: ${settings.unit_value}`);

        if (unitsConsumed >= settings.unit_value) {
            logger.loggerInfo(`Autostop triggered for ${identifier}, connector ${connector} - Unit limit reached`);
            await Chargercontrollers.chargerStopCall(identifier, connector, wsConnections);
        }
    } catch (error) {
        logger.loggerError(`Error in autostop_unit: ${error.message}`);
    }
};

// Helper function for price-based autostop
const autostop_price = async (firstMeter, lastMeter, settings, identifier, connector, wsConnections) => {
    try {
        if (!settings.isPriceChecked || !settings.price_value) {
            return;
        }

        const unitsConsumed = lastMeter - firstMeter;
        const pricePerUnit = await dbService.getPricePerUnit(identifier, connector);
        const totalPrice = unitsConsumed * pricePerUnit;

        logger.loggerInfo(`Price calculated: ${totalPrice}, limit: ${settings.price_value}`);

        if (totalPrice >= settings.price_value) {
            logger.loggerInfo(`Autostop triggered for ${identifier}, connector ${connector} - Price limit reached`);
            await Chargercontrollers.chargerStopCall(identifier, connector, wsConnections);
        }
    } catch (error) {
        logger.loggerError(`Error in autostop_price: ${error.message}`);
    }
};

// Helper function to calculate live price and check wallet balance
const calculateLivePrice = async (firstMeter, lastMeter, settings, identifier, connector) => {
    try {
        // Calculate units consumed and price
        const unitsConsumed = lastMeter - firstMeter;
        const pricePerUnit = await dbService.getPricePerUnit(identifier, connector);
        const livePrice = unitsConsumed * pricePerUnit;

        logger.loggerInfo(`Live price calculation for ${identifier}, connector ${connector}: ${unitsConsumed} units at ${pricePerUnit} per unit = ${livePrice}`);

        // Check if wallet balance is sufficient
        if (settings && settings.wallet_balance && livePrice >= parseFloat(settings.wallet_balance)) {
            logger.loggerInfo(`Autostop triggered for ${identifier}, connector ${connector} - Insufficient wallet balance (${settings.wallet_balance})`);
            await Chargercontrollers.chargerStopCall(identifier, connector);
        }

        return { livePrice, unit_consumed: unitsConsumed };
    } catch (error) {
        logger.loggerError(`Error calculating live price: ${error.message}`);
        return { livePrice: 0, unit_consumed: 0 };
    }
};

// This is a duplicate function that was accidentally left in the file
// Using the extractMeterValue function defined above
/*const extractMeterValue = (meterValueArray) => {
    if (!meterValueArray || !Array.isArray(meterValueArray) || meterValueArray.length === 0) {
        return null;
    }
    
    // Look for Energy.Active.Import.Register which is typically the main meter reading
    for (const meterValue of meterValueArray) {
        if (meterValue.sampledValue && Array.isArray(meterValue.sampledValue)) {
            for (const sample of meterValue.sampledValue) {
                if (sample.measurand === "Energy.Active.Import.Register" || !sample.measurand) {
                    return parseFloat(sample.value);
                }
            }
        }
    }
    
    // If no specific measurand found, try to get the first value
    if (meterValueArray[0].sampledValue && meterValueArray[0].sampledValue[0]) {
        return parseFloat(meterValueArray[0].sampledValue[0].value);
    }
    
    return null;
}*/

module.exports = { handleMeterValues };
