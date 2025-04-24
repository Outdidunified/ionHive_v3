import React, { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../../../utils/utils';
import { useNavigate } from 'react-router-dom';


const useUnallocateddevice = (userInfo) => {
    const navigate = useNavigate();
    const [unallocatedChargers, setUnallocatedChargers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // search
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };
    const filterChargers = (chargers) => {
        return chargers.filter((charger) =>
            charger.charger_id.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    // view unalloc page
    const navigateToViewChargerDetails = (charger) => {
        navigate('/reselleradmin/ViewUnalloc', { state: { charger } });
    };

    const fetchUnAllocatedChargerDetailsCalled = useRef(false); 

    // fetch UnAllocated Charger
    const fetchUnAllocatedChargerDetails = useCallback(async () => {
        try {
            setIsLoading(true); 
            const response = await axiosInstance.post('/reselleradmin/FetchUnAllocatedCharger', {
                reseller_id: userInfo.reseller_id,
            });
            setUnallocatedChargers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching unallocated charger details:', error);
        } finally {
            setIsLoading(false); 
        }
    }, [userInfo.reseller_id]);
    useEffect(() => {
        if (!fetchUnAllocatedChargerDetailsCalled.current) {
            fetchUnAllocatedChargerDetails();
            fetchUnAllocatedChargerDetailsCalled.current = true; // Mark fetchUnAllocatedChargerDetails as called
        }
    }, [fetchUnAllocatedChargerDetails]); //// Include fetchUnAllocatedChargerDetails in dependency array

    // View assign client page
    const handleAssignAssigntoclients = () => {
        navigate('/reselleradmin/Assigntoclients');
    };

    return {
        unallocatedChargers, setUnallocatedChargers,
        searchQuery, setSearchQuery,
        handleSearch,
        filterChargers,
        navigateToViewChargerDetails,
        fetchUnAllocatedChargerDetails,
        handleAssignAssigntoclients,isLoading

    }}
    export default useUnallocateddevice;