import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useManageDevice from '../../hooks/ManageDevice/ManageDeviceHooks';
import InputField from '../../../../utils/InputField';
import ReusableButton from '../../../../utils/ReusableButton';

const ManageDevice = ({ userInfo, handleLogout }) => {    
  const {
    data,
    loading,
    error,
    posts, 
    handleViewManageDevice,
    handleSearchInputChange,
    changeDeActivate,
    changeActivate,
    showModal, 
    selectedChargerDitails,
    selectedFinanceId,
    financeOptions,
    isEdited,isloading,
    openFinanceModal,handleFinanceChange,
    closeModal,handleSubmit,
  }=useManageDevice(userInfo);
    
    
    
    return (
        <div className='container-scroller'>
            {/* Header */}
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="container-fluid page-body-wrapper">
                {/* Sidebar */}
                <Sidebar/>
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-12 grid-margin">
                                <div className="row">
                                    <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                                        <h3 className="font-weight-bold">Manage Device</h3>
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
                                                        <h4 className="card-title" style={{paddingTop:'10px'}}>List Of Chargers</h4>  
                                                    </div>
                                                    <div className="col-8 col-xl-4">
                                                        <div className="input-group">
                                                            <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                                <span className="input-group-text" id="search">
                                                                <i className="icon-search"></i>
                                                                </span>
                                                            </div>
                                                            <InputField  placeholder="Search now" ariaLabel="search" ariadescribedby="search" autoComplete="off" onChange={handleSearchInputChange}/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Finance Modal */}
                                        {showModal && (
                                            <div className="modal fade show" style={{ display: "block", background: "rgba(0, 0, 0, 0.5)" }}>
                                                <div className="modal-dialog">
                                                    <div className="modal-content">
                                                        <div className="modal-header">
                                                            <h4 className="modal-title">Finance Details</h4>
                                                            <button type="button" className="close" onClick={closeModal}>
                                                                &times;
                                                            </button>
                                                        </div>
                                                        <div className="modal-body">
                                                            <form className="form-sample" onSubmit={handleSubmit}>
                                                                <div className="row">
                                                                    <div className="col-md-6">
                                                                        <div className="form-group">
                                                                            <label className="col-form-label">Charger ID</label>
                                                                            <InputField value={selectedChargerDitails.charger_id} readOnly />
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <div className="form-group">
                                                                            <label className="col-form-label">Unit Price</label>
                                                                            <select className="form-control" value={selectedFinanceId} onChange={handleFinanceChange} required>
                                                                                <option value="" disabled>Select Unit Price</option>
                                                                                {financeOptions.length === 0 ? (
                                                                                    <option disabled>No data found</option>
                                                                                ) : (
                                                                                    financeOptions.map((financeItem, index) => (
                                                                                        <option key={index} value={financeItem.finance_id}>
                                                                                            {`₹${financeItem.totalprice}`}
                                                                                        </option>
                                                                                    ))
                                                                                )}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <ReusableButton 
  type="submit" 
  loading={isloading} 
  disabled={!isEdited}
>
  {(selectedChargerDitails.finance_id && financeOptions.some(item => item.finance_id === selectedChargerDitails.finance_id))
    ? "ReAssign"
    : "Assign"}
</ReusableButton>
      
                                                                
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

<div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
    <table className="table table-striped">
        <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
            <tr> 
                <th>Sl.No</th>
                <th>Charger ID</th>
                <th>Charger Model</th>
                <th>Client Commission</th>
                <th>Per Unit Price</th>
                <th>Charger Accessibility</th>
                <th>Assign Finance</th>
                <th>Option</th>
                <th>Status</th>
                <th>Active/DeActive</th>
            </tr>
        </thead>
        <tbody style={{ textAlign: 'center' }}>
            {loading ? (
                <tr>
                    <td colSpan="10" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
            ) : error ? (
                <tr>
                    <td colSpan="10" style={{ textAlign: 'center' }}>Error: {error}</td>
                </tr>
            ) : Array.isArray(posts) && posts.length === 0 ? (
                <tr>
                    <td colSpan="10" style={{ textAlign: 'center' }}>No devices found</td>
                </tr>
            ) : (
                posts.map((dataItem, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{dataItem.charger_id || '-'}</td>
                        <td className="py-1">
                            <img src={`../../images/dashboard/${dataItem.charger_model || '-'}kw.png`} alt="img" />
                        </td>
                        <td>{dataItem.client_commission ? `${dataItem.client_commission}%` : '-'}</td>
                        <td>{dataItem.unit_price || '-'}</td>
                        <td>{dataItem.charger_accessibility === 1 ? 'Public' : dataItem.charger_accessibility === 2 ? 'Private' : '-'}</td>
                        <td>
                            <button type="button" className="btn btn-outline-warning btn-icon-text" style={{ marginBottom: '10px', marginRight: '10px' }} onClick={() => openFinanceModal(dataItem)}>
                                <i className="ti-file btn-icon-prepend"></i>Finance
                            </button>
                        </td>
                        <td>
                            <button type="button" className="btn btn-outline-success btn-icon-text" onClick={() => handleViewManageDevice(dataItem)} style={{ marginBottom: '10px', marginRight: '10px' }}>
                                <i className="mdi mdi-eye"></i>View
                            </button>
                        </td>
                        <td>{dataItem.status ? <span className="text-success">Active</span> : <span className="text-danger">DeActive</span>}</td>
                        <td>
                            <div className='form-group' style={{ paddingTop: '13px' }}>
                                {dataItem.status ? (
                                    <div className="form-check form-check-danger">
                                        <label className="form-check-label">
                                            <InputField type="radio" className="form-check-input" name={`optionsRadios${index}`} value={false} onClick={(e) => changeDeActivate(e, dataItem)} /> DeActive
                                            <i className="input-helper"></i>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="form-check form-check-success">
                                        <label className="form-check-label">
                                            <InputField type="radio" className="form-check-input" name={`optionsRadios${index}`} value={true} onClick={(e) => changeActivate(e, dataItem)} /> Active
                                            <i className="input-helper"></i>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </td>
                    </tr>
                ))
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
                 
export default ManageDevice