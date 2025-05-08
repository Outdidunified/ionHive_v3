require('dotenv').config();
const logger = require('../utils/logger');
const validateHeaders = require('./validation/validateHeaders');
const dbService = require('./services/dbService');
const frameHandler = require("./constant");

// Increased heartbeat interval to give chargers more time between pings
const HEARTBEAT_INTERVAL = process.env.HEARTBEAT_INTERVAL ? parseInt(process.env.HEARTBEAT_INTERVAL, 10) : 60000; // Increased from 30s to 60s
const PONG_TIMEOUT = process.env.PONG_TIMEOUT ? parseInt(process.env.PONG_TIMEOUT, 10) : 30000; // Wait 30s for pong (increased from 10s)

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

        // Check if there's an existing connection for this charger
        const existingConnection = wsConnections.get(uniqueIdentifier);
        if (existingConnection && existingConnection.readyState === WebSocket.OPEN) {
            logger.loggerWarn(`Duplicate connection detected for ${uniqueIdentifier}. Closing old connection gracefully.`);
            // Close the existing connection gracefully
            try {
                existingConnection.close(1000, "Replaced by new connection");
            } catch (error) {
                logger.loggerError(`Error closing existing connection for ${uniqueIdentifier}: ${error.message}`);
                existingConnection.terminate();
            }
        }

        // Set up the new connection
        previousResults.set(uniqueIdentifier, null);
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
        // Set initial ping timer
        ws.pingTimeout = null;

        // Function to schedule the next ping
        const schedulePing = () => {
            // Clear any existing timeout
            if (ws.pingTimeout) {
                clearTimeout(ws.pingTimeout);
            }

            // Set a new timeout
            ws.pingTimeout = setTimeout(() => {
                // Check if we've received a heartbeat message recently
                const timeSinceLastHeartbeat = Date.now() - ws.lastHeartbeat;

                // If we've received a heartbeat message recently, don't send a ping
                if (timeSinceLastHeartbeat < HEARTBEAT_INTERVAL * 0.8) {
                    logger.loggerInfo(`Skipping ping to ${uniqueIdentifier} - recent heartbeat received ${timeSinceLastHeartbeat}ms ago`);
                    schedulePing(); // Reschedule the ping
                    return;
                }

                // If we haven't received a message in HEARTBEAT_INTERVAL, send a ping
                logger.loggerPingPong(`Sending ping to ${uniqueIdentifier}`);

                // Set a timeout to terminate the connection if no pong is received
                ws.pongTimeout = setTimeout(() => {
                    logger.loggerWarn(`No pong response from ${uniqueIdentifier}, closing connection...`);
                    wsConnections.delete(uniqueIdentifier);
                    ws.terminate();
                }, PONG_TIMEOUT); // Use the configurable PONG_TIMEOUT (30 seconds)

                // Send the ping
                try {
                    // Check if the connection is still open before sending ping
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.ping();
                    } else {
                        logger.loggerWarn(`Cannot send ping to ${uniqueIdentifier}: Connection not open (state: ${ws.readyState})`);
                        clearTimeout(ws.pongTimeout);

                        // Try to reconnect if the connection is closed
                        if (ws.readyState === WebSocket.CLOSED) {
                            logger.loggerInfo(`Attempting to reconnect to ${uniqueIdentifier}...`);
                            // Remove from connections map but don't terminate
                            wsConnections.delete(uniqueIdentifier);
                        } else if (ws.readyState !== WebSocket.CLOSED) {
                            // Only terminate if the connection is still connecting or closing
                            ws.terminate();
                            wsConnections.delete(uniqueIdentifier);
                        }
                    }
                } catch (error) {
                    logger.loggerError(`Error sending ping to ${uniqueIdentifier}: ${error.message}`);
                    clearTimeout(ws.pongTimeout);
                    wsConnections.delete(uniqueIdentifier);

                    // Only terminate if the connection is not already closed
                    if (ws.readyState !== WebSocket.CLOSED) {
                        ws.terminate();
                    }
                }
            }, HEARTBEAT_INTERVAL);
        };

        // Schedule the first ping with a delay to allow the connection to stabilize
        setTimeout(() => {
            schedulePing();
        }, 5000); // Wait 5 seconds before starting the ping cycle

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

            // Clear the pong timeout since we got a response
            if (ws.pongTimeout) {
                clearTimeout(ws.pongTimeout);
                ws.pongTimeout = null;
            }

            // Schedule the next ping
            schedulePing();
        });

        // Also update heartbeat on any message
        ws.on('message', () => {
            ws.lastHeartbeat = Date.now();
            ws.isAlive = true;

            // Reschedule ping on any message
            schedulePing();
        });

        // Handle errors with enhanced error handling
        ws.on('error', (error) => {
            // Pass all necessary context to the error handler
            handleWebSocketError(uniqueIdentifier, error, ws, wsConnections, ClientConnections, clients, clientIpAddress);

            // Try to notify the charger about the error if possible
            try {
                if (ws.readyState === WebSocket.OPEN) {
                    const errorNotification = [4, "server-error", {
                        errorCode: "InternalError",
                        errorDescription: "Server encountered an error processing the request"
                    }];
                    ws.send(JSON.stringify(errorNotification));
                }
            } catch (sendError) {
                logger.loggerError(`Failed to send error notification to ${uniqueIdentifier}: ${sendError.message}`);
            }
        });

        // Handle close with enhanced connection cleanup
        ws.on('close', (code, reason) => {
            // Clear all timeouts
            if (ws.pingTimeout) {
                clearTimeout(ws.pingTimeout);
                ws.pingTimeout = null;
            }
            if (ws.pongTimeout) {
                clearTimeout(ws.pongTimeout);
                ws.pongTimeout = null;
            }

            // Ensure reason is a string and handle empty reasons
            const closeReason = reason ? reason.toString() : 'No reason provided';

            // Map of standard WebSocket close codes with descriptions
            const closeCodes = {
                1000: 'Normal Closure',
                1001: 'Going Away',
                1002: 'Protocol Error',
                1003: 'Unsupported Data',
                1005: 'No Status Received',
                1006: 'Abnormal Closure (No Close Frame)',
                1007: 'Invalid Frame Payload Data',
                1008: 'Policy Violation',
                1009: 'Message Too Big',
                1010: 'Mandatory Extension Missing',
                1011: 'Internal Server Error',
                1012: 'Service Restart',
                1013: 'Try Again Later',
                1014: 'Bad Gateway',
                1015: 'TLS Handshake Failure'
            };

            const codeDescription = closeCodes[code] || 'Unknown Close Code';

            // Handle the close event with all necessary context
            handleWebSocketClose(
                uniqueIdentifier,
                code,
                closeReason,
                ws,
                wsConnections,
                ClientConnections,
                clients,
                clientIpAddress,
                codeDescription
            );
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
    // Utility function to check if value is an object
    const isObject = (value) => {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    };
    try {
        // Update connection status on any message
        ws.isAlive = true;
        ws.lastHeartbeat = Date.now();
        const requestData = JSON.parse(message);
        logger.loggerDebug(`Received message from ${uniqueIdentifier}: ${message}`);
        // Validate message format
        if (!Array.isArray(requestData)) {
            const errorResponse = [4, "", "FormatViolation", "Invalid message format: not an array", {}];
            const errorResponseStr = JSON.stringify(errorResponse);
            logger.loggerInfo(`Sending format validation error to ${uniqueIdentifier}: ${errorResponseStr}`);
            return ws.send(errorResponseStr);
        }

        const messageTypeId = requestData[0];
        if (
            (messageTypeId === 2 && requestData.length !== 4) || // CALL: [2, UniqueId, Action, Payload]
            (messageTypeId === 3 && requestData.length !== 3) || // CALLRESULT: [3, UniqueId, Payload]
            (messageTypeId === 4 && requestData.length !== 5) || // CALLERROR: [4, UniqueId, ErrorCode, ErrorDescription, ErrorDetails]
            ![2, 3, 4].includes(messageTypeId) // Invalid MessageTypeId
        ) {
            const errorResponse = [4, requestData[1] || "", "FormatViolation", `Invalid message format: incorrect length or type for message type ${messageTypeId}`, {}];
            const errorResponseStr = JSON.stringify(errorResponse);
            logger.loggerInfo(`Sending format validation error to ${uniqueIdentifier}: ${errorResponseStr}`);
            return ws.send(errorResponseStr);
        }

        // Additional validation for CALL messages
        if (messageTypeId === 2 && (typeof requestData[1] !== "string" || typeof requestData[2] !== "string" || !isObject(requestData[3]))) {
            const errorResponse = [4, requestData[1] || "", "FormatViolation", "Invalid CALL: invalid UniqueId, Action, or Payload", {}];
            const errorResponseStr = JSON.stringify(errorResponse);
            logger.loggerInfo(`Sending format validation error to ${uniqueIdentifier}: ${errorResponseStr}`);
            return ws.send(errorResponseStr);
        }

        // Additional validation for CALLRESULT messages
        if (messageTypeId === 3 && (typeof requestData[1] !== "string" || !isObject(requestData[2]))) {
            const errorResponse = [4, requestData[1] || "", "FormatViolation", "Invalid CALLRESULT: invalid UniqueId or Payload", {}];
            const errorResponseStr = JSON.stringify(errorResponse);
            logger.loggerInfo(`Sending format validation error to ${uniqueIdentifier}: ${errorResponseStr}`);
            return ws.send(errorResponseStr);
        }

        const requestType = requestData[0];
        const requestId = requestData[1];
        const requestName = requestData[2];
        const requestPayload = requestData[3];

        // Initialize with correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
        let response = [3, requestId];
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
                response = await frameHandler.handleHeartbeat(uniqueIdentifier, requestPayload, requestId, currentVal, previousResults, ws);
                break;

            case "StatusNotification":
                response = await frameHandler.handleStatusNotification(uniqueIdentifier, requestPayload, requestId, sessionFlags, startedChargingSet, charging_states, chargingSessionID, chargerStartTime, chargerStopTime, meterValuesMap, clientIpAddress, ws, ClientWss);
                break;

            case "Authorize":
                response = await frameHandler.handleAuthorize(uniqueIdentifier, requestPayload, requestId, wsConnections);
                // Check if there's metadata with broadcast data
                if (response.metadata && response.metadata.broadcastData && response.metadata.authData) {
                    const broadcastData = response.metadata.authData;
                    logger.loggerInfo(`Preparing to broadcast AuthData from ${uniqueIdentifier}: ${JSON.stringify(broadcastData)}`);
                    broadcastMessage(uniqueIdentifier, broadcastData, ws, ClientWss);
                    logger.loggerSuccess("AuthData successfully broadcasted.");
                }
                break;

            case "StartTransaction":
                response = await frameHandler.handleStartTransaction(uniqueIdentifier, requestPayload, requestId, wsConnections);
                // Check if there's metadata with broadcast data
                if (response.metadata && response.metadata.broadcastData && response.metadata.authData) {
                    const broadcastData = response.metadata.authData;
                    logger.loggerInfo(`Preparing to broadcast StatusNotification from ${uniqueIdentifier}: ${JSON.stringify(broadcastData)}`);
                    broadcastMessage(uniqueIdentifier, broadcastData, ws, ClientWss);
                    logger.loggerSuccess("StatusNotification successfully broadcasted.");
                }
                break;

            case "MeterValues":
                response = await frameHandler.handleMeterValues(
                    uniqueIdentifier,
                    requestPayload,
                    requestId,
                    wsConnections,
                    meterValuesMap,
                    sessionFlags,
                    chargingSessionID,
                    ClientWss
                );
                break;

            case "StopTransaction":
                response = await frameHandler.handleStopTransaction(
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
                );
                // Check if there's metadata with broadcast data
                if (response.metadata && response.metadata.broadcastData && response.metadata.statusNotification) {
                    const broadcastData = response.metadata.statusNotification;
                    logger.loggerInfo(`Preparing to broadcast StopTransaction from ${uniqueIdentifier}: ${JSON.stringify(broadcastData)}`);
                    broadcastMessage(uniqueIdentifier, broadcastData, ws, ClientWss);
                    logger.loggerSuccess("StopTransaction successfully broadcasted.");
                }
                break;


        }

        if (errors.length > 0) {
            // Correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
            const errorResponse = [3, requestId, { status: "Rejected", errors }];
            const errorResponseStr = JSON.stringify(errorResponse);
            logger.loggerInfo(`Sending message to ${uniqueIdentifier}: ${errorResponseStr}`);
            return ws.send(errorResponseStr);
        }

        // Check if we need to handle metadata or broadcast data
        let broadcastData;
        let metadata = null;

        // Extract metadata if it exists
        if (response.metadata) {
            metadata = response.metadata;
            delete response.metadata; // Remove metadata before sending

            // Check if we should broadcast data
            if (metadata.broadcastData) {
                broadcastData = { broadcastData: true };
            }

            // Log any errors for monitoring
            if (!metadata.success && metadata.error) {
                logger.loggerWarn(`Error in processing request from ${uniqueIdentifier}: ${metadata.error}`);
                if (metadata.details) {
                    logger.loggerDebug(`Error details: ${JSON.stringify(metadata.details)}`);
                }
            }
        }
        // Legacy approach - for backward compatibility
        else if (response.length > 3) {
            broadcastData = response.pop(); // Remove the broadcast data
            // Ensure we have a proper 3-element response for OCPP 1.6
            if (!response[2]) {
                response[2] = {}; // Ensure there's a payload object
            }
        }

        // Ensure response is OCPP 1.6 compliant (3 elements)
        while (response.length > 3) {
            response.pop();
        }

        const responseStr = JSON.stringify(response);
        logger.loggerInfo(`Sending message to ${uniqueIdentifier}: ${responseStr}`);
        ws.send(responseStr);

        // Handle broadcasting based on metadata or legacy broadcastData
        if (broadcastData) {
            logger.loggerInfo(`Broadcasting specific data from ${uniqueIdentifier}`);
            broadcastMessage(uniqueIdentifier, requestData, ws, ClientWss);
        } else {
            // Regular broadcast of the message to other clients
            broadcastMessage(uniqueIdentifier, requestData, ws, ClientWss);
        }
    } catch (error) {
        logger.loggerError(`Message parsing error: ${error.message}`);
        // Correct OCPP 1.6 format: [MessageTypeId, UniqueId, Payload]
        const errorResponse = [3, null, { status: "Error", message: "Message parsing failed" }];
        const errorResponseStr = JSON.stringify(errorResponse);
        logger.loggerInfo(`Sending error message to ${uniqueIdentifier}: ${errorResponseStr}`);
        ws.send(errorResponseStr);
    }
};

