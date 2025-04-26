import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useAssignedDevicesClient from '../../hooks/ManageClient/AssignedDevicesClientHooks';
import LoadingButton from '../../../../utils/LoadingButton';
import InputField from '../../../../utils/InputField';
const AssignedDevicesClient = ({ userInfo, handleLogout }) => {
    const {
        filteredData,
        errorMessage, setErrorMessage,
        backToManageClient,
        navigateToSessionHistory,
        handleSearchInputChange,
        isUpdating,
        isLoading,
        closeEditModal,
        modalEditStyle,
        theadBackgroundColor,
        theadsticky,
        theadfixed,
        handleEditUserAndToggleBackground,
        reseller_commission,
        setEditRellComm,
        editUserRole, isUpdateButtonEnabled
    } = useAssignedDevicesClient(userInfo);
    return (
        <div className='container-scroller'>
            {/* Header */}
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="container-fluid page-body-wrapper" style={{ paddingTop: '40px' }}>
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
                                            <button type="button" className="btn btn-success" onClick={backToManageClient}>Back</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Edit role start */}
                        <div className="modalStyle" style={modalEditStyle}>
                            <div className="modalContentStyle" style={{ maxHeight: '680px', overflowY: 'auto' }}>
                                <span onClick={closeEditModal} style={{ float: 'right', cursor: 'pointer', fontSize: '30px' }}>&times;</span>
                                <form className="pt-3" onSubmit={editUserRole}>
                                    <div className="card-body">
                                        <div style={{ textAlign: 'center' }}>
                                            <h4 className="card-title">Edit Reseller Commission</h4>
                                        </div>
                                        <div className="table-responsive pt-3">
                                            <div className="input-group">
                                                <div className="input-group-prepend">
                                                    <span className="input-group-text" style={{ color: 'black', width: '185px' }}>Reseller Commission</span>
                                                </div>
                                                <InputField placeholder="Client Commission" value={reseller_commission} maxLength={5}
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
                                                            setEditRellComm(value);

                                                        }
                                                        setErrorMessage(errorMessage);
                                                    }}
                                                    required />
                                            </div>
                                        </div>
                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}

                                        <LoadingButton
                                            type="submit"
                                            loading={isUpdating}
                                            disabled={!isUpdateButtonEnabled || isUpdating}
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
                                                    <h4 className="card-title" style={{ paddingTop: '10px' }}>List Of Chargers</h4>
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
                                                            onChange={handleSearchInputChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: theadsticky, tableLayout: theadfixed, top: 0, zIndex: 1, backgroundColor: theadBackgroundColor }}>
                                                    <tr>
                                                        <th>Sl.No</th>
                                                        <th>Charger Id</th>
                                                        <th>Assigned Reseller Commission %</th>
                                                        <th>Commission %</th>
                                                        <th>Session History</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {isLoading ? (
                                                        <tr className="text-center">
                                                            <td colSpan="5">Loading...</td>
                                                        </tr>
                                                    ) : filteredData.length > 0 ? (
                                                        filteredData.map((item, index) => (
                                                            <tr key={index} style={{ textAlign: 'center' }}>
                                                                <td>{index + 1}</td>
                                                                <td>{item.chargerID ? item.chargerID : '-'}</td>
                                                                <td>{item.reseller_commission ? `${item.reseller_commission}%` : '-'}</td>
                                                                <th>
                                                                    <button type="button" className="btn btn-outline-primary btn-icon-text"
                                                                        onClick={() => handleEditUserAndToggleBackground(item)}
                                                                        style={{ marginBottom: '10px', marginRight: '10px' }}>
                                                                        <i className="mdi mdi-pencil btn-icon-prepend"></i>Edit
                                                                    </button><br />
                                                                </th>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-success btn-icon-text"
                                                                        onClick={() => navigateToSessionHistory(item)}
                                                                        style={{ marginBottom: '10px', marginLeft: '10px' }}
                                                                    >
                                                                        <i className="mdi mdi-history btn-icon-prepend"></i>Session History
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr className="text-center">
                                                            <td colSpan="5">No Record Found</td>
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

export default AssignedDevicesClient;
