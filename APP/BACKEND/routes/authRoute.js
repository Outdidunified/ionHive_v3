const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");

// Route to generate OTP for login / register
router.post('/GenerateOTP', authController.GenerateOTP);

router.post('/authOTP', authController.authOTP);

router.post('/googleSignIN', authController.googleSignIN);

// Export the router
module.exports = router;