// Import the broadcast utilities to avoid circular dependencies
const { broadcastMessage, sendForceDisconnect } = require('./utils/broadcastUtils');
const clientConnectionUtils = require('./utils/clientConnectionUtils');
const timeUtils = require('../utils/timeUtils');

/**
 * Enhanced WebSocket error handler with comprehensive error handling and recovery
 * 
 * @param {string} uniqueIdentifier - The charger ID
 * @param {Error} error - The error object
 * @param {WebSocket} ws - The WebSocket connection
 * @param {Map} wsConnections - Map of all charger connections
 * @param {Set} ClientConnections - Set of all client connections
 * @param {Map} clients - Map of WebSocket to charger ID
 * @param {string} clientIpAddress - The client's IP address
 */
const handleWebSocketError = (uniqueIdentifier, error, ws, wsConnections, ClientConnections, clients, clientIpAddress) => {
    // Log detailed error information
    logger.loggerError(`WebSocket error (${uniqueIdentifier} | IP: ${clientIpAddress}): ${error.message}`);
    logger.loggerError(`Error code: ${error.code}, type: ${error.type || 'unknown'}`);

    // Handle specific error types
    if (error.code === 'WS_ERR_UNEXPECTED_RSV_1' || error.code === 'WS_ERR_EXPECTED_MASK') {
        logger.loggerWarn(`Protocol error detected for ${uniqueIdentifier}, closing connection with protocol error code`);
        ws.close(1002, 'Protocol Error: Invalid frame received');
    } else if (error.code === 'ECONNRESET') {
        logger.loggerWarn(`Connection reset by peer for ${uniqueIdentifier}`);
        // Connection already closed by the client, just clean up
        cleanupConnection(uniqueIdentifier, ws, wsConnections, ClientConnections, clients);
    } else if (error.message.includes('write after end')) {
        logger.loggerWarn(`Attempted to write to closed connection for ${uniqueIdentifier}`);
        cleanupConnection(uniqueIdentifier, ws, wsConnections, ClientConnections, clients);
    } else {
        // For other errors, attempt graceful closure if possible
        try {
            if (ws.readyState === 1) { // WebSocket.OPEN
                logger.loggerWarn(`Closing connection for ${uniqueIdentifier} due to error`);
                ws.close(1011, 'Internal Server Error');
            } else {
                // Connection not open, force terminate
                logger.loggerWarn(`Terminating connection for ${uniqueIdentifier} (state: ${ws.readyState})`);
                cleanupConnection(uniqueIdentifier, ws, wsConnections, ClientConnections, clients);
                ws.terminate();
            }
        } catch (closeError) {
            logger.loggerError(`Error while closing connection for ${uniqueIdentifier}: ${closeError.message}`);
            // Force cleanup and terminate as last resort
            cleanupConnection(uniqueIdentifier, ws, wsConnections, ClientConnections, clients);
            try {
                ws.terminate();
            } catch (terminateError) {
                logger.loggerError(`Failed to terminate connection for ${uniqueIdentifier}: ${terminateError.message}`);
            }
        }
    }

    // Attempt to update charger status in database
    try {
        // Use the existing updateChargerStatus function instead
        dbService.updateChargerStatus(uniqueIdentifier, clientIpAddress, 'Disconnected')
            .then(() => logger.loggerInfo(`Updated connection status for ${uniqueIdentifier} to Disconnected`))
            .catch(dbError => logger.loggerError(`Failed to update charger status for ${uniqueIdentifier}: ${dbError.message}`));
    } catch (dbError) {
        logger.loggerError(`Error updating charger status for ${uniqueIdentifier}: ${dbError.message}`);
    }
};

