import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


const useViewuser = (userInfo) => {
    const navigate = useNavigate();
    const [newUser, setNewUser] = useState({
        association_id: '', autostop_price: '',  autostop_price_is_checked: false, autostop_time: '',
        autostop_time_is_checked: false, autostop_unit: '', autostop_unit_is_checked: false,
        client_id: '', created_by: '', created_date: '', email_id: '', modified_by: '', modified_date: '',
        password: '',  phone_no: '', reseller_id: '', role_id: '', status: '', user_id: '', username: '',
        wallet_bal: '',   role_name: '', client_name: '', association_name: '', _id: '',
    });

    const location = useLocation();

    useEffect(() => {
        const { user } = location.state || {};
        if (user) {
            setNewUser({
                association_id: user.association_id || '', autostop_price: user.autostop_price || '',
                autostop_price_is_checked: user.autostop_price_is_checked || false, autostop_time: user.autostop_time || '',
                autostop_time_is_checked: user.autostop_time_is_checked || false, autostop_unit: user.autostop_unit || '',
                autostop_unit_is_checked: user.autostop_unit_is_checked || false, client_id: user.client_id || '',
                created_by: user.created_by || '', created_date: user.created_date || '',
                email_id: user.email_id || '', modified_by: user.modified_by || '', modified_date: user.modified_date || '',
                password: user.password || '', phone_no: user.phone_no || '', reseller_id: user.reseller_id || '',
                role_id: user.role_id || '', status: user.status || '', user_id: user.user_id || '', username: user.username || '', wallet_bal: user.wallet_bal || '', 
                role_name: user.role_name || '', client_name: user.client_name || '',
                association_name: user.association_name || '', _id: user._id || '',
            });
        // Save to localStorage
        localStorage.setItem('userData', JSON.stringify(user));
        } else {
            // Load from localStorage if available
            const savedData = JSON.parse(localStorage.getItem('userData'));
            if (savedData) {
                setNewUser(savedData);
            }
        }
    }, [location]);

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

    // back page
    const goBack = () => {
        navigate(-1);
    };

    // view edit user page
    const navigateToEditUser = (newUser) => {
        navigate('/clientadmin/Edituser', { state: { newUser } });
    };
return {
    newUser,
    formatTimestamp,
    goBack,
    navigateToEditUser

}}
export default useViewuser;
