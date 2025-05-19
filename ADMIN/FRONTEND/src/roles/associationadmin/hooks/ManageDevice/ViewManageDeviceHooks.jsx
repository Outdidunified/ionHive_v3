import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useViewManageDevice = (userInfo) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [deviceData, setDeviceData] = useState({
    charger_id: '',
    charger_model: '',
    charger_type: '',
    model: '',
    type: '',
    vendor: '',
    gun_connector: '',
    max_current: '',
    max_power: '',
    socket_count: '',
    current_active_user: '',
    client_commission: '',
    ip: '',
    lat: '',
    long: '',
    address: '',
    landmark: '',
    short_description: '',
    charger_accessibility: '',
    unit_price: '',
    assigned_user: '',
    wifi_username: '',
    wifi_password: '',
    created_by: '',
    created_date: '',
    modified_by: '',
    modified_date: '',
    status: '',
    _id: '',
    connector_details: '',
    wifi_module: '',
    bluetooth_module: '',
    station_details: {
      _id: '',
      station_id: '',
      association_id: '',
      location_id: '',
      station_address: '',
      landmark: '',
      network: '',
      availability: '',
      accessibility: '',
      latitude: '',
      longitude: '',
      charger_type: '',
      chargers: [],
      status: '',
      created_by: '',
      created_at: '',
      modified_by: '',
      modified_at: ''
    }
  });

  useEffect(() => {
    const { dataItem } = location.state || {};
    if (dataItem) {
      const combinedData = {
        ...dataItem,
        station_details: dataItem.station_details || {}
      };
      setDeviceData(combinedData);
      localStorage.setItem('deviceData', JSON.stringify(combinedData));
    } else {
      const savedData = JSON.parse(localStorage.getItem('deviceData'));
      if (savedData) {
        setDeviceData(savedData);
      }
    }
  }, [location]);

  const handleBack = () => {
    navigate('/associationadmin/ManageDevice');
  };

  const handleEditManageDevice = (deviceData) => {
    navigate('/associationadmin/EditManageDevice', { state: { deviceData } });
  };

  return {
    deviceData,
    setDeviceData,
    handleBack,
    handleEditManageDevice
  };
};

export default useViewManageDevice;
