const express = require('express');
const router = express.Router();
const Controller = require('../controllers/resellerAdminControllers');
const verifyToken = require('../middlewares/authMiddleware');

// 1.Login
// Route to check login credentials
router.post('/CheckLoginCredentials', Controller.authenticate);

// 2.Dashboard
// Route to Fetch Total Clients, Associations, and App Users for a Specific Reseller
router.post('/FetchTotalUsers', verifyToken, Controller.FetchTotalUsers);

// Route to fetch total chargers for a specific reseller
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

// 3.Manage Device
// Route to FetchUnAllocatedCharger 
router.post('/FetchUnAllocatedCharger', verifyToken, Controller.FetchUnAllocatedCharger);

// Route to FetchAllocatedCharger 
router.post('/FetchAllocatedCharger', verifyToken, Controller.FetchAllocatedCharger);

// Route to DeActivateOrActivate Reseller
router.post('/DeActivateOrActivateCharger', verifyToken, Controller.DeActivateOrActivateCharger);

// Route to FetchClientUserToAssginCharger
router.post('/FetchClientUserToAssginCharger', verifyToken, Controller.FetchClientUserToAssginCharger);

// Route to FetchUnAllocatedChargerToAssgin 
router.post('/FetchUnAllocatedChargerToAssgin', verifyToken, Controller.FetchUnAllocatedChargerToAssgin);

// Route to AssginChargerToClient
router.post('/AssginChargerToClient', verifyToken, Controller.AssginChargerToClient);

// 4.Manage Client
// Route to FetchClients
router.post('/getAllClients', verifyToken, Controller.getAllClients);

// Route to FetchAssignedAssociation
router.post('/FetchAssignedAssociation', verifyToken, Controller.FetchAssignedAssociation);

// Route to FetchChargerDetailsWithSession
router.post('/FetchChargerDetailsWithSession', verifyToken, Controller.FetchChargerDetailsWithSession);

// add new client
router.post('/addNewClient', verifyToken, Controller.addNewClient);

// Route to update
router.post('/updateClient', verifyToken, Controller.updateClient);

// Route to update commission
router.post('/UpdateResellerCommission', verifyToken, Controller.updateCommission);

// Route to DeActivate or Activate Client
router.post('/DeActivateClient', verifyToken, Controller.DeActivateClient);

// 5.Manage User
// Route to FetchUser
router.post('/FetchUsers', verifyToken, Controller.FetchUsers);

// Route to FetchSpecificUserRoleForSelection 
router.get('/FetchSpecificUserRoleForSelection', verifyToken, Controller.FetchSpecificUserRoleForSelection);

// Route to FetchClientForSelection 
router.post('/FetchClientForSelection', verifyToken, Controller.FetchClientForSelection);

// Route to CreateUser
router.post('/CreateUser', verifyToken, Controller.CreateUser);

// Route to UpdateUser
router.post('/UpdateUser', verifyToken, Controller.UpdateUser);

// 6.Withdrawal
//Route to FetchCommissionAmtReseller
router.post('/FetchCommissionAmtReseller', verifyToken, Controller.FetchCommissionAmtReseller);

// Route to save bank details
router.post('/saveUserBankDetails', verifyToken, Controller.saveUserBankDetails);

// Route to fetch user bank details
router.post('/fetchUserBankDetails', verifyToken, Controller.fetchUserBankDetails);

// Route to update user bank details
router.post('/updateUserBankDetails', verifyToken, Controller.updateUserBankDetails);

// Route to ApplyWithdrawal// Define the route after the function
router.post('/ApplyWithdrawal', verifyToken, Controller.ApplyWithdrawal);

// Route to Fetch payment request details
router.post('/FetchPaymentRequest', verifyToken, Controller.FetchPaymentRequest);

// Route to fetch payment notification
router.post('/FetchPaymentNotification', verifyToken, Controller.FetchPaymentNotification);

// Route to mark notification read
router.post('/MarkNotificationRead', verifyToken, Controller.MarkNotificationRead);

// 7.Manage Device & Revenue Report Controller
// Route to FetchReportDevice 
router.post('/FetchReportDevice', verifyToken, Controller.FetchReportDevice);

// Route to download revenue report
router.post('/DeviceReport', verifyToken, Controller.DeviceReport);

// Route to fetch specific charger revenue
router.post('/FetchSpecificChargerRevenue', verifyToken, Controller.FetchSpecificChargerRevenue);

// Route to fetch charger list with all cost with revenue
router.post('/FetchChargerListWithAllCostWithRevenue', verifyToken, Controller.FetchChargerListWithAllCostWithRevenue);

// 8.Profile Controller
// Route to FetchUserProfile 
router.post('/FetchUserProfile', verifyToken, Controller.FetchUserProfile);

// Route to UpdateUserProfile 
router.post('/UpdateUserProfile', verifyToken, Controller.UpdateUserProfile);

// Route to UpdateResellerProfile 
router.post('/UpdateResellerProfile', verifyToken, Controller.UpdateResellerProfile);


module.exports = router;
