import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Sidebar from '../../components/Sidebar';
import useCreateUser from '../../hooks/ManageUser/CreateuserHooks';
import LoadingButton from '../../../../utils/LoadingButton';

const CreateUser = ({ userInfo, handleLogout }) => {
    const {
        newUser,
        setNewUser,
        errorMessage,
        userRoles,
        assname,
        createUser, goBack, loading
    } = useCreateUser(userInfo);

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
                                        <h3 className="font-weight-bold">Create User</h3>
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
                                                    <h4 className="card-title">Create Users</h4>
                                                    <form className="form-sample" onSubmit={createUser} >
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Role Name</label>
                                                                    <div className="col-sm-12">
                                                                        <select
                                                                            className="form-control"
                                                                            value={newUser.role_name}
                                                                            onChange={(e) => setNewUser({ ...newUser, role_name: e.target.value })}
                                                                            required
                                                                        >
                                                                            <option value="">Select Role</option>
                                                                            {userRoles.length === 0 ? (
                                                                                <option disabled>No data found</option>
                                                                            ) : (
                                                                                userRoles.map(role => (
                                                                                    <option key={role.role_id} value={role.role_name}>{role.role_name}</option>
                                                                                ))
                                                                            )}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Association Name</label>
                                                                    <div className="col-sm-12">
                                                                        <select
                                                                            className="form-control"
                                                                            value={newUser.client_name}
                                                                            onChange={(e) => setNewUser({ ...newUser, client_name: e.target.value })}
                                                                            required
                                                                        >
                                                                            <option value="">Select Association</option>
                                                                            {assname.length === 0 ? (
                                                                                <option disabled>No data found</option>
                                                                            ) : (
                                                                                assname.map(association => (
                                                                                    <option key={association.association_id} value={association.association_name}>
                                                                                        {association.association_name}
                                                                                    </option>
                                                                                ))
                                                                            )}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">User Name</label>
                                                                    <div className="col-sm-12">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control" placeholder="User Name"
                                                                            value={newUser.username}
                                                                            maxLength={25}
                                                                            onChange={(e) => {
                                                                                const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');
                                                                                setNewUser({ ...newUser, username: sanitizedValue.slice(0, 25) });
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
                                                                        <input
                                                                            type="text"
                                                                            className="form-control" placeholder="Phone No"
                                                                            value={newUser.phone_no}
                                                                            maxLength={10}
                                                                            onChange={(e) => {
                                                                                const sanitizedValue = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                                                                                setNewUser({ ...newUser, phone_no: sanitizedValue.slice(0, 10) }); // Update state with sanitized value limited to 10 characters
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
                                                                            className="form-control" placeholder="Email ID"
                                                                            value={newUser.email_id}
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
                                                                                setNewUser({ ...newUser, email_id: sanitizedEmail });
                                                                            }}
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Password</label>
                                                                    <div className="col-sm-12">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control" placeholder="Password"
                                                                            value={newUser.password}
                                                                            maxLength={4}
                                                                            onChange={(e) => {
                                                                                const sanitizedValue = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                                                                                setNewUser({ ...newUser, password: sanitizedValue.slice(0, 4) }); // Update state with sanitized value limited to 10 characters
                                                                            }}

                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}

                                                        <LoadingButton
                                                            type="submit"
                                                            loading={loading}
                                                            disabled={loading}>Create</LoadingButton>
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

export default CreateUser;
