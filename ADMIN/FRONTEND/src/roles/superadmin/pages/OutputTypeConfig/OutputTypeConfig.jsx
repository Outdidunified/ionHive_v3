
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useOutputTypeConfig from '../../hooks/OutputTypeConfig/OutputTypeConfigHooks';
import ReusableButton from '../../../../utils/ReusableButton';
import InputField from '../../../../utils/InputField';

const OutputTypeConfig = ({ userInfo, handleLogout }) => {
    const {
        loading,
        error,
        posts,
        initialOutputTypeConfig,
        handleSearchInputChange,
        closeAddModal,
        modalAddStyle,
        add_OutputTypeConfig,
        add_OutputType,
        addOutputTypeConfig,
        handleModel,
        dataItem,
        closeEditModal, modalEditStyle,
        theadBackgroundColor,
        theadfixed, theadsticky, handleEditOutputTypeConfig,
        handleAddAddOutputTypeConfig, output_type_name,
        setEditOutputTypeConfig, editOutputTypeConfig, changeDeActivate,
        changeActivate, setOutputTypeConfig,
        isUpdating, isloading



    } = useOutputTypeConfig(userInfo);

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
                                        <h3 className="font-weight-bold">Output Type Config</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={handleAddAddOutputTypeConfig}>Add Output Type Config</button>
                                            {/* Add Output Type Config start */}
                                            <div className="modalStyle" style={modalAddStyle}>
                                                <div className="modalContentStyle" style={{ maxHeight: '680px', overflowY: 'auto' }}>
                                                    <span onClick={closeAddModal} style={{ float: 'right', cursor: 'pointer', fontSize: '30px' }}>&times;</span>
                                                    <form className="pt-3" onSubmit={addOutputTypeConfig}>
                                                        <div className="card-body">
                                                            <div style={{ textAlign: 'center' }}>
                                                                <h4 className="card-title">Add Output Type Config</h4>
                                                            </div>
                                                            <div className="table-responsive pt-3">
                                                                <div className="input-group" style={{ paddingRight: '1px' }}>
                                                                    <div className="input-group-prepend">
                                                                        <span className="input-group-text" style={{ color: 'black', width: '150px' }}>Type</span>
                                                                    </div>
                                                                    <select className="form-control" style={{ paddingRight: '10px' }} value={add_OutputType} onChange={handleModel} required>
                                                                        <option value="">Select Type</option>
                                                                        <option value="Gun">Gun</option>
                                                                        <option value="Socket">Socket</option>
                                                                    </select>
                                                                </div>
                                                                <div className="input-group">
                                                                    <div className="input-group-prepend">
                                                                        <span className="input-group-text" style={{ color: 'black', width: '150px' }}>Type Name</span>
                                                                    </div>
                                                                    <InputField placeholder="Output Type Name" maxLength={12} value={add_OutputTypeConfig}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            // Use a regex to allow only letters and numbers
                                                                            const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, ''); setOutputTypeConfig(sanitizedValue);
                                                                        }}
                                                                        required />                                                                </div>
                                                            </div>

                                                            <ReusableButton
                                                                type="submit"
                                                                loading={isloading}
                                                                disabled={isloading}
                                                            >Add</ReusableButton>

                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                            {/* Add Output Type Config end */}
                                            {/* Edit Output Type Config start */}
                                            <div className="modalStyle" style={modalEditStyle}>
                                                <div className="modalContentStyle" style={{ maxHeight: '680px', overflowY: 'auto' }}>
                                                    <span onClick={closeEditModal} style={{ float: 'right', cursor: 'pointer', fontSize: '30px' }}>&times;</span>
                                                    <form className="pt-3" onSubmit={editOutputTypeConfig}>
                                                        <div className="card-body">
                                                            <div style={{ textAlign: 'center' }}>
                                                                <h4 className="card-title">Edit Output Type Config</h4>
                                                            </div>
                                                            <div className="table-responsive pt-3">
                                                                <div className="input-group">
                                                                    <div className="input-group-prepend">
                                                                        <span className="input-group-text" style={{ color: 'black', width: '180px' }}>Type</span>
                                                                    </div>
                                                                    <InputField placeholder="Output Type" style={{ width: '200px' }} value={dataItem?.output_type || ''} readOnly />
                                                                </div>
                                                                <div className="input-group">
                                                                    <div className="input-group-prepend">
                                                                        <span className="input-group-text" style={{ color: 'black', width: '180px' }}>Type Name</span>
                                                                    </div>
                                                                    <InputField placeholder="Output Type Name" maxLength={12} style={{ width: '200px' }} value={output_type_name}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            // Use a regex to allow only letters and numbers
                                                                            const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '');
                                                                            setEditOutputTypeConfig(sanitizedValue);
                                                                        }}
                                                                        required />
                                                                </div>
                                                            </div>


                                                            <ReusableButton
                                                                type="submit"
                                                                loading={isUpdating}
                                                                disabled={output_type_name === initialOutputTypeConfig || isUpdating}
                                                            >
                                                                Update
                                                            </ReusableButton>

                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                            {/* Edit Output Type Config end */}
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
                                                        <h4 className="card-title" style={{ paddingTop: '10px' }}>List Of Output Type Config</h4>
                                                    </div>
                                                    <div className="col-8 col-xl-4">
                                                        <div className="input-group">
                                                            <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                                <span className="input-group-text" id="search">
                                                                    <i className="icon-search"></i>
                                                                </span>
                                                            </div>
                                                            <InputField placeholder="Search by Output Type/Name" ariaLabel="search" ariadescribedby="search" autoComplete="off" onChange={handleSearchInputChange} />
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
                                                        <th>Output Type</th>
                                                        <th>Output Type Name</th>
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
                                                            <td colSpan="10" style={{ marginTop: '50px', textAlign: 'center' }}>Loading...</td>
                                                        </tr>
                                                    ) : error ? (
                                                        <tr>
                                                            <td colSpan="10" style={{ padding: '50px 0', textAlign: 'center' }}>
                                                                <span className="text-danger">Error: {error}</span>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        Array.isArray(posts) && posts.length > 0 ? (
                                                            posts.map((dataItem, index) => (
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{dataItem.output_type || '-'}</td>
                                                                    <td>{dataItem.output_type_name || '-'}</td>
                                                                    <td>{dataItem.created_by || '-'}</td>
                                                                    <td>{dataItem.created_date ? formatTimestamp(dataItem.created_date) : '-'}</td>
                                                                    <td>{dataItem.modified_by || '-'}</td>
                                                                    <td>{dataItem.modified_date ? formatTimestamp(dataItem.modified_date) : '-'}</td>
                                                                    <td>{dataItem.status ? <span className="text-success">Active</span> : <span className="text-danger">DeActive</span>}</td>
                                                                    <td>
                                                                        <div className="form-group" style={{ paddingTop: '13px' }}>
                                                                            {dataItem.status ? (
                                                                                <div className="form-check form-check-danger">
                                                                                    <label className="form-check-label">
                                                                                        <InputField
                                                                                            type="radio"
                                                                                            className="form-check-input"
                                                                                            name="optionsRadios1"
                                                                                            value={false}
                                                                                            onClick={(e) => changeDeActivate(e, dataItem.id)}
                                                                                        />
                                                                                        DeActive <i className="input-helper"></i>
                                                                                    </label>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="form-check form-check-success">
                                                                                    <label className="form-check-label">
                                                                                        <InputField
                                                                                            type="radio"
                                                                                            className="form-check-input"
                                                                                            name="optionsRadios1"
                                                                                            value={true}
                                                                                            onClick={(e) => changeActivate(e, dataItem.id)}
                                                                                        />
                                                                                        Active <i className="input-helper"></i>
                                                                                    </label>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-primary btn-icon-text"
                                                                            onClick={() => handleEditOutputTypeConfig(dataItem)}
                                                                            style={{ marginBottom: '10px' }}
                                                                        >
                                                                            <i className="mdi mdi-pencil btn-icon-prepend"></i>Edit
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="10" style={{ padding: '50px 0', textAlign: 'center' }}>
                                                                    No Output Type Config found
                                                                </td>
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

export default OutputTypeConfig