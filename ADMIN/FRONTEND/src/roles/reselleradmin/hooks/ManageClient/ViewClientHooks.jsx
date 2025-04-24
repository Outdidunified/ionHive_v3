import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useViewClient = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [newUser, setNewUser] = useState({
        client_name: '',
        client_id: '',
        client_phone_no: '',
        client_email_id: '',
        client_address: '',
        status: '',
        created_by: '',
        created_date: '',
        modified_by: '',
        modified_date: '',
        client_wallet: '',
    });

    useEffect(() => {
        const { user } = location.state || {};
        if (user) {
            setNewUser({
                client_name: user.client_name || '',
                client_id: user.client_id || '',
                client_phone_no: user.client_phone_no || '',
                client_email_id: user.client_email_id || '',
                client_address: user.client_address || '',
                status: user.status || '',
                created_by: user.created_by || '',
                created_date: user.created_date || '',
                modified_by: user.modified_by || '',
                modified_date: user.modified_date || '',
                client_wallet: user.client_wallet || '',
            });
            localStorage.setItem('userData', JSON.stringify(user));
        } else {
            const savedData = localStorage.getItem('userData');
            if (savedData) {
                setNewUser(JSON.parse(savedData));
            }
        }
    }, [location]);

    const goBack = () => {
        navigate('/reselleradmin/ManageClient');
    };

    const navigateToEditUser = () => {
        navigate('/reselleradmin/updateclient', { state: { newUser } });
    };

    const formatTimestamp = (originalTimestamp) => {
        const date = new Date(originalTimestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        hours = String(hours).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
    };

    return {
        newUser,
        setNewUser,
        goBack,
        navigateToEditUser,
        formatTimestamp,
    };
};

export default useViewClient;
