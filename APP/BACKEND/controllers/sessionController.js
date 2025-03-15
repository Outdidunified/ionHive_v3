const db_conn = require('../config/db');
const logger = require('../utils/logger');
const PDFDocument = require('pdfkit');

// TOTAL CHARGING SESSION 
// Total Charging session details
const fetchTotalChargingSessionDetails = async (req, res) => {
    try {
        const { email_id } = req.body;

        // Validate input
        if (!email_id || typeof email_id !== 'string' || email_id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Invalid input: email_id must be a non-empty string.',
            });
        }

        // Connect to database
        const db = await database.connectToDatabase();
        const collection = db.collection('device_session_details');

        // Fetch sessions where stop_time is not null
        const result = await collection.find({ user: email_id, stop_time: { $ne: null } })
            .sort({ stop_time: -1 })
            .toArray();

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No charging session records found!',
            });
        }

        // Calculate total charging time and count sessions
        let totalChargingTime = 0;
        result.forEach(session => {
            const startTime = new Date(session.start_time);
            const stopTime = new Date(session.stop_time);
            const sessionDuration = (stopTime - startTime) / 1000; // Duration in seconds
            totalChargingTime += sessionDuration;
        });

        const totalChargingTimeInHours = (totalChargingTime / 3600).toFixed(2); // Convert to hours
        const totalSessions = result.length;

        return res.status(200).json({
            success: true,
            message: 'Total charging session data retrieved successfully.',
            totalChargingTimeInHours,
            totalSessions,
        });

    } catch (error) {
        logger.error(`Error fetching total session data for email_id=${req.body?.email_id}: ${error.message}`, { error });
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};


// CHARGING HISTORY 
// Fetch all charging session details
const fetchChargingSessionDetails = async (req, res) => {
    try {
        const { email_id } = req.body;

        // Validate input
        if (!email_id || typeof email_id !== 'string' || email_id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Invalid input: email_id must be a non-empty string.',
            });
        }

        // Connect to database
        const db = await db_conn.connectToDatabase();
        const collection = db.collection('device_session_details');

        // Fetch sessions in descending order by stop_time (completed sessions)
        const result = await collection.find({ user: email_id, stop_time: { $ne: null } })
            .sort({ stop_time: -1 })
            .toArray();

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No charging session records found!',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Charging session details retrieved successfully.',
            data: result,
        });

    } catch (error) {
        logger.error(`Error fetching charging session details for email_id=${req.body?.email_id}: ${error.message}`, { error });
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
    try {

        const { email_id, total_unit_consumed } = req.query;
        // Validate input
        if (!email_id || typeof email_id !== 'string' || email_id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Invalid input: email_id must be a non-empty string.',
            });
        }

        const db = await db_conn.connectToDatabase();
        const Collection = db.collection('device_session_details');

        const sessions = await Collection.find({ user: email_id, stop_time: { $ne: null } })
            .sort({ stop_time: -1 })
            .toArray();

        if (!sessions || sessions.length === 0) {
            logger.info(` No charging session records found for email_id: ${email_id}`);
            return res.status(404).json({ message: 'No charging session records found!' });
        }

        logger.info(`Found ${sessions.length} session(s), generating PDF...`);
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

        logger.info(`PDF generated successfully for ${email_id}, sending response...`);
        doc.end();
    } catch (error) {
        logger.error('Error generating charging session PDF:', error);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

module.exports = {
    // TOTAL CHARGING SESSION 
    fetchTotalChargingSessionDetails,
    // CHARGING HISTORY 
    fetchChargingSessionDetails,
    // DOWNLOAD CHARGING HISTORY
    DownloadChargingSessionDetails

};