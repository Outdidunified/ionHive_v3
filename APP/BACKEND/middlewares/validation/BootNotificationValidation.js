const validateBootNotification = (data) => {
    const schema = {
        properties: {
            chargePointVendor: { type: "string", maxLength: 20 },
            chargePointModel: { type: "string", maxLength: 20 },
            chargePointSerialNumber: { type: "string", maxLength: 25 },
            chargeBoxSerialNumber: { type: "string", maxLength: 25 },
            firmwareVersion: { type: "string", maxLength: 50 },
            iccid: { type: "string", maxLength: 20 },
            imsi: { type: "string", maxLength: 20 },
            meterType: { type: "string", maxLength: 25 },
            meterSerialNumber: { type: "string", maxLength: 25 }
        },
        required: ["chargePointVendor", "chargePointModel"]
    };

    return validateData(data, schema);
};

// Common validation function
const validateData = (data, schema) => {
    const errors = [];

    schema.required.forEach(field => {
        if (!data[field]) errors.push(`Missing required field: ${field}`);
    });

    Object.entries(schema.properties).forEach(([field, rules]) => {
        if (data[field]) {
            if (typeof data[field] !== rules.type) errors.push(`Invalid type for field: ${field}`);
            if (data[field].length > rules.maxLength) errors.push(`Field exceeds maxLength: ${field}`);
        }
    });

    return errors;
};

module.exports = validateBootNotification;
