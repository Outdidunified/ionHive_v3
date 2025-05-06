import React, { useState, useEffect } from "react";
import Header from '../components/Header';
import Footer from '../components/Footer';
import './styles.css';
import axios from 'axios';

const SessionLogs = () => { 
    const [chargerId, setChargerId] = useState('');
    const [responseData, setResponseData] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [responseDataStore, setResponseDataStore] = useState(JSON.parse(localStorage.getItem('sessionLogsData')) || []);

    useEffect(() => {
        localStorage.setItem('sessionLogsData', JSON.stringify(responseDataStore));
    }, [responseDataStore]); 

    const handleSearch = async () => {
        try {
            if (!chargerId) {
                setError('Charger ID is required.');
                return;
            }

            setLoading(true); // Start loading
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/sessionlog/checkChargerID?charger_id=${chargerId}`);

            if (Array.isArray(response.data.value)) {
                setResponseData(response.data.value);
                setResponseDataStore(response.data.value);
                // console.log(response.data.value);
                setError('');
                setChargerId('');
            } else {
                setResponseData([]);
                setResponseDataStore([]);
                setError('No data found.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            if (error.response && error.response.status === 401) {
                setError(error.response.data.message);
            } else {
                setError('Error fetching data. Please try again.');
            }
            setResponseData([]);
            setResponseDataStore([]);
        } finally {
            setLoading(false); 
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const [formData, setFormData] = useState({
        fromDate: "", toDate: "", selectField: "", value: "",
    });
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value,
        });
    };
    
    // Submit search filter formData
    const handleSubmit = (e) => {
        e.preventDefault();
        const { fromDate, toDate, selectField, value } = formData;
    
        const filteredData = responseDataStore.filter((item) => {
            const startTime = new Date(item.start_time);
            const stopTime = new Date(item.stop_time);
    
            // Check if fromDate or toDate is provided, otherwise ignore date filtering
            const isDateInRange = (!fromDate || startTime >= new Date(fromDate)) && (!toDate || stopTime <= new Date(toDate));
            const matchesValue = item[selectField]?.toString().toUpperCase().includes(value.toUpperCase());
    
            return isDateInRange && matchesValue;
        });
    
        if (filteredData.length > 0) {
            setResponseData(filteredData);
            setFormData({ fromDate: "", toDate: "", selectField: "", value: "" });
            setError(''); // Clear any previous error
        } else {
            setError('No data found for the provided filters.');
        }
    };
    
    return (
        <div className='container-scroller'>
            {/* Header */}
            <Header/>
            <div className="container-fluid page-body-wrapper">
                <div style={{transition: 'width 0.25s ease, margin 0.25s ease', width: 'calc(100%)', minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column'}}>
                    <div className="content-wrapper" style={{padding:'15px 15px 15px 15px'}}>
                        <div className="row">
                            <div className="col-lg-12 grid-margin stretch-card" style={{marginBottom: '0px'}}>
                                <div className="card">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-12 grid-margin">
                                                <div className="row">
                                                    <div className="col-4 col-xl-8">
                                                        <h4 className="card-title" style={{paddingTop:'10px', fontSize:'30px', fontWeight: 'bold'}}>
                                                            <span style={{color:'#57B657'}}>Session</span> Log
                                                        </h4>  
                                                    </div>
                                                    <div className="col-8 col-xl-4">
                                                        <div className="input-group">
                                                            <input type="text" className="form-control searchInputCss" placeholder="Charger ID" aria-label="search" aria-describedby="search" value={chargerId} onChange={(e) => setChargerId(e.target.value)} autoComplete="off" required/>
                                                            <div className="input-group-append">
                                                                <button className="btn btn-success" style={{borderRadius:'0 0 10px 0'}} type="button" onClick={handleSearch}>SEND</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-container">
                                            <form className="form-row" onSubmit={handleSubmit}>
                                                <div className="form-group">
                                                    <label htmlFor="fromDate" style={{fontSize:'17px'}}>From Date</label>
                                                    <input type="date" name="fromDate" value={formData.fromDate} onChange={handleInputChange} className="form-input inputCss"/>
                                                </div>
                                            
                                                <div className="form-group">
                                                    <label htmlFor="toDate" style={{fontSize:'17px'}}>To Date</label>
                                                    <input type="date" name="toDate" value={formData.toDate} onChange={handleInputChange} className="form-input inputCss" />
                                                </div>
                                            
                                                <div className="form-group">
                                                    <label htmlFor="selectField" style={{fontSize:'17px'}}>Select Field</label>
                                                    <select name="selectField" value={formData.selectField} onChange={handleInputChange} className="form-input inputCss" required>
                                                        <option value="" disabled>Select Field</option>
                                                        <option value="charger_id">Charger ID</option>
                                                        <option value="user">User</option>
                                                    </select>
                                                </div>
                                            
                                                <div className="form-group">
                                                    <label htmlFor="value" style={{fontSize:'17px'}}>Enter Value</label>
                                                    <input type="text" name="value" value={formData.value} onChange={handleInputChange} className="form-input inputCss" placeholder="Enter Value" autoComplete="off" required/>
                                                </div>

                                                <div className="form-group">
                                                    <button type="submit" className="form-submit-btn inputCss">Search</button>
                                                </div>
                                            </form>
                                        </div><hr/>
                                        <div className="table-responsive" style={{ overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', tableLayout: 'fixed', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                    <tr> 
                                                        <th>Sl. no.</th>
                                                        <th>Charger ID</th>
                                                        <th>Session ID</th>
                                                        <th>Start Time</th>
                                                        <th>Stop Time</th>
                                                        <th>Unit Consumed</th>
                                                        <th>Price</th>
                                                        <th>User</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{textAlign:'center'}}>
                                                    {loading ? (
                                                        <tr>
                                                            <td colSpan="8" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
                                                        </tr>
                                                    ) : error ? (
                                                        <tr>
                                                            <td colSpan="8" style={{ marginTop: '50px', textAlign: 'center' }}>Error: {error}</td>
                                                        </tr>
                                                    ) : (
                                                        responseData.length > 0 ? (
                                                            responseData.map((item, index) => (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{item.charger_id || '-'}</td>
                                                                    <td>{item.session_id || '-'}</td>
                                                                    <td>{formatTimestamp(item.start_time) || '-'}</td>
                                                                    <td>{formatTimestamp(item.stop_time) || '-'}</td>
                                                                    <td>{item.unit_consummed || '-'}</td>
                                                                    <td>{item.price || '-'}</td>
                                                                    <td>{item.user || '-'}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="8" style={{ marginTop: '50px', textAlign: 'center' }}>No data found.</td>
                                                            </tr>
                                                        )
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

export default SessionLogs;
