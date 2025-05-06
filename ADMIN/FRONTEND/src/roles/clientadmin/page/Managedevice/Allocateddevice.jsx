import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useAllocateddevice from '../../hooks/ManageDevice/AllocatedDeviceHooks';
import InputField from '../../../../utils/InputField';

const Allocateddevice = ({ userInfo, handleLogout }) => {
    const {
        allocatedChargers, 
        searchQuery,
        handleSearch, filterChargers,
        navigateToViewChargerDetails,
        deactivateCharger,
         loading
    } = useAllocateddevice(userInfo)

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
                                        <h3 className="font-weight-bold">Manage Devices - Allocated</h3>
                                    </div>
                                    {/* <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-warning" onClick={handleAssignAssociation} style={{marginBottom:'10px', marginRight:'10px'}}>Assign to Association</button>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-12 col-xl-8">
                                                <h4 className="card-title" style={{ paddingTop: '10px' }}>List Of Devices</h4>
                                            </div>
                                            <div className="col-12 col-xl-4">
                                                <div className="input-group">
                                                    <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                        <span className="input-group-text" id="search">
                                                            <i className="icon-search"></i>
                                                        </span>
                                                    </div>
                                                    <InputField
                                                        placeholder="Search now"
                                                        value={searchQuery}
                                                        onChange={handleSearch}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                    <tr>
                                                        <th>Sl.No</th>
                                                        <th>Charger Id</th>
                                                        <th>Charger Model</th>
                                                        <th>Charger Type</th>
                                                        {/* <th>Gun Connector</th> */}
                                                        <th>Assigned Association</th>
                                                        <th>Status</th>
                                                        <th>Active/DeActive</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ textAlign: 'center' }}>
                                                    {loading ? (
                                                        <tr>
                                                            <td colSpan="9">loading...</td>
                                                        </tr>
                                                    ) : filterChargers(allocatedChargers).length > 0 ? (
                                                        filterChargers(allocatedChargers).map((charger, index) => (
                                                            <tr key={charger.charger_id}>
                                                                <td>{index + 1}</td>
                                                                <td>{charger.charger_id || '-'}</td>
                                                                <td className="py-1">
                                                                    <img src={`../../images/dashboard/${charger.charger_model || '-'}kw.png`} alt="img" />
                                                                </td>
                                                                <td>{charger.charger_type || '-'}</td>
                                                                <td>{charger.association_name || '-'}</td>
                                                                <td style={{ color: charger.status ? 'green' : 'red' }}>{charger.status ? 'Active' : 'DeActive'}</td>
                                                                <td>
                                                                    <div className='form-group' style={{ paddingTop: '13px' }}>
                                                                        {charger.status === true ? (
                                                                            <div className="form-check form-check-danger">
                                                                                <label className="form-check-label">
                                                                                    <InputField
                                                                                        type="radio"
                                                                                        className="form-check-input"
                                                                                        name="optionsRadios1"
                                                                                        id="optionsRadios2"
                                                                                        value={false}
                                                                                        onClick={() => deactivateCharger(charger.charger_id, charger.status)}
                                                                                    />
                                                                                    DeActive<i className="input-helper"></i>
                                                                                </label>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="form-check form-check-success">
                                                                                <label className="form-check-label">
                                                                                    <InputField
                                                                                        type="radio"
                                                                                        className="form-check-input"
                                                                                        name="optionsRadios1"
                                                                                        id="optionsRadios1"
                                                                                        value={true}
                                                                                        onClick={() => deactivateCharger(charger.charger_id, charger.status)}
                                                                                    />
                                                                                    Active<i className="input-helper"></i>
                                                                                </label>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-success btn-icon-text"
                                                                        onClick={() => navigateToViewChargerDetails(charger)}
                                                                        style={{ marginBottom: '10px', marginRight: '10px' }}
                                                                    >
                                                                        <i className="mdi mdi-eye btn-icon-prepend"></i>View
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr className="text-center">
                                                            <td colSpan="9">No Record Found</td>
                                                        </tr>
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

export default Allocateddevice;
