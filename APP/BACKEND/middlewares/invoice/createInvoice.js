const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');
const db_conn = require('../../config/db');
const logger = require('../../utils/logger');

let db;

const initializeDB = async () => {
    try {
        if (!db) {
            console.log('Initializing database connection for invoice generation...');
            db = await db_conn.connectToDatabase();
            console.log('Database connection established successfully');
        }
        return db;
    } catch (error) {
        console.error('Failed to initialize database connection:', error);
        throw error;
    }
};

initializeDB().catch(err => {
    console.error('Database initialization failed:', err);
});

function formatCurrency(cents) {
    return 'Rs.' + (cents / 100).toFixed(2);
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}/${month}/${day}`;
}

function generateHr(doc, y) {
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function generateHeader(doc) {
    try {
        const logoPath = path.resolve(__dirname, 'logo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 45, { width: 50 });
        } else {
            console.warn(`Logo file not found at path: ${logoPath}. Using text instead.`);
            doc.rect(50, 45, 50, 50).stroke();
            doc.fontSize(10).text('LOGO', 60, 65);
        }

        doc.fillColor('#444444')
            .fontSize(20)
            .text('ionHive', 110, 45)
            .fontSize(15)
            .text('EV Charging.', 110, 65)
            .fontSize(10)
            .text('57, 7th Main Rd, Mahadeshwara Nagar,', 350, 45, { align: 'right', width: 200 })
            .text('BTM 2nd Stage, BTM Layout,', 350, 60, { align: 'right', width: 200 })
            .text('Bengaluru, Karnataka 560076', 350, 75, { align: 'right', width: 200 })
            .moveDown();
    } catch (err) {
        console.error('Error in header generation:', err);
        doc.fillColor('#444444')
            .fontSize(20)
            .text('ionHive', 50, 45)
            .fontSize(15)
            .text('EV Charging.', 50, 65)
            .fontSize(10)
            .text('57, 7th Main Rd, Mahadeshwara Nagar,', 350, 45, { align: 'right', width: 200 })
            .text('BTM 2nd Stage, BTM Layout,', 350, 60, { align: 'right', width: 200 })
            .text('Bengaluru, Karnataka 560076', 350, 75, { align: 'right', width: 200 })
            .moveDown();
    }
}

function generateFooter(doc) {
    doc.fontSize(8)
        .text('Note: The total amount is the sum of all applicable fees including electricity charges, service fees, and taxes as per the charging session details.', 50, 700, {
            align: 'left',
            width: 500,
        })
        .moveDown();
}

function generateCustomerInformation(doc, invoice) {
    const top = 150;

    doc.fillColor('#444444').fontSize(16).text('Invoice', 50, 110);

    generateHr(doc, 130);

    doc.fontSize(10)
        .text('Invoice Number:', 50, top)
        .font('Helvetica-Bold')
        .text(invoice.invoice_nr || 'N/A', 150, top)
        .font('Helvetica')
        .text('Invoice Date:', 50, top + 15)
        .text(formatDate(new Date()), 150, top + 15)
        .text('Total Amount:', 50, top + 30)
        .text(formatCurrency((invoice.subtotal || 0) - (invoice.paid || 0)), 150, top + 30)
        .text('Available Balance:', 50, top + 45)
        .text(formatCurrency(invoice.wallet_balance * 100 || 0), 150, top + 45)
        .font('Helvetica-Bold')
        .text(`Name: ${invoice.shipping.name || 'N/A'}`, 350, top)
        .font('Helvetica')
        .text(`Phone: ${invoice.shipping.phone_number || 'N/A'}`, 350, top + 15)
        .text(`Email: ${invoice.email_id || 'N/A'}`, 350, top + 30)
        .moveDown();

    generateHr(doc, 230);
}

function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
    doc.fontSize(10)
        .text(c1, 50, y, { width: 150, align: 'left' })
        .text(c2, 200, y, { width: 100, align: 'center' })
        .text(c3, 300, y, { width: 100, align: 'center' })
        .text(c4, 400, y, { width: 90, align: 'center' })
        .text(c5, 480, y, { width: 70, align: 'right' });
}

function generateInvoiceTable(doc, invoice) {
    const invoiceTableTop = 280;

    doc.fontSize(10)
        .text('Session Start: ' + (new Date(invoice.startTime).toLocaleString() || 'N/A'), 50, invoiceTableTop - 30)
        .text('Session End: ' + (new Date(invoice.stopTime).toLocaleString() || 'N/A'), 350, invoiceTableTop - 30)
        .text('Stop Reason: ' + (invoice.stopReason || 'N/A'), 50, invoiceTableTop - 15);

    doc.font('Helvetica-Bold');
    generateTableRow(doc, invoiceTableTop, 'Description', 'Session ID', 'Charger ID', 'Unit Consumed', 'Amount');
    generateHr(doc, invoiceTableTop + 20);
    doc.font('Helvetica');

    let y = invoiceTableTop + 30;

    const firstFee = invoice.nonZeroFees.find(fee => fee.label === 'EB Fee') || invoice.nonZeroFees[0] || { label: 'CHARGING FEE', value: 0 };
    generateTableRow(
        doc,
        y,
        firstFee.label.toUpperCase(),
        invoice.sessionId || 'N/A',
        invoice.chargerId || 'N/A',
        invoice.units || '0',
        formatCurrency(firstFee.value || 0)
    );
    y += 20;

    for (let i = 0; i < invoice.nonZeroFees.length; i++) {
        if (i === 0 && invoice.nonZeroFees[0].label === firstFee.label) continue;

        const fee = invoice.nonZeroFees[i];
        generateTableRow(
            doc,
            y,
            fee.label.toUpperCase(),
            '',
            '',
            '',
            formatCurrency(fee.value || 0)
        );
        y += 20;
    }

    if (invoice.nonZeroFees.length === 0 || !invoice.nonZeroFees.some(fee => fee.label.includes('GST'))) {
        generateTableRow(
            doc,
            y,
            `GST (${invoice.gstPercentage || 18}%)`,
            '',
            '',
            '',
            formatCurrency(invoice.gst || 0)
        );
        y += 20;
    }

    if (invoice.discount > 0) {
        generateTableRow(
            doc,
            y,
            'DISCOUNT',
            '',
            '',
            '',
            formatCurrency(invoice.discount || 0)
        );
        y += 20;
    }

    generateHr(doc, y - 10);
    doc.font('Helvetica-Bold')
        .text('Total Amount', 400, y, { width: 90, align: 'right' })
        .text(formatCurrency(invoice.subtotal || 0), 480, y, { width: 70, align: 'right' });
}

async function createInvoice(req, res) {
    try {
        const { session_id, email_id } = req.body;

        if (
            session_id === undefined ||
            session_id === null ||
            typeof session_id !== 'number' ||
            !Number.isInteger(session_id)
        ) {
            return res.status(400).json({
                error: true,
                message: 'Invalid input: session_id must be a non-empty integer.',
            });
        }

        if (!email_id || typeof email_id !== 'string' || email_id.trim() === '') {
            return res.status(400).json({
                error: true,
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

        const session = await Collection.findOne({
            session_id: session_id,
            email_id: email_id,
            stop_time: { $ne: null },
        });

        if (!session) {
            logger.loggerWarn(`No session found for session_id: ${session_id} and email_id: ${email_id}`);
            return res.status(404).json({ message: 'No session found for the provided session ID and email ID!' });
        }

        logger.loggerDebug(`Generating invoice for session: ${session_id}, user: ${email_id}`);

        const chargingAmount = parseFloat(session.price) || 0;
        const gstPercentage = session.gst_percentage ? parseFloat(session.gst_percentage) : 18;
        let gstAmount = session.gst_amount ? parseFloat(session.gst_amount) : parseFloat((chargingAmount * gstPercentage / 100).toFixed(2));

        // Combine EB_fee and association_commission into EB Fee
        const ebFeeValue = (session.EB_fee ? parseFloat(session.EB_fee) : 0);
        const associationCommissionValue = (session.association_commission ? parseFloat(session.association_commission) : 0);
        const combinedEbFee = ebFeeValue + associationCommissionValue;

        const fees = [
            { label: 'EB Fee', value: combinedEbFee },
            { label: 'Convenience Fee', value: session.convenience_fee ? parseFloat(session.convenience_fee) : 0 },
            { label: `GST Amount (${gstPercentage}%)`, value: gstAmount },
            { label: 'Parking Fee', value: session.parking_fee ? parseFloat(session.parking_fee) : 0 },
            { label: 'Processing Fee', value: session.processing_fee ? parseFloat(session.processing_fee) : 0 },
            { label: 'Service Fee', value: session.service_fee ? parseFloat(session.service_fee) : 0 },
            { label: 'Station Fee', value: session.station_fee ? parseFloat(session.station_fee) : 0 },
            // Association Commission is now included in EB Fee, so it's removed from the list
        ];

        const nonZeroFees = fees.filter(fee => fee.value > 0);
        const discount = 0;
        const subtotal = chargingAmount;

        const sumOfFees = parseFloat(fees.reduce((sum, fee) => sum + fee.value, 0).toFixed(2));
        logger.loggerInfo(`Sum of all fees: ${sumOfFees}, Total price: ${chargingAmount}`);
        if (Math.abs(sumOfFees - chargingAmount) > 0.1) {
            logger.loggerWarn(`Warning: Sum of fees (${sumOfFees}) differs from total price (${chargingAmount}) by ${(sumOfFees - chargingAmount).toFixed(2)}`);
        }

        logger.loggerInfo(`Invoice calculation: Charging Amount: ${chargingAmount}, GST (${gstPercentage}%): ${gstAmount}, Subtotal: ${subtotal}`);

        const userCollection = db.collection('users');
        const user = await userCollection.findOne({ email_id: email_id });

        if (!user) {
            logger.loggerInfo(`User not found for email_id: ${email_id}, continuing with limited user info`);
        } else {
            logger.loggerInfo(`User found: ${user.username}, ID: ${user.user_id}`);
        }

        const invoice = {
            shipping: {
                name: user ? user.username : email_id.split('@')[0] || 'Customer',
                phone_number: user ? user.phone_no : 'N/A',
                address: session.location || 'N/A',
                city: 'Bengaluru',
                state: 'Karnataka',
                country: 'India',
                postal_code: '560076',
            },
            user_id: user ? user.user_id : 'N/A',
            email_id: email_id,
            wallet_balance: user ? user.wallet_bal : 'N/A',
            sessionId: session_id,
            chargerId: session.charger_id || 'N/A',
            units: session.unit_consummed || '0',
            chargingAmount: chargingAmount * 100,
            gst: gstAmount * 100,
            gstPercentage: gstPercentage,
            discount: discount * 100,
            subtotal: subtotal * 100,
            fees: fees.map(fee => ({
                label: fee.label,
                value: fee.value * 100
            })),
            nonZeroFees: nonZeroFees.map(fee => ({
                label: fee.label,
                value: fee.value * 100
            })),
            startTime: session.start_time,
            stopTime: session.stop_time,
            stopReason: session.stop_reason || 'N/A',
            paid: 0,
            invoice_nr: `INV-${session_id}-${Date.now().toString().slice(-6)}`,
        };

        const doc = new PDFDocument({
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            size: 'A4',
            layout: 'portrait',
        });

        doc.on('error', (err) => {
            logger.loggerError('[PDF STREAM ERROR]:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal PDF generation error.' });
            }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Invoice_${session_id}.pdf"`);

        doc.pipe(res);

        generateHeader(doc);
        generateCustomerInformation(doc, invoice);
        generateInvoiceTable(doc, invoice);
        generateFooter(doc);

        doc.end();
        logger.loggerSuccess(`Invoice generated successfully for session_id: ${session_id}, email_id: ${email_id}`);
    } catch (err) {
        logger.loggerError('[PDF ERROR]:', err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate invoice PDF.' });
        }
    }
}

module.exports = {
    createInvoice,
};