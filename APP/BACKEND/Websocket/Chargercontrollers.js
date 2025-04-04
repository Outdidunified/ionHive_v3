const db_conn = require('../config/db');
const logger = require('../utils/logger');
let db;
const connectToDatabase = async () => {
    if (!db) {
        db = await db_conn.connectToDatabase();
    }
    return db;
};
connectToDatabase(); // Initialize the DB connection once
const { uniqueKey } = require('../data/MapModules');


const chargerStopCall = async (Chargerid, connectorId) => {
    try {
        if (!db) {
            logger.loggerError('Database connection failed.');
            return false;
        }

        const chargerDetailsCollection = db.collection('charger_details');
        const transData = await chargerDetailsCollection.findOne({ charger_id: Chargerid });

        if (!transData) {
            logger.error(`chargerStopCall - Charger ID ${Chargerid} not found or transaction ID not set.`);
            return false;
        }

        const wsToSendTo = wsConnections.get(Chargerid);
        const uniqueId = uuidv4();
        uniqueKey.set(Chargerid, uniqueId);
        const Key = uniqueKey.get(Chargerid);

        if (!wsToSendTo) {
            logger.loggerInfo(`chargerStopCall - WebSocket client not found for device ID: ${Chargerid}`);
            return false;
        }

        const transIdField = `transaction_id_for_connector_${connectorId}`;
        const transId = transData[transIdField];

        if (!transId) {
            logger.loggerInfo(`chargerStopCall - Transaction ID for connector ${connectorId} not found for charger ID: ${Chargerid}`);
            return false;
        }

        const remoteStopRequest = [2, Key, "RemoteStopTransaction", { "transactionId": transId }];
        wsToSendTo.send(JSON.stringify(remoteStopRequest));

        logger.loggerInfo(`chargerStopCall - Stop message sent to WebSocket client for device ID: ${Chargerid}`, { request: remoteStopRequest });

        return true;
    } catch (error) {
        logger.loggerError(`chargerStopCall - Error stopping charger ID ${Chargerid}: ${error.message}`);
        return false;
    }
};

module.exports = { chargerStopCall };