import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  
  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className={location.pathname === '/superadmin/Dashboard' ? 'nav-item active' : 'nav-item'}>
          <Link className="nav-link" to="/superadmin/Dashboard">
            <i className="icon-grid menu-icon"></i>
            <span className="menu-title">Dashboard</span>
          </Link>
        </li>

        {/* ----- Manage Device (Collapsible Menu) ----- */}
       <li className={location.pathname === '/superadmin/ManageDevice' || location.pathname === '/superadmin/Allocateddevice' || location.pathname === '/superadmin/ViewAllocated' || location.pathname === '/superadmin/EditAllocatedDevice'  ? 'nav-item active' : 'nav-item'} key="ManageDevice">
                           <a className="nav-link" data-toggle="collapse" href="#ui-basic-md" aria-expanded="false" aria-controls="ui-basic-md">
                           <i className="icon-head menu-icon mdi mdi-cellphone-link"></i>
                           <span className="menu-title">Manage Device</span>
                           <i className="menu-arrow"></i>
                           </a>
                           <div className="collapse" id="ui-basic-md">
                           <ul className="nav flex-column sub-menu">
                               <li className="nav-item"> <Link className="nav-link" to={{ pathname: "/superadmin/Allocateddevice" }}>Allocated Chargers</Link></li>
                               <li className="nav-item"> <Link className="nav-link" to={{ pathname: "/superadmin/ManageDevice" }}>Unallocated Chargers</Link></li>
                           </ul>
                           </div>
                       </li>
        <li className={location.pathname === '/superadmin/ManageReseller' || location.pathname === '/superadmin/AddManageReseller' || location.pathname === '/superadmin/ViewManageReseller'  || location.pathname === '/superadmin/EditManageReseller' || location.pathname === '/superadmin/AssignClient' || location.pathname === '/superadmin/AssignCharger' || location.pathname === '/superadmin/SessignHistory' ? 'nav-item active' : 'nav-item'}>
          <Link className="nav-link" to="/superadmin/ManageReseller">
            <i className="icon-head menu-icon mdi mdi-account-group"></i>
            <span className="menu-title">Manage Reseller</span>
          </Link>
        </li>
        <li className={location.pathname === '/superadmin/ManageUsers' || location.pathname === '/superadmin/ViewUserList'  || location.pathname === '/superadmin/EditUserList' ? 'nav-item active' : 'nav-item'}>
          <Link className="nav-link" to="/superadmin/ManageUsers">
            <i className="icon-head menu-icon mdi mdi-account-multiple"></i>
            <span className="menu-title">Manage Users</span>
          </Link>
        </li>
        <li className={location.pathname === '/superadmin/ManageUserRole' ? 'nav-item active' : 'nav-item'}>
          <Link className="nav-link" to="/superadmin/ManageUserRole">
            <i className="icon-head menu-icon mdi mdi-account"></i>
            <span className="menu-title">Manage User Roles</span>
          </Link>
        </li>
        <li className={location.pathname === '/superadmin/OutputTypeConfig'  ? 'nav-item active' : 'nav-item'}>
          <Link className="nav-link" to="/superadmin/OutputTypeConfig">
            <i className="icon-head menu-icon mdi mdi-ev-station"></i>
            <span className="menu-title">Output Type Config</span>
          </Link>
        </li>
        <li className={location.pathname === '/superadmin/OcppConfig' || location.pathname === '/superadmin/OcppConfigLog' ? 'nav-item active' : 'nav-item'}>
          <Link className="nav-link" to="/superadmin/OcppConfig">
            <i className="icon-head menu-icon mdi mdi-ev-station"></i>
            <span className="menu-title">OCPP Config</span>
          </Link>
        </li>
        <li className={location.pathname === '/superadmin/Withdrawal' || location.pathname === '/superadmin/Withdrawal' ? 'nav-item active' : 'nav-item'}>
  <Link className="nav-link" to="/superadmin/Withdrawal">
    <i className="icon-head menu-icon mdi mdi-wallet"></i>
    <span className="menu-title">Withdraw</span>
  </Link>
</li>


        <li className={location.pathname === '/superadmin/DeviceReport' || location.pathname === '/superadmin/RevenueReport' ? 'nav-item active' : 'nav-item'} key="Manage Report">
          <a className="nav-link" data-toggle="collapse" href="#ui-basic" aria-expanded="false" aria-controls="ui-basic">
            <i className="icon-head menu-icon mdi mdi-file-chart"></i>
              <span className="menu-title">Manage Report</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="ui-basic">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item"> <Link className="nav-link" to={{ pathname: "/superadmin/DeviceReport" }}>Device Report</Link></li>
              <li className="nav-item"> <Link className="nav-link" to={{ pathname: "/superadmin/RevenueReport" }}>Revenue Report</Link></li>
            </ul>
          </div>
        </li>
        <li className={location.pathname === '/superadmin/Profile' ? 'nav-item active' : 'nav-item'}>
          <Link className="nav-link" to="/superadmin/Profile">
            <i className="icon-head menu-icon mdi mdi-account-circle"></i>
            <span className="menu-title">Profile</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
