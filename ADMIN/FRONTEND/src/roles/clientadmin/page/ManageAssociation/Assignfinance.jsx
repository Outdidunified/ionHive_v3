import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Sidebar from '../../components/Sidebar';
import useAssignfinance from '../../hooks/ManageAssociation/AssignFinanceHooks';
import LoadingButton from '../../../../utils/LoadingButton';

const Assignfinance = ({ userInfo, handleLogout }) => {
    const {
        fetchFinanceId,
        handleFinanceChange,
        handleSubmit,goBack,chargerId,
        financeOptions,selectedFinanceId,
        isEdited,setFinanceOptions,
        fetchFinanceIdCalled,setChargerId,
        setIsEdited
    
    }=useAssignfinance(userInfo);
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
                                        <h3 className="font-weight-bold">Assign Finance</h3>
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
                                        <div className="col-12 grid-margin">
                                            <div className="card">
                                                <div className="card-body">
                                                    <h4 className="card-title">Finance Details</h4>
                                                    <form className="form-sample" onSubmit={handleSubmit}>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Charger ID</label>
                                                                    <div className="col-sm-12">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            value={chargerId}
                                                                            readOnly
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Unit Price</label>
                                                                    <div className="col-sm-12">
                                                                        <select
                                                                            className="form-control"
                                                                            value={selectedFinanceId}
                                                                            onChange={handleFinanceChange}
                                                                            required
                                                                        >
                                                                            <option value="" disabled>Select Unit Price</option>
                                                                            {financeOptions.length === 0 ? (
                                                                                <option disabled>No data found</option>
                                                                            ) : (
                                                                                financeOptions.map((financeItem, index) => (
                                                                                    <option key={index} value={financeItem.finance_id}>{`₹${financeItem.totalprice}`}</option>
                                                                                ))
                                                                            )}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                       

                                                        <LoadingButton
                                                        type="submit"
                                                        loading={loading}
                                                        disabled={isEdited}>Assign</LoadingButton>
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

export default Assignfinance;
