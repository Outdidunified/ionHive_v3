import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';
import useEditManageDevice from '../../hooks/ManageDevice/EditManageDeviceHooks';
import InputField from '../../../../utils/InputField';
import ReusableButton from '../../../../utils/ReusableButton';

const EditManageDevice = ({ userInfo, handleLogout }) => {
   const {
        latitude,longitude,
        setLatitude,setLongitude,
        setLandmark,
        tempLandmark,setTempLandmark,
        address, setAddress,
        wifiUsername, setWifiUsername,
        wifiPassword, setWifiPassword,
        selectStatus,
        isLocationModalOpen, setIsLocationModalOpen,
        tempLat, setTempLat,
        tempLong, setTempLong,
        tempAddress, setTempAddress,
        isModified,handleStatusChange,
        backManageDevice,
        editManageDevice,
        isLocationModified,isLoading
   }=useEditManageDevice(userInfo)
    

    return (
        <div className='container-scroller'>
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="container-fluid page-body-wrapper">
                <Sidebar />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-12 grid-margin">
                                <div className="row">
                                    <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                                        <h3 className="font-weight-bold">Edit Manage Device</h3>
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
                                                    <h4 className="card-title">Manage Device</h4>
                                                    <form className="form-sample" onSubmit={editManageDevice}>
    <div className="d-flex flex-column align-items-center">
        {/* First Row: Charger Accessibility & Set Location */}
        <div className="row mb-3 w-100 justify-content-center">
            {/* Charger Accessibility */}
            <div className="col-md-4">
                <div className="form-group">
                    {/* <label className="labelInput">Charger Accessibility</label>
                    <select
                        className="form-control"
                        value={selectStatus}
                        onChange={handleStatusChange}
                        required
                    >
                        <option value="1">Public</option>
                        <option value="2">Private</option>
                    </select> */}
                </div>
            </div>

            {/* Set Location */}
            {/* <div className="col-md-4">
                <div className="form-group">
                    <label className="labelInput">Location</label>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            setTempLat(latitude);
                            setTempLong(longitude);
                            setTempAddress(address);
                            setIsLocationModalOpen(true);
                        }}
                    >
                        📍 Update Location
                    </button>
                </div>
            </div> */}
        </div>

        {/* Second Row: WiFi Username & Password */}
        <div className="row w-100 justify-content-center">
            {/* WiFi Username */}
            <div className="col-md-4">
                <div className="form-group">
                    <label className="labelInput">WiFi Username</label>
                    <InputField
                        value={wifiUsername}
                        maxLength={25}
                        onChange={(e) => setWifiUsername(e.target.value)}
                    />
                </div>
            </div>

            {/* WiFi Password */}
            <div className="col-md-4">
                <div className="form-group">
                    <label className="labelInput">WiFi Password</label>
                    <InputField
                        value={wifiPassword}
                        maxLength={15}
                        onChange={(e) => setWifiPassword(e.target.value.replace(/\s/g, ''))}
                    />
                </div>
            </div>
        </div>
    </div>
    {/* <div style={{ textAlign: 'center', padding: '15px' }}>
                                                            <button type="submit" className="btn btn-primary mr-2" disabled={!isModified}>Update</button>
       
       </div> */}
       <ReusableButton type="submit"
       loading={isLoading} disabled={!isModified}>Update</ReusableButton>
</form>
{/*  */}




                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default EditManageDevice; 