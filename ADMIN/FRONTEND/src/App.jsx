import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SuperAdminApp from './constants/adminRoutes/SuperAdminRoutes';
import ResellerAdminApp from './constants/adminRoutes/ResellerAdminRoutes';
import ClientAdminApp from './constants/adminRoutes/ClientAdminRoutes';
const App = () => {
  
  return (
    <Router>
      <Routes>
        <Route path="/superadmin/*" element={<SuperAdminApp />} />
        <Route path="/" element={<Navigate to="/superadmin" />} />
        <Route path="/reselleradmin/*" element={<ResellerAdminApp />} />
        <Route path="/clientadmin/*" element={<ClientAdminApp />} />


      </Routes>
    </Router>
  );
};

export default App;
