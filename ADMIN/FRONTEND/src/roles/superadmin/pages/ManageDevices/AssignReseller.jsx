import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useAssignReseller from '../../hooks/ManageDevice/AssignResellerHooks';
import LoadingButton from '../../../../utils/LoadingButton';
const AssignReseller = ({ userInfo, handleLogout }) => {
  const navigate = useNavigate();

  const backManageDevice = () => {
    navigate('/superadmin/ManageDevice');
  };

  const {
    chargers,
    resellers,
    reseller_id,
    charger_ids,
    filteredChargers,
    handleResellerChange,
    handleChargerChange,
    handleModelChange,
    handleSubmit,
    loading
  } = useAssignReseller(userInfo, backManageDevice);

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
                                        <h3 className="font-weight-bold">Assign to Reseller</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <div className="dropdown">
                                                <button className="btn btn-outline-warning btn-icon-text dropdown-toggle" type="button" style={{ marginRight: '10px' }} id="dropdownMenuIconButton1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    <i className="ti-file btn-icon-prepend"></i>Select Charger Model
                                                </button>
                                                <div className="dropdown-menu" aria-labelledby="dropdownMenuIconButton1">
                                                    <h6 className="dropdown-header">Select Charger Model</h6>
                                                    {chargers.length === 0 ? (
                                                        <p disabled style={{ paddingLeft: '50px' }}>No data found</p>
                                                    ) : (
                                                        Array.from(new Set(chargers.map(item => item.charger_model))).map((uniqueModel, index) => (
                                                            <p key={index} className="dropdown-item" onClick={() => handleModelChange(uniqueModel)}>{uniqueModel} KW</p>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                            <button type="button" className="btn btn-success" onClick={backManageDevice}>Back</button>
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
                                                <form className="form-sample" style={{ textAlign: 'center' }} onSubmit={handleSubmit}>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="card-body">
                                                                <h4 className="card-title">Reseller List</h4>
                                                                <div className="template-demo">
                                                                    <div className="form-group row">
                                                                        <div className="col-sm-9" style={{ margin: '0 auto' }}>
                                                                            <select className="form-control" value={reseller_id} onChange={handleResellerChange} required>
                                                                                <option value="">Select Reseller</option>
                                                                                {resellers.length === 0 ? (
                                                                                    <option disabled>No data found</option>
                                                                                ) : (
                                                                                    resellers.map((roles, index) => (
                                                                                        <option key={index} value={roles.reseller_id}>{roles.reseller_name}</option>
                                                                                    ))
                                                                                )}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="card-body">
                                                                <h4 className="card-title">Charger List</h4>
                                                                <div className="template-demo" style={{ paddingLeft: '50px' }}>
                                                                    <div className="form-group" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                                        {filteredChargers.length === 0 ? (
                                                                            <p disabled style={{ paddingRight: '50px' }}>No data found</p>
                                                                        ) : (
                                                                            filteredChargers.map((charger) => (
                                                                                <div className="form-check form-check-success" key={charger.charger_id}>
                                                                                    <label className="form-check-label">
                                                                                        <input
                                                                                            style={{ textAlign: 'center' }}
                                                                                            type="checkbox"
                                                                                            className="form-check-input"
                                                                                            value={charger.charger_id}
                                                                                            onChange={handleChargerChange}
                                                                                            checked={charger_ids.includes(charger.charger_id)}
                                                                                        />
                                                                                        {charger.charger_id}
                                                                                        <i className="input-helper"></i>
                                                                                    </label>
                                                                                    <hr />
                                                                                </div>
                                                                            ))
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <LoadingButton
  type="submit"
  loading={loading}
  disabled={loading}
>
  Assign
</LoadingButton>

                                                </form>
                                            </div>
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

export default AssignReseller;