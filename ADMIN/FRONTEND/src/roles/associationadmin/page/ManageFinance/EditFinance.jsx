import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Sidebar from '../../components/Sidebar';
import Swal from 'sweetalert2';

const EditFinance = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dataItems = location.state?.newfinance || JSON.parse(localStorage.getItem('editDeviceData'));
    localStorage.setItem('editDeviceData', JSON.stringify(dataItems));

    const [eb_charge, setEbCharge] = useState(dataItems?.eb_charge || '');
    const [gst, setGst] = useState(dataItems?.gst || '');
    const [margin, setMargin] = useState(dataItems?.margin || '');
    const [processing_fee, setProcessingFee] = useState(dataItems?.processing_fee || '');
    const [parking_fee, setParkingFee] = useState(dataItems?.parking_fee || '');
    const [convenience_fee, setConvienceFee] = useState(dataItems?.convenience_fee || '');
    const [service_fee, setServiceFee] = useState(dataItems?.service_fee || '');
    const [station_fee, setStationFee] = useState(dataItems?.station_fee || '');
    const [status, setStatus] = useState(dataItems?.status ? 'true' : 'false');
    const [errorMessage, setErrorMessage] = useState('');

    const [initialValues] = useState({
        eb_charge: dataItems?.eb_charge || '',
        gst: dataItems?.gst || '',
        margin: dataItems?.margin || '',
        processing_fee: dataItems?.processing_fee || '',
        parking_fee: dataItems?.parking_fee || '',
        convenience_fee: dataItems?.convenience_fee || '',
        service_fee: dataItems?.service_fee || '',
        station_fee: dataItems?.station_fee || '',
        status: dataItems?.status ? 'true' : 'false',
    });

    const isModified =
        String(eb_charge) !== String(initialValues.eb_charge) ||
        String(gst) !== String(initialValues.gst) ||
        String(margin) !== String(initialValues.margin) ||
        String(processing_fee) !== String(initialValues.processing_fee) ||
        String(parking_fee) !== String(initialValues.parking_fee) ||
        String(convenience_fee) !== String(initialValues.convenience_fee) ||
        String(service_fee) !== String(initialValues.service_fee) ||
        String(station_fee) !== String(initialValues.station_fee) ||
        status !== initialValues.status;

    const validateEBCharge = (value) => {
        value = value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) value = parts[0] + '.' + parts[1];
        else if (parts.length === 2 && parts[1].length > 2)
            value = parts[0] + '.' + parts[1].slice(0, 2);

        value = value.replace(/^0+(\d)/, '$1');
        const numericValue = parseFloat(value);

        if (isNaN(numericValue) || numericValue < 5) {
            setErrorMessage("EB charge must be at least ₹5.");
        } else {
            setErrorMessage('');
        }

        return value;
    };

    const validateGST = (value) => {
        value = value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) value = parts[0] + '.' + parts[1];
        else if (parts.length === 2 && parts[1].length > 2)
            value = parts[0] + '.' + parts[1].slice(0, 2);

        value = value.replace(/^0+(\d)/, '$1');
        const numericValue = parseFloat(value);

        if (isNaN(numericValue) || numericValue < 5 || numericValue > 50) {
            setErrorMessage("GST must be between 5% and 50%.");
        } else {
            setErrorMessage('');
        }

        return value;
    };

    const validateOtherCharges = (value) => {
        value = value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) value = parts[0] + '.' + parts[1];
        else if (parts.length === 2 && parts[1].length > 2)
            value = parts[0] + '.' + parts[1].slice(0, 2);

        value = value.replace(/^0+(\d)/, '$1');
        return value === '' ? '0' : value;
    };

    const handleEBChargeChange = (e) => {
        setEbCharge(validateEBCharge(e.target.value));
    };

    const handleGSTChange = (e) => {
        setGst(validateGST(e.target.value));
    };

    const handleOtherChargesChange = (setter) => (e) => {
        setter(validateOtherCharges(e.target.value));
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const updateFinanceDetails = async (e) => {
        e.preventDefault();

        if (isNaN(eb_charge) || eb_charge < 5) {
            setErrorMessage("EB charge must be at least ₹5.");
            return;
        }

        if (isNaN(gst) || gst < 5 || gst > 50) {
            setErrorMessage("GST must be between 5% and 50%.");
            return;
        }

        setErrorMessage('');

        const formattedFinanceData = {
            _id: dataItems._id,
            finance_id: dataItems.finance_id,
            association_id: dataItems.association_id,
            eb_charge,
            margin,
            processing_fee,
            parking_fee,
            convenience_fee,
            service_fee,
            station_fee,
            gst,
            modified_by: userInfo.data.email_id,
            status: status === 'true',
        };

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/updateFinance`, formattedFinanceData);

            if (response.data.status === 'Success') {
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Finance details updated successfully",
                    showConfirmButton: false,
                    timer: 1500
                });
                navigate('/associationadmin/ManageFinance');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error updating finance details',
                    text: response.data.message,
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        } catch (error) {
            console.error('Error updating finance details:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error updating finance details',
                text: 'Please try again later.',
                timer: 2000,
                timerProgressBar: true
            });
        }
    };

    const goBack = () => navigate(-1);

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
                                        <h3 className="font-weight-bold">Edit Finance Details</h3>
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
                                        <div className="col-12 grid-margin">
                                            <div className="card">
                                                <div className="card-body">
                                                    <h4 className="card-title">Update Finance Details</h4>
                                                    <form className="form-sample" onSubmit={updateFinanceDetails}>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">EB Charge</label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">₹</span>
                                                                            </div>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="eb_charge"
                                                                                value={eb_charge}
                                                                                onChange={handleEBChargeChange}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Margin</label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">₹</span>
                                                                            </div>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="margin"
                                                                                value={margin || 0}
                                                                                onChange={handleOtherChargesChange(setMargin)}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">GST</label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">%</span>
                                                                            </div>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="gst"
                                                                                value={gst}
                                                                                onChange={handleGSTChange}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Processing Fee</label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">₹</span>
                                                                            </div>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="processing_fee"
                                                                                value={processing_fee}
                                                                                onChange={handleOtherChargesChange(setProcessingFee)}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Parking Fee</label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">₹</span>
                                                                            </div>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="parking_fee"
                                                                                value={parking_fee}
                                                                                onChange={handleOtherChargesChange(setParkingFee)}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Convenience Fee</label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">₹</span>
                                                                            </div>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="convenience_fee"
                                                                                value={convenience_fee}
                                                                                onChange={handleOtherChargesChange(setConvienceFee)}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Service Fee</label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">₹</span>
                                                                            </div>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="service_fee"
                                                                                value={service_fee}
                                                                                onChange={handleOtherChargesChange(setServiceFee)}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Station Fee</label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">₹</span>
                                                                            </div>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                name="station_fee"
                                                                                value={station_fee}
                                                                                onChange={handleOtherChargesChange(setStationFee)}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>                                                            
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Status</label>
                                                                    <div className="col-sm-12">
                                                                        <select className="form-control" value={status} onChange={handleStatusChange} required>
                                                                            <option value="true">Active</option>
                                                                            <option value="false">DeActive</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}
                                                        <div style={{ textAlign: 'center', padding:'15px'}}>
                                                            <button type="submit" className="btn btn-primary mr-2" disabled={!isModified}>Update</button>
                                                        </div>
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

export default EditFinance;
