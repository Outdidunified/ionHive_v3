import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';

const useUnallocateddevice = (userInfo) => {
    const navigate = useNavigate();
    const [unallocatedChargers, setUnallocatedChargers] = useState([]);
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
        navigate('/clientadmin/ViewUnalloc', { state: { charger } });
    };

    const fetchUnAllocatedChargerDetailsCalled = useRef(false); 

    // fetch unallocated chargers
    const fetchUnAllocatedChargerDetails = useCallback(async () => {
        if (!userInfo || !userInfo.client_id) return;
    
        try {
         setLoading(true)
            const response = await axiosInstance({method:'post',url:'/clientadmin/FetchUnAllocatedCharger',data: {
                client_id: userInfo.client_id,
            }});
            setUnallocatedChargers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching unallocated charger details:', error);
        }finally{
            setLoading(false)
        }
    }, [userInfo]);
    

    useEffect(() => {
        if (!fetchUnAllocatedChargerDetailsCalled.current) {
            fetchUnAllocatedChargerDetails();
            fetchUnAllocatedChargerDetailsCalled.current = true; // Mark fetchUnAllocatedChargerDetails as called
        }
    }, [fetchUnAllocatedChargerDetails]); //// Include fetchUnAllocatedChargerDetails in dependency array

    // View assign client page
    const handleAssignAssociation = () => {
        navigate('/clientadmin/AssigntoAssociation');
    };

    return {
        unallocatedChargers,
        setUnallocatedChargers,
        searchQuery,setSearchQuery,
        handleSearch,
filterChargers,
navigateToViewChargerDetails,
fetchUnAllocatedChargerDetailsCalled,fetchUnAllocatedChargerDetails,
handleAssignAssociation,loading
    }}
    export default useUnallocateddevice;