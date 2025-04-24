import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useRevenueReport from '../../hooks/ManageReport/RevenueReportHooks';

const RevenueReport = ({ userInfo, handleLogout }) => {
   const {
 
    firstTableData,
    totalRevenue,
    secondTableData,
    filteredFirstTableData,
    filteredSecondTableData,
    firstTableSearchQuery,
    secondTableSearchQuery,
    setSecondTableSearchQuery,
    setFirstTableSearchQuery,
    firstTableLoading,
    secondTableLoading
   }=useRevenueReport(userInfo)

    return (
        <div className="container-scroller">
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="container-fluid page-body-wrapper" style={{ paddingTop: '40px' }}>
                <Sidebar />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-4 ml-auto">
                                <div className="card bg-primary text-white shadow-lg border-0" style={{ height: "320px" }}>
                                    <div className="card-body d-flex align-items-center justify-content-center flex-column">
                                        <h5 className="text-uppercase fw-bold" style={{ letterSpacing: '1px', opacity: '0.9', fontSize: '1.5rem', paddingBottom: '10px' }}>Total Revenue</h5>
                                        <h2 className="fw-bold" style={{ fontSize: '2.5rem', textShadow: '2px 2px 10px rgba(255, 255, 255, 0.3)' }}>
                                            ₹{totalRevenue}
                                        </h2>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-8">
                                <div className="card shadow-sm" style={{ height: "330px" }}>
                                    <div className="card-body d-flex flex-column">
                                        <div className="d-flex justify-content-between mb-3">
                                        <h4 className="card-title mb-2">Total Revenue</h4>

                                            <div className="input-group" style={{ width: '250px' }}>
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text">
                                                        <i className="icon-search"></i>
                                                    </span>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search now"
                                                    value={firstTableSearchQuery}
                                                    onChange={(e) => setFirstTableSearchQuery(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="table-responsive" style={{ flex: 1, overflowY: 'auto' }}>
                                            <table className="table table-striped text-center">
                                                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                                                    <tr>
                                                        <th>SI.NO</th>
                                                        <th>Charger ID</th>
                                                        <th>Association Email</th>
                                                        <th>Revenue</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
    {firstTableLoading ? (
        <tr><td colSpan="4" className="text-center">Loading...</td></tr>
    ) : filteredFirstTableData.length > 0 ? (
        filteredFirstTableData.map((item, index) => (
            <tr key={index} style={{ height: "95px" }}>
                <td>{index + 1}</td>
                <td>{item.charger_id || '-'}</td>
                <td>{item.association_email_id || '-'}</td>
                <td>{item.Revenue || '-'}</td>
            </tr>
        ))
    ) : (
        <tr><td colSpan="4" className="text-center">No Data Available</td></tr>
    )}
</tbody>

                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Second Table with Sessions Data */}
                            <div className="col-md-12 mt-4">
    <div className="card shadow-sm">
        <div className="card-body d-flex flex-column">
            <div className="d-flex justify-content-between mb-3">
                <h4 className="card-title mb-2">Charger Sessions</h4>

                <div className="input-group mb-0" style={{ width: '250px' }}>
                    <div className="input-group-prepend">
                        <span className="input-group-text">
                            <i className="icon-search"></i>
                        </span>
                    </div>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search now"
                        value={secondTableSearchQuery}
                        onChange={(e) => setSecondTableSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-responsive" style={{ flex: 1, overflowY: 'auto' }}>
                <table className="table table-striped text-center">
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                        <tr>
                            <th>SI.NO</th>
                            <th>Charger ID</th>
                            <th>Session ID</th>
                            <th>Association Email</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {secondTableLoading ? (
                            <tr><td colSpan="5" className="text-center">Loading...</td></tr>
                        ) : filteredSecondTableData.length > 0 ? (
                            filteredSecondTableData.map((session, index) => (
                                <tr key={index} style={{ height: "95px" }}>
                                    <td>{index + 1}</td>
                                    <td>{session.charger_id || '-'}</td>
                                    <td>{session.session_id || '-'}</td>
                                    <td>{session.association_email_id || '-'}</td>
                                    <td>{session.Revenue || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="text-center">No Data Available</td></tr>
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

export default RevenueReport;
