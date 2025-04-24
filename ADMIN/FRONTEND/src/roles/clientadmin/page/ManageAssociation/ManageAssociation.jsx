import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useManageAssociation from '../../hooks/ManageAssociation/ManageAssociationHooks';

const ManageAssociation = ({ userInfo, handleLogout }) => {
    const {
        associations, 
        searchQuery,
        handleSearch,filterAssociations,
        navigateToViewAssociationDetails,
        navtocreateass,navigatetochargerdetails,loading

    }=useManageAssociation(userInfo);

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
                                        <h3 className="font-weight-bold">Manage Association</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                onClick={navtocreateass}
                                                style={{ marginRight: '10px' }}
                                            >
                                                Create Association
                                            </button>
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
                                            <div className="col-12 col-xl-8">
                                                <h4 className="card-title" style={{ paddingTop: '10px' }}>List Of Associations</h4>
                                            </div>
                                            <div className="col-12 col-xl-4">
                                                <div className="input-group">
                                                    <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                        <span className="input-group-text" id="search">
                                                            <i className="icon-search"></i>
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Search now"
                                                        value={searchQuery}
                                                        onChange={handleSearch}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                    <tr> 
                                                        <th>Sl.No</th>
                                                        <th>Association Name</th>
                                                        <th>Email ID</th>
                                                        <th>Phone Number</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                        <th>Assigned Devices</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ textAlign: 'center' }}>
    {loading ? (
        <tr>
            <td colSpan="7">
                <span>Loading...</span>
            </td>
        </tr>
    ) : filterAssociations(associations).length > 0 ? (
        filterAssociations(associations).map((association, index) => (
            <tr key={association._id || index}>
                <td>{index + 1}</td>
                <td>{association.association_name || '-'}</td>
                <td>{association.association_email_id || '-'}</td>
                <td>{association.association_phone_no || '-'}</td>
                <td style={{ color: association.status ? 'green' : 'red' }}>
                    {association.status ? 'Active' : 'DeActive'}
                </td>
                <td>
                    <button
                        type="button"
                        className="btn btn-outline-success btn-icon-text"
                        onClick={() => navigateToViewAssociationDetails(association)}
                        style={{ marginBottom: '10px', marginRight: '10px' }}
                    >
                        <i className="mdi mdi-eye btn-icon-prepend"></i>View
                    </button>
                </td>
                <td>
                    <button
                        type="button"
                        className="btn btn-outline-warning btn-icon-text"
                        onClick={() => navigatetochargerdetails(association.association_id)}
                        style={{ marginBottom: '10px', marginRight: '10px' }}
                    >
                        <i className="ti-file btn-icon-prepend"></i>Device
                    </button>
                </td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="7">No Record Found</td>
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

export default ManageAssociation;
