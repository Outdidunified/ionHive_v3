const WebSocket = require('ws');

// ✅ Ensure this is correct
const { Server } = WebSocket;

const websocketHandler = require('./WebsocketHandler');
const { wsConnections, clientConnections, clients, OCPPResponseMap, meterValuesMap, sessionFlags, chargingStates, startedChargingSet, chargingSessionID, chargerStartTime, chargerStopTime } = require('../data/MapModules');

const initializeWebSocket = (server, ClientWebSocketServer) => {
    // ✅ Use `new Server()` instead of `new WebSocket.Server()`
    const wss = new Server({ server, maxListeners: 1000, perMessageDeflate: true });
    const ClientWss = new Server({ server: ClientWebSocketServer });

    websocketHandler.handleWebSocketConnection(WebSocket, wss, ClientWss, wsConnections, clientConnections, clients, OCPPResponseMap, meterValuesMap, sessionFlags, chargingStates, startedChargingSet, chargingSessionID, chargerStartTime, chargerStopTime);
};

module.exports = {
    initializeWebSocket,
    wsConnections,
    clientConnections,
    clients,
    OCPPResponseMap,
    meterValuesMap
};
