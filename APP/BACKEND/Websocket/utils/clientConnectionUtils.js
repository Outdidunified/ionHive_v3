/**
 * Utility functions for managing client-specific WebSocket connections
 * This module helps track which clients are connected to which chargers/connectors
 */

const WebSocket = require('ws');
const logger = require('../../utils/logger');

// Map to track client connections by charger and connector
// Structure: { 'chargerId:connectorId': [clientId1, clientId2, ...] }
const clientSubscriptions = new Map();

/**
 * Register a client subscription to a specific charger and connector
 * 
 * @param {string} clientId - The client's unique ID
 * @param {string} chargerId - The charger ID
 * @param {number} connectorId - The connector ID
 */
const registerClientSubscription = (clientId, chargerId, connectorId) => {
    const key = `${chargerId}:${connectorId}`;

    if (!clientSubscriptions.has(key)) {
        clientSubscriptions.set(key, new Set());
    }

    clientSubscriptions.get(key).add(clientId);
    logger.loggerInfo(`Client ${clientId} subscribed to charger ${chargerId}, connector ${connectorId}`);
};

/**
 * Unregister a client subscription
 * 
 * @param {string} clientId - The client's unique ID
 * @param {string} chargerId - The charger ID (optional, if not provided, unregister from all)
 * @param {number} connectorId - The connector ID (optional, if not provided, unregister from all for this charger)
 */
const unregisterClientSubscription = (clientId, chargerId = null, connectorId = null) => {
    if (chargerId === null) {
        // Unregister from all subscriptions
        for (const [key, clients] of clientSubscriptions.entries()) {
            if (clients.has(clientId)) {
                clients.delete(clientId);
                logger.loggerInfo(`Client ${clientId} unsubscribed from ${key}`);

                // Clean up empty sets
                if (clients.size === 0) {
                    clientSubscriptions.delete(key);
                }
            }
        }
    } else if (connectorId === null) {
        // Unregister from all connectors for this charger
        for (const [key, clients] of clientSubscriptions.entries()) {
            if (key.startsWith(`${chargerId}:`)) {
                if (clients.has(clientId)) {
                    clients.delete(clientId);
                    logger.loggerInfo(`Client ${clientId} unsubscribed from ${key}`);

                    // Clean up empty sets
                    if (clients.size === 0) {
                        clientSubscriptions.delete(key);
                    }
                }
            }
        }
    } else {
        // Unregister from specific charger and connector
        const key = `${chargerId}:${connectorId}`;
        if (clientSubscriptions.has(key)) {
            const clients = clientSubscriptions.get(key);
            if (clients.has(clientId)) {
                clients.delete(clientId);
                logger.loggerInfo(`Client ${clientId} unsubscribed from charger ${chargerId}, connector ${connectorId}`);

                // Clean up empty sets
                if (clients.size === 0) {
                    clientSubscriptions.delete(key);
                }
            }
        }
    }
};

/**
 * Get all clients subscribed to a specific charger and connector
 * 
 * @param {string} chargerId - The charger ID
 * @param {number} connectorId - The connector ID
 * @returns {Set<string>} - Set of client IDs
 */
const getSubscribedClients = (chargerId, connectorId) => {
    const key = `${chargerId}:${connectorId}`;
    return clientSubscriptions.has(key) ? clientSubscriptions.get(key) : new Set();
};

/**
 * Broadcast a message to all clients subscribed to a specific charger and connector
 * 
 * @param {string} chargerId - The charger ID
 * @param {number} connectorId - The connector ID
 * @param {object} message - The message to broadcast
 * @param {WebSocketServer} ClientWss - The client WebSocket server
 * @param {WebSocket} sender - The sender WebSocket (will be excluded from broadcast)
 */
