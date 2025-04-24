const express = require('express');
const router = express.Router();
const Controller = require('../controllers/superAdminControllers');
const verifyToken = require('../middlewares/authMiddleware');
const flatted = require('flatted');

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
                role_id: result.user.role_id
            },
            token: result.user.token
        });

    } catch (error) {
        console.error('Error in CheckLoginCredentials route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to authenticate user' });
    }
});

// 2.Dashboard
// Route to Fetch Total resellers, clients, associatins, appUsers
router.get('/FetchTotalUsers', verifyToken, async (req, res) => {
    try {
        const TotalCounts = await Controller.FetchTotalUsers();

        // If there is any error in fetching total counts, handle it
        if (TotalCounts.error) {
            return res.status(TotalCounts.status).json({ message: TotalCounts.message });
        }

        res.status(200).json({ status: 'Success', TotalCounts });
    } catch (error) {
        console.error('Error in FetchTotalUsers route:', error.message); // Log detailed error message
        res.status(500).json({
            status: 'Failed',
            message: `Failed to fetch total resellers, clients, associations, appUsers`
        }); // Send the detailed error message in the response
    }
});

// Route to fetch total charger
router.get('/FetchTotalCharger', verifyToken, async (req, res) => {
    try {
        const { totalCount, recentChargers } = await Controller.FetchTotalCharger();
        res.status(200).json({ status: 'Success', totalCount, data: recentChargers });
    } catch (error) {
        console.error('Error in FetchTotalCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger details' });
    }
});

// Route to fetch online charger
router.get('/FetchOnlineCharger', verifyToken, async (req, res) => {
    try {
        const { totalCount, onlineChargers, message } = await Controller.FetchOnlineCharger();

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
router.get('/FetchOfflineCharger', verifyToken, async (req, res) => {
    try {
        const { totalCount, offlineChargers } = await Controller.FetchOfflineCharger();

        if (totalCount === 0) {
            return res.status(200).json({ status: 'Success', totalCount, message });
        }

        res.status(200).json({ status: 'Success', totalCount, data: offlineChargers });
    } catch (error) {
        console.error('Error in FetchOfflineCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger details' });
    }
});

// Route to fetch Faults charger
router.get('/FetchFaultsCharger', verifyToken, async (req, res) => {
    try {
        const { totalCount, faultyChargers, message } = await Controller.FetchFaultsCharger();

        if (totalCount === 0) {
            return res.status(200).json({ status: 'Success', totalCount, message: message || "No Fault chargers found" });
        }

        res.status(200).json({ status: 'Success', totalCount, data: faultyChargers });
    } catch (error) {
        console.error('Error in FetchFaultsCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch faulty chargers' });
    }
});

// Route to Fetch Charger Total Energy
router.get('/FetchChargerTotalEnergy', verifyToken, async (req, res) => {
    try {
        const ChargerTotalEnergy = await Controller.FetchChargerTotalEnergy();
        res.status(200).json({ status: 'Success', ChargerTotalEnergy });
    } catch (error) {
        console.error('Error in FetchChargerTotalEnergy route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger total energy' });
    }
});

// Route to fetch total charger session count
router.get('/FetchTotalChargersSession', verifyToken, async (req, res) => {
    try {
        const { totalCount } = await Controller.FetchTotalChargersSession();
        res.status(200).json({ status: 'Success', totalCount });
    } catch (error) {
        console.error('Error in FetchTotalChargersSession route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger session count' });
    }
});

// 3.Manage Device
// Route to Fetch Allocated Chargers
router.get('/FetchAllocatedChargers', verifyToken, async (req, res) => {
    try {
        const chargerdata = await Controller.FetchAllocatedChargers(req);
        if (chargerdata.status === 200) {
            res.status(chargerdata.status).json({ status: 'Success', data: chargerdata.data });
        } else {
            res.status(chargerdata.status).json({ status: 'Failed', message: chargerdata.message });
        }
    } catch (error) {
        console.error('Error in FetchAllocatedChargers route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to  FetchAllocatedChargers' });
    }
});

// Route to FetchCharger 
router.get('/FetchCharger', verifyToken, async (req, res) => {
    try {
        const Chargers = await Controller.FetchCharger();

        const safeChargers = JSON.parse(JSON.stringify(Chargers));

        res.status(200).json({ status: 'Success', data: safeChargers });
    } catch (error) {
        console.error('Error in FetchCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch  charger' });
    }
});

// Route to create a new charger
router.post('/CreateCharger', verifyToken, async (req, res) => {
    try {
        await Controller.CreateCharger(req, res);
    } catch (error) {
        console.error('Error in CreateCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to create charger' });
    }
});

