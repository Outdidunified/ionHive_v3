const express = require('express');
const router = express.Router();
const Controller = require("../controllers/chargingstationController");
const authUser = require("../middlewares/authenticated");

// MANAGE SAVE STATION //TODO - 1
// Fetch Saved Filter
// save the fav station 


// MANAGE CHARGER IN STATION  //TODO - 2
router.post('/fetchSpecificStationsChragerDetailsWithConnector', authUser.isAuthenticated, Controller.getSpecificStationsChargerDetailsWithConnector);// fetch the spefic stations charger details with connector



// MANAGE CHARGING SESSION FOR USER  //TODO - 3
// initiatale the charging session for user 




// Export the router
module.exports = router;
