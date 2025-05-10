import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useManageTagID from '../../hooks/ManageTagID/ManageTagIDhooks';
import InputField from '../../../../utils/InputField';
import ReusableButton from '../../../../utils/ReusableButton';

const ManageTagID = ({ userInfo, handleLogout }) => {

  const {
    loading,
    error, 
    posts, 
    initialTagID,
    initialTagIDExpiryDateD, 
    handleSearchInputChange,
    closeEditModal,
    closeAddModal,
    modalAddStyle ,add_tag_id, setTagID,
    add_tag_id_expiry_date, setTagIDExpiryDate,
    addTagID,modalEditStyle,
    theadBackgroundColor,   
    theadsticky,theadfixed, 
    handleEditUserAndToggleBackground,
    handleAddUserAndToggleBackground,
    tag_id, formatTimestamp,
    tag_id_expiry_date, setEditTagIDExpiryDate,
    editTagID,changeDeActivate,
    changeActivate,formatDateForInput,
    getMinDate,editloading,isloading
  }=useManageTagID(userInfo)
    
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
                                                                    <InputField  placeholder="Tag ID" value={add_tag_id} maxLength={20} onChange={(e) => {const value = e.target.value; const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, ''); setTagID(sanitizedValue);}} required/>
                                                                </div>
                                                            </div>
                                                            <div className="table-responsive pt-3">
                                                                <div className="input-group">
                                                                    <div className="input-group-prepend">
                                                                        <span className="input-group-text" style={{color:'black', width:'180px'}}>Tag ID Expiry Date</span>
                                                                    </div>
                                                                    <InputField type="datetime-local" className="form-control" value={add_tag_id_expiry_date} onChange={(e) => setTagIDExpiryDate(e.target.value)}  min={getMinDate()}/>
                                                                </div>
                                                            </div>
                                                            {/* <div style={{textAlign:'center'}}>
                                                                <button type="submit" className="btn btn-primary mr-2" style={{marginTop:'10px'}}>Add</button>
                                                            </div> */}
                                                            <ReusableButton type="submit" loading={isloading} >Add</ReusableButton>
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
                                                                    <InputField  placeholder="Tag ID" style={{ width:'200px'}} value={tag_id} maxLength={20} readOnly />
                                                                </div>
                                                            </div>
                                                            <div className="input-group">
                                                                <div className="input-group-prepend">
                                                                    <span className="input-group-text" style={{ color: 'black', width: '180px' }}>Tag ID Expiry Date</span>
                                                                </div>
                                                                <InputField 
                                                                    type="datetime-local" 
                                                                    value={formatDateForInput(tag_id_expiry_date)}
                                                                    onChange={(e) => setEditTagIDExpiryDate(e.target.value)}
                                                                    min={getMinDate()}
                                                                />
                                                            </div>
                                                            {/* <div style={{textAlign:'center'}}>
                                                                <button type="submit" className="btn btn-primary mr-2" style={{marginTop:'10px'}} disabled={tag_id === initialTagID && tag_id_expiry_date === initialTagIDExpiryDateD}>Update</button>
                                                            </div> */}
                                                            <ReusableButton type="submit"
                                                            disabled={tag_id === initialTagID && tag_id_expiry_date === initialTagIDExpiryDateD}
                                                            loading={editloading}>Update</ReusableButton>
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
                                                            <InputField  placeholder="Search now" ariaLabel="search" ariadescribedby="search" autoComplete="off" onChange={handleSearchInputChange}/>
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