const express = require('express');
const router = express.Router();
const Controller = require("../controllers/walletController");
const authUser = require("../middlewares/authenticated");

// MANAGE ALL 
// WALLET BALANCE
router.post("/fetchWalletBalance", authUser.isAuthenticated, Controller.FetchWalletBalance); // Route to fetch wallet balance of the user


// MANAGE RAZORPAY PAYMENT 
router.post("/createOrder", authUser.isAuthenticated, Controller.createOrder); // Route to createOrder
router.post("/savePayments", authUser.isAuthenticated, Controller.savePaymentDetails); // Route to savePaymentDetails

// TRANSACTION HOSTORY //TODO - filter options
router.post("/FetchTransactionDetails", authUser.isAuthenticated, Controller.getTransactionDetails); // Route to FetchTransactionDetails




// Export the router
module.exports = router;
