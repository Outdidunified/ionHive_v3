const express = require('express');
const router = express.Router();
const Controller = require('../controllers/clientAdminControllers');
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
                client_name: result.user.client_name,
                client_id: result.user.client_id,
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
// Route to fetch total chargers for a specific client
router.post('/FetchTotalCharger', verifyToken, async (req, res) => {
    try {
        const { client_id } = req.body; // Get client_id from request body

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        const { totalCount, recentChargers } = await Controller.FetchTotalCharger(client_id);

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
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        console.log("Fetching online chargers for client_id:", client_id);

        const { totalCount, onlineChargers, message } = await Controller.FetchOnlineCharger(client_id);

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
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        console.log("Fetching offline chargers for client_id:", client_id);

        const { totalCount, offlineChargers, message } = await Controller.FetchOfflineCharger(client_id);

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
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        console.log("Fetching faulty chargers for client_id:", client_id);

        const { totalCount, faultyChargers, message } = await Controller.FetchFaultsCharger(client_id);

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
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        console.log("Fetching total energy for client_id:", client_id);

        const ChargerTotalEnergy = await Controller.FetchChargerTotalEnergy(client_id);
        res.status(200).json({ status: 'Success', ChargerTotalEnergy });

    } catch (error) {
        console.error('Error in FetchChargerTotalEnergy route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger total energy' });
    }
});

// Route to Fetch Total Charger Charging Sessions for a Specific Reseller
router.post('/FetchTotalChargersSession', verifyToken, async (req, res) => {
    try {
        const { client_id } = req.body; // Get client_id from request body

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        const { totalCount } = await Controller.FetchTotalChargersSession(client_id);

        res.status(200).json({ status: 'Success', totalCount });
    } catch (error) {
        console.error('Error in FetchTotalChargersSession route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger session count' });
    }
});

// Route to Fetch Total Associations, and App Users for a Specific Reseller
router.post('/FetchTotalUsers', verifyToken, async (req, res) => {
    try {
        const { client_id } = req.body; // Get client_id from request body

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        const TotalCounts = await Controller.FetchTotalUsers(client_id);

        res.status(200).json({ status: 'Success', TotalCounts });
    } catch (error) {
        console.error('Error in FetchTotalUsers route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch total associations, and app users' });
    }
});

// 3.Manage Device
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

// Route to DeActivateOrActivate Charger
router.post('/DeActivateOrActivateCharger', verifyToken, async (req, res) => {
    try {
        await Controller.DeActivateOrActivateCharger(req, res); // call controller method

        // If the controller doesn't end the response itself (which it doesn't in this case), send a success response
        res.status(200).json({ status: 'Success', message: 'Charger updated successfully' });

    } catch (error) {
        console.error(error);
        logger.error(error);
        res.status(500).json({ status: 'Error', message: 'Something went wrong while updating charger' });
    }
});

// Route to FetchUnAllocatedCharger 
router.post('/FetchUnAllocatedCharger', verifyToken,  async (req, res) => {
    try {
        const Chargers = await Controller.FetchUnAllocatedCharger(req);

        const safeChargers = JSON.parse(JSON.stringify(Chargers));

        res.status(200).json({ status: 'Success', data: safeChargers });
    } catch (error) {
        console.error('Error in FetchUnAllocatedCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchUnAllocatedCharger' });
    }
});

// Route to FetchAssociationUserToAssginCharger
router.post('/FetchAssociationUserToAssginCharger', verifyToken, async (req, res) => {
    try {
        // Call FetchUser function to get users data
        const user = await Controller.FetchAssociationUserToAssginCharger(req, res);
        // Send response with users data
        res.status(200).json({ status: 'Success', data: user });

    } catch (error) {
        console.error('Error in FetchAssociationUserToAssginCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch users' });
    }
});

// Route to FetchUnAllocatedChargerToAssgin 
router.post('/FetchUnAllocatedChargerToAssgin', verifyToken, async (req, res) => {
    try {
        const Chargers = await Controller.FetchUnAllocatedChargerToAssgin(req);

        const safeChargers = JSON.parse(JSON.stringify(Chargers));

        res.status(200).json({ status: 'Success', data: safeChargers });
    } catch (error) {
        console.error('Error in FetchUnAllocatedChargerToAssgin route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchUnAllocatedChargerToAssgin' });
    }
});

