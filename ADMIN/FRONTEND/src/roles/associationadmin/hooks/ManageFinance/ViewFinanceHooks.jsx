import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useViewFinance = (userInfo) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [newfinance, setNewFinance] = useState({
        association_id: '', eb_charge: '', margin: '', gst: '', processing_fee: '', parking_fee: '',
        service_fee: '', station_fee: '', created_by: '', created_date: '',
        modified_by: '', modified_date: '', finance_id: '', status: '', _id: '', convenience_fee: '',
    });

    useEffect(() => {
        const { finance } = location.state || {};
        if (finance) {
            setNewFinance({
                _id:finance._id,
                convenience_fee:finance.convenience_fee,
                association_id: finance.association_id || '',
                eb_charge: finance.eb_charge || '',
                margin: finance.margin || '',
                gst: finance.gst || '',
                processing_fee: finance.processing_fee || '',
                parking_fee: finance.parking_fee || '',
                service_fee: finance.service_fee || '',
                station_fee: finance.station_fee || '',
                created_by: finance.created_by || '',
                created_date: finance.created_date || '',
                modified_by: finance.modified_by || '',
                modified_date: finance.modified_date || '',
                finance_id: finance.finance_id || '',
                status: finance.status || '',
            });
         // Save to localStorage
         localStorage.setItem('userData', JSON.stringify(finance));
        } else {
            // Load from localStorage if available
            const savedData = JSON.parse(localStorage.getItem('userData'));
            if (savedData) {
                setNewFinance(savedData);
            }
        }
    }, [location]);

    // back page
    const goBack = () => {
        navigate(-1);
    };

    // Timestamp data 
    


    // view edit page
    const handleEdit = (newfinance) => {
        navigate('/associationadmin/EditFinance', { state: { newfinance } });
    };

    return {
        newfinance,
        setNewFinance,
        goBack,handleEdit
    }}
    export default useViewFinance;