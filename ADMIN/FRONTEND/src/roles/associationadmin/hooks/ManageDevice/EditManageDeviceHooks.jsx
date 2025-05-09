import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {showSuccessAlert,showErrorAlert} from '../../../../utils/alert';
import axiosInstance from '../../../../utils/utils';
const useEditManageDevice = (userInfo) => {
    const location = useLocation();
    const dataItem = location.state?.deviceData || JSON.parse(localStorage.getItem('editDeviceData'));
    localStorage.setItem('editDeviceData', JSON.stringify(dataItem));
    const navigate = useNavigate();

    const [latitude, setLatitude] = useState(dataItem?.lat || '');
    const [longitude, setLongitude] = useState(dataItem.long || '');
    // eslint-disable-next-line
    const [landmark,setLandmark]=useState(dataItem.landmark || ''
    );
    const [tempLandmark, setTempLandmark] = useState(landmark);

    const [address, setAddress] = useState(dataItem?.address || '');
    const [wifiUsername, setWifiUsername] = useState(dataItem.wifi_username || '');
    const [wifiPassword, setWifiPassword] = useState(dataItem.wifi_password || '');
    const [selectStatus, setSelectedStatus] = useState(dataItem?.charger_accessibility || '');
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [tempLat, setTempLat] = useState(latitude);
    const [tempLong, setTempLong] = useState(longitude);
    const [tempAddress, setTempAddress] = useState(address);
    const [isLoading, setIsLoading] = useState(false);
    const [initialValues, setInitialValues] = useState({
        lat: dataItem?.lat || '',
        long: dataItem.long || '',
        address: dataItem.address || '',
        landmark: dataItem.landmark || '', 
        wifi_username: dataItem.wifi_username || '',
        wifi_password: dataItem.wifi_password || '',
        charger_accessibility: dataItem?.charger_accessibility || ''
    });
    

    const isModified = (
        latitude !== initialValues.lat ||
        longitude !== initialValues.long ||
        address !== initialValues.address ||
        landmark !== initialValues.landmark || 
        wifiUsername !== initialValues.wifi_username ||
        wifiPassword !== initialValues.wifi_password ||
        selectStatus !== initialValues.charger_accessibility
    );
    

    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
    };

    const backManageDevice = () => {
        navigate('/associationadmin/ViewManageDevice');
    };

    const editBackManageDevice = () => {
        navigate('/associationadmin/ManageDevice');
    };

    const editManageDevice = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Start loading
        try {
            const Status = parseInt(selectStatus);
            const response = await axiosInstance.post('/associationadmin/UpdateDevice', {
                charger_id: dataItem.charger_id,
                charger_accessibility: Status,
                lat: latitude,
                long: longitude,
                address,
                landmark,
                wifi_username: wifiUsername,
                wifi_password: wifiPassword,
                modified_by: userInfo.email_id
            });
    
            const data = response.data;
    
            if (response.status === 200 && data.status === "Success") {
                showSuccessAlert("Device updated successfully");
                setLatitude('');
                setLongitude('');
                setWifiUsername('');
                setWifiPassword('');
                setAddress('');
                editBackManageDevice();
            } else {
                // If 200 but not "Success"
                showErrorAlert("Error", data.message || "Failed to update device");
            }
        } catch (error) {
            console.error('Error updating device:', error);
    
            if (error.response && error.response.data) {
                showErrorAlert("Error", error.response.data.message || "An error occurred while updating the device");
            } else {
                showErrorAlert("Error", "Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false); // Stop loading
        }
    };
    
    
    

    useEffect(() => {
        setInitialValues({
            lat: dataItem?.lat || '',
            long: dataItem.long || '',
            address: dataItem.address || '',
            landmark: dataItem.landmark || '', // ✅ Add this
            wifi_username: dataItem.wifi_username || '',
            wifi_password: dataItem.wifi_password || '',
            charger_accessibility: dataItem?.charger_accessibility || ''
        });
    }, [dataItem]);
    

    const isLocationModified = (
        tempLat !== latitude ||
        tempLong !== longitude ||
        tempAddress !== address ||
        tempLandmark !== landmark
    );

    return {
        dataItem,
        latitude,longitude,
        setLatitude,setLongitude,
        landmark,setLandmark,
        tempLandmark,setTempLandmark,
        address, setAddress,
        wifiUsername, setWifiUsername,
        wifiPassword, setWifiPassword,
        selectStatus, setSelectedStatus,
        isLocationModalOpen, setIsLocationModalOpen,
        tempLat, setTempLat,
        tempLong, setTempLong,
        tempAddress, setTempAddress,
        initialValues, setInitialValues,
        isModified,handleStatusChange,
        backManageDevice,
        editBackManageDevice,
        editManageDevice,
        isLocationModified,isLoading
    }}
    export default useEditManageDevice;