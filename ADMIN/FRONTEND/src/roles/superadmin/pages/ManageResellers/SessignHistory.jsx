import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import useSessionHistory from '../../hooks/ManageReseller/SessionHistoryHooks';
import InputField from '../../../../utils/InputField';
import { formatTimestamp } from '../../../../utils/formatTimestamp';
const SessionHistory = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();
    const {
        posts,
        handleSearchInputChange,
        dataItem,
    } = useSessionHistory();

    const backManageReseller = () => {
        navigate('/superadmin/AssignCharger', { state: { dataItem } });
    };

    return (
        <div className='container-scroller'>
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="container-fluid page-body-wrapper">
                <Sidebar />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-12 grid-margin">
                                <div className="row">
                                    <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                                        <h3 className="font-weight-bold">Session History</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={() => backManageReseller(dataItem)}>Back</button>
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
                                                        <h4 className="card-title" style={{ paddingTop: '10px' }}>List Of History</h4>
                                                    </div>
                                                    <div className="col-8 col-xl-4">
                                                        <div className="input-group">
                                                            <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                                <span className="input-group-text" id="search">
                                                                    <i className="icon-search"></i>
                                                                </span>
                                                            </div>
                                                            <InputField
                                                                placeholder="Search user or charger id"
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
                                                <thead style={{ textAlign: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                    <tr>
                                                        <th>Sl.No</th>
                                                        <th>User</th>
                                                        <th>Charger ID</th>
                                                        <th>Session ID</th>
                                                        <th>Created Date</th>
                                                        <th>Price</th>
                                                        <th>Unit Consumed</th>
                                                        <th>Start Time</th>
                                                        <th>Stop Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ textAlign: 'center' }}>
                                                    {posts.length > 0 ? (
                                                        posts.map((post, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{post.user ? post.user : '-'}</td>
                                                                <td>{post.charger_id ? post.charger_id : '-'}</td>
                                                                <td>{post.session_id ? post.session_id : '-'}</td>
                                                                <td>{post.created_date ? formatTimestamp(post.created_date) : '-'}</td>
                                                                <td>{post.price ? post.price : '-'}</td>
                                                                <td>{post.unit_consummed ? post.unit_consummed : '-'}</td>
                                                                <td>{post.start_time ? formatTimestamp(post.start_time) : '-'}</td>
                                                                <td>{post.stop_time ? formatTimestamp(post.stop_time) : '-'}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="9" style={{ textAlign: 'center' }}>No sessions found</td>
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

export default SessionHistory;
