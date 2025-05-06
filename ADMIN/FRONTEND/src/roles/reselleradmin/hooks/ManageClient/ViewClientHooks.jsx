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

   

    return {
        newUser,
        setNewUser,
        goBack,
        navigateToEditUser,
    };
};

export default useViewClient;
