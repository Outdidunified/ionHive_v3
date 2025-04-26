import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Sidebar from '../../components/Sidebar';
import Swal from 'sweetalert2';
import InputField from '../../../../utils/InputField';

const EditFinance = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dataItems = location.state?.newfinance || JSON.parse(localStorage.getItem('editDeviceData'));
    localStorage.setItem('editDeviceData', JSON.stringify(dataItems));

    const [eb_charges, setEbCharges] = useState(dataItems?.eb_charges || '');
    const [app_charges, setAppCharges] = useState(dataItems?.app_charges || '');
    const [other_charges, setOtherCharges] = useState(dataItems?.other_charges || '');
    const [parking_charges, setParkingCharges] = useState(dataItems?.parking_charges || '');
    const [rent_charges, setRentCharges] = useState(dataItems?.rent_charges || '');
    const [open_a_eb_charges, setOpenAebCharges] = useState(dataItems?.open_a_eb_charges || '');
    const [open_other_charges, setOpenOtherCharges] = useState(dataItems?.open_other_charges || '');
    const [status, setStatus] = useState(dataItems?.status ? 'true' : 'false');
    const [isEdited, setIsEdited] = useState(false); // Track if any input is edited

    const [errorMessage, setErrorMessage] = useState('');

    const validateInputrs = (value) => {
        // Allow only numbers and a single decimal point
        value = value.replace(/[^0-9.]/g, '');

        // Check if the value starts with multiple zeros
        if (value.startsWith('00')) {
            value = value.slice(1); // Remove one leading zero
        }

        const parts = value.split('.');

        // Ensure there's only one decimal point and limit to two decimal places
        if (parts.length > 2) {
            value = parts[0] + '.' + parts[1];
        } else if (parts.length === 2 && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].slice(0, 2);
        }

        // Ensure that the value does not start with zero unless it is "0.00"
        if (value.startsWith('0') && value.length > 1 && !value.startsWith('0.')) {
            value = value.replace(/^0+/, ''); // Remove leading zeros
        }

        // Limit the length to 7 characters
        if (value.length > 6) {
            value = value.slice(0, 6);
        }

        // Convert to float and validate range
        const numericValue = parseFloat(value);
        if (numericValue < 1 || numericValue > 100) {
            setErrorMessage(`Please enter a value between ₹1.00 and ₹100.00.`);
            return '';
        } else {
            setErrorMessage(''); // Clear error if within range
        }

        return value;
    };


    // Input validation function
    const validateInput = (value) => {
        // Allow only numbers and a single decimal point
        value = value.replace(/[^0-9.]/g, '');

        const parts = value.split('.');

        // Ensure there's only one decimal point and limit to two decimal places
        if (parts.length > 2) {
            value = parts[0] + '.' + parts[1];
        } else if (parts.length === 2 && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].slice(0, 2);
        }

        // Ensure that the value does not start with zero unless it is "0.00"
        if (value.startsWith('0') && value.length > 1 && !value.startsWith('0.')) {
            value = value.replace(/^0+/, ''); // Remove leading zeros
        }

        // Limit the length to 7 characters
        if (value.length > 6) {
            value = value.slice(0, 6);
        }

        // Convert to float and validate range
        const numericValue = parseFloat(value);
        if (numericValue < 0 || numericValue > 10) {
            setErrorMessage('Please enter a value between 0.00%  and 10.00% .');
            return '';
        } else {
            setErrorMessage(''); // Clear error if within range
        }

        return value;
    };

    // Handle change and validation for all fields
    const handleInputChangers = (setter) => (e) => {
        let value = validateInputrs(e.target.value);
        setter(value);
        setIsEdited(true); // Mark as edited
    };

    const handleInputChange = (setter) => (e) => {
        let value = validateInput(e.target.value);
        setter(value);
        setIsEdited(true); // Mark as edited
    };

    // Select status
    const handleStatusChange = (e) => {
        setStatus(e.target.value);
        setIsEdited(true); // Mark as edited
    };

    // Update finance details
    const updateFinanceDetails = async (e) => {
        e.preventDefault();

        try {
            const formattedFinanceData = {
                finance_id: dataItems.finance_id,
                client_id: dataItems.client_id,
                eb_charges: eb_charges,
                app_charges: app_charges,
                other_charges: other_charges,
                parking_charges: parking_charges,
                rent_charges: rent_charges,
                open_a_eb_charges: open_a_eb_charges,
                open_other_charges: open_other_charges,
                modified_by: userInfo.data.email_id,
                status: status === 'true',
            };

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/clientadmin/UpdateFinanceDetails`, formattedFinanceData);
            if (response.data.status === 'Success') {
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Finance details updated successfully",
                    showConfirmButton: false,
                    timer: 1500
                });
                navigate('/clientadmin/ManageFinance');
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

    // Back page
    const goBack = () => {
        navigate(-1);
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
                                                                    <label className="col-sm-12 col-form-label labelInput">EB Charges</label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">₹</span>
                                                                            </div>
                                                                            <InputField

                                                                                name="eb_charges"
                                                                                maxLength={6}
                                                                                value={eb_charges}
                                                                                onChange={handleInputChangers(setEbCharges)}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">App Charges</label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">%</span>
                                                                            </div>
                                                                            <InputField

                                                                                name="app_charges"
                                                                                maxLength={5}
                                                                                value={app_charges}
                                                                                onChange={handleInputChange(setAppCharges)}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Other Charges</label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">%</span>
                                                                            </div>
                                                                            <InputField

                                                                                name="other_charges"
                                                                                maxLength={5}
                                                                                value={other_charges}
                                                                                onChange={handleInputChange(setOtherCharges)}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Parking Charges</label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">%</span>
                                                                            </div>
                                                                            <InputField

                                                                                name="parking_charges"
                                                                                maxLength={5}
                                                                                value={parking_charges}
                                                                                onChange={handleInputChange(setParkingCharges)}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Rent Charges</label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">%</span>
                                                                            </div>
                                                                            <InputField

                                                                                name="rent_charges"
                                                                                maxLength={5}
                                                                                value={rent_charges}
                                                                                onChange={handleInputChange(setRentCharges)}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Open A EB Charges</label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">%</span>
                                                                            </div>
                                                                            <InputField

                                                                                name="open_a_eb_charges"
                                                                                maxLength={5}
                                                                                value={open_a_eb_charges}
                                                                                onChange={handleInputChange(setOpenAebCharges)}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Open Other Charges</label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">%</span>
                                                                            </div>
                                                                            <InputField

                                                                                name="open_other_charges"
                                                                                maxLength={5}
                                                                                value={open_other_charges}
                                                                                onChange={handleInputChange(setOpenOtherCharges)}
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
                                                        <div style={{ textAlign: 'center', padding: '15px' }}>
                                                            <button type="submit" className="btn btn-primary mr-2" disabled={!isEdited}>Update</button>
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
