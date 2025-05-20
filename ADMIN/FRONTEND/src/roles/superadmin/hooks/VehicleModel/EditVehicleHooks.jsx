import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';
import { showErrorAlert, showSuccessAlert } from '../../../../utils/alert';

const useEditVehicleModel = (userInfo) => {
  const location = useLocation();
  const navigate = useNavigate();

let dataItem = location.state?.vehicleData;
if (dataItem) {
  localStorage.setItem('editVehicleData', JSON.stringify(dataItem));
} else {
  dataItem = JSON.parse(localStorage.getItem('editVehicleData'));
}




  const [loading, setLoading] = useState(false);

  // Vehicle form fields
  const [model, setModel] = useState(dataItem?.model || '');
  const [type, setType] = useState(dataItem?.type || '');
  const [vehicleCompany, setVehicleCompany] = useState(dataItem?.vehicle_company || '');
  const [batterySizeKwh, setBatterySizeKwh] = useState(dataItem?.battery_size_kwh || '');
  const [chargerType, setChargerType] = useState(dataItem?.charger_type || '');
  const [vehicleImage, setVehicleImage] = useState(dataItem?.vehicle_image || '');
  const [selectStatus, setSelectStatus] = useState(dataItem?.status ? 'true' : 'false');

  const [errorMessage, setErrorMessage] = useState('');

  // Initial values for change detection
  const [initialValues, setInitialValues] = useState({
    model: dataItem?.model || '',
    type: dataItem?.type || '',
    vehicle_company: dataItem?.vehicle_company || '',
    battery_size_kwh: dataItem?.battery_size_kwh || '',
    charger_type: dataItem?.charger_type || '',
    vehicle_image: dataItem?.vehicle_image || '',
    status: dataItem?.status ? 'true' : 'false',
  });

  // Detect if any field changed
  const isModified = (
    model !== initialValues.model ||
    type !== initialValues.type ||
    vehicleCompany !== initialValues.vehicle_company ||
    batterySizeKwh !== initialValues.battery_size_kwh ||
    chargerType !== initialValues.charger_type ||
    vehicleImage !== initialValues.vehicle_image ||
    selectStatus !== initialValues.status
  );

  // Handle status select change
  const handleStatusChange = (e) => {
    setSelectStatus(e.target.value);
  };

  // Navigate back to vehicle list page
  const goBackToManageVehicles = () => {
    navigate('/superadmin/ManageVehicle');
  };

  // Update vehicle details API call
 const updateVehicleModel = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrorMessage(''); // Clear any previous error

  // Required field validation
  if (!model || !type || !vehicleCompany || !batterySizeKwh || !chargerType) {
    setErrorMessage('All fields except image are required');
    setLoading(false);
    return;
  }

  // Battery Size: must be a valid positive number
  if (isNaN(batterySizeKwh) || Number(batterySizeKwh) <= 0) {
    setErrorMessage('Battery Size must be a positive number');
    setLoading(false);
    return;
  }

  const vehicle_id = dataItem?.vehicle_id;
  if (!vehicle_id) {
    setErrorMessage('Vehicle ID is missing');
    setLoading(false);
    return;
  }

  try {
    const formData = new FormData();
    formData.append('vehicle_id', vehicle_id);
    formData.append('model', model);
    formData.append('type', type);
    formData.append('vehicle_company', vehicleCompany);
    formData.append('battery_size_kwh', batterySizeKwh);
    formData.append('charger_type', chargerType);
    formData.append('modified_by', userInfo.email_id);

    if (vehicleImage instanceof File) {
      formData.append('vehicle_image', vehicleImage);
    }

    const response = await axiosInstance.post('/superadmin/UpdateVehicle', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.status === 'Success') {
      showSuccessAlert('Vehicle model updated successfully');
      goBackToManageVehicles();
    } else {
      showErrorAlert('Error', response.data.message || 'Failed to update vehicle model');
    }
  } catch (error) {
    console.error('Error updating vehicle model:', error);
    showErrorAlert('Error', error.response?.data?.message || 'An error occurred');
  } finally {
    setLoading(false);
  }
};



const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setVehicleImage(file); // Set File object
  }
};


  // Activate / Deactivate vehicle model API call
  

  // Sync initial values if dataItem changes
  useEffect(() => {
    setInitialValues({
      model: dataItem?.model || '',
      type: dataItem?.type || '',
      vehicle_company: dataItem?.vehicle_company || '',
      battery_size_kwh: dataItem?.battery_size_kwh || '',
      charger_type: dataItem?.charger_type || '',
      vehicle_image: dataItem?.vehicle_image || '',
      status: dataItem?.status ? 'true' : 'false',
    });
  }, [dataItem]);

  return {
    model, setModel,
    type, setType,
    vehicleCompany, setVehicleCompany,
    batterySizeKwh, setBatterySizeKwh,
    chargerType, setChargerType,
    vehicleImage, setVehicleImage,
    selectStatus, handleStatusChange,
    errorMessage,
    loading,
    isModified,
    updateVehicleModel,
    goBackToManageVehicles,handleImageChange
  };
};

export default useEditVehicleModel;
