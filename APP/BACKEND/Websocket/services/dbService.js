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
        console.error('Error updating charger details:', error);
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
        console.error('Database error:', error);
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


module.exports = { connectToDatabase, updateChargerIP, updateChargerStatus, updateChargerDetails, updateTime, checkChargerTagId, checkChargerIdInDatabase };
