import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useEditManageDevice from '../../hooks/ManageDevice/EditManageDeviceHooks';
import LoadingButton from '../../../../utils/LoadingButton';
import InputField from '../../../../utils/InputField';
const EditManageDevice = ({ userInfo, handleLogout }) => {
  const {
    backManageDevice,
    handleModel,
     handleChargerType,
     handleWiFiModule,
     charger_id,
     loading,
     charger_model,
     charger_type,
     vendor,
     max_current,
     max_power,
     wifi_module,
     bluetooth_module,
     connectors,
     errorMessage,
     errorMessageCurrent,
     errorMessagePower,
     isFormModified,
     addConnector,
     handleRemoveConnector,
     updateConnectors,
     handleBluetoothModule,
     handleConnectorChange,
     handleConnectorType,
     editManageDevice,
     setMaxCurrent,
     setVendor,
     setChargerID,
     setErrorMessageCurrent,
     setMaxPower,
     setErrorMessagePower,
  } = useEditManageDevice(userInfo);


    return (
        <div className='container-scroller'>
            {/* Header */}
            <Header userInfo={userInfo} handleLogout={handleLogout}/>
            <div className="container-fluid page-body-wrapper">
                {/* Sidebar */}
                <Sidebar/>
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-12 grid-margin">
                                <div className="row">
                                    <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                                        <h3 className="font-weight-bold">Edit Manage Device</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={backManageDevice}>Back</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="col-12 grid-margin">
                                            <div className="card">
                                                <div className="card-body">
                                                    <h4 className="card-title">Manage Device</h4>
                                                    <form className="form-sample" onSubmit={editManageDevice}>
                                                        <div className="row">
                                                        <div className="col-md-6">
    <div className="form-group row">
        <label className="col-sm-12 col-form-label labelInput">Charger ID</label>
        <div className="col-sm-12">
            <InputField
                placeholder="Charger ID"
                value={charger_id}
                maxLength={14}
                onChange={(e) => {
                    const value = e.target.value;
                    const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 14);
                    setChargerID(sanitizedValue);
                }}
                required
            />
        </div>
    </div>
</div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Vendor</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField  placeholder="Vendor" value={vendor} maxLength={20} onChange={(e) => {const value = e.target.value; let sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, ''); setVendor(sanitizedValue); }} required/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Charger Model</label>
                                                                    <div className="col-sm-12">
                                                                        <select className="form-control" value={charger_model} onChange={handleModel} required>
                                                                            <option value="">Select model</option>
                                                                            <option value="3.5">3.5 KW</option>
                                                                            <option value="7.4">7.4 KW</option>
                                                                            <option value="11">11 KW</option>
                                                                            <option value="22">22 KW</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Charger Type</label>
                                                                    <div className="col-sm-12">
                                                                        <select className="form-control" value={charger_type} onChange={handleChargerType} required >
                                                                            <option value="AC">AC</option>
                                                                            <option value="DC">DC</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Max Current</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField 
                                                                            type="tel" 
                                                                            placeholder="Max Current" 
                                                                            value={max_current} 
                                                                            onChange={(e) => {
                                                                                let value = e.target.value;
                                                                                
                                                                                // Remove any non-numeric characters
                                                                                value = value.replace(/\D/g, '');
                                                                                
                                                                                // Ensure the value is within the specified range
                                                                                if (value < 1) {
                                                                                    value = '';
                                                                                } else if (value > 32) {
                                                                                    setErrorMessageCurrent('Max Current must be between 1 and 32');

                                                                                    value = '32';
                                                                                }
                                                                                
                                                                                // Update the state with the sanitized and restricted value
                                                                                setMaxCurrent(value);
                                                                            }} 
                                                                            required 
                                                                        />
                                                                        {errorMessageCurrent && <div className="text-danger">{errorMessageCurrent}</div>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Max Power</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField type="tel"  placeholder="Max Power" value={max_power} 
                                                                        onChange={(e) => {
                                                                            let value = e.target.value;
                                                                            
                                                                            // Remove any non-numeric characters
                                                                            value = value.replace(/\D/g, '');
                                                                            
                                                                            // Ensure the value is within the specified range
                                                                            if (value < 1) {
                                                                                value = '';
                                                                            } else if (value > 22000) {
                                                                                setErrorMessagePower('Max Power must be between 1 and 22,000');
                                                                                value = '22000';
                                                                            }
                                                                            
                                                                            // Update the state with the sanitized and restricted value
                                                                            setMaxPower(value);
                                                                        }} 
                                                                         required/> 
                                                                        {errorMessagePower && <div className="text-danger">{errorMessagePower}</div>}

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">WiFi Module</label>
                                                                    <div className="col-sm-12">
                                                                        <select className="form-control" value={wifi_module} onChange={handleWiFiModule} required>
                                                                            <option value="">Select Module</option>
                                                                            <option value="True">True</option>
                                                                            <option value="False">False</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Bluetooth Module</label>
                                                                    <div className="col-sm-12">
                                                                        <select className="form-control" value={bluetooth_module} onChange={handleBluetoothModule} required>
                                                                            <option value="">Select Module</option>
                                                                            <option value="True">True</option>
                                                                            <option value="False">False</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <h4 className="card-title" style={{ paddingTop: '25px' }}>Connectors</h4>
                                                        {connectors.map((connector, index) => (
                                                            <div className="row" key={index} style={{ margin: '0.3px' }}>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label className="col-form-label labelInput">Connector Type</label>
                                                                        <select 
                                                                            className="form-control" 
                                                                            value={connector.connector_type || ''} 
                                                                            onChange={(e) => handleConnectorType(index, 'connector_type', e.target.value)} 
                                                                            required
                                                                        >
                                                                            <option value="" disabled>Select type</option>
                                                                            <option value="Gun">Gun</option>
                                                                            <option value="Socket">Socket</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label className="col-form-label labelInput">Type Name</label>
                                                                        <select
                                                                            className="form-control"
                                                                            value={connector.type_name || ''}
                                                                            onChange={(e) => handleConnectorChange(index, 'type_name', e.target.value)}
                                                                            required
                                                                            disabled={!connector.connector_type} // Disable if no connector type is selected
                                                                        >
                                                                            <option value="">Select type name</option>
                                                                            {connector.typeOptions && connector.typeOptions.length > 0 ? (
                                                                                connector.typeOptions.map((option, idx) => (
                                                                                    <option key={idx} value={option}>
                                                                                        {option}
                                                                                    </option>
                                                                                ))
                                                                            ) : (
                                                                                <option disabled>No options available</option>
                                                                            )}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                {index === connectors.length - 1 && (
                                                                    <div className="col-md-2" style={{ paddingTop: '40px' }}>
                                                                        <div className="form-group">
                                                                            <div style={{ textAlign: 'center' }}>
                                                                                <button 
                                                                                    type="button" // Changed to button to avoid submitting the form
                                                                                    className="btn btn-outline-danger" 
                                                                                    onClick={() => handleRemoveConnector(index)} 
                                                                                    disabled={connectors.length === 1} // Prevent removal if there's only one connector
                                                                                >
                                                                                    <i className="mdi mdi-delete"></i>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {/* Only show the "Add Connector" button in the last row */}
                                                                {index === connectors.length - 1 && (
                                                                    <div className="col-md-2" style={{ paddingTop: '40px' }}>
                                                                        <div className="form-group">
                                                                            <div style={{ textAlign: 'center' }}>
                                                                                <button 
                                                                                    type="button" 
                                                                                    className="btn btn-outline-primary" 
                                                                                    onClick={addConnector}
                                                                                >
                                                                                    <i className="mdi mdi-plus"></i>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {/* Connectors section start */}
                                                        

                                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}
                                                        <LoadingButton
  type="submit"
  loading={loading}
  disabled={!isFormModified}
>
  Update
</LoadingButton>

                                                    </form>
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
                 
export default EditManageDevice;