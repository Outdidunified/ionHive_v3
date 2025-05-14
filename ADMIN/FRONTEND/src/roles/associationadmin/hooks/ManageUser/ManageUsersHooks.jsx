import React, { useState, useEffect, useRef, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';

const useManageUsers = (userInfo) => {
    const navigate = useNavigate();
    // View user list
    const handleViewUser = (dataItem) => {
        navigate('/associationadmin/ViewManageUser', { state: { dataItem } });
    };
   
    const fetchUsersCalled = useRef(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredData] = useState([]);
    const [posts, setPosts] = useState([]);

    // Get user data
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            const response = await axiosInstance({method:'post',url:'/associationadmin/FetchUsers', data:{
                association_id: userInfo.association_id,
            }});

            if (response.status === 200) {
                const data = response.data.data;
                setData(data || []);
                setLoading(false);
            } else {
                console.error('Error fetching users');
                setData([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data. Please try again.');
        }finally{
            setLoading(false)
        }
    }, [userInfo.association_id]);

    useEffect(() => {
        if (!fetchUsersCalled.current) {
            fetchUsers();
            fetchUsersCalled.current = true;
        }
    }, [fetchUsers]);
    // }, [updateTrigger, fetchUsers]);

    // Search data 
    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value.toUpperCase();
        if (Array.isArray(data)) {
            const filteredData = data.filter((item) =>
                item.username.toUpperCase().includes(inputValue)
            );
            setPosts(filteredData);
        }
    };

    // Update table data 'data', and 'filteredData' 
    useEffect(() => {
        switch (data) {
            case 'filteredData':
                setPosts(filteredData);
                break;
            default:
                setPosts(data);
                break;
        }
    }, [data, filteredData]);


    return {
        data, setData,
        loading, setLoading,
        error, setError,
        filteredData,
        posts, setPosts,handleSearchInputChange,
        fetchUsers,handleViewUser,
    }}
    export default useManageUsers;