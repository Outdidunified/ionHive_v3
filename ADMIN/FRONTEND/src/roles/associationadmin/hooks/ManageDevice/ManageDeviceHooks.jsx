import React, {useState, useEffect, useRef, useCallback} from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';
const useManageDevice = (userInfo) => {    
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredData] = useState([]);
    const [posts, setPosts] = useState([]);
    const fetchMangeCalled = useRef(false);
    
    // View manage device
    const handleViewManageDevice = (dataItem) => {
        navigate('/associationadmin/ViewManageDevice', { state: { dataItem } });
    };
    
    // Get Allocated charger data
    const FetchAllocatedCharger = useCallback(async () => {
        try {
            const response = await axiosInstance.post('/associationadmin/FetchAllocatedChargerByClientToAssociation', {
                 association_id: userInfo.association_id })
            

            if (response.status==200) {
                const data = response.data
                // console.log('Response data:', data);
                setData(data.data);
                setLoading(false);
            } else {
                setError('Failed to fetch profile, ' + response.statusText);
                console.error('Failed to fetch profile:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data. Please try again.');
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
        const inputValue = e.target.value.toUpperCase();
        if (Array.isArray(data)) {
            const filteredData = data.filter((item) =>
                item.charger_id.toUpperCase().includes(inputValue)
            );
            setPosts(filteredData);
        }
    };

    // Update table data 'data', and 'filteredData' 
    useEffect(() => {
        switch (data) {
            case 'filteredData':
                setPosts(filteredData);
                break;
            default:
                setPosts(data);
                break;
        }
    }, [data, filteredData]);

    // DeActive
    const changeDeActivate = async (e, dataItem) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/associationadmin/DeActivateOrActivateCharger', {
            charger_id:dataItem.charger_id, status:false, modified_by: userInfo.email_id })
            
            if (response.status==200) {
                Swal.fire({
                    title: "DeActivate successfully",
                    icon: "success"
                });
                FetchAllocatedCharger();
            } else {
                const responseData = response.data;
                Swal.fire({
                    title: "Error",
                    text: "Failed to DeActivate, " + responseData.message,
                    icon: "error"
                });
            }
        }catch (error) {
            Swal.fire({
                title: "Error:", error,
                text: "An error occurred while updating user status.",
                icon: "error"
            });
        }
    };

    // Active
    const changeActivate = async (e, dataItem) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/associationadmin/DeActivateOrActivateCharger', {
            charger_id:dataItem.charger_id, status:true, modified_by: userInfo.email_id })
            
            if (response.status==200) {
                Swal.fire({
                    title: "Activate successfully",
                    icon: "success"
                });
                FetchAllocatedCharger();
            } else {
                const responseData = response.data;
                Swal.fire({
                    title: "Error",
                    text: "Failed to Activate, " + responseData.message,
                    icon: "error"
                });
            }
        }catch (error) {
            Swal.fire({
                title: "Error:", error,
                text: "An error occurred while updating user status.",
                icon: "error"
            });
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
            const response = await axiosInstance.post('/associationadmin/fetchFinance_dropdown', {
                association_id: userInfo.association_id
            });
    
            if (response.status === 200) {
                let fetchedOptions = response.data.data || [];
    
                if (selectedChargerDitails && selectedChargerDitails.finance_id) {
                    const selectedId = selectedChargerDitails.finance_id;
                    fetchedOptions = [
                        ...fetchedOptions.filter(item => item.finance_id === selectedId),
                        ...fetchedOptions.filter(item => item.finance_id !== selectedId)
                    ];
                    setSelectedFinanceId(selectedId.toString()); // Pre-fill selected
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
    
    // Handle Finance Selection
    const handleFinanceChange = (e) => {
        setSelectedFinanceId(e.target.value);
        setIsEdited(true);
    };
    
    // Close Modal and Reset States
    const closeModal = () => {
        setShowModal(false);
        setSelectedFinanceId(null); // Reset selectedFinanceId when closing
        setIsEdited(false);
    };

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!selectedChargerDitails || !selectedFinanceId) {
            Swal.fire("Error", "Please select a unit price", "error");
            return;
        }
    
        const endpoint = selectedChargerDitails.finance_id !== undefined && selectedChargerDitails.finance_id !== null
            ? "/reAssignFinance"
            : "/assignFinance";
    
        try {
            const response = await axiosInstance.post(`/associationadmin${endpoint}`, {
                _id: selectedChargerDitails._id,
                charger_id: selectedChargerDitails.charger_id,
                finance_id: parseInt(selectedFinanceId),
                modified_by: userInfo.email_id,
            });
    
            const data = response.data;
    
            if (data.status === "Success") {
                const actionType = selectedChargerDitails.finance_id ? "reassigned" : "assigned";
                Swal.fire("Success", `Finance ${actionType} successfully`, "success");
                setShowModal(false);
                setSelectedFinanceId("");
                setIsEdited(false);
                FetchAllocatedCharger();
                fetchFinanceDetails();
            } else if (data.status === "Failed") {
                // Server says operation failed, but HTTP was 200
                Swal.fire("Error", data.message || "Failed to update finance", "error");
            } else {
                // Unknown status
                Swal.fire("Error", "Unexpected response from server", "error");
            }
        } catch (error) {
            console.error("Error submitting finance:", error);
            Swal.fire("Error", "Something went wrong", "error");
        }
    };
    

    return {
        data, setData,
        loading,setLoading,
        error, setError,
        filteredData,
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
        closeModal,handleSubmit
    }}
export default useManageDevice;