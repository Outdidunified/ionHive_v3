import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useCreateClient from '../../hooks/ManageClient/CreateClientsHooks';
import LoadingButton from '../../../../utils/LoadingButton';
import InputField from '../../../../utils/InputField';
const CreateClients = ({ userInfo, handleLogout }) => {
    const {
        client_name,
        setClientName,
        client_phone_no,
        setPhoneNumber,
        client_email_id,
        setEmailID,
        client_address,
        setAddress,
        errorMessage,
        loading,
        addManageClient,
        backManageClient
    } = useCreateClient(userInfo);

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
                                        <h3 className="font-weight-bold">Manage Clients</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={backManageClient}>Back</button>
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
                                                    <h4 className="card-title">Create Client Users</h4>
                                                    <form className="form-sample" onSubmit={addManageClient}>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Client Name</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField placeholder="Client Name" value={client_name} maxLength={25} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, ''); setClientName(sanitizedValue); }} required />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Phone Number</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField placeholder="Phone Number" value={client_phone_no} maxLength={10} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setPhoneNumber(sanitizedValue); }} required />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Email ID</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField type="email" placeholder="Email ID" value={client_email_id} onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            // Remove spaces and invalid characters
                                                                            const noSpaces = value.replace(/\s/g, '');
                                                                            const validChars = noSpaces.replace(/[^a-zA-Z0-9@.]/g, '');
                                                                            // Convert to lowercase
                                                                            const lowerCaseEmail = validChars.toLowerCase();
                                                                            // Handle multiple @ symbols
                                                                            const atCount = (lowerCaseEmail.match(/@/g) || []).length;
                                                                            const sanitizedEmail = atCount <= 1 ? lowerCaseEmail : lowerCaseEmail.replace(/@.*@/, '@');
                                                                            // Set the sanitized and lowercase email
                                                                            setEmailID(sanitizedEmail);
                                                                        }} required />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Address</label>
                                                                    <div className="col-sm-12">
                                                                        <textarea type="text" className="form-control" placeholder="Address" value={client_address} maxLength={150} onChange={(e) => setAddress(e.target.value)} required />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}<br />

                                                        <LoadingButton
                                                            type="submit"
                                                            loading={loading}
                                                            disabled={loading}>Add
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

export default CreateClients