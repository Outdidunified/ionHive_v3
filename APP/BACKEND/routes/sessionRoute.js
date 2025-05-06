const express = require('express');
const router = express.Router();
const Controller = require("../controllers/sessionController");
const authUser = require("../middlewares/authenticated");
const Invoice = require('../middlewares/invoice/createInvoice');

// TOTAL CHARGING SESSION
// Total Charging session details
router.post("/fetchTotalChargingSessionDetails", authUser.isAuthenticated, Controller.fetchTotalChargingSessionDetails); // Route to  fetch total session details

// CHARGING HISTORY 
router.post("/fetchChargingSessionHistoryFilter", authUser.isAuthenticated, Controller.fetchChargingSessionHistoryFilter); // Route to fetchChargingSessionHistoryFilter
router.post("/saveChargingSessionHistoryFilter", authUser.isAuthenticated, Controller.saveChargingSessionHistoryFilter); // Route to saveChargingSessionHistoryFilter
// Fetch all charging session details
router.post("/fetchChargingSessionDetails", authUser.isAuthenticated, Controller.fetchChargingSessionDetails); // Route to fetch charging session details

// DOWNLOAD CHARGING HISTORY 
// download all user charging session details
router.post("/DownloadChargingSessionDetails", authUser.isAuthenticated, Controller.DownloadChargingSessionDetails); // Route to download session details

// DOWNLOAD invoice of a particular session 
router.post("/downloadInvoice", authUser.isAuthenticated, Invoice.createInvoice); // Route to download invoice

// Export the router
module.exports = router;
