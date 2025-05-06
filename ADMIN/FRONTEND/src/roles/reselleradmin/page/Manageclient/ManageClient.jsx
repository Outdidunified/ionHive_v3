import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import useManageclient from '../../hooks/ManageClient/ManageClientHooks';
import InputField from '../../../../utils/InputField';
const Manageclient = ({ userInfo, handleLogout }) => {
    const {
        navigateToCreateUser,
        navigateToViewClient,
        navassignedtoass,
        navtoassdev,
        searchQuery,
        handleSearch,
        loading,

        filteredUsers,
    } = useManageclient(userInfo);
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
                                        <h3 className="font-weight-bold">Manage Clients</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={navigateToCreateUser} style={{ marginRight: '10px' }}>Create Client's</button>
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
                                                        <h4 className="card-title" style={{ paddingTop: '10px' }}>List Of Clients</h4>
                                                    </div>
                                                    <div className="col-8 col-xl-4">
                                                        <div className="input-group">
                                                            <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                                <span className="input-group-text" id="search">
                                                                    <i className="icon-search"></i>
                                                                </span>
                                                            </div>
                                                            <InputField placeholder="Search now" value={searchQuery} onChange={handleSearch} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                    <tr>
                                                        <th>Sl.No</th>
                                                        <th>Client Name</th>
                                                        <th>Phone Number</th>
                                                        <th>Email ID</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                        <th>Assigned Association</th>
                                                        <th>Assigned Devices</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ textAlign: 'center' }}>
                                                    {loading ? (
                                                        <tr>
                                                            <td colSpan="8">
                                                                <div className="py-2">Loading...</div>
                                                            </td>
                                                        </tr>
                                                    ) : filteredUsers.length > 0 ? (
                                                        filteredUsers.map((user, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{user.client_name}</td>
                                                                <td>{user.client_phone_no}</td>
                                                                <td>{user.client_email_id}</td>
                                                                <td>{user.status === true ? <span className="text-success">Active</span> : <span className="text-danger">DeActive</span>}</td>
                                                                <td>
                                                                    <button type="button" className="btn btn-outline-success btn-icon-text" onClick={() => navigateToViewClient(user)} style={{ marginBottom: '10px', marginRight: '10px' }}>
                                                                        <i className="mdi mdi-eye btn-icon-prepend"></i>View
                                                                    </button>
                                                                </td>
                                                                <td>
                                                                    <button type="button" className="btn btn-outline-warning btn-icon-text" onClick={() => navassignedtoass(user.client_id)} style={{ marginBottom: '10px', marginRight: '10px' }}>
                                                                        <i className="ti-file btn-icon-prepend"></i>Association
                                                                    </button>
                                                                </td>
                                                                <td>
                                                                    <button type="button" className="btn btn-outline-warning btn-icon-text" onClick={() => navtoassdev(user.client_id)} style={{ marginBottom: '10px', marginRight: '10px' }}>
                                                                        <i className="ti-file btn-icon-prepend"></i>Devices
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr className="text-center">
                                                            <td colSpan="8">No Record Found</td>
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

export default Manageclient;
