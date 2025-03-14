const express = require('express');
const router = express.Router();
const Controller = require("../controllers/sessionController");
const authUser = require("../middlewares/authenticated");

// TOTAL CHARGING SESSION
// Total Charging session details
router.post("/fetchTotalChargingSessionDetails", authUser.isAuthenticated, Controller.fetchTotalChargingSessionDetails); // Route to  fetch total session details

// CHARGING HISTORY 
// Fetch all charging session details
router.post("/fetchChargingSessionDetails", authUser.isAuthenticated, Controller.fetchChargingSessionDetails); // Route to fetch charging session details
//TODO - what to add filter option 

// DOWNLOAD CHARGING HISTORY 
// download all user charging session details
router.post("/DownloadChargingSessionDetails", authUser.isAuthenticated, Controller.DownloadChargingSessionDetails); // Route to download session details

// Export the router
module.exports = router;
