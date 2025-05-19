import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import ReusableButton from '../../../../utils/ReusableButton';
import InputField from '../../../../utils/InputField';
import useManageStation from '../../hooks/ManageStation/ManageStationHooks';

const ManageStation = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();

    const {
       stationData,previousChargerId,selectedChargers, setSelectedChargers,removeStationId,removeChargerFromStation,
    setStationData,assignModalOpen,
    handleInputChange,openReassignModal,
    stations,selectedStation,closeAssignModal,reassignChargerToStation,openRemoveModal,closeRemoveModal,removeModalOpen,removeChargerId,
    filteredStations,
    isLoading,allocatedChargers,assignLoading,setRemoveChargerId,
    loading,isReassign,
    error,
    showAddForm,
    modalAddStyle,
    theadsticky,
    theadfixed,
    theadBackgroundColor,
    handleAddStationToggle,
    closeAddModal,
    addStation,
    handleSearchInputChange,handleRemoveCharger,
    
    handleChargerInputChange,setSelectedChargerId,
    fetchStations,
    handleAssignSubmit,
    // Chargers data and selection
    chargers,
    selectedChargerId,
    openAssignModal,

    // Station selection for assignment
    selectedStationId,
    setSelectedStationId,

    // Assignment function
    assignChargerToStation,
    } = useManageStation(userInfo);



    const handleViewStation = (dataItem) => {
        navigate('/associationadmin/ViewStation', { state: { dataItem } });
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
                                    <h3 className="font-weight-bold">Manage Stations</h3>
                                </div>
                                <div className="col-12 col-xl-4">
                                    <div className="justify-content-end d-flex">
                                        <button type="button" className="btn btn-success" onClick={handleAddStationToggle}>
                                            Add Station
                                        </button>
            <div className="modalStyle" style={modalAddStyle}>
  <div
    className="modalContentStyle"
    style={{
      maxHeight: '680px',
      backgroundColor: '#fff',
      borderRadius: '10px',
      padding: '20px',
      // Removed overflowY to prevent scroll
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
    <form className="card" onSubmit={addStation}>
      <div className="card-body">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h4 className="card-title" style={{ color: '#222' }}>
            Add Station
          </h4>
        </div>

        <div className="table-responsive pt-3">
          {/* Location ID - NEW FIELD */}
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span
                className="input-group-text"
                style={{ width: '120px', color: '#444', fontWeight: 500 }}
              >
                Location ID
              </span>
            </div>
            <input
              type="text"
              name="location_id"
              className="form-control"
              placeholder="Enter Location ID"
              value={stationData.location_id}
              onChange={handleInputChange}
            />
          </div>

          {/* Station Address */}
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span
                className="input-group-text"
                style={{ width: '120px', color: '#444', fontWeight: 500 }}
              >
                Station Address
              </span>
            </div>
            <input
              type="text"
              name="station_address"
              className="form-control"
              placeholder="Enter Station Address"
              value={stationData.station_address}
              onChange={handleInputChange}
            />
          </div>

          {/* Landmark */}
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span
                className="input-group-text"
                style={{ width: '120px', color: '#444', fontWeight: 500 }}
              >
                Landmark
              </span>
            </div>
            <input
              type="text"
              name="landmark"
              className="form-control"
              placeholder="Enter Landmark"
              value={stationData.landmark}
              onChange={handleInputChange}
            />
          </div>

          {/* Network */}
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span
                className="input-group-text"
                style={{ width: '120px', color: '#444', fontWeight: 500 }}
              >
                Network
              </span>
            </div>
            <input
              type="text"
              name="network"
              className="form-control"
              placeholder="Enter Network"
              value={stationData.network}
              onChange={handleInputChange}
            />
          </div>

          {/* Availability - changed to editable */}
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span
                className="input-group-text"
                style={{ width: '120px', color: '#444', fontWeight: 500 }}
              >
                Availability
              </span>
            </div>
            <input
              type="text"
              className="form-control"
              name="availability"
              placeholder="Enter Availability (e.g. 9AM - 9PM)"
              value={stationData.availability}
              onChange={handleInputChange}
            />
          </div>

          {/* Accessibility */}
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span
                className="input-group-text"
                style={{ width: '120px', color: '#444', fontWeight: 500 }}
              >
                Accessibility
              </span>
            </div>
            <select
              name="accessibility"
              className="form-control"
              value={stationData.accessibility}
              onChange={handleInputChange}
            >
              <option value="">Select Accessibility</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>

          {/* Latitude */}
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span
                className="input-group-text"
                style={{ width: '120px', color: '#444', fontWeight: 500 }}
              >
                Latitude
              </span>
            </div>
            <input
              type="number"
              name="latitude"
              className="form-control"
              placeholder="Enter Latitude"
              value={stationData.latitude}
              onChange={handleInputChange}
              step="any"
            />
          </div>

          {/* Longitude */}
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span
                className="input-group-text"
                style={{ width: '120px', color: '#444', fontWeight: 500 }}
              >
                Longitude
              </span>
            </div>
            <input
              type="number"
              name="longitude"
              className="form-control"
              placeholder="Enter Longitude"
              value={stationData.longitude}
              onChange={handleInputChange}
              step="any"
            />
          </div>

          {/* Charger Type */}
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span
                className="input-group-text"
                style={{ width: '120px', color: '#444', fontWeight: 500 }}
              >
                Charger Type
              </span>
            </div>
            <input
              type="text"
              name="charger_type"
              className="form-control"
              placeholder="Enter Charger Type"
              value={stationData.charger_type}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {error && <div className="text-danger mt-2">{error}</div>}

        <div className="text-center mt-4">
          <ReusableButton type="submit" loading={loading} disabled={loading}>
            Add Station
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
                                                    <h4 className="card-title" style={{ paddingTop: '10px' }}>List Of Staions</h4>
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
    <thead
      style={{
        textAlign: 'center',
        position: theadsticky,
        tableLayout: theadfixed,
        top: 0,
        backgroundColor: theadBackgroundColor,
        zIndex: 1,
      }}
    >
      <tr>
        <th>Sl.No</th>
        <th>Location ID</th>
        <th>Station Address</th>
        <th>Landmark</th>
        <th>Network</th>
        <th>Availability</th>
        <th>Accessibility</th>
        <th>Latitude</th>
        <th>Longitude</th>
        <th>Charger Type</th>
        {/* <th>Chargers</th> */}
        <th>Status</th>
        <th>Options</th>
        <th>Remove Charger</th>
        <th>Assign Station</th> {/* New column */}
      </tr>
    </thead>
    <tbody style={{ textAlign: 'center' }}>
      {isLoading ? (
        <tr>
          <td colSpan={14} style={{ marginTop: '50px', textAlign: 'center' }}>
            Loading...
          </td>
        </tr>
      ) : error ? (
        <tr>
          <td colSpan={14} style={{ marginTop: '50px', textAlign: 'center' }}>
            Error: {error}
          </td>
        </tr>
      ) : Array.isArray(filteredStations) && filteredStations.length > 0 ? (
        filteredStations.map((station, index) => (
          <tr key={station.id || index}>
            <td>{index + 1}</td>
            <td>{station.location_id||'-'}</td>
            <td>{station.station_address || '-'}</td>
            <td>{station.landmark || '-'}</td>
            <td>{station.network || '-'}</td>
            <td>{station.availability || '-'}</td>
            <td>{station.accessibility || '-'}</td>
            <td>{station.latitude || '-'}</td>
            <td>{station.longitude || '-'}</td>
            <td>{station.charger_type || '-'}</td>


<td>
  <span className={station.status === true ? 'text-success' : 'text-danger'}>
    {station.status === true ? 'Active' : 'Inactive'}
  </span>
</td>

                <td>
                  {/* Existing buttons like View */}
                  <button
                    type="button"
                    className="btn btn-outline-success btn-icon-text"
                    onClick={() => handleViewStation(station)} // Replace with actual handler
                    style={{ marginBottom: '10px', marginRight: '2px' }}
                  >
                    <i className="mdi mdi-eye"></i> View
                  </button>
                </td>
               <td>
  <button
  type="button"
  className="btn btn-danger mb-2"
  onClick={() => openRemoveModal(station.station_id, station.charger_id)}
  style={{ padding: '15px 13px', fontSize: '0.85rem' }}
>
  Remove
</button>


</td>

<td>
  <button
    type="button"
    className="btn btn-primary mb-2"
    onClick={() => openAssignModal(station)}
    style={{ padding: '15px 13px', fontSize: '0.85rem' }}
  >
    Assign Station
  </button>
</td>




          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={13} style={{ marginTop: '50px', textAlign: 'center' }}>
            No stations found
          </td>
        </tr>
      )}
    </tbody>
  </table>

{removeModalOpen && (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: '100vw',
      zIndex: 9999,
    }}
    onClick={closeRemoveModal}
  >
    <div
      style={{
        backgroundColor: '#fff',
        padding: '30px',
        width: '90%',
        maxWidth: '450px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        fontSize: '15px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h5 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '16px', color: '#dc3545' }}>
        Confirm Removal
      </h5>

      <p style={{ marginBottom: '20px' }}>
        Select a charger to remove from Station <strong>{removeStationId}</strong>:
      </p>

      <select
        value={removeChargerId}
        onChange={(e) => setRemoveChargerId(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '15px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          marginBottom: '20px',
        }}
      >
        <option value="">-- Select Charger ID --</option>
        {allocatedChargers
          ?.find((station) => station.station_id === removeStationId)
          ?.chargers?.map((chargerId) => (
            <option key={chargerId} value={chargerId}>
              {chargerId}
            </option>
          ))}
      </select>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={closeRemoveModal}
          style={{
            backgroundColor: '#f1f1f1',
            color: '#333',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            minWidth: '90px',
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (removeChargerId) {
              removeChargerFromStation(removeStationId, removeChargerId);
              closeRemoveModal();
            } else {
              alert('Please select a charger to remove.');
            }
          }}
          style={{
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            minWidth: '90px',
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}




{assignModalOpen && selectedStation && (
  <div
    className="modal"
    style={{
      display: 'block',
      backgroundColor: 'rgba(0,0,0,0.5)',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: '100vw',
      zIndex: 9999,
    }}
    onClick={closeAssignModal}
  >
    <div
      className="modal-content"
      style={{
        backgroundColor: '#fff',
        padding: '24px',
        maxWidth: '700px',
        margin: '80px auto',
        position: 'relative',
        borderRadius: '10px',
        boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
        fontSize: '13px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h5 className="text-center mb-3" style={{ fontWeight: '600' }}>Assign Station to Charger</h5>

      {/* Station Info Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        {[
          { label: 'Station ID', value: selectedStation.station_id },
          { label: 'Address', value: selectedStation.station_address },
          { label: 'Landmark', value: selectedStation.landmark },
          { label: 'Network', value: selectedStation.network },
          { label: 'Availability', value: selectedStation.availability },
          { label: 'Accessibility', value: selectedStation.accessibility },
          { label: 'Latitude', value: selectedStation.latitude },
          { label: 'Longitude', value: selectedStation.longitude },
          { label: 'Charger Type', value: selectedStation.charger_type },
          { label: 'Status', value: selectedStation.status },
          { label: 'Created At', value: new Date(selectedStation.created_at).toLocaleString() },
          { label: 'Modified At', value: new Date(selectedStation.modified_at).toLocaleString() },
          { label: 'Modified By', value: selectedStation.modified_by },
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              background: '#f9f9f9',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #ddd',
            }}
          >
            <strong>{item.label}:</strong> <br /> {item.value || '-'}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={assignChargerToStation}>
        <div className="form-group mb-3">
          <label htmlFor="chargerIdSelect" className="mb-1" style={{ fontWeight: '500' }}>
            Select Charger ID
          </label>
          <select
            id="chargerIdSelect"
            className="form-control"
            value={selectedChargerId}
            onChange={(e) => setSelectedChargerId(e.target.value)}
            required
          >
            <option value="">-- Select Charger ID --</option>

            {allocatedChargers.length > 0 ? (
              allocatedChargers
                .filter(charger => !charger.station_id) // only unassigned chargers
                .map(charger => (
                  <option key={charger.charger_id} value={charger.charger_id}>
                    {charger.charger_id} 
                  </option>
                ))
            ) : (
              <option disabled>No chargers available</option>
            )}
          </select>
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-end" style={{ gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={closeAssignModal}
            disabled={assignLoading}
            style={{ minWidth: '90px' }}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-success"
            disabled={assignLoading || !selectedChargerId}
          >
            {assignLoading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}



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

export default ManageStation;