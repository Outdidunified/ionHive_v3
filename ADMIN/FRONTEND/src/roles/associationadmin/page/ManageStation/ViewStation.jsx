import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import { formatTimestamp } from '../../../../utils/formatTimestamp';
import useViewStation from '../../hooks/ManageStation/ViewStationHooks';

const ViewStation = ({ userInfo, handleLogout }) => {
  const navigate = useNavigate();
  const station = useViewStation();

  const handleBack = () => {
    navigate('/associationadmin/ManageStation');
  };

  const handleEditStation = () => {
navigate('/associationadmin/EditStation', { state: { stationData: station } });
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
                    <h3 className="font-weight-bold">Charging Station Details</h3>
                  </div>
                  <div className="col-12 col-xl-4">
                    <div className="justify-content-end d-flex">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-icon-text"
                        onClick={handleEditStation}
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
                    <h4
                      className="card-title"
                      style={{ textAlign: 'center', paddingBottom: '10px' }}
                    >
                      Station Details
                    </h4>
                    <hr />

                    <div className="row viewDataCss">
                      <div className="col-md-4">
                        <strong>Station ID:</strong> <span>{station.station_id || '-'}</span>
                      </div>
                      <div className="col-md-4">
                        <strong>Association ID:</strong> <span>{station.association_id || '-'}</span>
                      </div>
                      <div className="col-md-4">
                        <strong>Station Address:</strong> <span>{station.station_address || '-'}</span>
                      </div>
                    </div>
                    

                    <div className="row viewDataCss" style={{ marginTop: '10px' }}>
                      <div className="col-md-4">
                        <strong>Landmark:</strong> <span>{station.landmark || '-'}</span>
                      </div>
                      <div className="col-md-4">
                        <strong>Network:</strong> <span>{station.network || '-'}</span>
                      </div>
                      <div className="col-md-4">
                        <strong>Availability:</strong> <span>{station.availability || '-'}</span>
                      </div>
                    </div>

                    <div className="row viewDataCss" style={{ marginTop: '10px' }}>
                  
                      <div className="col-md-4">
                        <strong>Latitude:</strong> <span>{station.latitude || '-'}</span>
                      </div>
                      <div className="col-md-4">
                        <strong>Longitude:</strong> <span>{station.longitude || '-'}</span>
                      </div>
                       <div className="col-md-4">
    <strong>Charger Type:</strong> <span>{station.charger_type || '-'}</span>
  </div>
                    </div>

               <div className="row viewDataCss" style={{ marginTop: '10px' }}>
                
 
  
  <div className="col-md-8">
    <strong>Chargers:</strong>{' '}
    <span>
      {station.chargers && station.chargers.length > 0
        ? station.chargers.map((chargerId, index) => (
            <span key={index} style={{ marginRight: '10px' }}>
              {chargerId}
            </span>
          ))
        : '-'}
    </span>
  </div>
  
</div>


                   <div className="row viewDataCss" style={{ marginTop: '10px' }}>
  <div className="col-md-4">
    <strong>Status:</strong>{' '}
    <span className={station.status === true ? 'text-success' : station.status === false ? 'text-danger' : ''}>
      {station.status === true
        ? 'Active'
        : station.status === false
        ? 'Inactive'
        : '-'}
    </span>
  </div>



                      <div className="col-md-4">
                        <strong>Created By:</strong> <span>{station.created_by || '-'}</span>
                      </div>
                      <div className="col-md-4">
                        <strong>Created At:</strong>{' '}
                        <span>{station.created_at ? formatTimestamp(station.created_at) : '-'}</span>
                      </div>
                    </div>

                    <div className="row viewDataCss" style={{ marginTop: '10px' }}>
                      <div className="col-md-4">
                        <strong>Modified By:</strong> <span>{station.modified_by || '-'}</span>
                      </div>
                      <div className="col-md-4">
                        <strong>Modified At:</strong>{' '}
                        <span>{station.modified_at ? formatTimestamp(station.modified_at) : '-'}</span>
                      </div>
                      <div className="col-md-4">
    <strong>Location ID:</strong> <span>{station.location_id || '-'}</span>
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

export default ViewStation;