// Route to update a charger
router.post('/UpdateCharger', verifyToken, async (req, res) => {
    try {
        // Call UpdateCharger function with req and res
        await Controller.UpdateCharger(req, res);
    } catch (error) {
        console.error('Error in UpdateCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to update charger' });
    }
});

// Route to FetchUnAllocatedChargerToAssgin 
router.get('/FetchUnAllocatedChargerToAssgin', verifyToken, async (req, res) => {
    try {
        const Chargers = await Controller.FetchUnAllocatedChargerToAssgin(req);

        const safeChargers = JSON.parse(JSON.stringify(Chargers));

        res.status(200).json({ status: 'Success', data: safeChargers });
    } catch (error) {
        console.error('Error in FetchUnAllocatedChargerToAssgin route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchUnAllocatedChargerToAssgin' });
    }
});

// Route to FetchResellersToAssgin
router.get('/FetchResellersToAssgin', verifyToken, async (req, res) => {
    try {
        await Controller.FetchResellersToAssgin(req, res);
    } catch (error) {
        console.error('Error in FetchResellersToAssgin route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchResellersToAssgin' });
    }
});

// Route to AssginChargerToReseller
router.post('/AssginChargerToReseller', verifyToken, async (req, res) => {
    try {
        await Controller.AssignChargerToReseller(req, res);
    } catch (error) {
        console.error('Error in AssginChargerToReseller route:', error);
        res.status(500).json({ message: 'Failed to AssginChargerToReseller' });
    }
});

// Route to fetch connector type name
router.post('/fetchConnectorTypeName', verifyToken, async (req, res) => {
    try {
        const result = await Controller.fetchConnectorTypeName(req);

        if (result.error) {
            return res.status(result.status).json({ message: result.message });
        }

        res.status(200).json({ status: 'Success', data: result.message });
    } catch (error) {
        console.error('Error in fetch connector type name route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch connector type name' });
    }
});

// Route to DeActivateOrActivate Charger
router.post('/DeActivateOrActivateCharger', verifyToken, async (req, res) => {
    try {
        const result = await Controller.DeActivateOrActivateCharger(req);

        if (result.error) {
            return res.status(result.status).json({ message: result.message });
        }

        res.status(200).json({ status: 'Success', message: result.message });
    } catch (error) {
        console.error('Error in DeActivateOrActivateCharger route:', error);
        res.status(500).json({ status: 'Failed', message: 'Internal Server Error' });
    }
});

// 4.Manage Reseller
// Route to FetchResellers
router.get('/FetchResellers', verifyToken, async (req, res) => {
    try {
        await Controller.FetchResellers(req, res);
    } catch (error) {
        console.error('Error in FetchResellers route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch Resellers' });
    }
});

// Route to FetchAssignedClients
router.post('/FetchAssignedClients', verifyToken, async (req, res) => {
    try {
        await Controller.FetchAssignedClients(req, res);
    } catch (error) {
        console.error('Error in FetchAssignedClients route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchAssignedClients' });
    }
});

// Route to FetchChargerDetailsWithSession
router.post('/FetchChargerDetailsWithSession', verifyToken, async (req, res) => {
    try {
        const ChargersWithSession = await Controller.FetchChargerDetailsWithSession(req);

        // Filter out any circular references
        const Chargers = flatted.parse(flatted.stringify(ChargersWithSession));

        res.status(200).json({ status: 'Success', data: Chargers });
    } catch (error) {
        console.error('Error in FetchChargerDetailsWithSession route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchChargerDetailsWithSession' });
    }
});

// Route to create a new reseller
router.post('/CreateReseller', verifyToken, async (req, res) => {
    try {
        const result = await Controller.CreateReseller(req);

        res.status(result.status).json({
            status: result.success ? 'Success' : 'Failed',
            message: result.message
        });

    } catch (error) {
        console.error('Error in createReseller route:', error);
        res.status(500).json({
            status: 'Failed',
            message: 'Unexpected error occurred while creating reseller'
        });
    }
});

// Route to update reseller
router.post('/UpdateReseller', verifyToken, async (req, res) => {
    try {
        await Controller.UpdateReseller(req, res);
    } catch (error) {
        console.error('Error in UpdateReseller route:', error);
        res.status(500).json({ message: 'Failed to update reseller' });
    }
});

// 5.Manage User
// Route to FetchUser 
router.get('/FetchUsers', verifyToken, async (req, res) => {
    try {
        // Call FetchUser function to get users data
        const user = await Controller.FetchUser();
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
        console.error('Error in FetchSpecificUserRoleForSelection route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchSpecificUserRoleForSelection ' });
    }
});

