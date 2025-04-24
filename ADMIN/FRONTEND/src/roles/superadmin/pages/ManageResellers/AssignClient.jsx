import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import useAssignClient  from '../../hooks/ManageReseller/AssignClientHooks';
const AssignClient = ({ userInfo, handleLogout }) => {
    const location = useLocation();
    const dataItem = location.state?.dataItem || JSON.parse(localStorage.getItem('dataItem'));
    const navigate = useNavigate();

    const {  filteredData, handleSearchInputChange,isLoading } = useAssignClient(dataItem);

    const backManageReseller = () => {
        navigate('/superadmin/ManageReseller');
    }
    return (
        <div className='container-scroller'>
            {/* Header */}
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="container-fluid page-body-wrapper">
                {/* Sidebar */}
                <Sidebar />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-12 grid-margin">
                                <div className="row">
                                    <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                                        <h3 className="font-weight-bold">Assigned Client's</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={backManageReseller}>Back</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-12 grid-margin">
                                                <div className="row">
                                                    <div className="col-4 col-xl-8">
                                                        <h4 className="card-title" style={{ paddingTop: '10px' }}>List Of Client's</h4>
                                                    </div>
                                                    <div className="col-8 col-xl-4">
                                                        <div className="input-group">
                                                            <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                                <span className="input-group-text" id="search">
                                                                    <i className="icon-search"></i>
                                                                </span>
                                                            </div>
                                                            <input type="text" className="form-control" placeholder="Search now" aria-label="search" aria-describedby="search" autoComplete="off" onChange={handleSearchInputChange} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
  <table className="table table-striped">
    <thead
      style={{
        textAlign: 'center',
        position: 'sticky',
        tableLayout: 'fixed',
        top: 0,
        backgroundColor: 'white',
        zIndex: 1,
      }}
    >
      <tr>
        <th>Sl.No</th>
        <th>Client Name</th>
        <th>Phone Number</th>
        <th>Email ID</th>
        <th>Address</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody style={{ textAlign: 'center' }}>
      {isLoading ? (
        <tr>
          <td colSpan="6" style={{ padding: '20px' }}>
            Loading...
          </td>
        </tr>
      ) : filteredData.length > 0 ? (
        filteredData.map((post, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{post.client_name || '-'}</td>
            <td>{post.client_phone_no || '-'}</td>
            <td>{post.client_email_id || '-'}</td>
            <td>{post.client_address || '-'}</td>
            <td>
              {post.status === true ? (
                <span className="text-success">Active</span>
              ) : (
                <span className="text-danger">DeActive</span>
              )}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="6" style={{ padding: '20px' }}>
            No Assigned clients found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default AssignClient;