/**
 * Enhanced WebSocket close handler with comprehensive cleanup
 * 
 * @param {string} uniqueIdentifier - The charger ID
 * @param {number} code - The close code
 * @param {string} reason - The close reason
 * @param {WebSocket} ws - The WebSocket connection
 * @param {Map} wsConnections - Map of all charger connections
 * @param {Set} ClientConnections - Set of all client connections
 * @param {Map} clients - Map of WebSocket to charger ID
 * @param {string} clientIpAddress - The client's IP address
 * @param {string} codeDescription - Human-readable description of the close code
 */
const handleWebSocketClose = (uniqueIdentifier, code, reason, ws, wsConnections, ClientConnections, clients, clientIpAddress, codeDescription) => {
    // Log detailed close information
    logger.loggerWarn(
        `WebSocket closed for Client: ${uniqueIdentifier} | IP: ${clientIpAddress} | Code: ${code} (${codeDescription}) | Reason: ${reason}`
    );

    // Clean up connection resources
    cleanupConnection(uniqueIdentifier, ws, wsConnections, ClientConnections, clients);

    // Update charger status in database based on close code
    let disconnectReason = `Connection closed with code ${code} (${codeDescription}): ${reason}`;
    let status = 'Disconnected';

    // Normal closure doesn't need special handling
    if (code === 1000) {
        status = 'Offline';
        disconnectReason = 'Normal closure: ' + reason;
    }
    // Abnormal closure might indicate connection issues
    else if (code === 1006) {
        status = 'Connection Lost';
        disconnectReason = 'Abnormal closure (no close frame received)';
        logger.loggerWarn(`Abnormal closure detected for ${uniqueIdentifier} - possible network issues`);
    }
    // Server errors should be investigated
    else if (code === 1011) {
        status = 'Error';
        logger.loggerError(`Server error caused disconnect for ${uniqueIdentifier}: ${reason}`);
    }

    // Update charger status in database
    try {
        // Use the existing updateChargerStatus function instead
        dbService.updateChargerStatus(uniqueIdentifier, clientIpAddress, status)
            .then(() => logger.loggerInfo(`Updated connection status for ${uniqueIdentifier} to ${status}`))
            .catch(dbError => logger.loggerError(`Failed to update charger status for ${uniqueIdentifier}: ${dbError.message}`));

        // Also log the disconnect reason
        logger.loggerInfo(`Disconnect reason for ${uniqueIdentifier}: ${disconnectReason}`);
    } catch (dbError) {
        logger.loggerError(`Error updating charger status for ${uniqueIdentifier}: ${dbError.message}`);
    }

    // Broadcast disconnect event to clients if needed
    try {
        broadcastDisconnectEvent(uniqueIdentifier, status, disconnectReason);
    } catch (broadcastError) {
        logger.loggerError(`Error broadcasting disconnect event for ${uniqueIdentifier}: ${broadcastError.message}`);
    }
};

