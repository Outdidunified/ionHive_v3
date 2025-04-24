import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useViewManageDevice = () => {
    const location = useLocation();
    const [newUser, setNewUser] = useState({
        charger_id: '', charger_model: '', charger_type: '', model: '', type: '', vendor: '', gun_connector: '',
        max_current:'', max_power:'', socket_count:'', current_active_user:'',
        superadmin_commission: '', reseller_commission: '', client_commission: '', ip: '', lat: '', long: '',
        landmark: '', short_description: '', charger_accessibility: '', unit_price: '', assigned_user: '',
        wifi_password: '', status: '', created_by:'', created_date:'', modified_by:'', modified_date:'',
        connector_details: '', wifi_module: '', bluetooth_module: '', _id: '',
    });

    useEffect(() => {
        const { dataItem } = location.state || {};
        if (dataItem) {
            setNewUser({
                charger_id: dataItem.charger_id || '',
                charger_model: dataItem.charger_model || '',
                charger_type: dataItem.charger_type || '',
                model: dataItem.model || '',
                type: dataItem.type || '',
                vendor: dataItem.vendor || '',
                gun_connector: dataItem.gun_connector || '',
                max_current: dataItem.max_current || '',
                max_power: dataItem.max_power || '',
                socket_count: dataItem.socket_count || '',
                current_active_user: dataItem.current_active_user || '',
                superadmin_commission: dataItem.superadmin_commission || '',
                reseller_commission: dataItem.reseller_commission || '',
                client_commission: dataItem.client_commission || '',
                ip: dataItem.ip || '',
                lat: dataItem.lat || '',
                long: dataItem.long || '',
                landmark: dataItem.landmark || '',
                short_description: dataItem.short_description || '',
                charger_accessibility: dataItem.charger_accessibility || '',
                unit_price: dataItem.unit_price || '',
                assigned_user: dataItem.assigned_user || '',
                wifi_password: dataItem.wifi_password || '',
                created_by: dataItem.created_by || '',
                created_date: dataItem.created_date || '',
                modified_by: dataItem.modified_by || '',
                modified_date: dataItem.modified_date || '',
                status: dataItem.status || '',
                connector_details: dataItem.connector_details || '',
                wifi_module: dataItem.wifi_module || '',
                bluetooth_module: dataItem.bluetooth_module || '',
                _id: dataItem._id || '',
            });
            localStorage.setItem('userData', JSON.stringify(dataItem));
        } else {
            const savedData = JSON.parse(localStorage.getItem('userData'));
            if (savedData) {
                setNewUser(savedData);
            }
        }
    }, [location]);

    return { newUser, setNewUser };
};
