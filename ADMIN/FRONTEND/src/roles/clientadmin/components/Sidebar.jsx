import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const isManageAssociationActive = [
        '/clientadmin/ManageAssociation',
        '/clientadmin/ViewAss',
        '/clientadmin/Assigneddevass',
        '/clientadmin/Assignfinance',
        '/clientadmin/Createass',
        '/clientadmin/Editass',
        '/clientadmin/Sessionhistoryass',
        '/clientadmin/assignfinance',        
    ].includes(location.pathname);

    const isManageUsersActive = [
        '/clientadmin/ManageUsers',
        '/clientadmin/Createuser',
        '/clientadmin/Edituser',
        '/clientadmin/Viewuser'
    ].includes(location.pathname);

    // const isManageFinanceActive = [
    //     '/clientadmin/ManageFinance',
    //     '/clientadmin/ViewFinance',
    //     '/clientadmin/EditFinance',
    //     '/clientadmin/CreateFinance'
    // ].includes(location.pathname);

    return (
        <nav className="sidebar sidebar-offcanvas" id="sidebar">
            <ul className="nav">
                <li className={location.pathname === '/clientadmin/Dashboard' ? 'nav-item active' : 'nav-item'} key="dashboard">
                    <Link className="nav-link" to={{ pathname: "/clientadmin/Dashboard" }}>
                        <i className="icon-grid menu-icon"></i>
                        <span className="menu-title">Dashboard</span>
                    </Link>
                </li>

                <li className={location.pathname === '/clientadmin/Allocateddevice' || location.pathname === '/clientadmin/Unallocateddevice' || location.pathname === '/clientadmin/AssigntoAssociation' || location.pathname === '/clientadmin/ViewAlloc' || location.pathname === '/clientadmin/ViewUnalloc'  ? 'nav-item active' : 'nav-item'} key="ManageDevice">
                    <a className="nav-link" data-toggle="collapse" href="#ui-basic-md" aria-expanded="false" aria-controls="ui-basic-md">
                    <i className="icon-head menu-icon mdi mdi-cellphone-link"></i>
                    <span className="menu-title">Manage Device</span>
                    <i className="menu-arrow"></i>
                    </a>
                    <div className="collapse" id="ui-basic-md">
                    <ul className="nav flex-column sub-menu">
                        <li className="nav-item"> <Link className="nav-link" to={{ pathname: "/clientadmin/Allocateddevice" }}>Allocated Chargers</Link></li>
                        <li className="nav-item"> <Link className="nav-link" to={{ pathname: "/clientadmin/Unallocateddevice" }}>Unallocated Chargers</Link></li>
                    </ul>
                    </div>
                </li>

                <li className={`nav-item ${isManageAssociationActive ? 'active' : ''}`} key="ManageAssociation">
                    <Link className="nav-link" to={{ pathname: "/clientadmin/ManageAssociation" }}>
                        <i className="icon-head menu-icon mdi mdi-account-group"></i>
                        <span className="menu-title">Manage Association</span>
                    </Link>
                </li>
                
                <li className={`nav-item ${isManageUsersActive ? 'active' : ''}`} key="ManageUsers">
                    <Link className="nav-link" to={{ pathname: "/clientadmin/ManageUsers" }}>
                        <i className="icon-head menu-icon mdi mdi-account-multiple"></i>
                        <span className="menu-title">Manage Users</span>
                    </Link>
                </li>
                
                {/* <li className={`nav-item ${isManageFinanceActive ? 'active' : ''}`} key="ManageFinance">
                    <Link className="nav-link" to={{ pathname: "/clientadmin/ManageFinance" }}>
                        <i className="icon-head menu-icon mdi mdi-cash-multiple"></i>
                        <span className="menu-title">Manage Finance</span>
                    </Link>
                </li> */}
                
                <li className={location.pathname === '/clientadmin/Withdraw' ? 'nav-item active' : 'nav-item'} key="Withdraw">
                    <Link className="nav-link" to={{ pathname: "/clientadmin/Withdraw" }}>
                        <i className="icon-head menu-icon mdi mdi-wallet"></i>
                        <span className="menu-title">Withdraw</span>
                    </Link>
                </li>

                <li className={location.pathname === '/clientadmin/ClientOccpConfig'  ? 'nav-item active' : 'nav-item'}>
                    <Link className="nav-link" to="/clientadmin/ClientOccpConfig">
                        <i className="icon-head menu-icon mdi mdi-ev-station"></i>
                        <span className="menu-title">OCPP Config</span>
                    </Link>
                </li>

                <li className={location.pathname === '/clientadmin/DeviceReport' || location.pathname === '/clientadmin/RevenueReport' ? 'nav-item active' : 'nav-item'} key="Manage Report">
                    <a className="nav-link" data-toggle="collapse" href="#ui-basic" aria-expanded="false" aria-controls="ui-basic">
                        <i className="icon-head menu-icon mdi mdi-file-chart"></i>
                            <span className="menu-title">Manage Report</span>
                        <i className="menu-arrow"></i>
                    </a>
                    <div className="collapse" id="ui-basic">
                        <ul className="nav flex-column sub-menu">
                            <li className="nav-item"> <Link className="nav-link" to={{ pathname: "/clientadmin/DeviceReport" }}>Device Report</Link></li>
                             <li className="nav-item"> <Link className="nav-link" to={{ pathname: "/clientadmin/RevenueReport" }}>Revenue Report</Link></li> 
                        </ul>
                    </div>
                </li>

                <li className={location.pathname === '/clientadmin/Profile' ? 'nav-item active' : 'nav-item'} key="Profile">
                    <Link className="nav-link" to={{ pathname: "/clientadmin/Profile" }}>
                        <i className="icon-head menu-icon mdi mdi-account-circle"></i>
                        <span className="menu-title">Profile</span>
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Sidebar;