// Route to FetchResellerForSelection 
router.get('/FetchResellerForSelection', verifyToken, async (req, res) => {
    try {
        // Call FetchUser function to get users data
        const user = await Controller.FetchResellerForSelection(req, res);
        // Send response with users data
        res.status(200).json({ status: 'Success', data: user });

    } catch (error) {
        console.error('Error in FetchResellerForSelection route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchResellerForSelection ' });
    }
});

// Route to CreateUser
router.post('/CreateUser', verifyToken, async (req, res) => {
    try {
        const result = await Controller.CreateUser(req);

        if (!result.success) {
            return res.status(400).json({ status: 'Failed', message: result.message });
        }

        return res.status(200).json({ status: 'Success', message: 'New user created successfully' });

    } catch (error) {
        console.error('Error in CreateUser route:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error while creating user'
        });
    }
});

// Route to UpdateUser
router.post('/UpdateUser', verifyToken, async (req, res) => {
    try {
        const result = await Controller.UpdateUser(req);

        if (!result.success) {
            return res.status(400).json({ status: 'Failed', message: result.message });
        }

        return res.status(200).json({ status: 'Success', message: result.message });

    } catch (error) {
        console.error('Error in UpdateUser route:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error while updating user'
        });
    }
});

// 6.Manage User Role
// Route to FetchUserRole
router.get('/FetchUserRoles', verifyToken, async (req, res) => {
    try {
        // Call FetchUserRole function to get users data
        const user_roles = await Controller.FetchUserRole();
        // Send response with users data
        res.status(200).json({ status: 'Success', data: user_roles });

    } catch (error) {
        console.error('Error in FetchUserRole route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch user roles' });
    }
});

// Route to CreateUserRole
router.post('/CreateUserRole', verifyToken, async (req, res) => {
    try {
        const result = await Controller.CreateUserRole(req);

        if (!result.success) {
            return res.status(400).json({ status: 'Failed', message: result.message });
        }

        return res.status(200).json({ status: 'Success', message: result.message });
    } catch (error) {
        console.error('Error in CreateUserRole route:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error while creating user role'
        });
    }
});

// Route to UpdateUserRole
router.post('/UpdateUserRole', verifyToken, async (req, res) => {
    try {
        const result = await Controller.UpdateUserRole(req);

        if (!result.success) {
            return res.status(400).json({ status: 'Failed', message: result.message });
        }

        return res.status(200).json({ status: 'Success', message: result.message });

    } catch (error) {
        console.error('Error in user role update route:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error while updating user role'
        });
    }
});

// Route to DeActivateOrActivateUserRole
router.post('/DeActivateOrActivateUserRole', verifyToken, async (req, res) => {
    try {
        const result = await Controller.DeActivateOrActivateUserRole(req);

        if (!result.success) {
            return res.status(400).json({ status: 'Failed', message: result.message });
        }

        return res.status(200).json({ status: 'Success', message: result.message });

    } catch (error) {
        console.error('Error in DeActivateOrActivateUserRole route:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal Server Error while updating user role status'
        });
    }
});

// 7.Output Type Config
// Route to fetch output type config
router.post('/fetchAllOutputType', verifyToken, async (req, res) => {
    try {
        const result = await Controller.fetchOutputType();

        if (result.error) {
            return res.status(result.status).json({ message: result.message });
        }

        res.status(200).json({ status: 'Success', data: result.message });
    } catch (error) {
        console.error('Error in fetch all output type details route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch output type details' });
    }
});

// Route to fetch specifc output type config
router.post('/fetchSpecificOutputType', verifyToken, async (req, res) => {
    try {
        const result = await Controller.fetchOutputType(req);

        if (result.error) {
            return res.status(result.status).json({ status: 'Failed', message: result.message });
        }

        res.status(200).json({ status: 'Success', data: result.message });
    } catch (error) {
        console.error('Error in fetch specific output type route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch output type details' });
    }
});

// Route to fetch specifc output type config
router.post('/updateOutputType', verifyToken, async (req, res) => {
    try {
        const result = await Controller.updateOutputType(req);

        if (result.error) {
            return res.status(result.status).json({ message: result.message });
        }

        res.status(200).json({ status: 'Success', data: result.message });
    } catch (error) {
        console.error('Error in update output type route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to update type details' });
    }
});

// Route to de activate output type config
router.post('/DeActivateOutputType', verifyToken, async (req, res) => {
    try {
        const result = await Controller.DeActivateOutputType(req);

        if (result.error) {
            return res.status(result.status).json({ message: result.message });
        }

        res.status(200).json({ status: 'Success', data: result.message });
    } catch (error) {
        console.error('Error in De-activate output type route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to De-activate output details' });
    }
});

