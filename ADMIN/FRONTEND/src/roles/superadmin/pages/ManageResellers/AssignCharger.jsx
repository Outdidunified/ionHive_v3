import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import useAssignCharger from '../../hooks/ManageReseller/AssignChargerHooks';
import InputField from '../../../../utils/InputField';

const AssignCharger = ({ userInfo, handleLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dataItem = location.state?.dataItem || JSON.parse(localStorage.getItem('dataItem'));

    const { isLoading, filteredData, handleSearchInputChange } = useAssignCharger(dataItem);

    const backManageReseller = () => {
        navigate('/superadmin/ManageReseller');
    };

    const handleSessionHistory = (dataItem, sessiondata) => {
        if (dataItem && sessiondata && sessiondata.length > 0) {
            navigate('/superadmin/SessignHistory', { state: { dataItem, sessiondata } });
        } else {
            console.error('Data item or session data is undefined or empty.');
        }
    };


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
                                        <h3 className="font-weight-bold">Assigned Chargers</h3>
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
                                                        <h4 className="card-title" style={{ paddingTop: '10px' }}>List Of Chargers</h4>
                                                    </div>
                                                    <div className="col-8 col-xl-4">
                                                        <div className="input-group">
                                                            <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                                <span className="input-group-text" id="search">
                                                                    <i className="icon-search"></i>
                                                                </span>
                                                            </div>
                                                            <InputField
    placeholder="Search now"
    ariaLabel="search"
    ariadescribedby="search"
    autoComplete="off"
    onChange={handleSearchInputChange}
/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                    <tr> 
                                                        <th>Sl.No</th>
                                                        <th>Charger ID</th>
                                                        <th>Status</th>
                                                        <th>Option</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ textAlign: 'center' }}>
    {isLoading ? (
        <tr>
            <td colSpan="4" className="p-4">
                Loading...
            </td>
        </tr>
    ) : filteredData.length > 0 ? (
        filteredData.map((post, index) => (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{post.chargerID ? post.chargerID : '-'}</td>
                <td>{post.status === true ? <span className="text-success">Active</span> : <span className="text-danger">DeActive</span>}</td>
                <td>
                    <button
                        type="button"
                        className="btn btn-outline-success btn-icon-text"
                        onClick={() => handleSessionHistory(dataItem, post.sessiondata)}
                        style={{ marginBottom: '10px', marginRight: '10px' }}
                    >
                        <i className="mdi mdi-eye"></i> Session History
                    </button>
                </td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="4" style={{ marginTop: '50px', textAlign: 'center' }}>
                No assigned chargers found
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
                    {/* Footer */}
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default AssignCharger;
