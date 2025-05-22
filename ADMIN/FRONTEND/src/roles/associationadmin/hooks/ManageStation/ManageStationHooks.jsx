import { useState, useEffect, useCallback } from 'react';
import { showErrorAlert, showSuccessAlert } from '../../../../utils/alert';
import axiosInstance from '../../../../utils/utils';

const useManageStation = (userInfo) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const [stationData, setStationData] = useState({
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
  });

const [previouslySelectedChargerId, setPreviouslySelectedChargerId] = useState('');
const [isChargersLoading, setIsChargersLoading] = useState(false);
const [removeModalOpen, setRemoveModalOpen] = useState(false);
const [removeStationId, setRemoveStationId] = useState(null);
const [removeChargerId, setRemoveChargerId] = useState(null);

  const [selectedChargers, setSelectedChargers] = useState('');
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [chargers, setChargers] = useState([]); // For charger dropdown
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [selectedChargerId, setSelectedChargerId] = useState('');

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [allocatedChargers, setAllocatedChargers] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal styles
  const modalAddStyle = {
    display: showAddForm ? 'block' : 'none',
  };

  // Table styling
  const [theadsticky, setTheadsticky] = useState('sticky');
  const [theadfixed, setTheadfixed] = useState('fixed');
  const [theadBackgroundColor, setTheadBackgroundColor] = useState('white');

  const handleAddStationToggle = () => {
    setShowAddForm((prev) => !prev);
    setTheadsticky(theadsticky === 'sticky' ? '' : 'sticky');
    setTheadfixed(theadfixed === 'fixed' ? 'transparent' : 'fixed');
    setTheadBackgroundColor(theadBackgroundColor === 'white' ? 'transparent' : 'white');
  };


  const openRemoveModal = (station_id, charger_id) => {
  setRemoveStationId(station_id);
  setRemoveChargerId(charger_id);
  setRemoveModalOpen(true);
};

