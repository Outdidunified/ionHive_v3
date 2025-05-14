import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';
import { showSuccessAlert, showErrorAlert } from '../../../../utils/alert'; 

const useAllocateddevice = (userInfo) => {
    const navigate = useNavigate();
    const [allocatedChargers, setAllocatedChargers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading,setLoading]=useState(true)
   
    // search
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };
    const filterChargers = (chargers) => {
        return chargers.filter((charger) =>
            charger.charger_id.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    // view page
    const navigateToViewChargerDetails = (charger) => {
        navigate('/clientadmin/ViewAlloc', { state: { charger } });
    };

    // Active and deactive

    const deactivateCharger = async (chargerId, status) => {
        try {
            const response = await axiosInstance({method:'post',url:'/clientadmin/DeActivateOrActivateCharger', data:{
                charger_id: chargerId,
                modified_by: userInfo.email_id,
                status: !status // Toggle status
            }});
    
            if (response.status === 200) {
                // Update charger status in state
                setAllocatedChargers(prevChargers =>
                    prevChargers.map(charger =>
                        charger.charger_id === chargerId ? { ...charger, status: !status } : charger
                    )
                );
    
                 showSuccessAlert(status ? "Charger deactivated successfully!" : "Charger activated successfully!");
    
                // Optional: Action after 10 seconds
                setTimeout(() => {
                    console.log('Timer finished after 10 seconds');
                    // You can add additional logic here
                }, 10000);
            } else {
                const responseData = response.data;
                 showErrorAlert("Failed to update charger status, " + responseData.message);
            }
        } catch (error) {
            console.error('Error in updating charger status:', error);
             showErrorAlert("An error occurred while updating charger status.");
        }
    };
    

    const fetchAllocatedChargerDetailsCalled = useRef(false); 

    // Fetch allocated charger details
    const fetchAllocatedChargerDetails = useCallback(async () => {
        try {
            setLoading(true)
            const response = await axiosInstance({method:'post',url:'/clientadmin/FetchAllocatedCharger', data:{
                client_id: userInfo.client_id,
            }});
            console.log(response);

            setAllocatedChargers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching allocated charger details:', error);
            // Handle error appropriately, such as showing an error message to the user
        }finally{
            setLoading(false)
        }
    }, [userInfo.client_id]);

    useEffect(() => {
        if (!fetchAllocatedChargerDetailsCalled.current) {
            const fetchAllocatedChargers = async () => {
                await fetchAllocatedChargerDetails();
            };

            fetchAllocatedChargers();
            fetchAllocatedChargerDetailsCalled.current = true; // Mark fetchAllocatedChargerDetails as called
        }
    }, [fetchAllocatedChargerDetails]); // Include fetchAllocatedChargerDetails in the dependency array


  return {
    allocatedChargers,setAllocatedChargers,
    searchQuery,setSearchQuery,
    handleSearch,filterChargers,
    navigateToViewChargerDetails,
    deactivateCharger,
    fetchAllocatedChargerDetailsCalled,
    fetchAllocatedChargerDetails,loading
  } }
  export default  useAllocateddevice; 