const WebSocket = require('ws');
const { Server } = WebSocket;
const websocketHandler = require('./WebsocketHandler');
const clientConnectionUtils = require('./utils/clientConnectionUtils');
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

// Global variables
// Global shutdown flag to prevent message processing during shutdown
let isShuttingDown = false;

// Global variables to store WebSocket servers for access during shutdown
global.wss = null;
global.ClientWss = null;
global.wsConnections = wsConnections;

const initializeWebSocket = (server, ClientWebSocketServer) => {
    const wss = new Server({ server, maxListeners: 1000, perMessageDeflate: true });
    const ClientWss = new Server({ server: ClientWebSocketServer });

    // Store in global variables for access during shutdown
    global.wss = wss;
    global.ClientWss = ClientWss;

    // Pass shutdown flag to handler
    websocketHandler.handleWebSocketConnection(
        WebSocket,
        wss,
        ClientWss,
        // Handle charger connections
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

    // Handle client connections with subscription tracking
    ClientWss.on('connection', (client, request) => {
        clientConnectionUtils.handleClientConnection(client, request);
    });

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