import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../../../utils/utils';
import { showSuccessAlert, showErrorAlert } from '../../../../utils/alert';


const useProfile = (userInfo) => {
    const [loading,setLoading]=useState(false)
    const [isloading,setIsLoading]=useState(false)
    const [data, setPosts] = useState({});
    const [username, setUserUname] = useState('');
    const [email_id, setUserEmail] = useState('');
    const [phone_no, setUserPhone] = useState('');
    const [password, setUserPassword] = useState('');
    const [errorMessageAss, setErrorMessageAss] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [dataAss, setPostsAss] = useState({});
    const [association_name, setUpdateUname] = useState('');
    const [association_email_id, setUpdateEmail] = useState('');
    const [association_phone_no, setUpdatePhone] = useState('');
    const [association_address, setUpdateAddress] = useState('');

    const fetchProfileCalled = useRef(false); // Ref to track if fetchProfile has been called

    // Store initial values
    const [initialAssociationData, setInitialAssociationData] = useState({});
    const [initialUserData, setInitialUserData] = useState({});
  
    // Store whether any changes have been made
    const [associationModified, setAssociationModified] = useState(false);
    const [userModified, setUserModified] = useState(false);
     
    // get profile data
    const fetchProfile = useCallback(async () => {
        try {
            const response = await axiosInstance({method:'post',url:'/associationadmin/FetchUserProfile', data:{
                user_id: userInfo.user_id 
            }})

            if (response.status==200) {
                const data = response.data
                setPosts(data.data);
                const associationDetails = data.data.association_details[0] || {};
                setPostsAss(associationDetails);
                setInitialAssociationData(associationDetails);
                setInitialUserData(data.data);
            } else {
                setErrorMessage('Failed to fetch profile, ' + response.statusText); 
                console.error('Failed to fetch profile:', response.statusText); 
            }
        } catch (error) {
            setErrorMessage('An error occurred while fetching the profile');
            console.error('Error:', error);
        }
    }, [userInfo]);

    useEffect(() => {
        if (!fetchProfileCalled.current && userInfo && userInfo.user_id) {
            fetchProfile();
            fetchProfileCalled.current = true; // Mark fetchProfile as called
        }
    }, [fetchProfile, userInfo]);
   
    // Association profile
    useEffect(() => {
        if (dataAss) {
            setUpdateUname(dataAss.association_name || '');
            setUpdateEmail(dataAss.association_email_id || '');
            setUpdatePhone(dataAss.association_phone_no || '');
            setUpdateAddress(dataAss.association_address || '');
        }
    }, [dataAss]);

    // Set timeout
    useEffect(() => {
        if (errorMessage) {
            const timeout = setTimeout(() => setErrorMessage(''), 5000); // Clear error message after 5 seconds
            return () => clearTimeout(timeout);
        }
    }, [errorMessage]);

    // Set timeout
    useEffect(() => {
        if (errorMessageAss) {
            const timeout = setTimeout(() => setErrorMessageAss(''), 5000); // Clear error message after 5 seconds
            return () => clearTimeout(timeout);
        }
    }, [errorMessageAss]);


    const addAssProfileUpdate = async (e) => {
        e.preventDefault();
    
        // Validate phone number
        const phoneRegex = /^\d{10}$/;
        if (!association_phone_no) {
            setErrorMessageAss("Phone can't be empty.");
            return;
        }
        if (!phoneRegex.test(association_phone_no)) {
            setErrorMessageAss('Oops! Phone must be a 10-digit number.');
            return;
        }
    
        try {
            setLoading(true);
    
            const phoneNos = parseInt(association_phone_no);
            const response = await axiosInstance({method:'post',url:'/associationadmin/UpdateAssociationProfile', data:{
                association_id: userInfo.association_id,
                association_address,
                association_phone_no: phoneNos,
                modified_by: userInfo.email_id
            }});
    
            if (response.status === 200) {
                showSuccessAlert('Association profile updated successfully');
                fetchProfile();
            } else {
                const responseData = response.data;
                showErrorAlert('Error', 'Failed to update association profile, ' + responseData.message);
            }
        } catch (error) {
            showErrorAlert('Error', 'An error occurred while updating the association profile');
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


    const addUserProfileUpdate = async (e) => {
        e.preventDefault();
    
        // Validate phone number
        const phoneRegex = /^\d{10}$/;
        if (!phone_no) {
            setErrorMessage("Phone can't be empty.");
            return;
        }
        if (!phoneRegex.test(phone_no)) {
            setErrorMessage('Oops! Phone must be a 10-digit number.');
            return;
        }
    
        // Validate password
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
            const response = await axiosInstance({method:'post',url:'/associationadmin/UpdateUserProfile', data:{
                user_id: userInfo.user_id,
                username,
                phone_no: phoneNo,
                password: Password
            }});
    
            if (response.status === 200) {
                showSuccessAlert("User profile updated successfully");
                fetchProfile();
            } else {
                const responseData = response.data;
                showErrorAlert("Error", "Failed to update user profile, " + responseData.message);
            }
        } catch (error) {
            showErrorAlert("Error", "An error occurred while updating the user profile");
        } finally {
            setIsLoading(false);
        }
    };
    
    
    useEffect(() => {
        // Normalize values to string before comparing
        setAssociationModified(
            association_name !== initialAssociationData.association_name ||
            association_email_id !== initialAssociationData.association_email_id ||
            association_phone_no.toString() !== (initialAssociationData.association_phone_no || '').toString() ||
            association_address !== initialAssociationData.association_address
        );
    
        setUserModified(
            username !== initialUserData.username ||
            phone_no.toString() !== (initialUserData.phone_no || '').toString() ||
            password.toString() !== (initialUserData.password || '').toString()
        );
    }, [
        association_name,
        association_phone_no,
        association_email_id,
        association_address,
        username,
        phone_no,
        password,
        initialAssociationData,
        initialUserData
    ]);
    return {
        data, setPosts,
        username, setUserUname,
        email_id, setUserEmail,
        phone_no, setUserPhone,
        password, setUserPassword,
        errorMessageAss, setErrorMessageAss,
        errorMessage, setErrorMessage,
        dataAss, setPostsAss,
        association_name, setUpdateUname,
        association_email_id, setUpdateEmail,
        association_phone_no, setUpdatePhone,
        association_address, setUpdateAddress,
        initialAssociationData, setInitialAssociationData,
        initialUserData, setInitialUserData,
        associationModified, setAssociationModified,
        userModified, setUserModified,
        fetchProfile,addAssProfileUpdate,
        addUserProfileUpdate,
       loading,
       isloading


    }}
    export default useProfile;