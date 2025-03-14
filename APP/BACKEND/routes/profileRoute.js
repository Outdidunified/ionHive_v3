const express = require('express');
const router = express.Router();
const Controller = require("../controllers/profileController");
const WalletController = require("../controllers/walletController");
const SessionController = require("../controllers/sessionController");
const authUser = require("../middlewares/authenticated");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
});


// USER DETAILS
router.post("/fetchuserprofile", authUser.isAuthenticated, Controller.fetchuserprofile); // Route to fetch user profile
router.post('/CompleteProfile', authUser.isAuthenticated, Controller.CompleteProfile); // Route to CompleteProfile

// WALLET BALANCE
router.post("/FetchWalletBalance", authUser.isAuthenticated, WalletController.FetchWalletBalance);

// PAYMENT HISTORY // TODO: filter route from wallet Controller
router.post("/FetchTransactionDetails", authUser.isAuthenticated, WalletController.getTransactionDetails);
// days , status
// TOTAL SESSIONS
router.post("/fetchTotalChargingSessionDetails", authUser.isAuthenticated, SessionController.fetchTotalChargingSessionDetails);


// MANAGE ALL 
// RFID
router.post('/fetchRFID', authUser.isAuthenticated, Controller.fetchRFID); // Route to fetch RFID
router.post('/DeactivateRFID', authUser.isAuthenticated, Controller.DeactivateRFID); // Route to Deactiva RFID
// Order new RFID Card  //TODO - V3.1
// Linking an existing RFID Card  //TODO - V3.1
// DEVICES
router.post('/fetchSavedDevices', authUser.isAuthenticated, Controller.fetchSavedDevices); // Route to Fetch Saved Devices
router.post('/SaveDevices', authUser.isAuthenticated, Controller.SaveDevices); // Route to save Devices
// VEHICLE
//  - vehicle model details with images
router.post("/addvehicleModel", authUser.isAuthenticated, upload.single("vehicle_image"), Controller.savevehicleModel); // Adding vehicle model and details
router.get("/getAllvehicleModels", authUser.isAuthenticated, Controller.getAllvehicleModels); // fetching all vehicle models and details
//  - Vehicle of the paticular user
router.post('/SaveVehiclesOfUser', authUser.isAuthenticated, Controller.SaveVehiclesOfUser); // add vehchle { model vehicle , Vechle number }
router.post('/fetchSavedVehiclesOfUser', authUser.isAuthenticated, Controller.fetchSavedVehiclesOfUser); // Fetch the vehicle of the paticular user


// MANAGE CHARGING STATIONS  //TODO  -  implement this after map module
// SAVED CHARGING STATIONS
router.post('/fetchSavedStations', authUser.isAuthenticated, Controller.fetchSavedStations); // Route to Fetch Saved Stations
router.post('/SaveStations', authUser.isAuthenticated, Controller.SaveStations); // Route to save Stations
// CAPITATIVE CHARGING STATIONS  //TODO - V3.1


// CHARGING HISTORY
// Route to fetch payment history

// ACCOUNT
// deleteAccount
router.post('/deleteAccount', authUser.isAuthenticated, Controller.deleteAccount);




// Export the router
module.exports = router;
