import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';

const useManageUsers = (userInfo) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const fetchUsersCalled = useRef(false); 
    const [loading,setLoading]=useState(true)

    // fetch users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)

            const response = await axiosInstance({method:'post',url:'/clientadmin/FetchUsers', data:{
                client_id: userInfo.client_id,
            }});

            if (response.status === 200) {
                const data = response.data.data;
                setUsers(data || []);
            } else {
                const data = response.data.data;
                console.error('Error fetching users: ', data);
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        }finally{
            setLoading(false)
        }
    }, [userInfo.client_id]);

    useEffect(() => {
        if (!fetchUsersCalled.current) {
            fetchUsers();
            fetchUsersCalled.current = true;
        }
    }, [fetchUsers]); // Add fetchUsers to the dependency array

  
    // view createuser
    const navigateToCreateUser = () => {
        navigate('/clientadmin/Createuser');
    };

    // view user page
    const navigateToViewSession = (user) => {
        navigate('/clientadmin/Viewuser', { state: { user } });
    };

    // search
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
        users,
        setUsers,
        loading,
        searchQuery,setSearchQuery,
        fetchUsersCalled,
        fetchUsers,
        navigateToCreateUser,
        navigateToViewSession,handleSearch,filteredUsers
    }}
    export default useManageUsers;