require('dotenv').config();
const logger = require('../utils/logger');
const validateHeaders = require('./validation/validateHeaders');
const dbService = require('./services/dbService');
const frameHandler = require("./constant");

const HEARTBEAT_INTERVAL = process.env.HEARTBEAT_INTERVAL ? parseInt(process.env.HEARTBEAT_INTERVAL, 10) : 30000;
const TIMEOUT_THRESHOLD = process.env.TIMEOUT_THRESHOLD ? parseInt(process.env.TIMEOUT_THRESHOLD, 10) : 60000;

const handleWebSocketConnection = (
    WebSocket,
    wss,
    ClientWss,
    wsConnections,
    ClientConnections,
    clients,
    OCPPResponseMap,
    meterValuesMap,
    sessionFlags,
    charging_states,
    startedChargingSet,
    chargingSessionID,
    chargerStartTime,
    chargerStopTime
) => {
    wss.on('connection', async (ws, req) => {
        ws.isAlive = true;
        ws.lastHeartbeat = Date.now(); // Store last heartbeat timestamp

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

        // Heartbeat Monitoring
        // Heartbeat Monitoring: Only send ping if the connection is not active
        const heartbeatCheck = setInterval(() => {
            const timeSinceLastHeartbeat = Date.now() - ws.lastHeartbeat;

            if (timeSinceLastHeartbeat > TIMEOUT_THRESHOLD) {
                logger.loggerWarn(`No response from ${uniqueIdentifier}, closing connection...`);
                ws.terminate();
                wsConnections.delete(uniqueIdentifier);
            } else if (timeSinceLastHeartbeat > HEARTBEAT_INTERVAL) {
                logger.loggerPingPong(`Sending ping to ${uniqueIdentifier}`);
                ws.ping();
            }
        }, HEARTBEAT_INTERVAL);

        // Handle messages
        ws.on('message', (message) =>
            handleIncomingMessage(
                uniqueIdentifier,
                message,
                ws,
                WebSocket,
                ClientWss,
                currentVal,
                previousResults,
                wsConnections,
                ClientConnections,
                clients,
                OCPPResponseMap,
                meterValuesMap,
                sessionFlags,
                charging_states,
                startedChargingSet,
                chargingSessionID,
                chargerStartTime,
                chargerStopTime,
                clientIpAddress
            )
        );

        // Handle pong response (for ping-pong mechanism)
        ws.on('pong', () => {
            logger.loggerPingPong(`Received pong from ${uniqueIdentifier}`);
            ws.lastHeartbeat = Date.now();
            ws.isAlive = true;
        });

        // Handle errors
        ws.on('error', (error) => handleWebSocketError(uniqueIdentifier, error, ws, clientIpAddress));

        // Handle close
        ws.on('close', (code, reason) => {
            clearInterval(heartbeatCheck);
            const closeReason = reason.toString() || 'No reason provided';

            const closeCodes = {
                1000: 'Normal Closure',
                1001: 'Going Away',
                1002: 'Protocol Error',
                1003: 'Unsupported Data',
                1006: 'Abnormal Closure (No Close Frame)',
                1007: 'Invalid Frame Payload Data',
                1008: 'Policy Violation',
                1009: 'Message Too Big',
                1010: 'Mandatory Extension Missing',
                1011: 'Internal Server Error',
            };

            const codeDescription = closeCodes[code] || 'Unknown Close Code';
            handleWebSocketClose(uniqueIdentifier, code, reason, ws, ClientConnections, clientIpAddress, codeDescription);
        });
    });
};

const handleIncomingMessage = async (
    uniqueIdentifier,
    message,
    ws,
    WebSocket,
    ClientWss,
    currentVal,
    previousResults,
    wsConnections,
    ClientConnections,
    clients,
    OCPPResponseMap,
    meterValuesMap,
    sessionFlags,
    charging_states,
    startedChargingSet,
    chargingSessionID,
    chargerStartTime,
    chargerStopTime,
    clientIpAddress
) => {
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

        let response = [3, requestId, {}];
        let errors = [];

        switch (requestName) {
            case "DataTransfer":
                errors = frameHandler.handleDataTransfer(requestPayload, requestId);
                break;

            case "FirmwareStatusNotification":
                errors = frameHandler.handleFirmwareStatusNotification(requestPayload, requestId);
                break;

            case "BootNotification":
                response = await frameHandler.handleBootNotification(uniqueIdentifier, requestPayload, requestId);
                break;

            case "Heartbeat":
                ws.lastHeartbeat = Date.now(); // Update last heartbeat timestamp
                response = await frameHandler.handleHeartbeat(uniqueIdentifier, requestPayload, requestId, currentVal, previousResults);
                break;

            case "StatusNotification":
                response = await frameHandler.handleStatusNotification(uniqueIdentifier, requestPayload, requestId, sessionFlags, startedChargingSet, charging_states, chargingSessionID, chargerStartTime, chargerStopTime, meterValuesMap, clientIpAddress);
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
const handleWebSocketClose = (uniqueIdentifier, code, reason, ws, ClientConnections, clientIpAddress, codeDescription) => {
    const closeReason = reason?.toString() || "No reason provided"; // Ensure reason is a string

    logger.loggerWarn(
        `WebSocket closed for Client: ${uniqueIdentifier} | IP: ${clientIpAddress} | Code: ${code} (${codeDescription}) | Reason: ${closeReason}`
    );

    ClientConnections.delete(ws);
};

module.exports = { handleWebSocketConnection };
