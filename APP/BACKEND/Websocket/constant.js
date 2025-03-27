const { handleBootNotification } = require("./frameHandlers/bootnotificationframehandler");
const { handleHeartbeat } = require("./frameHandlers/heartbeatframehandler");
const { handleStatusNotification } = require("./frameHandlers/StatusNotificationframehandler");


const { handleDataTransfer } = require("./frameHandlers/datatransferframehandler");
const { handleFirmwareStatusNotification } = require("./frameHandlers/firmwareStatusframehandler");



module.exports = {
    handleBootNotification,
    handleHeartbeat,
    handleStatusNotification,


    handleDataTransfer,
    handleFirmwareStatusNotification,

};
