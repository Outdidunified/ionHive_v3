import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row" style={{backgroundColor:'white'}}>
      <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
        <Link className="navbar-brand brand-logo mr-5" to="/ocppconfig"><img src="../../images/dashboard/EV-OCPP.png" className="mr-2" alt="logo" style={{ paddingLeft: 10 }}/></Link>
        <Link className="navbar-brand brand-logo-mini" to="/ocppconfig"><img src="../../images/dashboard/EV_Logo_16-12-2023.png" alt="logo"/></Link>
      </div>
    </nav>
  );
};

export default Header;
