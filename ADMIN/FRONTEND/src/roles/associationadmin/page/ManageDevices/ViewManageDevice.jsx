import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useViewManageDevice from '../../hooks/ManageDevice/ViewManageDeviceHooks';

const ViewManageDevice = ({ userInfo, handleLogout }) => {
      const {
        deviceData,
        handleBack,
        handleEditManageDevice,
        formatTimestamp
      }=useViewManageDevice(userInfo)
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
                                        <h3 className="font-weight-bold">View Manage Device</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-outline-primary btn-icon-text"  onClick={() => handleEditManageDevice(deviceData)} style={{marginRight:'10px'}}><i className="mdi mdi-pencil btn-icon-prepend"></i>Edit</button>
                                            <button type="button" className="btn btn-success" onClick={handleBack}>Back</button>
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
                                            <div className="col-md-12 grid-margin">
                                                <div className="row">
                                                    <div className="col-12 col-xl-12">
                                                        <div style={{ textAlign: 'center' }}>
                                                            <h4 className="card-title" style={{ paddingTop: '10px' }}>Device Details</h4>
                                                            <hr></hr>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Charger ID: <span style={{fontWeight: 'normal'}}>{deviceData.charger_id ? deviceData.charger_id : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Charger Model: <span style={{fontWeight:'normal'}}>{deviceData.charger_model ? deviceData.charger_model +'KW': '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Charger Type: <span style={{fontWeight: 'normal'}}>{deviceData.charger_type ?  deviceData.charger_type : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Vendor: <span style={{fontWeight: 'normal'}}>{deviceData.vendor ? deviceData.vendor : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Gun Connector: <span style={{ fontWeight: 'normal' }}>{deviceData.gun_connector ? deviceData.gun_connector === 1 ? '1 Gun Connector' : `${deviceData.gun_connector} Gun Connector's` : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Max Current: <span style={{fontWeight: 'normal'}}>{deviceData.max_current ? deviceData.max_current : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Max Power: <span style={{fontWeight: 'normal'}}>{deviceData.max_power ?  deviceData.max_power : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Socket Count: <span style={{fontWeight:'normal'}}>{deviceData.socket_count ? deviceData.socket_count === 1 ? '1 Socket' : `${deviceData.socket_count} Socket's` : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Current or Active User: <span style={{fontWeight: 'normal'}}>{deviceData.current_active_user ? deviceData.current_active_user : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Model: <span style={{fontWeight: 'normal'}}>{deviceData.model ?  deviceData.model : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Type: <span style={{fontWeight:'normal'}}>{deviceData.type ?  deviceData.type : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Client Commission: <span style={{fontWeight: 'normal'}}>{deviceData.client_commission ? deviceData.client_commission : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>IP: <span style={{fontWeight: 'normal'}}>{deviceData.ip ? deviceData.ip : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Latitude: <span style={{fontWeight: 'normal'}}>{deviceData.lat ? deviceData.lat : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Longitude: <span style={{fontWeight: 'normal'}}>{deviceData.long ? deviceData.long : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Short Description: <span style={{ fontWeight: 'normal' }}>{deviceData.short_description ? deviceData.short_description : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Charger Accessibility: <span style={{ fontWeight: 'normal' }}>{deviceData.charger_accessibility === 1 ? 'Public' : deviceData.charger_accessibility === 2 ? 'Private' : '-'}</span></div> 
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Unit Price: <span style={{fontWeight: 'normal'}}>{deviceData.unit_price ? deviceData.unit_price : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Wifi Username: <span style={{fontWeight: 'normal'}}>{deviceData.wifi_username ? deviceData.wifi_username : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Wifi Password: <span style={{fontWeight: 'normal'}}>{deviceData.wifi_password ? deviceData.wifi_password : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Created By: <span style={{fontWeight: 'normal'}}>{deviceData.created_by ? deviceData.created_by : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Created Date: <span style={{fontWeight: 'normal'}}>{deviceData.created_date ? formatTimestamp(deviceData.created_date) : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Modified By: <span style={{fontWeight: 'normal'}}>{deviceData.modified_by ? deviceData.modified_by : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Modified Date: <span style={{fontWeight: 'normal'}}>{deviceData.modified_date ? formatTimestamp(deviceData.modified_date) : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Land Mark: <span style={{fontWeight: 'normal'}}>{deviceData.landmark ? deviceData.landmark : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Status: <span style={{fontWeight: 'normal'}}>{deviceData.status ?  <span className="text-success">Active</span> : <span className="text-danger">DeActive</span>}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>WiFi Module: <span style={{fontWeight: 'normal'}}>{deviceData.wifi_module === true ? <span>True</span> : <span>False</span>}</span></div>
                                                            </div>
                                                        </div>
                                                        
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Bluetooth Module: <span style={{fontWeight: 'normal'}}>{deviceData.bluetooth_module === true ? <span>True</span> : <span>False</span>}</span></div>
                                                            </div>
                                                            
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                            <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Address: <span style={{fontWeight: 'normal'}}>{deviceData.address ? deviceData.address : '-'}</span></div>
                                                            </div>
                                                        
                                                    </div>
                                                        
                                                        
                                                    </div>

                                                    
                                                    {/* Connector Details */}
                                                    {deviceData.connector_details && deviceData.connector_details.length > 0 ? (
                                                        <div className="row col-12 col-xl-12 viewDataCss">
                                                            {deviceData.connector_details.map((connector, index) => (
                                                            <div className="col-md-4" style={{paddingBottom:'15px'}} key={index}>
                                                                <div className="form-group row">
                                                                    <div className="col-sm-12" style={{ fontWeight: 'bold' }}>
                                                                        Connector {index + 1}: <span style={{ fontWeight: 'bold' }}>
                                                                        Type: <span style={{ fontWeight: 'normal' }}>{connector.connector_type},</span> Type Name: <span style={{ fontWeight: 'normal' }}>{connector.connector_type_name}</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="row col-12 col-xl-12 viewDataCss">
                                                            <div className="col-md-4">
                                                                <div className="form-group row">
                                                                    <div className="col-sm-12"><span style={{ fontWeight: 'bold' }}>Connector:</span> No Connector Details Available</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                            </div>
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

export default ViewManageDevice;
