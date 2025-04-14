const db_conn = require('../config/db');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const { wsConnections, OCPPResponseMap, uniqueKey } = require('../data/MapModules');

let db;
const initializeDB = async () => {
    if (!db) {
        db = await db_conn.connectToDatabase();
    }
    return db;
};
initializeDB(); // Initialize the DB connection once

// Get all OCPP actions
const getActions = async (req, res) => {
    try {
        if (!db) {
            logger.loggerError('Database connection failed.');
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.'
            });
        }

        const collection = db.collection('ocpp_actions');
        const data = await collection.find({}).toArray();

        // Map the database documents into the desired format
        const responseData = data.map(item => {
            return {
                action: item.action,
                payload: JSON.parse(item.payload)
            };
        });

        logger.loggerSuccess('Successfully fetched OCPP actions');
        return res.status(200).json(responseData);
    } catch (error) {
        logger.loggerError(`Error fetching OCPP actions: ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error_details: error.message
        });
    }
};

// Send OCPP request to charger
const sendOCPPRequest = async (req, res) => {
    try {
        const { id, req: payload, actionBtn: action } = req.body;

        if (!id || !action) {
            logger.loggerWarn('Missing required parameters: id or action');
            return res.status(400).json({
                error: true,
                message: 'Charger ID and action are required'
            });
        }

        const wsToSendTo = wsConnections.get(id);

        if (!wsToSendTo) {
            logger.loggerWarn(`OCPP Request client not found for device ID: ${id}`);
            return res.status(404).json({
                error: true,
                message: `OCPP Request client not found for the specified device ID: ${id}`
            });
        }

        // Generate unique ID for this transaction
        const uniqueId = uuidv4();
        uniqueKey.set(id, uniqueId);
        const Key = uniqueKey.get(id);

        let requestMessage;

        switch (action) {
            case "GetConfiguration":
                requestMessage = [2, Key, "GetConfiguration", payload];
                break;
            case "DataTransfer":
                requestMessage = [2, Key, "DataTransfer", payload];
                break;
            case "UpdateFirmware":
                requestMessage = [2, Key, "UpdateFirmware", payload];
                break;
            case "ChangeConfiguration":
                requestMessage = [2, Key, "ChangeConfiguration", payload];
                break;
            case "ClearCache":
                requestMessage = [2, Key, "ClearCache", ''];
                break;
            case "TriggerMessage":
                requestMessage = [2, Key, "TriggerMessage", payload];
                break;
            case "Reset":
                requestMessage = [2, Key, "Reset", payload];
                break;
            case "UnlockConnector":
                requestMessage = [2, Key, "UnlockConnector", payload];
                break;
            case "RemoteStartTransaction":
                requestMessage = [2, Key, "RemoteStartTransaction", {
                    "connectorId": 1,
                    "idTag": "B4A63CDB",
                    "timestamp": new Date().toISOString()
                }];
                break;
            case "RemoteStopTransaction":
                requestMessage = [2, Key, "RemoteStopTransaction", payload];
                break;
            case "GetDiagnostics":
                requestMessage = [2, Key, "GetDiagnostics", payload];
                break;
            case "ChangeAvailability":
                requestMessage = [2, Key, "ChangeAvailability", payload];
                break;
            case "CancelReservation":
                requestMessage = [2, Key, "CancelReservation", payload];
                break;
            case "ReserveNow":
                requestMessage = [2, Key, "ReserveNow", payload];
                break;
            case "SendLocalList":
                requestMessage = [2, Key, "SendLocalList", payload];
                break;
            case "GetLocalListVersion":
                requestMessage = [2, Key, "GetLocalListVersion", payload];
                break;
            default:
                logger.loggerWarn(`Invalid OCPP action: ${action}`);
                return res.status(400).json({
                    error: true,
                    message: 'Invalid action'
                });
        }

        // Map the WebSocket connection to the HTTP response
        OCPPResponseMap.set(wsToSendTo, res);
        wsToSendTo.send(JSON.stringify(requestMessage));

        logger.loggerSuccess(`OCPP request sent to device ID: ${id}, Action: ${action}`);

        // Note: We don't send a response here because the WebSocket handler will send it
        // when it receives a response from the charger
    } catch (error) {
        logger.loggerError(`Error sending OCPP request: ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error_details: error.message
        });
    }
};

module.exports = {
    getActions,
    sendOCPPRequest
};