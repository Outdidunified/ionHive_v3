const WebSocket = require('ws');
const websocketHandler = require('./websocketHandler');
const { wsConnections, ClientConnections, clients, OCPPResponseMap, meterValuesMap, sessionFlags, charging_states, startedChargingSet, chargingSessionID, chargerStartTime, chargerStopTime } = require('../data/MapModules');

// initialize websocket connection
const initializeWebSocket = (server, ClientWebSocketServer) => {
    const wss = new WebSocket.Server({ server, maxListeners: 1000, perMessageDeflate: true });
    const ClientWss = new WebSocket.Server({ server: ClientWebSocketServer });

    websocketHandler.handleWebSocketConnection(WebSocket, wss, ClientWss, wsConnections, ClientConnections, clients, OCPPResponseMap, meterValuesMap, sessionFlags, charging_states, startedChargingSet, chargingSessionID, chargerStartTime, chargerStopTime);
};

module.exports = {
    initializeWebSocket,
    wsConnections,
    ClientConnections,
    clients,
    OCPPResponseMap,
    meterValuesMap
};