import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useViewStation = () => {
  const location = useLocation();

  const [station, setStation] = useState({
    _id: '',
    location_id:'',
    station_id: '',
    association_id: '',
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
    modified_at: '',
  });

  useEffect(() => {
    const { dataItem } = location.state || {};
    console.log('dataItem from location.state:', dataItem);

    if (dataItem) {
      // If dataItem is an array, pick the first element
      const stationData = Array.isArray(dataItem) ? dataItem[0] : dataItem;

      setStation({
        _id: stationData._id || '',
        station_id: stationData.station_id || '',
        association_id: stationData.association_id || '',
        location_id:stationData.location_id || '',
        station_address: stationData.station_address || '',
        landmark: stationData.landmark || '',
        network: stationData.network || '',
        availability: stationData.availability || '',
        accessibility: stationData.accessibility || '',
        latitude: stationData.latitude || '',
        longitude: stationData.longitude || '',
        charger_type: stationData.charger_type || '',
        chargers: stationData.chargers || [],
        status: stationData.status !== undefined ? stationData.status : '',
        created_by: stationData.created_by || '',
        created_at: stationData.created_at || '',
        modified_by: stationData.modified_by || '',
        modified_at: stationData.modified_at || '',
      });

      // Save to localStorage for fallback
      localStorage.setItem('stationData', JSON.stringify(stationData));
    } else {
      // If no data in location.state, try loading from localStorage
      const savedData = JSON.parse(localStorage.getItem('stationData'));
      if (savedData) {
        setStation(savedData);
      }
    }
  }, [location]);

  return station;
};

export default useViewStation;
