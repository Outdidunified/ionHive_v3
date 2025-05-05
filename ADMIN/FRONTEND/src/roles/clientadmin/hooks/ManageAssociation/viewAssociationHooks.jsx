import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useViewAss = (userInfo) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [newass, setnewass] = useState({
        association_address: '', association_email_id: '', association_id: '', association_name: '', association_phone_no: '',
        client_id: '', created_by: '', created_date: '', modified_by: '', modified_date: '', reseller_id: '', status: '', client_name: '', reseller_name: '',
        association_wallet: '',
    });

    useEffect(() => {
        const { association } = location.state || {};
        if (association) {
          
            setnewass({
                association_address: association.association_address || '', association_email_id: association.association_email_id || '',
                association_id: association.association_id || '', association_name: association.association_name || '',
                association_phone_no: association.association_phone_no || '', client_id: association.client_id || '',
                created_by: association.created_by || '', created_date: association.created_date || '',
                modified_by: association.modified_by || '', modified_date: association.modified_date || '',
                reseller_id: association.reseller_id || '', status: association.status || '', 
                reseller_name: association.reseller_name || '',  client_name: association.client_name || '', association_wallet: association.association_wallet || '',
            });
        // Save to localStorage
        localStorage.setItem('userData', JSON.stringify(association));
        } else {
            // Load from localStorage if available
            const savedData = JSON.parse(localStorage.getItem('userData'));
            if (savedData) {
                setnewass(savedData);
            }
        }
    }, [location]);

    // back page
    const goBack = () => {
        navigate(-1);
    };

    // edit page view
    const handleEdit = (newass) =>{
        navigate('/clientadmin/Editass',{ state: { newass } })
    }

    // Timestamp
   
  
    return {
        newass,handleEdit,goBack

    }}
    export default useViewAss;