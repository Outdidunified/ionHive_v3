const express = require('express');
const router = express.Router();
const Controller = require('../controllers/associationAdminControllers');
const verifyToken = require('../middlewares/authMiddleware');

// 1.Login
// Route to check login credentials// Route to check login credentials
router.post('/CheckLoginCredentials', async (req, res) => {
    try {
        const result = await Controller.authenticate(req);

        if (result.error) {
            return res.status(result.status).json({ message: result.message });
        }

        // Return token with user info
        res.status(200).json({
            status: 'Success',
            user: {
                user_id: result.user.user_id,
                username: result.user.username,
                email_id: result.user.email_id,
                role_id: result.user.role_id,
                reseller_id: result.user.reseller_id,
                client_id: result.user.client_id,
                association_name: result.user.association_name,
                association_id: result.user.association_id,
            },
            token: result.user.token
        });

    } catch (error) {
        console.error('Error in CheckLoginCredentials route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to authenticate user' });
    }
});

// 2.Dashboard
// Route to fetch total chargers for a specific association
router.post('/FetchTotalCharger', verifyToken, async (req, res) => {
    try {
        const { association_id } = req.body; // Get association_id from request body

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const { totalCount, recentChargers } = await Controller.FetchTotalCharger(association_id);

        if (totalCount === 0) {
            return res.status(200).json({ status: 'Success', totalCount, message: 'No chargers found' });
        }

        res.status(200).json({ status: 'Success', totalCount, data: recentChargers });
    } catch (error) {
        console.error('Error in FetchTotalCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger details' });
    }
});

// Route to fetch online charger
router.post('/FetchOnlineCharger', verifyToken, async (req, res) => {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        console.log("Fetching online chargers for association_id:", association_id);

        const { totalCount, onlineChargers, message } = await Controller.FetchOnlineCharger(association_id);

        if (totalCount === 0) {
            return res.status(200).json({ status: 'Success', totalCount, message });
        }

        res.status(200).json({ status: 'Success', totalCount, data: onlineChargers });
    } catch (error) {
        console.error('Error in FetchOnlineCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch online chargers' });
    }
});

// Route to fetch offline charger
router.post('/FetchOfflineCharger', verifyToken, async (req, res) => {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        console.log("Fetching offline chargers for association_id:", association_id);

        const { totalCount, offlineChargers, message } = await Controller.FetchOfflineCharger(association_id);

        if (totalCount === 0) {
            return res.status(200).json({ status: 'Success', totalCount, message });
        }

        res.status(200).json({ status: 'Success', totalCount, data: offlineChargers });
    } catch (error) {
        console.error('Error in FetchOfflineCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch offline chargers' });
    }
});

// Route to fetch Faults charger
router.post('/FetchFaultsCharger', verifyToken, async (req, res) => {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        console.log("Fetching faulty chargers for association_id:", association_id);

        const { totalCount, faultyChargers, message } = await Controller.FetchFaultsCharger(association_id);

        if (totalCount === 0) {
            return res.status(200).json({ status: 'Success', totalCount, message });
        }

        res.status(200).json({ status: 'Success', totalCount, data: faultyChargers });
    } catch (error) {
        console.error('Error in FetchFaultsCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch faulty chargers' });
    }
});

// Route to Fetch Charger Total Energy
router.post('/FetchChargerTotalEnergy', verifyToken, async (req, res) => {
    try {
        const { association_id } = req.body;
        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        console.log("Fetching total energy for association_id:", association_id);

        // const { totalEnergyConsumed, CO2_Emissions, message } = await Controller.FetchChargerTotalEnergy(association_id);

        // res.status(200).json({ status: 'Success', totalEnergyConsumed, CO2_Emissions, message });
        const ChargerTotalEnergy = await Controller.FetchChargerTotalEnergy(association_id);

        res.status(200).json({ status: 'Success', ChargerTotalEnergy });
    } catch (error) {
        console.error('Error in FetchChargerTotalEnergy route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger total energy' });
    }
});

// Route to Fetch Total Charger Charging Sessions for a Specific association
router.post('/FetchTotalChargersSession', verifyToken, async (req, res) => {
    try {
        const { association_id } = req.body; // Get association_id from request body

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const { totalCount } = await Controller.FetchTotalChargersSession(association_id);

        res.status(200).json({ status: 'Success', totalCount });
    } catch (error) {
        console.error('Error in FetchTotalChargersSession route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger session count' });
    }
});

