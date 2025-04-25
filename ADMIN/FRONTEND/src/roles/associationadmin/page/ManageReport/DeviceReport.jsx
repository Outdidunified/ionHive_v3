import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';
import axios from "axios";

const DeviceReport = ({ userInfo, handleLogout }) => {
    const [deviceData, setDeviceData] = useState([]);  // Ensure it's an empty array initially
    const [loadingDevice, setLoadingDevice] = useState(true);
    const [errorDevice, setErrorDevice] = useState(null);
    const fetchDataCalled = useRef(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectDevice, setDevice] = useState("");
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [deviceId, setDeviceId] = useState("");
    const [error, setError] = useState(null);
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    // Get manage charger data
    useEffect(() => {
        if (!fetchDataCalled.current) {
            const url = `${import.meta.env.VITE_API_URL}/associationadmin/FetchReportDevice`;

            axios.post(url, {
                association_id: userInfo?.data?.association_id,
            })
                .then((res) => {
                    setDeviceData(Array.isArray(res.data.data) ? res.data.data : []); // Ensure it's an array

                    setLoadingDevice(false);
                })
                .catch((err) => {
                    console.error("Error fetching data:", err);
                    const errorMessage = err.response?.data?.message || "Failed to Fetch Report Device";
                    setErrorDevice(errorMessage);
                    setLoadingDevice(false);
                });

            fetchDataCalled.current = true;
        }
    }, [userInfo]);


    // Handle Search Button Click
    const handleSearch = async () => {
        setError(null);

        if (!fromDate && !toDate && !selectDevice) {
            Swal.fire({
                title: "Missing Fields",
                text: "Please select From Date, To Date, and Device.",
                icon: "warning",
                timer: 3000,
                showConfirmButton: false,
            });
            return;
        }

        if (!fromDate && !toDate) {
            Swal.fire({
                title: "Missing Dates",
                text: "Please select both From Date and To Date.",
                icon: "warning",
                timer: 3000,
                showConfirmButton: false,
            });
            return;
        }


        if (!fromDate) {
            Swal.fire({
                title: "Missing From Date",
                text: "Please select a valid From Date.",
                icon: "warning",
                timer: 3000,
                showConfirmButton: false,
            });
            return;
        }

        if (!toDate) {
            Swal.fire({
                title: "Missing To Date",
                text: "Please select a valid To Date.",
                icon: "warning",
                timer: 3000,
                showConfirmButton: false,
            });
            return;
        }

        if (new Date(fromDate) > new Date(toDate)) {
            Swal.fire({
                title: "Invalid Date Range",
                text: "From Date cannot be later than To Date.",
                icon: "warning",
                timer: 3000,
                showConfirmButton: false,
            });
            return;
        }

        if (!selectDevice) {
            Swal.fire({
                title: "Missing Device",
                text: "Please select a device.",
                icon: "warning",
                timer: 3000,
                showConfirmButton: false,
            });
            return;
        }

        setLoading(true);
        setTableData([]);
        setDeviceId('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/associationadmin/DeviceReport`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ from_date: fromDate, to_date: toDate, device_id: selectDevice }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                const errorMessage = responseData?.message || `Something went wrong. Status: ${response.status}`;
                throw new Error(errorMessage);
            }

            if (responseData?.data?.sessions?.length > 0) {
                setDeviceId(responseData.data.device_id || "");
                setTableData(responseData.data.sessions || []);
            } else {
                Swal.fire({
                    title: "No Data",
                    text: "No data found for the selected date range.",
                    icon: "warning",
                    timer: 3000,
                    showConfirmButton: false,
                });
            }

        } catch (error) {
            console.error("Error fetching device report:", error);
            Swal.fire({
                title: "Error",
                text: error.message || "Something went wrong. Please try again.",
                icon: "error",
                timer: 3000,
                showConfirmButton: false,
            });
        } finally {
            setLoading(false);
        }
    };
    // Handle Print
    const handlePrint = () => {
        if (!tableData || tableData.length === 0) {
            Swal.fire({
                title: "Warning",
                text: "No data available to print.",
                icon: "warning",
                timer: 3000,
                showConfirmButton: false
            });
            return;
        }

        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Charger Data</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid black; padding: 10px; text-align: center; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h2>Charger Data</h2>
                    <table>
                        <thead>
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
                        <tbody>
                            ${tableData.map((session, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${deviceId || "-"}</td>
                                    <td>${session.session_id || "-"}</td>
                                    <td>${session.user || "-"}</td>
                                    <td>${session.start_time || "-"}</td>
                                    <td>${session.stop_time || "-"}</td>
                                    <td>${session.unit_consumed || "-"}</td>
                                    <td>${session.price || "-"}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();
    };

    // Handle Export to CSV
    const handleExport = () => {
        if (!tableData || tableData.length === 0) {
            Swal.fire({
                title: "Warning",
                text: "No data available to export.",
                icon: "warning",
                timer: 3000,
                showConfirmButton: false
            });
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += `"Sl.No","Charger ID","Session ID","User Name","Start Time","Stop Time","Unit Consumed","Price"\r\n`; // Column headers

        tableData.forEach((session, index) => {
            let chargerId = deviceId ? `"'${deviceId}"` : `"-"`; // Add a single quote before the Charger ID
            csvContent += `"${index + 1}",${chargerId},"${session.session_id || "-"}","${session.user || "-"}","${session.start_time || "-"}","${session.stop_time || "-"}","${session.unit_consumed || "-"}","${session.price || "-"}"\r\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.href = encodedUri;
        link.download = "charger_data.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                                                    <input
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
                                                    <input
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
                                                        <p style={{ color: "red" }}>{errorDevice}</p>
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
                                                    <button type="button" className="form-submit-btn inputCss" onClick={handleSearch}>
                                                        <i className="mdi mdi-magnify"></i> Search
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
                                                            <td colSpan="8" style={{ marginTop: "50px", textAlign: "center" }}>
                                                                Loading...
                                                            </td>
                                                        </tr>
                                                    ) : error ? (
                                                        <tr>
                                                            <td colSpan="8" style={{ marginTop: "50px", textAlign: "center" }}>
                                                                {error}
                                                            </td>
                                                        </tr>
                                                    ) : Array.isArray(tableData) && tableData.length > 0 ? (
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
                                                            <td colSpan="8" style={{ marginTop: "50px", textAlign: "center" }}>
                                                                No devices found
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

export default DeviceReport