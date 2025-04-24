import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Sidebar from '../../components/Sidebar';
import useUpdateClientForm from '../../hooks/ManageClient/UpdateClientsHooks';
import LoadingButton from '../../../../utils/LoadingButton';
const UpdateClient = ({ userInfo, handleLogout }) => {
    const {
        client_name, setClientName,
        client_phone_no, setClientPhoneNo,
        client_address, setClientAddress,
        client_wallet, setClientWallet,
        status, handleStatusChange,
        errorMessage,
        isModified,
        setErrorMessage,
        updateClientUser,
        goBack, dataItems, loading
    } = useUpdateClientForm(userInfo);

    return (
        <div className='container-scroller'>
            {/* Header */}
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="container-fluid page-body-wrapper" style={{ paddingTop: '40px' }}>
                {/* Sidebar */}
                <Sidebar />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-12 grid-margin">
                                <div className="row">
                                    <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                                        <h3 className="font-weight-bold">Edit Client</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={goBack} style={{ marginRight: '10px' }}>Back</button>
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
                                                    <h4 className="card-title">Update Client</h4>
                                                    <form className="form-sample" onSubmit={updateClientUser}>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Client Name</label>
                                                                    <div className="col-sm-12">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            value={client_name}
                                                                            maxLength={25}
                                                                            onChange={(e) => {
                                                                                const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');
                                                                                setClientName(sanitizedValue.slice(0, 25));
                                                                            }}
                                                                            readOnly
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Phone No</label>
                                                                    <div className="col-sm-12">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            value={client_phone_no}
                                                                            maxLength={10}
                                                                            onChange={(e) => {
                                                                                const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
                                                                                setClientPhoneNo(sanitizedValue.slice(0, 10));
                                                                            }}
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Email ID</label>
                                                                    <div className="col-sm-12">
                                                                        <input
                                                                            type="email"
                                                                            className="form-control"
                                                                            value={dataItems.client_email_id}
                                                                            readOnly
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Wallet</label>
                                                                    <div className="col-sm-12">
                                                                        <input type="text"
                                                                            className="form-control"
                                                                            value={client_wallet}
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
                                                                                    setClientWallet(value);
                                                                                    setErrorMessage(''); // Clear error if within range
                                                                                } else {
                                                                                    // If outside range, clear the input field and show an error message
                                                                                    setClientWallet('');
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
                                                                    <label className="col-sm-12 col-form-label labelInput">Address</label>
                                                                    <div className="col-sm-12">
                                                                        <textarea
                                                                            type="text"
                                                                            className="form-control"
                                                                            maxLength={150}
                                                                            value={client_address}
                                                                            onChange={(e) => setClientAddress(e.target.value)}
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
                                                                            required
                                                                            style={{ color: "black" }}
                                                                        >
                                                                            <option value="true">Active</option>
                                                                            <option value="false">DeActive</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}

                                                        <LoadingButton
                                                            type="submit"
                                                            loading={loading}
                                                            disabled={!isModified || loading}
                                                        >Update
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

export default UpdateClient;
