import React, {useState, useEffect, useRef, useCallback} from 'react';
import { showSuccessAlert, showErrorAlert } from '../../../../utils/alert';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';
const useManageDevice = (userInfo) => {    
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [posts, setPosts] = useState([]);
    const fetchMangeCalled = useRef(false);
    const [isloading,setIsLoading]=useState(false)
    // View manage device
    const handleViewManageDevice = (dataItem) => {
        navigate('/associationadmin/ViewManageDevice', { state: { dataItem } });
    };
    
    // Get Allocated charger data
   const FetchAllocatedCharger = useCallback(async () => {
    try {
        setLoading(true);

        const response = await axiosInstance({
            method: 'post',
            url: '/associationadmin/FetchAllocatedChargerByClientToAssociation',
            data: { association_id: userInfo.association_id }
        });

        const data = response.data;

        if (response.status === 200 && data.status === 'Success') {
            setData(data.data);
            setPosts(data.data);
            setError('');
        } else {
            setData([]);
            setPosts([]);
            setError(''); // Clear error so "No devices found" shows
        }
    } catch (error) {
        console.error('Error fetching data:', error);

        // Handle API error response properly
        const apiMessage = error.response?.data?.message;
        setError(apiMessage || 'Error fetching data. Please try again.');
        setData([]);
        setPosts([]);
    } finally {
        setLoading(false);
    }
}, [userInfo.association_id]);

    useEffect(() => {
        if (!fetchMangeCalled.current && userInfo &&  userInfo.user_id) {
            FetchAllocatedCharger();
            fetchMangeCalled.current = true;
        }
    }, [userInfo, FetchAllocatedCharger]);
   
    // Search data 
    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value?.toLowerCase() || ''; // Get the search input value
    
        if (!inputValue.trim()) {
            setPosts(data); // If input is empty, show all data
            return;
        }
    
        const filtered = data.filter((item) => 
            item.charger_id?.toLowerCase().includes(inputValue) // Ensure charger_id is string and compare case-insensitively
        );
    
        console.log('Filtered data:', filtered); // Log the filtered results for debugging
    
        setPosts(filtered); // Update posts with filtered data
    };
    
    useEffect(() => {
        setPosts(data); // set posts when data is fetched
    }, [data]);
    
    const changeDeActivate = async (e, dataItem) => {
        e.preventDefault();
        try {
            const response = await axiosInstance({method:'post',url:'/associationadmin/DeActivateOrActivateCharger', data:{
                charger_id: dataItem.charger_id, status: false, modified_by: userInfo.email_id
            }});
    
            if (response.status === 200) {
                showSuccessAlert("Deactivated successfully"); // Use success alert helper
                FetchAllocatedCharger();
            } else {
                const responseData = response.data;
                showErrorAlert("Error", `Failed to deactivate, ${responseData.message}`); // Use error alert helper
            }
        } catch (error) {
            console.error('Error during deactivation:', error);
            showErrorAlert("Error", "An error occurred while updating user status"); // Use error alert helper
        }
    };
    
    // Activate Function
    const changeActivate = async (e, dataItem) => {
        e.preventDefault();
        try {
            const response = await axiosInstance({method:'post',url:'/associationadmin/DeActivateOrActivateCharger', data:{
                charger_id: dataItem.charger_id, status: true, modified_by: userInfo.email_id
            }});
    
            if (response.status === 200) {
                showSuccessAlert("Activated successfully"); // Use success alert helper
                FetchAllocatedCharger();
            } else {
                const responseData = response.data;
                showErrorAlert("Error", `Failed to activate, ${responseData.message}`); // Use error alert helper
            }
        } catch (error) {
            console.error('Error during activation:', error);
            showErrorAlert("Error", "An error occurred while updating user status"); // Use error alert helper
        }
    };
    

    const [showModal, setShowModal] = useState(false);
    const [selectedChargerDitails, setSelectedChargerDitails] = useState("");
    const [selectedFinanceId, setSelectedFinanceId] = useState("");
    const [financeOptions, setFinanceOptions] = useState([]);
    const [isEdited, setIsEdited] = useState(false);
    
    // Fetch Finance Details
  const fetchFinanceDetails = useCallback(async () => {
    try {
        const response = await axiosInstance({
            method: 'post',
            url: '/associationadmin/fetchFinance_dropdown',
            data: {
                association_id: userInfo.association_id
            }
        });

        if (response.status === 200) {
            let fetchedOptions = response.data.data || [];

            if (selectedChargerDitails && selectedChargerDitails.finance_id) {
                const selectedId = selectedChargerDitails.finance_id;
                fetchedOptions = [
                    ...fetchedOptions.filter(item => item.finance_id === selectedId),
                    ...fetchedOptions.filter(item => item.finance_id !== selectedId)
                ];
                setSelectedFinanceId(selectedId.toString());
                setIsEdited(false); // not edited yet
            } else if (fetchedOptions.length === 1) {
                // Only one option and it's a new assignment
                setSelectedFinanceId(fetchedOptions[0].finance_id.toString());
                setIsEdited(true); // Mark as ready to assign
            }

            setFinanceOptions(fetchedOptions);
        } else {
            console.error("Error fetching finance:", response.data);
            setFinanceOptions([]);
        }
    } catch (error) {
        console.error("Error fetching finance:", error);
        setFinanceOptions([]);
    }
}, [userInfo.association_id, selectedChargerDitails]);


    useEffect(() => {
        if (showModal) {
            fetchFinanceDetails();
        }
    }, [fetchFinanceDetails, showModal]);
    
    
    // Open Modal and Set Charger ID
    const openFinanceModal = (dataItem) => {
        setSelectedChargerDitails(dataItem);
        setShowModal(true);
    };
    
   useEffect(() => {
  if (financeOptions.length === 1 && !selectedFinanceId) {
    // Automatically select the only option if it's available
    setSelectedFinanceId(financeOptions[0].finance_id.toString());
    setIsEdited(true); // Ready for assignment
  }
}, [financeOptions, selectedFinanceId]);

