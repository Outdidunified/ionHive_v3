/**
 * Utility functions for broadcasting messages
 * This module helps avoid circular dependencies between frame handlers and WebsocketHandler
 */

const WebSocket = require('ws');
const logger = require('../../utils/logger');

/**
 * Broadcast a message to clients with enhanced charger data
 * 
 * @param {string} DeviceID - The charger ID
 * @param {object} message - The message to broadcast
 * @param {WebSocket} sender - The sender WebSocket (will be excluded from broadcast)
 * @param {WebSocketServer} ClientWss - The client WebSocket server
 * @param {object} options - Optional parameters
 * @param {boolean} options.includeConnectionData - Whether to include connection data for frontend
 * @param {string} options.targetClientId - Optional client ID to target specific frontend client
 * @param {number} options.connectorId - Optional connector ID for specific connector broadcasts
 */
const broadcastMessage = (DeviceID, message, sender, ClientWss, options = {}) => {
    // Default options
    const {
        includeConnectionData = true,
        targetClientId = null,
        connectorId = null
    } = options;

    // Prepare the message with charger ID and connection data
    const messageData = {
        DeviceID,
        message,
        timestamp: new Date().toISOString()
    };

    // Add connector ID if provided
    if (connectorId !== null) {
        messageData.connectorId = connectorId;
    }

    // Add connection data if requested
    if (includeConnectionData) {
        messageData.connectionData = {
            chargerId: DeviceID,
            isConnected: true,
            connectionType: "websocket",
            lastActivity: new Date().toISOString(),
            connectorId: connectorId
        };
    }

    const jsonMessage = JSON.stringify(messageData);

    // Log the broadcast
    logger.loggerInfo(`Broadcasting message for charger ${DeviceID}${connectorId !== null ? `, connector ${connectorId}` : ''}${targetClientId ? ` to client ${targetClientId}` : ''}`);

    // Send to all clients or specific client
    ClientWss.clients.forEach(client => {
        // Skip the sender
        if (client === sender) {
            return;
        }

        // Check if client is open
        if (client.readyState !== WebSocket.OPEN) {
            return;
        }

        // If targeting specific client and this isn't it, skip
        if (targetClientId && client.clientId !== targetClientId) {
            return;
        }

        // Send the message
        client.send(jsonMessage, (error) => {
            if (error) {
                logger.loggerError(`Error sending message to client: ${error.message}`);
            }
        });
    });
};

/**
 * Send a force disconnect message for a specific charger and connector
 * 
 * @param {string} chargerId - The charger ID
 * @param {number} connectorId - The connector ID
 * @param {WebSocket} sender - The sender WebSocket
 * @param {WebSocketServer} ClientWss - The client WebSocket server
 * @param {string} message - Optional custom message
 */
const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
};

const sendForceDisconnect = (chargerId, connectorId, sender, ClientWss, message = "No action attempted. Automatically redirecting to home page.") => {
    const customFrame = [
        2,
        generateMessageId(),
        "ForceDisconnect",
        {
            connectorId: connectorId,
            message: message,
            timestamp: new Date().toISOString()
        }
    ];

    broadcastMessage(chargerId, customFrame, sender, ClientWss, {
        includeConnectionData: true,
        connectorId: connectorId
    });

    logger.loggerInfo(`Broadcasted disconnect message for charger ${chargerId}, connector ${connectorId}`);
};

module.exports = {
    broadcastMessage,
    sendForceDisconnect
};