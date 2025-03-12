const express = require('express');
const router = express.Router();
const Controller = require("../controllers/mapController");
const authUser = require("../middlewares/authenticated");

// MANAGE GENERIC FILTER //TODO - 1
// Fetch Saved Filter


// MANAGE INBUILD FILTER //TODO - 2
// FILTER BY VECHILE
//
// FILTER BY ALL CHARGERS
//
// FILTER BY AVAILABLE CHARGERS
//


// MANAGE ACTIVE CHARGER'S OF SPECIFIC USER //TODO - 3
// FETCH ACTIVE CHARGING SESSION OF USER
//


// MANAGE ALL OPTION //TODO - 3
// SEARCH -- FOR FRONTEND REFERENCES 
// GENERIC FILTER  -- FOR FRONTEND REFERENCES 
// INBUILD FILTER -- FOR FRONTEND REFERENCES 
// ACTIVE CHARGER'S -- FOR FRONTEND REFERENCES 
// STATION'S TO SHOW FOR USER
//

// MANAGE STATION'S BASED ON CURRENT LOCATION OF THE USER  //TODO - 3

// Export the router
module.exports = router;
