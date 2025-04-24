const express = require('express');
const router = express.Router();
const Controller = require("../controllers/chargingstationController");
const authUser = require("../middlewares/authenticated");

// MANAGE SAVE STATION
router.post('/fetchSavedStations', authUser.isAuthenticated, Controller.fetchSavedStations); // Route to Fetch Saved Stations
router.post('/SaveStations', authUser.isAuthenticated, Controller.SaveStations); // Route to save Stations
router.post('/RemoveStation', authUser.isAuthenticated, Controller.RemoveStation); // Route to remove a station from favorites

// MANAGE CHARGER IN STATION 
router.post('/fetchSpecificStationsChragerDetailsWithConnector', authUser.isAuthenticated, Controller.getSpecificStationsChargerDetailsWithConnector);// fetch the spefic stations charger details with connector

// MANAGE CHARGING SESSION FOR USER
router.post('/updateConnectorUser', authUser.isAuthenticated, Controller.updateConnectorUser); // Route to update connector user


// Export the router
module.exports = router;
