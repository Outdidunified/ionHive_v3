import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useRevenueReport from '../../hooks/ManageReport/RevenueReportHooks';
import InputField from '../../../../utils/InputField';
const RevenueReport = ({ userInfo, handleLogout }) => {
    const {
        loading,
        formatDate,
        filteredFirstTableData,
        filteredSecondTableData,
        firstTableSearchQuery,
        secondTableSearchQuery,
        setFirstTableSearchQuery,
        setSecondTableSearchQuery
    } = useRevenueReport();

    return (
        <div className="container-scroller">
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="container-fluid page-body-wrapper" style={{ paddingTop: '40px' }}>
                <Sidebar />
                <div className="main-panel">
                    <div className="content-wrapper">
                        {/* First Table with Search Box */}
                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title">Revenue Overview</h4>
                                {/* First Table Search Box */}
                                <div className="col-8 col-xl-4 ml-auto mb-2">
                                    <div className="input-group">
                                        <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                            <span className="input-group-text" id="search">
                                                <i className="icon-search"></i>
                                            </span>
                                        </div>
                                        <InputField
                                            placeholder="Search now"
                                            value={firstTableSearchQuery}
                                            onChange={(e) => setFirstTableSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                    <table className="table table-striped">
                                        <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                            <tr>
                                                <th>Sl.No</th>
                                                <th>Charge ID</th>
                                                <th>Reseller</th>
                                                <th>Client</th>
                                                <th>Association</th>
                                                <th>Total Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                                            ) : filteredFirstTableData.length > 0 ? (
                                                filteredFirstTableData.map((item, index) => (
                                                    <tr key={index} style={{ height: "95px" }}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.chargeId || '-'}</td>
                                                        <td>{item.reseller || '-'}</td>
                                                        <td>{item.client || '-'}</td>
                                                        <td>{item.association || '-'}</td>
                                                        <td>{item.totalRevenue || '-'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="6" className="text-center">No Data Available</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Second Table with Search Box */}
                        <div className="card mt-4">
                            <div className="card-body">
                                <h4 className="card-title">Charging Session</h4>
                                {/* Second Table Search Box */}
                                <div className="col-8 col-xl-4 ml-auto mb-2">
                                    <div className="input-group">
                                        <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                            <span className="input-group-text" id="search">
                                                <i className="icon-search"></i>
                                            </span>
                                        </div>
                                        <InputField
                                            placeholder="Search now"
                                            value={secondTableSearchQuery}
                                            onChange={(e) => setSecondTableSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                            <tr>
                                                <th>Sl.No</th>
                                                <th>Charger ID</th>
                                                <th>Session ID</th>
                                                <th>Customer Name</th>
                                                <th>Start Time</th>
                                                <th>Stop Time</th>
                                                <th>Duration</th>
                                                <th>Location</th>
                                                <th>Energy Consumed</th>
                                                <th>Price</th>
                                                <th>Reseller Revenue</th>
                                                <th>Client Revenue</th>
                                                <th>Association Revenue</th>
                                                <th>Total Revenue</th>



                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr><td colSpan="14" className="text-center">Loading...</td></tr>
                                            ) : filteredSecondTableData.length > 0 ? (
                                                filteredSecondTableData.map((item, index) => (
                                                    <tr key={index} style={{ height: "95px" }}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.chargerId || '-'}</td>
                                                        <td>{item.sessionId || '-'}</td>
                                                        <td>{item.customerName || '-'}</td>
                                                        <td>{formatDate(item.startTime) || '-'}</td>
                                                        <td>{formatDate(item.stopTime) || '-'}</td>
                                                        <td>{item.duration || '-'}</td>
                                                        <td>{item.location || '-'}</td>
                                                        <td>{item.energyConsumed || '-'}</td>
                                                        <td>{item.price || '-'}</td>
                                                        <td>{item.reseller || '-'}</td>
                                                        <td>{item.client || '-'}</td>
                                                        <td>{item.association || '-'}</td>
                                                        <td>{item.totalRevenue || '-'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="14" className="text-center">No Data Available</td></tr>
                                            )}
                                        </tbody>
                                    </table>
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

export default RevenueReport;
