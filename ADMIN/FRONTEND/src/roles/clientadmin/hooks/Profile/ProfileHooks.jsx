import React, { useEffect, useState, useCallback, useRef } from 'react';
import axiosInstance from '../../../../utils/utils';
import {
    showSuccessAlert,
    showErrorAlert,
  } from '../../../../utils/alert';
  
const useProfile = (userInfo) => {
    const [data, setPosts] = useState({});
    const [username, setUserUname] = useState('');
    const [email_id, setUserEmail] = useState('');
    const [phone_no, setUserPhone] = useState('');
    const [password, setUserPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorMessages, setErrorMessages] = useState('');
    const [dataAss, setPostsAss] = useState({});
    const [client_name, setUpdateUname] = useState('');
    const [client_email_id, setUpdateEmail] = useState('');
    const [client_phone_no, setUpdatePhone] = useState('');
    const [client_address, setUpdateAddress] = useState('');
    const fetchProfileCalled = useRef(false); // Ref to track if fetchProfile has been called

    // Store initial values
    const [initialClientData, setInitialClientData] = useState({});
    const [initialUserData, setInitialUserData] = useState({});

    // Store whether any changes have been made
    const [clientModified, setClientModified] = useState(false);
    const [userModified, setUserModified] = useState(false);
    const [loading,setLoading]=useState(false)
    const [isloading,setIsLoading]=useState(false)
    // Define fetchClientUserDetails using useCallback to memoize it
    const fetchClientUserDetails = useCallback(async () => {
        try {
            const response = await axiosInstance({method:'post',url:'/clientadmin/FetchUserProfile', data:{
                user_id: userInfo.user_id,
            }});

            if (response.status === 200) {
                const data = response.data.data;
                setPosts(data);
                const clientDetails = data.client_details[0] || {};
                setPostsAss(clientDetails);
                // Set initial values
                setInitialClientData(clientDetails);
                setInitialUserData(data);
            } else {
                setErrorMessage('Failed to fetch profile');
                console.error('Failed to fetch profile:', response.statusText);
            }
        } catch (error) {
            setErrorMessage('An error occurred while fetching the profile');
            console.error('Error:', error);
        }
    }, [userInfo.user_id]);

    useEffect(() => {
        if (!fetchProfileCalled.current && userInfo  && userInfo.user_id) {
            fetchClientUserDetails();
            fetchProfileCalled.current = true; // Mark fetchClientUserDetails as called
        }
    }, [fetchClientUserDetails, userInfo]);

    // Client profile
    useEffect(() => {
        if (dataAss) {
            setUpdateUname(dataAss.client_name || '');
            setUpdateEmail(dataAss.client_email_id || '');
            setUpdatePhone(dataAss.client_phone_no || '');
            setUpdateAddress(dataAss.client_address || '');
        }
    }, [dataAss]);

    useEffect(() => {
        // Normalize values to string before comparing
        setClientModified(
            client_name !== initialClientData.client_name ||
            client_email_id !== initialClientData.client_email_id ||
            client_phone_no.toString() !== (initialClientData.client_phone_no || '').toString() ||
            client_address !== initialClientData.client_address
        );
    
        setUserModified(
            username !== initialUserData.username ||
            phone_no.toString() !== (initialUserData.phone_no || '').toString() ||
            password.toString() !== (initialUserData.password || '').toString()
        );
    }, [
        client_name, client_email_id, client_phone_no, client_address,
        username, phone_no, password,
        initialClientData, initialUserData
    ]);
    
    // Set timeout
    useEffect(() => {
        if (errorMessage) {
            const timeout = setTimeout(() => setErrorMessage(''), 5000); // Clear error message after 5 seconds
            return () => clearTimeout(timeout);
        }
        if (errorMessages) {
            const timeout = setTimeout(() => setErrorMessages(''), 5000); // Clear error message after 5 seconds
            return () => clearTimeout(timeout);
        }
    }, [errorMessage, errorMessages]);

    
      
      const addClientProfileUpdate = async (e) => {
        e.preventDefault();
      
        const phoneRegex = /^\d{10}$/;
        if (!client_phone_no) {
          setErrorMessages("Phone can't be empty.");
          return;
        }
        if (!phoneRegex.test(client_phone_no)) {
          setErrorMessages('Oops! Phone must be a 10-digit number.');
          return;
        }
      
        try {
          setLoading(true);
          const phoneNos = parseInt(client_phone_no);
      
          const response = await axiosInstance({method:'post',url:'/clientadmin/UpdateClientProfile', data:{
            client_id: userInfo.client_id,
            client_name,
            client_address,
            client_phone_no: phoneNos,
            modified_by: userInfo.email_id,
          }});
      
          if (response.status === 200) {
            showSuccessAlert('Client profile updated successfully');
            fetchClientUserDetails();
          } else {
            const responseData = await response.json();
            showErrorAlert('Failed to update client profile', responseData?.message || '');
          }
        } catch (error) {
          showErrorAlert('Error', 'An error occurred while updating the client profile');
        } finally {
          setLoading(false);
        }
      };
      

    // User profile update
    useEffect(() => {
        if (data) {
            setUserUname(data.username || '');
            setUserEmail(data.email_id || '');
            setUserPhone(data.phone_no || '');
            setUserPassword(data.password || '');
        }
    }, [data]);

    // update user profile
    const addUserProfileUpdate = async (e) => {
        e.preventDefault();
      
        const phoneRegex = /^\d{10}$/;
        if (!phone_no) {
          setErrorMessage("Phone can't be empty.");
          return;
        }
        if (!phoneRegex.test(phone_no)) {
          setErrorMessage('Oops! Phone must be a 10-digit number.');
          return;
        }
      
        const passwordRegex = /^\d{4}$/;
        if (!password) {
          setErrorMessage("Password can't be empty.");
          return;
        }
        if (!passwordRegex.test(password)) {
          setErrorMessage('Oops! Password must be a 4-digit number.');
          return;
        }
      
        try {
          setIsLoading(true);
          const phoneNo = parseInt(phone_no);
          const Password = parseInt(password);
      
          const response = await axiosInstance({method:'post',url:'/clientadmin/UpdateUserProfile', data:{
            user_id: userInfo.user_id,
            username,
            phone_no: phoneNo,
            password: Password,
          }});
      
          if (response.status === 200) {
            showSuccessAlert('User profile updated successfully');
            fetchClientUserDetails();
          } else {
            const responseData = await response.json();
            showErrorAlert('Failed to update user profile', responseData?.message || '');
          }
        } catch (error) {
          showErrorAlert('Error', 'An error occurred while updating the user profile');
        } finally {
          setIsLoading(false);
        }
      };
      

    return {
        data, setPosts,
        username, setUserUname,
        email_id, setUserEmail,
        phone_no, setUserPhone,
        password, setUserPassword,
        errorMessage, setErrorMessage,
        errorMessages, setErrorMessages,
        dataAss, setPostsAss,
        client_name, setUpdateUname,
        client_email_id, setUpdateEmail,
        client_phone_no, setUpdatePhone,
        client_address, setUpdateAddress,
        fetchProfileCalled,
        initialClientData, setInitialClientData,
        initialUserData, setInitialUserData,
        clientModified, setClientModified,
        userModified, setUserModified,
        fetchClientUserDetails,
        addClientProfileUpdate,
        addUserProfileUpdate,isloading,loading
    }}
    export default useProfile;