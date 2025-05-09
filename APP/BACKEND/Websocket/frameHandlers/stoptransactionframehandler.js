const dbService = require("../services/dbService");
const logger = require("../../utils/logger");
const { framevalidation } = require("../validation/framevalidation");

// Validate StopTransaction request
const validateStopTransaction = (data) => {
    return framevalidation(data, "StopTransaction.json");
};

// Get meter values from the map
const getMeterValues = (key, meterValuesMap) => {
    if (!meterValuesMap.has(key)) {
        meterValuesMap.set(key, {});
    }
    return meterValuesMap.get(key);
};

// Calculate the difference between first and last meter values
const calculateDifference = async (firstMeterValues, lastMeterValues, uniqueIdentifier, connectorId, sessionId) => {
    try {
        const startEnergy = firstMeterValues || 0;
        const lastEnergy = lastMeterValues || 0;
        logger.loggerInfo(`Start Energy: ${startEnergy}, Last Energy: ${lastEnergy}`);

        const differ = parseFloat(lastEnergy - startEnergy);
        let calculatedUnit = parseFloat(differ / 1000).toFixed(2);

        let unit;
        if (calculatedUnit === null || isNaN(parseFloat(calculatedUnit))) {
            unit = 0;
        } else {
            unit = calculatedUnit;
        }

        const { sessionPrice } = await calculatePrice(unit, uniqueIdentifier);
        const formattedSessionPrice = isNaN(sessionPrice) || sessionPrice === 'NaN' ? 0 : parseFloat(sessionPrice).toFixed(2);
        logger.loggerInfo(`Session Price: ${formattedSessionPrice}`);

        // Update commission to wallet
        const commissionUpdateResult = await UpdateCommissionToWallet(formattedSessionPrice, uniqueIdentifier, sessionId, unit);

        if (commissionUpdateResult) {
            logger.loggerSuccess('Commission updated to wallet successfully');
        } else {
            logger.loggerWarn('Commission failed to update');
        }

        // Update cumulative energy
        const updateCumulativeEnergyResult = await updateCumulativeEnergy(uniqueIdentifier, connectorId, startEnergy, lastEnergy);
        if (updateCumulativeEnergyResult.success) {
            logger.loggerSuccess(`Cumulative energy updated successfully: ${updateCumulativeEnergyResult.cumulativeEnergy} kWh`);
        } else {
            logger.loggerWarn('Cumulative energy failed to update');
        }

        return { unit, sessionPrice: formattedSessionPrice };
    } catch (error) {
        logger.loggerError(`Error calculating session difference: ${error.message}`);
        return { unit: 0, sessionPrice: 0 };
    }
};

// Calculate price based on unit and charger ID
async function calculatePrice(unit, uniqueIdentifier) {
    try {
        // Get price per unit for this connector
        const pricePerUnit = await dbService.getPricePerUnit(uniqueIdentifier);

        // Calculate total price
        const sessionPrice = unit * pricePerUnit;

        logger.loggerInfo(`Price calculation: ${unit} units at ${pricePerUnit} per unit = ${sessionPrice} for ${uniqueIdentifier}`);

        return { sessionPrice };
    } catch (error) {
        logger.loggerError(`Error calculating price: ${error.message}`);
        return { sessionPrice: 0 };
    }
}

