import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';

const useManageclient = (userInfo) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const fetchUsersCalled = useRef(false);
    const [loading, setLoading] = useState(true); 

    const fetchUsers = async () => {
        setLoading(true); 
        try {
            const response = await axiosInstance({method:'post',url:'/reselleradmin/getAllClients', data:{
                reseller_id: userInfo.reseller_id
            }});
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!fetchUsersCalled.current && userInfo.reseller_id) {
            fetchUsers();
            fetchUsersCalled.current = true;
        }
    }, [userInfo.reseller_id]);

    const navigateToCreateUser = () => {
        navigate('/reselleradmin/CreateClients');
    };

    const navigateToViewClient = (user) => {
        navigate('/reselleradmin/viewclient', { state: { user } });
    };

    const navassignedtoass = (client_id) => {
        navigate('/reselleradmin/Assigntoass', { state: { client_id } });
    };

    const navtoassdev = (client_id) => {
        navigate('/reselleradmin/Assigneddevicesclient', { state: { client_id } });
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredUsers = users.filter((user) => {
        const searchFields = ['client_name'];
        return searchFields.some((field) =>
            user[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return {
        fetchUsers,              
        users,
        setUsers,
        navigateToCreateUser,
        navigateToViewClient,
        navassignedtoass,
        navtoassdev,
        handleSearch,
        setSearchQuery,
        searchQuery,
        filteredUsers,
        loading
    };
};

export default useManageclient;
