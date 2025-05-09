const dbService = require("../services/dbService");
const logger = require("../../utils/logger");
const { framevalidation } = require("../validation/framevalidation");
const Chargercontrollers = require("../Chargercontrollers");

const validateMeterValues = (data) => {
    return framevalidation(data, "MeterValues.json"); // Ensure correct schema is used
};


const handleMeterValues = async (uniqueIdentifier, requestPayload, requestId, wsConnections, meterValuesMap, sessionFlags, chargingSessionID, ClientWss) => {
    // Initialize with correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
    let response = [3, requestId, {}];

    try {
        // Validate request payload
        const validationResult = validateMeterValues(requestPayload);
        if (!validationResult.isValid) {
            logger.loggerError(`Metervalue validation failed: ${JSON.stringify(validationResult.errors)}`);

            // Add metadata for internal use
            response.metadata = {
                success: false,
                error: "Validation failed",
                details: validationResult.errors
            };

            return response;
        }
        const connectorId = requestPayload.connectorId;
        const key = `${uniqueIdentifier}_${connectorId}`; // Create a composite key
        const UniqueChargingSessionId = chargingSessionID.get(key); // Use the current session ID
        const sendTo = wsConnections.get(uniqueIdentifier);
        const clientIpAddress = sendTo?.socket?.remoteAddress || "unknown";

        // Get meter values for this session using the helper function
        let meterValues = getMeterValues(key, meterValuesMap);

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

        // Add metadata for successful processing
        response.metadata = {
            success: true
        };
    } catch (error) {
        logger.loggerError(`Error in handleMeterValues: ${error.message}`);

        // Add metadata for internal use
        response.metadata = {
            success: false,
            error: error.message
        };
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

        // Calculate and broadcast live price and vehicle analytics
        const { livePrice, unit_consumed, vehicleAnalytics } = await calculateLivePrice(firstMeter, lastMeter, settings, identifier, connector, wsConnections);

        // Prepare broadcast message with live price and vehicle analytics
        // Generate a unique ID for the broadcast message
        const broadcastId = `live_price_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sendLivePrice = [
            2,
            broadcastId,
            "ChargerLivePrice",
            {
                connectorId: connector,
                livePrice: livePrice,
                unit_consumed: unit_consumed,
                timestamp: new Date().toISOString(),
                vehicleAnalytics: {
                    batteryPercentage: vehicleAnalytics.batteryPercentage,
                    rangeAdded: vehicleAnalytics.rangeAdded,
                    energyConsumed: vehicleAnalytics.energyConsumed,
                    energyConsumptionRate: vehicleAnalytics.energyConsumptionRate,
                    usageTimeMinutes: vehicleAnalytics.usageTimeMinutes,
                    estimatedMileage: vehicleAnalytics.estimatedMileage,
                    vehicleModel: vehicleAnalytics.vehicleModel,
                    vehicleType: vehicleAnalytics.vehicleType
                }
            }
        ];

        logger.loggerInfo(`ChargerID ${identifier} - Live price ${livePrice}`);
        logger.loggerInfo(`ChargerID ${identifier} - Vehicle analytics: ${vehicleAnalytics.vehicleModel} (${vehicleAnalytics.vehicleType}): Battery ${vehicleAnalytics.batteryPercentage}%, Range added ${vehicleAnalytics.rangeAdded}km, Energy consumed ${vehicleAnalytics.energyConsumed}kWh`);

        // Add broadcast data to response for WebsocketHandler to handle
        if (ClientWss && ws) {
            try {
                // Import the client connection utilities for targeted broadcasting
                const clientConnectionUtils = require('../utils/clientConnectionUtils');

                // Use the targeted broadcast function to send only to clients subscribed to this charger/connector
                clientConnectionUtils.broadcastToSubscribedClients(identifier, connector, sendLivePrice, ClientWss, ws);

                logger.loggerInfo(`Broadcasting meter values to clients subscribed to charger ${identifier}, connector ${connector}`);

                logger.loggerInfo(`Successfully broadcasted live price and vehicle analytics for ${identifier}`);
            } catch (error) {
                logger.loggerError(`Error broadcasting message: ${error.message}`);

                // Fallback to direct broadcast if the enhanced function fails
                // Only broadcast to clients that have subscribed to this specific charger and connector
                const jsonMessage = JSON.stringify({
                    DeviceID: identifier,
                    message: sendLivePrice,
                    timestamp: new Date().toISOString(),
                    connectorId: connector,
                    connectionData: {
                        chargerId: identifier,
                        connectorId: connector,
                        isConnected: true,
                        connectionType: "websocket",
                        lastActivity: new Date().toISOString()
                    }
                });

                // Try to find clients subscribed to this charger/connector
                logger.loggerInfo(`Fallback: Looking for clients subscribed to charger ${identifier}, connector ${connector}`);

                // Get the client subscription utility
                const clientConnectionUtils = require('../utils/clientConnectionUtils');
                const subscribedClientIds = clientConnectionUtils.getSubscribedClients(identifier, connector);

                if (subscribedClientIds.size > 0) {
                    logger.loggerInfo(`Fallback: Found ${subscribedClientIds.size} subscribed clients`);

                    // Broadcast only to subscribed clients
                    ClientWss.clients.forEach(client => {
                        if (client !== ws && client.readyState === 1 && // 1 = WebSocket.OPEN
                            client.clientId && subscribedClientIds.has(client.clientId)) {
                            client.send(jsonMessage, (error) => {
                                if (error) {
                                    logger.loggerError(`Error sending message to client ${client.clientId}: ${error.message}`);
                                } else {
                                    logger.loggerInfo(`Fallback: Successfully sent to client ${client.clientId}`);
                                }
                            });
                        }
                    });
                } else {
                    logger.loggerInfo(`Fallback: No clients subscribed to charger ${identifier}, connector ${connector}`);
                }
            }
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
const getMeterValues = (key, meterValuesMap) => {
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

// Helper function to calculate live price, vehicle analytics, and check wallet balance
const calculateLivePrice = async (firstMeter, lastMeter, settings, identifier, connector, wsConnections) => {
    try {
        // Calculate units consumed and price
        const unitsConsumed = parseFloat((lastMeter - firstMeter) / 1000).toFixed(2);

        const pricePerUnit = await dbService.getPricePerUnit(identifier, connector);
        logger.loggerInfo(`Calculating live price for ${identifier}, connector ${connector}: Units Consumed: ${unitsConsumed}, Price Per Unit: ${pricePerUnit}`);
        const livePrice = unitsConsumed * pricePerUnit;

        logger.loggerInfo(`Live price calculation for ${identifier}, connector ${connector}: ${unitsConsumed} units consumed at ${pricePerUnit} per unit = ${livePrice}`);
        // Check if wallet balance is sufficient
        if (settings && settings.wallet_balance && livePrice >= parseFloat(settings.wallet_balance)) {
            logger.loggerInfo(`Autostop triggered for ${identifier}, connector ${connector} - Insufficient wallet balance (${settings.wallet_balance})`);
            await Chargercontrollers.chargerStopCall(identifier, connector, wsConnections);
        }

        // Get user email for this charging session
        const userEmail = await dbService.getUserEmail(identifier, connector);

        // Get vehicle data for the user
        const vehicleData = await dbService.getUserVehicleData(userEmail);

        // Calculate vehicle analytics
        const energyConsumed = unitsConsumed; // kWh

        // Calculate battery percentage based on energy consumed and battery capacity
        // For a 2-wheeler with 4.5 kWh battery, each kWh is about 22% of battery
        const batteryPercentageFromCharge = Math.min(100, Math.round((energyConsumed / vehicleData.batteryCapacity) * 100));

        // Calculate estimated range added based on average consumption
        // For TVS iQube, typical range is about 100km on full charge (4.5kWh)
        const rangeAdded = vehicleData.averageConsumption > 0
            ? Math.round(energyConsumed / vehicleData.averageConsumption)
            : Math.round(energyConsumed * 22); // Fallback: ~22km per kWh for 2-wheelers

        // Calculate energy consumption rate (kWh/km)
        const energyConsumptionRate = rangeAdded > 0
            ? parseFloat((energyConsumed / rangeAdded).toFixed(3))
            : vehicleData.averageConsumption;

        // Calculate usage time (in minutes) - assuming this is from the start of the session
        const usageTimeMinutes = Math.round((new Date() - vehicleData.lastChargeTime) / (1000 * 60));
        const safeEnergyConsumed = Number.isFinite(energyConsumed) ? energyConsumed : 0;

        // Return all calculated values
        return {
            livePrice,
            unit_consumed: unitsConsumed,
            vehicleAnalytics: {
                batteryPercentage: batteryPercentageFromCharge,
                rangeAdded: rangeAdded,
                energyConsumed: parseFloat(safeEnergyConsumed.toFixed(2)),
                energyConsumptionRate: energyConsumptionRate,
                usageTimeMinutes: usageTimeMinutes,
                estimatedMileage: vehicleData.mileage + rangeAdded,
                vehicleModel: vehicleData.vehicleModel || "TVS iQube",
                vehicleType: vehicleData.vehicleType || "2-wheeler"
            }
        };
    } catch (error) {
        logger.loggerError(`Error calculating live price and vehicle analytics: ${error.message}`);
        return {
            livePrice: 0,
            unit_consumed: 0,
            vehicleAnalytics: {
                batteryPercentage: 0,
                rangeAdded: 0,
                energyConsumed: 0,
                energyConsumptionRate: 0,
                usageTimeMinutes: 0,
                estimatedMileage: 0,
                vehicleModel: "TVS iQube",
                vehicleType: "2-wheeler"
            }
        };
    }
};

// Duplicate function has been removed

module.exports = {
    handleMeterValues,
    getMeterValues
};
