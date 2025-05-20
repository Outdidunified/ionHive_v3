import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useManageVehicle from '../../hooks/VehicleModel/ManageVehicleHooks';
import { useNavigate } from 'react-router-dom';
import ReusableButton from '../../../../utils/ReusableButton';
import InputField from '../../../../utils/InputField';

const ManageVehicle = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();

    const {
        vehicleData,
        setVehicleData,
        handleInputChange,handleFileChange,
        vehicleModels,
        filteredModels,
        isloading,
        loading,
        error,
        showAddForm,
        modalAddStyle,
        theadsticky,
        theadfixed,
        theadBackgroundColor,
        handleAddVehicleModel,
        updateVehicleModelStatus,
        closeAddModal,
        addVehicleModel,
        handleSearchInputChange,
        fetchVehicleModels,
    } = useManageVehicle(userInfo);

    const changeActivate = (vehicle_id) => {
    updateVehicleModelStatus(true, vehicle_id);
  };

  const changeDeActivate = (vehicle_id) => {
    updateVehicleModelStatus(false, vehicle_id);
  };

    const handleViewUser = (dataItem) => {
        navigate('/superadmin/ViewVehicle', { state: { dataItem } });
    };

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
                                    <h3 className="font-weight-bold">Manage Vehicle Models</h3>
                                </div>
                                <div className="col-12 col-xl-4">
                                    <div className="justify-content-end d-flex">
                                        <button type="button" className="btn btn-success" onClick={handleAddVehicleModel}>
                                            Add Vehicle
                                        </button>
                                   <div className="modalStyle" style={modalAddStyle}>
  <div
    className="modalContentStyle"
    style={{
      maxHeight: '680px',
      overflowY: 'auto',
      backgroundColor: '#fff',
      borderRadius: '10px',
      padding: '20px',
    }}
  >
    <span
      onClick={closeAddModal}
      style={{
        float: 'right',
        cursor: 'pointer',
        fontSize: '30px',
        color: '#333',
      }}
    >
      &times;
    </span>
    <form className="card" onSubmit={addVehicleModel}>
      <div className="card-body">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h4 className="card-title" style={{ color: '#222' }}>Add Vehicle</h4>
        </div>

        <div className="table-responsive pt-3">
          {[
            { label: 'Model', name: 'model', placeholder: 'Enter Model' },
            { label: 'Type', name: 'type', placeholder: 'Enter Type' },
            { label: 'Company', name: 'vehicle_company', placeholder: 'Enter Vehicle Company' },
            { label: 'Battery Size (kWh)', name: 'battery_size_kwh', placeholder: 'Battery Size' },
            { label: 'Charger Type', name: 'charger_type', placeholder: 'Enter Charger Type' },
          ].map(({ label, name, placeholder }) => (
            <div className="input-group mb-3" key={name}>
              <div className="input-group-prepend">
                <span
                  className="input-group-text"
                  style={{ width: '180px', color: '#444', fontWeight: 500 }}
                >
                  {label}
                </span>
              </div>
              <InputField
                placeholder={placeholder}
                name={name}
                value={vehicleData[name]}
                onChange={handleInputChange}
                required
              />
            </div>
          ))}

          {/* Vehicle Image Upload */}
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span
                className="input-group-text"
                style={{ width: '180px', color: '#444', fontWeight: 500 }}
              >
                Upload Image
              </span>
            </div>
            <input
              type="file"
              name="vehicle_image_file"
              accept="image/*"
              className="form-control"
              onChange={handleFileChange}
              required
            />
          </div>
        </div>

        {error && <div className="text-danger mt-2">{error}</div>}

        <div className="text-center mt-4">
          <ReusableButton type="submit" loading={loading} disabled={loading}>
            Add Vehicle
          </ReusableButton>
        </div>
      </div>
    </form>
  </div>
</div>


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
                                                    <h4 className="card-title" style={{ paddingTop: '10px' }}>List Of Vehicles</h4>
                                                </div>
                                                <div className="col-8 col-xl-4">
                                                    <div className="input-group">
                                                        <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                            <span className="input-group-text" id="search">
                                                                <i className="icon-search"></i>
                                                            </span>
                                                        </div>
                                                        <InputField
                                                            placeholder="Search now"
                                                            ariaLabel="search"
                                                            ariadescribedby="search"
                                                            autoComplete="off"
                                                            onChange={handleSearchInputChange}
                                                        />
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
        <th>Model</th>
        <th>Type</th>
        <th>Company</th>
        <th>Battery Size (kWh)</th>
        <th>Charger Type</th>
        <th>Image</th>
        <th>Status</th>
        <th>Active/Deactivate</th>  {/* New Column */}
        <th>Option</th>
      </tr>
    </thead>
    <tbody style={{ textAlign: 'center' }}>
      {isloading ? (
        <tr>
          <td colSpan="11" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
        </tr>
      ) : error ? (
        <tr>
          <td colSpan="11" style={{ marginTop: '50px', textAlign: 'center' }}>Error: {error}</td>
        </tr>
      ) : (
        Array.isArray(filteredModels) && filteredModels.length > 0 ? (
          filteredModels.map((dataItem, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{dataItem.model || '-'}</td>
              <td>{dataItem.type || '-'}</td>
              <td>{dataItem.vehicle_company || '-'}</td>
              <td>{dataItem.battery_size_kwh || '-'}</td>
              <td>{dataItem.charger_type || '-'}</td>
              <td>
                {dataItem.vehicle_image ? (
                <img
  src={`/uploads/${dataItem.vehicle_image}`}
  alt={dataItem.model || 'vehicle image'}
  style={{
    width: '100px',
    height: 'auto',
    objectFit: 'contain',
    borderRadius: '15px' // ensures image is not rounded
  }}
  onError={(e) => { e.target.onerror = null; e.target.src = '/path/to/placeholder.png'; }} // optional fallback
/>

                ) : '-'}
              </td>

              <td>
                {dataItem.status
                  ? <span className="text-success">Active</span>
                  : <span className="text-danger">Inactive</span>}
              </td>

              <td>
                <div className='form-group' style={{ paddingTop: '13px' }}>
                  {dataItem.status === true ? (
                    <div className="form-check form-check-danger">
                      <label className="form-check-label">
                        <input
                          type="radio"
                          className="form-check-input"
                          name={`statusRadio${dataItem.vehicle_id}`}
                          value={false}
                          onClick={() => changeDeActivate(dataItem.vehicle_id)}
                        />
                        Deactivate
                        <i className="input-helper"></i>
                      </label>
                    </div>
                  ) : (
                    <div className="form-check form-check-success">
                      <label className="form-check-label">
                        <input
                          type="radio"
                          className="form-check-input"
                          name={`statusRadio${dataItem.vehicle_id}`}
                          value={true}
                          onClick={() => changeActivate(dataItem.vehicle_id)}
                        />
                        Activate
                        <i className="input-helper"></i>
                      </label>
                    </div>
                  )}
                </div>
              </td>

              <td>
                <button
                  type="button"
                  className="btn btn-outline-success btn-icon-text"
                  onClick={() => handleViewUser(dataItem)}
                  style={{ marginBottom: '10px', marginRight: '10px' }}
                >
                  <i className="mdi mdi-eye"></i> View
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="11" style={{ marginTop: '50px', textAlign: 'center' }}>
              No vehicle models found
            </td>
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

export default ManageVehicle