const express = require('express');
const router = express.Router();
const Controller = require("../controllers/chargingsessioncontroller");
const authUser = require("../middlewares/authenticated");


// MANAGE LAST STATUS 
router.post('/fetchLastStatus', authUser.isAuthenticated, Controller.fetchLastStatus);


// MANAGE START STOP
router.post('/start', authUser.isAuthenticated, Controller.startCharger);
router.post('/stop', authUser.isAuthenticated, Controller.stopCharger);


// MANAGE AUTO STOP SETTINGS
router.post('/updateAutoStopSettings', authUser.isAuthenticated, Controller.updateAutoStopSettings);


// MANAGE STARTTIME 
router.post('/fetchStartedAt', authUser.isAuthenticated, Controller.fetchStartedAt);


// MANAGE CHARGING SESSION PRICE REPORT
router.post('/getUpdatedChargingDetails', authUser.isAuthenticated, Controller.getUpdatedChargingDetails);


// MANAGE END CHARGING  
router.post('/endChargingSession', authUser.isAuthenticated, Controller.endChargingSession);


// Export the router
module.exports = router;