// Route to Fetch Total App Users for a Specific association
router.post('/FetchTotalUsers', verifyToken, async (req, res) => {
    try {
        const { association_id } = req.body; // Get association_id from request body

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const TotalCounts = await Controller.FetchTotalUsers(association_id);

        res.status(200).json({ status: 'Success', TotalCounts });
    } catch (error) {
        console.error('Error in FetchTotalUsers route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch total app users' });
    }
});

// 3.Manage Device
// Route to FetchAllocatedChargerByClientToAssociation 
router.post('/FetchAllocatedChargerByClientToAssociation', verifyToken, async (req, res) => {
    try {
        const Chargers = await Controller.FetchAllocatedChargerByClientToAssociation(req);

        if (Chargers.status === 404) {
            res.status(200).json({ status: 'Success', data: [] });
        } else {
            const Chargerslist = JSON.parse(JSON.stringify(Chargers));
            res.status(200).json({ status: 'Success', data: Chargerslist });
        }
    } catch (error) {
        console.error('Error in FetchAllocatedChargerByClientToAssociation route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchAllocatedChargerByClientToAssociation' });
    }
});

// Route to DeActivateOrActivate Reseller
router.post('/UpdateDevice', verifyToken, async (req, res) => {
    try {
        const result = await Controller.UpdateDevice(req.body); // pass only data, not req/res
        res.status(200).json({ status: 'Success', message: 'Charger updated successfully', data: result });
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({ status: 'Failed', message: error.message || 'Internal Server Error' });
    }
});

// Route to DeActivateOrActivate Reseller
router.post('/DeActivateOrActivateCharger', verifyToken, async (req, res) => {
    try {
        const result = await Controller.DeActivateOrActivateCharger(req.body); // controller returns result
        res.status(200).json({ status: 'Success', message: 'Charger updated successfully', data: result });
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({ status: 'Failed', message: error.message || 'Internal Server Error' });
    }
});

// Route to Fetch Finance
router.post('/FetchFinance_dropdown', verifyToken, async (req, res) => {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const result = await Controller.FetchFinance_dropdown(association_id);

        // Check if fetchFinance returned an error
        if (result.status === 'Failed') {
            return res.status(404).json(result); // Return the failure message
        }

        res.status(200).json({ status: 'Success', data: result.data });
    } catch (error) {
        console.error('Error in FetchFinance:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch finance data' });
    }
});

// Route to Assign Finance
router.post('/assignFinance', verifyToken, async (req, res) => {
    try {
        const { _id, charger_id, finance_id } = req.body;

        // Validate required fields
        if (!_id || !charger_id || !finance_id) {
            return res.status(400).json({ status: 'Failed', message: '_id, charger_id, and finance_id are required' });
        }

        // Call the assignFinance function
        const result = await Controller.assignFinance({
            _id, charger_id, finance_id
        });

        // Check the result and return appropriate response
        if (result.status === 'Success') {
            return res.status(201).json(result);
        } else {
            return res.status(500).json(result);
        }

    } catch (error) {
        console.error('Error in assignFinance:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to assign finance entry' });
    }
});

// Route to reAssign Finance
router.post('/reAssignFinance', verifyToken, async (req, res) => {
    try {
        const { _id, charger_id, finance_id } = req.body;

        // Validate required fields
        if (!_id || !charger_id || !finance_id) {
            return res.status(400).json({ status: 'Failed', message: '_id, charger_id, and finance_id are required' });
        }

        // Call the reAssignFinance function
        const result = await Controller.reAssignFinance({
            _id, charger_id, finance_id
        });

        // Check the result and return appropriate response
        if (result.status === 'Success') {
            return res.status(201).json(result);
        } else {
            return res.status(500).json(result);
        }

    } catch (error) {
        console.error('Error in reAssignFinance:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to reAssign finance entry' });
    }
});

// 4.Manage Users
// Route to FetchUser
router.post('/FetchUsers', verifyToken, async (req, res) => {
    try {
        // Call FetchUser function to get users data
        const user = await Controller.FetchUser(req);
        // Send response with users data
        res.status(200).json({ status: 'Success', data: user });
    } catch (error) {
        console.error('Error in FetchUser route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch users' });
    }
});

// Route to UpdateUser
router.post('/UpdateUser', verifyToken, async (req, res) => {
    try {
        await Controller.UpdateUser(req); // Just pass req
        res.status(200).json({ status: 'Success', message: 'User updated successfully' });
    } catch (error) {
        console.error('UpdateUser Error:', error.message);
        res.status(error.status || 500).json({ status: 'Failed', message: error.message || 'Internal Server Error' });
    }
});

