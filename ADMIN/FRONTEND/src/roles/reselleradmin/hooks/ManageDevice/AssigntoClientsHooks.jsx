import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { showErrorAlert,showSuccessAlert,showWarningAlert } from '../../../../utils/alert';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';


const useAssigntoclients = ( userInfo ) => {
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedChargers, setSelectedChargers] = useState([]);
    const [commission, setCommission] = useState('0');
    const [reloadPage, setReloadPage] = useState(false); // State to trigger page reload
    const [chargersLoading, setChargersLoading] = useState(true); // State to manage loading state
    const [unallocatedChargers, setUnallocatedChargers] = useState([]);
    const [clientsList, setClientsList] = useState([]);
    const navigate = useNavigate();
    const [selectedModel, setSelectedModel] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchClientsCalled = useRef(false); 
    const fetchUnallocatedChargersCalled = useRef(false); 

    // fetch clientuser to assgin charger
    const fetchClients = async () => {
        try {
            const response = await axiosInstance({method:'post',url:'/reselleradmin/FetchClientUserToAssginCharger', data:{
                reseller_id: userInfo.reseller_id
            }});
            setClientsList(response.data.data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
            setClientsList([]);
        }
    };

    const fetchUnallocatedChargers = async () => {
        try {
            const response = await axiosInstance({method:'post',url:'/reselleradmin/FetchUnAllocatedChargerToAssgin',data: {
                reseller_id: userInfo.reseller_id,
            }});
            setUnallocatedChargers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching unallocated charger details:', error);
            setUnallocatedChargers([]);
        } finally {
            setChargersLoading(false);
        }
    };

    useEffect(() => {
        if (!fetchClientsCalled.current) {
            fetchClients();
            fetchClientsCalled.current = true;
        }

        if (!fetchUnallocatedChargersCalled.current) {
            fetchUnallocatedChargers();
            fetchUnallocatedChargersCalled.current = true;
        }
    }, [userInfo.reseller_id]); // Use userInfo.data.reseller_id as the dependency

    // client changes state
    const handleClientChange = (e) => {
        const selectedClientId = e.target.value;
        setSelectedClientId(selectedClientId);
    };

    const handleChargerChange = (chargerId, checked) => {
        if (checked) {
            setSelectedChargers(prevState => [...prevState, chargerId]);
        } else {
            setSelectedChargers(prevState => prevState.filter(id => id !== chargerId));
        }
    };

    // handle commission
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
    
    // submit data
    const handleSubmit = async (e) => {
        e.preventDefault();
      
        if (selectedChargers.length === 0) {
           showWarningAlert('No Chargers Selected', 'Please select at least one charger.');
          return;
        }
      
        // Confirm selected chargers
        Swal.fire({
          title: 'Confirm Selection',
          text: `You have selected chargers: ${selectedChargers.join(', ')}`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            submitAssign();
          }
        });
      };
      
      // assign data submit
      const submitAssign = async () => {
        setIsSubmitting(true); // Start loading
      
        try {
          const response = await axiosInstance({method:'post',url:'/reselleradmin/AssginChargerToClient', data:{
            client_id: parseInt(selectedClientId),
            charger_id: selectedChargers,
            reseller_commission: commission,
            modified_by: userInfo.email_id,
          }});
      
          if (response.data.status === 'Success') {
             showSuccessAlert('Charger Assigned Successfully');
            navigate('/reselleradmin/Allocateddevice');
          } else {
             showErrorAlert('Charger Not Assigned', response.data.message || 'Please try again.');
          }
        } catch (error) {
          const errorMessage = error?.response?.data?.message || 'Please try again later.';
           showErrorAlert('Error assigning charger', errorMessage);
        } finally {
          setIsSubmitting(false); // End loading
        }
      };
      
    useEffect(() => {
        if (reloadPage) {
            setReloadPage(false); // Reset reloadPage state
            window.location.reload(); // Reload the page after success
        }
    }, [reloadPage]);

    // back allocated device 
    const goBack = () => {
        navigate('/reselleradmin/Unallocateddevice');
    };

    // Charger selection and model filtering
    const handleModelChange = (model) => {
        setSelectedModel(model);
    };

    // Filter chargers based on the selected model
    const filteredChargers = selectedModel ? unallocatedChargers.filter(charger => charger.charger_model === selectedModel) : unallocatedChargers;

    return {
        selectedClientId, setSelectedClientId,
        selectedChargers, setSelectedChargers,
        commission, setCommission,
        reloadPage, setReloadPage,
        chargersLoading, setChargersLoading,
        unallocatedChargers, setUnallocatedChargers,
        clientsList, setClientsList,
        selectedModel, setSelectedModel,
        fetchClients,
        fetchUnallocatedChargers,
        handleClientChange,
        handleChargerChange,
        errorMessage,
        setErrorMessage,
        handleCommissionChange,
        handleSubmit,
        submitAssign,
        goBack,
        handleModelChange,
        filteredChargers,
        isSubmitting

    }}
    export default useAssigntoclients;