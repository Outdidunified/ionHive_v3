const validateBootNotification = require("./BootNotificationValidation");
const validateDataTransfer = require("./dataTransferValidator");
const validateFirmwareStatusNotification = require("./firmwareStatusValidator");

module.exports = {
    validateBootNotification,
    validateDataTransfer,
    validateFirmwareStatusNotification
};