const broadcastToSubscribedClients = (chargerId, connectorId, message, ClientWss, sender = null) => {
    const subscribedClientIds = getSubscribedClients(chargerId, connectorId);

    if (subscribedClientIds.size === 0) {
        logger.loggerInfo(`No clients subscribed to charger ${chargerId}, connector ${connectorId}`);
        return;
    }

    logger.loggerInfo(`Broadcasting to ${subscribedClientIds.size} clients subscribed to charger ${chargerId}, connector ${connectorId}`);

    // Prepare the message with connection data
    const messageData = {
        DeviceID: chargerId,
        message,
        timestamp: new Date().toISOString(),
        connectorId: connectorId,
        connectionData: {
            chargerId: chargerId,
            connectorId: connectorId,
            isConnected: true,
            connectionType: "websocket",
            lastActivity: new Date().toISOString()
        }
    };

    const jsonMessage = JSON.stringify(messageData);

    // Send to all subscribed clients
    let sentCount = 0;
    ClientWss.clients.forEach(client => {
        // Skip the sender
        if (client === sender) {
            return;
        }

        // Check if client is open
        if (client.readyState !== WebSocket.OPEN) {
            return;
        }

        // Check if this client is subscribed
        if (client.clientId && subscribedClientIds.has(client.clientId)) {
            client.send(jsonMessage, (error) => {
                if (error) {
                    logger.loggerError(`Error sending message to client ${client.clientId}: ${error.message}`);
                } else {
                    sentCount++;
                }
            });
        }
    });

    logger.loggerInfo(`Successfully sent message to ${sentCount} of ${subscribedClientIds.size} subscribed clients`);
};

/**
 * Parse the WebSocket URL to extract charger ID and connector ID
 * Format: /charging/:chargerId/:connectorId
 * 
 * @param {string} url - The WebSocket URL
 * @returns {object|null} - { chargerId, connectorId } or null if invalid
 */
const parseChargingUrl = (url) => {
    try {
        // Extract path from URL
        const urlObj = new URL(url, 'http://localhost');
        const path = urlObj.pathname;

        // Check if it's a charging URL
        const match = path.match(/\/charging\/([^\/]+)\/(\d+)/);
        if (match) {
            return {
                chargerId: match[1],
                connectorId: parseInt(match[2], 10)
            };
        }
    } catch (error) {
        logger.loggerError(`Error parsing charging URL: ${error.message}`);
    }

    return null;
};

/**
 * Handle a new client connection
 * 
 * @param {WebSocket} client - The client WebSocket
 * @param {object} request - The HTTP request
 */
const handleClientConnection = (client, request) => {
    // Generate a unique client ID
    client.clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Parse the URL to check if it's a charging-specific connection
    const url = request.url;
    const chargingInfo = parseChargingUrl(url);

    if (chargingInfo) {
        const { chargerId, connectorId } = chargingInfo;

        // Register this client for the specific charger and connector
        registerClientSubscription(client.clientId, chargerId, connectorId);

        // Store the subscription info on the client object
        client.subscriptionInfo = { chargerId, connectorId };

        logger.loggerInfo(`Client ${client.clientId} connected to charging endpoint for charger ${chargerId}, connector ${connectorId}`);
    } else {
        logger.loggerInfo(`Client ${client.clientId} connected to general endpoint`);
    }

    // Handle client disconnect
    client.on('close', () => {
        if (client.subscriptionInfo) {
            const { chargerId, connectorId } = client.subscriptionInfo;
            unregisterClientSubscription(client.clientId, chargerId, connectorId);
        } else {
            unregisterClientSubscription(client.clientId);
        }

        logger.loggerInfo(`Client ${client.clientId} disconnected`);
    });
};

/**
 * Clear all client subscriptions
 */
const clearAllSubscriptions = () => {
    clientSubscriptions.clear();
    logger.loggerInfo('All client subscriptions cleared');
};

module.exports = {
    registerClientSubscription,
    unregisterClientSubscription,
    getSubscribedClients,
    broadcastToSubscribedClients,
    parseChargingUrl,
    handleClientConnection,
    clearAllSubscriptions
};