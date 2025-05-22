import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import useViewVehicle from '../../hooks/VehicleModel/ViewVehicleHooks';
import { formatTimestamp } from '../../../../utils/formatTimestamp';

const ViewVehicle = ({ userInfo, handleLogout }) => {
  const navigate = useNavigate();
  const vehicle = useViewVehicle();

  const handleBack = () => {
    navigate('/superadmin/ManageVehicle');
  };

const handleEditVehicle = () => {
  console.log('vehicle to edit:', vehicle);
  navigate('/superadmin/EditVehicle', { state: { vehicleData: vehicle } });
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
                    <h3 className="font-weight-bold">Vehicle Details</h3>
                  </div>
                  <div className="col-12 col-xl-4">
                    <div className="justify-content-end d-flex">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-icon-text"
                        onClick={handleEditVehicle}
                        style={{ marginRight: '10px' }}
                      >
                        <i className="mdi mdi-pencil btn-icon-prepend"></i>Edit
                      </button>
                      <button type="button" className="btn btn-success" onClick={handleBack}>
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
                    <h4 className="card-title" style={{ textAlign: 'center', paddingBottom: '10px' }}>
                      Vehicle Details
                    </h4>
                    <hr />

                    <div className="row viewDataCss">
                      <div className="col-md-4">
                        <strong>Vehicle ID:</strong> <span>{vehicle.vehicle_id || '-'}</span>
                      </div>
                      <div className="col-md-4">
                        <strong>Model:</strong> <span>{vehicle.model || '-'}</span>
                      </div>
                      <div className="col-md-4">
                        <strong>Type:</strong> <span>{vehicle.type || '-'}</span>
                      </div>
                    </div>

                    <div className="row viewDataCss" style={{ marginTop: '10px' }}>
                      <div className="col-md-4">
                        <strong>Vehicle Company:</strong> <span>{vehicle.vehicle_company || '-'}</span>
                      </div>
                      <div className="col-md-4">
                        <strong>Battery Size (kWh):</strong> <span>{vehicle.battery_size_kwh || '-'}</span>
                      </div>
                      <div className="col-md-4">
                        <strong>Charger Type:</strong> <span>{vehicle.charger_type || '-'}</span>
                      </div>
                    </div>

                    <div className="row viewDataCss" style={{ marginTop: '10px' }}>
                      <div className="col-md-4">
                        <strong>Status:</strong>{' '}
                        <span>{vehicle.status ? <span className="text-success">Active</span> : <span className="text-danger">Inactive</span>}</span>
                      </div>
                      <div className="col-md-4">
                        <strong>Created Date:</strong>{' '}
                        <span>{vehicle.created_date ? formatTimestamp(vehicle.created_date) : '-'}</span>
                      </div>
                      <div className="col-md-4">
                        <strong>Modified Date:</strong>{' '}
                        <span>{vehicle.modified_date ? formatTimestamp(vehicle.modified_date) : '-'}</span>
                      </div>
                    </div>
                 <div className="row viewDataCss" style={{ marginTop: '10px' }}>
  {/* Vehicle Image */}
  <div className="col-md-4">
  <strong>Vehicle Image:</strong><br />
  {vehicle.vehicle_image ? (
    <div style={{ width: '100px', height: '70px' }}>
      <img
        src={
          vehicle.vehicle_image?.startsWith('/uploads/')
            ? vehicle.vehicle_image
            : `/uploads/${vehicle.vehicle_image}`
        }
        alt={vehicle.model || 'vehicle image'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '16px',
          display: 'block',
        }}
       
      />
    </div>
  ) : (
    <span>No Image Available</span>
  )}
</div>


  {/* Created By */}
  <div className="col-md-4">
    <strong>Created By:</strong>{' '}
    <span>{vehicle.created_by ? vehicle.created_by : '-'}</span>
  </div>

  {/* Modified By */}
  <div className="col-md-4">
    <strong>Modified By:</strong>{' '}
    <span>{vehicle.modified_by ? vehicle.modified_by : '-'}</span>
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

export default ViewVehicle;
