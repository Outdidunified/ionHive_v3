import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import useWithdrawRequests from '../../hooks/Withdraw/WithdrawHooks';
import InputField from '../../../../utils/InputField';
const Withdraw = ({ userInfo, handleLogout }) => {
    const {
        loading,
        searchQuery,
        setSearchQuery, handleViewDetails,
        filteredRequests
    } = useWithdrawRequests(userInfo);

    return (
        <div className="container-scroller">
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="container-fluid page-body-wrapper" style={{ paddingTop: '40px' }}>
                <Sidebar />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-lg-12 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="row">
                                            <h4 className="card-title responsive-title" style={{ paddingTop: '10px', paddingLeft: '20px' }}>
                                                Withdrawal Requests
                                            </h4>
                                            <div className="col-8 col-xl-4 ml-auto">
                                                <div className="input-group">
                                                    <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                        <span className="input-group-text" id="search">
                                                            <i className="icon-search"></i>
                                                        </span>
                                                    </div>
                                                    <InputField
                                                        placeholder="Search now"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                    <tr>
                                                        <th>Sl.No</th>
                                                        <th>Role Name</th>
                                                        <th>User Name</th>
                                                        <th>Email ID</th>
                                                        <th>Phone No</th>
                                                        <th>Status</th>
                                                        <th style={{ width: '120px' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ textAlign: 'center' }}>
                                                    {loading ? (
                                                        <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                                                    ) : filteredRequests.length > 0 ? (
                                                        filteredRequests.map((withdrawal, index) => (
                                                            <tr key={withdrawal.withdrawal._id}>
                                                                <td>{index + 1}</td>
                                                                <td>{withdrawal.user.role_name || '-'}</td>
                                                                <td>{withdrawal.user?.username || '-'}</td>
                                                                <td>{withdrawal.user?.email_id || '-'}</td>
                                                                <td>{withdrawal.user?.phone_no || '-'}</td>
                                                                <td>
                                                                    <span
                                                                        style={{
                                                                            color: withdrawal.withdrawal?.withdrawal_approved_status === 'Rejected' ? 'red'
                                                                                : withdrawal.withdrawal?.withdrawal_approved_status === 'Completed' ? 'green'
                                                                                    : withdrawal.withdrawal?.withdrawal_approved_status === 'Initiated' ? 'blue'
                                                                                        : withdrawal.withdrawal?.withdrawal_approved_status === 'Pending' ? 'orange'
                                                                                            : 'black',
                                                                            fontWeight: 'Normal', fontSize: '16px'
                                                                        }}
                                                                    >
                                                                        {withdrawal.withdrawal?.withdrawal_approved_status}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <button className="view-btn" onClick={() => handleViewDetails(withdrawal)}>
                                                                        <i className="fa fa-eye"></i> View
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan="7">No Record Found</td></tr>
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

export default Withdraw;
