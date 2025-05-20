import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useViewVehicle = () => {
  const location = useLocation();
  
  const [vehicle, setVehicle] = useState({
    _id: '',
    vehicle_id: '',
    model: '',
    type: '',
    vehicle_company: '',
    battery_size_kwh: '',
    charger_type: '',
    vehicle_image: '',
    status: '',
    created_date: '',
    created_by:'',
    modified_by:'',
    modified_date: '',
  });

  useEffect(() => {
    const { dataItem } = location.state || {};
      console.log('dataItem from location.state:', dataItem);


    if (dataItem) {
    
      const vehicleData = Array.isArray(dataItem) ? dataItem[0] : dataItem;

     setVehicle({
  _id: vehicleData._id || '',
  vehicle_id: vehicleData.vehicle_id || vehicleData._id || '', // fallback to _id
  model: vehicleData.model || '',
  type: vehicleData.type || '',
  vehicle_company: vehicleData.vehicle_company || '',
  battery_size_kwh: vehicleData.battery_size_kwh || '',
  charger_type: vehicleData.charger_type || '',
  vehicle_image: vehicleData.vehicle_image || '',
  status: vehicleData.status || '',
  created_date: vehicleData.created_date || '',
  modified_date: vehicleData.modified_date || '',
  created_by:vehicleData.created_by||'',
  modified_by:vehicleData.modified_by|| '',
  vehicle_image:vehicleData.vehicle_image || '',
});


      // Save to localStorage for fallback
      localStorage.setItem('vehicleData', JSON.stringify(vehicleData));
    } else {
      // If no data in location.state, try loading from localStorage
      const savedData = JSON.parse(localStorage.getItem('vehicleData'));
      if (savedData) {
        setVehicle(savedData);
      }
    }
  }, [location]);

  return vehicle;
};

export default useViewVehicle;
