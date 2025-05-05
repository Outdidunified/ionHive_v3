import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import useSessionHistoryClient from '../../hooks/ManageClient/SessionHistoryClientHooks';
import InputField from '../../../../utils/InputField';
import { formatTimestamp } from '../../../../utils/formatTimestamp';
const Sessionhistoryclient = ({ userInfo, handleLogout }) => {
    const {
        sessions,
        handleSearchInputChange,
        goBack,
    } = useSessionHistoryClient();

    return (
        <div className='container-scroller'>
            {/* Header */}
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="container-fluid page-body-wrapper" style={{ paddingTop: '40px' }}>
                {/* Sidebar */}
                <Sidebar />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-12 grid-margin">
                                <div className="row">
                                    <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                                        <h3 className="font-weight-bold">View Session</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={goBack} style={{ marginRight: '10px' }}>Back</button>
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
                                        <div className="table-responsive">
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center' }}>
                                                    <tr>
                                                        <th>Sl.No</th>
                                                        <th>User</th>
                                                        <th>Charger Id</th>
                                                        <th>Session ID</th>
                                                        <th>Created Date</th>
                                                        <th>Price</th>
                                                        <th>Unit Consumed</th>
                                                        <th>Start Time</th>
                                                        <th>Stop Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ textAlign: 'center' }}>
                                                    {sessions.length > 0 ? (
                                                        sessions.map((session, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{session.user ? session.user : '-'}</td>
                                                                <td>{session.charger_id ? session.charger_id : '-'}</td>
                                                                <td>{session.session_id ? session.session_id : '-'}</td>
                                                                <td>{session.created_date ? formatTimestamp(session.created_date) : '-'}</td>
                                                                <td>{session.price ? session.price : '-'}</td>
                                                                <td>{session.unit_consummed ? session.unit_consummed : '-'}</td>
                                                                <td>{session.start_time ? formatTimestamp(session.start_time) : '-'}</td>
                                                                <td>{session.stop_time ? formatTimestamp(session.stop_time) : '-'}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr className="text-center">
                                                            <td colSpan="9">No sessions found</td>
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

export default Sessionhistoryclient;