// 5.Manage TagID
//FetchAllTagIDs
router.post('/FetchAllTagIDs', verifyToken, async (req, res) => {
    const result = await Controller.FetchAllTagIDs(req);

    if (result.status === 200) {
        res.status(200).json({ status: 'Success', data: result.data });
    } else {
        res.status(result.status).json({
            status: 'Failed',
            message: result.message
        });
    }
});

//CreateTagID
router.post('/CreateTagID', verifyToken, async (req, res) => {
    try {
        const result = await Controller.CreateTagID(req); // Calling the function without passing `res` here
        return res.status(result.status).json(result); // Handling the response outside the function
    } catch (error) {
        console.error('Error in CreateTagID route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to create tag ID' });
    }
}); 

//UpdateTagID
router.post('/UpdateTagID', verifyToken, async (req, res) => {
    try {
        const result = await Controller.UpdateTagID(req); // Call the function without passing `res`
        return res.status(result.status).json(result); // Handle the response outside the function
    } catch (error) {
        console.error('Error in UpdateTagID route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to update tag ID' });
    }
}); 

//DeactivateTagID
router.post('/DeactivateOrActivateTagID', verifyToken, async (req, res) => {
    try {
        const result = await Controller.DeactivateTagID(req); // Call the function without passing `res`
        return res.status(result.status).json(result); // Handle the response outside the function
    } catch (error) {
        console.error('Error in DeactivateTagID route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to deactivate tag ID' });
    }
}); 

// 6.Assign User
//FetchUsersWithSpecificRolesToUnAssign
router.post('/FetchUsersWithSpecificRolesToUnAssign', verifyToken, async (req, res) => {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'Association ID is required' });
        }

        const users = await Controller.FetchUsersWithSpecificRolesToUnAssign(association_id);

        if (!users || users.length === 0) {
            return res.status(200).json({ status: 'Success', message: 'No users found', data: [] });
        }

        return res.status(200).json({ status: 'Success', data: users });
    } catch (error) {
        console.error('Error in /FetchUsersWithSpecificRolesToUnAssign:', error);
        res.status(500).json({ status: 'Failed', message: error.message || 'Internal Server Error' });
    }
});

//AddUserToAssociation
router.post('/AssUserToAssociation', verifyToken, Controller.AddUserToAssociation);

// Route to AssignTagIdToUser
router.post('/AssignTagIdToUser', verifyToken, async (req, res) => {
    try {
        const result = await Controller.AssignTagIdToUser(req.body);
        res.status(200).json({ status: 'Success', message: result.message });
    } catch (error) {
        console.error('Error in AssignTagIdToUser:', error.message);
        res.status(400).json({ status: 'Failed', message: error.message || 'Internal Server Error' });
    }
});

//FetchTagIdToAssign
router.post('/FetchTagIdToAssign', verifyToken, async (req, res) => {
    try {
        const result = await Controller.FetchTagIdToAssign(req.body);

        if (result.status === 404) {
            return res.status(200).json({ status: 'Success', data: result.message });
        }

        res.status(200).json({ status: 'Success', data: result });
    } catch (error) {
        console.error('Error in FetchTagIdToAssign:', error);
        res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
});

//RemoveUserFromAssociation
router.post('/RemoveUserFromAssociation', verifyToken, async (req, res) => {
    try {
        const result = await Controller.RemoveUserFromAssociation(req);

        res.status(result.status).json({
            status: result.status === 200 ? 'Success' : 'Failed',
            message: result.message
        });
    } catch (error) {
        console.error('Error in RemoveUserFromAssociation:', error);
        res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
});


// 7.Manage Finance
// Route to Create Finance
router.post('/CreateFinance', verifyToken, async (req, res) => {
    try {
        const { eb_charge, margin, gst, parking_fee, convenience_fee, station_fee, processing_fee, service_fee, association_id, created_by } = req.body;

        // Validate required fields
        if (!eb_charge || !gst || !association_id || !created_by) {
            return res.status(400).json({ status: 'Failed', message: 'eb_charge, gst, created_by, and association_id are required' });
        }

        // Call the createFinance function
        const result = await Controller.createFinance({
            eb_charge, margin, gst, parking_fee, convenience_fee, station_fee, processing_fee, service_fee, association_id, created_by
        });

        // Check the result and return appropriate response
        if (result.status === 'Success') {
            return res.status(201).json(result);
        } else {
            return res.status(500).json(result);
        }

    } catch (error) {
        console.error('Error in CreateFinance:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to create finance entry' });
    }
});

// Route to Fetch Finance
router.post('/fetchFinance', verifyToken, async (req, res) => {
    try {
        const { association_id } = req.body;
        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        const result = await Controller.fetchFinance(association_id);

        // Check if fetchFinance returned an error
        if (result.status === 'Failed') {
            return res.status(404).json(result); // Return the failure message
        }

        res.status(200).json({ status: 'Success', data: result.data });
    } catch (error) {
        console.error('Error in FetchFinance:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch finance data' });
    }
});

