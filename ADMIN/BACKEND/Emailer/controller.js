const nodemailer = require('nodemailer');

// Create a transporter object
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Gmail SMTP server
    port: 465, // 465 for SSL or 587 for TLS
    secure: true, // true for SSL
    auth: {
        user: "info@outdidunified.com", // Your Gmail email address
        pass: "yylh zjwo psvr slqb", // App Password (not your regular Gmail password)
    },
});

// Function to send email
async function sendEmail(to, subject, text) {
    try {
        // Define email options
        let info = await transporter.sendMail({
            from: '"EV POWER" <anish@outdidtech.com>', // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: `<p>${text}</p>`, // HTML body
        });

        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

// Reseller email sender
async function EmailConfigForResellerUser(email, password) {
    try {
        let sendTo = email;
        let mail_subject = 'Ion Hive - Reseller User Credentials';
        let mail_body = `
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
                            max-width: 500px;
                            margin: auto;
                        }
                        h2 {
                            color: #333;
                        }
                        p {
                            color: #555;
                            line-height: 1.6;
                        }
                        .credentials {
                            background-color: #e9f5ff;
                            padding: 10px;
                            border-radius: 4px;
                            font-size: 1.1em;
                            font-weight: bold;
                            color: #007BFF;
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
                        <h2>Welcome to Ion Hive!</h2>
                        <p>Dear ${email},</p>
                        <p>Your reseller account has been successfully created. Below are your login credentials:</p>
                        <p><strong>Email:</strong> <span class="credentials">${email}</span></p>
                        <p><strong>Password:</strong> <span class="credentials">${password}</span></p>
                        <p>Please log in to your account and update your password for security purposes.</p>
                        <p class="footer">Thank you,<br><strong>Ion Hive Team</strong></p>
                    </div>
                </body>
            </html>
        `;

        const result = await sendEmail(sendTo, mail_subject, mail_body);
        return result;

    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

// client email sender
async function EmailConfigForclientUser(email, password) {
    try {
        let sendTo = email;
        let mail_subject = 'Ion Hive - Client User Credentials';
        let mail_body = `
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
                            max-width: 500px;
                            margin: auto;
                        }
                        h2 {
                            color: #333;
                        }
                        p {
                            color: #555;
                            line-height: 1.6;
                        }
                        .credentials {
                            background-color: #e9f5ff;
                            padding: 10px;
                            border-radius: 4px;
                            font-size: 1.1em;
                            font-weight: bold;
                            color: #007BFF;
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
                        <h2>Welcome to Ion Hive!</h2>
                        <p>Dear ${email},</p>
                        <p>Your client account has been successfully created. Below are your login credentials:</p>
                        <p><strong>Email:</strong> <span class="credentials">${email}</span></p>
                        <p><strong>Password:</strong> <span class="credentials">${password}</span></p>
                        <p>Please log in to your account and update your password for security purposes.</p>
                        <p class="footer">Thank you,<br><strong>Ion Hive Team</strong></p>
                    </div>
                </body>
            </html>
        `;

        const result = await sendEmail(sendTo, mail_subject, mail_body);
        return result;

    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}


// association email sender
async function EmailConfigForassociationUser(email, password) {
    try {
        let sendTo = email;
        let mail_subject = 'Ion Hive - Association User Credentials';
        let mail_body = `
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
                            max-width: 500px;
                            margin: auto;
                        }
                        h2 {
                            color: #333;
                        }
                        p {
                            color: #555;
                            line-height: 1.6;
                        }
                        .credentials {
                            background-color: #e9f5ff;
                            padding: 10px;
                            border-radius: 4px;
                            font-size: 1.1em;
                            font-weight: bold;
                            color: #007BFF;
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
                        <h2>Welcome to Ion Hive!</h2>
                        <p>Dear ${email},</p>
                        <p>Your association account has been successfully created. Below are your login credentials:</p>
                        <p><strong>Email:</strong> <span class="credentials">${email}</span></p>
                        <p><strong>Password:</strong> <span class="credentials">${password}</span></p>
                        <p>Please log in to your account and update your password for security purposes.</p>
                        <p class="footer">Thank you,<br><strong>Ion Hive Team</strong></p>
                    </div>
                </body>
            </html>
        `;

        const result = await sendEmail(sendTo, mail_subject, mail_body);
        return result;

    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

module.exports = { EmailConfigForResellerUser, EmailConfigForclientUser, EmailConfigForassociationUser }