import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';
import useWithdrawRequests from '../../hooks/Withdraw/WithdrawHooks';
import InputField from '../../../../utils/InputField';
const Withdraw = ({ userInfo, handleLogout }) => {
    const {
        withdrawalRequests,
        setRejectionReason,
        loading,
        searchQuery,
        setSearchQuery,handleStatusChange
    } = useWithdrawRequests(userInfo);


 
    const handleViewDetails = async (withdrawal) => {
        setRejectionReason(''); // Reset rejection reason
        
        // Determine if the status is already "Completed" or "Rejected"
        const isCompleted = withdrawal.withdrawal.withdrawal_approved_status === 'Completed';
        const isRejected = withdrawal.withdrawal.withdrawal_approved_status === 'Rejected';
        
        await Swal.fire({
            title: `<h3 style='color:#333;'>Withdrawal Request</h3>`,
            html: `
            <div style="text-align: left; font-size: 16px;">
                <p><b>Total Amount:</b> ${withdrawal.withdrawal.totalWithdrawalAmount}</p>
                <p><b>Commission Amount:</b> ${withdrawal.withdrawal.commissionAmount.toFixed(3)}</p>
                <p><b>Withdrawal Amount:</b> ${withdrawal.withdrawal.withdrawalAmount.toFixed(2)}</p>
        
                <p><b>Account Holder Name:</b> ${withdrawal.withdrawal.accountHolderName}</p>
                <p><b>Account Number:</b> ${withdrawal.withdrawal.accountNumber}</p>
                <p><b>Bank Name:</b> ${withdrawal.withdrawal.bankName}</p>
                <p><b>Requested Date:</b> ${new Date(withdrawal.withdrawal.withdrawal_req_date).toLocaleDateString('en-GB')}</p>
                <p><b>IFSC Number:</b> ${withdrawal.withdrawal.ifscNumber}</p>
                <label for="statusSelect" style="font-weight: bold;">Status:</label>
                <select id="statusSelect" class="swal2-select styled-dropdown" style="border-radius: 8px; padding: 5px;" ${isCompleted || isRejected ? 'disabled' : ''}>
                    <option value="Initiated" ${withdrawal.withdrawal.withdrawal_approved_status === 'Initiated' ? 'selected' : ''}>Initiated</option>
                    <option value="Pending" ${withdrawal.withdrawal.withdrawal_approved_status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Completed" ${withdrawal.withdrawal.withdrawal_approved_status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Rejected" ${withdrawal.withdrawal.withdrawal_approved_status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                </select>
        
                <div id="reasonContainer" style="display: ${isRejected ? 'block' : 'none'}; margin-top: 10px;">
                    <label for="rejectionReason" style="font-weight: bold;">Rejection Reason:</label>
                    <textarea 
                        id="rejectionReason" 
                        rows="4" 
                        style="width: 100%; padding: 5px;" 
                        placeholder="Enter the reason for rejection (max 100 chars)..." 
                        maxlength="100"
                        ${isRejected || isCompleted ? 'disabled' : ''}
                    >${isRejected ? withdrawal.withdrawal.withdrawal_rejected_message || '' : ''}</textarea>
                </div>
            </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Update Status",
            cancelButtonText: "Close",
            customClass: {
                confirmButton: 'swal-wide-button',
                cancelButton: 'swal-wide-button'
            },
            confirmButtonColor: "#4CAF50",
            cancelButtonColor: "#f44336",
            didOpen: () => {
                const statusSelect = document.getElementById('statusSelect');
                const reasonContainer = document.getElementById('reasonContainer');
                const rejectionReasonInput = document.getElementById('rejectionReason');
                const confirmButton = Swal.getConfirmButton();
                
                // Disable the confirm button if the status is already "Completed" or "Rejected"
                confirmButton.disabled = isCompleted || isRejected;
    
                if (!isCompleted && !isRejected) {
                    statusSelect.addEventListener('change', () => {
                        if (statusSelect.value === 'Rejected') {
                            reasonContainer.style.display = 'block';
                        } else {
                            reasonContainer.style.display = 'none';
                            rejectionReasonInput.value = '';
                        }
                    });
    
                    rejectionReasonInput.addEventListener('input', () => {
                        if (statusSelect.value === 'Rejected' && rejectionReasonInput.value.trim().length > 100) {
                            rejectionReasonInput.value = rejectionReasonInput.value.substring(0, 100);
                        }
                    });
                }
            },
            preConfirm: () => {
                if (isCompleted || isRejected) return false; // Prevent status update if already completed/rejected
                
                const newStatus = document.getElementById('statusSelect').value;
                let reason = '';
                
                if (newStatus === 'Rejected') {
                    reason = document.getElementById('rejectionReason').value.trim();
                    if (!reason) {
                        Swal.showValidationMessage('Rejection reason is required');
                        return false;
                    }
                }
    
                if (newStatus === withdrawal.withdrawal.withdrawal_approved_status) {
                    Swal.showValidationMessage('No changes were made to the status');
                    return false;
                }
    
                return handleStatusChange(withdrawal.withdrawal._id, newStatus, reason);
            }
        });
    };
    
    const filteredRequests = Array.isArray(withdrawalRequests) ? withdrawalRequests.filter(request => {
        const query = searchQuery.toLowerCase();
        return (
            request.user?.email_id.toLowerCase().includes(query) ||
            request.user?.username.toLowerCase().includes(query)
        );
    }) : [];
    

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