/**
 * Helper function to clean up connection resources
 */
const cleanupConnection = (uniqueIdentifier, ws, wsConnections, ClientConnections, clients) => {
    // Remove from connection maps
    if (uniqueIdentifier && wsConnections) {
        wsConnections.delete(uniqueIdentifier);
    }
    if (ClientConnections) {
        ClientConnections.delete(ws);
    }
    if (clients) {
        clients.delete(ws);
    }

    // Clear any timeouts
    if (ws.pingTimeout) {
        clearTimeout(ws.pingTimeout);
        ws.pingTimeout = null;
    }
    if (ws.pongTimeout) {
        clearTimeout(ws.pongTimeout);
        ws.pongTimeout = null;
    }
};

/**
 * Helper function to broadcast disconnect events to clients
 */
const broadcastDisconnectEvent = (uniqueIdentifier, status, reason) => {
    // Implementation would depend on your client notification system
    // This is a placeholder for where you would add code to notify clients
    logger.loggerInfo(`Charger ${uniqueIdentifier} disconnected: ${status} - ${reason}`);
};

/**
 * Send charger data to a specific client
 * 
 * @param {string} chargerId - The charger ID
 * @param {string} clientId - The client ID to target
 * @param {object} data - The data to send
 * @param {WebSocketServer} ClientWss - The client WebSocket server
 * @returns {boolean} - Whether the message was sent successfully
 */
