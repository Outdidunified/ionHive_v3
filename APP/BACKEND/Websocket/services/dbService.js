const db_conn = require('../../config/db');
const logger = require('../../utils/logger');
let db;
const connectToDatabase = async () => {
    try {
        if (!db) {
            db = await db_conn.connectToDatabase();
            // Don't log here, the message will come from db_conn.connectToDatabase()
        }
        return db;
    } catch (error) {
        logger.loggerError(`Failed to connect to database: ${error.message}`);
        throw error;
    }
};
// Don't connect immediately, wait for explicit call


const updateChargerIP = async (chargerId, ip) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }
        await db.collection('charger_details').updateOne({ charger_id: chargerId }, { $set: { ip } });
        await db.collection('charger_status').updateOne({ charger_id: chargerId }, { $set: { client_ip: ip } });
        logger.loggerSuccess(`Updated charger IP: ${ip} for the Charger: ${chargerId}`);

    } catch (error) {
        logger.loggerError(`Error updating charger IP: ${ip} or the Charger: ${chargerId} ${error.message}`);
    }
};
/**
 * Update charger status in the database
 * 
 * @param {string} chargerId - The charger ID
 * @param {string} clientIpAddress - The client's IP address
 * @param {string} [connectionStatus] - Optional connection status (Connected, Disconnected, Error, etc.)
 * @returns {Promise<object>} - Success status and any error message
 */
const updateChargerStatus = async (chargerId, clientIpAddress, connectionStatus) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }

        const query = { charger_id: chargerId };
        const updateOperation = {
            $set: {
                ip: clientIpAddress,
                modified_date: new Date()
            }
        };

        // Add connection status if provided
        if (connectionStatus) {
            updateOperation.$set.connection_status = connectionStatus;
            updateOperation.$set.last_connection_time = new Date();
        }

        // Update charger_details collection
        const chargerDetailsResult = await db.collection('charger_details').updateOne(query, updateOperation);
        logger.loggerInfo(`ChargerID: ${chargerId} - Matched ${chargerDetailsResult.matchedCount} document(s) and modified ${chargerDetailsResult.modifiedCount} document(s) in charger_details`);

        // Update charger_status collection
        const statusUpdateOperation = {
            $set: {
                client_ip: clientIpAddress,
                modified_date: new Date()
            }
        };

        // Add connection status if provided
        if (connectionStatus) {
            statusUpdateOperation.$set.connection_status = connectionStatus;
        }

        const chargerStatusResult = await db.collection('charger_status').updateOne(query, statusUpdateOperation);
        logger.loggerInfo(`ChargerID: ${chargerId} - Matched ${chargerStatusResult.matchedCount} document(s) and modified ${chargerStatusResult.modifiedCount} document(s) in charger_status`);

        return { success: true };
    } catch (error) {
        logger.loggerError(`ChargerID: ${chargerId} - Error updating charger status: ${error.message}`);
        return { success: false, error: error.message };
    }
};
/**
 * Update charger details in the database
 * 
 * @param {string} charger_id - The charger ID
 * @param {object} updateData - The data to update
 * @returns {Promise<boolean>} - True if successful (document found), false otherwise
 */
