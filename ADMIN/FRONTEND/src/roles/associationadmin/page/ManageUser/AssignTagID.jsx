import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useLocation } from 'react-router-dom';

const AssignTagID = ({ userInfo, handleLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredData] = useState([]);
    const [posts, setPosts] = useState([]);
    const fetchUserRoleCalled = useRef(false); // Ref to track if fetchProfile has been called

    const [newUser, setNewUser] = useState({
        user_id: '', tag_id: '', _id: '',
    });

    useEffect(() => {
        const { dataItem } = location.state || {};
        if (dataItem) {
            setNewUser({
                user_id: dataItem.user_id || '',  tag_id: dataItem.tag_id || '', _id: dataItem._id || '',
            });
        // Save to localStorage
        localStorage.setItem('userData', JSON.stringify(dataItem));
        } else {
            // Load from localStorage if available
            const savedData = JSON.parse(localStorage.getItem('userData'));
            if (savedData) {
                setNewUser(savedData);
            }
        }
    }, [location]);
    // Fetch Tagid

    // Fetch TagID
    const fetchTagID = useCallback(async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/FetchTagIdToAssign`, {
                association_id: userInfo.data.association_id,
                user_id: userInfo.data.user_id
            });
    
            if (res.data && res.data.status === 'Success') {
                if (typeof res.data.data === 'string' && res.data.data === 'No tags found') {
                    // If the data contains the message "No tags found"
                    setError(res.data.data);
                    setData([]); // Clear the data since no tags were found
                } else if (Array.isArray(res.data.data)) {
                    // If the data contains an array of tag IDs, filter based on expiry date
                    const currentDate = new Date();
                    const tagIDdata = res.data.data.filter((item) => {
                        const expiryDate = new Date(item.tag_id_expiry_date);
                        return expiryDate >= currentDate; // Filter future expiry dates
                    });
    
                    setData(tagIDdata);
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
    }, [userInfo.data.association_id, userInfo.data.user_id]);
    

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

    const goBack = () => {
        navigate(-1);
    };

    const handleAssignTagID = async (dataItem) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/associationadmin/AssignTagIdToUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: newUser.user_id, tag_id: dataItem.tag_id, modified_by: userInfo.data.email_id }),
            });
            if (response.ok) {
                Swal.fire({
                    title: "Assign TagID successfully",
                    icon: "success"
                });
                fetchTagID();
                backManageUserPage();
            } else {
                const responseData = await response.json();
                Swal.fire({
                    title: "Error",
                    text: "Failed to Assign TagID, " + responseData.message,
                    icon: "error"
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "An error occurred while assigning TagID",
                icon: "error"
            });
        }
    };
    

    // Back manageuser page
    const backManageUserPage = () => {
        navigate('/associationadmin/Assignuser');
    };
    return (
        <div className='container-scroller'>
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="container-fluid page-body-wrapper">
                <Sidebar />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-12 grid-margin">
                                <div className="row">
                                    <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                                        <h3 className="font-weight-bold">Assign Tag ID</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                onClick={goBack}
                                                style={{ marginRight: '10px' }}
                                            >
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
                                        <div className="row">
                                            <div className="col-md-12 grid-margin">
                                                <div className="row">
                                                    <div className="col-4 col-xl-8">
                                                        <h4 className="card-title" style={{paddingTop:'10px'}}>List Of TagID's</h4>  
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
                                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                    <tr> 
                                                        <th>Sl.No</th>
                                                        <th>Tag ID</th>
                                                        <th>TagID Expiry Date</th>
                                                        <th>Status</th>
                                                        <th>Assign Tag ID</th>
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
                                                                    <button type="button" className="btn btn-warning" onClick={() => handleAssignTagID(dataItem)} style={{marginBottom:'10px'}} disabled={newUser.tag_id === dataItem.tag_id}>Assign</button><br/>
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
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default AssignTagID;
