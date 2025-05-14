import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';
import {
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert
  } from '../../../../utils/alert'; 

const useCreateUser = (userInfo) => {
    const [newUser, setNewUser] = useState({
        username: '', phone_no: '', email_id: '', role_id: '', password: '', role_name: '', client_name: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [userRoles, setUserRoles] = useState([]);
    const [assname, setAssName] = useState([]);
    const navigate = useNavigate();
    const fetchUsersRoleAssNameCalled = useRef(false); 
    const [loading,setLoading]=useState(false)

    // Fetch user roles
    const fetchUserRoles = async () => {
        try {
            const response = await axiosInstance({method:'get',url:'/clientadmin/FetchSpecificUserRoleForSelection',});
            if (response.data.status === 'Success') {
                setUserRoles(response.data.data);
            } else {
                console.error('Failed to fetch user roles:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching user roles:', error);
        }
    };

    // Fetch association names
    const fetchAssociationNames = useCallback(async () => {
        try {
            const response = await axiosInstance({method:'post',url:'/clientadmin/FetchAssociationForSelection', data:{
                client_id: userInfo.client_id,
            }});

            if (response.data.status === 'Success') {
                setAssName(response.data.data);
            } else {
                console.error('Failed to fetch association names:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching association names:', error);
        }
    }, [userInfo.client_id]);
    
    useEffect(() => {
        if (!fetchUsersRoleAssNameCalled.current) {
            fetchUserRoles();
            fetchAssociationNames();
            fetchUsersRoleAssNameCalled.current = true;
        }
    }, [fetchAssociationNames]);

    // create users
   
      const createUser = async (e) => {
        e.preventDefault();
      
        const phoneRegex = /^\d{10}$/;
        const passwordRegex = /^\d{4}$/;
      
        if (!newUser.phone_no) {
          showWarningAlert('Validation Error', "Phone can't be empty.");
          return;
        }
      
        if (!phoneRegex.test(newUser.phone_no)) {
          showWarningAlert('Validation Error', 'Oops! Phone must be a 10-digit number.');
          return;
        }
      
        if (!newUser.password) {
          showWarningAlert('Validation Error', "Password can't be empty.");
          return;
        }
      
        if (!passwordRegex.test(newUser.password)) {
          showWarningAlert('Validation Error', 'Oops! Password must be a 4-digit number.');
          return;
        }
      
        try {
          setLoading(true)
          const selectedRole = userRoles.find(role => role.role_name === newUser.role_name);
          const selectedAssociation = assname.find(association => association.association_name === newUser.client_name);
      
          const formattedUserData = {
            username: newUser.username,
            phone_no: parseInt(newUser.phone_no),
            email_id: newUser.email_id,
            password: parseInt(newUser.password),
            role_id: selectedRole ? selectedRole.role_id : '',
            association_id: selectedAssociation ? selectedAssociation.association_id : '',
            created_by: userInfo.data.email_id,
            client_id: userInfo.data.client_id,
            reseller_id: userInfo.data.reseller_id
          };
      
          const response = await axiosInstance({method:'post',url:'/clientadmin/CreateUser', data:formattedUserData});
      
          if (response.status === 200) {
             showSuccessAlert('User created successfully');
            createUserBack(); // navigate or reset form
          } else {
            const responseData = response.data;
            showErrorAlert('Failed to add user', responseData.message || '');
          }
        } catch (error) {
          if (error.response && error.response.data && error.response.data.message) {
            showErrorAlert('Failed to create user', error.response.data.message);
          } else {
            console.error('Error creating user:', error);
            showErrorAlert('Error', 'Failed to create user. Please try again.');
          }
        }finally{
          setLoading(false)
        }
      };
      

    // back page
    const goBack = () => {
        navigate(-1);
    };

    // back manage users 
    const createUserBack = () => {
        navigate('/clientadmin/ManageUsers');
    };
return {
    newUser,
    setNewUser,
    errorMessage,
    setErrorMessage,
    userRoles,
     setUserRoles,
    assname, setAssName,
    fetchUsersRoleAssNameCalled,
    fetchUserRoles,
    fetchAssociationNames,
    createUser,goBack
    ,createUserBack,loading
}}
export default useCreateUser;