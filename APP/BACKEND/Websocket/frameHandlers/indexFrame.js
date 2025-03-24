const { handleBootNotification } = require("./bootnotificationframehandler");
const { handleHeartbeat } = require("./heartbeatframehandler");
const { handleStatusNotification } = require("./StatusNotificationframehandler");

module.exports = {
    handleBootNotification,
    handleHeartbeat,
    handleStatusNotification,
};
