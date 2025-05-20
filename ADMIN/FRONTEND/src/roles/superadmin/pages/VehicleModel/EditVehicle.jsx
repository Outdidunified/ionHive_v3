import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Sidebar from '../../components/Sidebar';
import InputField from '../../../../utils/InputField';
import ReusableButton from '../../../../utils/ReusableButton';
import useEditVehicleModel from '../../hooks/VehicleModel/EditVehicleHooks';
const EditVehicle= ({ userInfo, handleLogout }) => {
  // Destructure everything from the custom hook
  const {
    model,
    setModel,
    type,
    setType,handleImageChange,
    vehicleCompany,
    setVehicleCompany,
    batterySizeKwh,
    setBatterySizeKwh,
    chargerType,
    setChargerType,
    vehicleImage,
    setVehicleImage,
    selectStatus,
    handleStatusChange,
    errorMessage,updateVehicleModelStatus,
    loading,
    isModified,
    updateVehicleModel,
    goBackToManageVehicles,
  } = useEditVehicleModel(userInfo);

  return (
    <div className="container-scroller">
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
                    <h3 className="font-weight-bold">Edit Vehicle</h3>
                  </div>
                  <div className="col-12 col-xl-4">
                    <div className="justify-content-end d-flex">
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={goBackToManageVehicles}
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
                    <h4 className="card-title">Manage Vehicle</h4>
                    <form className="form-sample" onSubmit={updateVehicleModel}>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group row">
                            <label className="col-sm-12 col-form-label labelInput">Model</label>
                            <div className="col-sm-12">
                              <InputField
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                maxLength={50}
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group row">
                            <label className="col-sm-12 col-form-label labelInput">Type</label>
                            <div className="col-sm-12">
                              <InputField
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                maxLength={50}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group row">
                            <label className="col-sm-12 col-form-label labelInput">Vehicle Company</label>
                            <div className="col-sm-12">
                              <InputField
                                value={vehicleCompany}
                                onChange={(e) => setVehicleCompany(e.target.value)}
                                maxLength={50}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group row">
                            <label className="col-sm-12 col-form-label labelInput">Battery Size (kWh)</label>
                            <div className="col-sm-12">
                              <InputField
                                type="number"
                                value={batterySizeKwh}
                                onChange={(e) => setBatterySizeKwh(e.target.value)}
                                min={0}
                                step="0.01"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group row">
                            <label className="col-sm-12 col-form-label labelInput">Charger Type</label>
                            <div className="col-sm-12">
                              <InputField
                                value={chargerType}
                                onChange={(e) => setChargerType(e.target.value)}
                                maxLength={50}
                                required
                              />
                            </div>
                          </div>
                        </div>

                 <div className="col-md-6">
  <div className="form-group row">
    <label className="col-sm-12 col-form-label labelInput">Vehicle Image</label>
    <div className="col-sm-12" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      
      {/* Hidden real file input */}
      <input
        id="vehicleImageInput"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />

      {/* Custom button to trigger file input */}
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => document.getElementById('vehicleImageInput').click()}
        style={{ flexShrink: 0 }}
      >
        Choose File
      </button>

      {/* Custom text to show filename or previous image name */}
      <div
        style={{
          flexGrow: 1,
          border: '1px solid #ced4da',
          borderRadius: '4px',
          padding: '6px 12px',
          height: '38px',
          lineHeight: '24px',
          color: '#6c757d',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          userSelect: 'none',
          backgroundColor: '#e9ecef',
        }}
      >
        {vehicleImage
          ? vehicleImage instanceof File
            ? vehicleImage.name
            : vehicleImage // string filename (previous image)
          : 'No file chosen'}
      </div>

      {/* Image preview */}
      {vehicleImage && typeof vehicleImage === 'string' && (
        <img
          src={`/uploads/${vehicleImage}`}
          alt="Vehicle"
          style={{ width: '50px', height: '50px', borderRadius: '5px', objectFit: 'cover', border: '1px solid #ccc' }}
          onError={(e) => { e.target.onerror = null; e.target.src = '/path/to/placeholder.png'; }}
          title={vehicleImage}
        />
      )}

      {vehicleImage && vehicleImage instanceof File && (
        <img
          src={URL.createObjectURL(vehicleImage)}
          alt="Selected Vehicle"
          style={{ width: '50px', height: '50px', borderRadius: '5px', objectFit: 'cover', border: '1px solid #ccc' }}
          title={vehicleImage.name}
        />
      )}
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

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default EditVehicle;
