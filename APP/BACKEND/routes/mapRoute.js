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

// MANAGE INBUILD FILTER  //TODO - 2
// FILTER BY VECHILE
//
// FILTER BY ALL CHARGERS
//
// FILTER BY AVAILABLE CHARGERS
//


// MANAGE ACTIVE CHARGER'S OF SPECIFIC USER  //TODO - 3
// FETCH ACTIVE CHARGING SESSION OF USER
//


// MANAGE ALL OPTION  //TODO - 3
// SEARCH -- FOR FRONTEND REFERENCES 
// GENERIC FILTER  -- FOR FRONTEND REFERENCES 
// INBUILD FILTER -- FOR FRONTEND REFERENCES 
// ACTIVE CHARGER'S -- FOR FRONTEND REFERENCES 
// STATION'S TO SHOW FOR USER 
// 

// MANAGE STATION'S BASED ON CURRENT LOCATION OF THE USER  //TODO - 3
// save station, fetch station
// station_address, land mark, network, station availability, chargers in thatr spefuc station with its cnector id and staytus 
router.post('/fetchNearbyStations', authUser.isAuthenticated, Controller.getNearbyStations);

// Export the router
module.exports = router;
