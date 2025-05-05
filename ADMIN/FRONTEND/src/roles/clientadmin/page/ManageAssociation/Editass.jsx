
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Sidebar from '../../components/Sidebar';
import useEditass from '../../hooks/ManageAssociation/EditAssociationHooks';
import ReusableButton from '../../../../utils/ReusableButton';
import InputField from '../../../../utils/InputField';
const Editass = ({ userInfo, handleLogout }) => {
    const {
        dataItems,
        association_name, setAssociationName,
        association_phone_no, setAssociationPhoneNo,
        association_wallet, setAssociationWallet,
        association_address, setAssociationAddress,
        status, 
        errorMessage, setErrorMessage,
        isModified, handleStatusChange,
        updateAssociationDetails,
        goBack, loading

    } = useEditass(userInfo)
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
                                        <h3 className="font-weight-bold">Edit Association Details</h3>
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
                                                    <h4 className="card-title">Update Association Details</h4>
                                                    <form className="form-sample" onSubmit={updateAssociationDetails}>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Association  Name</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField

                                                                            value={association_name}
                                                                            maxLength={25}
                                                                            onChange={(e) => {
                                                                                const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');
                                                                                setAssociationName(sanitizedValue.slice(0, 25));
                                                                            }}
                                                                            readOnly
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label">Association ID</label>
                                                                    <div className="col-sm-12">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            value={dataItems.association_id}
                                                                            readOnly
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div> */}
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Association Phone</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField

                                                                            value={association_phone_no}
                                                                            maxLength={10}
                                                                            onChange={(e) => {
                                                                                const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
                                                                                setAssociationPhoneNo(sanitizedValue.slice(0, 10));
                                                                            }}
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Association Email</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField
                                                                            type="email"
                                                                            value={dataItems.association_email_id}
                                                                            readOnly
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Association Wallet</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField
                                                                            value={association_wallet}
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
                                                                                    setAssociationWallet(value);
                                                                                    setErrorMessage(''); // Clear error if within range
                                                                                } else {
                                                                                    // If outside range, clear the input field and show an error message
                                                                                    setAssociationWallet('');
                                                                                    setErrorMessage('Please enter a wallet amount between 1.00 ₹ and 99999.00 ₹.');
                                                                                }
                                                                            }}
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Association  Address</label>
                                                                    <div className="col-sm-12">
                                                                        <textarea
                                                                            type="text"
                                                                            className="form-control"
                                                                            maxLength={150}
                                                                            value={association_address}
                                                                            onChange={(e) => setAssociationAddress(e.target.value)}
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Status</label>
                                                                    <div className="col-sm-12">
                                                                        <select
                                                                            className="form-control"
                                                                            value={status}
                                                                            onChange={handleStatusChange}
                                                                            required>
                                                                            <option value="true">Active</option>
                                                                            <option value="false">DeActive</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}


                                                        <ReusableButton
                                                            type="submit"
                                                            disabled={!isModified}
                                                            loading={loading} >Update</ReusableButton>                                                </form>
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

export default Editass;
