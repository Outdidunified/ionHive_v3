import React, { useEffect, useState, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Assignuser = ({ userInfo, handleLogout }) => {
  const navigate = useNavigate();
  const [usersToUnassign, setUsersToUnassign] = useState([]);
  const [originalUsersToUnassign, setOriginalUsersToUnassign] = useState([]); // Store original users list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email_id, setAssEmail] = useState('');
  // const [phone_no, setAssPhone] = useState('');
  // const [errorMessage, setErrorMessage] = useState('');
  const [errorMessage2, setErrorMessage2] = useState('');
  const fetchUsersToUnassignCalled = useRef(false);

  // fetch user to unassign data
  const fetchUsersToUnassign = useCallback(async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/FetchUsersWithSpecificRolesToUnAssgin`, {
        association_id: userInfo.data.association_id,
      });
      const users = response.data.data || []; // Use an empty array if data is undefined
      setUsersToUnassign(users);
      setOriginalUsersToUnassign(users); // Store the original list
      setLoading(false);
    } catch (error) {
      setError('Error fetching data. Please try again.');
      console.error(error);
      setLoading(false); // Ensure loading state is updated in case of error
    }
  }, [userInfo.data.association_id]);

  useEffect(() => {
    if (!fetchUsersToUnassignCalled.current) {
      fetchUsersToUnassign();
      fetchUsersToUnassignCalled.current = true;
    }
  }, [fetchUsersToUnassign]);

  // Function to handle selecting and removing a user
  const handleSelectRemove = async (userId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/RemoveUserFromAssociation`, {
        association_id: userInfo.data.association_id,
        user_id: parseInt(userId),
        modified_by: userInfo.data.email_id
      });
      Swal.fire({
        title: 'Success!',
        text: 'User has been removed from the association.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      fetchUsersToUnassign(); // Refresh the list after removal
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error!',
        text: 'There was a problem removing the user.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  // Search assign users name
  const handleSearchInputChange = (e) => {
    const inputValue = e.target.value.toUpperCase();
    if (inputValue === '') {
      setUsersToUnassign(originalUsersToUnassign); // Reset to original list if search is cleared
      setErrorMessage2(''); // Clear any existing error message
    } else {
      const filteredAssignUsers = originalUsersToUnassign.filter((item) =>
        item.username?.toUpperCase().includes(inputValue) // Use optional chaining
      );
      setUsersToUnassign(filteredAssignUsers);

      // Set error message if no users are found
      if (filteredAssignUsers.length === 0) {
        setErrorMessage2('');
      } else {
        setErrorMessage2(''); // Clear error message if users are found
      }
    }
  };

  const handleAssuserSubmits = async (e) => {
    e.preventDefault();

    // phone number validation
    // const passwordRegex = /^\d{10}$/;
    // if (!phone_no || !passwordRegex.test(phone_no)) {
    //   setErrorMessage('Phone number must be a 10-digit number.');
    //   // Set timeout to clear the error message after 5 seconds (5000 milliseconds)
    //   setTimeout(() => {
    //     setErrorMessage('');
    //   }, 5000);
    //   return;
    // }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/AssUserToAssociation`, {
        association_id: userInfo.data.association_id,
        email_id,
        // phone_no: parseInt(phone_no),
        modified_by: userInfo.data.email_id
      });
      fetchUsersToUnassign();
      // Check if the response status is 200 (OK) 
      if (response.status === 200) {
        Swal.fire({
          title: 'Success!',
          text: 'Users have been added to the association.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        setAssEmail('');
        // setAssPhone('');
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Unexpected response: ' + response.status,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
  
    } catch (error) {
      if (error.response && error.response.status === 404) {
        Swal.fire({
          title: 'Error!',
          text: error.response.data.message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'There was a problem assigning the users: ' + error.message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };  

  // View user list
  const handleViewAssignTagID = (dataItem) => {
    navigate('/associationadmin/AssignTagID', { state: { dataItem } });
  };

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
                    <h3 className="font-weight-bold">Assign User to Association</h3>
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
                            <h4 className="card-title" style={{paddingTop:'10px'}}>Add Assign user's</h4>  
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 grid-margin stretch-card d-flex justify-content-center align-items-center">
                      <div className="card">
                        <div className="card-body">
                          <form onSubmit={handleAssuserSubmits} className="form-inline d-flex justify-content-center align-items-center w-100">
                            <label htmlFor="emailId" className="mr-2">Email ID</label>
                            <input type="email" className="form-control mb-2 mr-sm-2" id="emailId" placeholder="Enter Email ID" value={email_id} 
                              onChange={(e) => {
                                const value = e.target.value;
                                const noSpaces = value.replace(/\s/g, '');
                                const validChars = noSpaces.replace(/[^a-zA-Z0-9@.]/g, '');
                                const lowerCaseEmail = validChars.toLowerCase();
                                const atCount = (lowerCaseEmail.match(/@/g) || []).length;
                                const sanitizedEmail = atCount <= 1 ? lowerCaseEmail : lowerCaseEmail.replace(/@.*@/, '@');
                                setAssEmail(sanitizedEmail);
                              }} autoComplete='off' required />

                            {/* <label htmlFor="phoneNo" className="mr-2">Phone Number</label>
                            <input type="text" className="form-control mb-2 mr-sm-2" id="phoneNo" placeholder="Enter Phone Number" value={phone_no} maxLength={10} 
                              onChange={(e) => {
                                const value = e.target.value;
                                const sanitizedValue = value.replace(/[^0-9]/g, '');
                                setAssPhone(sanitizedValue);
                              }} autoComplete='off' required /> */}

                            <button type="submit" className="btn btn-primary mb-2">Assign</button>
                            {/* {errorMessage && <p className="text-danger ml-2">{errorMessage}</p>} */}
                          </form>
                        </div>
                      </div>
                    </div>
                    <hr/>
                    <div className="row">
                      <div className="col-md-12 grid-margin">
                        <div className="row">
                          <div className="col-4 col-xl-8">
                            <h4 className="card-title" style={{paddingTop:'10px'}}>List Of Assigned User's</h4>  
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
                            <th>Role Name</th>
                            <th>User Name</th>
                            <th>Email ID</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Tag ID</th>
                            <th>Assign Tag ID</th>
                            <th>Option</th>
                          </tr>
                        </thead>                          
                        <tbody style={{textAlign:'center'}}>
                          {loading ? (
                            <tr>
                             <td colSpan="10" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
                            </tr>
                          ) : error ? (
                            <tr>
                              <td colSpan="10" style={{ marginTop: '50px', textAlign: 'center' }}>Error: {error}</td>
                            </tr>
                          ) : (
                            Array.isArray(usersToUnassign) && usersToUnassign.length > 0 ? (
                              usersToUnassign.map((dataItem, index) => (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td>{dataItem.role_name ? dataItem.role_name : '-'}</td>
                                  <td>{dataItem.username ? dataItem.username : '-'}</td>
                                  <td>{dataItem.email_id ? dataItem.email_id : '-'}</td>
                                  <td>{dataItem.phone_no ? dataItem.phone_no : '-'}</td>
                                  <td>{dataItem.status===true ? <span className="text-success">Active</span> : <span className="text-danger">DeActive</span>}</td>
                                  <td>{dataItem.tag_id ? dataItem.tag_id : '-'}</td>
                                  <td>
                                  <button
                                      type="button"
                                      className="btn btn-warning"
                                      onClick={() => handleViewAssignTagID(dataItem)}
                                  >
                                      {dataItem.tag_id === null ? 'Assign' : 'Re-assign'}
                                  </button>
                                  </td>  
                                  <th>
                                    <button type="submit" className="btn btn-danger mr-2" onClick={() => handleSelectRemove(dataItem.user_id)}>Remove</button>
                                  </th>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="9" style={{ marginTop: '50px', textAlign: 'center' }}>{errorMessage2}No Assign user's found</td>
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

export default Assignuser;
