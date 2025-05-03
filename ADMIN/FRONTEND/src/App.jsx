import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SuperAdminApp from './constants/adminRoutes/SuperAdminRoutes';
import ResellerAdminApp from './constants/adminRoutes/ResellerAdminRoutes';
import ClientAdminApp from './constants/adminRoutes/ClientAdminRoutes';
import AssociationAdminApp from './constants/adminRoutes/AssociationAdminRoutes';
import Log from './roles/log/Logs';
import OcppConfig from './roles/ocppconfig/page/OcppConfigs';
import SessionLog from './roles/sessionlog/page/SessionLogs';
const App = () => {
  
  return (
    <Router>
      <Routes>
        <Route path="/superadmin/*" element={<SuperAdminApp />} />
        <Route path="/" element={<Navigate to="/superadmin" />} />
        <Route path="/reselleradmin/*" element={<ResellerAdminApp />} />
        <Route path="/clientadmin/*" element={<ClientAdminApp />} />
        <Route path="/associationadmin/*" element={<AssociationAdminApp />} />
        <Route path="/log/*" element={<Log />} />
        <Route path="/ocppconfig/*" element={<OcppConfig />} />
        <Route path="/sessionlog/*" element={<SessionLog />} />
        


      </Routes>
    </Router>
  );
};

export default App;
