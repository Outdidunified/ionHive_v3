import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useCreateass from '../../hooks/ManageAssociation/createassociationHooks';
import ReusableButton from '../../../../utils/ReusableButton';
import InputField from '../../../../utils/InputField';

const Createass = ({ userInfo, handleLogout }) => {
    const {
        newUser,
        errorMessage,
        loading,
        Goback,
        addClientUser, setNewUser,
        

    } = useCreateass(userInfo)
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
                                        <h3 className="font-weight-bold">Create Association</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={Goback}>Back</button>
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
                                                    <h4 className="card-title">Association Details</h4>
                                                    <form className="form-sample" onSubmit={addClientUser}>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Association Name</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField

                                                                            placeholder="Association Name"
                                                                            value={newUser.association_name}
                                                                            maxLength={25}
                                                                            onChange={(e) => {
                                                                                const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                                                                                setNewUser({ ...newUser, association_name: sanitizedValue });
                                                                            }}
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Phone No</label>
                                                                    <div className="col-sm-12">
                                                                        <InputField

                                                                            placeholder="Phone No"
                                                                            value={newUser.association_phone_no}
                                                                            maxLength={10}
                                                                            onChange={(e) => {
                                                                                const sanitizedValue = e.target.value.replace(/[^0-9]/g, '');
                                                                                setNewUser({ ...newUser, association_phone_no: sanitizedValue });
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
                                                                        <InputField
                                                                            type="email"
                                                                            placeholder="Email ID"
                                                                            value={newUser.association_email_id}
                                                                            onChange={(e) => {
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
                                                                                setNewUser({ ...newUser, association_email_id: sanitizedEmail });
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
                                                                        <textarea type="text" className="form-control" placeholder="Address" maxLength={150} value={newUser.association_address} onChange={(e) => setNewUser({ ...newUser, "association_address": e.target.value })} required />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}

                                                        <ReusableButton
                                                            type="submit"
                                                            disabled={loading}
                                                            loading={loading}
                                                        >Add</ReusableButton>                                               </form>
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

export default Createass;
