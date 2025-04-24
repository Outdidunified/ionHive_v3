import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import useManageDevice from '../../hooks/ManageDevice/ManageDeviceHooks';
const ManageDevice = ({ userInfo, handleLogout }) => {
  const navigate = useNavigate();

  const {
    posts,
    loading,
    error,
    handleSearchInputChange,
    uploadFile
  } = useManageDevice(userInfo);

  const handleAddDeviceList = () => {
    navigate('/superadmin/AddManageDevice');
  };

  const handleViewDeviceList = (dataItem) => {
    navigate(`/superadmin/ViewManageDevice`, { state: { dataItem } });
  };

  const handleAssignReseller = () => {
    navigate('/superadmin/AssignReseller');
  };

  const handleUploadClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      Swal.fire({
        title: "Warning",
        text: "Please select a file.",
        icon: "warning"
      });
      return;
    }

    const allowedExtensions = ["xls", "xlsx"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      Swal.fire({
        title: "Warning",
        text: "Invalid file type. Please upload an Excel file (.xls or .xlsx).",
        icon: "warning"
      });
      return;
    }

    await uploadFile(file);
  };
    
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
                                    <div className="col-12 col-xl-6 mb-4 mb-xl-0">
                                        <h3 className="font-weight-bold">Manage Device-Unallocated</h3>
                                    </div>
                                    <div className="col-12 col-xl-6">
                                        <div className="justify-content-end d-flex">
                                            <div>
                                                {/* Upload Button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-success btn-icon-text"
                                                    style={{ marginBottom: "10px", marginRight: "10px" }}
                                                    onClick={handleUploadClick}
                                                >
                                                    Upload Device Create
                                                </button>

                                                {/* Hidden File Input */}
                                                <input
                                                    type="file"
                                                    id="fileInput"
                                                    accept=".xls,.xlsx"
                                                    style={{ display: "none" }}
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                            <button type="button" className="btn btn-success" onClick={handleAddDeviceList} style={{marginBottom:'10px', marginRight:'10px'}}>Create</button> 
                                            <button type="button" className="btn btn-warning" onClick={handleAssignReseller} style={{marginBottom:'10px', marginRight:'10px'}}>Assign to Reseller</button>
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
                                                        <h4 className="card-title" style={{paddingTop:'10px'}}>List Of Chargers</h4>  
                                                    </div>
                                                    <div className="col-8 col-xl-4">
                                                        <div className="input-group">
                                                            <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                                <span className="input-group-text" id="search">
                                                                <i className="icon-search"></i>
                                                                </span>
                                                            </div>
                                                            <input type="text" className="form-control" placeholder="Search now" aria-label="search" aria-describedby="search" autoComplete="off" onChange={handleSearchInputChange}/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                    <tr> 
                                                        <th>Sl.No</th>
                                                        <th>Charger ID</th>
                                                        <th>Charger Model</th>
                                                        <th>Charger Type</th>
                                                        {/* <th>Gun Connector</th> */}
                                                        <th>Max Current</th>
                                                        <th>Status</th>
                                                        <th>Option</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{textAlign:'center'}}>
                                                    {loading ? (
                                                        <tr>
                                                        <td colSpan="8" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
                                                        </tr>
                                                    ) : error ? (
                                                        <tr>
                                                        <td colSpan="8" style={{ marginTop: '50px', textAlign: 'center' }}>Error: {error}</td>
                                                        </tr>
                                                    ) : (
                                                        Array.isArray(posts) && posts.length > 0 ? (
                                                            posts.map((dataItem, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{dataItem.charger_id ? dataItem.charger_id : '-'}</td>
                                                                <td className="py-1">
                                                                    <img src={`../../images/dashboard/${dataItem.charger_model ? dataItem.charger_model : '-'}kw.png`} alt="img" />
                                                                </td>  
                                                                <td>{dataItem.charger_type ? dataItem.charger_type : '-'}</td>
                                                                {/* <td>
                                                                    {dataItem.gun_connector === 1
                                                                        ? 'Single phase'
                                                                        : dataItem.gun_connector === 2
                                                                        ? 'CSS Type 2'
                                                                        : dataItem.gun_connector === 3
                                                                        ? '3 phase socket'
                                                                    : '-'}
                                                                </td> */}
                                                                <td>{dataItem.max_current ? dataItem.max_current : '-'}</td>
                                                                <td>{dataItem.status===true ? <span className="text-success">Active</span> : <span className="text-danger">DeActive</span>}</td>
                                                                <td>
                                                                    <button type="button" className="btn btn-outline-success btn-icon-text" onClick={() => handleViewDeviceList(dataItem)} style={{marginBottom:'10px', marginRight:'10px'}}><i className="mdi mdi-eye"></i>View</button> 
                                                                </td>
                                                            </tr>
                                                        ))
                                                        ) : (
                                                        <tr>
                                                            <td colSpan="8" style={{ marginTop: '50px', textAlign: 'center' }}>No devices found</td>
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
                 
export default ManageDevice