const sendChargerDataToClient = (chargerId, clientId, data, ClientWss) => {
    if (!ClientWss) {
        logger.loggerError(`Cannot send charger data: ClientWss is not available`);
        return false;
    }

    let targetFound = false;

    // Prepare the message with connection data
    const messageData = {
        DeviceID: chargerId,
        message: data,
        timestamp: new Date().toISOString(),
        connectionData: {
            chargerId: chargerId,
            isConnected: true,
            connectionType: "websocket",
            lastActivity: new Date().toISOString()
        }
    };

    const jsonMessage = JSON.stringify(messageData);

    // Find the specific client and send the message
    ClientWss.clients.forEach(client => {
        if (client.clientId === clientId && client.readyState === WebSocket.OPEN) {
            client.send(jsonMessage, (error) => {
                if (error) {
                    logger.loggerError(`Error sending message to client ${clientId}: ${error.message}`);
                } else {
                    logger.loggerSuccess(`Successfully sent charger ${chargerId} data to client ${clientId}`);
                    targetFound = true;
                }
            });
        }
    });

    if (!targetFound) {
        logger.loggerWarn(`Client ${clientId} not found or not in OPEN state`);
    }

    return targetFound;
};

/**
 * Close all active WebSocket connections
 * 
 * @returns {Promise<void>}
 */