// Route to AssignChargerToAssociation
router.post('/AssginChargerToAssociation', verifyToken, async (req, res) => {
    try {
        const result = await Controller.AssginChargerToAssociation(req); // Controller returns success object
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in AssginChargerToAssociation route:', error);
        res.status(500).json({ status: "Error", message: error.message || 'Failed to Assign Charger to Association' });
    }
});

// 4.Manage Association
// Route to FetchAssociationUser 
router.post('/FetchAssociationUser', verifyToken, async (req, res) => {
    try {
        const result = await Controller.FetchAssociationUser(req);

        if (!result.success) {
            return res.status(result.status || 404).json({
                status: 'Failed',
                message: result.message
            });
        }

        return res.status(200).json({
            status: 'Success',
            data: result.data
        });

    } catch (error) {
        console.error('Error in FetchAssociationUser route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch association users' });
    }
});

// Route to FetchChargerDetailsWithSession
router.post('/FetchChargerDetailsWithSession', verifyToken, async (req, res) => {
    try {
        const result = await Controller.FetchChargerDetailsWithSession(req);

        if (!result.success) {
            return res.status(result.status || 400).json({
                status: 'Failed',
                message: result.message
            });
        }

        res.status(200).json({
            status: 'Success',
            data: result.data
        });

    } catch (error) {
        console.error('Error in FetchChargerDetailsWithSession route:', error);
        res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
});

// Route to CreateAssociationUser 
router.post('/CreateAssociationUser', verifyToken, async (req, res) => {
    try {
        const result = await Controller.CreateAssociationUser(req.body);
        if (result.success) {
            return res.status(200).json({ status: 'Success', message: result.message });
        } else {
            return res.status(400).json({ status: 'Failure', message: result.message });
        }
    } catch (error) {
        console.error("Route Error - CreateAssociationUser:", error);
        return res.status(500).json({ status: 'Failure', message: 'Internal Server Error' });
    }
});

// Route to UpdateAssociationUser 
router.post('/UpdateAssociationUser', verifyToken, async (req, res) => {
    try {
        const result = await Controller.UpdateAssociationUser(req.body);
        if (result.success) {
            return res.status(200).json({ status: 'Success', message: result.message });
        } else {
            return res.status(400).json({ status: 'Failure', message: result.message });
        }
    } catch (error) {
        console.error("Route Error - UpdateAssociationUser:", error);
        return res.status(500).json({ status: 'Failure', message: 'Internal Server Error' });
    }
});

//UpdateClientCommission
router.post('/UpdateClientCommission', verifyToken, async (req, res) => {
    try {
        const UpdateClientCommission = await Controller.updateCommission(req);
        if (UpdateClientCommission === true) {
            res.status(200).json({ message: 'Success', data: 'Commission updated successfully' });
        } else {
            console.log('Internal Server Error');
            res.status(500).json({ status: 'Failed', message: "Internal Server Error" });
        }
    } catch (error) {
        console.error('Error in UpdateClientCommission route:', error);
        res.status(500).json({ message: 'Failed to Update Client Commission' });
    }
});

// 5.Manage User
// Route to FetchUser
router.post('/FetchUsers', verifyToken, async (req, res) => {
    try {
        const data = await Controller.FetchUser(req);

        if (!data.success) {
            return res.status(data.status || 400).json({ status: 'Failed', message: data.message});
        }

        return res.status(200).json({
            status: 'Success', data: data.result
        });

    } catch (error) {
        console.error('Error in /FetchUsers route:', error);
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
        console.error('Error in FetchSpecificUserRoleForSelection route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchSpecificUserForCreateSelection ' });
    }
});

// Route to FetchAssociationForSelection 
router.post('/FetchAssociationForSelection', verifyToken, async (req, res) => {
    try {
        const data = await Controller.FetchAssociationForSelection(req);

        if (!data.success) {
            return res.status(data.status || 400).json({
                status: 'Failed',
                message: data.message
            });
        }

        return res.status(200).json({
            status: 'Success',
            data: data.result
        });

    } catch (error) {
        console.error('Error in /FetchAssociationForSelection route:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Failed to fetch association details'
        });
    }
});

// Route to CreateUser
router.post('/CreateUser', verifyToken, async (req, res) => {
    try {
        const result = await Controller.CreateUser(req);

        if (!result.success) {
            return res.status(result.status || 400).json({
                status: 'Failed',
                message: result.message
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'New user created successfully'
        });

    } catch (error) {
        console.error('Route Error in /CreateUser:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Unexpected Server Error'
        });
    }
});

