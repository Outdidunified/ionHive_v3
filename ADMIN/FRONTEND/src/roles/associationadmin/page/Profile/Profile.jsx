import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useProfile from '../../hooks/Profile/Profilehooks';
import InputField from '../../../../utils/InputField';
import ReusableButton from '../../../../utils/ReusableButton';
const Profile = ({ userInfo, handleLogout }) => {
   const {
    username, setUserUname,
    email_id, setUserEmail,
    phone_no, setUserPhone,
    password, setUserPassword,
    errorMessageAss, 
    errorMessage, 
    association_name, setUpdateUname,
    association_email_id, setUpdateEmail,
    association_phone_no, setUpdatePhone,
    association_address, setUpdateAddress,
    associationModified, 
    userModified,
    addAssProfileUpdate,
    addUserProfileUpdate, 
    loading,
    isloading
   }=useProfile(userInfo)

    

    return (
        <div className='container-scroller'>
            {/* Header */}
            <Header userInfo={userInfo} handleLogout={handleLogout}/>
            <div className="container-fluid page-body-wrapper">
                {/* Sidebar */}
                <Sidebar/>
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
                                        <div style={{textAlign:'center'}}>
                                            <h4 className="card-title">Association Profile</h4>
                                        </div> 
                                        <form className="forms-sample" onSubmit={addAssProfileUpdate}>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputUsername1">Username</label>
                                                <InputField placeholder="Username" value={association_name} maxLength={25} onChange={(e) => {const value = e.target.value; const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, ''); setUpdateUname(sanitizedValue);}} readOnly required/>
                                            </div>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputEmail1">Email address</label>
                                                <InputField type="email"  placeholder="Email" value={association_email_id} onChange={(e) => setUpdateEmail(e.target.value)} readOnly required/>
                                            </div>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputPassword1">Phone Number</label>
                                                <InputField placeholder="Phone Number" value={association_phone_no} maxLength={10} onChange={(e) => {const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setUpdatePhone(sanitizedValue);}} required/>
                                            </div>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputConfirmPassword1">Address</label>
                                                <textarea type="password" className="form-control" placeholder="Address" maxLength={150} value={association_address} onChange={(e) => setUpdateAddress(e.target.value)} />
                                            </div>
                                            {errorMessageAss && <div className="text-danger">{errorMessageAss}</div>}<br/>
                                            {/* <div style={{textAlign:'center'}}>
                                                <button type="submit" className="btn btn-primary mr-2" disabled={!associationModified}>Update</button>
                                            </div>  */}
                                            <ReusableButton type="submit"
                                            disabled={!associationModified}
                                            loading={loading}>Update</ReusableButton>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div style={{textAlign:'center'}}>
                                            <h4 className="card-title">User Profile</h4>
                                        </div> 
                                        <form className="forms-sample" onSubmit={addUserProfileUpdate}>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputUsername1">Username</label>
                                                <InputField  placeholder="Username" value={username} maxLength={25} onChange={(e) => {const value = e.target.value; const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, ''); setUserUname(sanitizedValue);}} readOnly required/>
                                            </div>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputEmail1">Email address</label>
                                                <InputField type="email" placeholder="Email" value={email_id} onChange={(e) => setUserEmail(e.target.value)} readOnly required/>
                                            </div>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputConfirmPassword1">Phone Number</label>
                                                <InputField  placeholder="Phone Number" value={phone_no} maxLength={10} onChange={(e) => {const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setUserPhone(sanitizedValue);}} required/> 
                                            </div>
                                            <div className="form-group profileINputCss">
                                                <label htmlFor="exampleInputPassword1">Password</label>
                                                <InputField  placeholder="Password" value={password} maxLength={4} onChange={(e) => {const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setUserPassword(sanitizedValue);}} required/>
                                            </div>
                                            {errorMessage && <div className="text-danger">{errorMessage}</div>}<br/>
                                            {/* <div style={{textAlign:'center'}}>
                                                <button type="submit" className="btn btn-primary mr-2" disabled={!userModified}>Update</button>
                                            </div>                                     */}
                                            <ReusableButton type="submit" disabled={!userModified} loading={isloading}>Update</ReusableButton>
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
                 
export default Profile