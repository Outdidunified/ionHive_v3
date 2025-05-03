import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';
import useEditManageDevice from '../../hooks/ManageDevice/EditManageDeviceHooks';
import InputField from '../../../../utils/InputField';
import { Links } from 'react-router-dom';
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
                    <label className="labelInput">Charger Accessibility</label>
                    <select
                        className="form-control"
                        value={selectStatus}
                        onChange={handleStatusChange}
                        required
                    >
                        <option value="1">Public</option>
                        <option value="2">Private</option>
                    </select>
                </div>
            </div>

            {/* Set Location */}
            <div className="col-md-4">
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
            </div>
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
{isLocationModalOpen && (
    <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Update Location</h5>
                    <button
                        type="button"
                        className="close"
                        onClick={() => setIsLocationModalOpen(false)}
                    >
                        <span>&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    {/* Centered Latitude and Longitude Inputs */}
                    <div className="d-flex justify-content-center">
                        <div style={{ width: '45%', marginRight: '10px' }}>
                            <label>Latitude</label>
                            <InputField
                                value={tempLat}
                                onChange={(e) => {
                                    setTempLat(e.target.value.replace(/[^0-9.-]/g, ''));
                                    setTempAddress(''); // Reset landmark on coordinate change
                                }}
                            />
                        </div>
                        <div style={{ width: '45%' }}>
                            <label>Longitude</label>
                            <InputField
                                value={tempLong}
                                onChange={(e) => {
                                    setTempLong(e.target.value.replace(/[^0-9.-]/g, ''));
                                    setTempAddress(''); // Reset landmark on coordinate change
                                }}
                            />
                        </div>
                    </div>

                    

                    {/* Get Address Button - Show only when both lat & long are entered */}
                    {tempLat && tempLong && !tempAddress && (
                        <div className="d-flex justify-content-center my-3">
                            <button
                                className="btn btn-outline-primary"
                                onClick={async () => {
                                    if (tempLat && tempLong) {
                                        try {
                                            console.log('Fetching address for coordinates:', tempLat, tempLong);
                                
                                            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${tempLat},${tempLong}&key=AIzaSyDdBinCjuyocru7Lgi6YT3FZ1P6_xi0tco`;
                                            console.log('Request URL:', url);
                                
                                            const response = await fetch(url);
                                            const data = await response.json(); // ✅ First fetch the response body
                                
                                            console.log('Geocoding API Response:', data); // ✅ Then log it
                                
                                            if (data.status === "OK" && data.results.length > 0) {
                                                const address = data.results[0].formatted_address;
                                                setTempAddress(address);
                                            } else {
                                                Swal.fire({
                                                    title: "Address not found",
                                                    text: "Couldn't fetch address for the given coordinates.",
                                                    icon: "error"
                                                });
                                            }
                                        } catch (error) {
                                            console.error('Fetch Error:', error); // ✅ log the actual error
                                            Swal.fire({
                                                title: "Error",
                                                text: "An error occurred while fetching the address.",
                                                icon: "error"
                                            });
                                        }
                                    } else {
                                        Swal.fire({
                                            title: "Coordinates Missing",
                                            text: "Please enter both latitude and longitude.",
                                            icon: "warning"
                                        });
                                    }
                                }}
                                
                                
                            >
                                Get Address
                            </button>
                        </div>
                    )}

{tempAddress && (
    <div className="d-flex justify-content-center pt-2">
        <div style={{ width: '80%' }}>
            <label>Address</label>
            <textarea
                className="form-control"
                style={{ height: '80px', resize: 'none' }}
                value={tempAddress}
                readOnly
            />
        </div>
    </div>
)}
<div className="d-flex justify-content-center pt-2">
    <div style={{ width: '80%' }}>
        <label>Landmark</label>
        <InputField
            value={tempLandmark}
            onChange={(e) => setTempLandmark(e.target.value)}
        />
    </div>
</div>



                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            let missingFields = [];
                            if (!tempLat) missingFields.push("Latitude");
                            if (!tempLong) missingFields.push("Longitude");
                            if (!tempAddress) missingFields.push("Address");
                            if (!tempLandmark) missingFields.push("Landmark");
                        
                            if (missingFields.length > 0) {
                                Swal.fire({
                                    title: "Missing Fields",
                                    html: `Please fill the following field(s) before saving:<br/><medium>${missingFields.join(", ")}</medium>`,
                                    icon: "warning"
                                });
                                return;
                            }
                        
                            setLatitude(tempLat);
                            setLongitude(tempLong);
                            setAddress(tempAddress);
                            setLandmark(tempLandmark); // ✅ Save landmark
                            setIsLocationModalOpen(false);
                        }}
                        
                        
                        disabled={!isLocationModified}
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsLocationModalOpen(false)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
)}




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