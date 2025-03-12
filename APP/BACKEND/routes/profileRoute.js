const express = require('express');
const router = express.Router();
const Controller = require("../controllers/profileController");
const authUser = require("../middlewares/authenticated");

// USER DETAILS
// CompleteProfile
router.post('/CompleteProfile', authUser.isAuthenticated, Controller.CompleteProfile);

// MANAGE ALL //TODO - 1
// RFID

// PAYMENT HOSTORY

// VECHICLE



// STATIONS //TODO - 1
// STATION



// ACCOUNT
// deleteAccount
router.post('/deleteAccount', authUser.isAuthenticated, Controller.deleteAccount);


// Export the router
module.exports = router;
