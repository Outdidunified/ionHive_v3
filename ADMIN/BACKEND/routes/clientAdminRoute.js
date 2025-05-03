const express = require('express');
const router = express.Router();
const Controller = require('../controllers/clientAdminControllers');
const verifyToken = require('../middlewares/authMiddleware');

// 1.Login
// Route to check login credentials
router.post('/CheckLoginCredentials', Controller.authenticate);

// 2.Dashboard
// Route to fetch total chargers for a specific client
router.post('/FetchTotalCharger', verifyToken, Controller.FetchTotalCharger);

// Route to fetch online charger
router.post('/FetchOnlineCharger', verifyToken, Controller.FetchOnlineCharger);

// Route to fetch offline charger
router.post('/FetchOfflineCharger', verifyToken, Controller.FetchOfflineCharger);

// Route to fetch Faults charger
router.post('/FetchFaultsCharger', verifyToken, Controller.FetchFaultsCharger);

// Route to Fetch Charger Total Energy
router.post('/FetchChargerTotalEnergy', verifyToken, Controller.FetchChargerTotalEnergy);

// Route to Fetch Total Charger Charging Sessions for a Specific Reseller
router.post('/FetchTotalChargersSession', verifyToken, Controller.FetchTotalChargersSession);

// Route to Fetch Total Associations, and App Users for a Specific Reseller
router.post('/FetchTotalUsers', verifyToken, Controller.FetchTotalUsers);

// 3.Manage Device
// Route to FetchAllocatedCharger 
router.post('/FetchAllocatedCharger', verifyToken, Controller.FetchAllocatedCharger);

// Route to DeActivateOrActivate Charger
router.post('/DeActivateOrActivateCharger', verifyToken, Controller.DeActivateOrActivateCharger);

// Route to FetchUnAllocatedCharger
router.post('/FetchUnAllocatedCharger', verifyToken, Controller.FetchUnAllocatedCharger);

// Route to FetchAssociationUserToAssginCharger
router.post('/FetchAssociationUserToAssginCharger', verifyToken, Controller.FetchAssociationUserToAssginCharger);

// Route to FetchUnAllocatedChargerToAssgin
router.post('/FetchUnAllocatedChargerToAssgin', verifyToken, Controller.FetchUnAllocatedChargerToAssgin);

// Route to AssignChargerToAssociation
router.post('/AssginChargerToAssociation', verifyToken, Controller.AssginChargerToAssociation);

// 4.Manage Association
// Route to FetchAssociationUser 
router.post('/FetchAssociationUser', verifyToken, Controller.FetchAssociationUser);

// Route to FetchChargerDetailsWithSession
router.post('/FetchChargerDetailsWithSession', verifyToken, Controller.FetchChargerDetailsWithSession);

// Route to CreateAssociationUser
router.post('/CreateAssociationUser', verifyToken, Controller.CreateAssociationUser);

// Route to UpdateAssociationUser 
router.post('/UpdateAssociationUser', verifyToken, Controller.UpdateAssociationUser);

// Route to UpdateClientCommission
router.post('/UpdateClientCommission', verifyToken, Controller.UpdateClientCommission);

// 5.Manage User
// Route to FetchUsers
router.post('/FetchUsers', verifyToken, Controller.FetchUsers);

// Route to FetchSpecificUserRoleForSelection
router.get('/FetchSpecificUserRoleForSelection', verifyToken, Controller.FetchSpecificUserRoleForSelection);

// Route to FetchAssociationForSelection
router.post('/FetchAssociationForSelection', verifyToken, Controller.FetchAssociationForSelection);

// Route to CreateUser
router.post('/CreateUser', verifyToken, Controller.CreateUser);

// Route to UpdateUser
router.post('/UpdateUser', verifyToken, Controller.UpdateUser);

// 6.Withdrawal
// Route to save user bank details
router.post('/saveUserBankDetails', verifyToken, Controller.saveUserBankDetails);

// Route to fetch user bank details
router.post('/fetchUserBankDetails', verifyToken, Controller.fetchUserBankDetails);

// Route to update user bank details
router.post('/updateUserBankDetails', verifyToken, Controller.updateUserBankDetails);

// Route to ApplyWithdrawal
router.post('/ApplyWithdrawal', verifyToken, Controller.ApplyWithdrawal);

// Route to Fetch payment request details
router.post('/FetchPaymentRequest', verifyToken, Controller.FetchPaymentRequest);

// Route to fetch payment notification
router.post('/FetchPaymentNotification', verifyToken, Controller.FetchPaymentNotification);

// Route to mark notification read
router.post('/MarkNotificationRead', verifyToken, Controller.MarkNotificationRead);

//Route to FetchCommissionAmtClient
router.post('/FetchCommissionAmtClient', verifyToken, Controller.FetchCommissionAmtClient);

// 7.Manage Device & Revenue Report
// Route to FetchUnAllocatedCharger 
router.post('/FetchReportDevice', verifyToken, Controller.FetchReportDevice);

// Route to download revenue report
router.post('/DeviceReport', verifyToken, Controller.DeviceReport);

// Route to fetch specific charger revenue
router.post('/FetchSpecificChargerRevenue', verifyToken, Controller.FetchSpecificChargerRevenue);

// Route to fetch charger list with all cost with revenue
router.post('/FetchChargerListWithAllCostWithRevenue', verifyToken, Controller.FetchChargerListWithAllCostWithRevenue);

// 8.Profile
// Route to fetch user profile
router.post('/FetchUserProfile', verifyToken, Controller.FetchUserProfile);

// Route to update user profile
router.post('/UpdateUserProfile', verifyToken, Controller.UpdateUserProfile);

// Route to update client profile
router.post('/UpdateClientProfile', verifyToken, Controller.UpdateClientProfile);

module.exports = router;
