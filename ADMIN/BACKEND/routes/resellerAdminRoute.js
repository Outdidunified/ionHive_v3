const express = require('express');
const router = express.Router();
const Controller = require('../controllers/resellerAdminControllers');
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
                reseller_name: result.user.reseller_name,
                reseller_id: result.user.reseller_id,
            },
            token: result.user.token
        });

    } catch (error) {
        console.error('Error in CheckLoginCredentials route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to authenticate user' });
    }
});

// 2.Dashboard
// Route to Fetch Total Clients, Associations, and App Users for a Specific Reseller
router.post('/FetchTotalUsers', verifyToken, async (req, res) => {
    try {
        const { reseller_id } = req.body; // Get reseller_id from request body

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const TotalCounts = await Controller.FetchTotalUsers(reseller_id);

        res.status(200).json({ status: 'Success', TotalCounts });
    } catch (error) {
        console.error('Error in FetchTotalUsers route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch total clients, associations, and app users' });
    }
});

// Route to fetch total chargers for a specific reseller
router.post('/FetchTotalCharger', verifyToken, async (req, res) => {
    try {
        const { reseller_id } = req.body; // Get reseller_id from request body

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const { totalCount, recentChargers } = await Controller.FetchTotalCharger(reseller_id);

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
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        console.log("Fetching online chargers for reseller_id:", reseller_id);

        const { totalCount, onlineChargers, message } = await Controller.FetchOnlineCharger(reseller_id);

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
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        console.log("Fetching offline chargers for reseller_id:", reseller_id);

        const { totalCount, offlineChargers, message } = await Controller.FetchOfflineCharger(reseller_id);

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
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        console.log("Fetching faulty chargers for reseller_id:", reseller_id);

        const { totalCount, faultyChargers, message } = await Controller.FetchFaultsCharger(reseller_id);

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
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        console.log("Fetching total energy for reseller_id:", reseller_id);

        // const { totalEnergyConsumed, CO2_Emissions, message } = await Controller.FetchChargerTotalEnergy(reseller_id);

        const ChargerTotalEnergy = await Controller.FetchChargerTotalEnergy(reseller_id);
        res.status(200).json({ status: 'Success', ChargerTotalEnergy });
    } catch (error) {
        console.error('Error in FetchChargerTotalEnergy route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger total energy' });
    }
});

// Route to Fetch Total Charger Charging Sessions for a Specific Reseller
router.post('/FetchTotalChargersSession', verifyToken, async (req, res) => {
    try {
        const { reseller_id } = req.body; // Get reseller_id from request body

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        const { totalCount } = await Controller.FetchTotalChargersSession(reseller_id);

        res.status(200).json({ status: 'Success', totalCount });
    } catch (error) {
        console.error('Error in FetchTotalChargersSession route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger session count' });
    }
});

// 3.Manage Device
// Route to FetchUnAllocatedCharger 
router.post('/FetchUnAllocatedCharger', verifyToken, async (req, res) => {
    try {
        const Chargers = await Controller.FetchUnAllocatedCharger(req);

        const safeChargers = JSON.parse(JSON.stringify(Chargers));

        res.status(200).json({ status: 'Success', data: safeChargers });
    } catch (error) {
        console.error('Error in FetchUnAllocatedCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchUnAllocatedCharger' });
    }
});

// Route to FetchAllocatedCharger 
router.post('/FetchAllocatedCharger', verifyToken, async (req, res) => {
    try {
        const Chargers = await Controller.FetchAllocatedCharger(req);

        const safeChargers = JSON.parse(JSON.stringify(Chargers));

        res.status(200).json({ status: 'Success', data: safeChargers });
    } catch (error) {
        console.error('Error in FetchAllocatedCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchAllocatedCharger' });
    }
});

