import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const useViewManageUser = (userInfo) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [newUser, setNewUser] = useState({
        username: '', email_id: '', password: '', phone_no: '', wallet_bal: '', role_id: '', user_id: '', status: '',
        client_id: '', reseller_id: '', association_id:'', created_by:'', created_date:'', modified_by:'', modified_date:'', 
        role_name: '', client_name: '', reseller_name: '', association_name: '', _id: '', tag_id: '',
    });

    useEffect(() => {
        const { dataItem } = location.state || {};
        if (dataItem) {
            setNewUser({
                username: dataItem.username || '', email_id: dataItem.email_id || '', password: dataItem.password || '',
                phone_no: dataItem.phone_no || '', wallet_bal: dataItem.wallet_bal || '', role_id: dataItem.role_id || '',
                user_id: dataItem.user_id || '', status: dataItem.status || '', client_id: dataItem.client_id || '',
                reseller_id: dataItem.reseller_id || '', association_id: dataItem.association_id || '', created_by: dataItem.created_by || '',
                created_date: dataItem.created_date || '', modified_by: dataItem.modified_by || '', modified_date: dataItem.modified_date || '',
                role_name: dataItem.role_name || '', client_name: dataItem.client_name || '', reseller_name: dataItem.reseller_name || '',
                association_name: dataItem.association_name || '', _id: dataItem._id || '', tag_id: dataItem.tag_id || '',
            });
        // Save to localStorage
        localStorage.setItem('userData', JSON.stringify(dataItem));
        } else {
            // Load from localStorage if available
            const savedData = JSON.parse(localStorage.getItem('userData'));
            if (savedData) {
                setNewUser(savedData);
            }
        }
    }, [location]);

    // Back manage users
    const handleBack = () => {
        navigate('/associationadmin/ManageUsers');
    };

    // View edit user liat
    const handleEditUser = (newUser) => {
        navigate('/associationadmin/EditManageUsers', { state: { newUser } });
    };

    // Timestamp data 
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
        hours = hours ? hours : 12; // the hour '0' should be '12'
        hours = String(hours).padStart(2, '0');
    
        const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
        return formattedDate;
    } 
return {
    newUser,
    setNewUser,
    handleBack,
    handleEditUser,formatTimestamp
}}
export default useViewManageUser;