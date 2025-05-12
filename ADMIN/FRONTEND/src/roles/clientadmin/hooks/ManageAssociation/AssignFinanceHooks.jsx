import React, { useEffect, useState, useCallback, useRef} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { showSuccessAlert, showErrorAlert } from '../../../../utils/alert'; // Update path accordingly
import axiosInstance from '../../../../utils/utils';

const useAssignfinance = (userInfo) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [chargerId, setChargerId] = useState('');
    const [financeOptions, setFinanceOptions] = useState([]);
    const [selectedFinanceId, setSelectedFinanceId] = useState('');
    const [isEdited, setIsEdited] = useState(false); // New state to track if the unit price is edited
    const fetchFinanceIdCalled = useRef(false); 

    // Fetch finance details
    const fetchFinanceId = useCallback(async (finance_id) => {
        try {
            const response = await axiosInstance({method:'post',url:'/clientadmin/FetchFinanceDetailsForSelection', data:{
                client_id: userInfo.client_id,
            }});
            if (response.data && Array.isArray(response.data.data)) {
                const financeIds = response.data.data.map(item => ({
                    finance_id: item.finance_id,
                    totalprice: item.totalprice
                }));
                setFinanceOptions(financeIds);

                // If finance_id is provided, select the corresponding total price
                if (finance_id) {
                    const selectedFinance = financeIds.find(item => item.finance_id === finance_id);
                    if (selectedFinance) {
                        setSelectedFinanceId(selectedFinance.finance_id);
                    }
                }
            } else {
                console.error('Expected an array from API response, received:', response.data);
            }
        } catch (error) {
            console.error('Error fetching finance details:', error);
        }
    }, [userInfo.client_id]);

    useEffect(() => {
        const { charger_id, finance_id } = location.state || {};
        if (charger_id) {
            setChargerId(charger_id);
        }
        if (!fetchFinanceIdCalled.current) {
            fetchFinanceId(finance_id);
            fetchFinanceIdCalled.current = true;
        }
    }, [location, fetchFinanceId]);

    // Handle selection change
    const handleFinanceChange = (e) => {
        const selectedId = e.target.value;
        setSelectedFinanceId(selectedId);
        setIsEdited(true); // Mark as edited when a selection is changed
    };

    // Handle form submission

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const formattedData = {
                charger_id: chargerId,
                finance_id: parseInt(selectedFinanceId),
                modified_by: userInfo.email_id,
            };
    
            const response = await axiosInstance({method:'post',url:'/clientadmin/AssignFinanceToCharger', data:formattedData});
    
            if (response.status === 200) {
                 showSuccessAlert('Finance has been assigned successfully.');
                navigate(-1);
            } else {
                 showErrorAlert('Unexpected response. Please check the details and try again.');
            }
        } catch (error) {
            console.error('Error assigning finance:', error);
             showErrorAlert('Failed to assign finance. Please try again.');
        }
    };
    

    // Handle navigation back
    const goBack = () => {
        navigate(-1);
    };
return {
    fetchFinanceId,
    handleFinanceChange,
    handleSubmit,goBack,chargerId,
    financeOptions,selectedFinanceId,
    isEdited,setFinanceOptions,
    fetchFinanceIdCalled,setChargerId,
    setIsEdited

}}
export default useAssignfinance;