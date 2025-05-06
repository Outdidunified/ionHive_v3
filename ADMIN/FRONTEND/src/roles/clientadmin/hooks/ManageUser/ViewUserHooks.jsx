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
    goBack,
    navigateToEditUser

}}
export default useViewuser;
