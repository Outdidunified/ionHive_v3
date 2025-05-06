const WebSocket = require('ws');
const { Server } = WebSocket;
const websocketHandler = require('./WebsocketHandler');
const {
    wsConnections,
    clientConnections,
    clients,
    OCPPResponseMap,
    meterValuesMap,
    sessionFlags,
    charging_states,
    startedChargingSet,
    chargingSessionID,
    chargerStartTime,
    chargerStopTime,
} = require('../data/MapModules');

// Global shutdown flag to prevent message processing during shutdown
let isShuttingDown = false;

const initializeWebSocket = (server, ClientWebSocketServer) => {
    const wss = new Server({ server, maxListeners: 1000, perMessageDeflate: true });
    const ClientWss = new Server({ server: ClientWebSocketServer });

    // Pass shutdown flag to handler
    websocketHandler.handleWebSocketConnection(
        WebSocket,
        wss,
        ClientWss,
        wsConnections,
        clientConnections,
        clients,
        OCPPResponseMap,
        meterValuesMap,
        sessionFlags,
        charging_states,
        startedChargingSet,
        chargingSessionID,
        chargerStartTime,
        chargerStopTime,
        { isShuttingDown: () => isShuttingDown } // Pass shutdown state accessor
    );

    // Return WebSocket server instances for use in main server
    return { wsServer: wss, wsClientServer: ClientWss };
};

// Function to set shutdown state
const setShutdownState = (state) => {
    isShuttingDown = state;
};

module.exports = {
    initializeWebSocket,
    setShutdownState,
    wsConnections,
    clientConnections,
    clients,
    OCPPResponseMap,
    meterValuesMap,
};