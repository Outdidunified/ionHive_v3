import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    return (
        <nav className="sidebar sidebar-offcanvas" id="sidebar">
            <ul className="nav">
                <li className={location.pathname === '/reselleradmin/Dashboard' ? 'nav-item active' : 'nav-item'} key="dashboard">
                    <Link className="nav-link" to={{ pathname: "/reselleradmin/Dashboard" }}>
                        <i className="icon-grid menu-icon"></i>
                        <span className="menu-title">Dashboard</span>
                    </Link>
                </li>

                <li className={location.pathname === '/reselleradmin/Allocateddevice' || location.pathname === '/reselleradmin/Unallocateddevice' || location.pathname === '/reselleradmin/Assigntoclients' || location.pathname === '/reselleradmin/ViewAlloc' || location.pathname === '/reselleradmin/ViewUnalloc' ? 'nav-item active' : 'nav-item'} key="ManageDevice">
                    <a className="nav-link" data-toggle="collapse" href="#ui-basic-md" aria-expanded="false" aria-controls="ui-basic-md">
                    <i className="icon-head menu-icon mdi mdi-cellphone-link"></i>
                    <span className="menu-title">Manage Device</span>
                    <i className="menu-arrow"></i>
                    </a>
                    <div className="collapse" id="ui-basic-md">
                    <ul className="nav flex-column sub-menu">
                        <li className="nav-item"> <Link className="nav-link" to={{ pathname: "/reselleradmin/Allocateddevice" }}>Allocated Chargers</Link></li>
                        <li className="nav-item"> <Link className="nav-link" to={{ pathname: "/reselleradmin/Unallocateddevice" }}>Unallocated Chargers</Link></li>
                    </ul>
                    </div>
                </li>

                <li className={location.pathname === '/reselleradmin/ManageClient' || location.pathname === '/reselleradmin/CreateClients' || location.pathname === '/reselleradmin/viewclient' || location.pathname === '/reselleradmin/updateclient' || location.pathname === '/reselleradmin/Asssigntoass' || location.pathname === '/reselleradmin/Assigneddevicesclient'|| location.pathname === '/reselleradmin/Sessionhistoryclient' || location.pathname === '/reselleradmin/Assigntoass'? 'nav-item active' : 'nav-item'} key="ManageClient">
                    <Link className="nav-link" to={{ pathname: "/reselleradmin/ManageClient" }}>
                        <i className="icon-head menu-icon mdi mdi-account-group"></i>
                        <span className="menu-title">Manage Client</span>
                    </Link>
                </li>
                <li className={location.pathname === '/reselleradmin/ManageUsers' || location.pathname === '/reselleradmin/Createusers' || location.pathname === '/reselleradmin/Viewuser' || location.pathname === '/reselleradmin/updateuser'? 'nav-item active' : 'nav-item'} key="ManageUsers">
                    <Link className="nav-link" to={{ pathname: "/reselleradmin/ManageUsers" }}>
                        <i className="icon-head menu-icon mdi mdi-account-multiple"></i>
                        <span className="menu-title">Manage Users</span>
                    </Link>
                </li>
                
                <li className={location.pathname === '/reselleradmin/Wallet' ? 'nav-item active' : 'nav-item'} key="Wallet">
                    <Link className="nav-link" to={{ pathname: "/reselleradmin/Wallet" }}>
                        <i className="icon-head menu-icon mdi mdi-wallet"></i>
                        <span className="menu-title">Withdraw</span>
                    </Link>
                </li>
                <li className={location.pathname === '/reselleradmin/DeviceReport' || location.pathname === '/reselleradmin/RevenueReport' ? 'nav-item active' : 'nav-item'} key="Manage Report">
                    <a className="nav-link" data-toggle="collapse" href="#ui-basic" aria-expanded="false" aria-controls="ui-basic">
                        <i className="icon-head menu-icon mdi mdi-file-chart"></i>
                            <span className="menu-title">Manage Report</span>
                        <i className="menu-arrow"></i>
                    </a>
                    <div className="collapse" id="ui-basic">
                        <ul className="nav flex-column sub-menu">
                            <li className="nav-item"> <Link className="nav-link" to={{ pathname: "/reselleradmin/DeviceReport" }}>Device Report</Link></li>
                            <li className="nav-item"> <Link className="nav-link" to={{ pathname: "/reselleradmin/RevenueReport" }}>Revenue Report</Link></li> 
                        </ul>
                    </div>
                </li>
                <li className={location.pathname === '/reselleradmin/Profile' ? 'nav-item active' : 'nav-item'} key="Profile">
                    <Link className="nav-link" to={{ pathname: "/reselleradmin/Profile" }}>
                        <i className="icon-head menu-icon mdi mdi-account-circle"></i>
                        <span className="menu-title">Profile</span>
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Sidebar;