// Update session details with financial information
async function updateSessionDetails(sessionID, totalUnit, financeDetails, clientCommission, resellerCommission) {
    try {
        const db = await dbService.connectToDatabase();
        const DeviceSessionDetailsCollection = db.collection('device_session_details'); // New collection for session details
        const EB_fee = parseFloat(financeDetails.eb_charge); // Fetch the unit price from the database
        const unit = parseFloat(totalUnit).toFixed(2);

        // List of charges (excluding GST) per unit
        const additionalCharges = [
            parseFloat(financeDetails.margin),
            parseFloat(financeDetails.parking_fee),
            parseFloat(financeDetails.convenience_fee),
            parseFloat(financeDetails.station_fee),
            parseFloat(financeDetails.processing_fee),
            parseFloat(financeDetails.service_fee)
        ];

        // Calculate total additional charges (sum of all charges except GST) per unit
        const totalAdditionalChargesPerUnit = additionalCharges.reduce((sum, charge) => sum + charge, 0);

        // Base price per unit (including additional charges per unit)
        const basePricePerUnit = EB_fee + totalAdditionalChargesPerUnit; // This is per unit


        // Multiply by the number of units consumed
        const totalEBFee = parseFloat(EB_fee * unit).toFixed(2);
        const totalPrice = parseFloat(basePricePerUnit * unit).toFixed(2);

        // Apply GST on the base price per unit
        const gstPercentage = financeDetails.gst;
        const gstAmount = parseFloat((totalPrice * gstPercentage) / 100).toFixed(2);

        // Ensure that the totalFinalPrice equals the sessionPrice (this is the final price we will match)
        // Adjust commissions accordingly based on sessionPrice

        // Now we update the device_session_details with the breakdown of charges and commissions for total units consumed
        if (sessionID) {
            console.log(`SessionID - ${sessionID}`);
            const updateSessionResult = await DeviceSessionDetailsCollection.updateOne(
                { session_id: sessionID },
                {
                    $set: {
                        EB_fee: totalEBFee,  // Total EB fee for consumed units, rounded to 3 decimal places
                        gst_amount: gstAmount,  // Total GST for consumed units, rounded to 3 decimal places
                        parking_fee: (parseFloat(financeDetails.parking_fee) * unit).toFixed(2),  // Total parking fee for consumed units, rounded to 3 decimal places
                        convenience_fee: (parseFloat(financeDetails.convenience_fee) * unit).toFixed(2),  // Total convenience fee for consumed units, rounded to 3 decimal places
                        station_fee: (parseFloat(financeDetails.station_fee) * unit).toFixed(2),  // Total station fee for consumed units, rounded to 3 decimal places
                        processing_fee: (parseFloat(financeDetails.processing_fee) * unit).toFixed(2),  // Total processing fee for consumed units, rounded to 3 decimal places
                        service_fee: (parseFloat(financeDetails.service_fee) * unit).toFixed(2),  // Total service fee for consumed units, rounded to 3 decimal places
                        client_commission: parseFloat(clientCommission).toFixed(2),  // Client commission for total units, rounded to 3 decimal places
                        reseller_commission: parseFloat(resellerCommission).toFixed(2),  // Reseller commission for total units, rounded to 3 decimal places
                        association_commission: (parseFloat(financeDetails.margin) * unit).toFixed(2),  // Association commission for total units, rounded to 3 decimal places
                        gst_percentage: gstPercentage
                    }
                }

            );
            if (updateSessionResult.modifiedCount > 0) {
                logger.loggerSuccess(`Session details updated with financial information`);
                return true;
            } else {
                logger.loggerWarn(`Failed to update session details with financial information`);
                return false;
            }
        } else {
            logger.loggerWarn(`Session ID not provided`);
            return false;
        }
    } catch (error) {
        logger.loggerError(`Error updating session details: ${error.message}`);
        return false;
    }
}

