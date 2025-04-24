import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles.css';

const Logs = () => {
    const [visibleTable, setVisibleTable] = useState('All');
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);

    // States for different types of messages
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchInput, setSearchInput] = useState('');

    const [heartbeatData, setHeartbeatData] = useState([]);
    const [bootNotificationData, setBootNotificationData] = useState([]);
    const [statusNotificationData, setStatusNotificationData] = useState([]);
    const [startStopData, setStartStopData] = useState([]);
    const [meterValuesData, setMeterValuesData] = useState([]);
    const [authorizationData, setAuthorizationData] = useState([]);
    const [rawData, setRawData] = useState([]);
    // console.log(rawData, 'raw data');

    const handleFrame = useCallback(async (parsedMessage) => {
        const currentDateTime = new Date().toLocaleString('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    
        const messageWithAllDataTimestamp = {
            DeviceID: parsedMessage.DeviceID,
            message: parsedMessage.message,
            dateTime: currentDateTime,
        };
    
        setRawData((prevData) => [...prevData, messageWithAllDataTimestamp]);

        setAllData((prevData) => {
            const updatedData = [...prevData, messageWithAllDataTimestamp];
            
            if (isSearching && searchInput) {
                setFilteredData((prevFilteredData) => {
                    const existingEntries = prevFilteredData.filter(item =>
                        item.DeviceID === messageWithAllDataTimestamp.DeviceID &&
                        item.dateTime === messageWithAllDataTimestamp.dateTime
                    );
    
                    let currentFilteredData = [];
                    switch (visibleTable) {
                        case 'Heartbeat':
                            currentFilteredData = heartbeatData;
                            break;
                        case 'BootNotification':
                            currentFilteredData = bootNotificationData;
                            break;
                        case 'StatusNotification':
                            currentFilteredData = statusNotificationData;
                            break;
                        case 'Start/Stop':
                            currentFilteredData = startStopData;
                            break;
                        case 'Meter/Values':
                            currentFilteredData = meterValuesData;
                            break;
                        case 'Authorization':
                            currentFilteredData = authorizationData;
                            break;
                        case 'All':
                        default:
                            currentFilteredData = updatedData;
                            break;
                    }
    
                    const filtered = currentFilteredData.filter(item =>
                        item.DeviceID.toUpperCase().includes(searchInput)
                    );
    
                    if (existingEntries.length === 0) {
                        return [...prevFilteredData, ...filtered];
                    }
                    return prevFilteredData;
                });
            } else {
                let visibleData = [];
                switch (visibleTable) {
                    case 'Heartbeat':
                        visibleData = heartbeatData;
                        break;
                    case 'BootNotification':
                        visibleData = bootNotificationData;
                        break;
                    case 'StatusNotification':
                        visibleData = statusNotificationData;
                        break;
                    case 'Start/Stop':
                        visibleData = startStopData;
                        break;
                    case 'Meter/Values':
                        visibleData = meterValuesData;
                        break;
                    case 'Authorization':
                        visibleData = authorizationData;
                        break;
                    case 'All':
                    default:
                        visibleData = updatedData;
                        break;
                }
                setFilteredData(visibleData);
            }
            
            return updatedData;
        });
    
        const messageWithTimestamp = {
            ...parsedMessage,
            dateTime: currentDateTime
        };
    
        switch (parsedMessage.message[2]) {
            case 'Heartbeat':
                setHeartbeatData(prevData => [...prevData, messageWithTimestamp]);
                break;
            case 'BootNotification':
                setBootNotificationData(prevData => [...prevData, messageWithTimestamp]);
                break;
            case 'StatusNotification':
                setStatusNotificationData(prevData => [...prevData, messageWithTimestamp]);
                break;
            case 'StartTransaction':
            case 'StopTransaction':
                setStartStopData(prevData => [...prevData, messageWithTimestamp]);
                break;
            case 'MeterValues':
                setMeterValuesData(prevData => [...prevData, messageWithTimestamp]);
                break;
            case 'Authorize':
                setAuthorizationData(prevData => [...prevData, messageWithTimestamp]);
                break;
            default:
                break;
        }
    }, [
        isSearching, searchInput, 
        heartbeatData, bootNotificationData, 
        statusNotificationData, startStopData, 
        meterValuesData, authorizationData, visibleTable
    ]);
    

    useEffect(() => {
        if (!socketRef.current) {
            const newSocket = new WebSocket('ws://172.232.109.123:7002');

            newSocket.addEventListener('open', (event) => {
                console.log('WebSocket connection opened:', event);
            });

            newSocket.addEventListener('message', async (response) => {
                const parsedMessage = JSON.parse(response.data);
                console.log('parsedMessage', parsedMessage);
                await handleFrame(parsedMessage);

            });

            newSocket.addEventListener('close', (event) => {
                console.log('WebSocket connection closed:', event);
            });

            newSocket.addEventListener('error', (event) => {
                console.error('WebSocket error:', event);
            });

            socketRef.current = newSocket;
            setLoading(false);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [handleFrame]);

    // Search data with switch case based on the selected table (visibleTable)
    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value.toUpperCase().trim();
        setSearchInput(inputValue);
        setIsSearching(inputValue !== '');

        // Choose the dataset based on the active table (visibleTable)
        let currentData = [];
        
        switch (visibleTable) {
            case 'Heartbeat':
                currentData = heartbeatData;
                break;
            case 'BootNotification':
                currentData = bootNotificationData;
                break;
            case 'StatusNotification':
                currentData = statusNotificationData;
                break;
            case 'Start/Stop':
                currentData = startStopData;
                break;
            case 'Meter/Values':
                currentData = meterValuesData;
                break;
            case 'Authorization':
                currentData = authorizationData;
                break;
            case 'All':
            default:
                currentData = allData;
                break;
        }

        // Apply filtering based on the DeviceID
        if (inputValue === '') {
            // If the search input is cleared, reset to the current visible table's data
            setFilteredData(currentData);
        } else {
            // Filter the current visible table's data by DeviceID
            const filtered = currentData.filter((item) =>
                item.DeviceID.toUpperCase().includes(inputValue)
            );
            setFilteredData(filtered);
        }
    };

    // Handle visibility buttons
    const handleTableVisibility = (table) => {
        setVisibleTable(table);
        setSearchInput('');
        setIsSearching(false);
        switch (table) {
            case 'All':
                setFilteredData(allData);
                break;
            case 'Heartbeat':
                setFilteredData(heartbeatData);
                break;
            case 'BootNotification':
                setFilteredData(bootNotificationData);
                break;
            case 'StatusNotification':
                setFilteredData(statusNotificationData);
                break;
            case 'Start/Stop':
                setFilteredData(startStopData);
                break;
            case 'Meter/Values':
                setFilteredData(meterValuesData);
                break;
            case 'Authorization':
                setFilteredData(authorizationData);
                break;
            default:
                setFilteredData(allData);
                break;
        }
    };

    const buttons = [
        { label: 'All', value: 'All' },
        { label: 'Heartbeat', value: 'Heartbeat' },
        { label: 'BootNotification', value: 'BootNotification' },
        { label: 'StatusNotification', value: 'StatusNotification' },
        { label: 'Start/Stop', value: 'Start/Stop' },
        { label: 'Meter/Values', value: 'Meter/Values' },
        { label: 'Authorization', value: 'Authorization' },
        { label: 'RawData', value: 'RawData' }
    ];

    const dataToShow = isSearching ? filteredData : allData;
    const heartbeatDataToShow = isSearching ? filteredData : heartbeatData;
    const bootNotificationDataToShow = isSearching ? filteredData : bootNotificationData;
    const statusNotificationDataToShow = isSearching ? filteredData : statusNotificationData;
    const startStopDataToShow = isSearching ? filteredData : startStopData;
    const meterValuesDataToShow = isSearching ? filteredData : meterValuesData;
    const authorizationDataToShow = isSearching ? filteredData : authorizationData;

    return (
        <div className='container-scroller'>
            {/* Header */}
            <Header/>
            <div className="container-fluid page-body-wrapper">
                <div style={{transition: 'width 0.25s ease, margin 0.25s ease', width: 'calc(100%)', minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column'}}>
                    <div className="content-wrapper" style={{padding:'15px 15px 15px 15px'}}>
                        <div className="row">
                            <div className="col-lg-12 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="row" style={{height:'55px'}}>
                                            <div className="col-md-12 grid-margin">
                                                <div className="row">
                                                    <div className="col-12 col-sm-6 col-md-6 col-xl-6 mb-2 mb-sm-0">
                                                        <div className="live-indicator" style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "red", color: "white", padding: "6px 10px", borderRadius: "10px 0 10px 0",fontWeight: "bold", fontSize: "16px", cursor: "pointer",  width: "150px", height: "40px"}}>                                                            
                                                            <span className="live-dot" style={{ width: "12px", height: "12px", backgroundColor: "white", borderRadius: "50%", marginRight: "6px", animation: "pulse 0.2s infinite" }}></span><span className="live-text">EVSE Live Log</span>
                                                        </div> 
                                                    </div>
                                                    {visibleTable !=='RawData'&&  (
                                                       <div className="col-12 col-sm-6 col-md-6 col-xl-6">
                                                            <div className="input-group">
                                                                <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                                    <span className="input-group-text searchIconCss" id="search">
                                                                    <i className="icon-search" style={{color:'white'}}></i>
                                                                    </span>
                                                                </div>
                                                                <input type="text" className="form-control searchInputCss" style={{borderRadius: "0 0 10px 0"}} placeholder="Search now" aria-label="search" aria-describedby="search" autoComplete="off"  value={searchInput} onChange={handleSearchInputChange}/>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row" style={{ paddingTop:'50px'}}>
                                            <div className="col-md-12 grid-margin">
                                                <div className="row justify-content-center">
                                                    <div className="col-12 col-xl-12 text-center" style={{paddingLeft: '0px', paddingRight: '0px'}}>
                                                       {buttons.map(button => (
                                                            <button
                                                                key={button.value}
                                                                type="button"
                                                                className={`btn ${visibleTable === button.value ? 'btn-primary' : 'btn-outline-primary'} btn-fw`}
                                                                style={{ marginBottom: '10px', marginRight: '10px'}}
                                                                onClick={() => handleTableVisibility(button.value)}
                                                            >
                                                                {button.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* All */}
                                        {visibleTable === 'All' && (
                                            <div className="table-responsive" style={{overflowY: 'auto' }}>
                                                <table className="table table-striped">
                                                    <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                        <tr>
                                                            <th>Date/Time</th>
                                                            <th>Device ID</th>
                                                            <th>Message</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{ textAlign: 'center' }}>
                                                        {loading ? (
                                                            <tr>
                                                                <td colSpan="3" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
                                                            </tr>
                                                        ) : (
                                                            Array.isArray(dataToShow) && dataToShow.length > 0 ? (
                                                                dataToShow.slice().reverse().map((allItem, index) => (
                                                                    <tr key={index}>
                                                                        <td>{allItem.dateTime || '-'}</td>
                                                                        <td>{allItem.DeviceID || '-'}</td>
                                                                        <td>
                                                                            {allItem.message ? (
                                                                                <textarea value={JSON.stringify(allItem.message)}  style={{ border: 'none', outline: 'none', background:'none', width: '100%' }} readOnly rows="5" cols="150" />
                                                                            ) : (
                                                                                '-'
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="3" style={{ marginTop: '50px', textAlign: 'center' }}>No AllData found</td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        {/* Heartbeat */}
                                        {visibleTable === 'Heartbeat' && (
                                            <div className="table-responsive" style={{ maxHeight: '590px', overflowY: 'auto' }}>
                                                <table className="table table-striped">
                                                    <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                        <tr> 
                                                            <th>Date/Time</th>
                                                            <th>Device ID</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{textAlign:'center'}}>
                                                        {loading ? (
                                                            <tr>
                                                                <td colSpan="2" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
                                                            </tr>
                                                        ) : (
                                                            Array.isArray(heartbeatDataToShow) && heartbeatDataToShow.length > 0 ? (
                                                                heartbeatDataToShow.slice().reverse().map((heartbeatItem, index) => (
                                                                <tr key={index}>
                                                                    <td>{heartbeatItem.dateTime || '-'}</td>
                                                                    <td>{heartbeatItem.DeviceID || '-'}</td>
                                                                </tr>
                                                            ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="2" style={{ marginTop: '50px', textAlign: 'center' }}>No Heartbeat found</td>
                                                                </tr>
                                                            )
                                                        )}                                                         
                                                    </tbody>
                                                </table>
                                            </div>   
                                        )}

                                        {/* BootNotification */}
                                        {visibleTable === 'BootNotification' && (
                                            <div className="table-responsive" style={{ maxHeight: '590px', overflowY: 'auto' }}>
                                                <table className="table table-striped">
                                                    <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                        <tr> 
                                                            <th>Date/Time</th>
                                                            <th>Device ID</th>
                                                            <th>Charge Point Vendor</th>
                                                            <th>Charge Point Model</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{textAlign:'center'}}>
                                                        {loading ? (
                                                            <tr>
                                                                <td colSpan="4" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
                                                            </tr>
                                                        ) : (
                                                            Array.isArray(bootNotificationDataToShow) && bootNotificationDataToShow.length > 0 ? (
                                                                bootNotificationDataToShow.slice().reverse().map((bootNotificationItem, index) => {
                                                                    // Extract nested properties from the message array
                                                                    const chargePointVendor = bootNotificationItem.message[3]?.chargePointVendor || '-';
                                                                    const chargePointModel = bootNotificationItem.message[3]?.chargePointModel || '-';
                                                            
                                                                    return (
                                                                        <tr key={index}>
                                                                            <td>{bootNotificationItem.dateTime || '-'}</td> 
                                                                            <td>{bootNotificationItem.DeviceID || '-'}</td>
                                                                            <td>{chargePointVendor}</td> 
                                                                            <td>{chargePointModel}</td>   
                                                                        </tr>
                                                                    );
                                                                })
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="4" style={{ marginTop: '50px', textAlign: 'center' }}>No BootNotification found</td>
                                                                </tr>
                                                            )
                                                        )}                                                               
                                                    </tbody>
                                                </table>
                                            </div>    
                                        )}

                                        {/* StatusNotification */}
                                        {visibleTable === 'StatusNotification' && (
                                            <div className="table-responsive" style={{ maxHeight: '590px', overflowY: 'auto' }}>
                                                <table className="table table-striped">
                                                    <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                        <tr> 
                                                            <th>Date/Time</th>
                                                            <th>Device ID</th>
                                                            <th>Connector ID</th>
                                                            <th>Status</th>
                                                            <th>Error Code</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{textAlign:'center'}}>
                                                        {loading ? (
                                                            <tr>
                                                                <td colSpan="5" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
                                                            </tr>
                                                        ) : (
                                                            Array.isArray(statusNotificationDataToShow) && statusNotificationDataToShow.length > 0 ? (
                                                                statusNotificationDataToShow.slice().reverse().map((statusNotificationItem, index) => {
                                                                    const getStatusStyle = (status) => {
                                                                        switch (status) {
                                                                        case 'Available':
                                                                            return { color: '#4B49AC' };
                                                                        case 'Preparing':
                                                                        case 'Charging':
                                                                            return { color: 'green' };
                                                                        case 'Finishing':
                                                                            return { color: '#ff28ec' };  
                                                                        default:
                                                                            return { color: 'red' };
                                                                        }
                                                                    };
                                                                    // Extract nested properties from the message array
                                                                    const connectorId = statusNotificationItem.message[3]?.connectorId || '-';
                                                                    const status = statusNotificationItem.message[3]?.status || '-';
                                                                    const errorCode = statusNotificationItem.message[3]?.errorCode || '-';

                                                                    return (
                                                                        <tr key={index}>
                                                                            <td>{statusNotificationItem.dateTime || '-'}</td> 
                                                                            <td>{statusNotificationItem.DeviceID || '-'}</td>
                                                                            <td>{connectorId}</td> 
                                                                            <td style={getStatusStyle(status)}><b>{status}</b></td>  
                                                                            <td>{errorCode}</td>
                                                                        </tr>
                                                                    );
                                                                })
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="5" style={{ marginTop: '50px', textAlign: 'center' }}>No StatusNotification found</td>
                                                                </tr>
                                                            )
                                                        )}                                                                
                                                    </tbody>
                                                </table>
                                            </div>    
                                        )}

                                        {/* Start/Stop */}
                                        {visibleTable === 'Start/Stop' && (
                                            <div className="table-responsive" style={{ maxHeight: '590px', overflowY: 'auto' }}>
                                                <table className="table table-striped">
                                                    <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                        <tr> 
                                                            <th>Date/Time</th>
                                                            <th>Device ID</th>
                                                            <th>Start Transaction /Stop Transaction</th>
                                                            <th>Connector ID</th>
                                                            <th>Tag ID</th>
                                                            <th>TransactionID</th>
                                                            <th>Reason</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{textAlign:'center'}}>
                                                    {loading ? (
                                                            <tr>
                                                                <td colSpan="7" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
                                                            </tr>
                                                        ) : (
                                                            Array.isArray(startStopDataToShow) && startStopDataToShow.length > 0 ? (
                                                                startStopDataToShow.slice().reverse().map((startStopItem, index) => {
                                                                    // Extract the type of transaction
                                                                    const transactionType = startStopItem.message[2];

                                                                    // Extract nested properties from the message array
                                                                    const connectorId = startStopItem.message[3]?.connectorId || '-';
                                                                    const idTag = startStopItem.message[3]?.idTag || '-';
                                                                    const transactionId = startStopItem.message[3]?.transactionId || '-';
                                                                    const reason = startStopItem.message[3]?.reason || '-';

                                                                    return (
                                                                        <tr key={index}>
                                                                            <td>{startStopItem.dateTime || '-'}</td> 
                                                                            <td>{startStopItem.DeviceID || '-'}</td>
                                                                            <td>
                                                                                {transactionType === 'StartTransaction' ? (
                                                                                    <span style={{ color: 'green' }}><b>Start</b></span>
                                                                                ) : transactionType === 'StopTransaction' ? (
                                                                                    <span style={{ color: 'red' }}><b>Stop</b></span>
                                                                                ) : (
                                                                                    '-'
                                                                                )}
                                                                            </td>                                                                            
                                                                            <td>{connectorId}</td> 
                                                                            <td>{idTag}</td>   
                                                                            <td>{transactionId}</td>
                                                                            <td>{reason}</td>
                                                                        </tr>
                                                                    );
                                                                })
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="7" style={{ marginTop: '50px', textAlign: 'center' }}>No Start/Stop found</td>
                                                                </tr>
                                                            )
                                                        )}                                                                
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Meter/Values */}
                                        {visibleTable === 'Meter/Values' && (
                                            <div className="table-responsive" style={{ maxHeight: '590px', overflowY: 'auto' }}>
                                                <table className="table table-striped">
                                                    <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                        <tr> 
                                                            <th>Date/Time</th>
                                                            <th>Device ID</th>
                                                            <th>Connector ID</th>
                                                            <th>TransactionID</th>
                                                            <th>Meter Values</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{textAlign:'center'}}>
                                                    {loading ? (
                                                            <tr>
                                                                <td colSpan="5" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
                                                            </tr>
                                                        ) : (
                                                            Array.isArray(meterValuesDataToShow) && meterValuesDataToShow.length > 0 ? (
                                                                meterValuesDataToShow.slice().reverse().map((meterValuesItem, index) => {
                                                                    // Extract nested properties from the message array
                                                                    const connectorId = meterValuesItem.message[3]?.connectorId || '-';
                                                                    const transactionId = meterValuesItem.message[3]?.transactionId || '-';
                                                                    // const meterValue = meterValuesItem.message[3]?.meterValue || '-';
                                                            
                                                                    // Format meter values
                                                                    const meterValues = meterValuesItem.message[3]?.meterValue || [];
                                                                    const sampledValues = meterValues[0]?.sampledValue || [];

                                                                    const formattedMeterValues = sampledValues.reduce((acc, { value, unit }) => {
                                                                        switch (unit) {
                                                                            case 'V':
                                                                                acc.voltage = `Voltage: ${value}`;
                                                                                break;
                                                                            case 'A':
                                                                                acc.current = `Current: ${value}`;
                                                                                break;
                                                                            case 'W':
                                                                                acc.power = `Power: ${value}`;
                                                                                break;
                                                                            case 'Wh':
                                                                                acc.energy = `Energy: ${value}`;
                                                                                break;
                                                                            default:
                                                                                break;
                                                                        }
                                                                        return acc;
                                                                    }, {});

                                                                    return (
                                                                        <tr key={index}>
                                                                            <td>{meterValuesItem.dateTime || '-'}</td> 
                                                                            <td>{meterValuesItem.DeviceID || '-'}</td>
                                                                            <td>{connectorId}</td> 
                                                                            <td>{transactionId}</td>   
                                                                            <td>
                                                                                {formattedMeterValues.voltage || '-'}{', '}
                                                                                {formattedMeterValues.current || '-'}{', '}
                                                                                {formattedMeterValues.power || '-'}{', '}
                                                                                {formattedMeterValues.energy || '-'}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="5" style={{ marginTop: '50px', textAlign: 'center' }}>No Meter/Values found</td>
                                                                </tr>
                                                            )
                                                        )}                                                                
                                                    </tbody>
                                                </table>
                                            </div>    
                                        )}

                                        {/* Authorization */}
                                        {visibleTable === 'Authorization' && (
                                            <div className="table-responsive" style={{ maxHeight: '590px', overflowY: 'auto' }}>
                                                <table className="table table-striped">
                                                    <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                        <tr> 
                                                            <th>Date/Time</th>
                                                            <th>Device ID</th>
                                                            <th>Tag ID</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{textAlign:'center'}}>
                                                        {loading ? (
                                                            <tr>
                                                                <td colSpan="3" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
                                                            </tr>
                                                        ) : (
                                                            Array.isArray(authorizationDataToShow) && authorizationDataToShow.length > 0 ? (
                                                                authorizationDataToShow.slice().reverse().map((authorizationItem, index) => {
                                                                    // Extract nested properties from the message array
                                                                    const idTag = authorizationItem.message[3]?.idTag || '-';
                                                                    
                                                                    return (
                                                                        <tr key={index}>
                                                                            <td>{authorizationItem.dateTime || '-'}</td> 
                                                                            <td>{authorizationItem.DeviceID || '-'}</td>
                                                                            <td>{idTag}</td>
                                                                        </tr>
                                                                    );
                                                                })
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="3" style={{ marginTop: '50px', textAlign: 'center' }}>No Authorization found</td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>    
                                        )}

                                        {/* RawData */}
                                        {visibleTable === 'RawData' && (
                                            <div className="table-responsive" style={{ maxHeight: '590px', overflowY: 'auto' }}>
                                                <table className="table table-striped">
                                                    <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                        <tr>
                                                            <th>RawData</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{ textAlign: 'center' }}>
                                                        {loading ? (
                                                            <tr>
                                                                <td colSpan="1" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
                                                            </tr>
                                                        ) : (
                                                            Array.isArray(rawData) && rawData.length > 0 ? (
                                                                rawData.slice().reverse().map((rawDataItem, index) => (
                                                                    <tr key={index}>
                                                                        <td>
                                                                            {rawDataItem ? (
                                                                                <textarea value={JSON.stringify(rawDataItem, null)}  style={{ border: 'none', outline: 'none', background:'none', width: '100%' }} readOnly rows="4" cols="200" />
                                                                            ) : (
                                                                                '-'
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="1" style={{ marginTop: '50px', textAlign: 'center' }}>No RawData found</td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
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

export default Logs;