const updateChargerDetails = async (charger_id, updateData) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }
        const collection = db.collection('charger_details');

        const result = await collection.updateOne(
            { charger_id: charger_id },
            { $set: updateData }
        );

        // Consider the operation successful if the document was found,
        // even if no fields were actually modified (matchedCount > 0)
        if (result.matchedCount > 0) {
            if (result.modifiedCount === 0) {
                logger.loggerInfo(`ChargerID: ${charger_id} - Document found but no changes were needed`);
            }
            return true;
        } else {
            logger.loggerWarn(`ChargerID: ${charger_id} - No document found to update`);
            return false;
        }
    } catch (error) {
        logger.loggerError(`Error updating charger details for ${charger_id}: ${error.message}`);
        return false;
    }
};
const checkChargerTagId = async (charger_id, connector_id) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }
        const collection = db.collection('charger_details');

        const projectionField = `tag_id_for_connector_${connector_id}`;

        const charger = await collection.findOne(
            { charger_id: charger_id },
            { projection: { [projectionField]: 1 } }
        );

        if (!charger || charger[projectionField] === null) {
            return 'Pending';
        }
        return 'Accepted';
    } catch (error) {
        logger.loggerError('Database error:', error);
        return 'Rejected';
    }
};
const updateTime = async (charger_id, connectorId) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }
        const evDetailsCollection = db.collection('charger_details');
        const chargerStatusCollection = db.collection('charger_status');
        const unregisteredDevicesCollection = db.collection('UnRegister_Devices');

        // Check if the device exists in the charger_details collection
        const deviceExists = await evDetailsCollection.findOne({ charger_id });

        if (deviceExists) {
            // Update timestamp for the specific charger_id
            const filter = { charger_id };
            const update = { $set: { timestamp: new Date() } };
            const result = await chargerStatusCollection.updateOne(filter, update);

            if (result.modifiedCount === 1) {
                logger.loggerSuccess(`The time for ChargerID ${charger_id} has been successfully updated.`);
            } else {
                logger.loggerError(`ChargerID ${charger_id} not found to update time.`);
            }

            return true;
        } else {
            // If charger_id does not exist, handle as unregistered device
            logger.loggerError(`ChargerID ${charger_id} does not exist in the database.`);

            const unregisteredDevice = await unregisteredDevicesCollection.findOne({ charger_id });

            if (unregisteredDevice) {
                // Update LastUpdateTime for existing unregistered device
                await unregisteredDevicesCollection.updateOne(
                    { charger_id },
                    { $set: { LastUpdateTime: new Date() } }
                );
                logger.loggerInfo(`Unregistered Device ${charger_id} - LastUpdateTime Updated.`);
            } else {
                // Insert new unregistered device
                await unregisteredDevicesCollection.insertOne({
                    charger_id,
                    LastUpdateTime: new Date(),
                });
                logger.loggerInfo(`Unregistered Device ${charger_id} inserted.`);
            }

            // Attempt to delete the unregistered charger after updating or inserting
            const deleteResult = await unregisteredDevicesCollection.deleteOne({ charger_id });
            if (deleteResult.deletedCount === 1) {
                logger.loggerInfo(`Unregistered Device ${charger_id} has been deleted.`);
            } else {
                logger.loggerWarn(`Failed to delete Unregistered Device ${charger_id}.`);
            }

            return false;
        }
    } catch (error) {
        logger.loggerError(`Error updating time for ChargerID ${charger_id}: ${error.message}`);
        return false;
    }
};
const checkChargerIdInDatabase = async (charger_id) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }
        const collection = db.collection('charger_details');
        const charger = await collection.findOne({ charger_id });

        return !!charger; // Returns `true` if found, `false` otherwise
    } catch (error) {
        logger.loggerError(`Database error while checking charger ID ${charger_id}: ${error.message}`);
        return false;
    }
};
const SaveChargerStatus = async (chargerStatus, connectorId) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }
        const collection = db.collection('charger_status');
        const ChargerStatus = JSON.parse(chargerStatus);
        ChargerStatus.connector_id = connectorId;

        const existingDocument = await collection.findOne({
            charger_id: ChargerStatus.charger_id,
            connector_id: connectorId
        });

        if (existingDocument) {
            const result = await collection.updateOne(
                { charger_id: ChargerStatus.charger_id, connector_id: connectorId },
                {
                    $set: {
                        client_ip: ChargerStatus.client_ip,
                        connector_type: ChargerStatus.connector_type,
                        charger_status: ChargerStatus.charger_status,
                        timestamp: new Date(ChargerStatus.timestamp),
                        error_code: ChargerStatus.error_code,
                        modified_date: new Date()
                    }
                }
            );
            if (result.modifiedCount > 0) {
                logger.loggerInfo(`ChargerID ${ChargerStatus.charger_id}, ConnectorID ${connectorId}: Status successfully updated.`);
            } else {
                logger.loggerInfo(`ChargerID ${ChargerStatus.charger_id}, ConnectorID ${connectorId}: Status not updated.`);
            }
        } else {
            const foundDocument = await db.collection('charger_details').findOne({ charger_id: ChargerStatus.charger_id });
            if (foundDocument) {
                ChargerStatus.charger_id = foundDocument.charger_id;
                const insertResult = await collection.insertOne(ChargerStatus);
                if (insertResult.insertedId) {
                    logger.loggerInfo(`ChargerID ${ChargerStatus.charger_id}, ConnectorID ${connectorId}: Status successfully inserted.`);
                } else {
                    logger.loggerError(`ChargerID ${ChargerStatus.charger_id}, ConnectorID ${connectorId}: Status not inserted.`);
                }
            } else {
                logger.loggerError('Document not found in SaveChargerStatus function');
            }
        }
    } catch (error) {
        logger.loggerError(`Error in SaveChargerStatus: ${error.message}`);
    }
};
const updateCurrentOrActiveUserToNull = async (uniqueIdentifier, connectorId) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }
        const collection = db.collection('charger_details');
        const updateField = `current_or_active_user_for_connector_${connectorId}`;
        const updateObject = { $set: { [updateField]: null } };

        const result = await collection.updateOne({ charger_id: uniqueIdentifier }, updateObject);

        if (result.modifiedCount === 0) {
            return false;
        }

        return true;
    } catch (error) {
        logger.loggerError('Error while updating CurrentOrActiveUser to null:', error);
        return false;
    }
}
const deleteMeterValues = async (key, meterValuesMap) => {
    if (meterValuesMap.has(key)) {
        meterValuesMap.delete(key);
    }
};
const NullTagIDInStatus = async (charger_id, connector_id) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }
        const chargerDetailsCollection = db.collection('charger_details');

        // Construct the dynamic field name for the specific connector
        const connectorTagIdField = `tag_id_for_connector_${connector_id}`;
        const connectorTagIdInUseField = `tag_id_for_connector_${connector_id}_in_use`;

        // Create the update field to set 'tag_id_for_connector_{connectorId}' to null
        const updateFields = {
            [connectorTagIdField]: null,
            [connectorTagIdInUseField]: false
        };

        // Update the specific connector's 'tag_id' field to null
        const updateResult = await chargerDetailsCollection.updateOne(
            { charger_id: charger_id },
            { $set: updateFields }
        );

        if (updateResult.matchedCount === 0) {
            logger.loggerError(`Charger ID ${charger_id} not found`)
        } else if (updateResult.modifiedCount === 0) {
            logger.loggerInfo(`Charger ID ${charger_id} found but no changes were made.`);
        } else {
            logger.loggerSuccess(`Charger ID ${charger_id} successfully updated '${connectorTagIdField}' details updated`);
        }

    } catch (error) {
        logger.loggerError(`Error updating Charger ID ${charger_id} with null tag ID: ${error.message}`);
    }
};
const checkAuthorization = async (charger_id, idTag) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }
        const chargerDetailsCollection = db.collection('charger_details');
        const tagIdCollection = db.collection('tag_id');
        const userCollection = db.collection('users');
        let connectorId = null;
        let tagIdDetails;
        let expiryDate;
        let currentDate = new Date();
        let userDetails;

        expiryDate = new Date();
        expiryDate.setDate(currentDate.getDate() + 1); // Add one day to the expiry date

        // Fetch charger details, including the chargePointModel
        const chargerDetails = await chargerDetailsCollection.findOne({ charger_id });
        if (!chargerDetails || !chargerDetails.model) {
            return { status: "Invalid" };
        }

        if (chargerDetails.status === false) {
            return { status: "Blocked", expiryDate: expiryDate.toISOString() };
        }

        // Dynamically determine the number of connectors based on the chargePointModel
        // const connectors = chargerDetails.model.split('- ')[1];
        // const totalConnectors = Math.ceil(connectors.length / 2);
        const totalConnectors = chargerDetails.gun_connector + chargerDetails.socket_count;

        // Dynamically create the projection fields based on the number of connectors
        let projection = { charger_id: 1 };
        for (let i = 1; i <= totalConnectors; i++) {
            projection[`current_or_active_user_for_connector_${i}`] = 1;
            projection[`tag_id_for_connector_${i}`] = 1;
            projection[`tag_id_for_connector_${i}_in_use`] = 1;
        }

        // Fetch charger details with dynamically generated projection
        const chargerDetailsWithConnectors = await chargerDetailsCollection.findOne(
            { charger_id },
            { projection }
        );
        if (!chargerDetailsWithConnectors) {
            return { status: "Invalid" };
        }

        let currentUserActive = [];
        // Identify the connector associated with the provided tag_id
        for (let i = 1; i <= totalConnectors; i++) {
            const currentUserValue = chargerDetailsWithConnectors[`current_or_active_user_for_connector_${i}`];
            const tagIDInUse = chargerDetailsWithConnectors[`tag_id_for_connector_${i}_in_use`];

            if (currentUserValue !== null && tagIDInUse === false) {
                // Fetch the current active user for this connector
                currentUserActive.push(currentUserValue);
            }
            if (chargerDetailsWithConnectors[`tag_id_for_connector_${i}`] === idTag) {
                connectorId = i;
                break;
            }
        }

        // Check if the tag_id_for_connector_{id} does not match the provided idTag
        for (let i = 1; i <= totalConnectors; i++) {
            if (i !== connectorId && chargerDetailsWithConnectors[`tag_id_for_connector_${i}`] === idTag) {
                return { status: "ConcurrentTx", connectorId };
            }
        }

        if (connectorId) {
            return { status: "Accepted", expiryDate: expiryDate.toISOString(), connectorId };
        } else {
            // Fetch tag_id details from the separate collection
            tagIdDetails = await tagIdCollection.findOne({ tag_id: idTag, status: true });

            if (!tagIdDetails) {
                logger.loggerError('Tag Id is not found or Deactivated !');
                tagIdDetails = { status: false };
            } else if (tagIdDetails) {
                if (tagIdDetails.tag_id_assigned === true) {
                    // Fetch wallet balance to check min balance
                    userDetails = await userCollection.findOne({ tag_id: tagIdDetails.id });

                    if (currentUserActive.length > 0 && !currentUserActive.includes(userDetails.username)) {
                        return { status: "Invalid", expiryDate: expiryDate.toISOString(), connectorId };
                    } else {
                        // Check wallet balance
                        if (userDetails.wallet_bal !== undefined && !isNaN(userDetails.wallet_bal) && userDetails.wallet_bal >= 100) {
                            // Check if the assigned association matches
                            if (chargerDetails.assigned_association_id === tagIdDetails.association_id) {
                                expiryDate = new Date(tagIdDetails.tag_id_expiry_date);
                            } else {
                                // Check if the charger is public
                                if (chargerDetails.charger_accessibility === 1) {
                                    expiryDate = new Date(tagIdDetails.tag_id_expiry_date);
                                } else {
                                    logger.loggerError(`Charger ID - ${charger_id} Access Denied - This charger is private!`);
                                    tagIdDetails = { status: false };
                                }
                            }
                        } else {
                            logger.loggerError('Wallet balance is below 100, please recharge to start the charger!');
                            tagIdDetails = { status: false };
                        }
                    }
                } else {
                    logger.loggerError('Tag ID is not assigned, please assign to start the charger!');
                    tagIdDetails = { status: false };
                }

            }
        }

        // Check various conditions based on the tag_id details
        if (tagIdDetails.status === false) {
            return { status: "Blocked", expiryDate: expiryDate.toISOString(), connectorId };
        } else if (expiryDate <= currentDate) {
            return { status: "Expired", expiryDate: expiryDate.toISOString(), connectorId };
        } else {
            return { status: "Accepted", expiryDate: expiryDate.toISOString(), connectorId };
        }

    } catch (error) {
        logger.loggerError(`Error checking tag_id for charger_id ${charger_id}:`, error);
        return { status: "Error" };
    }
};
const updateChargerTransaction = async (charger_id, updateFields) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }

        const chargerDetailsCollection = db.collection('charger_details');

        // Perform the update operation
        const result = await chargerDetailsCollection.findOneAndUpdate(
            { charger_id: charger_id },
            { $set: updateFields },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            logger.loggerError(`No charger found with charger_id: ${charger_id}`);
            return { status: "Error", message: "No charger found" };
        }

        logger.loggerInfo(`Updated charger transaction for charger_id: ${charger_id}`);
        return { status: "Success", updatedData: result.value };

    } catch (error) {
        logger.loggerError(`Error updating charger transaction for charger_id ${charger_id}: ${error.message}`);
        return { status: "Error", message: error.message };
    }
};
const getUserEmail = async (chargerID, connectorId, TagID) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }

        const evDetailsCollection = db.collection('charger_details');
        const chargerDetails = await evDetailsCollection.findOne({ charger_id: chargerID });

        if (!chargerDetails) {
            logger.loggerError(`getUsermail - Charger ID ${chargerID} not found in the database`);
            return null;
        }

        const userField = `current_or_active_user_for_connector_${connectorId}`;
        let usermail = chargerDetails[userField] || null;

        // If starting via NFC card, retrieve usermail from tag_id and update the field
        if (TagID) {
            if (!usermail) {
                const userCollection = db.collection('users');
                const tagIdCollection = db.collection('tag_id');

                const tagData = await tagIdCollection.findOne({ tag_id: TagID });

                if (!tagData) {
                    logger.loggerError(`Tag ID ${TagID} not found in the database`);
                } else {
                    const userData = await userCollection.findOne({ tag_id: tagData.id });

                    if (userData) {
                        const updateResult = await evDetailsCollection.updateOne(
                            { charger_id: chargerID },
                            { $set: { [userField]: userData.email_id } }
                        );

                        if (updateResult.matchedCount === 0) {
                            logger.loggerError(`getUsermail - Failed to update usermail for charger ${chargerID}`);
                        } else if (updateResult.modifiedCount === 0) {
                            logger.loggerInfo(`getUsermail - No change in usermail for charger ${chargerID}`);
                        } else {
                            logger.loggerInfo(`getUsermail - usermail updated successfully for charger ${chargerID}`);
                            usermail = userData.email_id;
                        }
                    } else {
                        logger.loggerError(`User with Tag ID ${TagID} not found in the database`);
                    }
                }
            }
        } else {
            logger.loggerInfo(`getUsermail - TagID is null. Likely a remote start/stop`);
        }

        return usermail;
    } catch (error) {
        logger.loggerError(`Error getting usermail for charger ${chargerID}: ${error.message}`);
        return null;
    }
};
const getAutostop = async (useremsil) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }
        const UserDetails = await db.collection('users').findOne({ email_id: useremsil });

        const time_val = UserDetails.autostop_time;
        const isTimeChecked = UserDetails.autostop_time_is_checked;
        const unit_val = UserDetails.autostop_unit;
        const isUnitChecked = UserDetails.autostop_unit_is_checked;
        const price_val = UserDetails.autostop_price;
        const isPriceChecked = UserDetails.autostop_price_is_checked;
        const wallet_balance = parseFloat(UserDetails.wallet_bal).toFixed(3);


        return { 'time_value': time_val, 'isTimeChecked': isTimeChecked, 'unit_value': unit_val, 'isUnitChecked': isUnitChecked, 'price_value': price_val, 'isPriceChecked': isPriceChecked, 'wallet_balance': wallet_balance };

    } catch (error) {
        logger.loggerError(`getAutostop - Error retrieving autostop details for user ${useremsil}: ${error.message}`);
        return false;
    }
}
const getPricePerUnit = async (uniqueIdentifier, connectorId) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }

        const chargerDetailsCollection = db.collection('charger_details');
        const charger = await chargerDetailsCollection.findOne({ charger_id: uniqueIdentifier });

        if (!charger) {
            logger.loggerWarn(`Charger ${uniqueIdentifier} not found`);
            return 0;
        }

        // Get the price for the specific connector or default price
        const priceField = `price_for_connector_${connectorId}`;
        const price = charger[priceField] || charger.default_price || 0;

        return parseFloat(price);
    } catch (error) {
        logger.loggerError(`Error in getPricePerUnit: ${error.message}`);
        return 0;
    }
};
const SaveChargerValue = async (chargerValue) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }

        const collection = db.collection('charger_values');
        const chargerValueObj = JSON.parse(chargerValue);

        // Add timestamp if not present
        if (!chargerValueObj.created_date) {
            chargerValueObj.created_date = new Date();
        }

        const result = await collection.insertOne(chargerValueObj);

        if (result.insertedId) {
            logger.loggerInfo(`ChargerID ${chargerValueObj.charger_id}, ConnectorID ${chargerValueObj.connectorId}: Value successfully inserted.`);
            return true;
        } else {
            logger.loggerError(`ChargerID ${chargerValueObj.charger_id}, ConnectorID ${chargerValueObj.connectorId}: Value not inserted.`);
            return false;
        }
    } catch (error) {
        logger.loggerError(`Error in SaveChargerValue: ${error.message}`);
        return false;
    }
};
// The updateChargerConnectionStatus functionality has been merged into the updateChargerStatus function

