import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import useAddManageDevice from '../../hooks/ManageDevice/AddManageDeviceHooks';
import LoadingButton from '../../../../utils/LoadingButton';
const AddManageDevice = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();

    const {
        charger_id, charger_model, vendor, maxCurrent, maxPower, errorMessage, selectChargerType,
        connectors, data, errorMessageCurrent, errorMessagePower, wifi_module, bluetooth_module, loading,
        setChargerID, setVendor, setMaxCurrent, setMaxPower, setErrorMessagePower, setErrorMessageCurrent,
         handleClone, addConnector, removeConnector, handleConnectorChange, handleConnectorType,
         addManageDevice, handleModel, handleChargerType, handleBluetoothModule, handleWiFiModule,
    } = useAddManageDevice(userInfo);


    const backManageDevice = () => {
        navigate('/superadmin/ManageDevice');
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
                                    <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                                        <h3 className="font-weight-bold">Add Manage Device</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <div className="dropdown">
                                                <button className="btn btn-outline-warning btn-icon-text dropdown-toggle" type="button" style={{ marginRight: '10px' }} id="dropdownMenuIconButton1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    <i className="ti-file btn-icon-prepend"></i>Select Clone
                                                </button>
                                                <div className="dropdown-menu" aria-labelledby="dropdownMenuIconButton1">
                                                    <h6 className="dropdown-header">Select clone model</h6>
                                                    {data.length === 0 ? (
                                                        <option disabled style={{ paddingLeft: '50px' }}>No data found</option>
                                                    ) : (
                                                        Array.from(new Set(data.map(item => item.charger_model))).map((uniqueModel, index) => (
                                                            <p key={index} className="dropdown-item" onClick={() => handleClone(uniqueModel)}>{uniqueModel} KW</p>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
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
                                                    <form className="form-sample" onSubmit={addManageDevice}>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="col-form-label labelInput">Charger ID</label>
                                                                    <input type="text" className="form-control" placeholder="Charger ID" value={charger_id} maxLength={20} onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '');
                                                                        setChargerID(sanitizedValue);
                                                                    }} required />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="col-form-label labelInput">Vendor</label>
                                                                    <input type="text" className="form-control" placeholder="Vendor" value={vendor} maxLength={20} onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        let sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, '');
                                                                        setVendor(sanitizedValue);
                                                                    }} required />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="col-form-label labelInput">Charger Model</label>
                                                                    <select className="form-control" value={charger_model} onChange={handleModel} required>
                                                                        <option value="">Select model</option>
                                                                        <option value="3.5">3.5 KW</option>
                                                                        <option value="7.4">7.4 KW</option>
                                                                        <option value="11">11 KW</option>
                                                                        <option value="22">22 KW</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="col-form-label labelInput">Charger Type</label>
                                                                    <select className="form-control" value={selectChargerType} onChange={handleChargerType} required>
                                                                        <option value="">Select type</option>
                                                                        <option value="AC">AC</option>
                                                                        <option value="DC">DC</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="col-form-label labelInput">Max Current</label>
                                                                    <input type="tel" className="form-control" placeholder="Max Current" value={maxCurrent}
                                                                        onChange={(e) => {
                                                                            let value = e.target.value;
                                                                            value = value.replace(/\D/g, ''); // Remove non-numeric
                                                                            if (value < 1) {
                                                                                value = '';
                                                                            } else if (value > 32) {
                                                                                setErrorMessageCurrent('Max Current must be between 1 and 32');
                                                                                value = '32';
                                                                            }
                                                                            setMaxCurrent(value);
                                                                        }} required />
                                                                    {errorMessageCurrent && <div className="text-danger">{errorMessageCurrent}</div>}
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="col-form-label labelInput">Max Power</label>
                                                                    <input type="tel" className="form-control" placeholder="Max Power" value={maxPower}
                                                                        onChange={(e) => {
                                                                            let value = e.target.value;
                                                                            value = value.replace(/\D/g, '');
                                                                            if (value < 1) {
                                                                                value = '';
                                                                            } else if (value > 22000) {
                                                                                setErrorMessagePower('Max Power must be between 1 and 22,000');
                                                                                value = '22000';
                                                                            }
                                                                            setMaxPower(value);
                                                                        }} required />
                                                                    {errorMessagePower && <div className="text-danger">{errorMessagePower}</div>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="col-form-label labelInput">WiFi Module</label>
                                                                    <select className="form-control" value={wifi_module} onChange={handleWiFiModule} required>
                                                                        <option value="">Select Module</option>
                                                                        <option value="True">True</option>
                                                                        <option value="False">False</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="col-form-label labelInput">Bluetooth Module</label>
                                                                    <select className="form-control" value={bluetooth_module} onChange={handleBluetoothModule} required>
                                                                        <option value="">Select Module</option>
                                                                        <option value="True">True</option>
                                                                        <option value="False">False</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Connectors section start */}
                                                        <h4 className="card-title" style={{ paddingTop: '25px', marginBottom: '20px' }}>Connectors</h4>
                                                        {connectors.map((connector, index) => (
                                                            <div className="row" key={index}>
                                                                <div className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label className="col-form-label labelInput">Connector Type</label>
                                                                        <select className="form-control" value={connector.connector_type}
                                                                            onChange={(e) => handleConnectorType(index, 'connector_type', e.target.value)} required>
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
                                                                            value={connector.type_name}
                                                                            onChange={(e) => handleConnectorChange(index, 'type_name', e.target.value)}
                                                                            required
                                                                            disabled={!connector.connector_type} // Disable if no connector type is selected
                                                                        >
                                                                            <option value="">Select type name</option>
                                                                            {connector.typeOptions.length > 0 ? (
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
                                                                                <button type="submit" className="btn btn-outline-danger" onClick={() => removeConnector(index)} disabled={connectors.length === 1}> <i className="mdi mdi-delete"></i></button>
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
                                                                                    type="submit"
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
                                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}
                                                        <br></br>

                                                        <LoadingButton
                                                            type="submit"
                                                            loading={loading}
                                                            className="mr-2"
                                                        >
                                                            Add
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

export default AddManageDevice;