// Route to create output type config
router.post('/createOutputType', verifyToken, async (req, res) => {
    try {
        const result = await Controller.createOutputType(req);

        if (result.error) {
            return res.status(result.status).json({ message: result.message });
        }

        res.status(200).json({ status: 'Success', data: result.message });
    } catch (error) {
        console.error('Error in create output type route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to create output details' });
    }
});

// 8.Withdrawal
// Route to fetch payment request details
router.get('/FetchPaymentRequest', verifyToken, async (req, res) => {
    try {
        const result = await Controller.FetchPaymentRequest();
        res.status(200).json({ status: 'Success', data: result });
    } catch (error) {
        console.error('Error in FetchPaymentRequest route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch payment request' });
    }
});

// Route to update payment request status 
router.post('/UpdatePaymentRequestStatus', verifyToken, async (req, res) => {
    console.log(req.body);
    try {
        const { _id, user_id, withdrawal_approved_status, withdrawal_approved_by, withdrawal_rejected_message } = req.body;

        if (!_id || !user_id || !withdrawal_approved_status || !withdrawal_approved_by) {
            return res.status(400).json({ status: 'Failed', message: 'Missing required fields' });
        }

        const result = await Controller.UpdatePaymentRequestStatus(_id, user_id, withdrawal_approved_status, withdrawal_approved_by, withdrawal_rejected_message);

        return res.status(result.status === 'Success' ? 200 : 400).json(result);

    } catch (error) {
        console.error('Error in UpdatePaymentRequestStatus route:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to update payment request status' });
    }
});

// Route to fetch payment notification
router.get('/FetchPaymentNotification', verifyToken, async (req, res) => {
    try {
        const result = await Controller.FetchPaymentNotification();
        res.status(200).json({ status: 'Success', data: result });
    } catch (error) {
        console.error('Error in FetchPaymentNotification route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch payment notification request' });
    }
});

// Route to mark notification read
router.post('/MarkNotificationRead', verifyToken, async (req, res) => {
    try {
        const { _id, superadmin_notification_status } = req.body;

        if (!_id || !superadmin_notification_status) {
            return res.status(400).json({ status: 'Failed', message: 'Missing required fields' });
        }

        const result = await Controller.MarkNotificationRead(_id, superadmin_notification_status);

        return res.status(result.status === 'Success' ? 200 : 400).json(result);

    } catch (error) {
        console.error('Error in MarkNotificationRead route:', error);
        return res.status(500).json({ status: 'Failed', message: 'Failed to mark notification read' });
    }
});


// 9.Manage Device & Revenue Report
// Route to fetch specific charger revenue list
router.get('/FetchSpecificChargerRevenue', verifyToken, async (req, res) => {
    try {
        const { revenueData } = await Controller.FetchSpecificChargerRevenue();
        res.status(200).json({ status: 'Success', revenueData });
    } catch (error) {
        console.error('Error in fetch specific charger revenue route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch specific charger revenue ' });
    }
});

// Route to fetch charger list with all cost with revenue
router.get('/FetchChargerListWithAllCostWithRevenue', verifyToken, async (req, res) => {
    try {
        const { revenueData } = await Controller.FetchChargerListWithAllCostWithRevenue();
        res.status(200).json({ status: 'Success', revenueData });
    } catch (error) {
        console.error('Error in fetch charger list with all cost with revenue route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to fetch charger list with all cost with revenue ' });
    }
});

// Route to FetchCharger 
router.get('/FetchReportDevice', verifyToken, async (req, res) => {
    try {
        const Chargers = await Controller.FetchReportDevice();

        const safeChargers = JSON.parse(JSON.stringify(Chargers));

        res.status(200).json({ status: 'Success', data: safeChargers });
    } catch (error) {
        console.error('Error in FetchReportDevice route:', error);
        res.status(500).json({ status: 'Failed', message: 'Failed to FetchReportDevice' });
    }
});

// Route to revenue report
router.post('/DeviceReport', verifyToken, async (req, res) => {
    try {
        const result = await Controller.DeviceReport(req.body);
        return res.status(result.status).json(result.data);
    } catch (error) {
        console.error('Unhandled error in /DeviceReport route:', error);
        return res.status(500).json({ message: 'Unexpected Server Error' });
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

// Route to update user profile
router.post('/UpdateUserProfile', async (req, res) => {
    try {
        const result = await Controller.UpdateUserProfile(req);

        if (result.status === 200) {
            return res.status(200).json({ status: 'Success', message: result.message, data: result.data });
        } else {
            return res.status(result.status).json({ status: 'Failed', message: result.message });
        }
    } catch (error) {
        console.error('Error in /UpdateUserProfile route:', error);
        return res.status(500).json({ status: 'Failed', message: 'Unexpected error occurred' });
    }
});

// 11.OCCP Config

module.exports = router;
