
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useProfile from '../../hooks/Profile/ProfileHooks';
import LoadingButton from '../../../../utils/LoadingButton';

const Profile = ({ userInfo, handleLogout }) => {
    const {
        
        username, setUserUname,
        email_id, setUserEmail,
        phone_no, setUserPhone,
        password, setUserPassword,
        errorMessage,
        errorMessages,
        reseller_name, setUpdateUname,
        reseller_email_id, setUpdateEmail,
        reseller_phone_no, setUpdatePhone,
        reseller_address, setUpdateAddress,
        reselllerModified,
        userModified,
        addResellerProfileUpdate,
        addUserProfileUpdate, isSubmitting, isResellerSubmitting

    } = useProfile(userInfo);

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
                                        <h3 className="font-weight-bold">Profile</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div style={{ textAlign: 'center' }}>
                                            <h4 className="card-title">Reseller Profile</h4>
                                        </div>
                                        <form className="forms-sample" onSubmit={addResellerProfileUpdate}>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputUsername1">Username</label>
                                                <input type="text" className="form-control" placeholder="Username" value={reseller_name} maxLength={25} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, ''); setUpdateUname(sanitizedValue); }} readOnly required />
                                            </div>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputEmail1">Email address</label>
                                                <input type="email" className="form-control" placeholder="Email" value={reseller_email_id} onChange={(e) => setUpdateEmail(e.target.value)} readOnly required />
                                            </div>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputPassword1">Phone Number</label>
                                                <input type="text" className="form-control" placeholder="Phone Number" value={reseller_phone_no} maxLength={10} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setUpdatePhone(sanitizedValue); }} required />
                                            </div>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputConfirmPassword1">Address</label>
                                                <textarea className="form-control" placeholder="Address" value={reseller_address} maxLength={150} onChange={(e) => setUpdateAddress(e.target.value)} required />
                                            </div>
                                            {errorMessages && <div className="text-danger">{errorMessages}</div>}<br />


                                            <LoadingButton
                                                type="submit"
                                                disabled={!reselllerModified || isResellerSubmitting}
                                                loading={isResellerSubmitting}>
                                                Submit</LoadingButton>

                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div style={{ textAlign: 'center' }}>
                                            <h4 className="card-title">User Profile</h4>
                                        </div>
                                        <form className="forms-sample" onSubmit={addUserProfileUpdate}>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputUsername1">Username</label>
                                                <input type="text" className="form-control" placeholder="Username" value={username} maxLength={25} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, ''); setUserUname(sanitizedValue); }} readOnly required />
                                            </div>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputEmail1">Email address</label>
                                                <input type="email" className="form-control" placeholder="Email" value={email_id} onChange={(e) => setUserEmail(e.target.value)} readOnly required />
                                            </div>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputPassword1">Phone Number</label>
                                                <input type="text" className="form-control" placeholder="Phone Number" value={phone_no} maxLength={10} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setUserPhone(sanitizedValue); }} required />
                                            </div>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputConfirmPassword1">Password</label>
                                                <input type="text" className="form-control" placeholder="Password" value={password} maxLength={4} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setUserPassword(sanitizedValue); }} required />
                                            </div>
                                            {errorMessage && <div className="text-danger">{errorMessage}</div>}<br />

                                            <LoadingButton
                                                type="submit"
                                                disabled={!userModified || isSubmitting}
                                                loading={isSubmitting}>
                                                Submit
                                            </LoadingButton>
                                        </form>
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

export default Profile;
