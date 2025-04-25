import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Sidebar from '../../components/Sidebar';
import Swal from 'sweetalert2';

const CreateFinance = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();
    const [newFinance, setNewFinance] = useState({
        eb_charge: '', gst: '', margin: '', parking_fee: '', processing_fee: '', convenience_fee: '',
        service_fee: '', station_fee: '', created_by: userInfo.data.email_id,
    });
    
    const [errorMessage, setErrorMessage] = useState('');
    
   // Validation Function
    // const validateNumberInput = (value, min, max) => {
    //     value = value.replace(/[^0-9.]/g, ''); // Allow only numbers and one decimal point
    //     const parts = value.split('.');

    //     if (parts.length > 2) {
    //         value = parts[0] + '.' + parts[1]; // Prevent multiple decimal points
    //     } else if (parts.length === 2 && parts[1].length > 2) {
    //         value = parts[0] + '.' + parts[1].slice(0, 2); // Limit to two decimal places
    //     }

    //     value = value.replace(/^0+(\d)/, '$1'); // Remove leading zeros properly

    //     const numericValue = parseFloat(value);

    //     if (isNaN(numericValue) || numericValue < min || numericValue > max) {
    //         return { value, isValid: false };
    //     }
    //     return { value, isValid: true };
    // };

    // State to track touched fields
    //const [touchedFields, setTouchedFields] = useState({});

    // Handle Input Change
    const handleInputChange = (e, field) => {
        let min = 0, max = Infinity;
        let errorLabel = ""; 
        let value = e.target.value.replace(/[^0-9.]/g, ''); // Allow only numbers and one decimal point
    
        if (field === 'eb_charge') {
            min = 5; // EB charge must be at least ₹5
            errorLabel = "EB charge must be at least ₹5.";
        } else if (field === 'gst') {
            min = 5; // GST must be between 5% and 50%
            max = 50;
            errorLabel = "GST must be between 5% and 50%.";
        }
    
        // Prevent multiple decimal points
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts[1];
        } else if (parts.length === 2 && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].slice(0, 2); // Limit to two decimal places
        }
    
        // Remove leading zeros (except for `eb_charge` and `gst`)
        if (field !== 'eb_charge' && field !== 'gst') {
            value = value.replace(/^0+/, ''); 
            if (value === '') value = '0'; // If the field is empty after removing leading zeros, set it to '0'
        }
    
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue < min || numericValue > max) {
            setErrorMessage(errorLabel);
        } else {
            setErrorMessage('');
        }
    
        setNewFinance(prev => ({ ...prev, [field]: value }));
    };
    


    // Create Finance Function
    const createFinance = async (e) => {
        e.preventDefault();

        if (!newFinance.eb_charge || parseFloat(newFinance.eb_charge) < 5) {
            setErrorMessage("EB charge must be at least ₹5.");
            return;
        }

        if (!newFinance.gst || parseFloat(newFinance.gst) < 5 || parseFloat(newFinance.gst) > 50) {
            setErrorMessage("GST must be between 5% and 50%.");
            return;
        }

        setErrorMessage(''); // Clear any previous errors

        try {
            const formattedFinanceData = {
                association_id: userInfo.data.association_id,
                gst: newFinance.gst || "0",
                eb_charge: newFinance.eb_charge,
                margin: newFinance.margin || "0",
                parking_fee: newFinance.parking_fee || "0",
                processing_fee: newFinance.processing_fee || "0",
                convenience_fee: newFinance.convenience_fee || "0",
                service_fee: newFinance.service_fee || "0",
                station_fee: newFinance.station_fee || "0",
                created_by: newFinance.created_by,
            };

            await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/createFinance`, formattedFinanceData);

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Finance created successfully',
                showConfirmButton: false,
                timer: 1500
            });

            goBack();
        } catch (error) {
            console.error('Error creating finance:', error);
            setErrorMessage('Failed to create finance. Please try again.');
        }
    };

    // back page
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
                                        <h3 className="font-weight-bold">Create Finance</h3>
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
                                                    <h4 className="card-title">Create Finance</h4>
                                                    <form className="form-sample" onSubmit={createFinance}>
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
                                                                                placeholder="EB Charger"
                                                                                value={newFinance.eb_charge}
                                                                                onChange={(e) => handleInputChange(e, 'eb_charge')}
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
                                                                                className="form-control" placeholder="Margin"
                                                                                value={newFinance.margin || 0}
                                                                                onChange={(e) => handleInputChange(e, 'margin')}
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
                                                                                placeholder="GST"
                                                                                value={newFinance.gst}
                                                                                onChange={(e) => handleInputChange(e, 'gst')}
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
                                                                                className="form-control" placeholder="Processing Fee"
                                                                                value={newFinance.processing_fee || 0}
                                                                                onChange={(e) => handleInputChange(e, 'processing_fee')}
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
                                                                                className="form-control" placeholder="Parking Fee"
                                                                                value={newFinance.parking_fee || 0}
                                                                                onChange={(e) => handleInputChange(e, 'parking_fee')} required
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
                                                                                className="form-control" placeholder="Convenience Fee"
                                                                                value={newFinance.convenience_fee || 0}
                                                                                onChange={(e) => handleInputChange(e, 'convenience_fee')} required
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
                                                                                className="form-control" placeholder="Service Fee"
                                                                                value={newFinance.service_fee || 0}
                                                                                onChange={(e) => handleInputChange(e, 'service_fee')}
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
                                                                                className="form-control" placeholder="Station Fee"
                                                                                value={newFinance.station_fee || 0}
                                                                                onChange={(e) => handleInputChange(e, 'station_fee')}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}
                                                        <div style={{ textAlign: 'center', padding:'15px'}}>
                                                            <button type="submit" className="btn btn-primary mr-2">Create Finance</button>
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

export default CreateFinance;
