import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';

const useManageUsers = (userInfo ) => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const fetchUsersCalled = useRef(false); 
    const [isLoading, setIsLoading] = useState(true);


    // Define fetchUsers using useCallback to memoize it
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance({method:'post',url:'/reselleradmin/FetchUsers', data:{
                reseller_id: userInfo.reseller_id,
            }});
    
            if (response.status === 200) {
                const data = response.data.data;
                setUsers(data || []);
            } else {
                console.error('Error fetching users');
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [userInfo.reseller_id]);
    

    useEffect(() => {
        if (!fetchUsersCalled.current && userInfo && userInfo.reseller_id) {
            fetchUsers();
            fetchUsersCalled.current = true; // Mark fetchResellerUserDetails as called
        }
    }, [fetchUsers, userInfo]);
    
    // back create users
    const navigateToCreateUser = () => {
        navigate('/reselleradmin/Createusers');
    };

    // view user page
    const navigateToViewSession = (user) => {
        navigate('/reselleradmin/Viewuser', { state: { user } });
    };

    // search users
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredUsers = users.filter((user) => {
        const searchFields = ['username'];
        return searchFields.some((field) =>
            user[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return {
        users, setUsers,
        searchQuery, setSearchQuery,
        fetchUsers,
        navigateToCreateUser,
        navigateToViewSession,
        handleSearch,
        filteredUsers,
        isLoading
    }}
    export  default useManageUsers;