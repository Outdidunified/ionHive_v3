import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useEditUser from '../../hooks/ManageUsers/EditUserListHooks';
import { useNavigate } from 'react-router-dom';
import ReusableButton from '../../../../utils/ReusableButton';
import InputField from '../../../../utils/InputField';

const EditUserList = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();

    const {
        editManageUser,
        setPhoneNo,
        handleStatusChange, isModified,
        username,
        email_id,
        passwords,
        phone_no,
        wallet_bal,
        errorMessage,
        selectStatus, dataItem, setPassword, loading,setWalletBal,setErrorMessage
    } = useEditUser(userInfo)

    const backManageDevice = () => {
        navigate('/superadmin/ViewUserList');
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
                                        <h3 className="font-weight-bold">Edit User List</h3>
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
                                                    <h4 className="card-title">Manage User</h4>
                                                    <form className="form-sample" onSubmit={editManageUser}>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">User Name</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField value={username} maxLength={25} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, ''); setUsername(sanitizedValue); }} readOnly required />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Phone Number</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField value={phone_no} maxLength={10} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setPhoneNo(sanitizedValue); }} required />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Email ID</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField value={email_id} onChange={(e) => setEmailId(e.target.value)} readOnly required />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Password</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField value={passwords} maxLength={4} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setPassword(sanitizedValue); }} required />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            {dataItem.role_id === 5 &&
                                                                <div className="col-md-6">
                                                                    <div className="form-group row">
                                                                        <label className="col-sm-12 col-form-label labelInput">Wallet</label>
                                                                        <div className="col-sm-12">
                                                                            <InputField
                                                                                value={wallet_bal}
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
                                                                                    if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 10000) {
                                                                                        setWalletBal(value);
                                                                                        setErrorMessage(''); // Clear error if within range
                                                                                    } else {
                                                                                        // If outside range, clear the input field and show an error message
                                                                                        setWalletBal('');
                                                                                        setErrorMessage('Please enter a wallet amount between 1.00 ₹ and 10,000.00 ₹.');
                                                                                    }
                                                                                }}
                                                                                required
                                                                            />

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            }
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Status</label>
                                                                    <div className="col-sm-12">
                                                                        <select className="form-control" value={selectStatus} onChange={handleStatusChange} required>
                                                                            <option value="true">Active</option>
                                                                            <option value="false">Deactive</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}<br />


                                                        <ReusableButton
                                                            type="submit"
                                                            disabled={loading || !isModified}
                                                            loading={loading}>
                                                            Update</ReusableButton>


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

export default EditUserList;
