import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useViewAlloc = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [newDevice, setNewDevice] = useState({
        charger_id: '', model: '', charger_model: '', type: '', charger_type: '', gun_connector: '', max_current: '', created_date: '', status: '',
        tag_id: '', assigned_association_date: '', assigned_client_date: '', assigned_reseller_date: '', charger_accessibility: '',
        client_commission: '', created_by: '', current_or_active_user: '', max_power: '', modified_by: '', modified_date: '', wifi_module: '', bluetooth_module: '',
        reseller_commission: '', short_description: '', socket_count: '', vendor: '', wifi_password: '', wifi_username: '', connector_details: '',
    });

    useEffect(() => {
        const { charger } = location.state || {};
        if (charger) {
            setNewDevice({
                charger_id: charger.charger_id || '', model: charger.model || '', charger_model: charger.charger_model || '',
                type: charger.type || '', charger_type: charger.charger_type || '', gun_connector: charger.gun_connector || '', max_current: charger.max_current || '',
                created_date: charger.created_date || '', status: charger.status || '', tag_id: charger.tag_id || '',
                assigned_association_date: charger.assigned_association_date || '', assigned_client_date: charger.assigned_client_date || '',
                assigned_reseller_date: charger.assigned_reseller_date || '', charger_accessibility: charger.charger_accessibility || '',
                client_commission: charger.client_commission || '', created_by: charger.created_by || '',
                current_or_active_user: charger.current_or_active_user || '', max_power: charger.max_power || '',
                modified_by: charger.modified_by || '', modified_date: charger.modified_date || '',
                reseller_commission: charger.reseller_commission || '', short_description: charger.short_description || '', connector_details: charger.connector_details || '',
                socket_count: charger.socket_count || '', vendor: charger.vendor || '', wifi_password: charger.wifi_password || '', wifi_username: charger.wifi_username || '',
                wifi_module: charger.wifi_module || '', bluetooth_module: charger.bluetooth_module || '',
            });

            localStorage.setItem('userData', JSON.stringify(charger));
        } else {
            const savedData = JSON.parse(localStorage.getItem('userData'));
            if (savedData) {
                setNewDevice(savedData);
            }
        }
    }, [location]);

    const goBack = () => {
        navigate('/reselleradmin/Allocateddevice');
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
        newDevice,
        setNewDevice,
        formatTimestamp,
        goBack
    };
};

export default useViewAlloc;
