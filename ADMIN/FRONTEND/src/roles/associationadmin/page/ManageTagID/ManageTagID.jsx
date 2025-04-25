import React, {useState, useEffect, useRef, useCallback} from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';

const ManageTagID = ({ userInfo, handleLogout }) => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredData] = useState([]);
    const [posts, setPosts] = useState([]);
    const fetchUserRoleCalled = useRef(false); // Ref to track if fetchProfile has been called
    const [initialTagID, setInitialTagID] = useState('');
    const [initialTagIDExpiryDateD, setInitialTagIDExpiryDate]= useState('');

    // Fetch Tagid // updated by vivek on 24 aug
    const fetchTagID = useCallback(async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/FetchAllTagIDs`, {
                association_id: userInfo.data.association_id
            });
    
            if (res.data && res.data.status === 'Success') {
                if (typeof res.data.data === 'string' && res.data.data === 'No tags found') {
                    // If the response indicates no tags were found
                    setError(res.data.data);
                    setData([]); // Clear the data since no tags were found
                } else if (Array.isArray(res.data.data)) {
                    // If the data is an array of tag IDs, set it directly
                    setData(res.data.data);
                    setError(null); // Clear any previous errors
                } else {
                    setError('Unexpected response format.');
                }
            } else {
                setError('Error fetching data. Please try again.');
            }
    
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error fetching data. Please try again.');
            setLoading(false);
        }
    }, [userInfo.data.association_id]);

    useEffect(() => {
        if (!fetchUserRoleCalled.current) {
            fetchTagID();
            fetchUserRoleCalled.current = true;
        }
    }, [fetchTagID]);


    // Search data 
    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value.toUpperCase();
        if (Array.isArray(data)) {
            const filteredData = data.filter((item) =>
                item.tag_id.toUpperCase().includes(inputValue)
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

    // Timestamp data 
    function formatTimestamp(originalTimestamp) {
        const date = new Date(originalTimestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        hours = String(hours).padStart(2, '0');
    
        const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
        return formattedDate;
    }

    // Add user role start 
    const [showAddForm, setShowAddForm] = useState(false);

    const addChargers = () => {
        setShowAddForm(prevState => !prevState); // Toggles the form visibility
    };
    const closeAddModal = () => {
        setTagID(''); 
        setTagIDExpiryDate('');
        setShowAddForm(false); // Close the form
        setTheadsticky('sticky');
        setTheadfixed('fixed');
        setTheadBackgroundColor('white');

    };
    const modalAddStyle = {
        display: showAddForm ? 'block' : 'none',
    }

    // Add addTagID
    const [add_tag_id, setTagID] = useState('');
    const [add_tag_id_expiry_date, setTagIDExpiryDate] = useState('');

    const addTagID = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/associationadmin/CreateTagID`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tag_id:add_tag_id, tag_id_expiry_date:add_tag_id_expiry_date, created_by: userInfo.data.email_id, association_id: userInfo.data.association_id }),
            });
            if (response.ok) {
                Swal.fire({
                    title: "Add TagID successfully",
                    icon: "success"
                });
                setTagID(''); 
                setTagIDExpiryDate('');
                setShowAddForm(false);
                closeAddModal();
                fetchTagID();
                setTheadsticky('sticky');
                setTheadfixed('fixed');
                setTheadBackgroundColor('white');
            } else {
                const responseData = await response.json();
                Swal.fire({
                    title: "Error",
                    text: "Failed to TagID, " + responseData.message,
                    icon: "error"
                });
            }
        }catch (error) {
            Swal.fire({
                title: "Error:", error,
                text: "An error occurred while adding TagID",
                icon: "error"
            });
        }
    };

    // Edit user role start 
    const [showEditForm, setShowEditForm] = useState(false);
    const [dataItem, setEditDataItem] = useState(null);

    const handleEditUser = (dataItem) => {
        setEditDataItem(dataItem);
        setEditTagID(dataItem.tag_id); 
        setEditTagIDExpiryDate(dataItem.tag_id_expiry_date);
        setInitialTagID(dataItem.tag_id); 
        setInitialTagIDExpiryDate(dataItem.tag_id_expiry_date); 
        setShowEditForm(true); 
    };

    const closeEditModal = () => {
        setShowEditForm(false); // Close the form
        setTheadsticky('sticky');
        setTheadfixed('fixed');
        setTheadBackgroundColor('white');
    };

    const modalEditStyle = {
        display: showEditForm ? 'block' : 'none',
    }
 
    const [theadBackgroundColor, setTheadBackgroundColor] = useState('white');
    const [theadsticky, setTheadsticky] = useState('sticky');
    const [theadfixed, setTheadfixed] = useState('fixed');

    // Edit button thead bgcolor
    const handleEditUserAndToggleBackground = (dataItem) => {
        handleEditUser(dataItem);
        setTheadsticky(theadsticky === 'sticky' ? '' : 'sticky');
        setTheadfixed(theadfixed === 'fixed' ? 'transparent' : 'fixed');
        setTheadBackgroundColor(theadBackgroundColor === 'white' ? 'transparent' : 'white');
    };

    // Add button thead bgcolor
    const handleAddUserAndToggleBackground = () => {
        addChargers();
        setTheadsticky(theadsticky === 'sticky' ? '' : 'sticky');
        setTheadfixed(theadfixed === 'fixed' ? 'transparent' : 'fixed');
        setTheadBackgroundColor(theadBackgroundColor === 'white' ? 'transparent' : 'white');
    }

    // Edit user role
    const [tag_id, setEditTagID] = useState('');
    const [tag_id_expiry_date, setEditTagIDExpiryDate] = useState('');

    const editTagID = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/associationadmin/UpdateTagID`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id:dataItem.id, tag_id, tag_id_expiry_date, status:dataItem.status, modified_by: userInfo.data.email_id }),
            });
            if (response.ok) {
                Swal.fire({
                    title: "Update TagID successfully",
                    icon: "success"
                });
                setEditTagID(''); 
                setEditTagIDExpiryDate('');
                setShowEditForm(false);
                closeEditModal();
                fetchTagID();
                setTheadsticky('sticky');
                setTheadfixed('fixed');
                setTheadBackgroundColor('white');
            } else {
                const responseData = await response.json();
                Swal.fire({
                    title: "Error",
                    text: "Failed to update TagID, " + responseData.message,
                    icon: "error"
                });
            }
        }catch (error) {
            Swal.fire({
                title: "Error:", error,
                text: "An error occurred while update TagID",
                icon: "error"
            });
        }
    };

    // DeActive
    const changeDeActivate = async (e, id) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/associationadmin/DeactivateOrActivateTagID`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, status:false, modified_by: userInfo.data.email_id }),
            });
            if (response.ok) {
                Swal.fire({
                    title: "DeActivate successfully",
                    icon: "success"
                });
                fetchTagID();
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
                text: "An error occurred while adding DeActivate",
                icon: "error"
            });
        }
    };

    // Active
    const changeActivate = async (e, id) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/associationadmin/DeactivateOrActivateTagID`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, status:true, modified_by: userInfo.data.email_id }),
            });
            if (response.ok) {
                Swal.fire({
                    title: "Activate successfully",
                    icon: "success"
                });
                fetchTagID();
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
                text: "An error occurred while adding Activate",
                icon: "error"
            });
        }
    };

    function formatDateForInput(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // const getMinDate = () => {
    //     const date = new Date();
    //     date.setDate(date.getDate() +2); // Move to the next day
    //     date.setHours(0, 0, 0, 0); // Set time to midnight (00:00:00) of the next day
    //     return date.toISOString().slice(0, 16); // Format for datetime-local input
    // }; 
    
    const getMinDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 1); // Move to two days ahead
        date.setHours(0, 5, 0, 0); // Set time to 12:05 AM (local time) on the next day
    
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
    
        // Format the date and time string for the datetime-local input
        return `${year}-${month}-${day}T${hours}:${minutes}`;
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
                                        <h3 className="font-weight-bold">Manage Tag ID</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={handleAddUserAndToggleBackground}>Add Tag ID</button>
                                            {/* Add role start */}
                                            <div className="modalStyle" style={modalAddStyle}>
                                                <div className="modalContentStyle" style={{ maxHeight: '680px', overflowY: 'auto' }}>
                                                    <span onClick={closeAddModal} style={{ float: 'right', cursor: 'pointer', fontSize:'30px' }}>&times;</span>
                                                    <form className="pt-3" onSubmit={addTagID}>
                                                        <div className="card-body">
                                                            <div style={{textAlign:'center'}}>
                                                                <h4 className="card-title">Add Tag ID</h4>
                                                            </div>
                                                            <div className="table-responsive pt-3">
                                                                <div className="input-group">
                                                                    <div className="input-group-prepend">
                                                                        <span className="input-group-text" style={{color:'black', width:'180px'}}>Tag ID</span>
                                                                    </div>
                                                                    <input type="text" className="form-control" placeholder="Tag ID" value={add_tag_id} maxLength={20} onChange={(e) => {const value = e.target.value; const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, ''); setTagID(sanitizedValue);}} required/>
                                                                </div>
                                                            </div>
                                                            <div className="table-responsive pt-3">
                                                                <div className="input-group">
                                                                    <div className="input-group-prepend">
                                                                        <span className="input-group-text" style={{color:'black', width:'180px'}}>Tag ID Expiry Date</span>
                                                                    </div>
                                                                    <input type="datetime-local" className="form-control" value={add_tag_id_expiry_date} onChange={(e) => setTagIDExpiryDate(e.target.value)}  min={getMinDate()}/>
                                                                </div>
                                                            </div>
                                                            <div style={{textAlign:'center'}}>
                                                                <button type="submit" className="btn btn-primary mr-2" style={{marginTop:'10px'}}>Add</button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                            {/* Add role end */}
                                            {/* Edit role start */}
                                            <div className="modalStyle" style={modalEditStyle}>
                                                <div className="modalContentStyle" style={{ maxHeight: '680px', overflowY: 'auto' }}>
                                                    <span onClick={closeEditModal} style={{ float: 'right', cursor: 'pointer', fontSize:'30px' }}>&times;</span>
                                                    <form className="pt-3" onSubmit={editTagID}>
                                                        <div className="card-body">
                                                            <div style={{textAlign:'center'}}>
                                                                <h4 className="card-title">Edit Tag ID</h4>
                                                            </div>
                                                            <div className="table-responsive pt-3">
                                                                <div className="input-group">
                                                                    <div className="input-group-prepend">
                                                                        <span className="input-group-text" style={{ color: 'black', width: '180px' }}>Tag ID</span>
                                                                    </div>
                                                                    <input type="text" className="form-control" placeholder="Tag ID" style={{ width:'200px'}} value={tag_id} maxLength={20} readOnly />
                                                                </div>
                                                            </div>
                                                            <div className="input-group">
                                                                <div className="input-group-prepend">
                                                                    <span className="input-group-text" style={{ color: 'black', width: '180px' }}>Tag ID Expiry Date</span>
                                                                </div>
                                                                <input 
                                                                    type="datetime-local" 
                                                                    className="form-control"    
                                                                    value={formatDateForInput(tag_id_expiry_date)}
                                                                    onChange={(e) => setEditTagIDExpiryDate(e.target.value)}
                                                                    min={getMinDate()}
                                                                />
                                                            </div>
                                                            <div style={{textAlign:'center'}}>
                                                                <button type="submit" className="btn btn-primary mr-2" style={{marginTop:'10px'}} disabled={tag_id === initialTagID && tag_id_expiry_date === initialTagIDExpiryDateD}>Update</button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                            {/* Edit role end */}
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
                                                        <h4 className="card-title" style={{paddingTop:'10px'}}>List Of Tag ID's</h4>  
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
                                                <thead style={{ textAlign: 'center', position: theadsticky, tableLayout: theadfixed, top: 0, backgroundColor: theadBackgroundColor, zIndex: 1 }}>
                                                    <tr> 
                                                        <th>Sl.No</th>
                                                        <th>Tag ID</th>
                                                        <th>Tag ID Expiry Date</th>
                                                        <th>Status</th>
                                                        <th>Active/DeActive</th>
                                                        <th>Option</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{textAlign:'center'}}>
                                                    {loading ? (
                                                        <tr>
                                                            <td colSpan="9" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
                                                        </tr>
                                                    ) : error ? (
                                                        <tr>
                                                            <td colSpan="9" style={{ marginTop: '50px', textAlign: 'center' }}>{error}</td>
                                                        </tr>
                                                    ) : (
                                                        Array.isArray(posts) && posts.length > 0 ? (
                                                            posts.map((dataItem, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{dataItem.tag_id ? dataItem.tag_id : '-'}</td>
                                                                <td>{dataItem.tag_id_expiry_date ?  formatTimestamp(dataItem.tag_id_expiry_date) : '-'}</td>
                                                                <td>{dataItem.status===true ? <span className="text-success">Active</span> : <span className="text-danger">DeActive</span>}</td>
                                                                <td>
                                                                    <div className='form-group' style={{paddingTop:'13px'}}> 
                                                                        {dataItem.status===true ?
                                                                            <div className="form-check form-check-danger">
                                                                                <label className="form-check-label"><input type="radio" className="form-check-input" name="optionsRadios1" id="optionsRadios2" value={false} onClick={(e) => changeDeActivate(e, dataItem.id)}/>DeActive<i className="input-helper"></i></label>
                                                                            </div>
                                                                        :
                                                                            <div className="form-check form-check-success">
                                                                                <label className="form-check-label"><input type="radio" className="form-check-input" name="optionsRadios1" id="optionsRadios1" value={true} onClick={(e) => changeActivate(e, dataItem.id)}/>Active<i className="input-helper"></i></label>
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <button type="button" className="btn btn-outline-primary btn-icon-text"  onClick={() => handleEditUserAndToggleBackground(dataItem)} style={{marginBottom:'10px'}}><i className="mdi mdi-pencil btn-icon-prepend"></i>Edit</button><br/>
                                                                </td>                                                    
                                                            </tr>
                                                        ))
                                                        ) : (
                                                        <tr>
                                                            <td colSpan="6" style={{ marginTop: '50px', textAlign: 'center' }}>No Tag ID found</td>
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
                 
export default ManageTagID