// Update wallet balance for different entities
async function updateWallet(collection, id, amount, type, isAddition = true) {
    try {
        const walletField = `${type}_wallet`;
        const idField = `${type}_id`;
        const numericAmount = parseFloat(amount.toFixed(2));

        // Retrieve the current wallet value
        const getWallet = await collection.findOne({ [idField]: id });
        if (!getWallet) {
            logger.loggerWarn(`No ${type} record found for ID: ${id}`);
            return false;
        }

        const currentWallet = parseFloat(getWallet[walletField]) || 0;
        logger.loggerInfo(`updateWallet - ${walletField} (current): ${currentWallet}`);

        let updatedWallet = isAddition
            ? currentWallet + numericAmount
            : currentWallet - numericAmount;

        // Round to two decimals
        updatedWallet = parseFloat(updatedWallet.toFixed(2));
        logger.loggerInfo(`updateWallet - ${walletField} (updated): ${updatedWallet}`);

        // Ensure the wallet doesn't go negative
        if (updatedWallet < 0) {
            logger.loggerWarn(`Cannot ${isAddition ? 'credit' : 'debit'} ${numericAmount} to/from ${type} wallet for ID: ${id}. Balance would go negative.`);
            return false;
        }

        // Update the wallet in the database
        const updateResult = await collection.updateOne(
            { [idField]: id },
            { $set: { [walletField]: updatedWallet } }
        );

        if (updateResult.modifiedCount > 0) {
            logger.loggerSuccess(`${type} wallet successfully ${isAddition ? 'credited' : 'debited'} by ${numericAmount}. New balance: ${updatedWallet}`);
            return true;
        } else {
            logger.loggerWarn(`Failed to update ${type} wallet for ID: ${id}. No changes were made.`);
            return false;
        }
    } catch (error) {
        logger.loggerError(`Error updating ${type} wallet for ID: ${id}: ${error.message}`);
        throw new Error(`Unable to update ${type} wallet for ID: ${id}`);
    }
}

// Update commission to wallet
async function UpdateCommissionToWallet(sessionPrice, uniqueIdentifier, sessionID, unit) {
    try {
        const db = await dbService.connectToDatabase();
        const chargerDetailsCollection = db.collection('charger_details');
        const ResellerDetailsCollection = db.collection('reseller_details');
        const ClientDetailsCollection = db.collection('client_details');
        const AssociationDetailsCollection = db.collection('association_details');
        const FinanceDetailsCollection = db.collection('financeDetails');

        // Fetch charger details
        const chargerDetails = await chargerDetailsCollection.findOne({ charger_id: uniqueIdentifier });
        if (!chargerDetails) {
            throw new Error(`Charger with ID ${uniqueIdentifier} not found.`);
        }

        const financeID = chargerDetails.finance_id;
        const FinanceDetails = await FinanceDetailsCollection.findOne({ finance_id: financeID });
        const EB_Charge_perUnit = parseFloat(FinanceDetails.eb_charge); // Fetch unit price from DB

        const EB_Charge = parseFloat(EB_Charge_perUnit * unit).toFixed(2);

        // Extract commission percentages
        const clientCommissionPercentage = parseFloat(chargerDetails.client_commission);
        let clientCommission = ((EB_Charge * clientCommissionPercentage) / 100).toFixed(2);

        const resellerCommissionPercentage = parseFloat(chargerDetails.reseller_commission);
        let resellerCommission;

        // If client commission is 0, calculate reseller commission directly from EB_Charge
        if (clientCommissionPercentage === 0) {
            resellerCommission = ((EB_Charge * resellerCommissionPercentage) / 100).toFixed(2);
            clientCommission = 0; // Ensure client commission is zero
        } else {
            resellerCommission = ((clientCommission * resellerCommissionPercentage) / 100).toFixed(2);
        }

        logger.loggerInfo(`Client Commission: ${clientCommission}, Reseller Commission: ${resellerCommission}`);

        let resellerCommissionUpdate;
        let clientCommissionUpdate;
        let AssociationPriceUpdate;

        // Step 1: Add session price to Association Wallet
        if (chargerDetails.assigned_association_id) {
            const association_id = chargerDetails.assigned_association_id;
            const AssociationPrice = sessionPrice;

            AssociationPriceUpdate = await updateWallet(AssociationDetailsCollection, association_id, parseFloat(AssociationPrice), 'association');

            if (AssociationPriceUpdate && clientCommission > 0) {
                // Step 2: Deduct client commission from Association Wallet
                await updateWallet(AssociationDetailsCollection, association_id, parseFloat(clientCommission), 'association', false);
            }
        }

        // Step 3: Add client commission to Client Wallet (Only if client commission is not 0)
        if (chargerDetails.assigned_client_id && clientCommission > 0) {
            const client_id = chargerDetails.assigned_client_id;
            clientCommissionUpdate = await updateWallet(ClientDetailsCollection, client_id, parseFloat(clientCommission), 'client');
        }

        // Step 4: Deduct reseller commission from Client Wallet (If client commission is 0, deduct directly from client)
        if (chargerDetails.assigned_client_id && chargerDetails.assigned_reseller_id) {
            const client_id = chargerDetails.assigned_client_id;
            const reseller_id = chargerDetails.assigned_reseller_id;

            // Deduct reseller commission from client wallet
            resellerCommissionUpdate = await updateWallet(ClientDetailsCollection, client_id, parseFloat(resellerCommission), 'client', false);

            if (resellerCommissionUpdate) {
                // Step 5: Add reseller commission to Reseller Wallet
                await updateWallet(ResellerDetailsCollection, reseller_id, parseFloat(resellerCommission), 'reseller');
            }
        }

        await updateSessionDetails(parseInt(sessionID), unit, FinanceDetails, clientCommission, resellerCommission);

        if (resellerCommissionUpdate && (clientCommissionUpdate || clientCommission === 0) && AssociationPriceUpdate) {
            logger.loggerSuccess(`All commissions updated successfully!`);
            return true;
        } else {
            logger.loggerWarn(`All commissions failed to update!`);
            return false;
        }
    } catch (error) {
        logger.loggerError(`Error updating commission to wallet: ${error.message}`);
        return false;
    }
}

