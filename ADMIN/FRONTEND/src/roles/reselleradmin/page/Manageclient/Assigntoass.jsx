import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useAssignToAssociation from '../../hooks/ManageClient/AssigntoassociationHooks';
import InputField from '../../../../utils/InputField';

const Assigntoass = ({ userInfo, handleLogout }) => {
    const {
        searchQuery,
        filteredData,
        handleSearch,
        goBack,
        isLoading
    } = useAssignToAssociation();
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
                                        <h3 className="font-weight-bold">Assigned Association</h3>
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
                                        <div className="col-md-12 grid-margin">
                                            <div className="row">
                                                <div className="col-4 col-xl-8">
                                                    <h4 className="card-title" style={{ paddingTop: '10px' }}>List Of Associations</h4>
                                                </div>
                                                <div className="col-12 col-xl-4">
                                                    <div className="input-group">
                                                        <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                            <span className="input-group-text" id="search">
                                                                <i className="icon-search"></i>
                                                            </span>
                                                        </div>
                                                        <InputField
                                                            placeholder="Search now"
                                                            value={searchQuery}
                                                            onChange={handleSearch}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                    <tr>
                                                        <th>Sl.No</th>
                                                        <th>Association name</th>
                                                        <th>Phone Number</th>
                                                        <th>Email ID</th>
                                                        <th>Address</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {isLoading ? (
                                                        <tr>
                                                            <td colSpan="6" className="text-center py-4">
                                                                Loading...
                                                            </td>
                                                        </tr>
                                                    ) : filteredData.length > 0 ? (
                                                        filteredData.map((item, index) => (
                                                            <tr key={index} style={{ textAlign: 'center' }}>
                                                                <td>{index + 1}</td>
                                                                <td>{item.association_name || '-'}</td>
                                                                <td>{item.association_phone_no || '-'}</td>
                                                                <td>{item.association_email_id || '-'}</td>
                                                                <td>{item.association_address || '-'}</td>
                                                                <td>
                                                                    {item.status === true ? (
                                                                        <span className="text-success">Active</span>
                                                                    ) : (
                                                                        <span className="text-danger">DeActive</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="6" className="text-center py-4">
                                                                No associations found.
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

export default Assigntoass;
