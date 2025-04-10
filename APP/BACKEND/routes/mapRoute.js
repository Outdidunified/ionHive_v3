const express = require('express');
const router = express.Router();
const Controller = require("../controllers/mapController");
const authUser = require("../middlewares/authenticated");

// MANAGE GENERIC FILTER  //TODO - 1
// Saved Filter
// My vehcile,  connector, charger type, Availability, chargers, access type, Aminities
router.post('/SaveSearchFilter', authUser.isAuthenticated, Controller.SaveSearchFilter);
// Fetch Saved Filter //TODO - on hold until doing Stations it cant be  done
router.post('/fetchSavedSearchFilter', authUser.isAuthenticated, Controller.fetchSavedSearchFilter);
// clear saved filter

// MANAGE ACTIVE CHARGER'S OF SPECIFIC USER  //TODO - 3
// FETCH ACTIVE CHARGING SESSION OF USER
// router.post('/fetchActiveChargersOfUser', authUser.isAuthenticated, Controller.fetchActiveChargersOfUser);


// MANAGE STATION'S BASED ON CURRENT LOCATION OF THE USER  //TODO - 3
router.post('/fetchNearbyStations', authUser.isAuthenticated, Controller.getNearbyStations);// fetch station

// Export the router
module.exports = router;
