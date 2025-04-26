import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../utils/utils';

const useCreateFinance = (userInfo) => {
    const navigate = useNavigate();
    const [newFinance, setNewFinance] = useState({
        eb_charge: '', gst: '', margin: '', parking_fee: '', processing_fee: '', convenience_fee: '',
        service_fee: '', station_fee: '', created_by: userInfo.email_id,
    });
    
    const [errorMessage, setErrorMessage] = useState('');
    
   // Validation Function
    // const validateNumberInput = (value, min, max) => {
    //     value = value.replace(/[^0-9.]/g, ''); // Allow only numbers and one decimal point
    //     const parts = value.split('.');

    //     if (parts.length > 2) {
    //         value = parts[0] + '.' + parts[1]; // Prevent multiple decimal points
    //     } else if (parts.length === 2 && parts[1].length > 2) {
    //         value = parts[0] + '.' + parts[1].slice(0, 2); // Limit to two decimal places
    //     }

    //     value = value.replace(/^0+(\d)/, '$1'); // Remove leading zeros properly

    //     const numericValue = parseFloat(value);

    //     if (isNaN(numericValue) || numericValue < min || numericValue > max) {
    //         return { value, isValid: false };
    //     }
    //     return { value, isValid: true };
    // };

    // State to track touched fields
    //const [touchedFields, setTouchedFields] = useState({});

    // Handle Input Change
    const handleInputChange = (e, field) => {
        let min = 0, max = Infinity;
        let errorLabel = ""; 
        let value = e.target.value.replace(/[^0-9.]/g, ''); // Allow only numbers and one decimal point
    
        if (field === 'eb_charge') {
            min = 5; // EB charge must be at least ₹5
            errorLabel = "EB charge must be at least ₹5.";
        } else if (field === 'gst') {
            min = 5; // GST must be between 5% and 50%
            max = 50;
            errorLabel = "GST must be between 5% and 50%.";
        }
    
        // Prevent multiple decimal points
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts[1];
        } else if (parts.length === 2 && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].slice(0, 2); // Limit to two decimal places
        }
    
        // Remove leading zeros (except for `eb_charge` and `gst`)
        if (field !== 'eb_charge' && field !== 'gst') {
            value = value.replace(/^0+/, ''); 
            if (value === '') value = '0'; // If the field is empty after removing leading zeros, set it to '0'
        }
    
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue < min || numericValue > max) {
            setErrorMessage(errorLabel);
        } else {
            setErrorMessage('');
        }
    
        setNewFinance(prev => ({ ...prev, [field]: value }));
    };
    


    // Create Finance Function
    const createFinance = async (e) => {
        e.preventDefault();

        if (!newFinance.eb_charge || parseFloat(newFinance.eb_charge) < 5) {
            setErrorMessage("EB charge must be at least ₹5.");
            return;
        }

        if (!newFinance.gst || parseFloat(newFinance.gst) < 5 || parseFloat(newFinance.gst) > 50) {
            setErrorMessage("GST must be between 5% and 50%.");
            return;
        }

        setErrorMessage(''); // Clear any previous errors

        try {
            const formattedFinanceData = {
                association_id: userInfo.association_id,
                gst: newFinance.gst || "0",
                eb_charge: newFinance.eb_charge,
                margin: newFinance.margin || "0",
                parking_fee: newFinance.parking_fee || "0",
                processing_fee: newFinance.processing_fee || "0",
                convenience_fee: newFinance.convenience_fee || "0",
                service_fee: newFinance.service_fee || "0",
                station_fee: newFinance.station_fee || "0",
                created_by: newFinance.created_by,
            };

            await axiosInstance.post('/associationadmin/createFinance', formattedFinanceData);

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Finance created successfully',
                showConfirmButton: false,
                timer: 1500
            });

            goBack();
        } catch (error) {
            console.error('Error creating finance:', error);
            setErrorMessage('Failed to create finance. Please try again.');
        }
    };

    // back page
    const goBack = () => {
        navigate(-1);
    };

    return {
        newFinance,
        setNewFinance,
        errorMessage,
        setErrorMessage,
        handleInputChange,
        createFinance,
        goBack
    }}

    export default useCreateFinance; 
