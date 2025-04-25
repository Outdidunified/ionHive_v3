import React, {useState, useEffect, useRef, useCallback} from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const ManageDevice = ({ userInfo, handleLogout }) => {    
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredData] = useState([]);
    const [posts, setPosts] = useState([]);
    const fetchMangeCalled = useRef(false);
    
    // View manage device
    const handleViewManageDevice = (dataItem) => {
        navigate('/associationadmin/ViewManageDevice', { state: { dataItem } });
    };
    
    // Get Allocated charger data
    const FetchAllocatedCharger = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/associationadmin/FetchAllocatedChargerByClientToAssociation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ association_id: userInfo.data.association_id }),
            });

            if (response.ok) {
                const data = await response.json();
                // console.log('Response data:', data);
                setData(data.data);
                setLoading(false);
            } else {
                setError('Failed to fetch profile, ' + response.statusText);
                console.error('Failed to fetch profile:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data. Please try again.');
            setLoading(false);
        }
    }, [userInfo.data.association_id]);

    useEffect(() => {
        if (!fetchMangeCalled.current && userInfo && userInfo.data && userInfo.data.user_id) {
            FetchAllocatedCharger();
            fetchMangeCalled.current = true;
        }
    }, [userInfo, FetchAllocatedCharger]);
   
    // Search data 
    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value.toUpperCase();
        if (Array.isArray(data)) {
            const filteredData = data.filter((item) =>
                item.charger_id.toUpperCase().includes(inputValue)
            );
            setPosts(filteredData);
        }
    };

    // Update table data 'data', and 'filteredData' 
    useEffect(() => {
        switch (data) {
            case 'filteredData':
                setPosts(filteredData);
                break;
            default:
                setPosts(data);
                break;
        }
    }, [data, filteredData]);

    // DeActive
    const changeDeActivate = async (e, dataItem) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/associationadmin/DeActivateOrActivateCharger`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ charger_id:dataItem.charger_id, status:false, modified_by: userInfo.data.email_id }),
            });
            if (response.ok) {
                Swal.fire({
                    title: "DeActivate successfully",
                    icon: "success"
                });
                FetchAllocatedCharger();
            } else {
                const responseData = await response.json();
                Swal.fire({
                    title: "Error",
                    text: "Failed to DeActivate, " + responseData.message,
                    icon: "error"
                });
            }
        }catch (error) {
            Swal.fire({
                title: "Error:", error,
                text: "An error occurred while updating user status.",
                icon: "error"
            });
        }
    };

    // Active
    const changeActivate = async (e, dataItem) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/associationadmin/DeActivateOrActivateCharger`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ charger_id:dataItem.charger_id, status:true, modified_by: userInfo.data.email_id }),
            });
            if (response.ok) {
                Swal.fire({
                    title: "Activate successfully",
                    icon: "success"
                });
                FetchAllocatedCharger();
            } else {
                const responseData = await response.json();
                Swal.fire({
                    title: "Error",
                    text: "Failed to Activate, " + responseData.message,
                    icon: "error"
                });
            }
        }catch (error) {
            Swal.fire({
                title: "Error:", error,
                text: "An error occurred while updating user status.",
                icon: "error"
            });
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [selectedChargerDitails, setSelectedChargerDitails] = useState("");
    const [selectedFinanceId, setSelectedFinanceId] = useState("");
    const [financeOptions, setFinanceOptions] = useState([]);
    const [isEdited, setIsEdited] = useState(false);
    
    // Fetch Finance Details
    const fetchFinanceDetails = useCallback(async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/fetchFinance_dropdown`, {
                association_id: userInfo.data.association_id
            });
    
            if (response.status === 200) {
                let fetchedOptions = response.data.data || [];
    
                if (selectedChargerDitails && selectedChargerDitails.finance_id) {
                    const selectedId = selectedChargerDitails.finance_id;
                    fetchedOptions = [
                        ...fetchedOptions.filter(item => item.finance_id === selectedId),
                        ...fetchedOptions.filter(item => item.finance_id !== selectedId)
                    ];
                    setSelectedFinanceId(selectedId.toString()); // Pre-fill selected
                }
    
                setFinanceOptions(fetchedOptions);
            } else {
                console.error("Error fetching finance:", response.data);
                setFinanceOptions([]);
            }
        } catch (error) {
            console.error("Error fetching finance:", error);
            setFinanceOptions([]);
        }
    }, [userInfo.data.association_id, selectedChargerDitails]);
    
    
    useEffect(() => {
        if (showModal) {
            fetchFinanceDetails();
        }
    }, [fetchFinanceDetails, showModal]);
    
    
    // Open Modal and Set Charger ID
    const openFinanceModal = (dataItem) => {
        setSelectedChargerDitails(dataItem);
        setShowModal(true);
    };
    
    // Handle Finance Selection
    const handleFinanceChange = (e) => {
        setSelectedFinanceId(e.target.value);
        setIsEdited(true);
    };
    
    // Close Modal and Reset States
    const closeModal = () => {
        setShowModal(false);
        setSelectedFinanceId(null); // Reset selectedFinanceId when closing
        setIsEdited(false);
    };

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!selectedChargerDitails || !selectedFinanceId) {
            Swal.fire("Error", "Please select a unit price", "error");
            return;
        }
        const endpoint = selectedChargerDitails.finance_id !== undefined && selectedChargerDitails.finance_id !== null
            ? "/reAssignFinance"
            : "/assignFinance";
    
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/associationadmin${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    _id: selectedChargerDitails._id,
                    charger_id: selectedChargerDitails.charger_id,
                    finance_id: parseInt(selectedFinanceId),
                    modified_by: userInfo.data.email_id,
                }),
            });
    
            const data = await response.json(); // Parse the response body
    
            if (response.ok && data.status === "Success") {
                const actionType = selectedChargerDitails.finance_id ? "reassigned" : "assigned";
                Swal.fire("Success", `Finance ${actionType} successfully`, "success");
                setShowModal(false);
                setSelectedFinanceId("");
                setIsEdited(false);
                FetchAllocatedCharger();
                fetchFinanceDetails();
            } else {
                // Show server error message
                Swal.fire("Error", data.message || "Failed to update finance", "error");
            }
        } catch (error) {
            console.error("Error submitting finance:", error);
            Swal.fire("Error", "Something went wrong", "error");
        }
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
                                                            <input type="text" className="form-control" placeholder="Search now" aria-label="search" aria-describedby="search" autoComplete="off" onChange={handleSearchInputChange}/>
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
                                                                            <input type="text" className="form-control" value={selectedChargerDitails.charger_id} readOnly />
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
                                                                <div style={{ textAlign: "center", padding: "15px" }}>
                                                                    <button type="submit" className="btn btn-primary mr-2" disabled={!isEdited}>
                                                                    {(selectedChargerDitails.finance_id && financeOptions.some(item => item.finance_id === selectedChargerDitails.finance_id))
    ? "ReAssign"
    : "Assign"}

                                                                    </button>
                                                                </div>
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
                                                <tbody style={{textAlign:'center'}}>
                                                    {loading ? (
                                                        <tr>
                                                        <td colSpan="9" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
                                                        </tr>
                                                    ) : error ? (
                                                        <tr>
                                                        <td colSpan="9" style={{ marginTop: '50px', textAlign: 'center' }}>Error: {error}</td>
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
                                                                <td>{dataItem.client_commission ? `${dataItem.client_commission}%` : '-'}</td>
                                                                <td>{dataItem.unit_price ? dataItem.unit_price : '-'}</td>
                                                                <td>{dataItem.charger_accessibility === 1 ? 'Public' : dataItem.charger_accessibility === 2 ? 'Private' : '-'}</td>
                                                                <td>
                                                                    <button type="button" className="btn btn-outline-warning btn-icon-text" style={{ marginBottom: '10px', marginRight: '10px' }} onClick={() => openFinanceModal(dataItem)}><i className="ti-file btn-icon-prepend"></i>Finance</button>
                                                                </td>
                                                                <td>
                                                                    <button type="button" className="btn btn-outline-success btn-icon-text"  onClick={() => handleViewManageDevice(dataItem)} style={{marginBottom:'10px', marginRight:'10px'}}><i className="mdi mdi-eye"></i>View</button> 
                                                                </td>   
                                                                <td>{dataItem.status===true ? <span className="text-success">Active</span> : <span className="text-danger">DeActive</span>}</td>
                                                                <td>
                                                                    <div className='form-group' style={{paddingTop:'13px'}}> 
                                                                        {dataItem.status===true ?
                                                                            <div className="form-check form-check-danger">
                                                                                <label className="form-check-label"><input type="radio" className="form-check-input" name="optionsRadios1" id="optionsRadios2" value={false} onClick={(e) => changeDeActivate(e, dataItem)}/>DeActive<i className="input-helper"></i></label>
                                                                            </div>
                                                                        :
                                                                            <div className="form-check form-check-success">
                                                                                <label className="form-check-label"><input type="radio" className="form-check-input" name="optionsRadios1" id="optionsRadios1" value={true} onClick={(e) => changeActivate(e, dataItem)}/>Active<i className="input-helper"></i></label>
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                </td>  
                                                            </tr>
                                                        ))
                                                        ) : (
                                                        <tr>
                                                            <td colSpan="9" style={{ marginTop: '50px', textAlign: 'center' }}>No devices found</td>
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