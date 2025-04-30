const express = require('express');
const router = express.Router();
const Controller = require("../controllers/searchController");
const authUser = require("../middlewares/authenticated");


router.post('/SearchSpecificChargerDetails', authUser.isAuthenticated, Controller.SearchSpecificChargerDetails); // Route to update connector user


// Export the router
module.exports = router;