// Route to UpdateUser
router.post('/UpdateUser', verifyToken, async (req, res) => {
    try {
        const result = await Controller.UpdateUser(req);

        if (!result.success) {
            return res.status(result.status || 400).json({
                status: 'Failed',
                message: result.message
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'User updated successfully'
        });

    } catch (error) {
        console.error('Route Error in /UpdateUser:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Unexpected Server Error'
        });
    }
});

// 6.Withdrawal
// Route to save user bank details
router.post('/saveUserBankDetails', async (req, res) => {
    try {
        const result = await Controller.saveUserBankDetails(req);

        if (result.status !== 200 && result.status !== 201) {
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
        console.error('Route Error in /saveUserBankDetails:', error);
        return res.status(500).json({ status: 'Failed', message: 'Unexpected Server Error' });
    }
});

// Route to fetch user bank details
router.post('/fetchUserBankDetails', async (req, res) => {
    try {
        const result = await Controller.fetchUserBankDetails(req);

        if (result.status !== 200) {
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
        console.error('Route Error in /fetchUserBankDetails:', error);
        return res.status(500).json({ status: 'Failed', message: 'Unexpected Server Error' });
    }
});

// Route to update user bank details
router.post('/updateUserBankDetails', async (req, res) => {
    try {
        const result = await Controller.updateUserBankDetails(req);

        if (result.status !== 200) {
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
        console.error('Route Error in /updateUserBankDetails:', error);
        return res.status(500).json({ status: 'Failed', message: 'Unexpected Server Error' });
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

//Route to FetchCommissionAmtClient
router.post('/FetchCommissionAmtClient', async (req, res) => {
    try {
        const result = await Controller.FetchCommissionAmtClient(req);

        if (!result.success) {
            return res.status(result.status || 400).json({
                status: 'Failed',
                message: result.message
            });
        }

        return res.status(200).json({
            status: 'Success',
            data: result.data
        });

    } catch (error) {
        console.error('Error in FetchCommissionAmtClient route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch commission amount' });
    }
});

// 7.Manage Device & Revenue Report
// Route to FetchUnAllocatedCharger 
router.post('/FetchReportDevice', verifyToken, async (req, res) => {
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

        if (result.status !== 200) {
            return res.status(result.status).json({
                status: 'Failed',
                message: result.message
            });
        }

        return res.status(200).json({
            status: 'Success',
            data: result.data
        });

    } catch (error) {
        console.error('Route Error in /DeviceReport:', error);
        return res.status(500).json({ status: 'Failed', message: 'Unexpected Server Error' });
    }
});

// Route to fetch specific charger revenue
router.post('/FetchSpecificChargerRevenue', verifyToken, async (req, res) => {
    try {
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        // Fetch both revenueData and TotalChargerRevenue
        const { revenueData, TotalChargerRevenue } = await Controller.FetchSpecificChargerRevenue(client_id);

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
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(400).json({ status: 'Failed', message: 'client_id is required' });
        }

        // Fetch both revenueData 
        const { revenueData } = await Controller.FetchChargerListWithAllCostWithRevenue(client_id);

        res.status(200).json({
            status: "Success",
            revenueData,
        });

    } catch (error) {
        console.error('Error in FetchChargerListWithAllCostWithRevenue route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger list with all cost with revenue ' });
    }
});

// 8.Profile
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

        if (result.status === 'Failed') {
            return res.status(result.code || 400).json({
                status: 'Failed',
                message: result.message || 'Failed to update user profile'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'User profile updated successfully'
        });

    } catch (error) {
        console.error('Error in /UpdateUserProfile route:', error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
});

// Route to UpdateClientProfile
router.post('/UpdateClientProfile', verifyToken, async (req, res) => {
    try {
        const result = await Controller.UpdateClientProfile(req);

        if (result.status === 'Failed') {
            return res.status(result.code || 400).json({
                status: 'Failed',
                message: result.message || 'Failed to update client profile'
            });
        }

        return res.status(200).json({
            status: 'Success',
            message: 'Client profile updated successfully'
        });

    } catch (error) {
        console.error('Error in /UpdateClientProfile route:', error);
        return res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
});


module.exports = router;
