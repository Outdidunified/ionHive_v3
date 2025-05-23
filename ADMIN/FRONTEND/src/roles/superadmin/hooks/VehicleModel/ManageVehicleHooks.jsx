import { useState, useEffect,useRef } from 'react';
import { showErrorAlert, showSuccessAlert } from '../../../../utils/alert';
import axiosInstance from '../../../../utils/utils';

const useManageVehicle = (userInfo) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    vehicle_id: '',
    model: '',
    type: '',
    vehicle_company: '',
    battery_size_kwh: '',
    charger_type: '',
    vehicle_image: '',
  });
  

  const [vehicleModels, setVehicleModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isloading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal styles
  const modalAddStyle = {
    display: showAddForm ? 'block' : 'none',
  };

  // Table styling
  const [theadsticky, setTheadsticky] = useState('sticky');
  const [theadfixed, setTheadfixed] = useState('fixed');
  const [theadBackgroundColor, setTheadBackgroundColor] = useState('white');

  // Toggle Add Modal
  const handleAddVehicleModel = () => {
    setShowAddForm((prev) => !prev);
    setTheadsticky(theadsticky === 'sticky' ? '' : 'sticky');
    setTheadfixed(theadfixed === 'fixed' ? 'transparent' : 'fixed');
    setTheadBackgroundColor(theadBackgroundColor === 'white' ? 'transparent' : 'white');
  };
  const fileInputRef = useRef(null);


  // Close Add Modal
 const closeAddModal = () => {
  setVehicleData({
    vehicle_id: '',
    model: '',
    type: '',
    vehicle_company: '',
    battery_size_kwh: '',
    charger_type: '',
    vehicle_image: '',
  });

  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }

  setShowAddForm(false);
  setTheadsticky('sticky');
  setTheadfixed('fixed');
  setTheadBackgroundColor('white');
  setError('');
};


  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData((prev) => ({ ...prev, [name]: value }));
  };

  // Add Vehicle Model API
  const addVehicleModel = async (e) => {
  e.preventDefault();

  const {
    model,
    type,
    vehicle_company,
    battery_size_kwh,
    charger_type,
    vehicle_image
  } = vehicleData;

  if (!type || !vehicle_company || !battery_size_kwh || !charger_type || !vehicle_image) {
    return showErrorAlert('Validation Error', 'All fields except Model are required');
  }

 

  try {
    setLoading(true);
    const formData = new FormData();
    formData.append('model', model);
    formData.append('type', type);
    formData.append('vehicle_company', vehicle_company);
    formData.append('battery_size_kwh', battery_size_kwh);
    formData.append('charger_type', charger_type);
    formData.append('vehicle_image', vehicle_image);
    formData.append('created_by', userInfo.email_id);

    const response = await axiosInstance.post('/superadmin/AddVehicle', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data.status === 'Success') {
      showSuccessAlert('Vehicle model added successfully');
      closeAddModal();
      fetchVehicleModels();
    } else {
      showErrorAlert('Error', response.data.message || 'Failed to add model');
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Unexpected error occurred';
    showErrorAlert('Error', message);
  } finally {
    setLoading(false);
  }
};



  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setVehicleData((prevData) => ({
            ...prevData,
            vehicle_image: file,
        }));
    }
};


  // Fetch Vehicle Models API
 const fetchVehicleModels = async () => {
  setIsLoading(true);
  try {
    const response = await axiosInstance.get('/superadmin/GetVehiclemodels');
    const data = response.data?.data || [];

    console.log("Vehicle Models Response Data:", data);

    // Log each image URL if available
    data.forEach((item, index) => {
      console.log(`Model ${index + 1} image:`, item.vehicle_image);
    });

    setVehicleModels(data);
    setFilteredModels(data);
  } catch (error) {
    console.error("Error fetching vehicle models:", error);
    setError('Failed to fetch vehicle models');
  } finally {
    setIsLoading(false);
  }
};

const updateVehicleModelStatus = async (status, vehicle_id) => {
  setLoading(true);

  try {
    const requestBody = {
      vehicle_id,
      status,
      modified_by: userInfo.email_id
    };

    const response = await axiosInstance.post('/superadmin/ActiveorDeactive', requestBody);

    if (response.data.status === 'Success') {
      showSuccessAlert(`Vehicle model is ${status ? 'activated' : 'deactivated'} successfully`);

      await fetchVehicleModels();
    } else {
      showErrorAlert('Error', response.data.message || 'Failed to update status');
    }
  } catch (error) {
    console.error('Error updating vehicle status:', error);
    showErrorAlert('Error', error.response?.data?.message || 'An error occurred');
  } finally {
    setLoading(false);
  }
};




  // Search Function
  const handleSearchInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    const filtered = vehicleModels.filter((model) =>
      model.model.toUpperCase().includes(value)
    );
    setFilteredModels(filtered);
  };

  useEffect(() => {
    fetchVehicleModels();
  }, []);

  return {
    vehicleData,
    setVehicleData,
    handleInputChange,
    vehicleModels,
    filteredModels,
    isloading,
    loading,
    error,
    showAddForm,
    modalAddStyle,
    theadsticky,handleFileChange,
    theadfixed,
    theadBackgroundColor,
    handleAddVehicleModel,
    closeAddModal,
    addVehicleModel,
    handleSearchInputChange,
    fetchVehicleModels,updateVehicleModelStatus,fileInputRef
  };
};

export default useManageVehicle;
