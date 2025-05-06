import React, { useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from '../../roles/associationadmin/page/Login';
import Dashboard from '../../roles/associationadmin/page/Dashboard/Dashboard';
import ManageDevice from '../../roles/associationadmin/page/ManageDevices/ManageDevice';
import ViewManageDevice from '../../roles/associationadmin/page/ManageDevices/ViewManageDevice';
import EditManageDevice from '../../roles/associationadmin/page/ManageDevices/EditManageDevice';
import ManageUsers from '../../roles/associationadmin/page/ManageUser/ManageUsers';
import ViewManageUser from '../../roles/associationadmin/page/ManageUser/ViewManageUser';
import EditManageUsers from '../../roles/associationadmin/page/ManageUser/EditManageUsers';
import AssignTagID from '../../roles/associationadmin/page/ManageUser/AssignTagID';
import ManageTagID from '../../roles/associationadmin/page/ManageTagID/ManageTagID';
import Withdraw from '../../roles/associationadmin/page/Withdraw/Withdraw';
import Profile from '../../roles/associationadmin/page/Profile/Profile';
import Header from '../../roles/associationadmin/components/Header';
import Assignuser from '../../roles/associationadmin/page/Assignuser/Assignuser';
import DeviceReport from '../../roles/associationadmin/page/ManageReport/DeviceReport';
import RevenueReport from '../../roles/associationadmin/page/ManageReport/RevenueReport';

// managefinance
import Managefinance from '../../roles/associationadmin/page/ManageFinance/Managefinance';
import ViewFinance from '../../roles/associationadmin/page/ManageFinance/ViewFinance';
import EditFinance from '../../roles/associationadmin/page/ManageFinance/EditFinance'
import CreateFinance from '../../roles/associationadmin/page/ManageFinance/CreateFinance'

const AssociationAdminApp = () => {
  const storedUser = JSON.parse(sessionStorage.getItem('associationAdminUser'));
  const [loggedIn, setLoggedIn] = useState(!!storedUser);
  const [userInfo, setUserInfo] = useState(storedUser || {});
  const navigate = useNavigate();

  // Handle login
  const handleLogin = (data) => {
    const user = data.user;
    const token = user.token; 
  
    setUserInfo(user);
    setLoggedIn(true);
    sessionStorage.setItem('associationAdminUser', JSON.stringify(user));
    sessionStorage.setItem('associationAdminToken', token);
    navigate('/associationadmin/Dashboard');
  };
  

  // Handle logout
  const handleLogout = () => {
    setLoggedIn(false);
    setUserInfo({});
    sessionStorage.removeItem('associationAdminUser');
    sessionStorage.removeItem('associationAdminToken');

    navigate('/associationadmin');
  };

  return (
    <>
      {loggedIn && <Header userInfo={userInfo} handleLogout={handleLogout} />}
      <Routes>
        <Route
          path="/"
          element={loggedIn ? <Navigate to="/associationadmin/Dashboard" /> : <Login handleLogin={handleLogin} />}
        />
        <Route
          path="/Dashboard"
          element={loggedIn ? (
              <Dashboard userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
              <Navigate to="/associationadmin" />
          )}
        />
        <Route
          path="/ManageDevice"
          element={loggedIn ? (
            <ManageDevice userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/associationadmin" />
          )}
        />
        <Route
          path="/ViewManageDevice"
          element={loggedIn ? (
            <ViewManageDevice userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/associationadmin" />
          )}
        />
        <Route
          path="/EditManageDevice"
          element={loggedIn ? (
            <EditManageDevice userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/associationadmin" />
          )}
        />
        <Route
          path="/ManageUsers"
          element={loggedIn ? (
            <ManageUsers userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/associationadmin" />
          )}
        />
        <Route
          path="/ViewManageUser"
          element={loggedIn ? (
            <ViewManageUser userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/associationadmin" />
          )}
        />
         <Route
          path="/EditManageUsers"
          element={loggedIn ? (
            <EditManageUsers userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/associationadmin" />
          )}
        />
        <Route
          path="/AssignTagID"
          element={loggedIn ? (
            <AssignTagID userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/associationadmin" />
          )}
        />
         <Route
          path="/ManageTagID"
          element={loggedIn ? (
            <ManageTagID userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/associationadmin" />
          )}
        />
        <Route
          path="/Assignuser"
          element={loggedIn ? (
            <Assignuser userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/associationadmin" />
          )}
        />
         {/* Manage Finance */}
         <Route
          path="/Managefinance"
          element={loggedIn ? (
            <Managefinance userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/associationadmin" />
          )}
        />
        <Route
          path="/CreateFinance"
          element={loggedIn ? (
            <CreateFinance userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/associationadmin" />
          )}
        />
              <Route
          path="/ViewFinance"
          element={loggedIn ? (
            <ViewFinance userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/associationadmin" />
          )}
        />
        <Route
          path="/EditFinance"
          element={loggedIn ? (
            <EditFinance userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/associationadmin" />
          )}
        />
         <Route
          path="/Withdraw"
          element={loggedIn ? (
            <Withdraw userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/associationadmin" />
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
          path="/Profile"
          element={loggedIn ? (
            <Profile userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/associationadmin" />
          )}
        />
      </Routes>
    </>
  );
};

export default AssociationAdminApp;