// Route to DeActivateOrActivate Reseller
router.post('/DeActivateOrActivateCharger', verifyToken, async (req, res) => {
    try {
        const result = await Controller.DeActivateOrActivateCharger(req);

        if (result.error) {
            return res.status(result.status).json({ status: 'Failed', message: result.message });
        }

        res.status(200).json({ status: 'Success', message: result.message });
    } catch (error) {
        console.error('Error in DeActivateOrActivateCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
});

// Route to FetchClientUserToAssginCharger
router.post('/FetchClientUserToAssginCharger', verifyToken, async (req, res) => {
    try {
        // Call FetchUser function to get users data
        const user = await Controller.FetchClientUserToAssginCharger(req, res);
        // Send response with users data
        res.status(200).json({ status: 'Success', data: user });

    } catch (error) {
        console.error('Error in FetchClientUserToAssginCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch users' });
    }
});

// Route to FetchUnAllocatedChargerToAssgin 
router.post('/FetchUnAllocatedChargerToAssgin', verifyToken, async (req, res) => {
    try {
        const Chargers = await Controller.FetchUnAllocatedChargerToAssgin(req, res);


        res.status(200).json({ status: 'Success', data: Chargers });
    } catch (error) {
        console.error('Error in FetchUnAllocatedChargerToAssgin route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchUnAllocatedChargerToAssgin' });
    }
});

// Route to AssginChargerToClient
router.post('/AssginChargerToClient', verifyToken, async (req, res) => {
    try {
        const result = await Controller.AssginChargerToClient(req);

        return res.status(result.status).json({
            status: result.error ? "Failed" : "Success",
            message: result.message
        });

    } catch (error) {
        console.error('Error in AssginChargerToClient route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to AssginChargerToClient' });
    }
});

// 4.Manage Client
// Route to FetchClients
router.post('/getAllClients', verifyToken, async (req, res) => {
    try {
        const getresellerClients = await Controller.FetchClients(req, res); // Pass req and res to the function
        res.status(200).json({ message: 'Success', data: getresellerClients });
    } catch (error) {
        console.error('Error in FetchClients route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch client details' });
    }
});

