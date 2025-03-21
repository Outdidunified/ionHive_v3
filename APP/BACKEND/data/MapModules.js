const otpStore = new Map(); // for OTPs
const ClientConnections = new Set();
const wsConnections = new Map();
const clients = new Map();
const OCPPResponseMap = new Map();
const meterValuesMap = new Map();
const sessionFlags = new Map();
const charging_states = new Map();
const startedChargingSet = new Set();
const chargingSessionID = new Map();
const uniqueKey = new Map(); // Changed from Set to Map
const TagID = new Map(); // Changed from Set to Map
const chargerStartTime = new Map();
const chargerStopTime = new Map();

module.exports = { otpStore, wsConnections, ClientConnections, clients, OCPPResponseMap, meterValuesMap, sessionFlags, charging_states, startedChargingSet, chargingSessionID, uniqueKey, TagID, chargerStartTime, chargerStopTime };

