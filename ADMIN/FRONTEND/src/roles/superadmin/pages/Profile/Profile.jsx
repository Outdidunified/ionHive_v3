import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useProfile from '../../hooks/Profile/ProfileHooks';
import LoadingButton from '../../../../utils/LoadingButton';
import InputField from '../../../../utils/InputField';
const Profile = ({ userInfo, handleLogout }) => {
    const {
        username, setUpdateUname,
        email_id,
        phone_no, setUpdatePhone,
        password, setUpdatePassword,
        errorMessage,
        userModified,
        loading,
        addProfileUpdate
    } = useProfile(userInfo);
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
                                        <h3 className="font-weight-bold">Profile</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="col-md-12 grid-margin stretch-card">
                                            <div className="card">
                                                <div className="card-body">
                                                    <form className="forms-sample" onSubmit={addProfileUpdate}>
                                                        <div className="form-group row">
                                                            <label htmlFor="exampleInputUsername2" className="col-sm-12zzz col-form-label labelInput">User Name</label>
                                                            <div className="col-sm-10">
                                                                <InputField
                                                                    placeholder="Username"
                                                                    value={username}
                                                                    maxLength={25}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, '');
                                                                        setUpdateUname(sanitizedValue);
                                                                    }}
                                                                    readOnly
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="form-group row">
                                                            <label htmlFor="exampleInputEmail2" className="col-sm-2 col-form-label labelInput">Email</label>
                                                            <div className="col-sm-10">
                                                                <InputField
                                                                    type="email"
                                                                    placeholder="Email"
                                                                    value={email_id}
                                                                    onChange={(e) => setUpdateEmail(e.target.value)}
                                                                    readOnly
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="form-group row">
                                                            <label htmlFor="exampleInputMobile" className="col-sm-2 col-form-label labelInput">Phone</label>
                                                            <div className="col-sm-10">
                                                                <InputField
                                                                    placeholder="Phone number"
                                                                    value={phone_no}
                                                                    maxLength={10}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        const sanitizedValue = value.replace(/[^0-9]/g, '');
                                                                        setUpdatePhone(sanitizedValue);
                                                                    }}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="form-group row">
                                                            <label htmlFor="exampleInputPassword2" className="col-sm-2 col-form-label labelInput">Password</label>
                                                            <div className="col-sm-10">
                                                                <InputField
                                                                    placeholder="Password"
                                                                    value={password}
                                                                    maxLength={4}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        const sanitizedValue = value.replace(/[^0-9]/g, '');
                                                                        setUpdatePassword(sanitizedValue);
                                                                    }}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}<br />


                                                        <LoadingButton
                                                            type="submit"
                                                            loading={loading}
                                                            disabled={loading || !userModified}>
                                                        Update</LoadingButton>
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

export default Profile;
