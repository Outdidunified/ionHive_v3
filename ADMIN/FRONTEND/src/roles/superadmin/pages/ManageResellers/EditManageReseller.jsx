import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useEditResellerForm from '../../hooks/ManageReseller/EditManageResellerHooks';
import { useNavigate } from 'react-router-dom';
import ReusableButton from '../../../../utils/ReusableButton';
import InputField from '../../../../utils/InputField';

const EditManageReseller = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();

    const {
        reseller_name,
        setResellerName,
        reseller_phone_no,
        setResellerPhoneNumber,
        reseller_email_id,
        setEmilaID,
        reseller_address,
        setResellerAddress,
        reseller_wallet,
        setResellerWallet,
        selectStatus,
        handleStatusChange,
        setErrorMessage,
        isModified,
        loading,
        errorMessage,
        editManageReseller
    } = useEditResellerForm(userInfo);

    const backManageReseller = () => {
        navigate('/superadmin/ViewManageReseller');
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
                                        <h3 className="font-weight-bold">Edit Manage Reseller</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={backManageReseller}>Back</button>
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
                                                    <h4 className="card-title">Manage Reseller</h4>
                                                    <form className="form-sample" onSubmit={editManageReseller}>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group ">
                                                                    <label className="col-form-label labelInput">Reseller Name</label>

                                                                    <InputField value={reseller_name} onChange={(e) => setResellerName(e.target.value)} readOnly required />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="col-form-label labelInput">Phone Number</label>

                                                                    <InputField value={reseller_phone_no} maxLength={10} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setResellerPhoneNumber(sanitizedValue); }} required />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="col-form-label labelInput">Email ID</label>
                                                                    <InputField type="email" value={reseller_email_id} onChange={(e) => setEmilaID(e.target.value)} readOnly required />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="col-form-label labelInput">Wallet</label>
                                                                    <InputField
                                                                        value={reseller_wallet}
                                                                        onChange={(e) => {
                                                                            let value = e.target.value;

                                                                            // Allow only numbers and a single decimal point
                                                                            value = value.replace(/[^0-9.]/g, '');

                                                                            const parts = value.split('.');

                                                                            // Ensure there's only one decimal point and limit to two decimal places
                                                                            if (parts.length > 2) {
                                                                                value = parts[0] + '.' + parts[1];
                                                                            } else if (parts.length === 2 && parts[1].length > 2) {
                                                                                value = parts[0] + '.' + parts[1].slice(0, 2);
                                                                            }

                                                                            // Limit the length to 8 characters
                                                                            if (value.length > 8) {
                                                                                value = value.slice(0, 8);
                                                                            }

                                                                            // Convert to float and validate range
                                                                            const numericValue = parseFloat(value);

                                                                            // If the value is within the range 1.00 to 99,999.00, set the value
                                                                            if (!isNaN(numericValue) && numericValue >= 1 && numericValue < 100000) {
                                                                                setResellerWallet(value);
                                                                                setErrorMessage(''); // Clear error if within range
                                                                            } else {
                                                                                // If outside range, clear the input field and show an error message
                                                                                setResellerWallet('');
                                                                                setErrorMessage('Please enter a wallet amount between 1.00 ₹ and 99999.00 ₹.');
                                                                            }
                                                                        }}
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="col-form-label labelInput">Address</label>
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        placeholder="Address"
                                                                        value={reseller_address}
                                                                        maxLength={150}
                                                                        onChange={(e) => setResellerAddress(e.target.value)}
                                                                        required
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label className="col-form-label labelInput">Status</label>

                                                                    <select className="form-control" value={selectStatus} onChange={handleStatusChange} required >
                                                                        <option value="true">Active</option>
                                                                        <option value="false">Deactive</option>
                                                                    </select>
                                                                </div>
                                                            </div>

                                                        </div>
                                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}<br />
                                                        <ReusableButton
                                                            type="submit"
                                                            loading={loading}
                                                            disabled={!isModified || loading}
                                                        >
                                                            Update
                                                        </ReusableButton>


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

export default EditManageReseller;
