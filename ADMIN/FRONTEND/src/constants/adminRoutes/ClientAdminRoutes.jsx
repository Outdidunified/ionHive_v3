import React, { useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from '../../roles/clientadmin/page/Login';
import Dashboard from '../../roles/clientadmin/page/Dashboard/Dashboard';
// managedevice
import Allocateddevice from '../../roles/clientadmin/page/Managedevice/Allocateddevice';
import Unallocateddevice from '../../roles/clientadmin/page/Managedevice/Unallocateddevice';
import ViewAlloc from '../../roles/clientadmin/page/Managedevice/ViewAlloc';
import ViewUnalloc from '../../roles/clientadmin/page/Managedevice/ViewUnalloc';
import AssigntoAssociation from  '../../roles/clientadmin/page/Managedevice/AssigntoAssociation';

// manageuser
import ManageUsers from '../../roles/clientadmin/page/Manageuser/ManageUsers';
import Viewuser from '../../roles/clientadmin/page/Manageuser/Viewuser';
import Edituser from '../../roles/clientadmin/page/Manageuser/Edituser';
import Createuser from '../../roles/clientadmin/page/Manageuser/Createuser';

// managefinance
import Managefinance from '../../roles/clientadmin/page/ManageFinance/Managefinance';
import ViewFinance from '../../roles/clientadmin/page/ManageFinance/ViewFinance';
import EditFinance from '../../roles/clientadmin/page/ManageFinance/EditFinance'
import CreateFinance from '../../roles/clientadmin/page/ManageFinance/CreateFinance'

// manageassociation
import ManageAssociation from '../../roles/clientadmin/page/ManageAssociation/ManageAssociation';
import ViewAss from '../../roles/clientadmin/page/ManageAssociation/ViewAss';
import Editass from '../../roles/clientadmin/page/ManageAssociation/Editass';
import Createass from '../../roles/clientadmin/page/ManageAssociation/Createass';
import Assigneddevass from '../../roles/clientadmin/page/ManageAssociation/AssignedDeviceAssociation';
import Assignfinance from '../../roles/clientadmin/page/ManageAssociation/Assignfinance';
import Sessionhistoryass from '../../roles/clientadmin/page/ManageAssociation/Sessionhistoryass';

import DeviceReport from '../../roles/clientadmin/page/ManageReport/DeviceReport';
import RevenueReport from '../../roles/clientadmin/page/ManageReport/RevenueReport';

import Wallet from '../../roles/clientadmin/page/Wallet/Wallet';
import Profile from '../../roles/clientadmin/page/Profile/Profile';
import Header from '../../roles/clientadmin/components/Header';
import ClientOccpConfig from '../../roles/clientadmin/page/ClientOcppConfig/ClientOcppConfig';

const ClientAdminApp = () => {
  const storedUser = JSON.parse(sessionStorage.getItem('clientAdminUser'));
  const [loggedIn, setLoggedIn] = useState(!!storedUser);
  const [userInfo, setUserInfo] = useState(storedUser || {});
  const navigate = useNavigate();

  // Handle login
  const handleLogin = (data) => {
    const { token, user } = data;
    setUserInfo(user);
    setLoggedIn(true);
    sessionStorage.setItem('clientAdminUser', JSON.stringify(user));
    sessionStorage.setItem('clientAdminToken',token)
    navigate('/clientadmin/Dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    setLoggedIn(false);
    setUserInfo({});
    sessionStorage.removeItem('clientAdminUser');
    sessionStorage.removeItem('clientAdminToken');
    navigate('/clientadmin');
  };

  return (
    <>
      {loggedIn && <Header userInfo={userInfo} handleLogout={handleLogout} />}
      <Routes>
        <Route
          path="/"
          element={loggedIn ? <Navigate to="/clientadmin/Dashboard" /> : <Login handleLogin={handleLogin} />}
        />
        <Route
          path="/Dashboard"
          element={loggedIn ? (
            <Dashboard userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
          <Navigate to="/clientadmin" />
          )}
        />
        {/* manage device */}
        <Route
          path="/Allocateddevice"
          element={loggedIn ? (
            <Allocateddevice userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        <Route
          path="/Unallocateddevice"
          element={loggedIn ? (
            <Unallocateddevice userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        <Route
          path="/ViewAlloc"
          element={loggedIn ? (
            <ViewAlloc userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        <Route
          path="/ViewUnalloc"
          element={loggedIn ? (
            <ViewUnalloc userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        <Route
          path="/AssigntoAssociation"
          element={loggedIn ? (
            <AssigntoAssociation userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        {/*  */}

        {/* Manageuser */}
        <Route
          path="/ManageUsers"
          element={loggedIn ? (
            <ManageUsers userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        <Route
          path="/Viewuser"
          element={loggedIn ? (
            <Viewuser userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        <Route
          path="/Edituser"
          element={loggedIn ? (
            <Edituser userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        <Route
          path="/Createuser"
          element={loggedIn ? (
            <Createuser userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        {/*  */}

        {/* Manage Finance */}
        <Route
          path="/Managefinance"
          element={loggedIn ? (
            <Managefinance userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        <Route
          path="/CreateFinance"
          element={loggedIn ? (
            <CreateFinance userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
              <Route
          path="/ViewFinance"
          element={loggedIn ? (
            <ViewFinance userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        <Route
          path="/EditFinance"
          element={loggedIn ? (
            <EditFinance userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        
        {/*  */}

        {/* Manage Association */}
        <Route
          path="/ManageAssociation"
          element={loggedIn ? (
            <ManageAssociation userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        <Route
          path="/ViewAss"
          element={loggedIn ? (
            <ViewAss userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        <Route
          path="/Editass"
          element={loggedIn ? (
            <Editass userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        <Route
          path="/Createass"
          element={loggedIn ? (
            <Createass userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        <Route
          path="/Assigneddevass"
          element={loggedIn ? (
            <Assigneddevass userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        <Route
          path="/Assignfinance"
          element={loggedIn ? (
            <Assignfinance userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        <Route
          path="/Sessionhistoryass"
          element={loggedIn ? (
            <Sessionhistoryass userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
        {/*  */}
        
        <Route
          path="/Wallet"
          element={loggedIn ? (
            <Wallet userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
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
          path="ClientOccpConfig"
          element={loggedIn ? (
            <ClientOccpConfig userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />

        <Route
          path="/Profile"
          element={loggedIn ? (
            <Profile userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/clientadmin" />
          )}
        />
      </Routes>
    </>
  );
};

export default ClientAdminApp;
