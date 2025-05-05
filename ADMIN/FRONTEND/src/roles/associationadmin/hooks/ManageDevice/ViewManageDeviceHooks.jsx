import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const useViewManageDevice = (userInfo) => {
    const location = useLocation();
    const [deviceData, setDeviceData] = useState({
        charger_id: '', charger_model: '', charger_type: '', model: '', type: '', vendor: '', gun_connector: '',
        max_current: '', max_power: '', socket_count: '', current_active_user: '', client_commission: '',
        ip: '', lat: '', long: '', landmark: '', short_description: '', charger_accessibility: '',
        unit_price: '', assigned_user: '', wifi_username: '', wifi_password: '', created_by: '', created_date: '',
        modified_by: '', modified_date: '', status: '', _id: '', connector_details: '', wifi_module: '', bluetooth_module: '',
    });

    useEffect(() => {
        const { dataItem } = location.state || {};
        if (dataItem) {
            setDeviceData({
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
                client_commission: dataItem.client_commission || '',
                ip: dataItem.ip || '',
                lat: dataItem.lat || '',
                long: dataItem.long || '',
                address:dataItem.address||'',
                landmark: dataItem.landmark || '',
                short_description: dataItem.short_description || '',
                charger_accessibility: dataItem.charger_accessibility || '',
                unit_price: dataItem.unit_price || '',
                assigned_user: dataItem.assigned_user || '',
                wifi_username: dataItem.wifi_username || '',
                wifi_password: dataItem.wifi_password || '',
                created_by: dataItem.created_by || '',
                created_date: dataItem.created_date || '',
                modified_by: dataItem.modified_by || '',
                modified_date: dataItem.modified_date || '',
                status: dataItem.status || '', connector_details: dataItem.connector_details || '',
                wifi_module: dataItem.wifi_module || '', bluetooth_module: dataItem.bluetooth_module || '',
              
                _id: dataItem._id || '',
            });
            // Save to localStorage
            localStorage.setItem('deviceData', JSON.stringify(dataItem));
        } else {
            // Load from localStorage if available
            const savedData = JSON.parse(localStorage.getItem('deviceData'));
            if (savedData) {
                setDeviceData(savedData);
            }
        }
    }, [location]);

    const navigate = useNavigate();
    
    // Back manage device
    const handleBack = () => {
        navigate('/associationadmin/ManageDevice');
    };

    // Edit manage device
    const handleEditManageDevice = (deviceData) => {
        navigate('/associationadmin/EditManageDevice', { state: { deviceData } });
    };

    // Timestamp data 
    

    return {
        deviceData,
        setDeviceData,
        handleBack,
        handleEditManageDevice,



    }}
    export default useViewManageDevice;