const handleFinanceChange = (e) => {
  const selectedValue = e.target.value;
  console.log("Selected Value from dropdown:", selectedValue);
  
  setSelectedFinanceId(selectedValue);
  
  const originalFinanceId = selectedChargerDitails?.finance_id?.toString() || "";
  const isEdited = selectedValue !== originalFinanceId;

  console.log("Original:", originalFinanceId, "New:", selectedValue, "Edited:", isEdited);
  setIsEdited(isEdited);
};


    
    // Close Modal and Reset States
    const closeModal = () => {
        setShowModal(false);
        setSelectedFinanceId("");  // Reset the finance selection
        setSelectedChargerDitails("");  // Reset the charger details
        setIsEdited(false);
    };
    

    // Handle Form Submission
   const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedChargerDitails || !selectedFinanceId) {
        showErrorAlert("Error", "Please select a unit price");
        return;
    }

    const endpoint = selectedChargerDitails.finance_id !== undefined && selectedChargerDitails.finance_id !== null
        ? "/reAssignFinance"
        : "/assignFinance";

    try {
        setIsLoading(true);

        const response = await axiosInstance({
            method: 'post',
            url: `/associationadmin${endpoint}`,
            data: {
                _id: selectedChargerDitails._id,
                charger_id: selectedChargerDitails.charger_id,
                finance_id: parseInt(selectedFinanceId),
                modified_by: userInfo.email_id,
            }
        });

        const data = response.data;

        if (data.status === "Success") {
            const actionType = selectedChargerDitails.finance_id ? "reassigned" : "assigned";
            showSuccessAlert("Success", `Finance ${actionType} successfully`);
            setShowModal(false);
            setSelectedFinanceId("");
            setIsEdited(false);
            FetchAllocatedCharger();
            fetchFinanceDetails();
        } else if (data.status === "Failed") {
            // Server says operation failed, but HTTP was 200
            showErrorAlert("Error", data.message || "Failed to update finance");
        } else {
            // Unknown status
            showErrorAlert("Error", "Unexpected response from server");
        }
    } catch (error) {
        console.error("Error submitting finance:", error);
        showErrorAlert("Error", "Something went wrong");
    } finally {
        setIsLoading(false);
    }
};

    
    

    return {
        data, setData,
        loading,setLoading,
        error, setError,
        posts, setPosts,
        fetchMangeCalled,
        handleViewManageDevice,
        FetchAllocatedCharger,
        handleSearchInputChange,
        changeDeActivate,
        changeActivate,
        showModal, setShowModal,
        selectedChargerDitails,
        setSelectedChargerDitails,
        selectedFinanceId,setSelectedFinanceId,
        financeOptions,setFinanceOptions,
        isEdited,setIsEdited,fetchFinanceDetails,
        openFinanceModal,handleFinanceChange,
        closeModal,handleSubmit,isloading
    }}
export default useManageDevice;