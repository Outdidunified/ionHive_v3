import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useWallet from '../../hooks/Withdraw/WithdrawHooks';
import InputField from '../../../../utils/InputField';

const Withdraw = ({ userInfo, handleLogout }) => {
    const {
        commissionAmount,
        isLoading,
        withdrawalRequests,
        formData,
        isEditing, errors,
        handleChange,
        hasChanges,
        handleSubmit, handleWithdraw,
        fetchData
    } = useWallet(userInfo)

    return (
        <div className="container-scroller">
            {/* Header */}
            <Header userInfo={userInfo} handleLogout={handleLogout} />

            <div className="container-fluid page-body-wrapper" style={{ paddingTop: '40px' }}>
                {/* Sidebar */}
                <Sidebar />

                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-12 grid-margin">
                                <div className="row">
                                    <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                                        <h3 className="font-weight-bold">Wallet</h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Wallet Balance */}
                        <div className="row">
                            <div className="col-md-12 mb-4 stretch-card transparent" style={{ position: 'relative' }}>
                                <div className="card card-tale">
                                    <div className="card-body-withdraw">
                                        <h3 className="mb-4 font-weight-bold">Wallet Balance</h3>
                                        <h3 className="fs-25 mb-2"><b>Rs: {commissionAmount}</b></h3>

                                        <div className="withdraw-button">
                                            <button
                                                onClick={handleWithdraw}
                                                className="btn shadow-lg"
                                            >
                                                <i className="fas fa-arrow-circle-right"></i> Withdraw
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User Account Details Form */}
                        <div className="row">
                            <div className="col-md-12 grid-margin stretch-card">
                                <div className="card border-0 rounded-3">
                                    <div className="card-body">
                                        <div className="text-center">
                                            <h2 className="card-title font-weight-bold text-primary">User Account Details</h2>
                                        </div>
                                        <form className="forms-sample" onSubmit={handleSubmit}>
                                            <div className="row">
                                                {/* A/C Holder Name */}
                                                <div className="col-md-6 mb-3">
                                                    <div className="form-group">
                                                        <label htmlFor="accountHolderName">A/C Holder Name</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text"><i className="fas fa-user"></i></span>
                                                            <InputField

                                                                name="accountHolderName"
                                                                value={formData.accountHolderName}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bank Name */}
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="bankName">Bank Name</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text"><i className="fas fa-university"></i></span>
                                                            <InputField

                                                                name="bankName"
                                                                value={formData.bankName}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Account Number */}
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="accountNumber">Account Number</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text"><i className="fas fa-hashtag"></i></span>
                                                            <InputField
                                                                className={`form-control ${errors.accountNumber ? "is-invalid" : ""}`}
                                                                name="accountNumber"
                                                                value={formData.accountNumber}
                                                                onChange={handleChange}
                                                                required
                                                                maxLength={18}
                                                            />
                                                        </div>
                                                        {errors.accountNumber && <small className="text-danger">{errors.accountNumber}</small>}
                                                    </div>
                                                </div>

                                                {/* IFSC Code */}
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="ifscNumber">IFSC Code</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text"><i className="fas fa-barcode"></i></span>
                                                            <InputField
                                                                className={`form-control ${errors.ifscNumber ? "is-invalid" : ""}`}
                                                                name="ifscNumber"
                                                                value={formData.ifscNumber}
                                                                onChange={handleChange}
                                                                required
                                                                maxLength={11}
                                                            />
                                                        </div>
                                                        {errors.ifscNumber && <small className="text-danger">{errors.ifscNumber}</small>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <div className="text-center mt-3">
                                                {isLoading ? (
                                                    <button type="button" className="btn btn-primary" disabled>
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    </button>
                                                ) : isEditing ? (
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary custom-btn"
                                                        disabled={!hasChanges()} // Enable only if there are changes
                                                    >
                                                        Update
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="submit"
                                                        className="btn btn-success custom-btn"
                                                        disabled={isLoading}
                                                    >
                                                        <i className="fas fa-check-circle"></i> Create
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-12 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-end mb-2" style={{ width: '100%' }}>
                                            <button className="btn btn-primary" onClick={fetchData}>
                                                <i className="fa fa-sync"></i> Reload Data
                                            </button>
                                        </div>

   <h4 className="card-title responsive-title" style={{ paddingTop: '20px', paddingLeft: '20px' }}>
                                            Withdrawal Details
                                        </h4>
                                        <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                    <tr>
                                                        <th>Sl.No</th>
                                                        <th>Total Amount</th>
                                                        <th>Commission Amount</th>
                                                        <th>Withdrawal Amount</th>
                                                        <th>Requested Date</th>
                                                        <th>Approved Date</th>
                                                        <th>Status</th>
                                                        <th style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>Reason</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ textAlign: 'center' }}>
                                                    {isLoading ? (
                                                        <tr>
                                                            <td colSpan="8">Loading...</td>
                                                        </tr>
                                                    ) : withdrawalRequests.length > 0 ? (
                                                        <>
                                                            {withdrawalRequests.map((withdrawal, index) => (
                                                                <tr key={withdrawal._id} style={{ height: "95px" }}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{withdrawal.totalWithdrawalAmount || '-'}</td>
                                                                    <td>{(withdrawal.commissionAmount || 0).toFixed(3)}</td>
                                                                    <td>{(withdrawal.withdrawalAmount || 0).toFixed(2)}</td>
                                                                    <td>
                                                                        {withdrawal.withdrawal_req_date
                                                                            ? new Date(withdrawal.withdrawal_req_date).toLocaleDateString("en-GB")
                                                                            : '-'}
                                                                    </td>
                                                                    <td>
                                                                        {withdrawal.withdrawal_approved_date
                                                                            ? new Date(withdrawal.withdrawal_approved_date).toLocaleDateString("en-GB")
                                                                            : '-'}
                                                                    </td>
                                                                    <td style={{
                                                                        color:
                                                                            withdrawal.withdrawal_approved_status === 'Completed' ? 'green' :
                                                                                withdrawal.withdrawal_approved_status === 'Pending' ? 'orange' :
                                                                                    withdrawal.withdrawal_approved_status === 'Initiated' ? 'blue' :
                                                                                        withdrawal.withdrawal_approved_status === 'Rejected' ? 'red' :
                                                                                            'black'
                                                                    }}>
                                                                        {withdrawal.withdrawal_approved_status || '-'}
                                                                    </td>
                                                                    <td style={{ whiteSpace: 'normal', wordWrap: 'break-word', maxWidth: '150px' }}>
                                                                        {withdrawal.withdrawal_rejected_message || '-'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </>
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="8" style={{ textAlign: 'center' }}>
                                                                No Record Found
                                                            </td>
                                                        </tr>
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

export default Withdraw;
