import React, { useState} from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from '../../roles/reselleradmin/page/Login';
import Dashboard from '../../roles/reselleradmin/page/Dashboard/Dashboard';
//manage device

import Unallocateddevice from '../../roles/reselleradmin/page/Managedevice/Unallocateddevice';
import Allocateddevice from '../../roles/reselleradmin/page/Managedevice/Allocateddevice';
import ViewUnalloc from '../../roles/reselleradmin/page/Managedevice/ViewUnalloc';
import ViewAlloc from '../../roles/reselleradmin/page/Managedevice/ViewAlloc';
import Assigntoclients from '../../roles/reselleradmin/page/Managedevice/Assigntoclients';

//manageclient
import ManageClient from '../../roles/reselleradmin/page/Manageclient/ManageClient';
import CreateClients from '../../roles/reselleradmin/page/Manageclient/Createclients';
import Viewclient from '../../roles/reselleradmin/page/Manageclient/viewclient';
import Updateclient from '../../roles/reselleradmin/page/Manageclient/updateclient';
import Assigntoass from '../../roles/reselleradmin/page/Manageclient/Assigntoass';
import AssignedDevicesClient from '../../roles/reselleradmin/page/Manageclient/AssignedDevicesclient';
import Sessionhistoryclient from '../../roles/reselleradmin/page/Manageclient/Sessionhistoryclient';

//wallet
import Wallet from '../../roles/reselleradmin/page/Wallet/Wallet'

import DeviceReport from '../../roles/reselleradmin/page/ManageReport/DeviceReport';
import RevenueReport from '../../roles/reselleradmin/page/ManageReport/RevenueReport';

import Profile from '../../roles/reselleradmin/page/Profile/Profile';
import ManageUsers from '../../roles/reselleradmin/page/Manageuser/ManageUsers';
import Createusers from '../../roles/reselleradmin/page/Manageuser/Createusers';
import Updateuser from '../../roles/reselleradmin/page/Manageuser/updateuser';
import Viewuser from '../../roles/reselleradmin/page/Manageuser/Viewuser';
import Header from '../../roles/reselleradmin/components/Header';



const ResellerAdminApp = () => {
  const storedUser = JSON.parse(sessionStorage.getItem('resellerAdminUser'));
  const [loggedIn, setLoggedIn] = useState(!!storedUser);
  const [userInfo, setUserInfo] = useState(storedUser || {});
  const navigate = useNavigate();

  // Handle login
  const handleLogin = (data) => {
    const { token, user } = data;
    setUserInfo(user);
    setLoggedIn(true);
    sessionStorage.setItem('resellerAdminUser', JSON.stringify(user));
    sessionStorage.setItem('resellerAdminToken', token); // Store token
    navigate('/reselleradmin/Dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    setLoggedIn(false);
    setUserInfo({});
    sessionStorage.removeItem('resellerAdminUser');
    sessionStorage.removeItem('resellerAdminToken');

    navigate('/reselleradmin');
  };

  return (
    <>
      {loggedIn && <Header userInfo={userInfo} handleLogout={handleLogout} />}
      `<Routes>
        <Route
          path="/"
          element={loggedIn ? <Navigate to="/reselleradmin/Dashboard" /> : <Login handleLogin={handleLogin} />}
        />
        <Route
          path="/Dashboard"
          element={loggedIn ? (
            <Dashboard userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
        {/* manage device */}
      
        <Route
          path="Unallocateddevice"
          element={loggedIn ? (
            <Unallocateddevice userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
        <Route
          path="/Allocateddevice"
          element={loggedIn ? (
            <Allocateddevice userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
        <Route
          path="/ViewUnalloc"
          element={loggedIn ? (
            <ViewUnalloc userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
        <Route
          path="/ViewAlloc"
          element={loggedIn ? (
            <ViewAlloc userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
        <Route
          path="/Assigntoclients"
          element={loggedIn ? (
            <Assigntoclients userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
        {/* manage device */}

        <Route
          path="/ManageUsers"
          element={loggedIn ? (
            <ManageUsers userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
          <Route
            path="/Createusers"
            element={loggedIn ? <Createusers userInfo={userInfo} handleLogout={handleLogout} /> : <Navigate to="/reselleradmin" />}
          />

        <Route
          path="/updateuser"
          element={loggedIn ? (
            <Updateuser userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />

        <Route
          path="/Viewuser"
          element={loggedIn ? (
            <Viewuser userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
        
        {/* manageclient */}

        <Route
          path="/ManageClient"
          element={loggedIn ? (
            <ManageClient userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
        <Route
          path="/CreateClients"
          element={loggedIn ? (
            <CreateClients userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
        <Route
          path="/updateclient"
          element={loggedIn ? (
            <Updateclient userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
        <Route
          path="/viewclient"
          element={loggedIn ? (
            <Viewclient userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
        <Route
          path="/viewclient"
          element={loggedIn ? (
            <Viewclient userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
        <Route
          path="/Assigntoass"
          element={loggedIn ? (
            <Assigntoass userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
        <Route
          path="/Assigneddevicesclient"
          element={loggedIn ? (
            <AssignedDevicesClient userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
        <Route
          path="/Sessionhistoryclient"
          element={loggedIn ? (
            <Sessionhistoryclient userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
          )}
        />
        {/*  */}

        <Route
          path="/Wallet"
          element={loggedIn ? (
            <Wallet userInfo={userInfo} handleLogout={handleLogout} />
          ) : (
            <Navigate to="/reselleradmin" />
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
            <Navigate to="/reselleradmin" />
          )}
        />
      </Routes>
    </>
  );
};

export default ResellerAdminApp;
