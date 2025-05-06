import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useViewUnalloc = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [newDevice, setNewDevice] = useState({
        charger_id: '', charger_model: '', charger_type: '', model: '', type: '', gun_connector: '', max_current: '', created_date: '', status: '',
        assigned_association_date: '', assigned_client_date: '', assigned_reseller_date: '', charger_accessibility: '',
        client_commission: '', created_by: '', current_or_active_user: '', max_power: '', modified_by: '', modified_date: '',  wifi_module: '', bluetooth_module: '',
        reseller_commission: '', short_description: '', socket_count: '', vendor: '', wifi_password: '', connector_details: '', wifi_username: '',
    });

    useEffect(() => {
        const { charger } = location.state || {};
        if (charger) {
            setNewDevice({
                charger_id: charger.charger_id || '', charger_model: charger.charger_model || '', charger_type: charger.charger_type || '', model: charger.model || '', type: charger.type || '',
                gun_connector: charger.gun_connector || '', max_current: charger.max_current || '', created_date: charger.created_date || '',
                status: charger.status || '', assigned_association_date: charger.assigned_association_date || '',
                assigned_client_date: charger.assigned_client_date || '', assigned_reseller_date: charger.assigned_reseller_date || '',
                charger_accessibility: charger.charger_accessibility || '', client_commission: charger.client_commission || '',
                created_by: charger.created_by || '', current_or_active_user: charger.current_or_active_user || '',
                max_power: charger.max_power || '', modified_by: charger.modified_by || '', modified_date: charger.modified_date || '',
                reseller_commission: charger.reseller_commission || '', short_description: charger.short_description || '', wifi_username: charger.wifi_username || '',
                socket_count: charger.socket_count || '', vendor: charger.vendor || '', wifi_password: charger.wifi_password || '', connector_details: charger.connector_details || '',
                wifi_module: charger.wifi_module || '', bluetooth_module: charger.bluetooth_module || '',

            });
         // Save to localStorage
         localStorage.setItem('userData', JSON.stringify(charger));
        } else {
            // Load from localStorage if available
            const savedData = JSON.parse(localStorage.getItem('userData'));
            if (savedData) {
                setNewDevice(savedData);
            }
        }
    }, [location]);

    // back unallocated devices
    const goBack = () => {
        navigate('/reselleradmin/Unallocateddevice');
    };

  

    return {
        newDevice,
        setNewDevice,
        goBack
    }}
    export default useViewUnalloc;
