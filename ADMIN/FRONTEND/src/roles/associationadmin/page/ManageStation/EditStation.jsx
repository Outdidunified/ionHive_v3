import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Sidebar from '../../components/Sidebar';
import InputField from '../../../../utils/InputField';
import ReusableButton from '../../../../utils/ReusableButton';
import useEditChargingStation from '../../hooks/ManageStation/EditStationHooks';
const EditStation = ({ userInfo, handleLogout }) => {
  const {
    stationAddress, setStationAddress,
    landmark, setLandmark,
    network, setNetwork,
    availability, setAvailability,locationId,setLocationId,
    accessibility, setAccessibility,
    latitude, setLatitude,
    longitude, setLongitude,
    chargerType, setChargerType,
    status, setStatus,
    loading,handleLocationIdChange,
    isModified,
    updateStation,
    goBackToManageStations,
    errorMessage
  } = useEditChargingStation(userInfo);

  return (
    <div className="container-scroller">
      <Header userInfo={userInfo} handleLogout={handleLogout} />
      <div className="container-fluid page-body-wrapper">
        <Sidebar />
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="row">
              <div className="col-md-12 grid-margin">
                <div className="row">
                  <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                    <h3 className="font-weight-bold">Edit Charging Station</h3>
                  </div>
                  <div className="col-12 col-xl-4">
                    <div className="justify-content-end d-flex">
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={goBackToManageStations}
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
                    <h4 className="card-title">Manage Charging Station</h4>
                    <form className="form-sample" onSubmit={updateStation}>
                      {errorMessage && (
                        <p className="text-danger">{errorMessage}</p>
                      )}
                      <div className="row">

                        <div className="col-md-6">
  <div className="form-group row">
    <label className="col-sm-12 col-form-label labelInput">Location ID</label>
    <div className="col-sm-12">
    <InputField
  value={locationId}
  onChange={handleLocationIdChange}
  maxLength={50}
  required
/>
    </div>
  </div>
</div>

                        <div className="col-md-6">
                          <div className="form-group row">
                            <label className="col-sm-12 col-form-label labelInput">Station Address</label>
                            <div className="col-sm-12">
                              <InputField
                                value={stationAddress}
                                onChange={(e) => setStationAddress(e.target.value)}
                                maxLength={100}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group row">
                            <label className="col-sm-12 col-form-label labelInput">Landmark</label>
                            <div className="col-sm-12">
                              <InputField
                                value={landmark}
                                onChange={(e) => setLandmark(e.target.value)}
                                maxLength={100}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group row">
                            <label className="col-sm-12 col-form-label labelInput">Latitude</label>
                            <div className="col-sm-12">
                              <InputField
  type="text"
  value={latitude}
  onChange={(e) => {
    const value = e.target.value;
    if (/^-?\d*\.?\d*$/.test(value)) {
      setLatitude(value);
    }
  }}
  required
/>

                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group row">
                            <label className="col-sm-12 col-form-label labelInput">Longitude</label>
                            <div className="col-sm-12">
                              <InputField
  type="text"
  value={longitude}
  onChange={(e) => {
    const value = e.target.value;
    if (/^-?\d*\.?\d*$/.test(value)) {
      setLongitude(value);
    }
  }}
  required
/>
                         
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group row">
                            <label className="col-sm-12 col-form-label labelInput">Charger Type</label>
                            <div className="col-sm-12">
                              <InputField
                                value={chargerType}
                                onChange={(e) => setChargerType(e.target.value)}
                                 maxLength={20}
                                required
                                
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group row">
                            <label className="col-sm-12 col-form-label labelInput">Network</label>
                            <div className="col-sm-12">
                              <InputField
                                value={network}
                                onChange={(e) => setNetwork(e.target.value)}
                                maxLength={50}

                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group row">
                            <label className="col-sm-12 col-form-label labelInput">Availability</label>
                            <div className="col-sm-12">
                              <InputField
                                value={availability}
                                onChange={(e) => setAvailability(e.target.value)}
                                 maxLength={50}

                              />
                            </div>
                          </div>
                        </div>

                       <div className="col-md-6">
  <div className="form-group row">
    <label className="col-sm-12 col-form-label labelInput">Accessibility</label>
    <div className="col-sm-12">
      <select
        className="form-control"
        value={accessibility}
        onChange={(e) => setAccessibility(e.target.value)}
      >
        <option value="">Select Accessibility</option>
        <option value="Public">Public</option>
        <option value="Private">Private</option>
        <option value="Captive">Captive</option>
      </select>
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
                                onChange={(e) => setStatus(e.target.value)}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <ReusableButton
                        type="submit"
                        disabled={loading || !isModified}
                        loading={loading}
                      >
                        Update
                      </ReusableButton>
                    </form>
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

export default EditStation;
