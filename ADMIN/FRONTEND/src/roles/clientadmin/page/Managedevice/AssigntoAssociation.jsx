import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import useAssigntoAssociation from '../../hooks/ManageDevice/AssigntoAssociationHooks';
import ReusableButton from '../../../../utils/ReusableButton';
import InputField from '../../../../utils/InputField';
const AssigntoAssociation = ({ userInfo, handleLogout }) => {
    const {
        selectedAssociationId,
        selectedChargers,
        commission, 
        chargersLoading,
        unallocatedChargers, 
        clientsList, 
        handleAssociationChange, handleChargerChange,
        errorMessage, handleCommissionChange, handleSubmit, goBack,
        handleModelChange, filteredChargers, loading

    } = useAssigntoAssociation(userInfo);
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
                                        <h3 className="font-weight-bold">Assign Chargers to Association</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <div className="dropdown">
                                                <button className="btn btn-outline-warning btn-icon-text dropdown-toggle" type="button" style={{ marginRight: '10px' }} id="dropdownMenuIconButton1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    <i className="ti-file btn-icon-prepend"></i>Select Charger Model
                                                </button>
                                                <div className="dropdown-menu" aria-labelledby="dropdownMenuIconButton1">
                                                    <h6 className="dropdown-header">Select Charger Model</h6>
                                                    {unallocatedChargers.length === 0 ? (
                                                        <p disabled style={{ paddingLeft: '50px' }}>No data found</p>
                                                    ) : (
                                                        Array.from(new Set(unallocatedChargers.map(item => item.charger_model))).map((uniqueModel, index) => (
                                                            <p key={index} className="dropdown-item" onClick={() => handleModelChange(uniqueModel)}>{uniqueModel} KW</p>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                            <button type="button" className="btn btn-success" onClick={goBack} style={{ marginRight: '10px' }}>Back</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="col-12 grid-margin">
                                            <div className="card">
                                                <div className="card-body">
                                                    <h2 className="card-title">Enter Details</h2>
                                                    <form onSubmit={handleSubmit} className="form-sample">
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Select Association</label>
                                                                    <div className="col-sm-12">
                                                                        <select
                                                                            className="form-control"
                                                                            value={selectedAssociationId}
                                                                            style={{ color: 'black' }}
                                                                            onChange={handleAssociationChange}
                                                                            required
                                                                        >
                                                                            <option value="">Select Association</option>
                                                                            {clientsList.length === 0 ? (
                                                                                <option disabled>No data found</option>
                                                                            ) : (
                                                                                clientsList.map((clientObj) => (
                                                                                    <option key={clientObj.association_id} value={clientObj.association_id}>
                                                                                        {clientObj.association_name}
                                                                                    </option>
                                                                                ))
                                                                            )}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Commission </label>
                                                                    <div className="col-sm-12">
                                                                        <div className="input-group">
                                                                            <div className="input-group-prepend">
                                                                                <span className="input-group-text">%</span>
                                                                            </div>
                                                                            <InputField
                                                                                maxLength={5}
                                                                                value={commission}
                                                                                name="commission" // Add name attribute
                                                                                onChange={handleCommissionChange}
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Select Chargers</label>
                                                                    <div className="col-sm-12">
                                                                        {chargersLoading ? (
                                                                            <p>Loading chargers...</p>
                                                                        ) : (
                                                                            <div className="dropdown">
                                                                                <button
                                                                                    className="btn btn-secondary dropdown-toggle"
                                                                                    type="button"
                                                                                    id="dropdownMenuButton"
                                                                                    data-toggle="dropdown"
                                                                                    aria-haspopup="true"
                                                                                    aria-expanded="false"
                                                                                    style={{ backgroundColor: 'white', color: 'black' }}
                                                                                >
                                                                                    {unallocatedChargers.length > 0 ? (
                                                                                        selectedChargers.length > 0 ? `${selectedChargers.length} Chargers Selected` : 'Select Chargers'
                                                                                    ) : (
                                                                                        <span className="text-danger">No Chargers Available</span>
                                                                                    )}
                                                                                </button>
                                                                                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                                                    {filteredChargers.length > 0 ? (
                                                                                        filteredChargers.map((chargerObj) => (
                                                                                            <div key={chargerObj.charger_id} className="dropdown-item">
                                                                                                <div className="form-check">
                                                                                                    <InputField
                                                                                                        className="form-check-input"
                                                                                                        type="checkbox"
                                                                                                        id={`charger-${chargerObj.charger_id}`}
                                                                                                        checked={selectedChargers.includes(chargerObj.charger_id)}
                                                                                                        onChange={(e) => handleChargerChange(chargerObj.charger_id, e.target.checked)}
                                                                                                        name={`charger_${chargerObj.charger_id}`}
                                                                                                    />
                                                                                                    <label className="form-check-label" htmlFor={`charger-${chargerObj.charger_id}`}>
                                                                                                        {chargerObj.charger_id}
                                                                                                    </label>
                                                                                                </div>
                                                                                            </div>
                                                                                        ))
                                                                                    ) : (
                                                                                        <div className="dropdown-item">No Chargers Found</div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Select Unit Price</label>
                                                                    <div className="col-sm-12">
                                                                        <select
                                                                            className="form-control"
                                                                            value={selectedFinanceId}
                                                                            onChange={handleFinanceChange}
                                                                            style={{ color: 'black' }}
                                                                            required
                                                                        >
                                                                            <option value="">Select Unit Price</option>
                                                                            {financeOptions.length === 0 ? (
                                                                                <option disabled>No data found</option>
                                                                            ) : (
                                                                                financeOptions.map((finance) => (
                                                                                    <option key={finance.finance_id} value={finance.finance_id}>
                                                                                        {`₹${finance.totalprice}`}
                                                                                    </option>
                                                                                ))
                                                                            )}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div> */}
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Selected Chargers</label>
                                                                    <div className="col-sm-12">
                                                                        <textarea
                                                                            className="form-control"
                                                                            value={selectedChargers.join(', ')}
                                                                            readOnly
                                                                            rows={4}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Selected Chargers</label>
                                                                    <div className="col-sm-12">
                                                                        <textarea
                                                                            className="form-control"
                                                                            value={selectedChargers.join(', ')}
                                                                            readOnly
                                                                            rows={4}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div> */}
                                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}

                                                        <ReusableButton
                                                            type="submit"
                                                            loading={loading}
                                                            disabled={loading}
                                                        >Submit
                                                        </ReusableButton>
                                                    </form>
                                                </div>
                                            </div>
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

export default AssigntoAssociation;
