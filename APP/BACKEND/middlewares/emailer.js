const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require("fs");
const path = require("path");
const logger = require('../utils/logger');

// Create a transporter object
let transporter = nodemailer.createTransport({
    host: 'smtppro.zoho.in', // replace with your SMTP server
    port: 465, // 465 for SSL or 587 for TLS
    secure: true, // true for SSL, false for TLS
    auth: {
        user: 'anish@outdidtech.com', // your email
        pass: '5XuiNJvgeijM', // your email password
    },
});
// Function to send email
const sendEmail = async (to, subject, text) => {
    try {
        // Define email options
        let info = await transporter.sendMail({
            from: '"ionHive - EV Charging" <anish@outdidtech.com>', // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: `<p>${text}</p>`, // HTML body
        });

        logger.info('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        logger.error('Error sending email:', error);
        return false;
    }
}
const EmailConfig = async (email, mailHead, otp) => {
    try {
        let sendTo = email;
        let mail_subject;
        let mail_body;
        if (mailHead === 'OTP') {
            mail_subject = 'Ion Hive - OTP';
            mail_body = `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 20px;
                                background-color: #f4f4f4;
                            }
                            .container {
                                background-color: #ffffff;
                                border-radius: 8px;
                                padding: 20px;
                                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                            }
                            h2 {
                                color: #333;
                            }
                            p {
                                color: #555;
                                line-height: 1.6;
                            }
                            .otp {
                                font-weight: bold;
                                font-size: 1.2em;
                                color: #007BFF; /* Bootstrap primary color */
                                background-color: #e9f5ff; /* Light background for the OTP */
                                padding: 10px;
                                border-radius: 4px;
                                display: inline-block;
                            }
                            .footer {
                                margin-top: 20px;
                                font-size: 0.9em;
                                color: #888;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>Hello ${email},</h2>
                            <p>We received a request to log in or register with your account. Please use the following One-Time Password (OTP) to proceed with the process:</p>
                            <p>Your OTP is: <span class="otp">${otp}</span></p>
                            <p class="footer">Thank you,<br>EV POWER</p>
                        </div>
                    </body>
                </html>
            `;
        } else if (mailHead === 'deleteAccount') {
            mail_subject = 'Ion Hive - account deletion'
            mail_body = `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 20px;
                                background-color: #f4f4f4;
                            }
                            .container {
                                background-color: #ffffff;
                                border-radius: 8px;
                                padding: 20px;
                                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                            }
                            h2 {
                                color: #333;
                            }
                            p {
                                color: #555;
                                line-height: 1.6;
                            }
                            .otp {
                                font-weight: bold;
                                font-size: 1.2em;
                                color: #007BFF; /* Bootstrap primary color */
                                background-color: #e9f5ff; /* Light background for the OTP */
                                padding: 10px;
                                border-radius: 4px;
                                display: inline-block;
                            }
                            .footer {
                                margin-top: 20px;
                                font-size: 0.9em;
                                color: #888;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>Hello ${email},</h2>
                            <p>Your Ion Hive account is deleted successfully !</p>
                            <p class="footer">Thank you,<br>Ion Hive</p>
                        </div>
                    </body>
                </html>
            `;
        }

        const result = await sendEmail(sendTo, mail_subject, mail_body);
        return result;
    } catch (error) {
        logger.error('Error sending email:', error);
        return false;
    }
}
const sendPaymentEmail = async (email, amount, transactionId, date, paymentMethod) => {
    try {
        const doc = new PDFDocument({ margin: 50 });
        const pdfPath = path.join(__dirname, `receipt_${transactionId}.pdf`);
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);



        // Invoice Title (Centered)
        doc.moveDown(2);
        doc.fontSize(22).font("Helvetica-Bold").text("Payment Receipt", { align: "center" }).moveDown(1);

        // Company Details (Aligned Left)
        doc.fontSize(12).font("Helvetica").text("IonHive - EV Charging", 50, 130);
        doc.text("57, 7th Main Rd,", 50);
        doc.text("Mahadeshwara Nagar, BTM 2nd Stage,", 50);
        doc.text("BTM Layout, Bengaluru,", 50);
        doc.text("Karnataka, India - 560076", 50).moveDown(1);

        // Draw Divider Line
        doc.moveTo(50, 205).lineTo(550, 205).stroke();


        const startX = 50, startY = 220, col2X = 250, rowHeight = 25;
        doc.fontSize(12).font("Helvetica");

        const transactionDetails = [
            { label: "Transaction ID:", value: transactionId },
            { label: "Amount Paid:", value: `Rs.${amount}` },
            { label: "Payment Method:", value: paymentMethod },
            { label: "Transaction Date:", value: new Date(date).toLocaleString() }
        ];

        transactionDetails.forEach((item, index) => {
            const y = startY + index * rowHeight;
            doc.text(item.label, startX, y);
            doc.text(item.value, col2X, y);
        });


        // Footer Line & Support Information
        doc.moveTo(50, 700).lineTo(550, 700).stroke();
        doc.fontSize(10).font("Helvetica").text("For support, contact info@outdidunified.com", 50, 710);

        // Finalize PDF
        doc.end();
        await new Promise((resolve) => writeStream.on("finish", resolve));

        // Mail configuration
        const mailOptions = {
            from: '"IonHive - EV Charging" <anish@outdidtech.com>',
            to: email,
            subject: "Payment Confirmation - IonHive",
            html: `
                <h2>Payment Successful</h2>
                <p>Dear User,</p>
                <p>Your payment has been successfully processed.</p>
                <ul>
                    <li><b>Transaction ID:</b> ${transactionId}</li>
                    <li><b>Amount:</b> ₹${amount}</li>
                    <li><b>Payment Method:</b> ${paymentMethod}</li>
                    <li><b>Date:</b> ${new Date(date).toLocaleString()}</li>
                </ul>
                <p>Attached is your payment receipt.</p>
                <p>Thank you for using IonHive!</p>
            `,
            attachments: [
                {
                    filename: `receipt_${transactionId}.pdf`,
                    path: pdfPath,
                    contentType: "application/pdf",
                },
            ],
        };

        await transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully to ${email}`);

        fs.unlinkSync(pdfPath);
    } catch (error) {
        logger.error(`Error sending email: ${error.message}`);
    }
};

module.exports = { EmailConfig, sendPaymentEmail }