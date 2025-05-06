// import React, { useState, useEffect, useRef, useCallback } from 'react';
import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../../utils/utils';
import { showSuccessAlert, showErrorAlert, showWarningAlert, showConfirmationAlert } from '../../../../utils/alert'; // Adjust path
import { useNavigate } from 'react-router-dom';

const useAssigntoAssociation = (userInfo) => {
    const navigate = useNavigate();
    const [selectedAssociationId, setSelectedAssociationId] = useState('');
    const [selectedChargers, setSelectedChargers] = useState([]);
    const [commission, setCommission] = useState('0');
    const [reloadPage, setReloadPage] = useState(false); // State to trigger page reload
    const [chargersLoading, setChargersLoading] = useState(true); // State to manage loading state
    const [unallocatedChargers, setUnallocatedChargers] = useState([]);
    const [clientsList, setClientsList] = useState([]);
    const fetchClientsCalled = useRef(false);
    const fetchUnallocatedChargersCalled = useRef(false);
    // const fetchFinanceIdCalled = useRef(false); 
    const [selectedModel, setSelectedModel] = useState('');
    const [loading,setLoading]=useState(false)

    // fetch associated users
    const fetchClients = async () => {
        try {
            const response = await axiosInstance.post('/clientadmin/FetchAssociationUserToAssginCharger', {
                client_id: userInfo.client_id
            });
            setClientsList(response.data.data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
            setClientsList([]);
        }
    };

    const fetchUnallocatedChargers = async () => {
        try {
            const response = await axiosInstance.post('/clientadmin/FetchUnAllocatedChargerToAssgin', {
                client_id: userInfo.client_id,
            });
            setUnallocatedChargers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching unallocated charger details:', error);
            setUnallocatedChargers([]);
        } finally {
            setChargersLoading(false);
        }
    };

    // useEffect to call on first render
    useEffect(() => {
        if (!fetchClientsCalled.current) {
            fetchClients();
            fetchClientsCalled.current = true;
        }

        if (!fetchUnallocatedChargersCalled.current) {
            fetchUnallocatedChargers();
            fetchUnallocatedChargersCalled.current = true;
        }
    }, [userInfo.client_id]);


    // select associated changes
    const handleAssociationChange = (e) => {
        const selectedAssociationId = e.target.value;
        setSelectedAssociationId(selectedAssociationId);
    };

    const handleChargerChange = (chargerId, checked) => {
        if (checked) {
            setSelectedChargers(prevState => [...prevState, chargerId]);
        } else {
            setSelectedChargers(prevState => prevState.filter(id => id !== chargerId));
        }
    };

    // set commission
    const [errorMessage, setErrorMessage] = useState('');

    const handleCommissionChange = (e, field) => {
        let value = e.target.value;
    
        // Allow only numbers and a single decimal point
        value = value.replace(/[^0-9.]/g, '');
    
        // Ensure there's only one decimal point and limit to two decimal places
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts[1];
        } else if (parts.length === 2 && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].slice(0, 2);
        }
    
        // Convert to float and validate range
        const numericValue = parseFloat(value);
        let errorMessage = '';
        if (numericValue < 0 || numericValue > 25) {
            errorMessage = 'Please enter a value between 0.00% and 25.00%.';
        }
    
        // Limit the length to 6 characters and apply validation
        if (value.length > 5) {
            value = value.slice(0, 5);
        }
    
        // Update the state based on validation
        if (!errorMessage) {
            setCommission(value);
        }
        setErrorMessage(errorMessage);
    };
    

    // Handle unit price selection
    // const handleFinanceChange = (e) => {
    //     setSelectedFinanceId(e.target.value);
    // };

    // submit data

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (selectedChargers.length === 0) {
             showWarningAlert('No Chargers Selected', 'Please select at least one charger.');
            return;
        }
    
        const confirmed = await showConfirmationAlert({
            title: 'Confirm Selection',
            text: `You have selected chargers: ${selectedChargers.join(', ')}`
        });
    
        if (confirmed.isConfirmed) {
            submitAssign();
        }
    };
    
    const submitAssign = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.post('/clientadmin/AssginChargerToAssociation', {
                association_id: parseInt(selectedAssociationId),
                charger_id: selectedChargers,
                client_commission: commission,
                modified_by: userInfo.email_id,
            });
    
            if (response.data.status === 'Success') {
                 showSuccessAlert('Charger Assigned Successfully');
                setReloadPage(true);
                navigate('/clientadmin/Allocateddevice');
            } else {
                 showErrorAlert('Charger Not Assigned, ' + response.data.message, 'Please try again.');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred while assigning the charger';
             showErrorAlert('Error assigning charger', errorMessage);
        }finally{
            setLoading(false)
        }
    };
    

    useEffect(() => {
        if (reloadPage) {
            setReloadPage(false); // Reset reloadPage state
            window.location.reload(); // Reload the page after success
        }
    }, [reloadPage]);

    const goBack = () => {
        navigate('/clientadmin/Unallocateddevice');
    };

    // Charger selection and model filtering
    const handleModelChange = (model) => {
        setSelectedModel(model);
    };

    // Filter chargers based on the selected model
    const filteredChargers = selectedModel ? unallocatedChargers.filter(charger => charger.charger_model === selectedModel) : unallocatedChargers;
return {
    selectedAssociationId, setSelectedAssociationId,
    selectedChargers,setSelectedChargers  ,
    commission, setCommission,reloadPage, setReloadPage,
    chargersLoading, setChargersLoading,  
    unallocatedChargers, setUnallocatedChargers,
    clientsList, setClientsList,
    fetchClientsCalled,
    fetchUnallocatedChargersCalled,
    selectedModel, setSelectedModel ,fetchClients,fetchUnallocatedChargers,handleAssociationChange,handleChargerChange,
    errorMessage, setErrorMessage,handleCommissionChange,handleSubmit,submitAssign,goBack,
    handleModelChange,filteredChargers,loading


}}
export default useAssigntoAssociation;