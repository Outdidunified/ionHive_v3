/**
 * Example client-side code for connecting to the WebSocket server
 * and receiving targeted messages
 */

// In a real application, this would be in a browser or mobile app
const WebSocket = require('ws'); // Only for Node.js example

/**
 * Connect to the WebSocket server with user identification
 * 
 * @param {string} userId - The user ID
 * @param {string} role - The user role (optional)
 * @returns {WebSocket} - The WebSocket connection
 */
const connectToWebSocketServer = (userId, role = 'user') => {
    // Include userId and role as query parameters
    const ws = new WebSocket(`ws://localhost:8080/client?userId=${userId}&role=${role}`);

    // Connection opened
    ws.onopen = () => {
        console.log(`Connected to WebSocket server as user ${userId}`);

        // Subscribe to specific chargers
        subscribeToCharger(ws, 'CHARGER123');
        subscribeToCharger(ws, 'CHARGER456');
    };

    // Listen for messages
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            // Handle different message types
            if (data.type === 'connection') {
                console.log(`Connection status: ${data.status}`);
            }
            else if (data.type === 'subscription') {
                console.log(`Subscription to ${data.chargerId}: ${data.status}`);
            }
            else if (data.type === 'notification') {
                handleNotification(data);
            }
            else if (data.DeviceID && data.message) {
                // Handle broadcast or targeted messages
                if (data.targetedMessage) {
                    console.log(`Received targeted message from ${data.DeviceID}:`, data.message);
                } else {
                    console.log(`Received broadcast message from ${data.DeviceID}:`, data.message);
                }

                // Process specific message types
                if (data.message[2] === 'ChargingSessionComplete') {
                    handleChargingComplete(data.message[3]);
                }
                else if (data.message[2] === 'ChargerStatusChange') {
                    handleStatusChange(data.message[3]);
                }
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    };

    // Handle errors
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    // Handle disconnection
    ws.onclose = (event) => {
        console.log(`Disconnected from WebSocket server: ${event.code} - ${event.reason}`);

        // Attempt to reconnect after a delay
        setTimeout(() => {
            console.log('Attempting to reconnect...');
            connectToWebSocketServer(userId, role);
        }, 5000);
    };

    return ws;
};

/**
 * Subscribe to a specific charger
 * 
 * @param {WebSocket} ws - The WebSocket connection
 * @param {string} chargerId - The charger ID to subscribe to
 */
const subscribeToCharger = (ws, chargerId) => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            action: 'subscribe',
            chargerId: chargerId
        }));
    }
};

/**
 * Unsubscribe from a specific charger
 * 
 * @param {WebSocket} ws - The WebSocket connection
 * @param {string} chargerId - The charger ID to unsubscribe from
 */
const unsubscribeFromCharger = (ws, chargerId) => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            action: 'unsubscribe',
            chargerId: chargerId
        }));
    }
};

/**
 * Handle a notification message
 * 
 * @param {object} data - The notification data
 */
const handleNotification = (data) => {
    console.log(`Notification for charger ${data.chargerId}:`, data.data);

    // Handle different notification types
    if (data.data.type === 'StatusChange') {
        console.log(`Charger ${data.chargerId} status changed to ${data.data.status}`);
        updateChargerStatusUI(data.chargerId, data.data.status);
    }
};

/**
 * Handle a charging complete message
 * 
 * @param {object} data - The charging complete data
 */
const handleChargingComplete = (data) => {
    console.log('Charging session complete:', data);

    // Update UI with session summary
    updateSessionSummaryUI(
        data.sessionId,
        data.duration,
        data.energyConsumed,
        data.cost
    );

    // Show notification to user
    showNotification(
        'Charging Complete',
        `Your charging session has ended. You used ${data.energyConsumed} kWh and were charged $${data.cost}.`
    );
};

/**
 * Handle a status change message
 * 
 * @param {object} data - The status change data
 */
const handleStatusChange = (data) => {
    console.log(`Charger ${data.chargerId} status changed to ${data.status}`);
    updateChargerStatusUI(data.chargerId, data.status);
};

/**
 * Update the UI with charger status (placeholder function)
 * 
 * @param {string} chargerId - The charger ID
 * @param {string} status - The new status
 */
const updateChargerStatusUI = (chargerId, status) => {
    console.log(`UI Updated: Charger ${chargerId} is now ${status}`);
    // In a real app, this would update the UI elements
};

/**
 * Update the UI with session summary (placeholder function)
 * 
 * @param {string} sessionId - The session ID
 * @param {number} duration - The session duration in seconds
 * @param {number} energyConsumed - The energy consumed in kWh
 * @param {number} cost - The session cost
 */
const updateSessionSummaryUI = (sessionId, duration, energyConsumed, cost) => {
    console.log(`UI Updated: Session Summary
    Session ID: ${sessionId}
    Duration: ${Math.floor(duration / 60)} minutes
    Energy: ${energyConsumed} kWh
    Cost: $${cost.toFixed(2)}`);
    // In a real app, this would update the UI elements
};

/**
 * Show a notification to the user (placeholder function)
 * 
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 */
const showNotification = (title, message) => {
    console.log(`NOTIFICATION: ${title} - ${message}`);
    // In a real app, this would show a system notification
};

// Example usage
const userId = '123456';
const userRole = 'customer';
const wsConnection = connectToWebSocketServer(userId, userRole);

// Later, when the user navigates away from a charger detail page
setTimeout(() => {
    unsubscribeFromCharger(wsConnection, 'CHARGER456');
    console.log('Unsubscribed from CHARGER456');
}, 10000);

// Export for use in other files
module.exports = {
    connectToWebSocketServer,
    subscribeToCharger,
    unsubscribeFromCharger
};