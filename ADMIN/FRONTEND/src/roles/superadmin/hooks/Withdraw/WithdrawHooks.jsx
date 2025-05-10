import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { showSuccessAlert, showErrorAlert } from '../../../../utils/alert';
import axiosInstance from '../../../../utils/utils';
const useWithdrawRequests = (userInfo) => {
    const [withdrawalRequests, setWithdrawalRequests] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState({});
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const isFetching = useRef(false);

    useEffect(() => {
        const fetchWithdrawalRequests = async () => {
            if (!userInfo?.email_id) return;

            setLoading(true);
            if (isFetching.current) return;
            isFetching.current = true;

            try {
                const response = await axiosInstance.get('/superadmin/FetchPaymentRequest');
                if (response.status === 200 && response.data.data) {
                    setWithdrawalRequests(response.data.data);
                    const initialStatus = {};
                    response.data.data.forEach(request => {
                        initialStatus[request.withdrawal._id] = request.withdrawal.withdrawal_approved_status;
                    });
                    setSelectedStatus(initialStatus);
                } else {
                    setWithdrawalRequests([]);
                }
            } catch (error) {
                console.error('Error fetching withdrawal requests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWithdrawalRequests();
    }, [userInfo]);

  

const handleStatusChange = async (withdrawalId, newStatus, rejectionReason) => {
    console.log(userInfo); // Check if userInfo has the expected structure

    if (!userInfo?.email_id) {
        showErrorAlert('Error', 'Admin email not found.');
        return;
    }

    const withdrawalData = withdrawalRequests.find(request => request.withdrawal._id === withdrawalId);
    if (!withdrawalData) {
        showErrorAlert('Error', 'Withdrawal request not found.');
        return;
    }

    const userId = withdrawalData.withdrawal.user_id;
    console.log("Withdrawal ID:", withdrawalId); 
    console.log("User ID:", userId); 

    if (!userId) {
        showErrorAlert('Error', 'User ID not found.');
        return;
    }

    const reason = newStatus === 'Rejected' ? rejectionReason : ''; 
    try {
        const response = await axiosInstance.post('/superadmin/UpdatePaymentRequestStatus', {
            user_id: userId,
            _id: withdrawalId, 
            withdrawal_approved_status: newStatus,
            withdrawal_approved_by: userInfo.email_id,
            withdrawal_rejected_message: reason, 
        });

        if (response.status === 200) {
            setSelectedStatus(prevState => ({ ...prevState, [withdrawalId]: newStatus }));
            setWithdrawalRequests(prevState => prevState.map(item => {
                if (item.withdrawal._id === withdrawalId) {
                    item.withdrawal.withdrawal_approved_status = newStatus;
                }
                return item;
            }));

            showSuccessAlert('Status Updated', response.data.message);
        }
    } catch (error) {
        const errorMessage = error?.response?.data?.message || 'Failed to update the status. Please try again.';
        showErrorAlert('Error', errorMessage);
    }
};


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
                showLoaderOnConfirm: true,  
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
            allowOutsideClick: () => !Swal.isLoading()
        };
        
        const filteredRequests = Array.isArray(withdrawalRequests) ? withdrawalRequests.filter(request => {
            const query = searchQuery.toLowerCase();
            return (
                request.user?.email_id.toLowerCase().includes(query) ||
                request.user?.username.toLowerCase().includes(query)
            );
        }) : [];
        
   
    return {
        withdrawalRequests,
        setWithdrawalRequests,
        selectedStatus,
        setSelectedStatus,
        rejectionReason,
        setRejectionReason,
        loading,
        setLoading,
        searchQuery,
        setSearchQuery,
        handleStatusChange,
        handleViewDetails,
        filteredRequests

    };
};

export default useWithdrawRequests;
