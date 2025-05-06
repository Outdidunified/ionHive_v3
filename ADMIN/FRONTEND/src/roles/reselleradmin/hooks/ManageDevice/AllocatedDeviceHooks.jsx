import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';
import { showErrorAlert,showSuccessAlert } from '../../../../utils/alert';
const useAllocatedDevice = (userInfo) => {
    const [allocatedChargers, setAllocatedChargers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const fetchAllocatedChargerDetailsCalled = useRef(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filterChargers = useCallback((chargers) => {
        return chargers.filter((charger) =>
            charger.charger_id.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const navigateToViewChargerDetails = useCallback((charger) => {
        navigate('/reselleradmin/ViewAlloc', { state: { charger } });
    }, [navigate]);

    const deactivateCharger = async (chargerId, status) => {
        try {
          const response = await axiosInstance.post('/reselleradmin/DeActivateOrActivateCharger', {
            charger_id: chargerId,
            modified_by: userInfo.email_id,
            status: !status,
          });
      
          if (response.status === 200) {
            setAllocatedChargers(prevChargers =>
              prevChargers.map(charger =>
                charger.charger_id === chargerId ? { ...charger, status: !status } : charger
              )
            );
      
             showSuccessAlert(status ? "Deactivated!" : "Activated!");
      
            setTimeout(() => {
              console.log('Timer finished after 10 seconds');
            }, 10000);
          } else {
             showErrorAlert("Error", "Failed to update charger status");
          }
        } catch (error) {
          console.error('Error in updating charger status:', error);
           showErrorAlert("Error", "An error occurred while updating charger status.");
        }
      };
      

    const fetchAllocatedChargerDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post('/reselleradmin/FetchAllocatedCharger', {
                reseller_id: userInfo.reseller_id,
            });
            setAllocatedChargers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching allocated charger details:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userInfo.reseller_id]);
    useEffect(() => {
        if (!fetchAllocatedChargerDetailsCalled.current) {
            fetchAllocatedChargerDetails();
            fetchAllocatedChargerDetailsCalled.current = true;
        }
    }, [fetchAllocatedChargerDetails]);

    return {
        allocatedChargers,
        searchQuery,
        handleSearch,
        filterChargers,
        navigateToViewChargerDetails,
        deactivateCharger,
        isLoading

    };
};

export default useAllocatedDevice;
