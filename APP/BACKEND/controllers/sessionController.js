const db_conn = require('../config/db');
const logger = require('../utils/logger');
const PDFDocument = require('pdfkit');
let db;
const initializeDB = async () => {
    if (!db) {
        db = await db_conn.connectToDatabase();
    }
    return db;
};
initializeDB(); // Initialize the DB connection once


// TOTAL CHARGING SESSION 
// Total Charging session details
const fetchTotalChargingSessionDetails = async (req, res) => {
    const { email_id } = req.body;

    try {
        // Validate input
        if (!email_id || typeof email_id !== 'string' || email_id.trim() === '') {
            return res.status(400).json({
                error: true,
                message: 'Invalid input: email_id must be a non-empty string.',
            });
        }

        // Connect to database

        if (!db) {
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }
        const collection = db.collection('device_session_details');

        // Fetch sessions where stop_time is not null
        const result = await collection.find({ email_id: email_id, stop_time: { $ne: null } })
            .sort({ stop_time: -1 })
            .toArray();

        if (!result || result.length === 0) {
            return res.status(200).json({
                error: false,
                message: 'No charging session records found!',

            });
        }

        // Calculate total charging time, count sessions, and total energy consumed
        let totalChargingTime = 0;
        let totalEnergyConsumed = 0;
        result.forEach(session => {
            const startTime = new Date(session.start_time);
            const stopTime = new Date(session.stop_time);
            const sessionDuration = (stopTime - startTime) / 1000; // Duration in seconds
            totalChargingTime += sessionDuration;

            if (session.unit_consummed) {
                totalEnergyConsumed += session.unit_consummed;
            }
        });

        const totalChargingTimeInHours = (totalChargingTime / 3600).toFixed(2); // Convert to hours

        return res.status(200).json({
            error: false,
            message: 'Total charging session data retrieved successfully.',
            totalChargingTimeInHours,
            totalSessions: result.length,
            totalEnergyConsumed: totalEnergyConsumed.toFixed(2) // Energy in kWh
        });

    } catch (error) {
        logger.loggerError(`Error fetching total session data for email_id=${req.body?.email_id}: ${error.message}`, { error });
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

// CHARGING HISTORY 
// to save the Charging Session History filter to the user
const saveChargingSessionHistoryFilter = async (req, res) => {
    const { user_id, email_id, days } = req.body;

    try {
        // Validate input
        if (!user_id || !email_id || !days ||
            !Number.isInteger(Number(user_id)) || typeof email_id !== 'string' ||
            !Number.isInteger(Number(days))) {
            return res.status(400).json({
                error: true,
                message: 'Invalid input: user_id and days must be integers, email_id must be a string.',
            });
        }


        if (!db) {
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }
        const usersCollection = db.collection('users');

        // Find the user
        const user = await usersCollection.findOne({ user_id, email_id });

        if (!user) {
            return res.status(404).json({
                error: true,
                message: 'User not found.',
            });
        }

        const updatedChargingSessionHistoryFilter = [{ days }];

        const updateResult = await usersCollection.updateOne(
            { user_id, email_id },
            { $set: { ChargingSessionHistoryFilter: updatedChargingSessionHistoryFilter } }
        );

        if (updateResult.modifiedCount === 0) {
            logger.loggerWarn(`Failed to update Charging SessionHistory Filter for user ${user_id} with email ${email_id}.`);
            return res.status(500).json({
                error: true,
                message: 'Failed to update Charging SessionHistory Filter .',
            });
        }

        logger.loggerSuccess(`Charging SessionHistory  filter updated successfully for user ${user_id} with email ${email_id}.`);
        return res.status(200).json({
            error: false,
            message: 'Charging SessionHistory  filter updated successfully',
            updatedChargingSessionHistoryFilter,
        });

    } catch (error) {
        logger.loggerError(`Error in updatedChargingSessionHistoryFilter - ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
        });
    }
};
// to fetch the Charging SessionHistory filter to the user
const fetchChargingSessionHistoryFilter = async (req, res) => {
    const { user_id, email_id } = req.body;

    try {

        // Validate input
        if (!user_id || !email_id || !Number.isInteger(Number(user_id)) || typeof email_id !== 'string') {
            return res.status(400).json({ success: false, message: 'Valid user_id and email_id are required!' });
        }


        if (!db) {
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }
        const usersCollection = db.collection('users');

        // Find user
        const user = await usersCollection.findOne(
            { user_id: Number(user_id), email_id },
            { projection: { ChargingSessionHistoryFilter: 1, _id: 0 } }
        );

        if (!user || !user.ChargingSessionHistoryFilter) {
            return res.status(200).json({ success: true, message: 'No Charging SessionHistory filter found.', filter: {} });
        }

        logger.loggerSuccess(`Charging SessionHistory  filter fetched successfully for user ${user_id} `);
        return res.status(200).json({ success: true, message: 'Charging SessionHistory filter retrieved successfully.', filter: user.ChargingSessionHistoryFilter });

    } catch (error) {
        logger.loggerError(`Error in fetchChargingSessionHistoryFilter - ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};
// Fetch all charging session details //TODO -  want to fix the filter issue 
const fetchChargingSessionDetails = async (req, res) => {
    try {
        const { email_id, days } = req.body;

        // Validate input
        if (!email_id || typeof email_id !== 'string' || email_id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Invalid input: email_id must be a non-empty string.',
            });
        }

        // Connect to database

        if (!db) {
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }
        const usersCollection = db.collection('users');
        const collection = db.collection('device_session_details');

        // Verify User
        const user = await usersCollection.findOne({ email_id });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        let query = { email_id: email_id, stop_time: { $ne: null } };

        if (days && Number.isInteger(days)) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            query = {
                email_id: email_id,
                stop_time: {
                    $ne: null,
                    $gte: cutoffDate
                }
            };
        }
        console.log(query);

        // Fetch filtered sessions in descending order by stop_time
        const result = await collection.find(query).sort({ stop_time: -1 }).toArray();
        console.log(result);

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No charging session records found!',
            });
        }

        logger.loggerSuccess(`Charge session retrieved successfully for email_id=${req.body?.email_id}`)
        return res.status(200).json({
            success: true,
            message: 'Charging session details retrieved successfully.',
            data: result,
        });

    } catch (error) {
        logger.loggerError(`Error fetching charging session details for email_id=${req.body?.email_id}: ${error.message}`, { error });
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};

