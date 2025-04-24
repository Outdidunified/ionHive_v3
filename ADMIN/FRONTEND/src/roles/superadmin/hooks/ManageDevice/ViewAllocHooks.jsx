// src/hooks/superadmin/useViewAllocated.js
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useViewAllocated = () => {
    const location = useLocation();
    const [newDevice, setNewDevice] = useState({
        _id:'', charger_id: '', model: '', charger_model: '', type: '', charger_type: '', gun_connector: '',
        max_current: '', created_date: '', status: '', tag_id: '', assigned_association_date: '',
        assigned_client_date: '', assigned_reseller_date: '', charger_accessibility: '',
        client_commission: '', created_by: '', current_or_active_user: '', max_power: '', modified_by: '',
        modified_date: '', wifi_module: '', bluetooth_module: '', reseller_commission: '',
        short_description: '', socket_count: '', vendor: '', wifi_password: '', wifi_username: '',
        connector_details: '', ip: '', lat: '', long: '', superadmin_commission: '',
        assigned_reseller_id: '', assigned_client_id: '', assigned_association_id: '', finance_id: '',
        current_or_active_user_for_connector_1: '', tag_id_for_connector_1: '', tag_id_for_connector_1_in_use: '',
        transaction_id_for_connector_1: '', address: '', landmark: '', reseller_email_id: '',
        client_email_id: '', association_email_id: ''
    });

    useEffect(() => {
        const { charger } = location.state || {};
        if (charger) {
            setNewDevice({
                ...newDevice,
                ...charger
            });
            localStorage.setItem('userData', JSON.stringify(charger));
        } else {
            const savedData = JSON.parse(localStorage.getItem('userData'));
            if (savedData) {
                setNewDevice(savedData);
            }
        }
    }, [location]);

    return { newDevice, setNewDevice };
};