// Route to FetchAssignedAssociation
router.post('/FetchAssignedAssociation', verifyToken, async (req, res) => {
    try {
        const result = await Controller.FetchAssignedAssociation(req);

        if (result.error) {
            return res.status(result.status).json({ status: 'Failed', message: result.message });
        }

        return res.status(200).json({
            status: 'Success',
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Error in FetchAssignedAssociation route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchAssignedAssociation' });
    }
});

// Route to FetchChargerDetailsWithSession
router.post('/FetchChargerDetailsWithSession', verifyToken, async (req, res) => {
    try {
        const ChargersWithSession = await Controller.FetchChargerDetailsWithSession(req);

        // Filter out any circular references (optional, only if necessary)
        const Chargers = JSON.parse(JSON.stringify(ChargersWithSession));

        res.status(200).json({ status: 'Success', data: Chargers });
    } catch (error) {
        if (error.message === 'No chargers found for the specified client_id') {
            res.status(404).json({ status: 'Failed', message: error.message });
        } else if (error.message === 'Client ID is required') {
            res.status(400).json({ status: 'Failed', message: error.message });
        } else {
            res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
        }
    }
});

// add new client
router.post('/addNewClient', verifyToken, async (req, res) => {
    try {
        const result = await Controller.addNewClient(req);
        if (result === true) {
            res.status(200).json({ message: 'Success', data: 'Client created successfully' });
        } else {
            res.status(500).json({ status: 'Failed', message: "Internal Server Error" });
        }
    } catch (error) {
        console.error('Error in addNewClient route:', error.message);
        const statusCode = error.statusCode || 500; // Default to 500 if no custom status code
        res.status(statusCode).json({ status: 'Failed', message: error.message });
    }
});

// Route to update
router.post('/updateClient', verifyToken, async (req, res) => {
    try {
        const updateClient = await Controller.updateClient(req);
        if (updateClient === true) {
            res.status(200).json({ message: 'Success', data: 'Client updated successfully' });
        } else {
            console.log('Internal Server Error');
            res.status(500).json({ status: 'Failed', message: "Internal Server Error" });
        }
    } catch (error) {
        console.error('Error in updateClient route:', error.message);
        res.status(500).json({ status: 'Failed', message: error.message });
    }
});

// Route to update commission
router.post('/UpdateResellerCommission', verifyToken, async (req, res) => {
    try {
        const UpdateResellerCommission = await Controller.updateCommission(req);
        if (UpdateResellerCommission === true) {
            res.status(200).json({ message: 'Success', data: 'Commission updated successfully' });
        } else {
            console.log('Internal Server Error');
            res.status(500).json({ status: 'Failed', message: "Internal Server Error" });
        }
    } catch (error) {
        console.error('Error in update reseller commission route:', error.message);
        res.status(500).json({ status: 'Failed', message: error.message });
    }
});

// Route to DeActivate or Activate Client
router.post('/DeActivateClient', verifyToken, async (req, res) => {
    try {
        const result = await Controller.DeActivateClient(req);

        return res.status(result.status).json({
            status: result.error ? 'Failed' : 'Success',
            message: result.message
        });

    } catch (error) {
        console.error('Error in DeActivateClient route:', error);
        res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
});

// 5.Manage User
// Route to FetchUser
router.post('/FetchUsers', verifyToken, async (req, res) => {
    try {
        const reseller_id = req.body.reseller_id;
        if (!reseller_id) {
            return res.status(409).json({ message: 'Reseller ID is Empty !' });
        }
        // Call FetchUser function to get users data
        const user = await Controller.FetchUser(req, res);
        // Send response with users data
        res.status(200).json({ status: 'Success', data: user });

    } catch (error) {
        console.error('Error in FetchUser route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch users' });
    }
});

// Route to FetchSpecificUserRoleForSelection 
router.get('/FetchSpecificUserRoleForSelection', verifyToken, async (req, res) => {
    try {
        // Call FetchUser function to get users data
        const user = await Controller.FetchSpecificUserRoleForSelection(req, res);
        // Send response with users data
        res.status(200).json({ status: 'Success', data: user });

    } catch (error) {
        console.error('Error in FetchSpecificUserForCreateSelection route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchSpecificUserForCreateSelection ' });
    }
});

// Route to FetchClientForSelection 
router.post('/FetchClientForSelection', verifyToken, async (req, res) => {
    try {
        const reseller_id = req.body.reseller_id;
        if (!reseller_id) {
            return res.status(409).json({ message: 'Reseller ID is Empty!' });
        }
        // Call FetchUser function to get users data
        const user = await Controller.FetchClientForSelection(req, res);
        // Send response with users data
        res.status(200).json({ status: 'Success', data: user });

    } catch (error) {
        console.error('Error in FetchClientForSelection route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchClientForSelection ' });
    }
});

// Route to CreateUser
router.post('/CreateUser', verifyToken, async (req, res) => {
    try {
        const result = await Controller.CreateUser(req);

        if (result.error) {
            return res.status(result.status).json({ status: 'Failed', message: result.message });
        }

        return res.status(result.status).json({ status: 'Success', message: result.message });

    } catch (error) {
        console.error('Error in CreateUser route:', error);
        return res.status(500).json({ status: 'Failed', message: 'Unexpected server error' });
    }
});

// Route to UpdateUser
router.post('/UpdateUser', verifyToken, async (req, res) => {
    try {
        const result = await Controller.UpdateUser(req);

        if (result.error) {
            return res.status(result.status).json({ status: 'Failed', message: result.message });
        }

        return res.status(result.status).json({ status: 'Success', message: result.message });

    } catch (error) {
        console.error('Error in UpdateUser route:', error);
        return res.status(500).json({ status: 'Failed', message: 'Unexpected server error' });
    }
});

// 6.Withdrawal
//Route to FetchCommissionAmtReseller
router.post('/FetchCommissionAmtReseller', verifyToken, async (req, res) => {
    try {
        const commissionAmt = await Controller.FetchCommissionAmtReseller(req, res);
        res.status(200).json({ status: 'Success', data: commissionAmt });

    } catch (error) {
        console.error('Error in FetchCommissionAmtReseller route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to  FetchCommissionAmtReseller' });
    }
});

