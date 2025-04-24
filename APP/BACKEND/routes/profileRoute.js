const express = require('express');
const router = express.Router();
const Controller = require("../controllers/profileController");
const WalletController = require("../controllers/walletController");
const SessionController = require("../controllers/sessionController");
const StationController = require("../controllers/chargingstationController");
const authUser = require("../middlewares/authenticated");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "../public/uploads/vehicle_images");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration for saving files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save files in public/uploads
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});


// USER DETAILS
router.post("/fetchuserprofile", authUser.isAuthenticated, Controller.fetchuserprofile); // Route to fetch user profile
router.post('/CompleteProfile', authUser.isAuthenticated, Controller.CompleteProfile); // Route to CompleteProfile

// WALLET BALANCE
router.post("/FetchWalletBalance", authUser.isAuthenticated, WalletController.FetchWalletBalance);

// PAYMENT HISTORY
router.post("/fetchTransactionFilter", authUser.isAuthenticated, WalletController.fetchTransactionFilter); // Route to fetchTransactionFilter
router.post("/saveTransactionFilter", authUser.isAuthenticated, WalletController.saveTransactionFilter); // Route to saveTransactionFilter
router.post("/clearTransactionFilter", authUser.isAuthenticated, WalletController.clearTransactionFilter); // Route to clearTransactionFilter
router.post("/FetchTransactionDetails", authUser.isAuthenticated, WalletController.getTransactionDetails); // Route to FetchTransactionDetails

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
router.post('/RemoveVehiclesOfUser', authUser.isAuthenticated, Controller.RemoveVehicleOfUser); // add vehchle { model vehicle , Vechle number }
router.post('/fetchSavedVehiclesOfUser', authUser.isAuthenticated, Controller.fetchSavedVehiclesOfUser); // Fetch the vehicle of the paticular user


// MANAGE CHARGING STATIONS 
// SAVED CHARGING STATIONS
router.post('/fetchSavedStations', authUser.isAuthenticated, StationController.fetchSavedStations); // Route to Fetch Saved Stations
router.post('/SaveStations', authUser.isAuthenticated, StationController.SaveStations); // Route to save Stations
router.post('/RemoveStation', authUser.isAuthenticated, StationController.RemoveStation); // Route to remove a station from favorites
// CAPITATIVE CHARGING STATIONS  //TODO - V3.1


// CHARGING HISTORY 
// Route to fetch payment history
router.post("/fetchChargingSessionDetails", authUser.isAuthenticated, SessionController.fetchChargingSessionDetails); // Route to fetch charging session details

// FAQ'S
router.post("/chatbot", authUser.isAuthenticated, Controller.chatbotResponse); // Route to fetch FAQs


// ACCOUNT
// deleteAccount
router.post('/deleteAccount', authUser.isAuthenticated, Controller.deleteAccount);




// Export the router
module.exports = router;
