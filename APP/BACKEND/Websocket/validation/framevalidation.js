const logger = require('../../utils/logger');
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv-draft-04'); // Use ajv-draft-04 for Draft-04 support

// Initialize AJV with Draft-04 support
const ajv = new Ajv({
    allErrors: true,
    strict: false,
    formats: { "date-time": true }
});

// Load schemas once and store them in AJV
const schemaCache = new Map();
const schemaDir = path.join(__dirname, '../../middlewares/json');

// Preload all schema files
fs.readdirSync(schemaDir).forEach(file => {
    const filePath = path.join(schemaDir, file);
    if (file.endsWith('.json')) {
        try {
            const schema = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const schemaId = schema["$id"] || path.basename(file, '.json'); // Use `$id` if available
            if (!ajv.getSchema(schemaId)) {
                ajv.addSchema(schema, schemaId);
                schemaCache.set(schemaId, schema);
                // logger.loggerSuccess(`Loaded schema: ${schemaId}`);
            }
        } catch (err) {
            logger.loggerError(`Failed to load schema ${file}: ${err.message}`);
        }
    }
});

const framevalidation = (data, schemaFilename) => {
    try {
        // Get schema ID
        const schemaId = path.basename(schemaFilename, '.json');

        if (!schemaCache.has(schemaId)) {
            throw new Error(`Schema not found: ${schemaFilename}`);
        }

        // Validate data
        const validate = ajv.getSchema(schemaId);
        const isValid = validate(data);

        if (!isValid) {
            logger.loggerError(`Validation Failed (${schemaFilename}): ${JSON.stringify(validate.errors, null, 2)}`);
            return {
                error: true,
                message: 'Validation failed',
                details: validate.errors
            };
        }

        // logger.loggerSuccess(`Validation Successful (${schemaFilename})`);
        return {
            error: false,
            message: 'Validation successful'
        };
    } catch (error) {
        logger.loggerError(`Validation Error: ${error.message}`);
        return {
            error: true,
            message: 'Validation error',
            details: error.message
        };
    }
};

module.exports = { framevalidation };
