import React, { useEffect, useState, useCallback, useRef } from 'react';
import { showSuccessAlert, showErrorAlert } from '../../../../utils/alert'; // Make sure the path is correct
import axiosInstance from '../../../../utils/utils';

const useProfile = (userInfo) => {
    const [data, setPosts] = useState({});
    const [username, setUserUname] = useState('');
    const [email_id, setUserEmail] = useState('');
    const [phone_no, setUserPhone] = useState('');
    const [password, setUserPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorMessages, setErrorMessages] = useState('');
    const [dataAss, setPostsAss] = useState({});
    const [reseller_name, setUpdateUname] = useState('');
    const [reseller_email_id, setUpdateEmail] = useState('');
    const [reseller_phone_no, setUpdatePhone] = useState('');
    const [reseller_address, setUpdateAddress] = useState('');
    const fetchProfileCalled = useRef(false); // Ref to track if fetchProfile has been called
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResellerSubmitting, setIsResellerSubmitting] = useState(false);



    // Store initial values
    const [initialResellerData, setInitialResellerData] = useState({});
    const [initialUserData, setInitialUserData] = useState({});
 
    // Store whether any changes have been made
    const [reselllerModified, setReselllerModified] = useState(false);
    const [userModified, setUserModified] = useState(false);

    // Define fetchResellerUserDetails using useCallback to memoize it
    const fetchResellerUserDetails = useCallback(async () => {
        try {
            const response = await axiosInstance.post('/reselleradmin/FetchUserProfile', {
                user_id: userInfo.user_id,
            });

            if (response.status === 200) {
                const data = response.data.data;
                setPosts(data);
                const resellerDetails = data.reseller_details[0] || {};
                setPostsAss(resellerDetails);
                // Set initial values
                setInitialResellerData(resellerDetails);
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
        if (!fetchProfileCalled.current && userInfo && userInfo.user_id) {
            fetchResellerUserDetails();
            fetchProfileCalled.current = true; // Mark fetchResellerUserDetails as called
        }
    }, [fetchResellerUserDetails, userInfo]);

    // Reseller profile
    useEffect(() => {
        if (dataAss) {
            setUpdateUname(dataAss.reseller_name || '');
            setUpdateEmail(dataAss.reseller_email_id || '');
            setUpdatePhone(dataAss.reseller_phone_no || '');
            setUpdateAddress(dataAss.reseller_address || '');
        }
    }, [dataAss]);

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

    // update reseller profile

    const addResellerProfileUpdate = async (e) => {
        e.preventDefault();
        setErrorMessages("");
        setIsResellerSubmitting(true); // Show spinner
    
        const phoneRegex = /^\d{10}$/;
        if (!reseller_phone_no) {
            setErrorMessages("Phone can't be empty.");
            setIsResellerSubmitting(false);
            return;
        }
        if (!phoneRegex.test(reseller_phone_no)) {
            setErrorMessages('Oops! Phone must be a 10-digit number.');
            setIsResellerSubmitting(false);
            return;
        }
    
        try {
            const response = await axiosInstance.post('/reselleradmin/UpdateResellerProfile', {
                reseller_id: userInfo.reseller_id,
                reseller_name,
                reseller_address,
                reseller_phone_no,
                modified_by: userInfo.email_id,
            });
    
            if (response.status === 200) {
                showSuccessAlert("Reseller profile updated successfully");
                fetchResellerUserDetails();
            } else {
                const responseData = await response.json();
                showErrorAlert("Error", "Failed to update reseller profile, " + responseData.message);
            }
        } catch (error) {
            showErrorAlert("Error", "An error occurred while updating the reseller profile");
        } finally {
            setIsResellerSubmitting(false); // Hide spinner
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
        setErrorMessage("");
        setIsSubmitting(true); // Start spinner
    
        // Validate phone number
        const phoneRegex = /^\d{10}$/;
        if (!phone_no) {
            setErrorMessage("Phone can't be empty.");
            setIsSubmitting(false);
            return;
        }
        if (!phoneRegex.test(phone_no)) {
            setErrorMessage('Oops! Phone must be a 10-digit number.');
            setIsSubmitting(false);
            return;
        }
    
        // Validate password
        const passwordRegex = /^\d{4}$/;
        if (!password) {
            setErrorMessage("Password can't be empty.");
            setIsSubmitting(false);
            return;
        }
        if (!passwordRegex.test(password)) {
            setErrorMessage('Oops! Password must be a 4-digit number.');
            setIsSubmitting(false);
            return;
        }
    
        try {
            const phoneNo = parseInt(phone_no);
            const Password = parseInt(password);
            const response = await axiosInstance.post('/reselleradmin/UpdateUserProfile', {
                user_id: userInfo.user_id,
                username,
                phone_no: phoneNo,
                password: Password,
            });
    
            if (response.status === 200) {
                showSuccessAlert("User profile updated successfully");
                fetchResellerUserDetails();
            } else {
                showErrorAlert("Error", "Failed to update user profile");
            }
        } catch (error) {
            showErrorAlert("Error", "An error occurred while updating the user profile");
        } finally {
            setIsSubmitting(false); // Stop spinner
        }
    };
    

    useEffect(() => {
        console.log('Comparing values...');
        console.log('Reseller:', {
            reseller_name,
            reseller_email_id,
            reseller_phone_no,
            reseller_address
        }, initialResellerData);
    
        console.log('User:', {
            username,
            phone_no,
            password
        }, initialUserData);
    
        const resellerChanged =
            reseller_name !== (initialResellerData.reseller_name || '') ||
            reseller_email_id !== (initialResellerData.reseller_email_id || '') ||
            String(reseller_phone_no) !== String(initialResellerData.reseller_phone_no || '') ||
            reseller_address !== (initialResellerData.reseller_address || '');
    
        const userChanged =
            username !== (initialUserData.username || '') ||
            String(phone_no) !== String(initialUserData.phone_no || '') ||
            String(password) !== String(initialUserData.password || '');
    
        setReselllerModified(resellerChanged);
        setUserModified(userChanged);
    }, [
        reseller_name,
        reseller_phone_no,
        reseller_email_id,
        reseller_address,
        username,
        phone_no,
        password,
        initialResellerData,
        initialUserData
    ]);
    

    return {
        data, setPosts,
        username, setUserUname,
        isResellerSubmitting,
        email_id, setUserEmail,
        phone_no, setUserPhone,
        password, setUserPassword,
        errorMessage, setErrorMessage,
        errorMessages, setErrorMessages,
        dataAss, setPostsAss,reseller_name, setUpdateUname,
        reseller_email_id, setUpdateEmail,
        reseller_phone_no, setUpdatePhone,
        reseller_address, setUpdateAddress,
        initialResellerData, setInitialResellerData,
        initialUserData, setInitialUserData,
        reselllerModified, setReselllerModified,
        userModified, setUserModified ,
        addResellerProfileUpdate,
        addUserProfileUpdate,isSubmitting

    }}
    export default useProfile;