// Update cumulative energy for a charger connector
async function updateCumulativeEnergy(chargerId, connectorId, startValues, lastValues) {
    try {
        // Connect to the database
        const db = await dbService.connectToDatabase();
        const evDetailsCollection = db.collection('charger_details');

        // Fetch charger details
        const charger = await evDetailsCollection.findOne({ charger_id: chargerId });

        if (!charger) {
            logger.loggerWarn('Charger not found');
            return { success: false, message: 'Charger not found' };
        }

        const startEnergy = startValues || 0;
        const lastEnergy = lastValues || 0;
        logger.loggerInfo(`Start Energy: ${startEnergy}, Last Energy: ${lastEnergy}`);

        // Calculate energy difference in kWh
        const energyDifference = parseFloat(lastEnergy - startEnergy).toFixed(2);
        let calculatedUnit = parseFloat(energyDifference / 1000).toFixed(2);

        if (isNaN(parseFloat(calculatedUnit))) {
            calculatedUnit = 0;
        }

        // Define cumulative energy field dynamically based on connector ID
        const cumulativeEnergyField = `cumulativeEnergy_for_connector_${connectorId}`;

        // Update cumulative energy for the specific connector
        let newCumulativeEnergy = (charger[cumulativeEnergyField] || 0) + parseFloat(calculatedUnit);

        // Update the database with the new cumulative energy for this connector
        const updateResult = await evDetailsCollection.updateOne(
            { charger_id: chargerId },
            { $set: { [cumulativeEnergyField]: parseFloat(newCumulativeEnergy.toFixed(2)) } }
        );

        logger.loggerInfo(`Updated Cumulative Energy for Connector ${connectorId}: ${newCumulativeEnergy} kWh`);

        return { success: true, cumulativeEnergy: newCumulativeEnergy };
    } catch (error) {
        logger.loggerError(`Error updating cumulative energy: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Get username for the connector
const getUsername = async (uniqueIdentifier, connectorId) => {
    try {
        return await dbService.getUserEmail(uniqueIdentifier, connectorId);
    } catch (error) {
        logger.loggerError(`Error getting username: ${error.message}`);
        return null;
    }
};

// Create a new charging session when charging starts
const createChargingSession = async (uniqueIdentifier, connectorId, startTime, user, sessionId, connectorType) => {
    try {
        const db = await dbService.connectToDatabase();

        // Check if a session with this ID already exists
        const existingSession = await db.collection('device_session_details').findOne({
            charger_id: uniqueIdentifier,
            connector_id: parseInt(connectorId),
            session_id: sessionId
        });

        if (existingSession) {
            logger.loggerWarn(`Session already exists for ChargerID ${uniqueIdentifier}, ConnectorID ${connectorId}, SessionID ${sessionId}`);
            return false;
        }

        // Get charger details for additional information
        const chargerDetails = await db.collection('charger_details').findOne({ charger_id: uniqueIdentifier });

        const pricePerUnit = await dbService.getPricePerUnit(uniqueIdentifier, connectorId);

        // Create session data object with start time but no stop time
        const sessionData = {
            charger_id: uniqueIdentifier,
            connector_id: parseInt(connectorId),
            connector_type: connectorType || 'Unknown',
            session_id: sessionId,
            start_time: startTime,
            stop_time: null, // This will be updated when charging stops
            unit_consummed: 0, // Will be updated when charging stops
            price: 0, // Will be updated when charging stops
            unit_price: pricePerUnit,
            error_code: 'NoError',
            location: chargerDetails ? chargerDetails.landmark : 'Unknown',
            email_id: user,
            created_date: new Date(),
            status: true
        };

        // Insert session data into device_session_details collection
        const result = await db.collection('device_session_details').insertOne(sessionData);

        if (result.insertedId) {
            logger.loggerSuccess(`New charging session created for ChargerID ${uniqueIdentifier}, ConnectorID ${connectorId}, SessionID ${sessionId}`);
            return true;
        } else {
            logger.loggerError(`Failed to create new charging session for ChargerID ${uniqueIdentifier}, ConnectorID ${connectorId}`);
            return false;
        }
    } catch (error) {
        logger.loggerError(`Error creating charging session: ${error.message}`);
        return false;
    }
};

// Handle charging session data
const handleChargingSession = async (uniqueIdentifier, connectorId, startTime, stopTime, unit, sessionPrice, user, sessionId, connectorType, errorCode, stopReason, vendorErrorCode) => {
    try {
        const db = await dbService.connectToDatabase();

        // Format values for consistency
        let formattedUnit = unit;
        if (formattedUnit === null || isNaN(parseFloat(formattedUnit))) {
            formattedUnit = 0;
        }

        const formattedPrice = isNaN(sessionPrice) || sessionPrice === 'NaN' ? 0 : parseFloat(sessionPrice).toFixed(2);

        logger.loggerInfo(`Session details Session ID: ${sessionId} - Start: ${startTime}, Stop: ${stopTime}, Unit: ${formattedUnit}, Price: ${formattedPrice}`);

        // Check if a document with the same session ID already exists
        const existingSession = await db.collection('device_session_details').findOne({
            charger_id: uniqueIdentifier,
            connector_id: parseInt(connectorId),
            session_id: sessionId
        });

        logger.loggerInfo(`Existing session check: ${existingSession ? 'Found' : 'Not found'}`);

        if (existingSession) {
            // Session exists, update with stop time and final values
            if (existingSession.stop_time === null && existingSession.start_time !== null) {

                // Resolve error fields cleanly
                const resolvedErrorCode = errorCode || (vendorErrorCode ? 'VendorError' : 'NoError');
                const resolvedVendorErrorCode = vendorErrorCode || 'NoVendorError';
                const resolvedStopReason = stopReason || 'UnknownReason';

                // Update the existing session with stop time and final values
                const updateResult = await db.collection('device_session_details').updateOne(
                    {
                        charger_id: uniqueIdentifier,
                        connector_id: parseInt(connectorId),
                        session_id: sessionId,
                        stop_time: null
                    },
                    {
                        $set: {
                            stop_time: stopTime,
                            unit_consummed: formattedUnit,
                            price: formattedPrice,
                            error_code: resolvedErrorCode,
                            vendor_error_code: resolvedVendorErrorCode,
                            stop_reason: resolvedStopReason,
                            modified_date: new Date()
                        }
                    }
                );

                if (updateResult.modifiedCount > 0) {
                    logger.loggerSuccess(`Session updated with stop time for ChargerID ${uniqueIdentifier}, ConnectorID ${connectorId}, SessionID ${sessionId}`);

                    // Update user wallet balance if session price is available
                    if (formattedPrice > 0 && user) {
                        const userResult = await db.collection('users').updateOne(
                            { email_id: user },
                            { $inc: { wallet_bal: -formattedPrice } }
                        );

                        if (userResult.modifiedCount > 0) {
                            logger.loggerSuccess(`User ${user} wallet balance updated: -${formattedPrice}`);
                        } else {
                            logger.loggerError(`Failed to update wallet balance for user ${user}`);
                        }
                    }

                    return true;
                } else {
                    logger.loggerError(`Failed to update session with stop time for ChargerID ${uniqueIdentifier}, ConnectorID ${connectorId}, SessionID ${sessionId}`);
                    return false;
                }
            } else {
                logger.loggerWarn(`Session already has stop time or missing start time for ChargerID ${uniqueIdentifier}, ConnectorID ${connectorId}, SessionID ${sessionId}`);
                return false;
            }
        } else {
            // No existing session, create a new one with all data
            try {
                // Get charger details for additional information
                const chargerDetails = await db.collection('charger_details').findOne({ charger_id: uniqueIdentifier });

                const pricePerUnit = await dbService.getPricePerUnit(uniqueIdentifier, connectorId);


                // Create session data object
                const sessionData = {
                    charger_id: uniqueIdentifier,
                    connector_id: parseInt(connectorId),
                    connector_type: connectorType || 'Unknown',
                    session_id: sessionId,
                    start_time: startTime,
                    stop_time: stopTime,
                    unit_consummed: formattedUnit,
                    price: formattedPrice,
                    unit_price: pricePerUnit,
                    error_code: errorCode || 'NoError',
                    location: chargerDetails ? chargerDetails.landmark : 'Unknown',
                    email_id: user,
                    created_date: new Date(),
                    status: true
                };

                // Insert session data into device_session_details collection
                const result = await db.collection('device_session_details').insertOne(sessionData);

                if (result.insertedId) {
                    logger.loggerSuccess(`New charging session data saved for ChargerID ${uniqueIdentifier}, ConnectorID ${connectorId}, SessionID ${sessionId}`);

                    // Update user wallet balance if session price is available
                    if (formattedPrice > 0 && user) {
                        const userResult = await db.collection('users').updateOne(
                            { email_id: user },
                            { $inc: { wallet_bal: -formattedPrice } }
                        );

                        if (userResult.modifiedCount > 0) {
                            logger.loggerSuccess(`User ${user} wallet balance updated: -${formattedPrice}`);
                        } else {
                            logger.loggerError(`Failed to update wallet balance for user ${user}`);
                        }
                    }

                    return true;
                } else {
                    logger.loggerError(`Failed to save new charging session data for ChargerID ${uniqueIdentifier}, ConnectorID ${connectorId}`);
                    return false;
                }
            } catch (error) {
                logger.loggerError(`Error creating new session: ${error.message}`);
                return false;
            }
        }
    } catch (error) {
        logger.loggerError(`Error handling charging session: ${error.message}`);
        return false;
    }
};

// Handle StopTransaction requests
const handleStopTransaction = async (
    uniqueIdentifier,
    requestPayload,
    requestId,
    wsConnections,
    sessionFlags,
    charging_states,
    startedChargingSet,
    chargerStopTime,
    meterValuesMap,
    chargingSessionID,
    chargerStartTime
) => {
    // Initialize chargerStartTime and chargerStopTime if they don't exist
    if (!chargerStartTime) {
        logger.loggerWarn("chargerStartTime is not defined, creating a new Map");
        chargerStartTime = new Map();
    }

    if (!chargerStopTime) {
        logger.loggerWarn("chargerStopTime is not defined, creating a new Map");
        chargerStopTime = new Map();
    }
    // Initialize with correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
    let response = [3, requestId];

    try {
        // Validate request payload
        const validationResult = validateStopTransaction(requestPayload);
        if (validationResult.error) {
            logger.loggerError(`StopTransaction validation failed: ${JSON.stringify(validationResult.details)}`);
            response[2] = { idTagInfo: { status: "Invalid" } };

            // Add metadata for internal use
            response.metadata = {
                success: false,
                error: "Validation failed",
                details: validationResult.details
            };

            return response;
        }
        // Get the idTag and transactionId from the request
        const { idTag, transactionId, timestamp, meterStop } = requestPayload;

        // Get the connector ID from the transaction ID
        let connectorId;
        try {
            connectorId = await dbService.getConnectorId(uniqueIdentifier, transactionId);
        } catch (error) {
            logger.loggerError(`Error getting connector ID: ${error.message}`);
            response[2] = { idTagInfo: { status: "Invalid" } };

            // Add metadata for internal use
            response.metadata = {
                success: false,
                error: `Error getting connector ID: ${error.message}`
            };

            return response;
        }

        // Check authorization
        const { status, expiryDate } = await dbService.checkAuthorization(uniqueIdentifier, idTag);

        logger.loggerInfo(`ChargerID ${uniqueIdentifier} - StopTransaction authorization status: ${status}`);

        // Create the response
        response[2] = {
            idTagInfo: {
                status,
                expiryDate: expiryDate || new Date().toISOString()
            }
        };

        // Update the in-use status
        const updateResult = await dbService.updateInUse(uniqueIdentifier, idTag, connectorId);

        // Create a composite key for the connector
        const key = `${uniqueIdentifier}_${connectorId}`;

        // Update the charging state
        if (charging_states.get(key) === true) {
            sessionFlags.set(key, 1);
            chargerStopTime.set(key, timestamp);
            charging_states.set(key, false);
            startedChargingSet.delete(key);
            logger.loggerSuccess(`ChargerID ${uniqueIdentifier}, ConnectorID ${connectorId}: Charging stopped.`);

            // Save the final meter value
            try {
                const chargerValue = JSON.stringify({
                    charger_id: uniqueIdentifier,
                    connectorId: parseInt(connectorId),
                    meterStop: meterStop,
                    timestamp: timestamp,
                    transactionId: transactionId
                });

                await dbService.SaveChargerValue(chargerValue);
                logger.loggerSuccess(`Final meter value saved for ChargerID ${uniqueIdentifier}, ConnectorID ${connectorId}`);
            } catch (error) {
                logger.loggerError(`Error saving final meter value: ${error.message}`);
            }
        }

        // Process session data if session flag is set
        if (sessionFlags.get(key) === 1) {
            sessionFlags.set(key, 0);
            let unit;
            let sessionPrice;

            // Get meter values for this session
            const meterValues = getMeterValues(key, meterValuesMap);

            // Calculate energy consumption and price if meter values are available
            if (meterValues.firstMeterValues !== undefined && meterValues.lastMeterValues !== undefined) {
                ({ unit, sessionPrice } = await calculateDifference(
                    meterValues.firstMeterValues,
                    meterValues.lastMeterValues,
                    uniqueIdentifier,
                    connectorId,
                    chargingSessionID.get(key)
                ));

                logger.loggerInfo(`Energy consumed during charging session: ${unit} Unit's - Price: ${sessionPrice}`);

                // Delete meter values after processing
                if (meterValuesMap.has(key)) {
                    meterValuesMap.delete(key);
                }
            } else {
                logger.loggerWarn("StartMeterValues or LastMeterValues is not available.");
            }

            // Get user for this session
            const user = await getUsername(uniqueIdentifier, connectorId);

            // Get start and stop times
            let startTime = chargerStartTime.get(key);
            let stopTime = chargerStopTime.get(key);

            // If start time is not available, try to get it from the database
            if (!startTime) {
                try {
                    const db = await dbService.connectToDatabase();
                    const existingSession = await db.collection('device_session_details').findOne({
                        charger_id: uniqueIdentifier,
                        connector_id: parseInt(connectorId),
                        session_id: chargingSessionID.get(key)
                    });

                    if (existingSession && existingSession.start_time) {
                        startTime = existingSession.start_time;
                        logger.loggerInfo(`Retrieved start time from database: ${startTime}`);
                    } else {
                        // If still not available, use a default (current time minus 1 minute)
                        startTime = new Date(new Date().getTime() - 60000).toISOString();
                        logger.loggerWarn(`Using default start time: ${startTime}`);
                    }
                } catch (error) {
                    logger.loggerError(`Error retrieving start time from database: ${error.message}`);
                    startTime = new Date(new Date().getTime() - 60000).toISOString();
                }
            }

            // If stop time is not available, use current time
            if (!stopTime) {
                stopTime = new Date().toISOString();
                logger.loggerWarn(`Using current time as stop time: ${stopTime}`);
            }

            // Fetch connector type
            const db = await dbService.connectToDatabase();
            const socketGunConfig = await db.collection('socket_gun_config').findOne({ charger_id: uniqueIdentifier });
            const connectorIdTypeField = `connector_${connectorId}_type`;
            const connectorTypeValue = socketGunConfig ? socketGunConfig[connectorIdTypeField] : null;

            // Handle charging session data if user is available
            if (user) {
                // Get stop reason from request payload if available
                const stopReason = requestPayload.reason || null;

                await handleChargingSession(
                    uniqueIdentifier,
                    connectorId,
                    startTime,
                    stopTime,
                    unit,
                    sessionPrice,
                    user,
                    chargingSessionID.get(key),
                    connectorTypeValue,
                    requestPayload.errorCode || "NoError",
                    stopReason,
                    requestPayload.vendorErrorCode || "NovendorErrorCode",
                );
            } else {
                logger.loggerWarn(`ChargerID ${uniqueIdentifier}: User is ${user}, so can't update the session price and commission.`);
            }

            // Update current or active user to null if charging has stopped
            if (charging_states.get(key) === false) {
                const result = await dbService.updateCurrentOrActiveUserToNull(uniqueIdentifier, connectorId);
                chargingSessionID.delete(key);

                if (result === true) {
                    logger.loggerInfo(`ChargerID ${uniqueIdentifier} ConnectorID ${connectorId} Stop - End charging session is updated successfully.`);
                } else {
                    logger.loggerWarn(`ChargerID ${uniqueIdentifier} ConnectorID ${connectorId} - End charging session is not updated.`);
                }
            } else {
                logger.loggerWarn('End charging session is not updated - while stop only it will work');
            }

            // Reset start and stop times if they exist
            if (chargerStartTime && typeof chargerStartTime.set === 'function') {
                chargerStartTime.set(key, null);
            }
            if (chargerStopTime && typeof chargerStopTime.set === 'function') {
                chargerStopTime.set(key, null);
            }
        }

    } catch (error) {
        logger.loggerError(`Error in handleStopTransaction: ${error.message}`);
        response[2] = { idTagInfo: { status: "InternalError" } };

        // Add metadata for internal use
        response.metadata = {
            success: false,
            error: error.message
        };
    }

    return response;
};

module.exports = {
    handleStopTransaction,
    createChargingSession
};