const logger = require('../../utils/logger');
const dbService = require('../services/dbService');

const validateWebSocketHeaders = (request, ws) => {
    if (!request.headers['sec-websocket-key']) {
        logger.warn('WebSocket headers missing required key');
        console.warn('WebSocket headers missing required key');
        ws.terminate();
        return false;
    }
    return true;
};

const getUniqueIdentifierFromRequest = async (request, ws) => {
    const urlParts = request.url.split('/');
    const identifier = urlParts.pop();
    const validRoutes = [
        ['EvPower', 'websocket', 'CentralSystemService'],
        ['steve', 'websocket', 'CentralSystemService'],
        ['OCPPJ']
    ];

    const isValidRoute = validRoutes.some(route =>
        route.every((part, index) => part === urlParts[index + 1])
    );

    if (!isValidRoute) {
        logger.error(`Invalid WebSocket route: ${request.url}`);
        console.error(`Invalid WebSocket route: ${request.url}`);
        ws.terminate();
        return null;
    }

    if (!validateWebSocketHeaders(request, ws)) return null;

    const chargerId = identifier.toString();
    if (!await dbService.checkChargerIdInDatabase(chargerId)) {
        logger.warn(`Charger ID ${chargerId} not found`);
        console.warn(`Charger ID ${chargerId} not found`);
        ws.terminate();
        return null;
    }
    return chargerId;
};

module.exports = { getUniqueIdentifierFromRequest, validateWebSocketHeaders };
