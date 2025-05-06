const express = require('express');
const router = express.Router();
const Controller = require('../controllers/associationAdminControllers');
const verifyToken = require('../middlewares/authMiddleware');

// 1.Login
// Route to check login credentials
router.post('/CheckLoginCredentials', Controller.authenticate);

// 2.Dashboard
// Route to fetch total chargers for a specific association
router.post('/FetchTotalCharger', verifyToken, Controller.FetchTotalCharger);

// Route to fetch online charger
router.post('/FetchOnlineCharger', verifyToken, Controller.FetchOnlineCharger);

// Route to fetch offline charger
router.post('/FetchOfflineCharger', verifyToken, Controller.FetchOfflineCharger);

// Route to fetch Faulty charger
router.post('/FetchFaultsCharger', verifyToken, Controller.FetchFaultsCharger);

// Route to Fetch Charger Total Energy
router.post('/FetchChargerTotalEnergy', verifyToken, Controller.FetchChargerTotalEnergy);

// Route to Fetch Total Charger Charging Sessions for a Specific association
router.post('/FetchTotalChargersSession', verifyToken, Controller.FetchTotalChargersSession);

// Route to Fetch Total App Users for a Specific association
router.post('/FetchTotalUsers', verifyToken, Controller.FetchTotalUsers);

// 3.Manage Device
// Route to FetchAllocatedChargerByClientToAssociation 
router.post('/FetchAllocatedChargerByClientToAssociation', verifyToken, Controller.FetchAllocatedChargerByClientToAssociation);

// Route to Update Device
router.post('/UpdateDevice', verifyToken, Controller.UpdateDevice);

// Route to DeActivateOrActivate Reseller
router.post('/DeActivateOrActivateCharger', verifyToken, Controller.DeActivateOrActivateCharger);

// Route to assign finance
router.post('/assignFinance', verifyToken, Controller.assignFinance);

// Route to reAssign Finance
router.post('/reAssignFinance', verifyToken, Controller.reAssignFinance);

// Route to Fetch Finance
router.post('/FetchFinance_dropdown', verifyToken, Controller.FetchFinance_dropdown);

// 4.Manage Users
// Route to FetchUser
router.post('/FetchUsers', verifyToken, Controller.FetchUsers);

// Route to UpdateUser
router.post('/UpdateUser', verifyToken, Controller.UpdateUser);

// 5.Manage TagID
//FetchAllTagIDs
router.post('/FetchAllTagIDs', verifyToken, Controller.FetchAllTagIDs);

//CreateTagID
router.post('/CreateTagID', verifyToken, Controller.CreateTagID);

//UpdateTagID
router.post('/UpdateTagID', verifyToken, Controller.UpdateTagID);

//DeactivateTagID
router.post('/DeactivateOrActivateTagID', verifyToken, Controller.DeactivateOrActivateTagID);

// 6.Assign User
//FetchUsersWithSpecificRolesToUnAssign
router.post('/FetchUsersWithSpecificRolesToUnAssign', verifyToken, Controller.FetchUsersWithSpecificRolesToUnAssign);

//AddUserToAssociation
router.post('/AssUserToAssociation', verifyToken, Controller.AddUserToAssociation);

// Route to AssignTagIdToUser
router.post('/AssignTagIdToUser', verifyToken, Controller.AssignTagIdToUser);

//FetchTagIdToAssign
router.post('/FetchTagIdToAssign', verifyToken, Controller.FetchTagIdToAssign);

//RemoveUserFromAssociation
router.post('/RemoveUserFromAssociation', verifyToken, Controller.RemoveUserFromAssociation);

// 7.Manage Finance
// Route to Create Finance
router.post('/CreateFinance', verifyToken, Controller.createFinance);

// Route to Fetch Finance
router.post('/fetchFinance', verifyToken, Controller.fetchFinance);

// Route to Update Finance
router.post('/UpdateFinance', verifyToken, Controller.updateFinance);

// 8.Withdraw
// Route to Fetch Commission Amount Association
router.post('/FetchCommissionAmtAssociation', verifyToken, Controller.FetchCommissionAmtAssociation);

// Route to save user bank details
router.post('/saveUserBankDetails', verifyToken, Controller.saveUserBankDetails);

// Route to fetch user bank details
router.post('/fetchUserBankDetails', verifyToken, Controller.fetchUserBankDetails);

// Route to update user bank details
router.post('/updateUserBankDetails', verifyToken, Controller.updateUserBankDetails);

// Route to Apply Withdrawal
router.post('/ApplyWithdrawal', verifyToken, Controller.ApplyWithdrawal);

// Route to Fetch Payment Request
router.post('/FetchPaymentRequest', verifyToken, Controller.FetchPaymentRequest);

// Route to Fetch Payment Notification
router.post('/FetchPaymentNotification', verifyToken, Controller.FetchPaymentNotification);

// Route to Mark Notification as Read
router.post('/MarkNotificationRead', verifyToken, Controller.MarkNotificationRead);

// 9.Manage Report
// Route to Fetch Report Device
router.post('/FetchReportDevice', verifyToken, Controller.FetchReportDevice);

// Route to download revenue report
router.post('/DeviceReport', verifyToken, Controller.DeviceReport);

// Route to fetch specific charger revenue
router.post('/FetchSpecificChargerRevenue', verifyToken, Controller.FetchSpecificChargerRevenue);

// Route to fetch charger list with all cost with revenue
router.post('/FetchChargerListWithAllCostWithRevenue', verifyToken, Controller.FetchChargerListWithAllCostWithRevenue);

// 10.Profile
// Route to FetchUserProfile 
router.post('/FetchUserProfile', verifyToken, Controller.FetchUserProfile);

// Route to UpdateUserProfile
router.post('/UpdateUserProfile', verifyToken, Controller.UpdateUserProfile);

// Route to UpdateAssociationProfile
router.post('/UpdateAssociationProfile', verifyToken, Controller.UpdateAssociationProfile);

module.exports = router;
