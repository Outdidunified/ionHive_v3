// src/hooks/useViewUserData.js

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useViewUserData = () => {
    const location = useLocation();
    const [newUser, setNewUser] = useState({
        username: '', email_id: '', password: '', phone_no: '', wallet_bal: '', role_id: '', role_name: '',
        client_name: '', reseller_name: '', association_name: '', user_id: '', status: '',
        client_id: '', reseller_id: '', created_by:'', created_date:'', modified_by:'', modified_date:'', _id: '',
    });

    useEffect(() => {
        const { dataItem } = location.state || {};
        if (dataItem) {
            setNewUser({
                username: dataItem.username || '',
                email_id: dataItem.email_id || '',
                password: dataItem.password || '',
                phone_no: dataItem.phone_no || '',
                wallet_bal: dataItem.wallet_bal || '',
                role_id: dataItem.role_id || '',
                role_name: dataItem.role_name || '',
                client_name: dataItem.client_name || '',
                reseller_name: dataItem.reseller_name || '',
                association_name: dataItem.association_name || '',
                user_id: dataItem.user_id || '',
                status: dataItem.status || '',
                client_id: dataItem.client_id || '',
                reseller_id: dataItem.reseller_id || '',
                created_by: dataItem.created_by || '',
                created_date: dataItem.created_date || '',
                modified_by: dataItem.modified_by || '',
                modified_date: dataItem.modified_date || '',
                _id: dataItem._id || '',
            });

            // Save to localStorage
            localStorage.setItem('userData', JSON.stringify(dataItem));
        } else {
            const savedData = JSON.parse(localStorage.getItem('userData'));
            if (savedData) {
                setNewUser(savedData);
            }
        }
    }, [location]);

    return newUser;
};

export default useViewUserData;