// Route to Update Finance
router.post('/UpdateFinance', verifyToken, async (req, res) => {
    try {
        const { _id, finance_id, eb_charge, margin, gst, parking_fee, convenience_fee, station_fee, processing_fee, service_fee, association_id, status, modified_by } = req.body;

        // Validate required fields
        if (!_id || !finance_id || !eb_charge || !gst || !association_id || !modified_by) {
            return res.status(400).json({ status: 'Failed', message: '_id, finance_id, eb_charge, gst, modified_by, and association_id are required' });
        }

        // Call the update function
        const result = await Controller.updateFinance({
            _id, finance_id, eb_charge, margin, gst, parking_fee, convenience_fee, station_fee, processing_fee, service_fee, association_id, status, modified_by
        });

        // Check if update was successful
        if (result.status === 'Success') {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }

    } catch (error) {
        console.error('Error in UpdateFinance:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to update finance entry' });
    }
});

// 8.Withdraw
//Route to FetchCommissionAmtAssociation
router.post('/FetchCommissionAmtAssociation', verifyToken, async (req, res) => {
    try {
        const commissionAmt = await Controller.FetchCommissionAmtAssociation(req); // Call function without passing `res`
        return res.status(200).json({ status: 'Success', data: commissionAmt });
    } catch (error) {
        console.error('Error in FetchCommissionAmtAssociation route:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to Fetch Commission Amount Association' });
    }
});

// Route to save user bank details
router.post('/saveUserBankDetails', verifyToken, async (req, res) => {
    try {
        const result = await Controller.saveUserBankDetails(req); // Call the function without passing `res`
        return res.status(result.status).json(result); // Send the response based on returned object
    } catch (error) {
        console.error('Unexpected error in /saveUserBankDetails route:', error);
        return res.status(500).json({ message: 'Unexpected error occurred while processing request.' });
    }
}); 

// Route to fetch user bank details
router.post('/fetchUserBankDetails', verifyToken, async (req, res) => {
    try {
        const result = await Controller.fetchUserBankDetails(req); // Call the function without passing `res`
        return res.status(result.status).json(result); // Send the response based on returned object
    } catch (error) {
        console.error('Unexpected error in /fetchUserBankDetails route:', error);
        return res.status(500).json({ message: 'Unexpected error occurred while processing request.' });
    }
}); 

// Route to update user bank details
router.post('/updateUserBankDetails', verifyToken, async (req, res) => {
    try {
        const result = await Controller.updateUserBankDetails(req); // Call function without passing `res`
        return res.status(result.status).json(result); // Send the response based on the result
    } catch (error) {
        console.error('Unexpected error in /updateUserBankDetails route:', error);
        return res.status(500).json({ message: 'Unexpected error occurred while updating bank details.' });
    }
}); 

// Route to ApplyWithdrawal// Define the route after the function
router.post('/ApplyWithdrawal', verifyToken, async (req, res) => {
    try {
        const { user_id, withdrawalAmount, accountHolderName, accountNumber, bankName, withdrawal_req_by, ifscNumber } = req.body;

        if (!user_id || !withdrawalAmount || !accountHolderName || !accountNumber || !bankName || !withdrawal_req_by || !ifscNumber) {
            return res.status(400).json({ status: 'Failed', message: 'Missing required fields' });
        }

        const result = await Controller.ApplyWithdrawal(user_id, withdrawalAmount, accountHolderName, accountNumber, bankName, withdrawal_req_by, ifscNumber);

        return res.status(result.status === 'Success' ? 200 : 400).json(result);

    } catch (error) {
        console.error('Error in ApplyWithdrawal route:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to process withdrawal request' });
    }
});

// Route to Fetch payment request details
router.post('/FetchPaymentRequest', verifyToken, async (req, res) => {
    try {
        const { user_id } = req.body; // Get user_id from request body

        if (!user_id) {
            return res.status(400).json({ status: 'Failed', message: 'user_id is required' });
        }

        const result = await Controller.FetchPaymentRequest(user_id);

        res.status(200).json({ status: 'Success', data: result });
    } catch (error) {
        console.error('Error in FetchPaymentRequest route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch payment request' });
    }
});

