import React, { useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from '../../roles/superadmin/pages/Login';
import Dashboard from '../../roles/superadmin/pages/Dashboard'
import ManageDevice from '../../roles/superadmin/pages/ManageDevices/ManageDevice';
import AddManageDevice from '../../roles/superadmin/pages/ManageDevices/AddManageDevice';
import ViewManageDevice from '../../roles/superadmin/pages/ManageDevices/ViewManageDevice';
import EditManageDevice from '../../roles/superadmin/pages/ManageDevices/EditManageDevice';
import AssignReseller from '../../roles/superadmin/pages/ManageDevices/AssignReseller';
import ManageReseller from '../../roles/superadmin/pages/ManageResellers/ManageReseller';
import AddManageReseller from '../../roles/superadmin/pages/ManageResellers/AddManageReseller';
import ViewManageReseller from '../../roles/superadmin/pages/ManageResellers/ViewManageReseller';
import EditManageReseller from '../../roles/superadmin/pages/ManageResellers/EditManageReseller';
import AssignClient from '../../roles/superadmin/pages/ManageResellers/AssignClient';
import AssignCharger from '../../roles/superadmin/pages/ManageResellers/AssignCharger';
import SessignHistory from '../../roles/superadmin/pages/ManageResellers/SessignHistory';
import ManageUserRole from '../../roles/superadmin/pages/ManageUserRoles/ManageUserRole';
import ManageUsers from '../../roles/superadmin/pages/ManageUsers/ManageUsers';
import ViewUserList from '../../roles/superadmin/pages/ManageUsers/ViewUserList';
import EditUserList from '../../roles/superadmin/pages/ManageUsers/EditUserList';
import OutputTypeConfig from '../../roles/superadmin/pages/OutputTypeConfig/OutputTypeConfig';
import Profile from '../../roles/superadmin/pages/Profile/Profile';
import OcppConfig from '../../roles/superadmin/pages/Occp/OcppConfig';
import OcppConfigLog from '../../roles/superadmin/pages/Occp/OcppConfigLog';
import DeviceReport from '../../roles/superadmin/pages/ManageReport/DeviceReport';
import RevenueReport from '../../roles/superadmin/pages/ManageReport/RevenueReport';
import Header  from '../../roles/superadmin/components/Header';
import Allocateddevice from '../../roles/superadmin/pages/ManageDevices/Allocateddevice';
import ViewAlloc from '../../roles/superadmin/pages/ManageDevices/ViewAlloc'; 
import EditAllocatedDevice from '../../roles/superadmin/pages/ManageDevices/EditAllocManageDevice';
import Withdraw from '../../roles/superadmin/pages/Withdraw/Withdraw';

const SuperAdminApp = () => {
  const storedUser = JSON.parse(sessionStorage.getItem('superAdminUser'));
  const [loggedIn, setLoggedIn] = useState(!!storedUser);
  const [userInfo, setUserInfo] = useState(storedUser || {});
  const navigate = useNavigate();

  const handleLogin = (data) => {
    const { token, user } = data;
    setUserInfo(user);
    setLoggedIn(true);
    sessionStorage.setItem('superAdminUser', JSON.stringify(user));
    sessionStorage.setItem('superAdminToken', token); // Store token
    navigate('/superadmin/Dashboard');
  };
  

  // Handle logout
  const handleLogout = () => {
    setLoggedIn(false);
    setUserInfo({});
    sessionStorage.removeItem('superAdminUser');
    sessionStorage.removeItem('superAdminToken');
    navigate('/superadmin');
  };

  return (
    <>
      {loggedIn && <Header userInfo={userInfo} handleLogout={handleLogout} />}
      <Routes>
        <Route
          path="/"
          element={loggedIn ? <Navigate to="/superadmin/Dashboard" /> : <Login handleLogin={handleLogin} />}
        />
        <Route
          path="Dashboard"
          element={loggedIn ? (
            <Dashboard userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
       <Route
    path="ManageDevice"
    element={loggedIn ? <ManageDevice userInfo={userInfo} handleLogout={handleLogout} /> : <Navigate to="/superadmin" />}
  />
  <Route path="AddManageDevice" element={loggedIn ? <AddManageDevice userInfo={userInfo} handleLogout={handleLogout} /> : <Navigate to="/superadmin" />} />

  <Route path="ViewManageDevice" element={loggedIn ? <ViewManageDevice userInfo={userInfo} handleLogout={handleLogout} /> : <Navigate to="/superadmin" />} />

  <Route
    path="ManageDevice/EditManageDevice"
    element={loggedIn ? <EditManageDevice userInfo={userInfo} handleLogout={handleLogout} /> : <Navigate to="/superadmin" />}
  />
  <Route
    path="ManageDevice/AssignReseller"
    element={loggedIn ? <AssignReseller userInfo={userInfo} handleLogout={handleLogout} /> : <Navigate to="/superadmin" />}
  />

  {/* Unallocated Devices */}
  <Route
    path="/Allocateddevice"
    element={loggedIn ? <Allocateddevice userInfo={userInfo} handleLogout={handleLogout} /> : <Navigate to="/superadmin" />}
  />

  {/* Allocated Devices */}
  <Route
    path="/ViewAllocated"
    element={loggedIn ? <ViewAlloc userInfo={userInfo} handleLogout={handleLogout} /> : <Navigate to="/superadmin" />}
  />

<Route
    path="/EditAllocatedDevice"
    element={loggedIn ? <EditAllocatedDevice userInfo={userInfo} handleLogout={handleLogout} /> : <Navigate to="/superadmin" />}
  />
        
        <Route
  path="Withdrawal"
  element={loggedIn ? (
    <Withdraw userInfo={userInfo} handleLogout={handleLogout} />
  ) : (
    <Navigate to="/superadmin" />
  )}
/>
    <Route
          path="EditManageDevice"
          element={loggedIn ? (
            <EditManageDevice userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="AssignReseller"
          element={loggedIn ? (
            <AssignReseller userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="ManageReseller"
          element={loggedIn ? (
            <ManageReseller userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="AddManageReseller"
          element={loggedIn ? (
            <AddManageReseller userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="ViewManageReseller"
          element={loggedIn ? (
            <ViewManageReseller userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="EditManageReseller"
          element={loggedIn ? (
            <EditManageReseller userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="AssignClient"
          element={loggedIn ? (
            <AssignClient userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="AssignCharger"
          element={loggedIn ? (
            <AssignCharger userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="SessignHistory"
          element={loggedIn ? (
            <SessignHistory userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="ManageUsers"
          element={loggedIn ? (
            <ManageUsers userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="ViewUserList"
          element={loggedIn ? (
            <ViewUserList userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="EditUserList"
          element={loggedIn ? (
            <EditUserList userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="ManageUserRole"
          element={loggedIn ? (
            <ManageUserRole userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="OutputTypeConfig"
          element={loggedIn ? (
            <OutputTypeConfig userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="OcppConfig"
          element={loggedIn ? (
            <OcppConfig userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route path="OcppConfigLog" element={loggedIn ? (
            <OcppConfigLog userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="DeviceReport"
          element={loggedIn ? (
            <DeviceReport userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route path="RevenueReport" element={loggedIn ? (
            <RevenueReport userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
        <Route
          path="Profile"
          element={loggedIn ? (
            <Profile userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/superadmin" />
          )}
        />
      </Routes>
    </>
  );
};

export default SuperAdminApp;
