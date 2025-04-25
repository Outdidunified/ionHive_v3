import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useOcppConfig from '../../hooks/Occp/Occp.configHooks';
import InputField from '../../../../utils/InputField';


const OcppConfig = ({ userInfo, handleLogout }) => {
   const {
    chargerId,setChargerId,commandsLibrary,setCommandsLibrary,selectedCommand,setSelectedCommand,
response,setResponse,
getActionPayloadCalled,
reservationId, setReservationId,connectorId, setConnectorId,
availabilityType, setAvailabilityType,keyType, setKeyType,
configKey, setConfigKey,customConfigKey, setCustomConfigKey,
value, setValue,vendorId, setVendorId,
messageId, setMessageId,
data, setData,
loading,
customKeys, setCustomKeys,
location, setLocation,
retries, setRetries,
retryInterval, setRetryInterval,
startTime, setStartTime,
stopTime, setStopTime,
connectorIds, setConnectorIds,
idTag, setIdTag,
transaction, setTransaction,
reserveConnectorId, setReserveConnectorId,
expiryDate, setExpiryDate,
reserveIdTag, setReserveIdTag,
resetType, setResetType,
triggerMessage, setTriggerMessage,
triggerConnectorId, setTriggerConnectorId,
unlockConnectorConnectorId, setUnlockConnectorConnectorId,
locationUpdatdeFirmware,setLocationUpdatdeFirmware,
retriesUpdatdeFirmware,setRetriesUpdatdeFirmware,
retryIntervalUpdatdeFirmware,setRetryIntervalUpdatdeFirmware,
retrieveDate, setRetrieveDate,
listVersion, setListVersion,
updateType, setUpdateType,
addUpdateList, setAddUpdateList,
deleteList, setDeleteList,
sendEmptyListWhenFull, setSendEmptyListWhenFull,
errorMessage, setErrorMessage,
filterType, setFilterType,
clearChargingProfileConnectorId,
setClearChargingProfileConnectorId,
stackLevel,setStackLevel,
chargingProfilePurpose, setChargingProfilePurpose,
clearChargingProfileID, setClearChargingProfileID,
getCompositeScheduleConnectorId, setGetCompositeScheduleConnectorId,
duration, setDuration,
chargingRateUnit, setChargingRateUnit,
setChargingProfileConnectorID, setSetChargingProfileConnectorID,
chargingProfileId, setChargingProfileId,
keyTypeData, setKeyTypeData,
command, setCommand,
ip, setIp,
port, setPort,
url, setUrl,
chargerids, setChargerids,
faultParametersConfig, setFaultParametersConfig,
maxCurrent, SetMaxCurrent,
onCommandClick,
handleCancelReservation,
handleChangeAvailability,
handleChangeConfiguration,
handleClearCache,
handleClearChargingProfile,
handleDataTransferCustom,
handleDataTransfer,
handleGetCompositeSchedule,
handleSelectAll,
handleGetConfiguration,
handleGetDiagnostics,
handleGetLocalListVersion,
handleRemoteStartTransaction,
handleRemoteStopTransaction,
handleReserveNow,
handleReset,
handleTriggerMessage,
handleUnlockConnector,
handleUpdateFirmware,
handleSendLocalList,
handleSetChargingProfile,
handleChargerIdChange
   }=useOcppConfig(userInfo);

    return (
        <div className='container-scroller'>
            {/* Header */}
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="container-fluid page-body-wrapper">
                {/* Sidebar */}
                <Sidebar/>
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-12 grid-margin">
                                <div className="row">
                                    <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                                        <h3 className="font-weight-bold">OCPP Config</h3>
                                    </div>
                                    {/* <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={handleOcppConfigLog}><i className="mdi mdi-eye"></i> OcppConfig Log</button>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="row" style={{height:'50px'}}>
                                            <div className="col-md-12 grid-margin">
                                                <div className="row">
                                                    <div className="col-4 col-xl-8">
                                                        <div style={{fontSize:'20px', paddingTop:'10px'}}><span style={{ fontWeight: 'bold' }}><span style={{color:'#57B657'}}>OCPP</span> Configuration</span></div> 
                                                    </div>
                                                    <div className="col-8 col-xl-4">
                                                        <div className="input-group">
                                                            <InputField  style={{borderRadius: '10px 0 10px 0', borderColor:'#57B657'}} placeholder="Charger ID" ariaLabel="search" ariadescribedby="search" autoComplete="off" value={chargerId} onChange={handleChargerIdChange} required/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row" style={{ textAlign: 'center' }}>
    <div className="col-md-12">
        <div className="card-body">
            <h4 style={{ textAlign: 'center', marginBottom: '0px' }}>
                <span style={{ fontWeight: 'bold' }}>Commands</span>
            </h4>
            <div className="template-demo">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '100px' }}>
                        <div className="spinner" role="status">
                            
                        </div>
                    </div>
                ) : commandsLibrary.length > 0 ? (
                    commandsLibrary.map((command, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`btn ${selectedCommand === command.action ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => onCommandClick(index)}
                        >
                            {command.action}
                        </button>
                    ))
                ) : (
                    <p className="text-center">No commands available</p>
                )}
            </div>
        </div>
    </div>
</div>

                                        {selectedCommand === "CancelReservation" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleCancelReservation}>
                                                            <div className="form-group">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>ID of the Existing Reservation:</label>
                                                                <InputField  id="exampleInputUsername1" placeholder="" style={{ height: '30px' }} value={reservationId} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setReservationId(sanitizedValue); }} required autoComplete="off"/>
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{color:'rgb(233 30 157)'}}>Command Response</h4>
                                                        {response ? (
                                                            <textarea style={{ border: 'none', outline: 'none', background:'none', width: '100%', backgroundColor:'#f5f7ff' }} value={response ? JSON.stringify(response, null, 2) : ""} readOnly rows="22"/>
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "ChangeAvailability" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleChangeAvailability}>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Connector ID (integer):</label>
                                                                <InputField  id="exampleInputUsername1" placeholder="If empty, 0 = charge point as a whole" style={{ height: '30px' }} autoComplete="off" value={connectorId} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setConnectorId(sanitizedValue);}}/>
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Availability Type:</label>
                                                                <select className="form-control" style={{ height: '31px' }} value={availabilityType} onChange={(e) => setAvailabilityType(e.target.value)}>
                                                                    <option >-- Select --</option>
                                                                    <option value="INOPERATIVE">INOPERATIVE</option>
                                                                    <option value="OPERATIVE">OPERATIVE</option>
                                                                </select>
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{color:'rgb(233 30 157)'}}>Command Response</h4>
                                                        {response ? (
                                                            <textarea style={{ border: 'none', outline: 'none', background:'none', width: '100%', backgroundColor:'#f5f7ff' }} value={response ? JSON.stringify(response, null, 2) : ""} readOnly rows="22"/>
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "ChangeConfiguration" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleChangeConfiguration}>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="keyType" style={{marginBottom:'0px'}}>Key Type:</label>
                                                                <select className="form-control" style={{ height: '31px' }} id="keyType" value={keyType} onChange={(e) => setKeyType(e.target.value)}>
                                                                    <option >-- Select --</option>
                                                                    <option value="Predefined">Predefined</option>
                                                                    <option value="Custom">Custom</option>
                                                                </select>
                                                            </div>

                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="configKey" style={{ marginBottom: '0px' }}>Configuration Key:</label>
                                                                <select className="form-control" style={{ height: '31px' }} id="configKey" name="configKey" value={configKey} onChange={(e) => setConfigKey(e.target.value)} disabled={keyType !== 'Predefined'}>
                                                                    <option >-- Select --</option>
                                                                    <option value="AllowOfflineTxForUnknownId">AllowOfflineTxForUnknownId (boolean)</option>
                                                                    <option value="AuthorizationCacheEnabled">AuthorizationCacheEnabled (boolean)</option>
                                                                    <option value="AuthorizeRemoteTxRequests">AuthorizeRemoteTxRequests (boolean)</option>
                                                                    <option value="BlinkRepeat">BlinkRepeat (in times)</option>
                                                                    <option value="ClockAlignedDataInterval">ClockAlignedDataInterval (in seconds)</option>
                                                                    <option value="ConnectionTimeOut">ConnectionTimeOut (in seconds)</option>
                                                                    <option value="ConnectorPhaseRotation">ConnectorPhaseRotation (comma separated list)</option>
                                                                    <option value="HeartbeatInterval">HeartbeatInterval (in seconds)</option>
                                                                    <option value="LightIntensity">LightIntensity (in %)</option>
                                                                    <option value="LocalAuthListEnabled">LocalAuthListEnabled (boolean)</option>
                                                                    <option value="LocalAuthorizeOffline">LocalAuthorizeOffline (boolean)</option>
                                                                    <option value="LocalPreAuthorize">LocalPreAuthorize (boolean)</option>
                                                                    <option value="MaxEnergyOnInvalidId">MaxEnergyOnInvalidId (in Wh)</option>
                                                                    <option value="MeterValueSampleInterval">MeterValueSampleInterval (in seconds)</option>
                                                                    <option value="MeterValuesAlignedData">MeterValuesAlignedData (comma separated list)</option>
                                                                    <option value="MeterValuesSampledData">MeterValuesSampledData (comma separated list)</option>
                                                                    <option value="MeterValuesSignatureContexts">MeterValuesSignatureContexts (comma separated list; specific to OCMF)</option>
                                                                    <option value="MinimumStatusDuration">MinimumStatusDuration (in seconds)</option>
                                                                    <option value="ResetRetries">ResetRetries (in times)</option>
                                                                    <option value="StopTransactionOnEVSideDisconnect">StopTransactionOnEVSideDisconnect (boolean)</option>
                                                                    <option value="StopTransactionOnInvalidId">StopTransactionOnInvalidId (boolean)</option>
                                                                    <option value="StopTransactionSignatureContexts">StopTransactionSignatureContexts (comma separated list; specific to OCMF)</option>
                                                                    <option value="StopTransactionSignatureFormat">StopTransactionSignatureFormat (string; specific to OCMF)</option>
                                                                    <option value="StopTxnAlignedData">StopTxnAlignedData (comma separated list)</option>
                                                                    <option value="StopTxnSampledData">StopTxnSampledData (comma separated list)</option>
                                                                    <option value="TransactionMessageAttempts">TransactionMessageAttempts (in times)</option>
                                                                    <option value="TransactionMessageRetryInterval">TransactionMessageRetryInterval (in seconds)</option>
                                                                    <option value="UnlockConnectorOnEVSideDisconnect">UnlockConnectorOnEVSideDisconnect (boolean)</option>
                                                                    <option value="WebSocketPingInterval">WebSocketPingInterval (in seconds)</option>
                                                                </select>
                                                            </div>

                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="customConfigKey" style={{marginBottom:'0px'}}>Custom Configuration Key:</label>
                                                                <InputField  id="customConfigKey" style={{ height: '30px' }} value={customConfigKey} onChange={(e) => setCustomConfigKey(e.target.value)} disabled={keyType !== 'Custom'}/>
                                                            </div>

                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="value" style={{marginBottom:'0px'}}>Value:</label>
                                                                <InputField  id="value" style={{ height: '30px' }} value={value} onChange={(e) => { const numericValue = e.target.value.replace(/[^0-9]/g, ''); setValue(numericValue);}}/>
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{color:'rgb(233 30 157)'}}>Command Response</h4>
                                                        {response ? (
                                                            <textarea style={{ border: 'none', outline: 'none', background:'none', width: '100%', backgroundColor:'#f5f7ff' }} value={response ? JSON.stringify(response, null, 2) : ""} readOnly rows="22"/>
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "ClearCache" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleClearCache}>
                                                            <div style={{ display: 'flex',justifyContent: 'center'}}>
                                                                <h5 className="card-description">No parameters required.</h5>
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{color:'rgb(233 30 157)'}}>Command Response</h4>
                                                        {response ? (
                                                            <textarea style={{ border: 'none', outline: 'none', background:'none', width: '100%', backgroundColor:'#f5f7ff' }} value={response ? JSON.stringify(response, null, 2) : ""} readOnly rows="22"/>
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "ClearChargingProfile" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleClearChargingProfile}>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="filterType" style={{ marginBottom: '0px' }}>Filter Type:</label>
                                                                <select className="form-control" style={{ height: '31px' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                                                    <option>-- Select --</option>
                                                                    <option value="ChargingProfileid">ChargingProfileid</option>
                                                                    <option value="OtherParameters">OtherParameters</option>
                                                                </select>
                                                            </div>

                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="chargingProfileId" style={{ marginBottom: '0px' }}>Charging Profile ID:</label>
                                                                <InputField  id="chargingProfileId" style={{ height: '30px' }} autoComplete="off" value={clearChargingProfileID}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        const sanitizedValue = value.replace(/[^0-9]/g, '');
                                                                        setClearChargingProfileID(sanitizedValue);
                                                                    }}/>
                                                            </div>

                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="connectorId" style={{ marginBottom: '0px' }}>Connector ID (integer):</label>
                                                                <InputField  id="connectorId" placeholder="0 = charge point as a whole. Leave empty to not set." style={{ height: '30px' }} autoComplete="off" value={clearChargingProfileConnectorId}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        const sanitizedValue = value.replace(/[^0-9]/g, '');
                                                                        setClearChargingProfileConnectorId(sanitizedValue);
                                                                    }} disabled={filterType === 'ChargingProfileid'}
                                                                />
                                                            </div>

                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="chargingProfilePurpose" style={{ marginBottom: '0px' }}>Charging Profile Purpose:</label>
                                                                <select className="form-control" style={{ height: '31px' }} value={chargingProfilePurpose} onChange={(e) => setChargingProfilePurpose(e.target.value)}>
                                                                    <option>-- Empty --</option>
                                                                    <option value="CHARGE_POINT_MAX_PROFILE">CHARGE_POINT_MAX_PROFILE</option>
                                                                    <option value="TX_DEFAULT_PROFILE">TX_DEFAULT_PROFILE</option>
                                                                    <option value="TX_PROFILE">TX_PROFILE</option>
                                                                </select>
                                                            </div>

                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="stackLevel" style={{ marginBottom: '0px' }}>Stack Level (integer):</label>
                                                                <InputField  id="stackLevel" style={{ height: '30px' }} autoComplete="off" value={stackLevel}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        const sanitizedValue = value.replace(/[^0-9]/g, '');
                                                                        setStackLevel(sanitizedValue);
                                                                    }} disabled={filterType === 'ChargingProfileid'}
                                                                />
                                                            </div>

                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Command Response</h4>
                                                        {response ? (
                                                            <textarea
                                                                style={{ border: 'none', outline: 'none', background: 'none', width: '100%', backgroundColor: '#f5f7ff' }}
                                                                value={JSON.stringify(response, null, 2)}
                                                                readOnly
                                                                rows="22"
                                                            />
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "DataTransfer" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="keyType" style={{marginBottom:'0px'}}>Key Type:</label>
                                                                <select className="form-control" style={{ height: '31px' }} value={keyTypeData} onChange={(e) => setKeyTypeData(e.target.value)}>
                                                                    <option >-- Select --</option>
                                                                    <option value="Predefined">Predefined</option>
                                                                    <option value="Custom">Custom</option>
                                                                </select>
                                                            </div>
                                                            {keyTypeData === "Custom" && (
                                                                <>
                                                                    <form className="forms-sample" onSubmit={handleDataTransferCustom}>
                                                                        <div className="form-group paddingInput">
                                                                            <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Vendor ID (String):</label>
                                                                            <InputField id="exampleInputUsername1" placeholder="" style={{ height: '30px' }} value={vendorId}
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value;
                                                                                    // Allow only alphabetic characters
                                                                                    if (/^[A-Za-z]*$/.test(value)) {
                                                                                    setVendorId(value);
                                                                                    }
                                                                                }} 
                                                                                // onChange={(e) => setVendorId(e.target.value)} 
                                                                                autoComplete="off" required
                                                                            />
                                                                        </div>
                                                                        <div className="form-group paddingInput">
                                                                            <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Message ID (String):</label>
                                                                            <InputField id="exampleInputUsername1" placeholder="optional" style={{ height: '30px' }} autoComplete="off" value={messageId} onChange={(e) => setMessageId(e.target.value)}/>
                                                                        </div>
                                                                        <div className="form-group paddingInput">
                                                                            <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Data (Text):</label>
                                                                            <textarea type="text" className="form-control" id="exampleInputUsername1" placeholder="optional" autoComplete="off" value={data} onChange={(e) => setData(e.target.value)}/>
                                                                        </div>
                                                              
                                                                        {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                                        <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                            <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                                        </div>
                                                                    </form>
                                                                </>
                                                            )}
                                                            {keyTypeData === "Predefined" && (
                                                                <form className="forms-sample" onSubmit={handleDataTransfer}>
                                                                    <div className="form-group paddingInput">
                                                                        <label htmlFor="keyType" style={{marginBottom:'0px'}}>List of commands:</label>
                                                                        <select className="form-control" style={{ height: '31px' }} value={command} onChange={(e) => setCommand(e.target.value)}>
                                                                            <option >-- Select --</option>
                                                                            <option value="SetServerIpPortURL">Set Server IP Port URL</option>
                                                                            <option value="SetChargerID">Set Charger ID</option>
                                                                            <option value="RCONF">Read Charger Configuration</option>
                                                                            <option value="HWVER">Get Hardware Version</option>
                                                                            <option value="GET_CSQ">Get Signal Quality</option>
                                                                            <option value="FWVER">Get Firmware Version</option>
                                                                            <option value="STARTOTA">Update Firmware</option>
                                                                            <option value="RESTART">Restart Charger</option>
                                                                            <option value="GET_TV">Get Fault Parameters Config</option>
                                                                            <option value="SetFaultParametersConfig">Set Fault Parameters Config</option>
                                                                            <option value="CALIBENB">Auto Calibration Enabling</option>
                                                                            <option value="SetMaxCurrent">Set Max Current</option>
                                                                        </select>
                                                                    </div>
                                                            
                                                                    {keyTypeData === "Predefined" && command === "SetServerIpPortURL" && (
                                                                        <div className="form-group paddingInput">
                                                                            <div className="row">
                                                                                <div className="col-md-6">
                                                                                    <label htmlFor="keyType" style={{marginBottom:'0px'}}>IP</label>
                                                                                    <InputField  placeholder="IP" style={{ height: '30px' }} autoComplete="off" value={ip} onChange={(e) => setIp(e.target.value)} required/>
                                                                                </div> 
                                                                                <div className="col-md-6">
                                                                                    <label htmlFor="keyType" style={{marginBottom:'0px'}}>PORT</label>
                                                                                    <InputField placeholder="PORT" style={{ height: '30px' }} autoComplete="off" value={port} onChange={(e) => setPort(e.target.value)} required/>
                                                                                </div>
                                                                            </div>
                                                                                                                                                    
                                                                            <label htmlFor="keyType" style={{marginBottom:'0px'}}>URL</label>
                                                                            <InputField  placeholder="URL" style={{ height: '30px' }} value={url} onChange={(e) => setUrl(e.target.value)} autoComplete="off"/>
                                                                        </div>
                                                                    )}

                                                                    {keyTypeData === "Predefined" && command === "SetChargerID" && (
                                                                        <div className="form-group paddingInput">
                                                                            <label htmlFor="keyType" style={{marginBottom:'0px'}}>Charger ID</label>
                                                                            <InputField  placeholder="Charger ID" style={{ height: '30px' }} autoComplete="off" value={chargerids} onChange={(e) => setChargerids(e.target.value)} required/>
                                                                        </div>
                                                                    )}
                                                                   
                                                                    {keyTypeData === "Predefined" && command === "SetFaultParametersConfig" && (
                                                                        <div className="form-group paddingInput">
                                                                            <label htmlFor="keyType" style={{marginBottom:'0px'}}>Set Fault Parameters Config</label>
                                                                            <InputField  placeholder="Set Fault Parameters Config" style={{ height: '30px' }} autoComplete="off" value={faultParametersConfig} onChange={(e) => setFaultParametersConfig(e.target.value)} required/>
                                                                        </div>
                                                                    )}

                                                                    {keyTypeData === "Predefined" && command === "SetMaxCurrent" && (
                                                                        <div className="form-group paddingInput">
                                                                            <label htmlFor="keyType" style={{marginBottom:'0px'}}>Set Max Current</label>
                                                                            <InputField placeholder="Set Max Current" style={{ height: '30px'}} autoComplete="off" value={maxCurrent} onChange={(e) => SetMaxCurrent(e.target.value)} required/>
                                                                        </div>
                                                                    )}
                                
                                                                    {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                                    <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                        <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                                    </div>
                                                                </form>
                                                            )}
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{color:'rgb(233 30 157)'}}>Command Response</h4>
                                                        {response ? (
                                                            <textarea style={{ border: 'none', outline: 'none', background:'none', width: '100%', backgroundColor:'#f5f7ff' }} value={response ? JSON.stringify(response, null, 2) : ""} readOnly rows="22"/>
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "GetCompositeSchedule" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleGetCompositeSchedule}>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="connectorId" style={{ marginBottom: '0px' }}>Connector ID (integer):</label>
                                                                <InputField  id="connectorId" placeholder="0 = charge point as a whole." style={{ height: '30px' }} autoComplete="off" value={getCompositeScheduleConnectorId}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        const sanitizedValue = value.replace(/[^0-9]/g, '');
                                                                        setGetCompositeScheduleConnectorId(sanitizedValue);
                                                                    }} disabled={filterType === 'ChargingProfileid'}
                                                                />
                                                            </div>

                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="stackLevel" style={{ marginBottom: '0px' }}>Duration (in seconds):</label>
                                                                <InputField  id="stackLevel" style={{ height: '30px' }} autoComplete="off" value={duration}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        const sanitizedValue = value.replace(/[^0-9]/g, '');
                                                                        setDuration(sanitizedValue);
                                                                    }} disabled={filterType === 'ChargingProfileid'}
                                                                />
                                                            </div>

                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="chargingProfilePurpose" style={{ marginBottom: '0px' }}>Charging Rate Unit:</label>
                                                                <select className="form-control" style={{ height: '31px' }} value={chargingRateUnit} onChange={(e) => setChargingRateUnit(e.target.value)}>
                                                                    <option>-- Empty --</option>
                                                                    <option value="W">W</option>
                                                                    <option value="A">A</option>
                                                                </select>
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Command Response</h4>
                                                        {response ? (
                                                            <textarea
                                                                style={{ border: 'none', outline: 'none', background: 'none', width: '100%', backgroundColor: '#f5f7ff' }}
                                                                value={JSON.stringify(response, null, 2)}
                                                                readOnly
                                                                rows="22"
                                                            />
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "GetConfiguration" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleGetConfiguration}>
                                                            <div className="form-group paddingInput">
                                                                <div style={{ marginBottom: '10px' }}>
                                                                    <InputField type="button" value="Select All" onClick={() => handleSelectAll(true)} style={{ marginRight: '10px' }} />
                                                                    <InputField type="button" value="Select None" onClick={() => handleSelectAll(false)} />
                                                                </div>
                                                                
                                                                <div className="info">
                                                                    <b>Info:</b> If none selected, the charge point returns a list of <b>all</b> configuration settings.
                                                                </div>
                                                                <select id="confKeyList" name="confKeyList" className="form-control" size="14" multiple={true} style={{ height: '200px' }}>
                                                                    <option value="AllowOfflineTxForUnknownId" label="AllowOfflineTxForUnknownId (boolean)" title="AllowOfflineTxForUnknownId (boolean)" />
                                                                    <option value="AuthorizationCacheEnabled" label="AuthorizationCacheEnabled (boolean)" title="AuthorizationCacheEnabled (boolean)" />
                                                                    <option value="AuthorizeRemoteTxRequests" label="AuthorizeRemoteTxRequests (boolean)" title="AuthorizeRemoteTxRequests (boolean)" />
                                                                    <option value="BlinkRepeat" label="BlinkRepeat (in times)" title="BlinkRepeat (in times)" />
                                                                    <option value="ChargeProfileMaxStackLevel" label="ChargeProfileMaxStackLevel (integer)" title="ChargeProfileMaxStackLevel (integer)" />
                                                                    <option value="ChargingScheduleAllowedChargingRateUnit" label="ChargingScheduleAllowedChargingRateUnit (comma separated list)" title="ChargingScheduleAllowedChargingRateUnit (comma separated list)" />
                                                                    <option value="ChargingScheduleMaxPeriods" label="ChargingScheduleMaxPeriods (integer)" title="ChargingScheduleMaxPeriods (integer)" />
                                                                    <option value="ClockAlignedDataInterval" label="ClockAlignedDataInterval (in seconds)" title="ClockAlignedDataInterval (in seconds)" />
                                                                    <option value="ConnectionTimeOut" label="ConnectionTimeOut (in seconds)" title="ConnectionTimeOut (in seconds)" />
                                                                    <option value="ConnectorPhaseRotation" label="ConnectorPhaseRotation (comma separated list)" title="ConnectorPhaseRotation (comma separated list)" />
                                                                    <option value="ConnectorPhaseRotationMaxLength" label="ConnectorPhaseRotationMaxLength (integer)" title="ConnectorPhaseRotationMaxLength (integer)" />
                                                                    <option value="ConnectorSwitch3to1PhaseSupported" label="ConnectorSwitch3to1PhaseSupported (boolean)" title="ConnectorSwitch3to1PhaseSupported (boolean)" />
                                                                    <option value="GetConfigurationMaxKeys" label="GetConfigurationMaxKeys (integer)" title="GetConfigurationMaxKeys (integer)" />
                                                                    <option value="HeartbeatInterval" label="HeartbeatInterval (in seconds)" title="HeartbeatInterval (in seconds)" />
                                                                    <option value="LightIntensity" label="LightIntensity (in %)" title="LightIntensity (in %)" />
                                                                    <option value="LocalAuthListEnabled" label="LocalAuthListEnabled (boolean)" title="LocalAuthListEnabled (boolean)" />
                                                                    <option value="LocalAuthListMaxLength" label="LocalAuthListMaxLength (integer)" title="LocalAuthListMaxLength (integer)" />
                                                                    <option value="LocalAuthorizeOffline" label="LocalAuthorizeOffline (boolean)" title="LocalAuthorizeOffline (boolean)" />
                                                                    <option value="LocalPreAuthorize" label="LocalPreAuthorize (boolean)" title="LocalPreAuthorize (boolean)" />
                                                                    <option value="MaxChargingProfilesInstalled" label="MaxChargingProfilesInstalled (integer)" title="MaxChargingProfilesInstalled (integer)" />
                                                                    <option value="MaxEnergyOnInvalidId" label="MaxEnergyOnInvalidId (in Wh)" title="MaxEnergyOnInvalidId (in Wh)" />
                                                                    <option value="MeterValueSampleInterval" label="MeterValueSampleInterval (in seconds)" title="MeterValueSampleInterval (in seconds)" />
                                                                    <option value="MeterValuesAlignedData" label="MeterValuesAlignedData (comma separated list)" title="MeterValuesAlignedData (comma separated list)" />
                                                                    <option value="MeterValuesAlignedDataMaxLength" label="MeterValuesAlignedDataMaxLength (integer)" title="MeterValuesAlignedDataMaxLength (integer)" />
                                                                    <option value="MeterValuesSampledData" label="MeterValuesSampledData (comma separated list)" title="MeterValuesSampledData (comma separated list)" />
                                                                    <option value="MeterValuesSampledDataMaxLength" label="MeterValuesSampledDataMaxLength (integer)" title="MeterValuesSampledDataMaxLength (integer)" />
                                                                    <option value="MeterValuesSignatureContexts" label="MeterValuesSignatureContexts (comma separated list; specific to OCMF)" title="MeterValuesSignatureContexts (comma separated list; specific to OCMF)" />
                                                                    <option value="MinimumStatusDuration" label="MinimumStatusDuration (in seconds)" title="MinimumStatusDuration (in seconds)" />
                                                                    <option value="NumberOfConnectors" label="NumberOfConnectors (integer)" title="NumberOfConnectors (integer)" />
                                                                    <option value="ReserveConnectorZeroSupported" label="ReserveConnectorZeroSupported (boolean)" title="ReserveConnectorZeroSupported (boolean)" />
                                                                    <option value="ResetRetries" label="ResetRetries (in times)" title="ResetRetries (in times)" />
                                                                    <option value="SendLocalListMaxLength" label="SendLocalListMaxLength (integer)" title="SendLocalListMaxLength (integer)" />
                                                                    <option value="StopTransactionOnEVSideDisconnect" label="StopTransactionOnEVSideDisconnect (boolean)" title="StopTransactionOnEVSideDisconnect (boolean)" />
                                                                    <option value="StopTransactionOnInvalidId" label="StopTransactionOnInvalidId (boolean)" title="StopTransactionOnInvalidId (boolean)" />
                                                                    <option value="StopTransactionSignatureContexts" label="StopTransactionSignatureContexts (comma separated list; specific to OCMF)" title="StopTransactionSignatureContexts (comma separated list; specific to OCMF)" />
                                                                    <option value="StopTransactionSignatureFormat" label="StopTransactionSignatureFormat (string; specific to OCMF)" title="StopTransactionSignatureFormat (string; specific to OCMF)" />
                                                                    <option value="StopTxnAlignedData" label="StopTxnAlignedData (comma separated list)" title="StopTxnAlignedData (comma separated list)" />
                                                                    <option value="StopTxnAlignedDataMaxLength" label="StopTxnAlignedDataMaxLength (integer)" title="StopTxnAlignedDataMaxLength (integer)" />
                                                                    <option value="StopTxnSampledData" label="StopTxnSampledData (comma separated list)" title="StopTxnSampledData (comma separated list)" />
                                                                    <option value="StopTxnSampledDataMaxLength" label="StopTxnSampledDataMaxLength (integer)" title="StopTxnSampledDataMaxLength (integer)" />
                                                                    <option value="SupportedFeatureProfiles" label="SupportedFeatureProfiles (comma separated list)" title="SupportedFeatureProfiles (comma separated list)" />
                                                                    <option value="SupportedFeatureProfilesMaxLength" label="SupportedFeatureProfilesMaxLength (integer)" title="SupportedFeatureProfilesMaxLength (integer)" />
                                                                    <option value="SupportedFileTransferProtocols" label="SupportedFileTransferProtocols (comma separated list)" title="SupportedFileTransferProtocols (comma separated list)" />
                                                                    <option value="TransactionMessageAttempts" label="TransactionMessageAttempts (in times)" title="TransactionMessageAttempts (in times)" />
                                                                    <option value="TransactionMessageRetryInterval" label="TransactionMessageRetryInterval (in seconds)" title="TransactionMessageRetryInterval (in seconds)" />
                                                                    <option value="UnlockConnectorOnEVSideDisconnect" label="UnlockConnectorOnEVSideDisconnect (boolean)" title="UnlockConnectorOnEVSideDisconnect (boolean)" />
                                                                    <option value="WebSocketPingInterval" label="WebSocketPingInterval (in seconds)" title="WebSocketPingInterval (in seconds)" />
                                                                </select>
                                                            </div>

                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Custom Configuration Keys:</label>
                                                                <InputField  id="exampleInputUsername1" placeholder="optional comma separated list" style={{ height: '30px' }} autoComplete="off" value={customKeys} onChange={(e) => setCustomKeys(e.target.value)}/>
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{color:'rgb(233 30 157)'}}>Command Response</h4>
                                                        {response ? (
                                                            <textarea style={{ border: 'none', outline: 'none', background:'none', width: '100%', backgroundColor:'#f5f7ff' }} value={response ? JSON.stringify(response, null, 2) : ""} readOnly rows="22"/>
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "GetDiagnostics" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleGetDiagnostics}>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Location (directory URI):</label>
                                                                <InputField  id="exampleInputUsername1" placeholder="" style={{ height: '30px' }} value={location} onChange={(e) => setLocation(e.target.value)} required autoComplete="off"/>
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Retries (integer):</label>
                                                                <InputField id="exampleInputUsername1" placeholder="optional" style={{ height: '30px' }} value={retries} 
                                                                onChange={(e) => { const numericValue = e.target.value.replace(/[^0-9]/g, ''); setRetries(numericValue);}} autoComplete="off"/>
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Retry Interval (integer):</label>
                                                                <InputField id="exampleInputUsername1" placeholder="optional" style={{ height: '30px' }} value={retryInterval} 
                                                                onChange={(e) => { const numericValue = e.target.value.replace(/[^0-9]/g, ''); setRetryInterval(numericValue);}} autoComplete="off"/>
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Start Date/Time:</label>
                                                                <InputField type="datetime-local" id="exampleInputUsername1" placeholder="optional" style={{ height: '30px' }} value={startTime} onChange={(e) => setStartTime(e.target.value)} autoComplete="off"/>
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Stop Date/Time:</label>
                                                                <InputField type="datetime-local"  id="exampleInputUsername1" placeholder="optional" style={{ height: '30px' }} value={stopTime} onChange={(e) => setStopTime(e.target.value)} autoComplete="off"/>
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{color:'rgb(233 30 157)'}}>Command Response</h4>
                                                        {response ? (
                                                            <textarea style={{ border: 'none', outline: 'none', background:'none', width: '100%', backgroundColor:'#f5f7ff' }} value={response ? JSON.stringify(response, null, 2) : ""} readOnly rows="22"/>
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "GetLocalListVersion" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleGetLocalListVersion}>
                                                            <div style={{ display: 'flex',justifyContent: 'center'}}>
                                                                <h5 className="card-description">No parameters required.</h5>
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{color:'rgb(233 30 157)'}}>Command Response</h4>
                                                        {response ? (
                                                            <textarea style={{ border: 'none', outline: 'none', background:'none', width: '100%', backgroundColor:'#f5f7ff' }} value={response ? JSON.stringify(response, null, 2) : ""} readOnly rows="22"/>
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "RemoteStartTransaction" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleRemoteStartTransaction}>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Connector ID:</label>
                                                                <InputField  id="exampleInputUsername1" placeholder="" style={{ height: '30px' }} autoComplete="off" value={connectorIds} 
                                                                onChange={(e) => { const numericValue = e.target.value.replace(/[^0-9]/g, ''); setConnectorIds(numericValue);}}/>
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>OCPP ID Tag:</label>
                                                                <InputField  id="exampleInputUsername1" placeholder="" style={{ height: '30px' }} autoComplete="off" value={idTag} onChange={(e) => setIdTag(e.target.value)}/>
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{color:'rgb(233 30 157)'}}>Command Response</h4>
                                                        {response ? (
                                                            <textarea style={{ border: 'none', outline: 'none', background:'none', width: '100%', backgroundColor:'#f5f7ff' }} value={response ? JSON.stringify(response, null, 2) : ""} readOnly rows="22"/>
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "RemoteStopTransaction" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleRemoteStopTransaction}>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>ID of the Active Transaction:</label>
                                                                <InputField id="exampleInputUsername1" placeholder="" style={{ height: '30px' }} autoComplete="off" requiredvalue={transaction} 
                                                                onChange={(e) => { const numericValue = e.target.value.replace(/[^0-9]/g, ''); setTransaction(numericValue);}}/>
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{color:'rgb(233 30 157)'}}>Command Response</h4>
                                                        {response ? (
                                                            <textarea style={{ border: 'none', outline: 'none', background:'none', width: '100%', backgroundColor:'#f5f7ff' }} value={response ? JSON.stringify(response, null, 2) : ""} readOnly rows="22"/>
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "ReserveNow" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleReserveNow}>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Connector ID:</label>
                                                                <InputField  id="exampleInputUsername1" placeholder="" style={{ height: '30px' }} autoComplete="off" value={reserveConnectorId} 
                                                                onChange={(e) => { const numericValue = e.target.value.replace(/[^0-9]/g, ''); setReserveConnectorId(numericValue);}} required/>
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Expiry Date/Time:</label>
                                                                <InputField type="datetime-local"  id="exampleInputUsername1" placeholder="optional" style={{ height: '30px' }} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required/>
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>OCPP ID Tag:</label>
                                                                <InputField  id="exampleInputUsername1" placeholder="" style={{ height: '30px' }} autoComplete="off" value={reserveIdTag} onChange={(e) => setReserveIdTag(e.target.value)}/>
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{color:'rgb(233 30 157)'}}>Command Response</h4>
                                                        {response ? (
                                                            <textarea style={{ border: 'none', outline: 'none', background:'none', width: '100%', backgroundColor:'#f5f7ff' }} value={response ? JSON.stringify(response, null, 2) : ""} readOnly rows="22"/>
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "Reset" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleReset}>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Reset Type:</label>
                                                                <select className="form-control" style={{ height: '31px' }} value={resetType} onChange={(e) => setResetType(e.target.value)}>
                                                                    <option >-- Select --</option>
                                                                    <option value="HARD">HARD</option>
                                                                    <option value="SOFT">SOFT</option>
                                                                </select>
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{color:'rgb(233 30 157)'}}>Command Response</h4>
                                                        {response ? (
                                                            <textarea style={{ border: 'none', outline: 'none', background:'none', width: '100%', backgroundColor:'#f5f7ff' }} value={response ? JSON.stringify(response, null, 2) : ""} readOnly rows="22"/>
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "SendLocalList" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleSendLocalList}>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Hash (String):	Optional, omitted for now</label>
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>List Version (integer):</label>
                                                                <InputField  id="exampleInputUsername1" placeholder="" style={{ height: '30px' }} required autoComplete="off"
                                                                    value={listVersion} onChange={(e) => setListVersion(e.target.value.replace(/[^0-9]/g, ''))} />
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Update Type:</label>
                                                                <select className="form-control" style={{ height: '31px' }} value={updateType} onChange={(e) => setUpdateType(e.target.value)}>
                                                                    <option >-- Select --</option>
                                                                    <option value="FULL">FULL</option>
                                                                    <option value="DIFFERENTIAL">DIFFERENTIAL</option>
                                                                </select>
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="addUpdateList" style={{ marginBottom: '0px' }}>Add/Update List:</label>
                                                                <InputField  id="exampleInputUsername1" placeholder="" style={{ height: '30px' }} autoComplete="off" value={addUpdateList} onChange={(e) => setAddUpdateList(e.target.value)} />
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="addUpdateList" style={{ marginBottom: '0px' }}>Delete List:</label>
                                                                <InputField id="exampleInputUsername1" placeholder="" style={{ height: '30px' }} autoComplete="off" value={deleteList} onChange={(e) => setDeleteList(e.target.value)} />
                                                            </div>
                                                            <div className="form-group paddingInput" style={{ display: 'flex', alignItems: 'center' }}>
                                                                <label htmlFor="sendEmptyListWhenFull" style={{ marginBottom: '0px', marginRight: '10px' }}>Send empty list?:</label>
                                                                <InputField id="sendEmptyListWhenFull" name="sendEmptyListWhenFull" type="checkbox" value="true"
                                                                style={{ marginRight: '10px' }} checked={sendEmptyListWhenFull} onChange={(e) => setSendEmptyListWhenFull(e.target.checked)} />
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>If selected and the update type is FULL, an empty list will be sent.
                                                                As a result, the charge point will remove all idTags from its list.	</label>
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{color:'rgb(233 30 157)'}}>Command Response</h4>
                                                        {response ? (
                                                            <textarea style={{ border: 'none', outline: 'none', background:'none', width: '100%', backgroundColor:'#f5f7ff' }} value={response ? JSON.stringify(response, null, 2) : ""} readOnly rows="22"/>
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "SetChargingProfile" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleSetChargingProfile}>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="connectorId" style={{ marginBottom: '0px' }}>Charging Profile ID:</label>
                                                                <InputField  id="connectorId" placeholder="" style={{ height: '30px' }} autoComplete="off" value={chargingProfileId}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        const sanitizedValue = value.replace(/[^0-9]/g, '');
                                                                        setChargingProfileId(sanitizedValue);
                                                                    }} disabled={filterType === 'ChargingProfileid'}
                                                                />
                                                            </div>

                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="stackLevel" style={{ marginBottom: '0px' }}>Connector ID (integer):</label>
                                                                <InputField  id="stackLevel" style={{ height: '30px' }} placeholder="0 = charge point as a whole." autoComplete="off" value={setChargingProfileConnectorID}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        const sanitizedValue = value.replace(/[^0-9]/g, '');
                                                                        setSetChargingProfileConnectorID(sanitizedValue);
                                                                    }} disabled={filterType === 'ChargingProfileid'}
                                                                />
                                                            </div>

                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Command Response</h4>
                                                        {response ? (
                                                            <textarea
                                                                style={{ border: 'none', outline: 'none', background: 'none', width: '100%', backgroundColor: '#f5f7ff' }}
                                                                value={JSON.stringify(response, null, 2)}
                                                                readOnly
                                                                rows="22"
                                                            />
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "TriggerMessage" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleTriggerMessage}>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Trigger Message:</label>
                                                                <select className="form-control" style={{ height: '31px' }} value={triggerMessage} onChange={(e) => setTriggerMessage(e.target.value)}>
                                                                    <option >-- Select --</option>
                                                                    <option value="BootNotification">BootNotification</option>
                                                                    <option value="DiagnosticsStatusNotification">DiagnosticsStatusNotification</option>
                                                                    <option value="FirmwareStatusNotification">FirmwareStatusNotification</option>
                                                                    <option value="Heartbeat">Heartbeat</option>
                                                                    <option value="MeterValues">MeterValues</option>
                                                                    <option value="StatusNotification">StatusNotification</option>
                                                                </select>
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Connector ID (integer):</label>
                                                                <InputField  id="exampleInputUsername1" placeholder="If empty, charge point as a whole" style={{ height: '30px' }} autoComplete="off" value={triggerConnectorId} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setTriggerConnectorId(sanitizedValue);}}/>
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{color:'rgb(233 30 157)'}}>Command Response</h4>
                                                        {response ? (
                                                            <textarea style={{ border: 'none', outline: 'none', background:'none', width: '100%', backgroundColor:'#f5f7ff' }} value={response ? JSON.stringify(response, null, 2) : ""} readOnly rows="22"/>
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "UnlockConnector" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleUnlockConnector}>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="exampleInputUsername1" style={{marginBottom:'0px'}}>Connector ID:</label>
                                                                <InputField  id="exampleInputUsername1" placeholder="" style={{ height: '30px' }} autoComplete="off" required value={unlockConnectorConnectorId} 
                                                                onChange={(e) => { const numericValue = e.target.value.replace(/[^0-9]/g, ''); setUnlockConnectorConnectorId(numericValue);}}/>
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{color:'rgb(233 30 157)'}}>Command Response</h4>
                                                        {response ? (
                                                            <textarea style={{ border: 'none', outline: 'none', background:'none', width: '100%', backgroundColor:'#f5f7ff' }} value={response ? JSON.stringify(response, null, 2) : ""} readOnly rows="22"/>
                                                        ) : (
                                                            <p className="card-description">No command response available</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedCommand === "UpdateFirmware" && (
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters</h4>
                                                        <form className="forms-sample" onSubmit={handleUpdateFirmware}>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="locationInput" style={{ marginBottom: '0px' }}>Location (directory URI):</label>
                                                                <InputField
                                                                    id="locationInput"
                                                                    placeholder=""
                                                                    style={{ height: '30px' }}
                                                                    autoComplete="off"
                                                                    required
                                                                    value={locationUpdatdeFirmware}
                                                                    onChange={(e) => setLocationUpdatdeFirmware(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="retriesInput" style={{ marginBottom: '0px' }}>Retries (integer):</label>
                                                                <InputField
                                                                    id="retriesInput"
                                                                    placeholder="optional"
                                                                    style={{ height: '30px' }}
                                                                    autoComplete="off"
                                                                    value={retriesUpdatdeFirmware}
                                                                    onChange={(e) => {
                                                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                                        setRetriesUpdatdeFirmware(numericValue);
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="retryIntervalInput" style={{ marginBottom: '0px' }}>Retry Interval (integer):</label>
                                                                <InputField
                                                                  
                                                                    id="retryIntervalInput"
                                                                    placeholder="optional"
                                                                    style={{ height: '30px' }}
                                                                    autoComplete="off"
                                                                    value={retryIntervalUpdatdeFirmware}
                                                                    onChange={(e) => {
                                                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                                        setRetryIntervalUpdatdeFirmware(numericValue);
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="form-group paddingInput">
                                                                <label htmlFor="retrieveDateInput" style={{ marginBottom: '0px' }}>Retrieve Date/Time:</label>
                                                                <InputField
                                                                    type="datetime-local"
                                                                    id="retrieveDateInput"
                                                                    placeholder="optional"
                                                                    style={{ height: '30px' }}
                                                                    autoComplete="off"
                                                                    required
                                                                    value={retrieveDate}
                                                                    onChange={(e) => setRetrieveDate(e.target.value)}
                                                                />
                                                            </div>
                                                            {errorMessage && <p className="text-danger">{errorMessage}</p>}
                                                            <div style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" className="btn btn-primary mr-2">Perform</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="card-body">
                                                        <h4 className="card-title" style={{ color: 'rgb(233 30 157)' }}>Parameters Response</h4>
                                                        {response ? (
                                                            <textarea
                                                                style={{ border: 'none', outline: 'none', background: 'none', width: '100%', backgroundColor: '#f5f7ff' }}
                                                                value={response ? JSON.stringify(response, null, 2) : ""}
                                                                readOnly
                                                                rows="22"
                                                            />
                                                        ) : (
                                                            <p className="card-description">No parameters response available</p>
                                                        )}
                                                    </div>
                                                </div>
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
                 
export default OcppConfig