const validateFirmwareStatusNotification = (data) => {
    const schema = {
        properties: {
            status: { type: "string", maxLength: 20 }
        },
        required: ["status"]
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

module.exports = validateFirmwareStatusNotification;
