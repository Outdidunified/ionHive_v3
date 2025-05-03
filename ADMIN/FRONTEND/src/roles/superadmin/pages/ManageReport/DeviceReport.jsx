import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useDeviceReport from '../../hooks/ManageReport/DeviceReportHooks';
import InputField from '../../../../utils/InputField';

const DeviceReport = ({ userInfo, handleLogout }) => {
    const {
        today,
        deviceData,
        loadingDevice,
        errorDevice,
        fromDate,
        toDate,
        selectDevice,
        loading,
        tableData,
        deviceId,
        setFromDate,
        setToDate,
        setDevice,
        handleSearch, handleExport, handlePrint
    } = useDeviceReport();



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
                                    <div className="col-12 col-xl-6 mb-4 mb-xl-0">
                                        <h3 className="font-weight-bold">Device Report</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="form-container">
                                            <form className="form-row" >
                                                <div className="form-group">
                                                    <label htmlFor="fromDate" style={{ fontSize: '17px' }}>From Date</label>
                                                    <InputField
                                                        type="date"
                                                        className="form-input inputCss"
                                                        id="fromDate"
                                                        value={fromDate}
                                                        onChange={(e) => {
                                                            const selectedDate = e.target.value;
                                                            setFromDate(selectedDate);
                                                            if (toDate && selectedDate > toDate) {
                                                                setToDate(""); // Clear toDate if it's earlier than fromDate
                                                            }
                                                        }}
                                                        max={today}
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="toDate" style={{ fontSize: '17px' }}>To Date</label>
                                                    <InputField
                                                        type="date"
                                                        className="form-input inputCss"
                                                        id="toDate"
                                                        value={toDate}
                                                        onChange={(e) => setToDate(e.target.value)}
                                                        min={fromDate}  // Ensures toDate can't be before fromDate
                                                        max={today}
                                                        disabled={!fromDate}  // Disable until fromDate is selected
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label htmlFor="selectField" style={{ fontSize: '17px' }}>Select Device</label>
                                                    {/* <select name="selectField" value={selectDevice}  onChange={(e) => setDevice(e.target.value)} className="form-input inputCss">
                                                        <option value="" disabled>Select Device</option>
                                                        <option value="4989348034">4989348034</option>
                                                        <option value="4989348036">4989348036</option>
                                                    </select> */}
                                                    {loadingDevice ? (
                                                        <p>Loading...</p>
                                                    ) : errorDevice ? (
                                                        <p style={{ color: "red" }}>No data Available</p>
                                                    ) : deviceData.length === 0 ? (
                                                        <p>No device data available.</p>
                                                    ) : (
                                                        <select
                                                            name="selectField"
                                                            value={selectDevice}
                                                            onChange={(e) => setDevice(e.target.value)} className="form-input inputCss">
                                                            <option value="" disabled>Select Device</option>
                                                            {deviceData.map(device => (
                                                                <option key={device.charger_id} value={device.charger_id}>
                                                                    {device.charger_id}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                                <div className="form-group">
                                                    <button
                                                        type="button"
                                                        className="form-submit-btn inputCss"
                                                        onClick={handleSearch}
                                                        disabled={loading} // disable button during loading
                                                    >
                                                        {loading ? (
                                                            <div
                                                                className="spinner-border spinner-border-sm text-light"
                                                                role="status"
                                                                style={{ width: '1rem', height: '1rem' }}
                                                            ></div>
                                                        ) : (
                                                            <>
                                                                <i className="mdi mdi-magnify"></i> Search
                                                            </>
                                                        )}
                                                    </button>

                                                </div>
                                                <div className="form-group">
                                                    <button type="button" className="form-submit-btn inputCss" onClick={handleExport}>
                                                        <i className="mdi mdi-file-export"></i> Export
                                                    </button>
                                                </div>
                                                <div className="form-group">
                                                    <button type="button" className="form-submit-btn inputCss" onClick={handlePrint}>
                                                        <i className="mdi mdi-printer"></i> Print
                                                    </button>
                                                </div>
                                            </form>
                                        </div><hr />
                                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                    <tr>
                                                        <th>Sl.No</th>
                                                        <th>Charger ID</th>
                                                        <th>Session ID</th>
                                                        <th>User Name</th>
                                                        <th>Start Time</th>
                                                        <th>Stop Time</th>
                                                        <th>Unit Consumed</th>
                                                        <th>price</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ textAlign: "center" }}>
                                                    {loading ? (
                                                        <tr>
                                                            <td colSpan="8">Loading...</td>
                                                        </tr>
                                                    ) : (Array.isArray(tableData) && tableData.length > 0) ? (
                                                        tableData.map((session, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{deviceId || "-"}</td>
                                                                <td>{session.session_id || "-"}</td>
                                                                <td>{session.user || "-"}</td>
                                                                <td>{session.start_time || "-"}</td>
                                                                <td>{session.stop_time || "-"}</td>
                                                                <td>{session.unit_consumed || "-"}</td>
                                                                <td>{session.price || "-"}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="8">No devices found</td>
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

export default DeviceReport