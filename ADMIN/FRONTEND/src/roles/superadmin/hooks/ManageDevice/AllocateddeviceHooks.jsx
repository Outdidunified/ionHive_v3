import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../../../utils/utils';
import { showErrorAlert, showSuccessAlert } from '../../../../utils/alert';

const useAllocatedChargers = (userInfo) => {
    const [allocatedChargers, setAllocatedChargers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const fetchAllocatedChargerDetailsCalled = useRef(false);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };
    
    const filterChargers = useCallback(() => {
        return allocatedChargers.filter((charger) =>
            charger.charger_id.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allocatedChargers, searchQuery]);

    const fetchAllocatedChargers = useCallback(() => {
        if (!fetchAllocatedChargerDetailsCalled.current) {
            axiosInstance({
                method: 'get',  
                url: '/superadmin/FetchAllocatedChargers',
            })
                .then((response) => {
                    if (response.data.status === "Success") {
                        setAllocatedChargers(response.data.data || []);
                    } else {
                        showErrorAlert("Error", response.data.message || "Failed to fetch chargers");
                    }
                })
                .catch((error) => {
                    console.error("Fetch error:", error);
                    showErrorAlert("Error", "Something went wrong while fetching chargers");
                })
                .finally(() => setLoading(false));

            fetchAllocatedChargerDetailsCalled.current = true;
        }
    }, []);

    const deactivateCharger = useCallback(async (chargerId, status) => {
        try {
            // Explicitly define POST method in axios configuration
            const response = await axiosInstance({
                method: 'post',  // Explicitly specify method as 'POST'
                url: '/superadmin/DeActivateOrActivateCharger',
                data: {
                    charger_id: chargerId,
                    modified_by: userInfo.email_id,
                    status: !status
                }
            });

            if (response.status === 200) {
                setAllocatedChargers(prev =>
                    prev.map(charger =>
                        charger.charger_id === chargerId
                            ? { ...charger, status: !status }
                            : charger
                    )
                );

                const message = status ? "Charger deactivated successfully." : "Charger activated successfully.";
                showSuccessAlert("Success", message);

                // Optional timeout for side effect/logging
                setTimeout(() => {
                    console.log('Timer finished after 10 seconds');
                }, 10000);
            } else {
                showErrorAlert("Error", "Failed to update charger status.");
            }
        } catch (error) {
            console.error('Error updating charger status:', error);
            showErrorAlert("Error", "An error occurred while updating charger status.");
        }
    }, [userInfo.email_id]);

    useEffect(() => {
        fetchAllocatedChargers();
    }, [fetchAllocatedChargers]);

    return {
        allocatedChargers,
        filterChargers,
        handleSearch,
        deactivateCharger,
        searchQuery,
        loading
    };
};

export default useAllocatedChargers;
