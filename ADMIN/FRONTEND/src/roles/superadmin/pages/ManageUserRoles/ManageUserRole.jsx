import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useManageUserRole from '../../hooks/ManageUserRoles/ManageUserRoleHooks';
import LoadingButton from '../../../../utils/LoadingButton';
import InputField from '../../../../utils/InputField';
const ManageUserRole = ({ userInfo, handleLogout }) => {
    const {
        data,
        editLoading,
        posts,
        loading,
        error,
        roleEditname,
        showEditForm,
        initialRoleEditname,
        theadsticky,
        theadfixed,
        theadBackgroundColor,
        setEdituserRole,
        handleSearchInputChange,
        modalEditStyle,
        closeEditModal,
        handleEditUserAndToggleBackground,
        editUserRole,
        changeDeActivate,
        changeActivate,
    } = useManageUserRole(userInfo);

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
                                        <h3 className="font-weight-bold">Manage User Role's</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <div className="modalStyle" style={modalEditStyle}>
                                                <div className="modalContentStyle" style={{ maxHeight: '680px', overflowY: 'auto' }}>
                                                    <span onClick={closeEditModal} style={{ float: 'right', cursor: 'pointer', fontSize: '30px' }}>&times;</span>
                                                    <form className="pt-3" onSubmit={editUserRole}>
                                                        <div className="card-body">
                                                            <div style={{ textAlign: 'center' }}>
                                                                <h4 className="card-title">Edit Role's</h4>
                                                            </div>
                                                            <div className="table-responsive pt-3">
                                                                <div className="input-group">
                                                                    <div className="input-group-prepend">
                                                                        <span className="input-group-text" style={{ color: 'black', width: '125px' }}>Role Name</span>
                                                                    </div>
                                                                    <InputField  placeholder="Role Name" value={roleEditname} maxLength={25} onChange={(e) => { const value = e.target.value; const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, ''); setEdituserRole(sanitizedValue); }} required />
                                                                </div>
                                                            </div>

                                                            <LoadingButton
                                                                loading={editLoading}
                                                                disabled={roleEditname === initialRoleEditname || editLoading}
                                                                type="submit">
                                                                Update
                                                            </LoadingButton>


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
                                                        <h4 className="card-title" style={{ paddingTop: '10px' }}>List Of Role's</h4>
                                                    </div>
                                                    <div className="col-8 col-xl-4">
                                                        <div className="input-group">
                                                            <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                                <span className="input-group-text" id="search">
                                                                    <i className="icon-search"></i>
                                                                </span>
                                                            </div>
                                                            <InputField placeholder="Search now" ariaLabel="search" ariadescribedby="search" autoComplete="off" onChange={handleSearchInputChange} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: theadsticky, tableLayout: theadfixed, top: 0, zIndex: 1, backgroundColor: theadBackgroundColor }}>
                                                    <tr>
                                                        <th>Sl.No</th>
                                                        <th>Role Name</th>
                                                        <th>Created By</th>
                                                        <th>Created Date</th>
                                                        <th>Modified By</th>
                                                        <th>Modified Date</th>
                                                        <th>Status</th>
                                                        <th>Active/DeActive</th>
                                                        <th>Option</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ textAlign: 'center' }}>
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
                                                                    <td>{dataItem.role_name ? dataItem.role_name : '-'}</td>
                                                                    <td>{dataItem.created_by ? dataItem.created_by : '-'}</td>
                                                                    <td>{dataItem.created_date ? formatTimestamp(dataItem.created_date) : '-'}</td>
                                                                    <td>{dataItem.modified_by ? dataItem.modified_by : '-'}</td>
                                                                    <td>{dataItem.modified_date ? formatTimestamp(dataItem.modified_date) : '-'}</td>
                                                                    <td>{dataItem.status === true ? <span className="text-success">Active</span> : <span className="text-danger">DeActive</span>}</td>
                                                                    <td>
                                                                        <div className='form-group' style={{ paddingTop: '13px' }}>
                                                                            {dataItem.status === true ?
                                                                                <div className="form-check form-check-danger">
                                                                                    <label className="form-check-label"><InputField type="radio" className="form-check-input" name="optionsRadios1" id="optionsRadios2" value={false} onClick={(e) => changeDeActivate(e, dataItem.role_id)} />DeActive<i className="input-helper"></i></label>
                                                                                </div>
                                                                                :
                                                                                <div className="form-check form-check-success">
                                                                                    <label className="form-check-label"><InputField type="radio" className="form-check-input" name="optionsRadios1" id="optionsRadios1" value={true} onClick={(e) => changeActivate(e, dataItem.role_id)} />Active<i className="input-helper"></i></label>
                                                                                </div>
                                                                            }
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <button type="button" className="btn btn-outline-primary btn-icon-text" onClick={() => handleEditUserAndToggleBackground(dataItem)} style={{ marginBottom: '10px', marginRight: '10px' }}><i className="mdi mdi-pencil btn-icon-prepend"></i>Edit</button><br />
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

export default ManageUserRole