/**
 * Example of how to use targeted messaging in your application
 * 
 * This file demonstrates how to use the new targeted messaging functions
 * to send specific data to specific clients.
 */

const {
    sendToSpecificClient,
    sendToMultipleClients,
    sendSubscriptionNotifications
} = require('../WebsocketHandler');

/**
 * Example 1: Send a notification to a specific user when their charging session is complete
 * 
 * @param {string} userId - The user ID to send the notification to
 * @param {string} chargerId - The charger ID
 * @param {object} sessionData - The charging session data
 * @param {WebSocketServer} ClientWss - The client WebSocket server
 */
const notifyUserOfCompletedChargingSession = (userId, chargerId, sessionData, ClientWss) => {
    // Create a notification message
    const message = [
        2, // Message type (2 = Request)
        "notification-" + Date.now(), // Unique ID
        "ChargingSessionComplete", // Action
        {
            chargerId: chargerId,
            sessionId: sessionData.sessionId,
            duration: sessionData.duration,
            energyConsumed: sessionData.energyConsumed,
            cost: sessionData.cost,
            timestamp: new Date().toISOString()
        }
    ];

    // Send the notification to the specific user
    const result = sendToSpecificClient(userId, chargerId, message, ClientWss);

    if (result) {
        console.log(`Notification sent to user ${userId} about completed charging session`);
    } else {
        console.log(`Failed to send notification to user ${userId}`);
    }
};

/**
 * Example 2: Send a notification to multiple users about a charger status change
 * 
 * @param {string[]} userIds - Array of user IDs to notify
 * @param {string} chargerId - The charger ID
 * @param {string} status - The new status
 * @param {WebSocketServer} ClientWss - The client WebSocket server
 */
const notifyUsersOfChargerStatusChange = (userIds, chargerId, status, ClientWss) => {
    // Create a notification message
    const message = [
        2, // Message type (2 = Request)
        "status-" + Date.now(), // Unique ID
        "ChargerStatusChange", // Action
        {
            chargerId: chargerId,
            status: status,
            timestamp: new Date().toISOString()
        }
    ];

    // Send the notification to multiple users
    const result = sendToMultipleClients(userIds, chargerId, message, ClientWss);

    console.log(`Status notification sent to ${result.sent} users, failed for ${result.failed} users`);
    if (result.notFound.length > 0) {
        console.log(`Users not found: ${result.notFound.join(', ')}`);
    }
};

/**
 * Example 3: Send a notification to all subscribers of a charger
 * 
 * @param {string} chargerId - The charger ID
 * @param {object} data - The notification data
 * @param {WebSocketServer} ClientWss - The client WebSocket server
 */
const notifyAllSubscribers = (chargerId, data, ClientWss) => {
    // Send notification to all subscribers
    const result = sendSubscriptionNotifications(chargerId, data, ClientWss);

    console.log(`Notification sent to ${result.sent} subscribers of charger ${chargerId}`);
};

/**
 * Example 4: Real-world usage in StopTransaction handler
 * 
 * This shows how you would integrate targeted messaging in your StopTransaction handler
 */
const handleStopTransactionWithTargetedMessaging = async (
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
    ClientWss
) => {
    // Process the StopTransaction request as usual
    const response = await frameHandler.handleStopTransaction(
        uniqueIdentifier,
        requestPayload,
        requestId,
        wsConnections,
        sessionFlags,
        charging_states,
        startedChargingSet,
        chargerStopTime,
        meterValuesMap,
        chargingSessionID
    );

    // Check if there's metadata with broadcast data
    if (response.metadata && response.metadata.broadcastData && response.metadata.statusNotification) {
        const broadcastData = response.metadata.statusNotification;

        // 1. Broadcast to all clients (legacy approach)
        broadcastMessage(uniqueIdentifier, broadcastData, null, ClientWss);

        // 2. If we have user information, send targeted notification
        if (response.metadata.userId) {
            // Send specific notification to the user who was charging
            const sessionSummary = {
                sessionId: response.metadata.sessionId,
                duration: response.metadata.duration,
                energyConsumed: response.metadata.energyConsumed,
                cost: response.metadata.cost
            };

            sendToSpecificClient(
                response.metadata.userId,
                uniqueIdentifier,
                [2, requestId, "ChargingComplete", sessionSummary],
                ClientWss
            );
        }

        // 3. Notify all subscribers about the status change
        sendSubscriptionNotifications(
            uniqueIdentifier,
            {
                type: "StatusChange",
                status: "Available",
                timestamp: new Date().toISOString()
            },
            ClientWss
        );
    }

    return response;
};

module.exports = {
    notifyUserOfCompletedChargingSession,
    notifyUsersOfChargerStatusChange,
    notifyAllSubscribers,
    handleStopTransactionWithTargetedMessaging
};