import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert,
  } from '../../../../utils/alert';
 import axiosInstance from '../../../../utils/utils';

const useEdituser = (userInfo) => {
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
    const [loading,setLoading]=useState(false)
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
      
        // Validate phone number
        const phoneRegex = /^\d{10}$/;
        if (!phone_no || !phoneRegex.test(phone_no)) {
          setErrorMessage('Phone number must be a 10-digit number.');
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
          setLoading(true);
      
          const formattedUserData = {
            user_id: dataItems?.user_id,
            username,
            phone_no: parseInt(phone_no),
            modified_by: userInfo.email_id,
            password: parseInt(password),
            status: status === 'true',
          };
      
          // Send update request
          const response = await axiosInstance.post('/clientadmin/UpdateUser', formattedUserData);
      
          if (response.status === 200) {
            showSuccessAlert('User updated successfully');
            editUpdateBack(); // Callback after success
          } else {
            const responseData = await response.json();
            showErrorAlert('Failed to update user', responseData?.message || '');
          }
        } catch (error) {
          console.error('Error updating user:', error);
          const message =
            error?.response?.data?.message || 'Failed to update user. Please try again.';
          setErrorMessage(message);
          showErrorAlert('Error updating user', message);
        } finally {
          setLoading(false);
        }
      };
      

    // back page
    const goBack = () => {
        navigate(-1);
    };

    // back page
    const editUpdateBack = () => {
        navigate('/clientadmin/ManageUsers');
    };

    // status changes
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
    isModified,updateClientUser,goBack,
    editUpdateBack,handleStatusChange,loading

}}
export default useEdituser;