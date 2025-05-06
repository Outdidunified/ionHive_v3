import React, { useState, useEffect, useMemo,useCallback,useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { showErrorAlert,showSuccessAlert,showRemovalConfirmation,showRemovedAlert} from '../../../../utils/alert';
import axiosInstance from '../../../../utils/utils';


const useEditManageDevice = (userInfo) => {
    const location = useLocation();
    const dataItem = useMemo(() => {
        return location.state?.newUser || JSON.parse(localStorage.getItem('editDeviceData')) || {};
    }, [location.state]);

    useEffect(() => {
        localStorage.setItem('editDeviceData', JSON.stringify(dataItem));
    }, [dataItem]);

    const navigate = useNavigate();

    const backManageDevice = () => {
        navigate('/superadmin/Allocateddevice');
    };

    
    
    const handleModel = (e) => {
        setModel(e.target.value);
    };
    
    const handleChargerType = (e) => {
        setType(e.target.value);
    };

    // Select WiFiModule 
    const handleWiFiModule = (e) => {
        setWiFiModule(e.target.value);
    };

    // Select BluetoothModule
    const handleBluetoothModule = (e) => {
        setBluetoothModule(e.target.value);
    };


    // Form state
// eslint-disable-next-line
    const [_id, setId] = useState(dataItem?._id || '');
    const [loading, setLoading] = useState(false);

    const [charger_id, setChargerID] = useState(dataItem?.charger_id || '');
    const [charger_model, setModel] = useState(dataItem?.charger_model || '');
    const [charger_type, setType] = useState(dataItem?.charger_type || '');
    const [vendor, setVendor] = useState(dataItem?.vendor || '');
    const [max_current, setMaxCurrent] = useState(dataItem?.max_current || '');
    const [max_power, setMaxPower] = useState(dataItem?.max_power || '');
    const [wifi_module, setWiFiModule] = useState(dataItem?.wifi_module ? "True" : "False");
    const [bluetooth_module, setBluetoothModule] = useState(dataItem?.bluetooth_module ? "True" : "False");
const [connectors, setConnectors] = useState(
        (dataItem && dataItem.connector_details && dataItem.connector_details.length > 0) 
            ? dataItem.connector_details.map((item, index)=> ({
                connector_id: index + 1,
                connector_type: item.connector_type || '',
                type_name: item.connector_type_name || '',
                typeOptions: [],
            }))
            : [{ connector_id: 1, connector_type: '', type_name: '', typeOptions: [] }]
    );    

    // Error messages
    const [errorMessage, setErrorMessage] = useState('');
    const [errorMessageCurrent, setErrorMessageCurrent] = useState('');
    const [errorMessagePower, setErrorMessagePower] = useState('');

    // Initial values to detect form changes
    const [initialValues, setInitialValues] = useState({
        charger_id: dataItem?.charger_id || '',
        charger_model: dataItem?.charger_model || '',
        charger_type: dataItem?.charger_type || '',
        vendor: dataItem?.vendor || '',
        max_current: dataItem?.max_current || '',
        max_power: dataItem?.max_power || '',
        wifi_module: dataItem?.wifi_module ? "True" : "False",
        bluetooth_module: dataItem?.bluetooth_module ? "True" : "False", connectors: dataItem?.connector_details?.length > 0
        ? dataItem.connector_details.map((item, index) => ({
            connector_id: index + 1,
            connector_type: item.connector_type || '',
            type_name: item.connector_type_name || '',
            typeOptions: [],
        }))
        : [{ connector_id: 1, connector_type: '', type_name: '', typeOptions: [] }],
});
    

    const [isFormModified, setIsFormModified] = useState(false);

   useEffect(() => {
           const checkFormChanged = () => {
               const areConnectorsChanged = connectors.some((connector, index) => {
                   const initialConnector = initialValues.connectors[index];
                   if (!initialConnector) return true;
                   return (
                       connector.connector_type !== initialConnector.connector_type ||
                       connector.type_name !== initialConnector.type_name
                   );
               });
       
               return (
                   charger_id !== initialValues.charger_id ||
                   charger_model !== initialValues.charger_model ||
                   charger_type !== initialValues.charger_type ||
                   vendor !== initialValues.vendor ||
                   parseInt(max_current) !== parseInt(initialValues.max_current) ||
                   parseInt(max_power) !== parseInt(initialValues.max_power) ||   // both are strings
                   wifi_module !== initialValues.wifi_module ||
                   bluetooth_module !== initialValues.bluetooth_module ||
                   connectors.length !== initialValues.connectors.length ||
                   areConnectorsChanged
               );
           };
       
           setIsFormModified(checkFormChanged());
       }, [charger_id, charger_model, charger_type, vendor, max_current, max_power, connectors, wifi_module, bluetooth_module, initialValues]);
    

    // Update initial values if dataItem changes
    useEffect(() => {
        setInitialValues({
            charger_id: dataItem?.charger_id || '',
            charger_model: dataItem?.charger_model || '',
            charger_type: dataItem?.charger_type || '',
            vendor: dataItem?.vendor || '',
            max_current: dataItem?.max_current || '',
            max_power: dataItem?.max_power || '',
            wifi_module: dataItem?.wifi_module ? "True" : "False",
            bluetooth_module: dataItem?.bluetooth_module ? "True" : "False",connectors: dataItem?.connectors || (dataItem && dataItem.connector_details && dataItem.connector_details.length > 0) 
            ? dataItem.connector_details.map((item, index) => ({
                connector_id: index + 1,
                connector_type: item.connector_type || '',
                type_name: item.connector_type_name || '',
                typeOptions: [],
            }))
            : [{ connector_id: 1, connector_type: '', type_name: '', typeOptions: [] }],
    });
    
    }, [dataItem]);

    // Clear error messages after 5 seconds
    useEffect(() => {
        const timeout = setTimeout(() => {
            setErrorMessage('');
            setErrorMessageCurrent('');
            setErrorMessagePower('');
        }, 5000);
        return () => clearTimeout(timeout);
    }, [errorMessage, errorMessageCurrent, errorMessagePower]);

    // Submit update
      // Function to add a new connector
      const addConnector = () => {
        setConnectors([...connectors, { connector_id: connectors.length + 1, connector_type: '', type_name: '', typeOptions: [] }]);
    };

    // Function to remove a connector
    const handleRemoveConnector = (index) => {
        showRemovalConfirmation("Do you really want to remove this connector?").then((result) => {
          if (result.isConfirmed) {
            const updatedConnectors = connectors.filter((_, idx) => idx !== index);
            setConnectors(updatedConnectors);
            setIsFormModified(true);
            showRemovedAlert("The connector has been removed.");
          }
        });
      };

    // Function to fetch the type name options from the backend and update the connectors
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

    
    // Handle connector type change and trigger backend fetch for type names
    const handleConnectorType = (index, field, value) => {
        const updatedConnectors = [...connectors];
        updatedConnectors[index][field] = value;
        setConnectors(updatedConnectors);

        // Fetch type names based on connector type
        updateConnectors({ ...updatedConnectors[index], index });
    };

    // Update connector based on user input
    const handleConnectorChange = (index, field, value) => {
        const updatedConnectors = connectors.map((connector, idx) =>
            idx === index ? { ...connector, [field]: value } : connector
        );
        setConnectors(updatedConnectors);

        // Call handleConnectorType if the changed field is 'connector_type'
        if (field === 'connector_type') {
            handleConnectorType(index, value);
        }
    };
    const fetchConnectorsCalled = useRef(false);

    // Effect to initialize connectors if needed
    useEffect(() => {
        if (!fetchConnectorsCalled.current) {
            connectors.forEach((connector, index) => {
                if (connector.connector_type) {
                    updateConnectors({ ...connector, index });
                }
            });
            fetchConnectorsCalled.current = true;
        }
    }, [connectors, updateConnectors]);

   


const editManageDevice = async (e) => {
  e.preventDefault();

  const chargerIDRegex = /^[a-zA-Z0-9]{1,14}$/;
  if (!charger_id) {
    setErrorMessage("Charger ID can't be empty.");
    return;
  }
  if (!chargerIDRegex.test(charger_id)) {
    setErrorMessage('Oops! Charger ID must be a maximum of 14 characters.');
    return;
  }

  const vendorRegex = /^[a-zA-Z0-9 ]{1,20}$/;
  if (!vendor) {
    setErrorMessage("Vendor name can't be empty.");
    return;
  }
  if (!vendorRegex.test(vendor)) {
    setErrorMessage('Oops! Vendor name must be 1 to 20 characters and contain alphanumeric and numbers.');
    return;
  }

  try {
    setLoading(true);

    const response = await axiosInstance.post('/superadmin/UpdateCharger', {
      _id,
      charger_id,
      charger_model,
      charger_type,
      vendor,
      connectors,
      max_current: parseInt(max_current, 10),
      max_power: parseInt(max_power, 10),
      wifi_module,
      bluetooth_module,
      modified_by: userInfo.email_id,
    });

    if (response.data?.status === 'Success') {
      await showSuccessAlert('Charger updated successfully');
      backManageDevice();
    } else {
      showErrorAlert( response.data?.message || 'Unknown error');
    }
  } catch (error) {
    showErrorAlert(error.response?.data?.message || 'An error occurred while updating the charger');
  } finally {
    setLoading(false);
  }
};

      
    return {
        backManageDevice,
        handleModel,
         handleChargerType,
         handleWiFiModule,
         handleBluetoothModule,
         charger_id,
         loading,
         charger_model,
         charger_type,
         vendor,
         max_current,
         max_power,
         wifi_module,
         bluetooth_module,
         connectors,
         errorMessage,
         errorMessageCurrent,
         errorMessagePower,
         initialValues,
         isFormModified,
         addConnector,
         handleRemoveConnector,
         updateConnectors,
         handleConnectorChange,
         handleConnectorType,
         editManageDevice,
         setMaxCurrent,
         setVendor,
         setChargerID,
         setErrorMessageCurrent,
         setMaxPower,
         setErrorMessagePower,


    }

    
}
export default useEditManageDevice;

