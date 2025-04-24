import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
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
            if (!userInfo?.email_id) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Admin email not found.' });
                return;
            }
        
            const withdrawalData = withdrawalRequests.find(request => request.withdrawal._id === withdrawalId);
            if (!withdrawalData) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Withdrawal request not found.' });
                return;
            }
        
            const userId = withdrawalData.withdrawal.user_id;
            console.log("Withdrawal ID:", withdrawalId); 
            console.log("User ID:", userId); 
        
            if (!userId) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'User ID not found.' });
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
        
                    Swal.fire({ icon: 'success', title: 'Status Updated', text: response.data.message });
                }
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update the status. Please try again.' });
            }
        };

   
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
        handleStatusChange
    };
};

export default useWithdrawRequests;
