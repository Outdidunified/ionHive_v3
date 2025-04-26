import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useManagefinance from '../../hooks/ManageFinance/ManageFinanceHooks';
const Managefinance = ({ userInfo, handleLogout }) => {
  const {
    financeDetails, setFinanceDetails,
        searchQuery, setSearchQuery,
        fetchUsersCalled,
        fetchFinanceDetails,
        handleSearch,
        filteredFinanceDetails,
        handleView,navigateToCreateUser
  }=useManagefinance(userInfo)
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
                                        <h3 className="font-weight-bold">Manage Finance</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={navigateToCreateUser} style={{ marginRight: '10px' }} >Create Finance</button>
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
                                                <h4 className="card-title" style={{ paddingTop: '10px' }}>Finance Details</h4>
                                            </div>
                                            <div className="col-12 col-xl-4">
                                                <div className="input-group">
                                                    <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                        <span className="input-group-text" id="search">
                                                            <i className="icon-search"></i>
                                                        </span>
                                                    </div>
                                                    <input type="text" className="form-control" placeholder="Search now" value={searchQuery} onChange={handleSearch}/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                    <tr> 
                                                        <th>Sl.No</th>
                                                        <th>Total Amount</th>
                                                        <th>EB Charge</th>
                                                        <th>Margin</th>
                                                        <th>GST</th>
                                                        <th>Processing Fee</th>
                                                        <th>Parking Fee</th>
                                                        <th>Convenience Fee</th>
                                                        <th>Service Fee</th>
                                                        <th>Station Fee</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ textAlign: 'center' }}>
                                                    {filteredFinanceDetails.length > 0 ? (
                                                        filteredFinanceDetails.map((finance, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{finance.totalprice ? `₹ ${finance.totalprice}` : '-'}</td>
                                                                <td>{finance.eb_charge ? `₹ ${finance.eb_charge}` : '-'}</td>
                                                                <td>{finance.margin ? `₹ ${finance.margin}` : '-'}</td>
                                                                <td>{finance.gst ? `${finance.gst} %` : '-'}</td>
                                                                <td>{finance.processing_fee ?  `₹ ${finance.processing_fee}` : '-'}</td>
                                                                <td>{finance.parking_fee ? `₹ ${finance.parking_fee}` : '-'}</td>
                                                                <td>{finance.convenience_fee ? `₹ ${finance.convenience_fee}` : '-'}</td>
                                                                <td>{finance.service_fee ? `₹ ${finance.service_fee}` : '-'}</td>
                                                                <td>{finance.station_fee ? `₹ ${finance.station_fee}` : '-'}</td>
                                                                <td style={{ color: finance.status ? 'green' : 'red' }}>
                                                                    {finance.status ? 'Active' : 'DeActive'}
                                                                </td>
                                                                <td>
                                                                    <button type="button" className="btn btn-outline-success btn-icon-text" onClick={() => handleView(finance)} style={{ marginRight: '5px' }}><i className="mdi mdi-eye btn-icon-prepend"></i> View</button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr className="text-center">
                                                            <td colSpan="12">No Finance Details Found</td>
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

export default Managefinance;