// Route to fetch payment notification
router.post('/FetchPaymentNotification', verifyToken, async (req, res) => {
    try {
        const { user_id } = req.body; // Get user_id from request body

        if (!user_id) {
            return res.status(400).json({ status: 'Failed', message: 'user_id is required' });
        }

        const result = await Controller.FetchPaymentNotification(user_id);

        res.status(200).json({ status: 'Success', data: result });

    } catch (error) {
        console.error('Error in FetchPaymentNotification route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch payment notification request' });
    }
});

// Route to mark notification read
router.post('/MarkNotificationRead', verifyToken, async (req, res) => {
    try {
        const { _id, rca_admin_notification_status } = req.body;

        if (!_id || !rca_admin_notification_status) {
            return res.status(400).json({ status: 'Failed', message: 'Missing required fields' });
        }

        const result = await Controller.MarkNotificationRead(_id, rca_admin_notification_status);

        return res.status(result.status === 'Success' ? 200 : 400).json(result);

    } catch (error) {
        console.error('Error in MarkNotificationRead route:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to mark notification read' });
    }
});

// 9.Manage Report
// Route to FetchReportDevice 
router.post('/FetchReportDevice', verifyToken, async (req, res) => {
    try {
        const Chargers = await Controller.FetchReportDevice(req);

        if (Chargers.status === 404) {
            res.status(200).json({ status: 'Success', data: [] });
        } else {
            const Chargerslist = JSON.parse(JSON.stringify(Chargers));
            res.status(200).json({ status: 'Success', data: Chargerslist });
        }
    } catch (error) {
        console.error('Error in FetchReportDevice route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchReportDevice' });
    }
});

// Route to download revenue report
router.post('/DeviceReport', verifyToken, async (req, res) => {
    try {
        const deviceReportData = await Controller.downloadDeviceReport(req); // Call function without passing `res`
        return res.status(deviceReportData.status).json(deviceReportData); // Send response based on returned data
    } catch (error) {
        console.error('Unexpected error in /DeviceReport route:', error);
        return res.status(500).json({ message: 'Unexpected error occurred while processing request.' });
    }
});

// Route to fetch specific charger revenue
router.post('/FetchSpecificChargerRevenue', verifyToken, async (req, res) => {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        // Fetch both revenueData and TotalChargerRevenue
        const { revenueData, TotalChargerRevenue } = await Controller.FetchSpecificChargerRevenue(association_id);

        res.status(200).json({
            status: "Success",
            revenueData,
            TotalChargerRevenue // Include total revenue in response
        });

    } catch (error) {
        console.error('Error in FetchSpecificChargerRevenue route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch specific charger revenue' });
    }
});

// Route to fetch charger list with all cost with revenue
router.post('/FetchChargerListWithAllCostWithRevenue', verifyToken, async (req, res) => {
    try {
        const { association_id } = req.body;

        if (!association_id) {
            return res.status(400).json({ status: 'Failed', message: 'association_id is required' });
        }

        // Fetch both revenueData 
        const { revenueData } = await Controller.FetchChargerListWithAllCostWithRevenue(association_id);

        res.status(200).json({
            status: "Success",
            revenueData,
        });

    } catch (error) {
        console.error('Error in FetchChargerListWithAllCostWithRevenue route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger list with all cost with revenue ' });
    }
});

// 10.Profile
// Route to FetchUserProfile 
router.post('/FetchUserProfile', verifyToken, async (req, res) => {
    try {
        const userdata = await Controller.FetchUserProfile(req);
        if (userdata.status === 200) {
            res.status(userdata.status).json({ status: 'Success', data: userdata.data });
        } else {
            res.status(userdata.status).json({ status: 'Failed', message: userdata.message });
        }
    } catch (error) {
        console.error('Error in FetchUserProfile route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to  FetchUserProfile' });
    }
});

// Route to UpdateUserProfile
router.post('/UpdateUserProfile', verifyToken, async (req, res) => {
    try {
        await Controller.UpdateUserProfile(req); // pass only req
        res.status(200).json({ status: 'Success', message: 'User profile updated successfully' });
    } catch (error) {
        console.error('Error in UpdateUserProfile route:', error);
        res.status(500).json({ status: 'Failed', message: error.message || 'Failed to update user profile' });
    }
});

// Route to UpdateAssociationProfile 
router.post('/UpdateAssociationProfile', verifyToken, async (req, res) => {
    try {
        await Controller.UpdateAssociationProfile(req); // Only pass req
        res.status(200).json({ status: 'Success', message: 'Association profile updated successfully' });
    } catch (error) {
        console.error('Error in UpdateAssociationProfile route:', error);
        res.status(500).json({ status: 'Failed', message: error.message || 'Failed to update association profile' });
    }
});

module.exports = router;
