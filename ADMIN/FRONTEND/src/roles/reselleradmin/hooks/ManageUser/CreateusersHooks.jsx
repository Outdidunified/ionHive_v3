import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { showErrorAlert,showSuccessAlert } from '../../../../utils/alert';
import axiosInstance from '../../../../utils/utils';

const usecreateUser = (userInfo) => {
    const [newUser, setNewUser] = useState({
        username: '', phone_no: '', email_id: '', role_id: '', password: '', role_name: '', client_name: '', 
    });
    const [isLoading, setIsLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');
    const [userRoles, setUserRoles] = useState([]);
    const [clientNames, setClientNames] = useState([]);
    const navigate = useNavigate();
    const fetchUsersRoleClientNameCalled = useRef(false); 

    // fetch user roles
    const fetchUserRoles = useCallback(async () => {
        try {
            const response = await axiosInstance({method:'get',url:'/reselleradmin/FetchSpecificUserRoleForSelection'});
            if (response.data.status === 'Success') {
                setUserRoles(response.data.data);
            } else {
                console.error('Failed to fetch user roles:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching user roles:', error);
        }
    }, []);

    // fetch client names
    const fetchClientNames = useCallback(async () => {
        try {
            const response = await axiosInstance({method:'post',url:'/reselleradmin/FetchClientForSelection', data:{
                reseller_id: userInfo.reseller_id,
            }});

            if (response.data.status === 'Success') {
                setClientNames(response.data.data);
            } else {
                console.error('Failed to fetch client names:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching client names:', error);
        }
    }, [userInfo.reseller_id]);

   
    useEffect(() => {
        if (!fetchUsersRoleClientNameCalled.current) {
            fetchUserRoles();
            fetchClientNames();
            fetchUsersRoleClientNameCalled.current = true;
        }
    }, [fetchUserRoles, fetchClientNames]);
   
    // create users

    const createUser = async (e) => {
        e.preventDefault();
    
        setIsLoading(true); // Start loading
    
        // Validate phone number
        const phoneRegex = /^\d{10}$/;
        if (!newUser.phone_no) {
            setErrorMessage("Phone can't be empty.");
            setIsLoading(false);
            return;
        }
        if (!phoneRegex.test(newUser.phone_no)) {
            setErrorMessage('Oops! Phone must be a 10-digit number.');
            setIsLoading(false);
            return;
        }
    
        // Validate password
        const passwordRegex = /^\d{4}$/;
        if (!newUser.password) {
            setErrorMessage("Password can't be empty.");
            setIsLoading(false);
            return;
        }
        if (!passwordRegex.test(newUser.password)) {
            setErrorMessage('Oops! Password must be a 4-digit number.');
            setIsLoading(false);
            return;
        }
    
        try {
            const selectedRole = userRoles.find(role => role.role_name === newUser.role_name);
            const selectedClient = clientNames.find(client => client.client_name === newUser.client_name);
    
            const formattedUserData = {
                username: newUser.username,
                phone_no: parseInt(newUser.phone_no),
                email_id: newUser.email_id,
                password: parseInt(newUser.password),
                role_id: selectedRole ? selectedRole.role_id : '',
                client_id: selectedClient ? selectedClient.client_id : '',
                created_by: userInfo.email_id,
                reseller_id: userInfo.reseller_id,
            };
    
            const response = await axiosInstance({method:'post',url:'/reselleradmin/CreateUser', data:formattedUserData});
    
            if (response.status === 200 && response.data.status === "Success") {
                 showSuccessAlert("User created successfully");
                navigate('/reselleradmin/ManageUsers');
            } else {
                 showErrorAlert("Failed to create user. Please try again. " + (response.data.message || ''));
            }
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.response?.data?.message) {
                setErrorMessage('Failed to create user, ' + error.response.data.message);
            } else {
                 showErrorAlert("Failed to create user. Please try again.");
            }
        } finally {
            setIsLoading(false); // Stop loading
        }
    };
    
    

    // back manage users
    const goBack = () => {
        navigate('/reselleradmin/ManageUsers');
    };

    return {
        newUser, setNewUser,isLoading,
        errorMessage, setErrorMessage,
        fetchUserRoles,
        fetchClientNames,
        createUser,
        goBack,userRoles, setUserRoles,clientNames, setClientNames
    }}
    export default usecreateUser;