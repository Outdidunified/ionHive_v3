const express = require('express');
const router = express.Router();
const Controller = require("../controllers/profileController");
const authUser = require("../middlewares/authenticated");



// USER DETAILS
// CompleteProfile
router.post('/CompleteProfile', authUser.isAuthenticated, Controller.CompleteProfile);

// MANAGE ALL 
// RFID
// Route to fetch RFID
router.post('/fetchRFID', authUser.isAuthenticated, Controller.fetchRFID);
// Route to Deactiva RFID
router.post('/DeactivateRFID', authUser.isAuthenticated, Controller.DeactivateRFID);
// Order new RFID Card  //TODO - V3.1
// Linking an existing RFID Card  //TODO - V3.1
// DEVICES
// Route to Fetch Saved Devices
router.post('/fetchSavedDevices', authUser.isAuthenticated, Controller.fetchSavedDevices);
// Route to save Devices
router.post('/SaveDevices', authUser.isAuthenticated, Controller.SaveDevices);
// VEHICLE
//  - Fetch the vehicle of the paticular user
//  - available car model details with images
//  - add vehchle {model car , Vechle number }
// Route to fetch the vehicle details
// router.post('/fetchVehicleDetails', authUser.isAuthenticated, Controller.fetchVehicleDetails);
// Route to Fetch Saved Vehicles
// router.post('/fetchSavedVehicles', authUser.isAuthenticated, Controller.fetchSavedVehicles);
// Route to save Vehicles
// router.post('/SaveVehicles', authUser.isAuthenticated, Controller.SaveVehicles);



// MANAGE CHARGING STATIONS
// SAVED CHARGING STATIONS
// Route to Fetch Saved Stations
router.post('/fetchSavedStations', authUser.isAuthenticated, Controller.fetchSavedStations);
// Route to save Stations
router.post('/SaveStations', authUser.isAuthenticated, Controller.SaveStations);
// CAPITATIVE CHARGING STATIONS  //TODO - V3.1

// PAYMENT HOSTORY

// VECHICLE







// ACCOUNT
// deleteAccount
router.post('/deleteAccount', authUser.isAuthenticated, Controller.deleteAccount);




// Export the router
module.exports = router;
