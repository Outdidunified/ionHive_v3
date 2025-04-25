import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

const RevenueReport = ({ userInfo, handleLogout }) => {
    const [firstTableData, setFirstTableData] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState("0.000");
    const [loading, setLoading] = useState(true);
    const [firstTableSearchQuery, setFirstTableSearchQuery] = useState("");
    const [secondTableData, setSecondTableData] = useState([]);
    const [secondTableSearchQuery, setSecondTableSearchQuery] = useState(""); 
    const isFetching = useRef(false);
    
    const associationId = userInfo?.data?.association_id;

    useEffect(() => {
        if (!associationId) return;  

        const fetchData = async () => {
            setLoading(true);
            try {
                if (isFetching.current) return;
                isFetching.current = true;
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/associationadmin/FetchSpecificChargerRevenue`,
                    { association_id:associationId }
                );

                setFirstTableData(response.data.revenueData || []);
                setTotalRevenue(response.data.TotalChargerRevenue || "0.000");
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

      
            fetchData();
        
    }, [associationId]);

    useEffect(() => {
        if (!associationId) return;
    
        const fetchSessionData = async () => {
            setLoading(true);
            try {
                // if (isFetching.current) return;  
                // isFetching.current = true;
               const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/associationadmin/FetchChargerListWithAllCostWithRevenue`,
                    { association_id: associationId }
                );
    
    
                if (response.data && response.data.revenueData) {
                    const processedSecondTableData = response.data.revenueData.flatMap(item =>
                        item.sessions ? item.sessions.map(session => ({
                            chargerId: item.charger_id,
                            sessionId: session.session_id,
                            customerName: session.customerName,
                            startTime: session.start_time,
                            stopTime: session.stop_time,
                            duration: session.duration,
                            location:session.location,
                            energyConsumed: session.energyConsumed,
                            price: session.price,
                            Revenue: session.Revenue
                        })) : []
                    );
    
    
                    setSecondTableData(processedSecondTableData);
                } else {
                    console.error("No revenueData found in response");
                    setSecondTableData([]);
                }
            } catch (error) {
                console.error("Error fetching session data:", error);
                setSecondTableData([]);
            } finally {
                setLoading(false);
                isFetching.current = false;
            }
        };
    
        fetchSessionData();
    }, [associationId]);

    const filteredFirstTableData = firstTableData.filter((item) => {
        const searchQuery = firstTableSearchQuery?.toLowerCase() || "";
        return item?.charger_id?.toString()?.toLowerCase()?.includes(searchQuery);
    }).reverse();
    
    const filteredSecondTableData = secondTableData.filter((session) => {
        const searchQuery = secondTableSearchQuery?.toLowerCase() || "";
        return (
            session?.chargerId?.toString()?.toLowerCase()?.includes(searchQuery) || 
            session?.sessionId?.toString()?.toLowerCase()?.includes(searchQuery) ||
            session?.customerName?.toString()?.toLowerCase()?.includes(searchQuery)
        );
    }).reverse();
    
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();  // This will format the date as a readable string
    };

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
                                            {/* Search Box Inside Table for First Table */}
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

                                        {/* Table Container for First Table */}
                                        <div className="table-responsive" style={{ flex: 1, overflowY: 'auto' }}>
                                            <table className="table table-striped text-center">
                                                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                                                    <tr>
                                                        <th>SI.NO</th>
                                                        <th>Charger ID</th>
                                                        <th>Revenue</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loading ? (
                                                        <tr><td colSpan="4" className="text-center">Loading...</td></tr>
                                                    ) : filteredFirstTableData.length > 0 ? (
                                                        filteredFirstTableData.map((item, index) => (
                                                            <tr key={index} style={{ height: "95px" }}>
                                                                <td>{index + 1}</td>
                                                                <td>{item.charger_id}</td>
                                                                <td>{item.Revenue}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan="3" className="text-center">No Data Available</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 mt-4">
    <div className="card">
        <div className="card-body">
            <h4 className="card-title mb-2">Charging Sessions</h4>

            {/* Search Box - wrapped in a row */}
            <div className="row mb-2">
                <div className="col-md-6 col-lg-4 ml-auto">
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
                            value={secondTableSearchQuery}
                            onChange={(e) => setSecondTableSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-striped w-100">
                    <thead style={{ textAlign: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
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
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="11" className="text-center">Loading...</td></tr>
                        ) : filteredSecondTableData.length > 0 ? (
                            filteredSecondTableData.map((item, index) => (
                                <tr key={index} style={{ height: "95px", textAlign: "center" }}>
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
                                    <td>{item.Revenue || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="11" className="text-center">No Data Available</td></tr>
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
