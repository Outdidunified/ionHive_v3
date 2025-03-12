const express = require('express');
const router = express.Router();
const Controller = require("../controllers/sessionController");
const authUser = require("../middlewares/authenticated");

// TOTAL CHARGING SESSION //TODO - 1
// Total Charging session details

// CHARGING HISTORY //TODO - 2
// Fetch all charging session details

// DOWNLOAD CHARGING HISTORY //TODO - 3
// download all user charging session details

// Export the router
module.exports = router;
