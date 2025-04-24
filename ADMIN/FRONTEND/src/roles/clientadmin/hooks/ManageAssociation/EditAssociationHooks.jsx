import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    showSuccessAlert,showErrorAlert
}from '../../../../utils/alert';
import axiosInstance from '../../../../utils/utils';

const useEditass = (userInfo) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dataItems = location.state?.newass || JSON.parse(localStorage.getItem('editDeviceData'));
    localStorage.setItem('editDeviceData', JSON.stringify(dataItems));
    const [association_name, setAssociationName] = useState(dataItems?.association_name || '');
    const [association_phone_no, setAssociationPhoneNo] = useState(dataItems?.association_phone_no || '');
    const [association_wallet, setAssociationWallet] = useState(dataItems?.association_wallet || '0');
    const [association_address, setAssociationAddress] = useState(dataItems?.association_address || '');
    const [status, setStatus] = useState(dataItems?.status ? 'true' : 'false');
    const [errorMessage, setErrorMessage] = useState('');
const [loading,setLoading]=useState(false);
    // Store initial values
    const [initialValues, setInitialValues] = useState({
        association_phone_no: dataItems?.association_phone_no || '',
        association_wallet: dataItems?.association_wallet || '0',
        association_address: dataItems?.association_address || '',
        status: dataItems?.status ? 'true' : 'false'
    });

    // Check if any field has been modified
    const isModified = (
        String(association_phone_no) !== String(initialValues.association_phone_no) ||
        String(association_wallet) !== String(initialValues.association_wallet) ||
        String(association_address) !== String(initialValues.association_address) ||
        status !== initialValues.status
    );
    

    // Select status
    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    // update association details

    const updateAssociationDetails = async (e) => {
        e.preventDefault();
    
        // Phone number validation
        const phoneRegex = /^\d{10}$/;
        if (!association_phone_no || !phoneRegex.test(association_phone_no)) {
            setErrorMessage('Phone number must be a 10-digit number.');
            return;
        }
    
        try {
            setLoading(true)
            const formattedAssData = {
                association_address: association_address,
                association_email_id: dataItems.association_email_id,
                association_wallet,
                association_id: dataItems.association_id,
                association_name: association_name,
                association_phone_no: parseInt(association_phone_no),
                modified_by: userInfo.email_id,
                status: status === 'true',
            };
    
            const response = await axiosInstance.post('/clientadmin/UpdateAssociationUser', formattedAssData);
    
            if (response.data.status === 'Success') {
                 showSuccessAlert("Association details updated successfully");
                editBack();
            } else {
                const message = response.data.message || 'Please try again later.';
                 showErrorAlert("Error updating association details. " + message);
            }
        } catch (error) {
            console.error('Error updating association details:', error);
             showErrorAlert("Error updating association details. Please try again later.");
        }finally{
            setLoading(false)
        }
    };
    

    // back page
    const goBack = () => {
        navigate(-1);
    };

    // view manage association details 
    const editBack = () => {
        navigate('/clientadmin/ManageAssociation')  
    };

    useEffect(() => {
        // Update initial values if dataItems changes
        setInitialValues({
            association_phone_no: dataItems?.association_phone_no || '',
            association_wallet: dataItems?.association_wallet || '0',
            association_address: dataItems?.association_address || '',
            status: dataItems?.status ? 'true' : 'false'
        });
    }, [dataItems]);

    return {
        dataItems,
        association_name, setAssociationName,
        association_phone_no, setAssociationPhoneNo,
        association_wallet, setAssociationWallet,
        association_address, setAssociationAddress,
        status, setStatus,
        errorMessage, setErrorMessage,
        initialValues, setInitialValues,
        isModified,handleStatusChange,
        updateAssociationDetails,
        goBack,editBack,loading



    }}
    export default useEditass;
