import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';

const useManageAssociation = (userInfo) => {
    const navigate = useNavigate();
    const [associations, setAssociations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const fetchUsersCalled = useRef(false);
    const [loading,setLoading]=useState(true);

    // Search handlers
    const handleSearch = (e) => setSearchQuery(e.target.value);
    const filterAssociations = (list) =>
        list.filter((a) =>
            a.association_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance({method:'post',url:'/clientadmin/FetchAssociationUser', data:{
                client_id: userInfo.client_id
            }});
            setAssociations(response.data.data || []);
            console.log(response.data.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setAssociations([]);
        }finally{
            setLoading(false)
        }
    };

    useEffect(() => {
        if (!fetchUsersCalled.current && userInfo.client_id) {
            fetchUsers();
            fetchUsersCalled.current = true;
        }
    }, [userInfo.client_id]);

    // Navigation functions
    const navigateToViewAssociationDetails = (association) => {
        navigate('/clientadmin/ViewAss', { state: { association } });
    };

    const navtocreateass = () => {
        navigate('/clientadmin/Createass');
    };

    const navigatetochargerdetails = (association_id) => {
        navigate('/clientadmin/Assigneddevass', { state: { association_id } });
    };

    return {
        associations, setAssociations,
        searchQuery, setSearchQuery,
        handleSearch, filterAssociations,
        fetchUsers,
        navigateToViewAssociationDetails,
        navtocreateass,
        navigatetochargerdetails,loading
    };
};

export default useManageAssociation;
