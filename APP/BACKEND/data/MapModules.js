const otpStore = new Map(); // Stores OTPs for verification
const clientConnections = new Set(); // Active client WebSocket connections
const wsConnections = new Map(); // Maps client IDs to WebSocket instances
const clients = new Map(); // Stores client-related data

const OCPPResponseMap = new Map(); // Stores OCPP responses mapped by unique identifiers
const meterValuesMap = new Map(); // Stores meter values from chargers
const sessionFlags = new Map(); // Flags for session states
const charging_states = new Map(); // Charging state management
const startedChargingSet = new Set(); // Tracks which chargers have started charging

const chargingSessionID = new Map(); // Maps chargers to session IDs
const uniqueKey = new Map(); // Maps unique session keys
const TagID = new Map(); // Stores tag IDs for authentication

const chargerStartTime = new Map(); // Maps chargers to start timestamps
const chargerStopTime = new Map(); // Maps chargers to stop timestamps

module.exports = {
    otpStore,
    wsConnections,
    clientConnections,
    clients,
    OCPPResponseMap,
    meterValuesMap,
    sessionFlags,
    charging_states,
    startedChargingSet,
    chargingSessionID,
    uniqueKey,
    TagID,
    chargerStartTime,
    chargerStopTime
};