const closeAllConnections = async () => {
    return new Promise((resolve) => {
        try {
            let closedCount = 0;
            let totalConnections = 0;

            // Close all charger connections
            if (global.wsConnections && global.wsConnections.size > 0) {
                totalConnections += global.wsConnections.size;
                logger.loggerInfo(`Closing ${global.wsConnections.size} charger connections...`);

                // Create an array of promises for closing connections
                const closePromises = [];

                global.wsConnections.forEach((ws, chargerId) => {
                    closePromises.push(new Promise((resolveClose) => {
                        try {
                            if (ws && ws.readyState === WebSocket.OPEN) {
                                // Send a final message to notify the charger
                                try {
                                    const finalMessage = JSON.stringify([
                                        2, // Call message type
                                        "server_shutdown",
                                        "Heartbeat",
                                        {}
                                    ]);
                                    ws.send(finalMessage);
                                } catch (sendErr) {
                                    // Ignore send errors during shutdown
                                }

                                // Set a timeout to force close if graceful close doesn't work
                                const forceCloseTimeout = setTimeout(() => {
                                    try {
                                        if (ws.readyState !== WebSocket.CLOSED) {
                                            ws.terminate();
                                            logger.loggerWarn(`Force terminated connection for charger ${chargerId}`);
                                        }
                                    } catch (err) {
                                        // Ignore errors during force termination
                                    }
                                    resolveClose();
                                }, 1000);

                                // Try graceful close
                                ws.close(1001, 'Server shutting down');

                                // Listen for close event
                                ws.on('close', () => {
                                    clearTimeout(forceCloseTimeout);
                                    closedCount++;
                                    logger.loggerInfo(`Closed connection for charger ${chargerId}`);
                                    resolveClose();
                                });

                                // Also listen for error event
                                ws.on('error', (err) => {
                                    logger.loggerError(`Error during close for charger ${chargerId}: ${err.message}`);
                                    clearTimeout(forceCloseTimeout);
                                    try {
                                        ws.terminate();
                                    } catch (termErr) {
                                        // Ignore terminate errors
                                    }
                                    resolveClose();
                                });
                            } else {
                                // Connection not open, just resolve
                                resolveClose();
                            }
                        } catch (err) {
                            logger.loggerError(`Error closing connection for charger ${chargerId}: ${err.message}`);
                            resolveClose();
                        }
                    }));
                });

                // Wait for all connections to close (with a timeout)
                Promise.all(closePromises).then(() => {
                    logger.loggerInfo(`Closed all charger connections`);
                });
            }

            // Close all client connections
            if (global.ClientWss && global.ClientWss.clients && global.ClientWss.clients.size > 0) {
                totalConnections += global.ClientWss.clients.size;
                logger.loggerInfo(`Closing ${global.ClientWss.clients.size} client connections...`);

                global.ClientWss.clients.forEach((client) => {
                    try {
                        if (client.readyState === WebSocket.OPEN) {
                            // Send a final message to notify the client
                            try {
                                const finalMessage = JSON.stringify({
                                    type: "server_shutdown",
                                    message: "Server is shutting down. Please reconnect later."
                                });
                                client.send(finalMessage);
                            } catch (sendErr) {
                                // Ignore send errors during shutdown
                            }

                            client.close(1001, 'Server shutting down');
                            closedCount++;
                        }
                    } catch (err) {
                        logger.loggerError(`Error closing client connection: ${err.message}`);
                    }
                });
            }

            // Clear all maps and collections
            try {
                if (global.wsConnections) global.wsConnections.clear();
                if (global.clientConnections) global.clientConnections.clear();
                if (global.clients) global.clients.clear();
                if (global.OCPPResponseMap) global.OCPPResponseMap.clear();
                if (global.meterValuesMap) global.meterValuesMap.clear();
                if (global.sessionFlags) global.sessionFlags.clear();
                if (global.charging_states) global.charging_states.clear();
                if (global.startedChargingSet) global.startedChargingSet.clear();
                if (global.chargingSessionID) global.chargingSessionID.clear();
                if (global.chargerStartTime) global.chargerStartTime.clear();
                if (global.chargerStopTime) global.chargerStopTime.clear();

                // Clear client subscriptions
                try {
                    clientConnectionUtils.clearAllSubscriptions();
                    logger.loggerInfo('Cleared all client subscriptions');
                } catch (subErr) {
                    logger.loggerError(`Error clearing client subscriptions: ${subErr.message}`);
                }

                logger.loggerInfo('Cleared all connection maps and data structures');
            } catch (clearErr) {
                logger.loggerError(`Error clearing maps: ${clearErr.message}`);
            }

            logger.loggerInfo(`Closed ${closedCount} out of ${totalConnections} connections`);

            // Give a short delay to allow final messages to be sent
            setTimeout(() => {
                resolve();
            }, 500);
        } catch (error) {
            logger.loggerError(`Error in closeAllConnections: ${error.message}`);
            resolve(); // Resolve anyway to continue shutdown
        }
    });
};

// We'll use clientConnectionUtils.broadcastToSubscribedClients directly instead of wrapping it
// This helps avoid circular dependencies

module.exports = {
    handleWebSocketConnection,
    broadcastMessage,
    sendForceDisconnect,
    sendChargerDataToClient,
    closeAllConnections
    // We're not re-exporting client connection utilities to avoid circular dependencies
    // Use clientConnectionUtils directly instead
};
