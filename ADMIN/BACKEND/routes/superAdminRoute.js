const express = require('express');
const router = express.Router();
const Controller = require('../controllers/superAdminControllers');
const verifyToken = require('../middlewares/authMiddleware');
const flatted = require('flatted');
const { ObjectId } = require('mongodb');
const multer=require('../middlewares/upload');
const upload = require('../middlewares/upload');

// 1.Login
// Route to check login credentials
router.post('/CheckLoginCredentials', Controller.authenticate);

// 2.Dashboard
// Route to fetch total resellers, clients, associations, and app users
router.get('/FetchTotalUsers', verifyToken, Controller.FetchTotalUsers);

// Route to fetch total charger
router.get('/FetchTotalCharger', verifyToken, Controller.FetchTotalCharger);

// Route to fetch online charger
router.get('/FetchOnlineCharger', verifyToken, Controller.FetchOnlineCharger);

// Route to fetch offline charger
router.get('/FetchOfflineCharger', verifyToken, Controller.FetchOfflineCharger);

// Route to fetch faulty chargers
router.get('/FetchFaultsCharger', verifyToken, Controller.FetchFaultsCharger);

// Route to fetch Charger Total Energy
router.get('/FetchChargerTotalEnergy', verifyToken, Controller.FetchChargerTotalEnergy);

// Route to fetch total charger session count
router.get('/FetchTotalChargersSession', verifyToken, Controller.FetchTotalChargersSession);

// 3.Manage Device
// Route to fetch allocated chargers
router.get('/FetchAllocatedChargers', verifyToken, Controller.FetchAllocatedChargers);

// Route to FetchCharger 
router.get('/FetchCharger', verifyToken, Controller.FetchCharger);

// Route to create a new charger
router.post('/CreateCharger', verifyToken, Controller.CreateCharger);

// Route to update a charger
router.post('/UpdateCharger', verifyToken, Controller.UpdateCharger);

// Route to FetchUnAllocatedChargerToAssgin 
router.get('/FetchUnAllocatedChargerToAssgin', verifyToken, Controller.FetchUnAllocatedChargerToAssgin);

// Fetch Resellers To Assign
router.get('/FetchResellersToAssgin', verifyToken, Controller.FetchResellersToAssgin);

// Route to AssginChargerToReseller
router.post('/AssginChargerToReseller', verifyToken, Controller.AssginChargerToReseller);

// Route to fetch connector type name
router.post('/fetchConnectorTypeName', verifyToken, Controller.fetchConnectorTypeName);

// Route to DeActivateOrActivate Charger
router.post('/DeActivateOrActivateCharger', verifyToken, Controller.DeActivateOrActivateCharger);

// 4.Manage Reseller
// Route to FetchResellers
router.get('/FetchResellers', verifyToken, Controller.FetchResellers);

// Route to FetchAssignedClients
router.post('/FetchAssignedClients', verifyToken, Controller.FetchAssignedClients);

// Route to FetchChargerDetailsWithSession
router.post('/FetchChargerDetailsWithSession', verifyToken, Controller.FetchChargerDetailsWithSession);

// Route to create a new reseller
router.post('/CreateReseller', verifyToken, Controller.CreateReseller);

// Route to update reseller
router.post('/UpdateReseller', verifyToken, Controller.UpdateReseller);

// 5.Manage User
// Route to fetch users
router.get('/FetchUsers', verifyToken, Controller.FetchUsers); 

// Route to FetchSpecificUserRoleForSelection
router.get('/FetchSpecificUserRoleForSelection', verifyToken, Controller.FetchSpecificUserRoleForSelection); 

// Route to FetchResellerForSelection
router.get('/FetchResellerForSelection', verifyToken, Controller.FetchResellerForSelection);

// Route to CreateUser
router.post('/CreateUser', verifyToken, Controller.CreateUser);

// Route to UpdateUser
router.post('/UpdateUser', verifyToken, Controller.UpdateUser);

// 6.Manage User Role
router.get('/FetchUserRoles', verifyToken, Controller.FetchUserRoles);

// Route to CreateUserRole
router.post('/CreateUserRole', verifyToken, Controller.CreateUserRole);

// Route to UpdateUserRole
router.post('/UpdateUserRole', verifyToken, Controller.UpdateUserRole);

// Route to DeActivateOrActivateUserRole
router.post('/DeActivateOrActivateUserRole', verifyToken, Controller.DeActivateOrActivateUserRole);

// 7.Output Type Config
// Route to fetch output type config
router.post('/fetchAllOutputType', verifyToken, Controller.fetchAllOutputType);

// Route to fetch specifc output type config
router.post('/fetchSpecificOutputType', verifyToken, Controller.fetchAllOutputType);

// Route to create output type config
router.post('/createOutputType', verifyToken, Controller.createOutputType);

// Route to fetch specifc output type config
router.post('/updateOutputType', verifyToken, Controller.updateOutputType);

// Route to de activate output type config
router.post('/DeActivateOutputType', verifyToken, Controller.DeActivateOutputType);

// 8.Withdrawal
// Route to fetch payment request details
router.get('/FetchPaymentRequest', verifyToken, Controller.FetchPaymentRequest);

// Route to update payment request status
router.post('/UpdatePaymentRequestStatus', verifyToken, Controller.UpdatePaymentRequestStatus);

// Route to fetch payment notification
router.get('/FetchPaymentNotification', verifyToken, Controller.FetchPaymentNotification); 

// Route to mark notification read
router.post('/MarkNotificationRead', verifyToken, Controller.MarkNotificationRead);

// 9.Manage Device & Revenue Report
// Route to fetch specific charger revenue list
router.get('/FetchSpecificChargerRevenue', verifyToken, Controller.FetchSpecificChargerRevenue);

// Route to fetch charger list with all cost with revenue
router.get('/FetchChargerListWithAllCostWithRevenue', verifyToken, Controller.FetchChargerListWithAllCostWithRevenue);

// Route to FetchCharger 
router.get('/FetchReportDevice', verifyToken, Controller.FetchReportDevice);

// Route to revenue report
router.post('/DeviceReport', verifyToken, Controller.DeviceReport);

// 10.Profile
// Route to FetchUserProfile 
router.post('/FetchUserProfile', verifyToken, Controller.FetchUserProfile);

// Route to update user profile
router.post('/UpdateUserProfile', verifyToken, Controller.UpdateUserProfile);


//10. Vehicle Models
//Route to Add Vehicle Model
router.post('/AddVehicle',upload.single('vehicle_image'),verifyToken,Controller.CreateVehicleModel);

//Route to Fetchvehiclemodel
router.get('/GetVehiclemodels',verifyToken,Controller.GetAllVehicleModels);

//Route to UpdateVehicleModel
router.post('/UpdateVehicle',upload.single('vehicle_image'),verifyToken,Controller.UpdateVehicleModel);

//Route to Active/DeactiveModel

router.post('/ActiveorDeactive',verifyToken,Controller.UpdateVehicleModelStatus);
module.exports = router;
