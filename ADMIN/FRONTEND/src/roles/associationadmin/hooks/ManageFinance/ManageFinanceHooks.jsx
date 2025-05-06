import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';

const useManagefinance = (userInfo) => {
    const navigate = useNavigate();
    const [financeDetails, setFinanceDetails] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const fetchUsersCalled = useRef(false); 
    const [loading,setLoading]=useState(true)
    console.log(financeDetails);
    // fetch finance details
    const fetchFinanceDetails = useCallback(async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.post('/associationadmin/fetchFinance', {
                association_id: userInfo.association_id
            });
          
            if (response.status === 200) {
                setFinanceDetails(response.data.data || []);
            } else {
                const data = response.data.data;
                console.error('Error fetching finance: ', data);
                setFinanceDetails([]);
            }
        } catch (error) {
            console.error('Error fetching finance:', error);
            setFinanceDetails([]);
        }finally{
            setLoading(false)
        }
    }, [userInfo.association_id]);

    useEffect(() => {
        if (!fetchUsersCalled.current) {
            fetchFinanceDetails();
            fetchUsersCalled.current = true;
        }
    }, [fetchFinanceDetails]);

    // search
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };
    // Filtered finance details based on search query
    const filteredFinanceDetails = Array.isArray(financeDetails) ? financeDetails.filter((finance) => {
        const searchFields = ['totalprice', 'eb_charge', 'margin', 'convenience_fee', 'parking_fee', 'processing_fee', 'service_fee', 'station_fee'];
        return searchFields.some((field) =>
            finance[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
    }) : [];
    


    // view finance page
    const handleView = (finance) => {
        navigate('/associationadmin/ViewFinance', { state: { finance } });
    };

    // view create finance page
    const navigateToCreateUser = () => {
        navigate('/associationadmin/CreateFinance');
    };

    return {
        financeDetails, setFinanceDetails,
        searchQuery, setSearchQuery,
        fetchUsersCalled,
        fetchFinanceDetails,
        handleSearch,
        filteredFinanceDetails,
        handleView,navigateToCreateUser,loading
    }}
    export default useManagefinance;