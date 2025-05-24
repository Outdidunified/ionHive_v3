import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';
import { showErrorAlert, showSuccessAlert } from '../../../../utils/alert';

const useEditChargingStation = (userInfo) => {
  const navigate = useNavigate();
  const location = useLocation();

  let dataItem = location.state?.stationData;
  if (dataItem) {
    localStorage.setItem('editStationData', JSON.stringify(dataItem));
  } else {
    dataItem = JSON.parse(localStorage.getItem('editStationData'));
  }

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [locationId, setLocationId] = useState(dataItem?.location_id || '');
const [accessibilityError, setAccessibilityError] = useState('');

  const [stationId, setStationId] = useState(dataItem?.station_id || '');
  const [associationId, setAssociationId] = useState(dataItem?.association_id || '');
  const [stationAddress, setStationAddress] = useState(dataItem?.station_address || '');
  const [landmark, setLandmark] = useState(dataItem?.landmark || '');
  const [network, setNetwork] = useState(dataItem?.network || '');
  const [availability, setAvailability] = useState(dataItem?.availability || '');
  const [latitude, setLatitude] = useState(dataItem?.latitude || '');
  const [longitude, setLongitude] = useState(dataItem?.longitude || '');
  const [chargerType, setChargerType] = useState(dataItem?.charger_type || '');
  const [chargers, setChargers] = useState(dataItem?.chargers || []);
const [status, setStatus] = useState(
  dataItem?.status === true ? 'active' :
  dataItem?.status === false ? 'inactive' : 'active'
);

  const isModified = (
  stationAddress !== dataItem?.station_address ||
  landmark !== dataItem?.landmark ||
  network !== dataItem?.network ||
  availability !== dataItem?.availability ||
  latitude !== dataItem?.latitude ||
  longitude !== dataItem?.longitude ||
  locationId !== dataItem?.location_id || // <-- add this check
  chargerType !== dataItem?.charger_type ||
  JSON.stringify(chargers) !== JSON.stringify(dataItem?.chargers) ||
  status !== (dataItem?.status === true ? 'active' : 'inactive')
);


const handleLocationIdChange = (e) => {
  const filteredValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
  setLocationId(filteredValue);
};


  const goBackToManageStations = () => {
    navigate('/associationadmin/ManageStation');
  };

  const updateStation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (!stationAddress || !latitude || !longitude || !chargerType) {
      setErrorMessage('Please fill in all required fields');
      setLoading(false);
      return;
    }

   const payload = {
  station_id: stationId,
  modified_by: userInfo.email_id,
  station_address: stationAddress,
  landmark,
  network,
  availability,
  latitude,
  longitude,
    location_id: locationId,
  charger_type: chargerType,
  chargers,
  status: status === 'active' ? true : false,  // Convert string to boolean here
};


    try {
      const response = await axiosInstance.post('/associationadmin/UpdateStation', payload);
      if (response.data.status === 'Success') {
        showSuccessAlert('Charging station updated successfully');
        goBackToManageStations();
      } else {
        showErrorAlert('Error', response.data.message || 'Failed to update station');
      }
    } catch (error) {
      console.error('Update error:', error);
      showErrorAlert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading, errorMessage,
    stationAddress, setStationAddress,
    landmark, setLandmark,
    network, setNetwork,
    availability, setAvailability,
    latitude, setLatitude,
    longitude, setLongitude,
    chargerType, setChargerType,
    chargers, setChargers,
    status, setStatus,
    isModified,
      locationId, setLocationId, 
handleLocationIdChange,
    updateStation,
    goBackToManageStations,
  };
};

export default useEditChargingStation;
