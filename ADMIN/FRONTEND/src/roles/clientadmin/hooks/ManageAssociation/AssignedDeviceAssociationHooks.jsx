import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { showSuccessAlert, showErrorAlert } from '../../../../utils/alert'; // Adjust the path as needed
import axiosInstance from '../../../../utils/utils';

const useAssigneddevass = (userInfo) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const association_id = location.state?.association_id || JSON.parse(localStorage.getItem('client_id'));
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);


    const fetchChargerDetailsCalled = useRef(false);

    const fetchChargerDetails = useCallback(async () => {
        try {
            setIsLoading(true); // Start loading
            const response = await axiosInstance({method:'post',url:'/clientadmin/FetchChargerDetailsWithSession', data:{ association_id }});
    
            if (response.status === 200) {
                const responseData = response.data;
                setOriginalData(responseData.data);
                setFilteredData(responseData.data);
            } else {
                console.error('Failed to fetch assigned chargers');
            }
        } catch (error) {
            console.error('An error occurred while fetching assigned chargers');
            console.error('Error:', error);
        } finally {
            setIsLoading(false); // Stop loading
        }
    }, [association_id]);
    

    // fetch charger details
    useEffect(() => {
        if (!fetchChargerDetailsCalled.current && association_id) {
            fetchChargerDetails();
            fetchChargerDetailsCalled.current = true; // Mark fetchChargerDetails as called
        }
    }, [association_id, fetchChargerDetails]);

    useEffect(() => {
        if (association_id) {
            localStorage.setItem('association_id', association_id);
        }
    }, [association_id]);

    // search
  const handleSearch = (e) => {
    const inputValue = e.target.value; // Preserve user's input
    const query = inputValue.toLowerCase(); // Only for filtering

    setSearchQuery(inputValue); // Display original casing in input

    if (query.trim() === '') {
        setFilteredData(originalData);
    } else {
        const filtered = originalData.filter(item =>
            item.charger_id.toLowerCase().includes(query)
        );
        setFilteredData(filtered);
    }
};


    // back page
    const goBack = () => {
        navigate(-1);
    };

    // view session history page
    const navsessionhistory = (item) => {
        const sessiondata = item.sessiondata;
        navigate('/clientadmin/Sessionhistoryass', { state: { sessiondata } });
    };


    const [initialClientCommission, setInitialClientCommission] = useState('');
    const [showEditForm, setShowEditForm] = useState(false);
    const [dataItem, setEditDataItem] = useState(null);
    
    const handleEditUser = (item) => {
        setEditDataItem(item);
        setEditClientComm(item.client_commission); // Set role name for editing
        setInitialClientCommission(item.client_commission); // Set initial value for comparison
        setShowEditForm(true); // Open the form
    };
 
    const closeEditModal = () => {
        setShowEditForm(false); // Close the form
        setErrorMessage('');
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
    const [isEdit, setIsEdit] = useState(false); 

    // Edit button thead bgcolor
    const handleEditCommission = (item) => {
        handleEditUser(item);
        setTheadsticky(theadsticky === 'sticky' ? '' : 'sticky');
        setTheadfixed(theadfixed === 'fixed' ? 'transparent' : 'fixed');
        setTheadBackgroundColor(theadBackgroundColor === 'white' ? 'transparent' : 'white');
    };
 
    // Edit user role
    const [client_commission, setEditClientComm] = useState('');
     

    const editUserRole = async (e) => {
        e.preventDefault();
    
        try {
            setIsEdit(true); // Start loading
    
            const response = await axiosInstance({method:'post',url:'/clientadmin/UpdateClientCommission', data:{
                chargerID: dataItem.charger_id,
                client_commission,
                modified_by: userInfo.email_id
            }});
    
            if (response.status === 200) {
                 showSuccessAlert('Client commission updated successfully');
                setEditClientComm('');
                setShowEditForm(false);
                closeEditModal();
                setErrorMessage('');
                setTheadsticky('sticky');
                setTheadfixed('fixed');
                setTheadBackgroundColor('white');
                fetchChargerDetails();
            } else {
                const responseData = response.data;
                 showErrorAlert('Failed to update client commission, ' + responseData.message);
            }
        } catch (error) {
            console.error('Error updating client commission:', error);
             showErrorAlert('An error occurred while updating client commission');
        } finally {
            setIsEdit(false); // Stop loading
        }
    };
    
    
 
    // Determine if the Update button should be enabled
    const isUpdateButtonEnabled = client_commission !== initialClientCommission;
return {
searchQuery,
filteredData,
originalData,
errorMessage,
setErrorMessage,
setOriginalData,
setFilteredData,
setSearchQuery,
fetchChargerDetails,
handleSearch,
goBack,
navsessionhistory,
initialClientCommission, setInitialClientCommission,
showEditForm, setShowEditForm,
dataItem, setEditDataItem,handleEditUser,
closeEditModal,modalEditStyle,
theadBackgroundColor, setTheadBackgroundColor,
theadsticky, setTheadsticky,
theadfixed, setTheadfixed,
handleEditCommission,
editUserRole,
isUpdateButtonEnabled,client_commission,setEditClientComm,isEdit,isLoading


}}
export default useAssigneddevass;