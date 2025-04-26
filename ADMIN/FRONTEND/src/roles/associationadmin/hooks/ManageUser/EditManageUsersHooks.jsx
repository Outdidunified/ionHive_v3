import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';
import Swal from 'sweetalert2';

const useEditManageUsers = (userInfo) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dataItem = location.state?.newUser || JSON.parse(localStorage.getItem('editDeviceData'));
    localStorage.setItem('editDeviceData', JSON.stringify(dataItem));

    const [errorMessage, setErrorMessage] = useState('');
    const [selectStatus, setSelectedStatus] = useState(dataItem.status ? 'true' : 'false');

    // Edit manage device
    const [username, setUsername] = useState(dataItem?.username || '');
    const [password, setPassword] = useState(dataItem?.password || '');
    const [phone_no, setPhoneNumber] = useState(dataItem?.phone_no || '');

    // Store initial values
    const [initialValues, setInitialValues] = useState({
        password: dataItem?.password || '',
        phone_no: dataItem?.phone_no || '',
        status: dataItem.status ? 'true' : 'false'
    });

    // Check if any field has been modified
    const isModified = (
        String(password) !== String(initialValues.password) ||
        String(phone_no) !== String(initialValues.phone_no) ||
        selectStatus !== initialValues.status
    );
    

    /// Selected status
    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
    };

    // Back Manage user page 
    const backManageUser = () => {
        navigate('/associationadmin/ManageUsers');
    };

    // Update manage user
    const editManageUser = async (e) => {
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
            const updatedUser = {
                user_id: dataItem.user_id,
                username: username,
                phone_no: parseInt(phone_no),
                password: parseInt(password),
                status: selectStatus === 'true',
                modified_by: userInfo.email_id,
            };
            const response = await axiosInstance.post('/associationadmin/UpdateUser', 
              updatedUser);

            if (response.status==200) {
                Swal.fire({
                    title: 'User updated successfully',
                    icon: 'success',
                });
                backManageUser();
            } else {
                const responseData = response.data
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to update user, ' + responseData.message,
                    icon: 'error',
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'An error occurred while updating the user',
                icon: 'error',
            });
        }
    };

    useEffect(() => {
        // Update initial values if dataItem changes
        setInitialValues({
            password: dataItem?.password || '',
            phone_no: dataItem?.phone_no || '',
            status: dataItem.status ? 'true' : 'false'
        });
    }, [dataItem]);
    
    const goBack = () => {
        navigate(-1);
    };

    return {
        dataItem,
        errorMessage,setErrorMessage,
        selectStatus, setSelectedStatus,
        username, setUsername,
        password,setPassword,
        phone_no,setPhoneNumber,
        initialValues,setInitialValues,isModified,
        handleStatusChange,backManageUser,editManageUser,
        goBack
    }}
    export default useEditManageUsers;