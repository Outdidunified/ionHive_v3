import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import {useViewManageDevice} from '../../hooks/ManageDevice/ViewManageDeviceHooks';
const ViewManageDevice = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();
    const { newUser, setNewUser } = useViewManageDevice();

    console.log('wifi', newUser.wifi_module, 'bluetooth_module', newUser.bluetooth_module);

    // Timestamp data 
    function formatTimestamp(originalTimestamp) {
        const date = new Date(originalTimestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        hours = String(hours).padStart(2, '0');
    
        const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
        return formattedDate;
    }

    // Back manage device
    const handleBack = () => {
        navigate('/superadmin/ManageDevice');
    };

    // View edit manage device page
    const handleEditDeviceList = (newUser) => {
        navigate('/superadmin/EditManageDevice', { state: { newUser } });
    };

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
                                        <h3 className="font-weight-bold">Manage Device</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-outline-primary btn-icon-text" onClick={() => handleEditDeviceList(newUser)} style={{marginRight:'10px'}}><i className="mdi mdi-pencil btn-icon-prepend"></i>Edit</button>
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
                                                        <div style={{textAlign:'center'}}>
                                                            <h4 className="card-title" style={{paddingTop:'10px'}}>Device Details</h4>  
                                                            <hr></hr>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Charger ID: <span style={{fontWeight:'normal'}}>{newUser.charger_id ? newUser.charger_id : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Charger Model: <span style={{fontWeight:'normal'}}>{newUser.charger_model ? newUser.charger_model +'KW': '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Charger Type: <span style={{fontWeight:'normal'}}>{newUser.charger_type ? newUser.charger_type : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Model: <span style={{fontWeight:'normal'}}>{newUser.model ?  newUser.model : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Type: <span style={{ fontWeight: 'normal' }}>{newUser.type ?  newUser.type : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Vendor: <span style={{fontWeight:'normal'}}>{newUser.vendor ?  newUser.vendor : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Gun Connector: <span style={{ fontWeight: 'normal' }}>{newUser.gun_connector ? newUser.gun_connector === 1 ? '1 Gun Connector' : `${newUser.gun_connector} Gun Connector's` : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Max Current: <span style={{fontWeight:'normal'}}>{newUser.max_current ?  newUser.max_current : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Max Power: <span style={{fontWeight:'normal'}}>{newUser.max_power ? newUser.max_power : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Socket Count: <span style={{fontWeight:'normal'}}>{newUser.socket_count ? newUser.socket_count === 1 ? '1 Socket' : `${newUser.socket_count} Socket's` : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Current or Active User: <span style={{fontWeight:'normal'}}>{newUser.current_active_user ?  newUser.current_active_user : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Reseller Commission: <span style={{fontWeight:'normal'}}>{newUser.reseller_commission ? newUser.reseller_commission : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        </div>

                                                        <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Client Commission: <span style={{fontWeight:'normal'}}>{newUser.client_commission ? newUser.client_commission : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>IP: <span style={{fontWeight:'normal'}}>{newUser.ip ? newUser.ip : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Latitude: <span style={{fontWeight:'normal'}}>{newUser.lat ? newUser.lat : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        </div>

                                                        <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Longitude: <span style={{fontWeight:'normal'}}>{newUser.long ? newUser.long : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Short Description: <span style={{fontWeight:'normal'}}>{newUser.short_description ? newUser.short_description : '-'}</span></div>   
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Wifi Username: <span style={{fontWeight:'normal'}}>{newUser.wifi_username ? newUser.wifi_username : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Charger Accessibility: <span style={{ fontWeight: 'normal' }}>{newUser.charger_accessibility === 1 ? 'Public' : newUser.charger_accessibility === 2 ? 'Private' : '-'}</span></div> 
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Unit Price: <span style={{fontWeight:'normal'}}>{newUser.unit_price ? newUser.unit_price : '-'}</span></div> 
                                                            </div>
                                                        </div>
                                                       {/* <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Assigned User: <span style={{fontWeight:'normal'}}>{newUser.assigned_user ? newUser.assigned_user : '-'}</span></div>
                                                            </div>
                                                        </div> */}
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Wifi Password: <span style={{fontWeight:'normal'}}>{newUser.wifi_password ? newUser.wifi_password : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Created By: <span style={{fontWeight:'normal'}}>{newUser.created_by ? newUser.created_by : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Created Date: <span style={{fontWeight:'normal'}}>{newUser.created_date ? formatTimestamp(newUser.created_date) : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Modified By: <span style={{fontWeight:'normal'}}>{newUser.modified_by ? newUser.modified_by : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Modified Date: <span style={{fontWeight:'normal'}}>{newUser.modified_date ? formatTimestamp(newUser.modified_date) : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Land Mark: <span style={{fontWeight: 'normal'}}>{newUser.landmark ? newUser.landmark : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Status: <span style={{fontWeight:'normal'}}>{newUser.status === true ? <span className="text-success">Active</span> :  <span className="text-danger">DeActive</span>}</span></div>
                                                            </div>
                                                        </div>                                                               
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>WiFi Module: <span style={{fontWeight:'normal'}}>{newUser.wifi_module === true ? <span>True</span> : <span>False</span>}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Bluetooth Module: <span style={{fontWeight: 'normal'}}>{newUser.bluetooth_module === true ? <span>True</span> : <span>False</span>}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Connector Details */}
                                                    {newUser.connector_details && newUser.connector_details.length > 0 ? (
                                                        <div className="row col-12 col-xl-12 viewDataCss">
                                                            {newUser.connector_details.map((connector, index) => (
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
                 
export default ViewManageDevice