const db_conn = require('../../config/db');
const logger = require('../../utils/logger');
let db;
const connectToDatabase = async () => {
    if (!db) {
        db = await db_conn.connectToDatabase();
    }
    return db;
};
connectToDatabase(); // Initialize the DB connection once


const updateChargerIP = async (chargerId, ip) => {
    try {
        if (!db) {
            logger.loggerError('Database connection failed.');
        }
        await db.collection('charger_details').updateOne({ charger_id: chargerId }, { $set: { ip } });
        await db.collection('charger_status').updateOne({ charger_id: chargerId }, { $set: { client_ip: ip } });
        logger.loggerSuccess(`Updated charger IP: ${ip} for the Charger: ${chargerId}`);

    } catch (error) {
        logger.loggerError(`Error updating charger IP: ${ip} or the Charger: ${chargerId} ${error.message}`);
    }
};
const updateChargerStatus = async (chargerId, clientIpAddress) => {
    try {
        if (!db) {
            logger.loggerError('Database connection failed.');
        }

        const query = { charger_id: chargerId };
        const updateOperation = { $set: { ip: clientIpAddress } };

        // Update charger_details collection
        const chargerDetailsResult = await db.collection('charger_details').updateOne(query, updateOperation);
        logger.loggerInfo(`ChargerID: ${chargerId} - Matched ${chargerDetailsResult.matchedCount} document(s) and modified ${chargerDetailsResult.modifiedCount} document(s) in charger_details`);

        // Update charger_status collection
        const chargerStatusResult = await db.collection('charger_status').updateOne(query, { $set: { client_ip: clientIpAddress } });
        logger.loggerInfo(`ChargerID: ${chargerId} - Matched ${chargerStatusResult.matchedCount} document(s) and modified ${chargerStatusResult.modifiedCount} document(s) in charger_status`);

        return { success: true };
    } catch (error) {
        logger.loggerError(`ChargerID: ${chargerId} - Error updating charger status: ${error.message}`);
        return { success: false, error: error.message };
    }
};
const updateChargerDetails = async (charger_id, updateData) => {
    try {
        if (!db) {
            logger.loggerError('Database connection failed.');
        }
        const collection = db.collection('charger_details');

        const result = await collection.updateOne(
            { charger_id: charger_id },
            { $set: updateData }
        );

        return result.modifiedCount > 0;
    } catch (error) {
        logger.loggerError('Error updating charger details:', error);
        return false;
    }
};
const checkChargerTagId = async (charger_id, connector_id) => {
    try {
        if (!db) {
            logger.loggerError('Database connection failed.');
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
            logger.loggerError('Database connection failed.');
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
            logger.loggerError('Database connection failed.');
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
            logger.loggerError('Database connection failed.');
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
            logger.loggerError('Database connection failed.');
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
            logger.loggerError('Database connection failed.');
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
}


module.exports = {
    connectToDatabase,
    updateChargerIP,
    updateChargerStatus,
    updateChargerDetails,
    updateTime,
    checkChargerTagId,
    checkChargerIdInDatabase,
    SaveChargerStatus,
    updateCurrentOrActiveUserToNull,
    deleteMeterValues,
    NullTagIDInStatus
};
