import React from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
const Sidebar = () => {
    const location = useLocation();

    return (
        <nav className="sidebar sidebar-offcanvas" id="sidebar">
            <ul className="nav">
                <li className={location.pathname === '/associationadmin/Dashboard' ? 'nav-item active' : 'nav-item'} key="dashboard">
                    <Link className="nav-link" to={{ pathname: "/associationadmin/Dashboard" }}>
                        <i className="icon-grid menu-icon"></i>
                        <span className="menu-title">Dashboard</span>
                    </Link>
                </li>
                <li className={location.pathname === '/associationadmin/ManageDevice' || location.pathname === '/associationadmin/ViewManageDevice' || location.pathname === '/associationadmin/EditManageDevice' ? 'nav-item active' : 'nav-item'} key="ManageDevice">
                    <Link className="nav-link" to={{ pathname: "/associationadmin/ManageDevice" }}>
                        <i className="icon-head menu-icon mdi mdi-cellphone-link"></i>
                        <span className="menu-title">Manage Device</span>
                    </Link>
                </li>
                <li className={location.pathname === '/associationadmin/ManageUsers' || location.pathname === '/associationadmin/EditManageUsers' || location.pathname === '/associationadmin/ViewManageUser' ? 'nav-item active' : 'nav-item'} key="ManageUsers">
                    <Link className="nav-link" to={{ pathname: "/associationadmin/ManageUsers" }}>
                        <i className="icon-head menu-icon mdi mdi-account-multiple"></i>
                        <span className="menu-title">Manage Users</span>
                    </Link>
                </li> 
                <li className={location.pathname === '/associationadmin/ManageTagID' ? 'nav-item active' : 'nav-item'} key="ManageTagID">
                    <Link className="nav-link" to={{ pathname: "/associationadmin/ManageTagID" }}>
                        <i className="icon-head menu-icon mdi mdi-tag"></i>
                        <span className="menu-title">Manage Tag ID</span>
                    </Link>
                </li>      
                <li className={location.pathname === '/associationadmin/Assignuser' || location.pathname === '/associationadmin/AssignTagID' ? 'nav-item active' : 'nav-item'} key="Assignuser">
                    <Link className="nav-link" to={{ pathname: "/associationadmin/Assignuser" }}>
                        <i className="icon-head menu-icon mdi mdi-account"></i>
                        <span className="menu-title">Assign User </span>
                    </Link>
                </li>          
                <li className={location.pathname === '/associationadmin/ManageFinance' || location.pathname === '/associationadmin/CreateFinance'  || location.pathname === '/associationadmin/ViewFinance'  || location.pathname === '/associationadmin/EditFinance' ?'nav-item active' : 'nav-item'} key="ManageFinance">
                    <Link className="nav-link" to={{ pathname: "/associationadmin/ManageFinance" }}>
                        <i className="icon-head menu-icon mdi mdi-cash-multiple"></i>
                        <span className="menu-title">Manage Finance</span>
                    </Link>
                </li>
                <li className={location.pathname === '/associationadmin/Withdraw' ? 'nav-item active' : 'nav-item'} key="Withdraw">
                    <Link className="nav-link" to={{ pathname: "/associationadmin/Withdraw" }}>
                        <i className="icon-head menu-icon mdi mdi-wallet"></i>
                        <span className="menu-title">Withdraw</span>
                    </Link>
                </li>
                <li className={location.pathname === '/associationadmin/DeviceReport' || location.pathname === '/associationadmin/RevenueReport' ? 'nav-item active' : 'nav-item'} key="Manage Report">
                    <a className="nav-link" data-toggle="collapse" href="#ui-basic" aria-expanded="false" aria-controls="ui-basic">
                        <i className="icon-head menu-icon mdi mdi-file-chart"></i>
                            <span className="menu-title">Manage Report</span>
                        <i className="menu-arrow"></i>
                    </a>
                    <div className="collapse" id="ui-basic">
                        <ul className="nav flex-column sub-menu">
                            <li className="nav-item"> <Link className="nav-link" to={{ pathname: "/associationadmin/DeviceReport" }}>Device Report</Link></li>
                            <li className="nav-item"> <Link className="nav-link" to={{ pathname: "/associationadmin/RevenueReport" }}>Revenue Report</Link></li> 
                        </ul>
                    </div>
                </li>                
                <li className={location.pathname === '/associationadmin/Profile' ? 'nav-item active' : 'nav-item'} key="Profile">
                    <Link className="nav-link" to={{ pathname: "/associationadmin/Profile" }}>
                        <i className="icon-head menu-icon mdi mdi-account-circle"></i>
                        <span className="menu-title">Profile</span>
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Sidebar;
