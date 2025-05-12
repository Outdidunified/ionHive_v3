import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../../../utils/utils';
import { useNavigate } from 'react-router-dom';
import { showConfirmationAlert,showErrorAlert,showSuccessAlert } from '../../../../utils/alert';


const useAddManageDevice = (userInfo) => {
    const [loading, setLoading] = useState(false);

    const [charger_id, setChargerID] = useState('');
    const [charger_model, setModel] = useState('');
    const [vendor, setVendor] = useState('');
    const [maxCurrent, setMaxCurrent] = useState('');
    const [maxPower, setMaxPower] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectChargerType, setSelectedChargerType] = useState('');
    const [connectors, setConnectors] = useState([{ connector_id: 1, connector_type: '', type_name: '', typeOptions: [] }]);
    const [data, setData] = useState([]);
    const fetchDataCalled = useRef(false);
    const [errorMessageCurrent, setErrorMessageCurrent] = useState('');
    const [errorMessagePower, setErrorMessagePower] = useState('');
    const [wifi_module, setWiFiModule] = useState('');
    const [bluetooth_module, setBluetoothModule] = useState('');
    const navigate = useNavigate();

    // Set timeout to clear error messages
    useEffect(() => {
        if (errorMessageCurrent) {
            const timeout = setTimeout(() => setErrorMessageCurrent(''), 5000);
            return () => clearTimeout(timeout);
        }
        if (errorMessagePower) {
            const timeout = setTimeout(() => setErrorMessagePower(''), 5000);
            return () => clearTimeout(timeout);
        }
        if (errorMessage) {
            const timeout = setTimeout(() => setErrorMessage(''), 5000);
            return () => clearTimeout(timeout);
        }
    }, [errorMessageCurrent, errorMessagePower, errorMessage]);

    // Fetch charger data on component mount
    useEffect(() => {
        if (!fetchDataCalled.current) {
            const url = '/superadmin/FetchCharger';
            axiosInstance.get(url)
                .then((res) => {
                    setData(res.data.data);
                })
                .catch((err) => {
                    console.error('Error fetching data:', err);
                    setErrorMessage('Error fetching data. Please try again.');
                });

            fetchDataCalled.current = true;
        }
    }, []);

    // Clone data
    const handleClone = (cloneModel) => {
        const selectedModelData = data.find(item => item.charger_model === cloneModel);
        if (selectedModelData) {
            setModel(selectedModelData.charger_model);
            setVendor(selectedModelData.vendor);
            setMaxCurrent(selectedModelData.max_current);
            setMaxPower(selectedModelData.max_power);
            setSelectedChargerType(selectedModelData.charger_type);
            setWiFiModule(selectedModelData.wifi_module);
            setBluetoothModule(selectedModelData.bluetooth_module);
        }
    };

    const backManageDevice = () => {
        navigate('/superadmin/ManageDevice');
    };

     // Select model 
     const handleModel = (e) => {
        setModel(e.target.value);
    };

    // Select charger type
    const handleChargerType = (e) => {
        setSelectedChargerType(e.target.value);
    };

    // Select WiFiModule 
    const handleWiFiModule = (e) => {
        setWiFiModule(e.target.value);
    };

    // Select BluetoothModule
    const handleBluetoothModule = (e) => {
        setBluetoothModule(e.target.value);
    };

    // Add or remove connectors
    const addConnector = () => {
        setConnectors([...connectors, { connector_id: connectors.length + 1, connector_type: '', type_name: '', typeOptions: [] }]);
    };

    const removeConnector = (index) => {
        showConfirmationAlert({
            title: "Are you sure?",
            text: "Do you really want to remove this connector?",
            confirmButtonText: "Yes, remove it!",
            cancelButtonText: "No, keep it",
          }).then((result) => {
            if (result.isConfirmed) {
              const updatedConnectors = connectors.filter((_, idx) => idx !== index);
              setConnectors(updatedConnectors);
              showSuccessAlert("The connector has been removed.");
            }
          });
          
    };

    // Update connector dynamically
    const handleConnectorChange = (index, field, value) => {
        const updatedConnectors = connectors.map((connector, idx) =>
            idx === index ? { ...connector, [field]: value } : connector
        );
        setConnectors(updatedConnectors);
    };

    // Fetch connector options from the backend
    const updateConnectors = useCallback(async (updatedConnector) => {
        try {
            const res = await axiosInstance.post('/superadmin/fetchConnectorTypeName', {
                connector_type: updatedConnector.connector_type
            });

            if (res.data && res.data.status === 'Success') {
                if (typeof res.data.data === 'string' && res.data.data === 'No details were found') {
                    setErrorMessage('No details were found');
                    setConnectors([]); // Clear connectors if no details found
                } else if (Array.isArray(res.data.data)) {
                    const newConnectors = [...connectors];
                    newConnectors[updatedConnector.index].typeOptions = res.data.data.map(option => option.output_type_name);
                    setConnectors(newConnectors);
                    setErrorMessage(null); // Clear any previous error message
                }
            } else {
                setErrorMessage('Error fetching data. Please try again.');
            }
        } catch (err) {
            console.error('Error updating connectors:', err);
            setErrorMessage('No details were found');
            setConnectors([]); // Clear connectors if an error occurs
        }
    }, [connectors]);

    const handleConnectorType = (index, field, value) => {
        const updatedConnectors = [...connectors];
        updatedConnectors[index][field] = value;
        setConnectors(updatedConnectors);
        updateConnectors({ ...updatedConnectors[index], index });
    };

  const addManageDevice = async (e) => {
  e.preventDefault();
  setLoading(true);

  // Validate charger ID
  const chargerIDRegex = /^[a-zA-Z0-9]{1,14}$/;
  if (!charger_id) {
    setErrorMessage("Charger ID can't be empty.");
    setLoading(false);
    return;
  }
  if (!chargerIDRegex.test(charger_id)) {
    setErrorMessage("Oops! Charger ID must be alphanumeric and up to 14 characters.");
    setLoading(false);
    return;
  }

  // Validate vendor
  const vendorRegex = /^[a-zA-Z0-9 ]{1,20}$/;
  if (!vendor) {
    setErrorMessage("Vendor name can't be empty.");
    setLoading(false);
    return;
  }
  if (!vendorRegex.test(vendor)) {
    setErrorMessage('Oops! Vendor name must be 1 to 20 characters and contain alphanumeric characters.');
    setLoading(false);
    return;
  }

  // Validate connectors
  const validConnectors = connectors.filter(conn => conn.connector_type && conn.typeOptions.length > 0);
  if (validConnectors.length === 0) {
    showErrorAlert("No Connectors Found", "Connectors not available");
    setLoading(false);
    return;
  }

  try {
    const max_current = parseInt(maxCurrent);
    const max_power = parseInt(maxPower);

    const payload = {
      charger_id,
      charger_model,
      charger_type: selectChargerType,
      connectors,
      vendor,
      max_current,
      max_power,
      bluetooth_module,
      wifi_module,
      created_by: userInfo.email_id,
    };

    // Make the POST request with explicit method
    const response = await axiosInstance({
      method: 'post',  // Explicitly define the method here
      url: '/superadmin/CreateCharger',
      data: payload,
    });
    setLoading(false);

    if (response.data.status === 'Success') {
      showSuccessAlert("Charger added successfully");

      // Reset form fields
      setChargerID('');
      setModel('');
      setSelectedChargerType('');
      setVendor('');
      setMaxCurrent('');
      setMaxPower('');
      setWiFiModule('');
      setBluetoothModule('');
      setConnectors([{ connector_id: 1, connector_type: '', type_name: '', typeOptions: [] }]);

      backManageDevice();
    } else {
      showErrorAlert("Error", `Failed to add charger: ${response.data.message}`);
    }
  } catch (error) {
    setLoading(false);
    const errorMessage = error?.response?.data?.message || error.message;
    showErrorAlert("Error", `An error occurred while adding the charger: ${errorMessage}`);
  }
};


    
useEffect(() => {
  if (!fetchDataCalled.current) {
    const url = '/superadmin/FetchCharger';  // Use the relative path

    // Explicitly define the method as 'get'
    axiosInstance({
      method: 'get',  // Explicitly define the method here
      url: url,
    })
      .then((res) => {
        setData(res.data.data);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setErrorMessage('Error fetching data. Please try again.');
      });

    fetchDataCalled.current = true;
  }
}, []);


    return {
        charger_id,
        loading,
        charger_model,
        vendor,
        maxCurrent,
        maxPower,
        errorMessage,
        selectChargerType,
        connectors,
        data,
        errorMessageCurrent,
        errorMessagePower,
        wifi_module,
        bluetooth_module,
        setErrorMessageCurrent,
        setErrorMessagePower,
        handleBluetoothModule,
        handleChargerType,
        handleModel,
        setChargerID,
        setModel,
        setVendor,
        setMaxCurrent,
        setMaxPower,
        setSelectedChargerType,
        setConnectors,
        handleClone,
        addConnector,
        removeConnector,
        handleConnectorChange,
        handleConnectorType,
        setWiFiModule,
        setBluetoothModule,
        addManageDevice,handleWiFiModule
    };
};

export default useAddManageDevice;
