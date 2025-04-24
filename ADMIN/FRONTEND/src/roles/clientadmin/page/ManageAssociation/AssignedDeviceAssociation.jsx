import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useAssigneddevass from '../../hooks/ManageAssociation/AssignedDeviceAssociationHooks';
import LoadingButton from '../../../../utils/LoadingButton';
const Assigneddevass = ({ userInfo, handleLogout }) => {
   const {
    searchQuery,
filteredData,
originalData,
errorMessage,
setErrorMessage,
setOriginalData,
setFilteredData,
setSearchQuery,
fetchChargerDetails,
handleSearch,
goBack,
navsessionhistory,
initialClientCommission, setInitialClientCommission,
showEditForm, setShowEditForm,
dataItem, setEditDataItem,handleEditUser,
closeEditModal,modalEditStyle,
theadBackgroundColor, setTheadBackgroundColor,
theadsticky, setTheadsticky,
theadfixed, setTheadfixed,
handleEditCommission,
editUserRole,
isUpdateButtonEnabled,client_commission,setEditClientComm,isEdit,isLoading

   }=useAssigneddevass(userInfo);
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
                                        <h3 className="font-weight-bold">Assigned Devices</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                onClick={goBack}
                                                style={{ marginRight: '10px' }}
                                            >Back
                                            </button>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                        {/* Edit role start */}
                        <div className="modalStyle" style={modalEditStyle}>
                            <div className="modalContentStyle" style={{ maxHeight: '680px', overflowY: 'auto' }}>
                                <span onClick={closeEditModal} style={{ float: 'right', cursor: 'pointer', fontSize:'30px' }}>&times;</span>
                                <form className="pt-3" onSubmit={editUserRole}>
                                    <div className="card-body">
                                        <div style={{textAlign:'center'}}>
                                            <h4 className="card-title">Edit Client Commission</h4>
                                        </div>
                                        <div className="table-responsive pt-3">
                                            <div className="input-group">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text" style={{color:'black', width:'185px'}}>Client Commission</span>
                                                </div>
                                                <input type="text" className="form-control" placeholder="Client Commission" value={client_commission} maxLength={5}
                                                    onChange={(e) => {
                                                        let value = e.target.value;
                                                        // Allow only numbers and a single decimal point
                                                        value = value.replace(/[^0-9.]/g, '');
                                                    
                                                        // Ensure there's only one decimal point and limit to two decimal places
                                                        const parts = value.split('.');
                                                        if (parts.length > 2) {
                                                            value = parts[0] + '.' + parts[1];
                                                        } else if (parts.length === 2 && parts[1].length > 2) {
                                                            value = parts[0] + '.' + parts[1].slice(0, 2);
                                                        }
                                                    
                                                        // Convert to float and validate range
                                                        const numericValue = parseFloat(value);
                                                        let errorMessage = '';
                                                        if (numericValue < 0 || numericValue > 25) {
                                                            errorMessage = 'Please enter a value between 0.00% and 25.00%.';
                                                        }
                                                        // Limit the length to 6 characters
                                                        if (value.length > 5) {
                                                            value = value.slice(0, 5);
                                                        }
                                                    
                                                        // Update the state based on validation
                                                        if (!errorMessage) {
                                                            setEditClientComm(value);

                                                        }
                                                        setErrorMessage(errorMessage);
                                                    }}
                                                required/>
                                            </div>
                                        </div>
                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}
                                    
                                        <LoadingButton
  type="submit"
  disabled={!isUpdateButtonEnabled}
  loading={isEdit}
>Update</LoadingButton>

                                       
                                    </div>
                                </form>
                            </div>
                        </div>
                        {/* Edit role end */}
                        <div className="row">
                            <div className="col-lg-12 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="col-md-12 grid-margin">
                                            <div className="row">
                                                <div className="col-4 col-xl-8">
                                                    {/* <h4 className="card-title" style={{ paddingTop: '10px' }}></h4> */}
                                                </div>
                                                <div className="col-12 col-xl-4">
                                                    <div className="input-group">
                                                        <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                            <span className="input-group-text" id="search">
                                                                <i className="icon-search"></i>
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Search now"
                                                            value={searchQuery}
                                                            onChange={handleSearch}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: theadsticky, tableLayout: theadfixed, top: 0, zIndex: 1, backgroundColor: theadBackgroundColor}}>
                                                    <tr>  
                                                        <th>Sl.No</th>
                                                        <th>Charger Id</th>
                                                        {/* <th>Unit Cost</th> */}
                                                        <th>Client Commission %</th>
                                                        <th>Commission %</th>
                                                        {/* <th>Assign Finance</th> */}
                                                        <th>Session History</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
    {isLoading ? (
        <tr>
            <td colSpan="7" className="text-center">Loading...</td>
        </tr>
    ) : filteredData.length > 0 ? (
        filteredData.map((item, index) => (
            <tr key={index} style={{ textAlign: 'center' }}>
                <td>{index + 1}</td>
                <td>{item.charger_id || '-'}</td>
                <td>{item.client_commission ? `${item.client_commission}%` : '-'}</td>
                <th>
                    <button
                        type="button"
                        className="btn btn-outline-primary btn-icon-text"
                        onClick={() => handleEditCommission(item)}
                        style={{ marginBottom: '10px', marginRight: '10px' }}
                    >
                        <i className="mdi mdi-pencil btn-icon-prepend"></i>Edit
                    </button>
                </th>
                <td>
                    <button
                        type="button"
                        className="btn btn-outline-success btn-icon-text"
                        onClick={() => navsessionhistory(item)}
                        style={{ marginBottom: '10px', marginLeft: '10px' }}
                    >
                        <i className="mdi mdi-history btn-icon-prepend"></i>Session History
                    </button>
                </td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="7" className="text-center">No associations found.</td>
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

export default Assigneddevass;
