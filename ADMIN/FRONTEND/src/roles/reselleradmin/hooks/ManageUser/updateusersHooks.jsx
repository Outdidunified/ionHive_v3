import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';
import { showErrorAlert,showSuccessAlert } from '../../../../utils/alert';

const useUpdateUser = (userInfo) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dataItems = location.state?.newUser || JSON.parse(localStorage.getItem('editDeviceData'));
    localStorage.setItem('editDeviceData', JSON.stringify(dataItems));
    const [username, setUsername] = useState(dataItems?.username || '');
    const [email_id] = useState(dataItems?.email_id || ''); // Read-only, so no need for state
    const [password, setPassword] = useState(dataItems?.password || ''); // Read-only, so no need for state
    const [phone_no, setPhoneNo] = useState(dataItems?.phone_no || '');
    const [role_name] = useState(dataItems?.role_name || ''); // Read-only, so no need for state
    const [status, setStatus] = useState(dataItems?.status ? 'true' : 'false'); // Initialize with Active or Inactive
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

     // Store initial values
     const [initialValues, setInitialValues] = useState({
        username: dataItems?.username || '',
        phone_no: dataItems?.phone_no || '',
        password: dataItems?.password || '',
        status: dataItems?.status ? 'true' : 'false',
    });

    // Check if any field has been modified
    const isModified = (
        String(username) !== String(initialValues.username) ||
        String(phone_no) !== String(initialValues.phone_no) ||
        String(password) !== String(initialValues.password) ||
        status !== initialValues.status
    );
    


    const updateClientUser = async (e) => {
        e.preventDefault();
    
        // Set loading state to true while making the request
        setIsLoading(true);
    
        // Phone number validation
        const phoneRegex = /^\d{10}$/;
        if (!phone_no || !phoneRegex.test(phone_no)) {
            setErrorMessage('Phone number must be a 10-digit number.');
            setIsLoading(false);  // Reset loading state
            return;
        }
    
        // Validate password
        const passwordRegex = /^\d{4}$/;
        if (!password) {
            setErrorMessage("Password can't be empty.");
            setIsLoading(false);  // Reset loading state
            return;
        }
        if (!passwordRegex.test(password)) {
            setErrorMessage('Oops! Password must be a 4-digit number.');
            setIsLoading(false);  // Reset loading state
            return;
        }
    
        try {
            const formattedUserData = {
                user_id: dataItems?.user_id,
                username: username,
                phone_no: parseInt(phone_no),
                modified_by: userInfo.email_id,
                password: parseInt(password),
                status: status === 'true',
            };
    
            const response = await axiosInstance({method:'post',url:'/reselleradmin/UpdateUser', data:formattedUserData});
    
            if (response.status === 200) {
                // Handle success
                 showSuccessAlert("User updated successfully");
                navigate('/reselleradmin/ManageUsers');
            } else {
                 showErrorAlert("Failed to update user. Please try again.");
            }
        } catch (error) {
            console.error('Error updating user:', error);
             showErrorAlert("Failed to update user. Please try again.");
        } finally {
            setIsLoading(false);  // Reset loading state once the request is done
        }
    };
    
    

    // back manage user page
    const goBack = () => {
        navigate('/reselleradmin/ManageUsers');
    };

    // search
    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    useEffect(() => {
        // Update initial values if dataItems changes
        setInitialValues({
            username: dataItems?.username || '',
            phone_no: dataItems?.phone_no || '',
            password: dataItems?.password || '',
            status: dataItems?.status ? 'true' : 'false',
        });
    }, [dataItems]);

    return {
        dataItems,
        username, setUsername,
        email_id,
        password, setPassword,
        phone_no, setPhoneNo,
        role_name,
        status, setStatus,
        errorMessage, setErrorMessage,
        initialValues, setInitialValues,
        isModified,
        updateClientUser,
goBack,
handleStatusChange,
isLoading

    }}
    export default useUpdateUser;