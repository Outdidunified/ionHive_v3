import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { showSuccessAlert, showErrorAlert } from '../../../../utils/alert';

import axiosInstance from '../../../../utils/utils';

const useAssignTagID = (userInfo) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredData] = useState([]);
    const [posts, setPosts] = useState([]);
    const fetchUserRoleCalled = useRef(false);
    const [newUser, setNewUser] = useState({
        user_id: '', tag_id: '', _id: '',
    });

    useEffect(() => {
        const { dataItem } = location.state || {};
        if (dataItem) {
            setNewUser({
                user_id: dataItem.user_id || '',  tag_id: dataItem.tag_id || '', _id: dataItem._id || '',
            });
        // Save to localStorage
        localStorage.setItem('userData', JSON.stringify(dataItem));
        } else {
            // Load from localStorage if available
            const savedData = JSON.parse(localStorage.getItem('userData'));
            if (savedData) {
                setNewUser(savedData);
            }
        }
    }, [location]);
    // Fetch Tagid

  const fetchTagID = useCallback(async () => {
    try {
        const res = await axiosInstance({
            method: 'post',
            url: '/associationadmin/FetchTagIdToAssign',
            data: {
                association_id: userInfo.association_id,
                user_id: userInfo.user_id
            }
        });

        setLoading(false);

        if (res.data) {
            if (res.data.status === 'Success') {
                if (Array.isArray(res.data.data)) {
                    const currentDate = new Date();
                    const tagIDdata = res.data.data.filter((item) => {
                        const expiryDate = new Date(item.tag_id_expiry_date);
                        return expiryDate >= currentDate;
                    });

                    setData(tagIDdata);
                    setError(null);
                } else {
                    setError('Unexpected response format.');
                    setData([]);
                }
            } else if (
                res.data.status === 'Failed' &&
                res.data.message === 'No tags found'
            ) {
                setError(null); // Don't show error
                setData([]);    // Still set empty data
            } else {
                setError('Error fetching data. Please try again.');
                setData([]);
            }
        } else {
            setError('Unexpected response structure.');
        }
    } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching data. Please try again.');
        setLoading(false);
    }
}, [userInfo.association_id, userInfo.user_id]);

    

    useEffect(() => {
        if (!fetchUserRoleCalled.current) {
            fetchTagID();
            fetchUserRoleCalled.current = true;
        }
    }, [fetchTagID]);

    // Search data 
    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value.toUpperCase();
        if (Array.isArray(data)) {
            const filteredData = data.filter((item) =>
                item.tag_id.toUpperCase().includes(inputValue)
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

    // Timestamp data 
    function formatTimestamp(originalTimestamp) {
        const date = new Date(originalTimestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        hours = String(hours).padStart(2, '0');

        const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
        return formattedDate;
    }

    const goBack = () => {
        navigate(-1);
    };


const handleAssignTagID = async (dataItem) => {
    try {
        const response = await axiosInstance({method:'post',url:'/associationadmin/AssignTagIdToUser', data:{
            user_id: newUser.user_id, 
            tag_id: dataItem.tag_id, 
            modified_by: userInfo.email_id
        }});

        if (response.status === 200) {
            showSuccessAlert("Assign TagID successfully", "TagID assigned to user successfully");
            fetchTagID();
            backManageUserPage();
        } else {
            const responseData = response.data;
            showErrorAlert("Error", "Failed to assign TagID, " + responseData.message);
        }
    } catch (error) {
        showErrorAlert("Error", "An error occurred while assigning TagID");
    }
};

    

    // Back manageuser page
    const backManageUserPage = () => {
        navigate('/associationadmin/Assignuser');
    };

    return {
        data, setData,
        loading, setLoading,
        error,setError,
        filteredData,
        posts,setPosts,
        fetchUserRoleCalled,
        newUser,setNewUser,
        fetchTagID,
        handleSearchInputChange,
        formatTimestamp,goBack,
        handleAssignTagID,
        backManageUserPage
    }}
    export default useAssignTagID;