const closeRemoveModal = () => {
  setRemoveStationId(null);
  setRemoveChargerId(null);
  setRemoveModalOpen(false);
};

  const closeAddModal = () => {
    setStationData({
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
    });
    setShowAddForm(false);
    setTheadsticky('sticky');
    setTheadfixed('fixed');
    setTheadBackgroundColor('white');
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChargerInputChange = (index, field, value) => {
    const updatedChargers = [...stationData.chargers];
    updatedChargers[index] = { ...updatedChargers[index], [field]: value };
    setStationData((prev) => ({ ...prev, chargers: updatedChargers }));
  };

  const addStation = async (e) => {
    e.preventDefault();

    if (
      !stationData.location_id ||  
      !stationData.station_address ||
      !stationData.landmark ||
      !stationData.network ||
      !stationData.availability ||
      !stationData.accessibility ||
      !stationData.latitude ||
      !stationData.longitude ||
      !stationData.charger_type ||
      (Array.isArray(stationData.chargers) && stationData.chargers.some(charger => !charger.name?.trim()))
    ) {
      return showErrorAlert('Error', 'Please fill all required fields.');
    }

    try {
      setLoading(true);

      const payload = {
        ...stationData,
        association_id: userInfo.association_id,
        created_by: userInfo.email_id,
      };

      const response = await axiosInstance.post('/associationadmin/Addstation', payload);

      if (response.data.status === 'Success') {
        showSuccessAlert('Charging station added successfully');
        closeAddModal();
        fetchStations();
      } else {
        showErrorAlert('Error', response.data.message || 'Failed to add station');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unexpected error occurred';
      showErrorAlert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all stations for this association
  const fetchStations = async () => {
  setIsLoading(true);
  try {
    const response = await axiosInstance.post('/associationadmin/GetAssociationStation', {
      association_id: userInfo.association_id,
    });

    const data = response.data?.data || [];
    setStations(data);
    setFilteredStations(data);

    // Create a flat array of chargers with charger_id and assigned station_id
    const chargersList = data.flatMap(station =>
      station.chargers.map(chargerId => ({
        charger_id: chargerId,
        station_id: station.station_id,
      }))
    );

    setAllocatedChargers(chargersList);
  } catch (err) {
    console.error("Error fetching stations:", err);
    setError('Failed to fetch stations');
  } finally {
    setIsLoading(false);
  }
};



  const handleSearchInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    const filtered = stations.filter((station) =>
      station.station_address?.toUpperCase().includes(value)
    );
    setFilteredStations(filtered);
  };

//   const handlelatlongvalidation = (e) => {
//   const { name, value } = e.target;

//   // Regex: optional "-" at the beginning, digits, optional one "."
//   const isValidNumber = /^-?\d*\.?\d*$/.test(value);

//   if (isValidNumber) {
//     setStationData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   }
// };


  const fetchAllocatedChargersList = useCallback(async () => {
  try {
    setIsChargersLoading(true);
    const response = await axiosInstance.post('/associationadmin/FetchAllocatedChargerByClientToAssociation', {
      association_id: userInfo.association_id,
    });
    if (response.data.status === 'Success') {
      setAllocatedChargers(response.data.data || []);
    } else {
      setAllocatedChargers([]);
    }
  } catch (err) {
    setAllocatedChargers([]);
    console.error('Error fetching allocated chargers:', err);
  } finally {
    setIsChargersLoading(false);
  }
}, [userInfo.association_id]);


  useEffect(() => {
    if (assignModalOpen) {
      fetchAllocatedChargersList();
    }
  }, [assignModalOpen, fetchAllocatedChargersList]);

  const openAssignModal = (station) => {
  console.log("Station chargers:", station.chargers);
  setSelectedStation(station);
  setSelectedStationId(station.station_id);
  setSelectedChargerId('');
  setPreviouslySelectedChargerId(station.chargers?.slice(-1)[0] || '');
  setAssignModalOpen(true);
};



  // Close assign modal
  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedStation(null);
    setSelectedChargerId('');
  };

  // Assign charger to station
  const assignChargerToStation = async (e) => {
    e.preventDefault();

    if (!selectedChargerId) {
      return showErrorAlert('Error', 'Please select a charger ID to assign.');
    }

    // Check if the charger is already assigned to this station
    const alreadyAssigned = allocatedChargers.some(
      (charger) =>
        charger.charger_id === selectedChargerId &&
        charger.station_id === selectedStationId
    );

    if (alreadyAssigned) {
      return showErrorAlert('Error', 'Charger is already assigned to this station.');
    }

    try {
      setAssignLoading(true);
      const payload = {
        station_id: selectedStationId,
        charger_id: selectedChargerId,
        association_id: userInfo.association_id,
        modified_by: userInfo.email_id,
      };

      const response = await axiosInstance.post('/associationadmin/assignstationtocharger', payload);

      if (response.data.status === 'Success') {
        showSuccessAlert('Success', 'Station assigned to charger successfully.');
        closeAssignModal();
        await fetchStations();
        await fetchAllocatedChargersList();
      } else {
        showErrorAlert('Error', response.data.message || 'Failed to assign station.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unexpected error occurred.';
      showErrorAlert('Error', msg);
    } finally {
      setAssignLoading(false);
    }
  };

  // New: Remove charger from station
 const removeChargerFromStation = async (station_id, charger_id) => {
  if (!station_id || !charger_id) {
    return showErrorAlert('Error', 'Station ID and Charger ID are required to remove.');
  }

  try {
    setLoading(true);
    const payload = {
      station_id,
      charger_id,
      association_id: userInfo.association_id,
      modified_by: userInfo.email_id,
    };

    const response = await axiosInstance.post(`/associationadmin/removechargerfromstation`, payload);

    if (response.data.status === 'Success') {
      showSuccessAlert('Success', 'Charger removed from station successfully.');
       fetchStations();
       fetchAllocatedChargersList();
    } else {
      showErrorAlert('Error', response.data.message || 'Failed to remove charger from station.');
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Unexpected error occurred.';
    showErrorAlert('Error', msg);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (userInfo?.association_id) {
      fetchStations();
    }
  }, [userInfo]);
  const handleRemoveCharger = (station_id, charger_id) => {
  if (window.confirm(`Remove charger ${charger_id} from station ${station_id}?`)) {
    removeChargerFromStation(station_id, charger_id); // Your remove logic here
  }
};

  return {
    stationData,
    selectedChargerId,
    setStationData,
    handleInputChange,
    stations,
    filteredStations,
    isLoading,
    loading,
    error,
    showAddForm,
    modalAddStyle,
    theadsticky,
    theadfixed,
    theadBackgroundColor,
    handleAddStationToggle,
    closeAddModal,handleRemoveCharger,
    addStation,
    handleSearchInputChange,
    handleChargerInputChange,
    assignModalOpen,
    openAssignModal,
    closeAssignModal,
    selectedStation,
    selectedStationId,
    assignChargerToStation,
    assignLoading,
    allocatedChargers,
    setSelectedChargerId,
    selectedChargers,
    setSelectedChargers,openRemoveModal,closeRemoveModal,removeModalOpen,removeStationId,removeChargerFromStation,setRemoveChargerId,
  removeChargerId, isChargersLoading
  };
};

export default useManageStation;
