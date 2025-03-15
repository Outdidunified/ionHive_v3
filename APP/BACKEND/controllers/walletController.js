const db_conn = require('../config/db');
const emailer = require('../middlewares/emailer');
const logger = require('../utils/logger');
const Razorpay = require("razorpay");
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// MANAGE ALL
// fetch wallet balance
const FetchWalletBalance = async (req, res) => {
    try {
        const { user_id, email_id } = req.body;

        // Validate input
        if (!user_id || !Number.isInteger(user_id) || !email_id || typeof email_id !== 'string' || email_id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Invalid input: user_id must be a valid integer and email_id must be a non-empty string.",
            });
        }

        // Connect to database
        const db = await db_conn.connectToDatabase();
        const usersCollection = db.collection("users");

        // Find user by user_id and email_id
        const user = await usersCollection.findOne({ user_id, email_id });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        logger.info(`Wallet balance fetched successfully for user_id=${user_id}, email_id=${email_id}`);

        return res.status(200).json({
            success: true,
            message: "Wallet balance retrieved successfully.",
            data: { wallet_balance: user.wallet_bal || 0 },
        });

    } catch (error) {
        logger.error(`Error fetching wallet balance for user_id=${req.body?.user_id}, email_id=${req.body?.email_id}: ${error.message}`, { error });
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


// MANAGE RAZORPAY PAYMENT 
// create razorpay payment
const createOrder = async (req, res) => {
    try {
        const { user_id, email_id, amount, currency } = req.body;

        // Single validation check
        if (
            (!user_id && !email_id) || // At least one identifier is required
            (email_id && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_id)) || // Email format validation
            (user_id && (!Number.isInteger(user_id) || user_id <= 0)) || // User ID must be a positive integer
            (!amount || isNaN(amount) || amount <= 0) || // Amount validation
            (!currency || typeof currency !== "string" || currency.trim().length !== 3) // Currency validation
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid input. Ensure a valid user_id or email_id, a positive amount, and a correct 3-letter currency code.",
            });
        }

        const db = await db_conn.connectToDatabase();
        const usersCollection = db.collection("users");

        // Find user by user_id or email_id
        const user = await usersCollection.findOne({
            $or: [{ user_id }, { email_id }],
            status: true,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Your account has been deactivated. Please contact admin.",
            });
        }

        const options = {
            amount: Math.round(amount * 100),
            currency: currency.toUpperCase(),
        };

        const response = await razorpay.orders.create(options);
        logger.info(`Order created successfully for user_id=${user?.user_id}, email=${user?.email_id}`);

        res.status(200).json({ success: true, order: response });
    } catch (error) {
        logger.error(`Error creating order: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
// save razorpay payment
const savePaymentDetails = async (req, res) => {
    try {
        const { user_id, email_id, RechargeAmt, transactionId, responseCode, date_time, paymentMethod } = req.body;

        // Validation check
        if (
            (!user_id && !email_id) ||
            (user_id && (!Number.isInteger(user_id) || user_id <= 0)) ||
            (!RechargeAmt || isNaN(Number(RechargeAmt)) || RechargeAmt <= 0) ||
            !transactionId ||
            !responseCode ||
            !date_time || isNaN(Date.parse(date_time)) ||
            !paymentMethod || typeof paymentMethod !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid input. Ensure a valid user_id or email_id, a positive amount, a transaction ID, response code, valid date, and a payment method.",
            });
        }

        const db = await db_conn.connectToDatabase();
        const paymentCollection = db.collection("paymentDetails");
        const usersCollection = db.collection("users");

        // Find user by user_id or email
        const user = await usersCollection.findOne({
            $or: [{ user_id }, { email_id }],
            status: true,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Your account has been deactivated. Please contact admin.",
            });
        }

        // Fetch the last payment_id
        const lastPayment = await paymentCollection.find().sort({ payment_id: -1 }).limit(1).toArray();
        let newPaymentId = lastPayment.length > 0 ? lastPayment[0].payment_id + 1 : 1;

        // Insert payment details
        const paymentResult = await paymentCollection.insertOne({
            payment_id: newPaymentId,
            user_id: user.user_id,
            username: user.username,
            phone_number: user.phone_no,
            email_id: user.email_id,
            recharge_amount: parseFloat(RechargeAmt),
            transaction_id: transactionId,
            response: responseCode,
            recharged_date: new Date(date_time),
            recharged_by: user.email_id,
            payment_method: paymentMethod,
        });

        if (!paymentResult.insertedId) {
            throw new Error("Failed to save payment details");
        }

        // Update wallet balance
        const updateResult = await usersCollection.updateOne(
            { user_id: user.user_id },
            { $inc: { wallet_bal: parseFloat(RechargeAmt) } }
        );

        if (updateResult.modifiedCount !== 1) {
            throw new Error("Failed to update user wallet");
        }

        // **Send email only after DB operations are successful**
        try {
            await emailer.sendPaymentEmail(user.email_id, RechargeAmt, transactionId, date_time, paymentMethod);
            logger.info(`Wallet updated and email sent successfully for user_id=${user.user_id}, email=${user.email_id}`);
            return res.status(200).json({ success: true, message: "Payment saved successfully. Email sent." });
        } catch (emailError) {
            logger.error(`Payment saved, but email failed: ${emailError.message}`);
            return res.status(200).json({ success: true, message: "Payment saved, but email failed." });
        }

    } catch (error) {
        logger.error(`Error saving payment details: ${error.message}`);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// TRANSACTION HOSTORY 
// 
const saveTransactionFilter = async (req, res) => {
    const { user_id, email_id, days, status } = req.body;

    try {
        // Validate input
        if (!user_id || !email_id || !days || !status ||
            !Number.isInteger(Number(user_id)) || typeof email_id !== 'string' ||
            !Number.isInteger(Number(days)) || typeof status !== 'string' ||
            !['credited', 'debited', 'faulted', 'all'].includes(status.toLowerCase())) {
            return res.status(400).json({
                error: true,
                message: 'Invalid input: user_id and days must be integers, email_id must be a string, and status must be one of ["credited", "debited", "faulted", "all"].',
            });
        }

        const db = await db_conn.connectToDatabase();
        const usersCollection = db.collection('users');

        // Find the user
        const user = await usersCollection.findOne({ user_id, email_id });

        if (!user) {
            return res.status(404).json({
                error: true,
                message: 'User not found.',
            });
        }

        // Replace the old transaction filter with the new one
        const updatedTransactionFilter = [{ days, status }];

        // Update the user's transactionFilter array
        const updateResult = await usersCollection.updateOne(
            { user_id, email_id },
            { $set: { transactionFilter: updatedTransactionFilter } }
        );

        if (updateResult.modifiedCount === 0) {
            logger.warn(`Failed to update transaction filter for user ${user_id} with email ${email_id}.`);
            return res.status(500).json({
                error: true,
                message: 'Failed to update transaction filter.',
            });
        }

        logger.info(`Transaction filter updated successfully for user ${user_id} with email ${email_id}.`);
        return res.status(200).json({
            error: false,
            message: 'Transaction filter updated successfully',
            updatedTransactionFilter,
        });

    } catch (error) {
        logger.error(`Error in updateTransactionFilter - ${error.message}`);
        return res.status(500).json({
            error: true,
            message: 'Internal Server Error',
        });
    }
};

// 
const fetchTransactionFilter = async (req, res) => {
    const { user_id, email_id } = req.body;

    try {

        // Validate input
        if (!user_id || !email_id || !Number.isInteger(Number(user_id)) || typeof email_id !== 'string') {
            return res.status(400).json({ success: false, message: 'Valid user_id and email_id are required!' });
        }

        const db = await db_conn.connectToDatabase();
        const usersCollection = db.collection('users');

        // Find user
        const user = await usersCollection.findOne(
            { user_id: Number(user_id), email_id },
            { projection: { transactionFilter: 1, _id: 0 } }
        );

        if (!user || !user.transactionFilter) {
            return res.status(200).json({ success: true, message: 'No transaction filter found.', filter: {} });
        }

        return res.status(200).json({ success: true, message: 'Transaction filter retrieved successfully.', filter: user.transactionFilter });

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};
//
const getTransactionDetails = async (req, res) => {
    const { user_id, email_id, days, status } = req.body;

    try {

        // Validate Input
        if (!user_id || !email_id || !Number.isInteger(Number(user_id)) || typeof email_id !== 'string') {
            return res.status(400).json({ success: false, message: 'Valid user_id and email_id are required!' });
        }

        const db = await db_conn.connectToDatabase();
        const usersCollection = db.collection('users');
        const CharSessionCollection = db.collection('device_session_details');
        const walletTransCollection = db.collection('paymentDetails');

        // Verify User
        const user = await usersCollection.findOne({ user_id: user_id, email_id });
        if (!user) {
            logger.warn(`User ${user_id} with email ${email_id} not found.`);
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        let dateFilter = {};
        if (days) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            dateFilter = { time: { $gte: cutoffDate.toISOString() } };
        }

        // Fetch Transactions
        const chargingSessions = await CharSessionCollection.find({ email_id: email_id }).toArray();
        const paymentDetails = await walletTransCollection.find({ email_id: email_id }).toArray();

        // Process Transactions
        const deductedTransactions = chargingSessions
            .filter(session => session.StopTimestamp !== null)
            .map(session => ({
                status: 'Deducted',
                amount: session.price,
                time: session.stop_time
            }))
            .filter(txn => !days || new Date(txn.time) >= new Date(dateFilter.time.$gte));

        const creditedTransactions = paymentDetails
            .map(payment => ({
                status: 'Credited',
                amount: payment.recharge_amount,
                time: payment.recharged_date
            }))
            .filter(txn => !days || new Date(txn.time) >= new Date(dateFilter.time.$gte));
        // Apply Status Filter
        let filteredTransactions = [...creditedTransactions, ...deductedTransactions];

        if (status) {
            filteredTransactions = filteredTransactions.filter(txn => txn.status === status);
        }

        // Sort by Date (Descending)
        filteredTransactions.sort((a, b) => new Date(b.time) - new Date(a.time));

        logger.info(`Returning ${filteredTransactions.length} transactions for user ${user_id} with email ${email_id}`);
        return res.status(200).json({ success: true, data: filteredTransactions });

    } catch (error) {
        logger.error(`Error in getTransactionDetails for user ${user_id} with email: ${email_id} - ${error.message}`);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


module.exports = {
    // WALLET BALANCE
    FetchWalletBalance,
    // MANAGE RAZORPAY PAYMENT 
    createOrder,
    savePaymentDetails,
    // TRANSACTION HOSTORY 
    saveTransactionFilter,
    fetchTransactionFilter,
    getTransactionDetails
};