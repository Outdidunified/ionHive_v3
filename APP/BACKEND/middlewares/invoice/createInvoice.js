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

// Initialize the DB connection once
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
            doc.image(logoPath, 50, 55, { width: 50 });
        } else {
            console.warn(`Logo file not found at path: ${logoPath}. Using text instead.`);
            doc.rect(50, 55, 50, 50).stroke();
            doc.fontSize(10).text('LOGO', 60, 75);
        }

        doc.fillColor('#444444')
            .fontSize(20)
            .text('ionHive', 110, 59)
            .text('EV Charging.', 110, 85)
            .fontSize(10)
            .text(' 57, 7th Main Rd, Mahadeshwara Nagar,', 200, 65, { align: 'right' })
            .text(' BTM 2nd Stage, BTM Layout,', 200, 80, { align: 'right' })
            .text(' Bengaluru, Karnataka 560076', 200, 95, { align: 'right' })
            .moveDown();
    } catch (err) {
        console.error('Error in header generation:', err);
        // Continue without the logo
        doc.fillColor('#444444')
            .fontSize(20)
            .text('ionHive', 50, 59)
            .text('EV Charging.', 50, 85)
            .fontSize(10)
            .text(' 57, 7th Main Rd, Mahadeshwara Nagar,', 200, 65, { align: 'right' })
            .text(' BTM 2nd Stage, BTM Layout,', 200, 80, { align: 'right' })
            .text(' Bengaluru, Karnataka 560076', 200, 95, { align: 'right' })
            .moveDown();
    }
}

function generateFooter(doc) {
    doc.fontSize(10)
        .text('Thank you for charging with us. For support, contact support@outdidtech.com', 50, 730, {
            align: 'center',
            width: 500,
        })
        .text('This is a digital receipt for EV charging services.', 50, 750, {
            align: 'center',
            width: 500,
        })
        .text('Powered by Outdid Unified Pvt Ltd.', 50, 780, {
            align: 'center',
            width: 500,
        });
}

function generateCustomerInformation(doc, invoice) {
    const top = 200;
    const shipping = invoice.shipping || {};

    doc.fillColor('#444444').fontSize(20).text('Invoice', 50, 160);

    generateHr(doc, 185);

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
        .text(`Name: ${shipping.name || 'N/A'}`, 300, top)
        .font('Helvetica')
        .text(`Phone: ${shipping.phone_number || 'N/A'}`, 300, top + 15)
        .text(`Email: ${invoice.email_id || 'N/A'}`, 300, top + 30)
        // .text(shipping.address || '', 300, top + 45)
        // .text(
        //     `${shipping.city || ''}, ${shipping.state || ''}, ${shipping.country || ''}`,
        //     300,
        //     top + 60
        // )
        // .text(shipping.postal_code || '', 300, top + 75)
        .moveDown();

    generateHr(doc, 300);
}

function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
    doc.fontSize(10)
        .text(c1, 50, y, { width: 90, align: 'left' })
        .text(c2, 150, y, { width: 90, align: 'center' })
        .text(c3, 260, y, { width: 90, align: 'center' })
        .text(c4, 370, y, { width: 90, align: 'center' })
        .text(c5, 0, y, { align: 'right' });
}

function generateInvoiceTable(doc, invoice) {
    const invoiceTableTop = 360; // Adjusted for the additional customer information

    doc.font('Helvetica-Bold');
    generateTableRow(doc, invoiceTableTop, 'Description', 'Session ID', 'Charger ID', 'Unit Consumed', 'Amount');
    generateHr(doc, invoiceTableTop + 20);
    doc.font('Helvetica');

    let y = invoiceTableTop + 30;

    // Charging Entry
    generateTableRow(
        doc,
        y,
        'FOR CHARGING',
        invoice.sessionId || 'N/A',
        invoice.chargerId || 'N/A',
        invoice.units || '0',
        formatCurrency(invoice.chargingAmount || 0)
    );

    y += 30;

    // GST Entry (3%)
    generateTableRow(
        doc,
        y,
        'GST (3%)',
        '',
        '',
        '',
        formatCurrency(invoice.gst || 0)
    );

    y += 30;

    // Discount Entry (if present)
    generateTableRow(
        doc,
        y,
        'DISCOUNT',
        '',
        '',
        '',
        formatCurrency(invoice.discount || 0)
    );
    y += 30;


    // Total Invoice Value
    generateHr(doc, y - 10);
    doc.font('Helvetica-Bold')
        .text('Total Invoice Value', 400, y, { width: 90, align: 'right' })
        .text(formatCurrency(invoice.subtotal || 0), 0, y, { align: 'right' });
    doc.font('Helvetica');
}

async function createInvoice(req, res) {
    try {
        const { session_id, email_id } = req.body;

        // Validate session_id as integer
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

        // Validate email_id
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

        // Query using integer session_id
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

        // Calculate GST (3% of charging amount)
        const chargingAmount = session.price || 0;
        const gst = Math.round(chargingAmount * 0.03);
        const discount = 0; // Can be dynamic if needed
        const subtotal = chargingAmount + gst - discount;

        // Get user details from users collection
        const userCollection = db.collection('users');
        const user = await userCollection.findOne({ email_id: email_id });

        if (!user) {
            logger.loggerInfo(`User not found for email_id: ${email_id}, continuing with limited user info`);
        } else {
            logger.loggerInfo(`User found: ${user.username}, ID: ${user.user_id}`);
        }

        // Create invoice data object with user details
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
            chargingAmount: chargingAmount * 100, // Convert to cents for formatting
            gst: gst * 100, // Convert to cents for formatting
            discount: discount * 100, // Convert to cents for formatting
            subtotal: subtotal * 100, // Convert to cents for formatting
            paid: 0,
            invoice_nr: `INV-${session_id}-${Date.now().toString().slice(-6)}`,
        };

        const doc = new PDFDocument({
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            size: 'A4',
            layout: 'portrait',
        });

        // Catch internal PDF errors
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
