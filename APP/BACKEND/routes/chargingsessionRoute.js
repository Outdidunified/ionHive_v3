const express = require('express');
const router = express.Router();
const Controller = require("../controllers/chargingsessionController");
const authUser = require("../middlewares/authenticated");


// MANAGE LAST STATUS 
router.post('/fetchLastStatus', authUser.isAuthenticated, Controller.fetchLastStatus);


// MANAGE START STOP  //TODO - 2


// MANAGE AUTO STOP SETTINGS  //TODO - 3


// MANAGE STARTTIME //TODO - 1


// MANAGE CHARGING SESSION PRICE REPORT  //TODO - 2


// MANAGE END CHARGING  //TODO - 3


// Export the router
module.exports = router;
