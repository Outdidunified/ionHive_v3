const express = require('express');
const router = express.Router();
const Controller = require("../controllers/ocppController");
const authUser = require("../middlewares/authenticated");

// OCPP Configuration Routes
// Fetch all action options for OCPPConfig
router.get('/GetAction', authUser.isAuthenticated, Controller.getActions);

// Route to send request to charger from OCPPConfig
router.post('/SendOCPPRequest', authUser.isAuthenticated, Controller.sendOCPPRequest);

// Export the router
module.exports = router;