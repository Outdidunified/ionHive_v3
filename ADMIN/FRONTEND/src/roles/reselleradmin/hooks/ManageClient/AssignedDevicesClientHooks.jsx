import React, { useState, useEffect, useRef , useCallback} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';
import {showSuccessAlert,showErrorAlert} from '../../../../utils/alert';

const useAssignedDevicesClient = ( userInfo) => {
    const location = useLocation();
    const navigate = useNavigate();
    const client_id = location.state?.client_id || JSON.parse(localStorage.getItem('client_id'));
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const fetchChargerDetailsCalled = useRef(false);
    const [initialResellerCommission, setInitialResellerCommission] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    
    // Fetch charger details
    const fetchChargerDetails = useCallback(async () => {
        setIsLoading(true); // Start loading
        try {
            const response = await axiosInstance.post('/reselleradmin/FetchChargerDetailsWithSession', {
                client_id
            });
    
            if (response.status === 200) {
                const responseData = response.data;
                setData(responseData.data);
                setFilteredData(responseData.data);
            } else {
                console.error('Failed to fetch assigned chargers');
            }
        } catch (error) {
            console.error('An error occurred while fetching assigned chargers', error);
        } finally {
            setIsLoading(false); // End loading
        }
    }, [client_id]);
    
    

    useEffect(() => {
        if (!fetchChargerDetailsCalled.current && client_id) {
            fetchChargerDetails();
            fetchChargerDetailsCalled.current = true; // Mark fetchChargerDetails as called
        }
    }, [client_id, fetchChargerDetails]);

    // Data localstorage 
    useEffect(() => {
        if (client_id) {
            localStorage.setItem('client_id', client_id);
        }
    }, [client_id]);

    // Back to manage client
    const backToManageClient = () => {
        navigate('/reselleradmin/ManageClient');
    };
 
    // View session history page
    const navigateToSessionHistory = (data) => {
        const sessiondata = data.sessiondata; // Assuming sessiondata is an array and we take the first element
        navigate('/reselleradmin/Sessionhistoryclient', { state: { sessiondata } });
    };

    // Search input
    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value.toUpperCase();
        const filteredData = data.filter((item) =>
            item.chargerID.toUpperCase().includes(inputValue)
        );
        setFilteredData(filteredData);
    };

    // Edit user role start 
    const [showEditForm, setShowEditForm] = useState(false);
    const [dataItem, setEditDataItem] = useState(null);
   
    const handleEditUser = (item) => {
        setEditDataItem(item);
        setEditRellComm(item.reseller_commission); // Set role name for editing
        setInitialResellerCommission(item.reseller_commission); // Set initial value for comparison
        setShowEditForm(true); // Open the form
    };

    const closeEditModal = () => {
        setShowEditForm(false); // Close the form
        setErrorMessage('')
        setTheadsticky('sticky');
        setTheadfixed('fixed');
        setTheadBackgroundColor('white');
    };

    const modalEditStyle = {
        display: showEditForm ? 'block' : 'none',
    }
    
    const [theadBackgroundColor, setTheadBackgroundColor] = useState('white');
    const [theadsticky, setTheadsticky] = useState('sticky');
    const [theadfixed, setTheadfixed] = useState('fixed');

    // Edit button thead bgcolor
    const handleEditUserAndToggleBackground = (item) => {
        handleEditUser(item);
        setTheadsticky(theadsticky === 'sticky' ? '' : 'sticky');
        setTheadfixed(theadfixed === 'fixed' ? 'transparent' : 'fixed');
        setTheadBackgroundColor(theadBackgroundColor === 'white' ? 'transparent' : 'white');
    };

    // Edit user role
    const [reseller_commission, setEditRellComm] = useState('');
    
    const editUserRole = async (e) => {
        e.preventDefault();
        setIsUpdating(true); // Start spinner
      
        try {
          const response = await axiosInstance.post('/reselleradmin/UpdateResellerCommission', {
            chargerID: dataItem.chargerID,
            reseller_commission,
            modified_by: userInfo.email_id
          });
      
          if (response.status === 200) {
             showSuccessAlert("Update reseller commission successfully");
      
            await fetchChargerDetails();
            setEditRellComm('');
            setShowEditForm(false);
            closeEditModal();
            setErrorMessage('');
            setTheadsticky('sticky');
            setTheadfixed('fixed');
            setTheadBackgroundColor('white');
          } else {
            const responseData = await response.json();
             showErrorAlert("Error", "Failed to update reseller commission, " + responseData.message);
          }
        } catch (error) {
          const message = error.response?.data?.message || "An error occurred while updating reseller commission";
           showErrorAlert("Error", message);
        } finally {
          setIsUpdating(false); // Stop spinner
        }
      };
      
    

    // Determine if the Update button should be enabled
    const isUpdateButtonEnabled = reseller_commission !== initialResellerCommission;

return {
    data, setData,
    filteredData, setFilteredData,
    initialResellerCommission, setInitialResellerCommission,
    errorMessage, setErrorMessage,
    fetchChargerDetails,
    backToManageClient,
    navigateToSessionHistory,
    handleSearchInputChange,
    showEditForm, setShowEditForm,
    dataItem, setEditDataItem,
    handleEditUser,
    closeEditModal,
    modalEditStyle,
    theadBackgroundColor, setTheadBackgroundColor,
    theadsticky, setTheadsticky,
    theadfixed, setTheadfixed,
    handleEditUserAndToggleBackground,
    reseller_commission,
    setEditRellComm,
    editUserRole,isUpdateButtonEnabled,isLoading,isUpdating

}}
export default useAssignedDevicesClient;