// Route to save bank details
router.post('/saveUserBankDetails', verifyToken, async (req, res) => {
    try {
        const result = await Controller.saveUserBankDetails(req);

        if (result.error) {
            return res.status(result.status).json({ status: 'Failed', message: result.message });
        }

        return res.status(result.status).json({ status: 'Success', message: result.message });

    } catch (error) {
        console.error('Unexpected error in /saveUserBankDetails route:', error);
        res.status(500).json({ status: 'Failed', message: 'Unexpected server error' });
    }
});

// Route to fetch user bank details
router.post('/fetchUserBankDetails', verifyToken, async (req, res) => {
    try {
        const result = await Controller.fetchUserBankDetails(req);

        if (result.error) {
            return res.status(result.status).json({ status: 'Failed', message: result.message });
        }

        return res.status(result.status).json({ status: 'Success', data: result.data });

    } catch (error) {
        console.error('Unexpected route error:', error);
        res.status(500).json({ status: 'Failed', message: 'Unexpected server error' });
    }
});

// Route to update user bank details
router.post('/updateUserBankDetails', verifyToken, async (req, res) => {
    try {
        const result = await Controller.updateUserBankDetails(req);

        if (result.error) {
            return res.status(result.status).json({ status: 'Failed', message: result.message });
        }

        return res.status(result.status).json({ status: 'Success', message: result.message });

    } catch (error) {
        console.error('Route Error:', error);
        res.status(500).json({ status: 'Failed', message: 'Unexpected Server Error' });
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

// 7.Manage Device & Revenue Report Controller
// Route to FetchReportDevice 
router.post('/FetchReportDevice', async (req, res) => {
    try {
        const Chargers = await Controller.FetchReportDevice(req);

        const safeChargers = JSON.parse(JSON.stringify(Chargers));

        res.status(200).json({ status: 'Success', data: safeChargers });
    } catch (error) {
        console.error('Error in FetchReportDevice route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchReportDevice' });
    }
});

// Route to download revenue report
router.post('/DeviceReport', verifyToken, async (req, res) => {
    try {
        const result = await Controller.downloadDeviceReport(req);

        if (result.error) {
            return res.status(result.status).json({
                status: 'Failed',
                message: result.message
            });
        }

        return res.status(result.status).json({
            status: 'Success',
            data: result.data
        });

    } catch (error) {
        console.error('Route Error:', error);
        res.status(500).json({ status: 'Failed', message: 'Unexpected Server Error' });
    }
});

// Route to fetch specific charger revenue
router.post('/FetchSpecificChargerRevenue', verifyToken, async (req, res) => {
    try {
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        // Fetch both revenueData and TotalChargerRevenue
        const { revenueData, TotalChargerRevenue } = await Controller.FetchSpecificChargerRevenue(reseller_id);

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
        const { reseller_id } = req.body;

        if (!reseller_id) {
            return res.status(400).json({ status: 'Failed', message: 'reseller_id is required' });
        }

        // Fetch both revenueData 
        const { revenueData } = await Controller.FetchChargerListWithAllCostWithRevenue(reseller_id);

        res.status(200).json({
            status: "Success",
            revenueData,
        });

    } catch (error) {
        console.error('Error in FetchChargerListWithAllCostWithRevenue route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger list with all cost with revenue ' });
    }
});

// 8.Profile Controller
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
        const result = await Controller.UpdateUserProfile(req);

        if (result.error) {
            return res.status(result.status).json({
                status: 'Failed',
                message: result.message
            });
        }

        return res.status(result.status).json({
            status: 'Success',
            message: result.message
        });

    } catch (error) {
        console.error('Error in UpdateUserProfile route:', error);
        res.status(500).json({ status: 'Failed', message: 'Unexpected Server Error' });
    }
});

// Route to UpdateResellerProfile 
router.post('/UpdateResellerProfile', verifyToken, async (req, res) => {
    try {
        const result = await Controller.UpdateResellerProfile(req);

        if (result.error) {
            return res.status(result.status).json({
                status: 'Failed',
                message: result.message
            });
        }

        return res.status(result.status).json({
            status: 'Success',
            message: result.message
        });

    } catch (error) {
        console.error('Error in UpdateResellerProfile route:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Unexpected server error'
        });
    }
});


module.exports = router;