const getConnectorId = async (uniqueIdentifier, transactionId) => {
    try {
        if (!db) {
            db = await connectToDatabase();
        }
        const document = await db.collection('charger_details').findOne({ charger_id: uniqueIdentifier });

        // Check if the document exists
        if (!document) {
            logger.loggerError(`Charger not found: ${uniqueIdentifier}`);
            throw new Error('Charger not found');
        }

        // Find the key that matches the transactionId
        const keyName = Object.keys(document).find(key => document[key] === transactionId);

        if (!keyName) {
            logger.loggerError(`Transaction not found: ${transactionId}`);
            throw new Error('Transaction not found');
        }

        // Extract the last number from the key name
        const lastNumber = keyName.match(/(\d+)$/);

        if (!lastNumber) {
            logger.loggerError(`No number found in the key name: ${keyName}`);
            throw new Error('No number found in the key name');
        }

        return lastNumber[0]; // Return the last number as a string

    } catch (error) {
        logger.loggerError(`Get connector ID error in stop transaction: ${error}`);
        throw error; // Re-throw the error for handling by the caller
    }
};
const updateInUse = async (charger_id, idTag, connectorId) => {
    try {
        // Construct the dynamic field name for the specific connector
        const connectorTagIdField = `tag_id_for_connector_${connectorId}`;
        const connectorTagIdInUseField = `tag_id_for_connector_${connectorId}_in_use`;

        // Create the update fields
        const updateFields = {
            [connectorTagIdField]: null,
            [connectorTagIdInUseField]: false
        };

        // Use the dbService to update the charger transaction
        const result = await updateChargerTransaction(charger_id, updateFields);

        if (result.status === "Success") {
            logger.loggerInfo(`Charger ID ${charger_id} successfully updated connector ${connectorId} status`);
            return true;
        } else {
            logger.loggerError(`Failed to update connector status for Charger ID ${charger_id}: ${result.message}`);
            return false;
        }
    } catch (error) {
        logger.loggerError(`UpdateInUse error: ${error.message}`);
        return false;
    }
};

module.exports = {
    connectToDatabase,
    updateChargerIP,
    updateChargerStatus,
    updateChargerDetails,
    updateTime,
    checkChargerTagId,
    checkChargerIdInDatabase,
    SaveChargerStatus,
    SaveChargerValue,
    updateCurrentOrActiveUserToNull,
    deleteMeterValues,
    NullTagIDInStatus,
    checkAuthorization,
    updateChargerTransaction,
    getUserEmail,
    getAutostop,
    getPricePerUnit,
    getConnectorId,
    updateInUse
};
