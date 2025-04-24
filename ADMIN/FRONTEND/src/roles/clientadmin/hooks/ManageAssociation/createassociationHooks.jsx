import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';
import {showSuccessAlert,showErrorAlert} from '../../../../utils/alert';

const useCreateass = (userInfo) => {
    const navigate = useNavigate();
    const [newUser, setNewUser] = useState({
        association_name: '',
        association_phone_no: '',
        association_email_id: '',
        association_address: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const Goback = () => {
        navigate('/clientadmin/ManageAssociation');
    };


    const addClientUser = async (e) => {
        e.preventDefault();
    
        const phoneRegex = /^\d{10}$/;
        if (!newUser.association_phone_no || !phoneRegex.test(newUser.association_phone_no)) {
            setErrorMessage('Phone number must be a 10-digit number.');
            return;
        }
    
        try {
            setLoading(true);
    
            const newAssociation = {
                reseller_id: userInfo.reseller_id,
                client_id: userInfo.client_id,
                association_name: newUser.association_name,
                association_phone_no: newUser.association_phone_no,
                association_email_id: newUser.association_email_id,
                association_address: newUser.association_address,
                created_by: userInfo.email_id
            };
    
            const response = await axiosInstance.post('/clientadmin/CreateAssociationUser', newAssociation);
    
            if (response.status === 200 && response.data.status === 'Success') {
                 showSuccessAlert("User created successfully");
                setNewUser({
                    association_name: '',
                    association_phone_no: '',
                    association_email_id: '',
                    association_address: ''
                });
                navigate('/clientadmin/ManageAssociation');
            } else {
                showErrorAlert('Error', response.data.message || 'Failed to add user');
             }
           } catch (error) {
             const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
              showErrorAlert('Error', message);
           } finally {
             setLoading(false);
           }
         };
    

    return {
        newUser,
        errorMessage,
        loading,
        Goback,
        addClientUser,
        setNewUser,
        setErrorMessage
    };
};

export default useCreateass;
