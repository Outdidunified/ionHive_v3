const logger = require('../utils/logger');
const validateHeaders = require('./validation/validateHeaders');
const dbService = require('./services/dbService');

const handleWebSocketConnection = (WebSocket, wss, ClientWss, wsConnections, ClientConnections, clients) => {
    wss.on('connection', async (ws, req) => {
        ws.isAlive = true;
        ws.socket?.setNoDelay(true);

        const uniqueIdentifier = await validateHeaders.getUniqueIdentifierFromRequest(req, ws);
        console.log(uniqueIdentifier);
        if (!uniqueIdentifier) return;

        const clientIpAddress = req.connection.remoteAddress;
        wsConnections.set(uniqueIdentifier, ws);
        ClientConnections.add(ws);
        clients.set(ws, uniqueIdentifier);

        await dbService.updateChargerIP(uniqueIdentifier, clientIpAddress);

        logger.info(`WebSocket connected: ${uniqueIdentifier}`);
        console.info(`WebSocket connected: ${uniqueIdentifier}`);

        // Handle messages
        ws.on('message', (message) => handleIncomingMessage(uniqueIdentifier, message, ws, WebSocket, ClientWss));

        // Handle errors
        ws.on('error', (error) => handleWebSocketError(uniqueIdentifier, error, ws));

        // Handle close
        ws.on('close', (code, reason) => handleWebSocketClose(uniqueIdentifier, code, reason, ws, ClientConnections));
    });
};

// Handle messages
const handleIncomingMessage = (uniqueIdentifier, message, ws, WebSocket, ClientWss) => {
    try {
        const requestData = JSON.parse(message);
        logger.info(`Received message from ${uniqueIdentifier}: ${message}`);
        console.info(`Received message from ${uniqueIdentifier}: ${message}`);


        broadcastMessage(uniqueIdentifier, requestData, ws, ClientWss);
    } catch (error) {
        logger.error(`Message parsing error: ${error.message}`);
        console.error(`Message parsing error: ${error.message}`);

    }
};

// Broadcast message
const broadcastMessage = (DeviceID, message, sender, ClientWss) => {
    const jsonMessage = JSON.stringify({ DeviceID, message });
    ClientWss.clients.forEach(client => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(jsonMessage, (error) => {
                if (error)
                    logger.error(`Error sending message: ${error.message}`);
                console.error(`Error sending message: ${error.message}`);
            });
        }
    });
};

// Handle errors
const handleWebSocketError = (uniqueIdentifier, error, ws) => {
    logger.error(`WebSocket error (${uniqueIdentifier}): ${error.message}`);
    console.error(`WebSocket error (${uniqueIdentifier}): ${error.message}`);

    if (error.code === 'WS_ERR_UNEXPECTED_RSV_1' || error.code === 'WS_ERR_EXPECTED_MASK') {
        ws.close(1002, 'Invalid frame received');
    }
};

// Handle close
const handleWebSocketClose = (uniqueIdentifier, code, reason, ws, ClientConnections) => {
    logger.warn(`WebSocket closed (${uniqueIdentifier}): Code ${code}, Reason: ${reason}`);
    console.warn(`WebSocket closed (${uniqueIdentifier}): Code ${code}, Reason: ${reason}`);

    ClientConnections.delete(ws);
};

module.exports = { handleWebSocketConnection };
