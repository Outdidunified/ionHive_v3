const { handleBootNotification } = require("./frameHandlers/bootnotificationframehandler");
const { handleHeartbeat } = require("./frameHandlers/heartbeatframehandler");
const { handleStatusNotification } = require("./frameHandlers/StatusNotificationframehandler");
const { handleAuthorize } = require("./frameHandlers/authorizeframehandler");
const { handleStartTransaction } = require("./frameHandlers/starttransactionframehandler");
const { handleMeterValues } = require("./frameHandlers/metervalueframehandler");


const { handleDataTransfer } = require("./frameHandlers/datatransferframehandler");
const { handleFirmwareStatusNotification } = require("./frameHandlers/firmwareStatusframehandler");



module.exports = {
    handleBootNotification,
    handleHeartbeat,
    handleStatusNotification,
    handleAuthorize,
    handleStartTransaction,
    handleMeterValues,

    handleDataTransfer,
    handleFirmwareStatusNotification,

};
