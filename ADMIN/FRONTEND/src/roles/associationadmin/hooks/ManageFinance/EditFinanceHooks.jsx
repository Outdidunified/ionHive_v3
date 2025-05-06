import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';
import {showSuccessAlert,showErrorAlert} from '../../../../utils/alert';

const useEditFinance = (userInfo) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dataItems = location.state?.newfinance || JSON.parse(localStorage.getItem('editDeviceData'));
    localStorage.setItem('editDeviceData', JSON.stringify(dataItems));

    const [eb_charge, setEbCharge] = useState(dataItems?.eb_charge || '');
    const [gst, setGst] = useState(dataItems?.gst || '');
    const [margin, setMargin] = useState(dataItems?.margin || '');
    const [processing_fee, setProcessingFee] = useState(dataItems?.processing_fee || '');
    const [parking_fee, setParkingFee] = useState(dataItems?.parking_fee || '');
    const [convenience_fee, setConvienceFee] = useState(dataItems?.convenience_fee || '');
    const [service_fee, setServiceFee] = useState(dataItems?.service_fee || '');
    const [station_fee, setStationFee] = useState(dataItems?.station_fee || '');
    const [status, setStatus] = useState(dataItems?.status ? 'true' : 'false');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading,setLoading]=useState(false)
    const [initialValues] = useState({
        eb_charge: dataItems?.eb_charge || '',
        gst: dataItems?.gst || '',
        margin: dataItems?.margin || '',
        processing_fee: dataItems?.processing_fee || '',
        parking_fee: dataItems?.parking_fee || '',
        convenience_fee: dataItems?.convenience_fee || '',
        service_fee: dataItems?.service_fee || '',
        station_fee: dataItems?.station_fee || '',
        status: dataItems?.status ? 'true' : 'false',
    });

    const isModified =
        String(eb_charge) !== String(initialValues.eb_charge) ||
        String(gst) !== String(initialValues.gst) ||
        String(margin) !== String(initialValues.margin) ||
        String(processing_fee) !== String(initialValues.processing_fee) ||
        String(parking_fee) !== String(initialValues.parking_fee) ||
        String(convenience_fee) !== String(initialValues.convenience_fee) ||
        String(service_fee) !== String(initialValues.service_fee) ||
        String(station_fee) !== String(initialValues.station_fee) ||
        status !== initialValues.status;

    const validateEBCharge = (value) => {
        value = value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) value = parts[0] + '.' + parts[1];
        else if (parts.length === 2 && parts[1].length > 2)
            value = parts[0] + '.' + parts[1].slice(0, 2);

        value = value.replace(/^0+(\d)/, '$1');
        const numericValue = parseFloat(value);

        if (isNaN(numericValue) || numericValue < 5) {
            setErrorMessage("EB charge must be at least ₹5.");
        } else {
            setErrorMessage('');
        }

        return value;
    };

    const validateGST = (value) => {
        value = value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) value = parts[0] + '.' + parts[1];
        else if (parts.length === 2 && parts[1].length > 2)
            value = parts[0] + '.' + parts[1].slice(0, 2);

        value = value.replace(/^0+(\d)/, '$1');
        const numericValue = parseFloat(value);

        if (isNaN(numericValue) || numericValue < 5 || numericValue > 50) {
            setErrorMessage("GST must be between 5% and 50%.");
        } else {
            setErrorMessage('');
        }

        return value;
    };

    const validateOtherCharges = (value) => {
        value = value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) value = parts[0] + '.' + parts[1];
        else if (parts.length === 2 && parts[1].length > 2)
            value = parts[0] + '.' + parts[1].slice(0, 2);

        value = value.replace(/^0+(\d)/, '$1');
        return value === '' ? '0' : value;
    };

    const handleEBChargeChange = (e) => {
        setEbCharge(validateEBCharge(e.target.value));
    };

    const handleGSTChange = (e) => {
        setGst(validateGST(e.target.value));
    };

    const handleOtherChargesChange = (setter) => (e) => {
        setter(validateOtherCharges(e.target.value));
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };


    const updateFinanceDetails = async (e) => {
        e.preventDefault();
    
        if (isNaN(eb_charge) || eb_charge < 5) {
            setErrorMessage("EB charge must be at least ₹5.");
            return;
        }
    
        if (isNaN(gst) || gst < 5 || gst > 50) {
            setErrorMessage("GST must be between 5% and 50%.");
            return;
        }
    
        setErrorMessage('');
    
        const formattedFinanceData = {
            _id: dataItems._id,
            finance_id: dataItems.finance_id,
            association_id: dataItems.association_id,
            eb_charge,
            margin,
            processing_fee,
            parking_fee,
            convenience_fee,
            service_fee,
            station_fee,
            gst,
            modified_by: userInfo.email_id,
            status: status === 'true',
        };
    
        try {
            setLoading(true);
            const response = await axiosInstance.post('/associationadmin/updateFinance', formattedFinanceData);
    
            if (response.data.status === 'Success') {
                showSuccessAlert('Finance details updated successfully'); // Use success alert helper
                navigate('/associationadmin/ManageFinance');
            } else {
                showErrorAlert('Error updating finance details', response.data.message); // Use error alert helper
            }
        } catch (error) {
            console.error('Error updating finance details:', error);
            showErrorAlert('Error updating finance details', 'Please try again later.'); // Use error alert helper
        } finally {
            setLoading(false);
        }
    };
    

    const goBack = () => navigate(-1);

    return {
        dataItems,
        eb_charge, setEbCharge,
        margin, setMargin,
        processing_fee, setProcessingFee,
        parking_fee, setParkingFee,
        convenience_fee, setConvienceFee,
        service_fee, setServiceFee,
        station_fee, setStationFee,
        status, setStatus,
        errorMessage, setErrorMessage,
        initialValues,
        isModified,
        validateEBCharge,
        validateGST,
        validateOtherCharges,
        handleEBChargeChange,
        handleGSTChange,
        handleOtherChargesChange,
        handleStatusChange,
        updateFinanceDetails,goBack,gst, setGst,loading
    }}
export default useEditFinance;