// DOWNLOAD CHARGING HISTORY 
// download all user charging session details
const DownloadChargingSessionDetails = async (req, res) => {
    const { email_id, total_unit_consumed } = req.query;

    try {

        // Validate input
        if (!email_id || typeof email_id !== 'string' || email_id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Invalid input: email_id must be a non-empty string.',
            });
        }


        if (!db) {
            return res.status(500).json({
                error: true,
                message: 'Database connection failed. Please try again later.',
            });
        }
        const Collection = db.collection('device_session_details');

        const sessions = await Collection.find({ user: email_id, stop_time: { $ne: null } })
            .sort({ stop_time: -1 })
            .toArray();

        if (!sessions || sessions.length === 0) {
            logger.loggerInfo(` No charging session records found for email_id: ${email_id}`);
            return res.status(404).json({ message: 'No charging session records found!' });
        }

        logger.loggerInfo(`Found ${sessions.length} session(s), generating PDF...`);
        let totalUnits = 0;
        let totalPrice = 0;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="ChargingSessions_${email_id}.pdf"`);

        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
        doc.pipe(res);

        // Title
        doc.font('Helvetica-Bold').fontSize(20).text('Charging Session Details', { align: 'center', underline: true });
        doc.moveDown(1);

        // Summary section
        doc.font('Helvetica-Bold').fontSize(16);
        doc.text(`User: ${email_id}`);
        doc.text(`Total Sessions: ${sessions.length}`);
        doc.text(`Total Units Consumed: ${total_unit_consumed} kWh`);
        doc.moveDown(1);

        // Table setup
        const columnWidths = [60, 70, 120, 70, 110, 110, 80, 80, 80];
        const startX = 30;
        let rowY = doc.y;
        const rowHeight = 20;
        const pageBottomMargin = 30;

        const drawBorders = (y) => {
            let x = startX;
            doc.strokeColor('#CCCCCC');
            doc.moveTo(x, y).lineTo(x + columnWidths.reduce((a, b) => a + b, 0), y).stroke();
            columnWidths.forEach((width, i) => {
                doc.moveTo(x, y).lineTo(x, y + rowHeight).stroke();
                x += width;
                if (i === columnWidths.length - 1) {
                    doc.moveTo(x, y).lineTo(x, y + rowHeight).stroke();
                }
            });
            doc.moveTo(startX, y + rowHeight).lineTo(x, y + rowHeight).stroke();
        };

        const drawTableHeaders = () => {
            doc.font('Helvetica-Bold').fontSize(9)
                .rect(startX, rowY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
                .fill('#c8f2a9');

            const headers = [
                'Session ID', 'Location', 'Charger ID', 'Connector ID',
                'Start Time', 'Stop Time', 'Units (kWh)', 'Unit Price', 'Total Price'
            ];

            let x = startX;
            headers.forEach((text, i) => {
                doc.fillColor('#000000').text(text, x + 2, rowY + 5, { width: columnWidths[i], align: 'center' });
                x += columnWidths[i];
            });

            drawBorders(rowY);
            rowY += rowHeight;
        };

        drawTableHeaders();

        sessions.forEach((session, index) => {
            if (rowY + rowHeight + pageBottomMargin >= doc.page.height) {
                drawBorders(rowY - rowHeight);
                doc.addPage();
                rowY = 30;
                drawTableHeaders();
            }

            doc.font('Helvetica').fontSize(8).fillColor('#000000');
            const rowData = [
                session.session_id || 'N/A',
                session.location || 'N/A',
                session.charger_id || 'N/A',
                session.connector_id || 'N/A',
                session.start_time ? new Date(session.start_time).toLocaleString() : 'N/A',
                session.stop_time ? new Date(session.stop_time).toLocaleString() : 'N/A',
                session.unit_consummed ? `${session.unit_consummed} kWh` : 'N/A',
                session.unit_price && !isNaN(session.unit_price) ? `Rs. ${Number(session.unit_price).toFixed(2)}` : 'Rs. 0.00',
                session.price && !isNaN(session.price) ? `Rs. ${Number(session.price).toFixed(2)}` : 'Rs. 0.00'
            ];

            totalUnits += session.unit_consummed || 0;
            totalPrice += session.price || 0;

            let x = startX;
            rowData.forEach((text, i) => {
                doc.text(text, x + 2, rowY + 5, { width: columnWidths[i], align: 'center' });
                x += columnWidths[i];
            });

            drawBorders(rowY);
            rowY += rowHeight;
        });

        logger.loggerSuccess(`PDF generated successfully for ${email_id}, sending response...`);
        doc.end();
    } catch (error) {
        logger.loggerError('Error generating charging session PDF:', error);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

module.exports = {
    // TOTAL CHARGING SESSION 
    fetchTotalChargingSessionDetails,
    // CHARGING HISTORY 
    saveChargingSessionHistoryFilter,
    fetchChargingSessionHistoryFilter,
    fetchChargingSessionDetails,
    // DOWNLOAD CHARGING HISTORYx
    DownloadChargingSessionDetails
};