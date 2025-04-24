import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import useViewAlloc from '../../hooks/ManageDevice/ViewAllocatedDeviceHooks';

const ViewAlloc = ({ userInfo, handleLogout }) => {
   const {
    newDevice,setNewDevice,goBack,formatTimestamp

   }=useViewAlloc(userInfo)

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
                                        <h3 className="font-weight-bold">View Charger</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                onClick={goBack}
                                                style={{ marginRight: '10px' }}
                                            >
                                               Back
                                            </button>
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
                                                        <div style={{textAlign:'center'}}>
                                                            <h4 className="card-title" style={{paddingTop:'10px'}}>Charger Details</h4>  
                                                            <hr></hr>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Charger ID: <span style={{fontWeight:'normal'}}>{newDevice.charger_id ? newDevice.charger_id : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Charger Model: <span style={{fontWeight:'normal'}}>{newDevice.charger_model ? newDevice.charger_model +'KW': '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Charger Type: <span style={{fontWeight:'normal'}}>{newDevice.charger_type ? newDevice.charger_type : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Vendor: <span style={{fontWeight:'normal'}}>{newDevice.vendor ?  newDevice.vendor : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Gun Connector: <span style={{ fontWeight: 'normal' }}>{newDevice.gun_connector ? newDevice.gun_connector === 1 ? '1 Gun Connector' : `${newDevice.gun_connector} Gun Connector's` : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Max Current: <span style={{fontWeight:'normal'}}>{newDevice.max_current ?  newDevice.max_current : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Max Power: <span style={{fontWeight:'normal'}}>{newDevice.max_power ? newDevice.max_power : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Socket Count: <span style={{fontWeight:'normal'}}>{newDevice.socket_count ? newDevice.socket_count === 1 ? '1 Socket' : `${newDevice.socket_count} Socket's` : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Model: <span style={{fontWeight:'normal'}}>{newDevice.model ?  newDevice.model : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Type: <span style={{fontWeight:'normal'}}>{newDevice.type ?  newDevice.type : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Reseller Commission: <span style={{fontWeight:'normal'}}>{newDevice.reseller_commission ? newDevice.reseller_commission : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Client Commission: <span style={{fontWeight:'normal'}}>{newDevice.client_commission ? newDevice.client_commission : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Short Description: <span style={{fontWeight:'normal'}}>{newDevice.short_description ? newDevice.short_description : '-'}</span></div>   
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Charger Accessibility: <span style={{ fontWeight: 'normal' }}>{newDevice.charger_accessibility === 1 ? 'Public' : newDevice.charger_accessibility === 2 ? 'Private' : '-'}</span></div> 
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Wifi Username: <span style={{fontWeight:'normal'}}>{newDevice.wifi_username ? newDevice.wifi_username : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Wifi Password: <span style={{fontWeight:'normal'}}>{newDevice.wifi_password ? newDevice.wifi_password : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Assigned Association Date: <span style={{fontWeight:'normal'}}>{newDevice.assigned_association_date ? formatTimestamp(newDevice.assigned_association_date) : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Assigned Client Date: <span style={{fontWeight:'normal'}}>{newDevice.assigned_client_date ? formatTimestamp(newDevice.assigned_client_date) : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Assigned Reseller Date: <span style={{fontWeight:'normal'}}>{newDevice.assigned_reseller_date ? formatTimestamp(newDevice.assigned_reseller_date) : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Created By: <span style={{fontWeight:'normal'}}>{newDevice.created_by ? newDevice.created_by : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Created Date: <span style={{fontWeight:'normal'}}>{newDevice.created_date ? formatTimestamp(newDevice.created_date) : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Modified By: <span style={{fontWeight:'normal'}}>{newDevice.modified_by ? newDevice.modified_by : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Modified Date: <span style={{fontWeight:'normal'}}>{newDevice.modified_date ? formatTimestamp(newDevice.modified_date) : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Current/Active User: <span style={{fontWeight:'normal'}}>{newDevice.current_or_active_user ? newDevice.current_or_active_user : '-'}</span></div>
                                                            </div>
                                                        </div> 
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Status: <span style={{fontWeight:'normal'}}>{newDevice.status === true ? <span className="text-success">Active</span> :  <span className="text-danger">DeActive</span>}</span></div>
                                                            </div>
                                                        </div> 
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>WiFi Module: <span style={{fontWeight:'normal'}}>{newDevice.wifi_module === true ? <span>True</span> : <span>False</span>}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Bluetooth Module: <span style={{fontWeight:'normal'}}>{newDevice.bluetooth_module === true ? <span>True</span> : <span>False</span>}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Connector Details */}
                                                    {newDevice.connector_details && newDevice.connector_details.length > 0 ? (
                                                        <div className="row col-12 col-xl-12 viewDataCss">
                                                            {newDevice.connector_details.map((connector, index) => (
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
}

export default ViewAlloc;
