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
    function formatTimestamp(originalTimestamp) {
        const date = new Date(originalTimestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        hours = String(hours).padStart(2, '0');

        const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
        return formattedDate;
    }
  
    return {
        newass,handleEdit,formatTimestamp,goBack

    }}
    export default useViewAss;