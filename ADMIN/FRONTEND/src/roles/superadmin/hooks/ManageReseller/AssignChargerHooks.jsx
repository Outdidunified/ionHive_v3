import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../../utils/utils';
const useAssignCharger = (dataItem) => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const FetchChargerDetailsWithSessionCalled = useRef(false);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const fetchAssignedClients = async () => {
            setIsLoading(true); // Start loading
            try {
                const response = await axiosInstance({method:'post',url:'/superadmin/FetchChargerDetailsWithSession', data:{
                    reseller_id: dataItem.reseller_id
                }});
    
                if (response.data.success) {
                    setData(response.data.data);
                    setFilteredData(response.data.data);
                } else {
                    console.error('Failed to fetch assigned chargers');
                }
                
            } catch (error) {
                console.error('An error occurred while fetching assigned chargers');
                console.error('Error:', error);
            } finally {
                setIsLoading(false); // End loading
            }
        };
    
        if (!FetchChargerDetailsWithSessionCalled.current && dataItem && dataItem.reseller_id) {
            fetchAssignedClients();
            FetchChargerDetailsWithSessionCalled.current = true;
        }
    }, [dataItem]);
    

    // Search functionality
    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value.toUpperCase();
        const filteredData = data.filter((item) =>
            item.chargerID.toUpperCase().includes(inputValue)
        );
        setFilteredData(filteredData);
    };

    return { data, filteredData, handleSearchInputChange ,isLoading};
};

export default useAssignCharger;
