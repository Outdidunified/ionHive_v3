const validateDataTransfer = (data) => {
    const schema = {
        properties: {
            vendorId: { type: "string", maxLength: 50 },
            messageId: { type: "string", maxLength: 50 },
            data: { type: "string", maxLength: 255 }
        },
        required: ["vendorId", "messageId"]
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

module.exports = validateDataTransfer;
