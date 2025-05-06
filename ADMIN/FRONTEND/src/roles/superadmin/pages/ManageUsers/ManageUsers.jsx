import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import ManageUser from '../../hooks/ManageUsers/ManageUsersHooks';
import { useNavigate } from 'react-router-dom';
import ReusableButton from '../../../../utils/ReusableButton';
import InputField from '../../../../utils/InputField';
const ManageUsers = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();

    const {

        handleSearchInputChange,
        loading,
        modalAddStyle,
        error,
        role,
        email_id, reseller_id,
        phoneNo, Password,
        posts,
        selectionRoles,
        selectionReseller,
        addManageUser,
        handleAddUser,
        handleResellerChange,
        handleselectionReseller,
        closeAddModal, isloading,
        errorMessage, username, theadsticky, theadfixed, theadBackgroundColor, setuserName, setemailID, setPhone, setPassword

    } = ManageUser(userInfo);

    const handleViewUser = (dataItem) => {
        navigate('/superadmin/ViewUserList', { state: { dataItem } });
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
                                        <h3 className="font-weight-bold">Manage User's</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={handleAddUser}>Add User's</button>
                                            {/* Add user start */}
                                            <div className="modalStyle" style={modalAddStyle}>
                                                <div className="modalContentStyle" style={{ maxHeight: '680px', overflowY: 'auto' }}>
                                                    <span onClick={closeAddModal} style={{ float: 'right', cursor: 'pointer', fontSize: '30px' }}>&times;</span>
                                                    <form className="card" onSubmit={addManageUser}>
                                                        <div className="card-body">
                                                            <div style={{ textAlign: 'center' }}>
                                                                <h4 className="card-title" style={{ alignItems: 'center' }}>Add User's</h4>
                                                            </div>
                                                            <div className="table-responsive pt-3">
                                                                <div className="input-group" style={{ paddingRight: '1px' }}>
                                                                    <div className="input-group-prepend">
                                                                        <span className="input-group-text" style={{ color: 'black', width: '125px' }}>Role Name</span>
                                                                    </div>
                                                                    <select className="form-control" value={`${role.role_id}|${role.role_name}`} onChange={handleResellerChange} required>
                                                                        <option value="">Select Role</option>
                                                                        {selectionRoles.length === 0 ? (
                                                                            <option disabled>No data found</option>
                                                                        ) : (
                                                                            selectionRoles.map((role, index) => (
                                                                                <option key={index} value={`${role.role_id}|${role.role_name}`}>{role.role_name}</option>
                                                                            ))
                                                                        )}
                                                                    </select>
                                                                </div>

                                                                {role.role_id === '2' && (
                                                                    <div className="input-group" style={{ paddingRight: '1px' }}>
                                                                        <div className="input-group-prepend">
                                                                            <span className="input-group-text" style={{ color: 'black', width: '125px' }}>Reseller Name</span>
                                                                        </div>
                                                                        <select className="form-control" value={reseller_id} onChange={handleselectionReseller} required>
                                                                            <option value="">Select Reseller</option>
                                                                            {selectionReseller.length === 0 ? (
                                                                                <option disabled>No data found</option>
                                                                            ) : (
                                                                                selectionReseller.map((roles, index) => (
                                                                                    <option key={index} value={roles.reseller_id}>{roles.reseller_name}</option>
                                                                                ))
                                                                            )}
                                                                        </select>
                                                                    </div>
                                                                )}
                                                                <div className="input-group">
                                                                    <div className="input-group-prepend">
                                                                        <span className="input-group-text" style={{ color: 'black', width: '125px' }}>User Name</span>
                                                                    </div>
                                                                    <InputField placeholder="User Name" value={username} maxLength={25} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, ''); setuserName(sanitizedValue); }} required />
                                                                </div>
                                                                <div className="input-group">
                                                                    <div className="input-group-prepend">
                                                                        <span className="input-group-text" style={{ color: 'black', width: '125px' }}>Email ID</span>
                                                                    </div>
                                                                    <InputField type="email" placeholder="Email ID" value={email_id}
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
                                                                            setemailID(sanitizedEmail);
                                                                        }} required />
                                                                    {/* <input type="email" className="form-control" placeholder="Email ID" value={email_id} onChange={(e) => {const value = e.target.value; const noSpaces = value.replace(/\s/g, ''); const validChars = noSpaces.replace(/[^a-zA-Z0-9@.]/g, ''); const atCount = (validChars.match(/@/g) || []).length; const sanitizedEmail = atCount <= 1 ? validChars : validChars.replace(/@.*@/, '@'); setemailID(sanitizedEmail); }}required/>   */}
                                                                </div>
                                                                <div className="input-group">
                                                                    <div className="input-group-prepend">
                                                                        <span className="input-group-text" style={{ color: 'black', width: '125px' }}>Phone</span>
                                                                    </div>
                                                                    <InputField type="phone" placeholder="Phone" value={phoneNo} maxLength={10} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setPhone(sanitizedValue); }} required />
                                                                </div>
                                                                <div className="input-group">
                                                                    <div className="input-group-prepend">
                                                                        <span className="input-group-text" style={{ color: 'black', width: '125px' }}>Password</span>
                                                                    </div>
                                                                    <InputField placeholder="Password" value={Password} maxLength={4} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setPassword(sanitizedValue); }} required />
                                                                </div>
                                                            </div>
                                                            {errorMessage && <div className="text-danger">{errorMessage}</div>}<br />


                                                            <ReusableButton
                                                                type="submit"
                                                                loading={loading}
                                                                disabled={loading}>Add
                                                            </ReusableButton>

                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                            {/* Add users end */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-12 grid-margin">
                                                <div className="row">
                                                    <div className="col-4 col-xl-8">
                                                        <h4 className="card-title" style={{ paddingTop: '10px' }}>List Of User's</h4>
                                                    </div>
                                                    <div className="col-8 col-xl-4">
                                                        <div className="input-group">
                                                            <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                                <span className="input-group-text" id="search">
                                                                    <i className="icon-search"></i>
                                                                </span>
                                                            </div>
                                                            <InputField placeholder="Search now" ariaLabel="search" ariadescribedby="search" autoComplete="off" onChange={handleSearchInputChange} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: theadsticky, tableLayout: theadfixed, top: 0, backgroundColor: theadBackgroundColor, zIndex: 1 }}>
                                                    <tr>
                                                        <th>Sl.No</th>
                                                        <th>Role Name</th>
                                                        <th>User Name</th>
                                                        <th>Email ID</th>
                                                        <th>Status</th>
                                                        <th>Option</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ textAlign: 'center' }}>
                                                    {isloading ? (
                                                        <tr>
                                                            <td colSpan="8" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
                                                        </tr>
                                                    ) : error ? (
                                                        <tr>
                                                            <td colSpan="8" style={{ marginTop: '50px', textAlign: 'center' }}>Error: {error}</td>
                                                        </tr>
                                                    ) : (
                                                        Array.isArray(posts) && posts.length > 0 ? (
                                                            posts.map((dataItem, index) => (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{dataItem.role_name ? dataItem.role_name : '-'}</td>
                                                                    <td>{dataItem.username ? dataItem.username : '-'}</td>
                                                                    <td>{dataItem.email_id ? dataItem.email_id : '-'}</td>
                                                                    <td>{dataItem.status === true ? <span className="text-success">Active</span> : <span className="text-danger">DeActive</span>}</td>
                                                                    <td>
                                                                        <button type="button" className="btn btn-outline-success btn-icon-text" onClick={() => handleViewUser(dataItem)} style={{ marginBottom: '10px', marginRight: '10px' }}><i className="mdi mdi-eye"></i>View</button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="6" style={{ marginTop: '50px', textAlign: 'center' }}>No Manage user's found</td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
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

export default ManageUsers