import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../../utils/utils';
import { showErrorAlert, showWarningAlert, showSuccessAlert } from '../../../../utils/alert';

const useAssignReseller = (userInfo, backManageDevice) => {
  const [chargers, setChargers] = useState([]);
  const [resellers, setResellers] = useState([]);
  const [reseller_id, setSelectedReseller] = useState('');
  const [charger_ids, setSelectedChargers] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const FetchSpecificUserRoleForSelectionCalled = useRef(false);
  const FetchUnAllocatedChargerToAssginCalled = useRef(false);
  const [loading, setLoading] = useState(false);

  // Fetch Resellers
  useEffect(() => {
    if (!FetchSpecificUserRoleForSelectionCalled.current) {
      axiosInstance({
        method: 'get', // GET method to fetch resellers
        url: '/superadmin/FetchResellersToAssgin', // Endpoint to fetch resellers
      })
        .then((res) => setResellers(res.data.data))
        .catch((err) => console.error('Error fetching resellers:', err));

      FetchSpecificUserRoleForSelectionCalled.current = true;
    }
  }, []);

  // Fetch Unallocated Chargers
  useEffect(() => {
    if (!FetchUnAllocatedChargerToAssginCalled.current) {
      axiosInstance({
        method: 'get', // GET method to fetch unallocated chargers
        url: '/superadmin/FetchUnAllocatedChargerToAssgin', // Endpoint to fetch unallocated chargers
      })
        .then((res) => setChargers(res.data.data))
        .catch((err) => console.error('Error fetching unallocated chargers:', err));

      FetchUnAllocatedChargerToAssginCalled.current = true;
    }
  }, []);

  // Handle reseller selection
  const handleResellerChange = (e) => {
    setSelectedReseller(e.target.value);
  };

  // Handle charger checkbox toggle
  const handleChargerChange = (e) => {
    const value = e.target.value;
    setSelectedChargers((prev) =>
      prev.includes(value) ? prev.filter((id) => id !== value) : [...prev, value]
    );
  };

  // Handle model selection
  const handleModelChange = (model) => {
    setSelectedModel(model);
  };

  // Filter chargers by selected model
  const filteredChargers = selectedModel
    ? chargers.filter((charger) => charger.charger_model === selectedModel)
    : chargers;

  // Submit form: assign chargers to reseller
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (charger_ids.length === 0) {
      showWarningAlert('No Charger Selected', 'Please select at least one charger to assign.');
      return;
    }
  
    try {
      setLoading(true);
  
      const response = await axiosInstance({
        method: 'post', // POST method to assign chargers to reseller
        url: '/superadmin/AssginChargerToReseller', // Endpoint for assigning chargers
        data: {
          reseller_id: parseInt(reseller_id),
          charger_ids,
          modified_by: userInfo.email_id,
        },
      });
  
      if (response.status === 200) {
        showSuccessAlert('Success', 'Charger assigned successfully');
        backManageDevice();
      } else {
        showErrorAlert('Error', 'Failed to assign charger, please try again later.');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'An error occurred while assigning the charger.';
      showErrorAlert('Error assigning charger', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    chargers,
    resellers,
    reseller_id,
    charger_ids,
    selectedModel,
    filteredChargers,
    handleResellerChange,
    handleChargerChange,
    handleModelChange,
    handleSubmit,
    loading,
  };
};

export default useAssignReseller;
