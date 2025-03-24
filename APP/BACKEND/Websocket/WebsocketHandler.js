const logger = require('../utils/logger');
const validateHeaders = require('./validation/validateHeaders');
const dbService = require('./services/dbService');
const validation = require("../middlewares/validation/indexValidation");
const frameHandler = require("./frameHandlers/indexFrame");
//TODO - Completed Boot and heartbeat 
const handleWebSocketConnection = (WebSocket, wss, ClientWss, wsConnections, ClientConnections, clients) => {
    wss.on('connection', async (ws, req) => {
        ws.isAlive = true;
        ws.socket?.setNoDelay(true);

        const uniqueIdentifier = await validateHeaders.getUniqueIdentifierFromRequest(req, ws);
        if (!uniqueIdentifier) {
            logger.loggerWarn('WebSocket connection established from browser');
            return;
        }
        const previousResults = new Map();
        const currentVal = new Map();

        const clientIpAddress = req.connection.remoteAddress;
        wsConnections.set(uniqueIdentifier, ws);
        ClientConnections.add(ws);
        clients.set(ws, uniqueIdentifier);

        try {
            await dbService.updateChargerIP(uniqueIdentifier, clientIpAddress);
            await dbService.updateChargerStatus(uniqueIdentifier, clientIpAddress);
            logger.loggerSuccess(`WebSocket connection established with Charger ID: ${uniqueIdentifier}`);
        } catch (error) {
            logger.loggerError(`Error updating charger details for ${uniqueIdentifier}: ${error.message}`);
        }

        // Handle messages
        ws.on('message', (message) => handleIncomingMessage(uniqueIdentifier, message, ws, WebSocket, ClientWss, currentVal, previousResults));

        // Handle errors
        ws.on('error', (error) => handleWebSocketError(uniqueIdentifier, error, ws));

        // Handle close
        ws.on('close', (code, reason) => handleWebSocketClose(uniqueIdentifier, code, reason, ws, ClientConnections));
    });
};

const handleIncomingMessage = async (uniqueIdentifier, message, ws, WebSocket, ClientWss, currentVal, previousResults) => {
    try {
        const requestData = JSON.parse(message);
        logger.loggerDebug(`Received message from ${uniqueIdentifier}: ${message}`);

        if (!Array.isArray(requestData) || requestData.length < 4) {
            return ws.send(JSON.stringify([3, requestData[1], { status: "Rejected", errors: ["Invalid message format"] }]));
        }

        const requestType = requestData[0];
        const requestId = requestData[1];
        const requestName = requestData[2];
        const requestPayload = requestData[3];
        const connectorId = requestPayload?.connectorId;

        let response = [3, requestId, {}];
        let errors = [];

        switch (requestName) {
            case "BootNotification":
                response = await frameHandler.handleBootNotification(uniqueIdentifier, requestPayload, requestId);
                break;

            case "Heartbeat":
                response = await frameHandler.handleHeartbeat(uniqueIdentifier, requestId, currentVal, previousResults);
                break;

            case "StatusNotification":
                response = await frameHandler.handleStatusNotification(uniqueIdentifier, requestId, currentVal, previousResults);
                break;

            case "DataTransfer":
                errors = validation.validateDataTransfer(requestPayload);
                break;

            case "FirmwareStatusNotification":
                errors = validation.validateFirmwareStatusNotification(requestPayload);
                break;
        }

        if (errors.length > 0) {
            return ws.send(JSON.stringify([3, requestId, { status: "Rejected", errors }]));
        }

        ws.send(JSON.stringify(response));

        // Broadcast message to other clients
        broadcastMessage(uniqueIdentifier, requestData, ws, ClientWss);
    } catch (error) {
        logger.loggerError(`Message parsing error: ${error.message}`);
        ws.send(JSON.stringify([3, null, { status: "Error", message: "Message parsing failed" }]));
    }
};

const broadcastMessage = (DeviceID, message, sender, ClientWss) => {
    const jsonMessage = JSON.stringify({ DeviceID, message });
    ClientWss.clients.forEach(client => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(jsonMessage, (error) => {
                if (error) {
                    logger.loggerError(`Error sending message: ${error.message}`);
                }
            });
        }
    });
};

const handleWebSocketError = (uniqueIdentifier, error, ws) => {
    logger.loggerError(`WebSocket error (${uniqueIdentifier}): ${error.message}`);
    if (error.code === 'WS_ERR_UNEXPECTED_RSV_1' || error.code === 'WS_ERR_EXPECTED_MASK') {
        ws.close(1002, 'Invalid frame received');
    }
};

const handleWebSocketClose = (uniqueIdentifier, code, reason, ws, ClientConnections) => {
    logger.loggerWarn(`WebSocket closed (${uniqueIdentifier}): Code ${code}, Reason: ${reason}`);
    ClientConnections.delete(ws);
};

module.exports = { handleWebSocketConnection };
