import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import useAssignuser from '../../hooks/Assignuser/Assignuserhooks';


const Assignuser = ({ userInfo, handleLogout }) => {
  const {
    usersToUnassign, setUsersToUnassign,
    originalUsersToUnassign,setOriginalUsersToUnassign,
    loading,
    setLoading,
    error,setError,
    email_id,setAssEmail,
    errorMessage2,setErrorMessage2,
    fetchUsersToUnassignCalled,
    fetchUsersToUnassign,
    handleSelectRemove,handleSearchInputChange,
    handleAssuserSubmits,handleViewAssignTagID  }=useAssignuser(userInfo)
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
