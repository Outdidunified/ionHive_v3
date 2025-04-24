import React, { useState, useEffect, useRef } from "react";
import Swal from 'sweetalert2';
import axiosInstance from '../../../../utils/utils';
const useOcppConfig = ({ userInfo, handleLogout }) => {
    // const navigate = useNavigate();

    // View Ocpp Config Log
    // const handleOcppConfigLog = () => {
    //     navigate('/superadmin/OcppConfigLog');
    // };

    const [chargerId, setChargerId] = useState('');
    const [commandsLibrary, setCommandsLibrary] = useState([]);
    const [selectedCommand, setSelectedCommand] = useState("ChangeAvailability");
    const [loading, setLoading] = useState(false);

    // const [payload, setPayload] = useState('');
    const [response, setResponse] = useState('');
    const getActionPayloadCalled = useRef(false);
    const [reservationId, setReservationId] = useState('');
    const [connectorId, setConnectorId] = useState('');
    const [availabilityType, setAvailabilityType] = useState('');
    const [keyType, setKeyType] = useState('');
    const [configKey, setConfigKey] = useState('');
    const [customConfigKey, setCustomConfigKey] = useState('');
    const [value, setValue] = useState('');
    const [vendorId, setVendorId] = useState('');
    const [messageId, setMessageId] = useState('');
    const [data, setData] = useState('');
    const [customKeys, setCustomKeys] = useState('');
    const [location, setLocation] = useState(''); 
    const [retries, setRetries] = useState('');
    const [retryInterval, setRetryInterval] = useState('');
    const [startTime, setStartTime] = useState('');
    const [stopTime, setStopTime] = useState('');
    const [connectorIds, setConnectorIds] = useState('');
    const [idTag, setIdTag] = useState('');
    const [transaction, setTransaction] = useState('');
    const [reserveConnectorId, setReserveConnectorId] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [reserveIdTag, setReserveIdTag] = useState('');
    const [resetType, setResetType] = useState('');
    const [triggerMessage, setTriggerMessage] = useState('');
    const [triggerConnectorId, setTriggerConnectorId] = useState(''); 
    const [unlockConnectorConnectorId, setUnlockConnectorConnectorId] = useState(''); 
    const [locationUpdatdeFirmware, setLocationUpdatdeFirmware] = useState(''); 
    const [retriesUpdatdeFirmware, setRetriesUpdatdeFirmware] = useState('');
    const [retryIntervalUpdatdeFirmware, setRetryIntervalUpdatdeFirmware] = useState('');
    const [retrieveDate, setRetrieveDate] = useState('');
    const [listVersion, setListVersion] = useState('');
    const [updateType, setUpdateType] = useState('');
    const [addUpdateList, setAddUpdateList] = useState('');
    const [deleteList, setDeleteList] = useState('');
    const [sendEmptyListWhenFull, setSendEmptyListWhenFull] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [filterType, setFilterType] = useState('');
    const [clearChargingProfileConnectorId, setClearChargingProfileConnectorId] = useState('');
    const [stackLevel, setStackLevel] = useState('');
    const [chargingProfilePurpose, setChargingProfilePurpose] = useState('');
    const [clearChargingProfileID, setClearChargingProfileID] = useState('');
    const [getCompositeScheduleConnectorId, setGetCompositeScheduleConnectorId] = useState('');
    const [duration, setDuration] = useState('');
    const [chargingRateUnit, setChargingRateUnit] = useState('');
    const [setChargingProfileConnectorID, setSetChargingProfileConnectorID] = useState('');
    const [chargingProfileId, setChargingProfileId] = useState('');
    const [keyTypeData, setKeyTypeData] = useState('');
    const [command, setCommand] = useState('');
    const [ip, setIp] = useState('');
    const [port, setPort] = useState('');
    const [url, setUrl] = useState('');
    const [chargerids, setChargerids] = useState('');
    const [faultParametersConfig, setFaultParametersConfig] = useState('');
    const [maxCurrent, SetMaxCurrent] = useState('');

    function RegError(Message) {
        Swal.fire({
            title: "Sending failed",
            text: Message,
            icon: "error",
            customClass: {
                popup: 'swal-popup-center', 
                icon: 'swal-icon-center', 
            },
        });
    }

    // Get the action payload
    const getActionPayload = async () => {
        try {
            setLoading(true); // start loading
            const response = await axiosInstance.get('http://172.232.109.123:4444/OcppConfig/GetAction');
            const sortedData = response.data.sort((a, b) => a.action.localeCompare(b.action));
            setCommandsLibrary(sortedData);
        } catch (error) {
            console.error('Error fetching action payload:', error);
        } finally {
            setLoading(false); // stop loading in both success or error case
        }
    };
    

    useEffect(() => {
        // Fetch the list of commands from your backend
        if (!getActionPayloadCalled.current) {
            getActionPayload();
            getActionPayloadCalled.current = true;
        }
    }, []);

    // ON command click handler for the action payload
    const onCommandClick = (index) => {
        const selectedCommand = commandsLibrary[index];
        setSelectedCommand(selectedCommand.action);
       // setPayload(selectedCommand.payload);
        setResponse();
        setReservationId(''); setErrorMessage(''); setLocationUpdatdeFirmware(''); setRetriesUpdatdeFirmware(''); setRetryIntervalUpdatdeFirmware('');
        setRetrieveDate(''); setUnlockConnectorConnectorId(''); setConnectorId(''); setAvailabilityType(''); setErrorMessage(''); setCustomKeys(''); 
        setKeyType(''); setConfigKey(''); setCustomConfigKey(''); setValue(''); setErrorMessage(''); setGetCompositeScheduleConnectorId(''); setDuration(''); setChargingRateUnit(''); 
        setChargingProfilePurpose(''); setStackLevel(''); setClearChargingProfileConnectorId(''); setFilterType(''); setClearChargingProfileID(''); 
        setLocation(''); setRetries(''); setRetryInterval(''); setStartTime(''); setStopTime(''); setListVersion(''); setUpdateType(''); 
        setAddUpdateList(''); setDeleteList(''); setSendEmptyListWhenFull(''); setChargingProfileId(''); setSetChargingProfileConnectorID(''); 
        setConnectorIds(''); setIdTag(''); setTransaction(''); setReserveConnectorId(''); setExpiryDate(''); setReserveIdTag(''); setResetType(''); 
        setTriggerMessage(''); setTriggerConnectorId('');  setVendorId(''); setMessageId(''); setData(''); setErrorMessage(''); setKeyTypeData('');
        setChargerids(''); setKeyTypeData(''); setCommand(''); setIp(''); setPort(''); setUrl(''); setFaultParametersConfig(''); SetMaxCurrent('');
    };

    // handleCancelReservation
    const handleCancelReservation = async (e) => {
        e.preventDefault();
    
        const payload = {
            reservationId: Number(reservationId),
        };
        await onSendCommand(payload);
    };

    // handleChangeAvailability
    const handleChangeAvailability = async (e) => {
        e.preventDefault();

        // Prepare the payload with integer for connectorId
        const payload = {
            connectorId: connectorId ? parseInt(connectorId, 10) : 0, 
            data: availabilityType,
        };
        await onSendCommand(payload);
    };

    // handleChangeConfiguration
    const handleChangeConfiguration = async (e) => {
        e.preventDefault();

        // Determine the key to send based on the keyType
        const payload = {
            key: keyType === 'Predefined' ? configKey : customConfigKey,
            value: parseInt(value, 10), // Convert value to an integer
        };
        await onSendCommand(payload);
    };

    // handleClearCache
    const handleClearCache = async (e) => {
        e.preventDefault();
        const payload = {}
        await onSendCommand(payload);
    };

    // handleClearChargingProfile
    const handleClearChargingProfile = async (e) => {
        e.preventDefault();
    
        // Create a payload with appropriate fields
        const payload = {
            filterType,
            chargingProfilePk: clearChargingProfileID ? parseInt(clearChargingProfileID, 10) : 0,
            // chargingProfileId: clearChargingProfileID ? parseInt(clearChargingProfileID, 10) : 0,
            connectorId: clearChargingProfileConnectorId ? parseInt(clearChargingProfileConnectorId, 10) : 0,
            chargingProfilePurpose,
            stackLevel: stackLevel ? parseInt(stackLevel, 10) : undefined,
        };
        await onSendCommand(payload);
    };
    
    // handleDataTransferCustom 
    const handleDataTransferCustom = async (e) => {
        e.preventDefault();
    
        if (!keyTypeData) {
            setErrorMessage("Please select a Key Type."); // Validation for keyTypeData
            return;
        }
    
        const payload = {
            vendorId,
            messageId: messageId || "SMSCommand", // Default value if messageId is empty
            data: data || "RCONF" // Default value if data is empty
        };
        
        // Send the command with the newly created payload
        await onSendCommand(payload);       
    };
    
    // handleDataTransfer
    const handleDataTransfer = async (e) => {
        e.preventDefault();
    
        // Check if a command is selected
        if (!command) {
            setErrorMessage("Please select a command.");
            return;
        }

        let payload = {};
    
        // Handle specific commands for predefined commands
        switch (command) {
            case "SetServerIpPortURL":
                payload.data = `${ip}:${port}/${url}`;
                
                break;
    
            case "SetChargerID":
                payload.data = 
                     chargerids;
                break;
    
            case "RCONF":
                payload.data = "RCONF";
                break;
    
            case "HWVER":
                payload.data = "HWVER"
                break;
    
            case "GET_CSQ":
                payload.data = "GET_CSQ"
                break;
    
            case "FWVER":
                payload.data = "FWVER"
                break;
            
            case "STARTOTA":
                payload.data = "STARTOTA"
                break;

            case "RESTART":
                payload.data = "RESTART"
                break;

            case "GET_TV":
                payload.data = "GET_TV"
                break;

            case "SetFaultParametersConfig":
                payload.data = faultParametersConfig;
                break;

            case "CALIBENB":
                payload.data = "CALIBENB"
                break;

            case "SetMaxCurrent":
                payload.data = maxCurrent;
                break;    
    
            // Add other predefined commands here as needed
            default:
                console.warn("Unknown command:", command);
        }
    
        // Set payload and send the command with the updated payload
        await onSendCommand(payload);
    
        // Clear form fields after submission
        setErrorMessage(''); 
    };
    
    // handleGetCompositeSchedule
    const handleGetCompositeSchedule = async (e) => {
        e.preventDefault();
    
        // Create a payload with appropriate fields
        const payload = {
            connectorId: getCompositeScheduleConnectorId ? parseInt(getCompositeScheduleConnectorId, 10) : 0,
            durationInSeconds: duration, chargingRateUnit,
        };
        await onSendCommand(payload);
    };
    
    // handleGetConfiguration
    const handleSelectAll = (selectAll) => {
        const selectElement = document.getElementById('confKeyList');
        for (let i = 0; i < selectElement.options.length; i++) {
            selectElement.options[i].selected = selectAll;
        }
    };
    
    // handleGetConfiguration
    const handleGetConfiguration = async (e) => {
        e.preventDefault();
    
        // Capture selected options from the 'confKeyList' select element
        const selectedOptions = Array.from(document.getElementById('confKeyList').selectedOptions).map(option => option.value);
    
        // Validate and use custom keys if provided
        let keys = [];
        if (customKeys) {
            keys = customKeys.split(',').map(key => key.trim()).filter(key => key.length > 0);
        }
       
        // Combine selectedOptions and keys into one array
        const allKeys = [...selectedOptions, ...keys];

        // Construct payload with both selected options and custom keys
        const payload = {
            key: allKeys
        };
    
        // Send command with the constructed payload
        await onSendCommand(payload, null, 2);
    };
    
    // handleGetDiagnostics
    const handleGetDiagnostics = async(e) => {
        e.preventDefault();
         
        const convertToISTTimestamp = (dateTime) => {
            const date = new Date(dateTime);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
        
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            hours = String(hours).padStart(2, '0');
        
            const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
            return formattedDate;
        };

         // Convert startTime and stopTime to IST format
        const formattedStartTime = convertToISTTimestamp(startTime);
        const formattedStopTime = convertToISTTimestamp(stopTime);
        
        const payload = {
            location: location,
            retries: parseInt(retries, 10), // Convert string to integer
            retryInterval: parseInt(retryInterval, 10), // Convert string to integer
            startTime: formattedStartTime, // Format date
            stopTime: formattedStopTime // Format date
        };
        await onSendCommand(payload, null, 2);
    };

    // handleGetLocalListVersion
    const handleGetLocalListVersion = async (e) => {
        e.preventDefault();
        const payload = {}
        // setChargerId('');
        await onSendCommand(payload);
    };

    // handleRemoteStartTransaction
    const handleRemoteStartTransaction = async (e) => {
        e.preventDefault();

        const payload = {
            connectorId: Number(connectorIds), // Convert to number
            idTag: idTag,
        };
        await onSendCommand(payload, null, 2);
    };

    // handleRemoteStopTransaction
    const handleRemoteStopTransaction = async (e) => {
        e.preventDefault();

        const payload = {
            transaction: Number(transaction), // Convert to number
        };
        await onSendCommand(payload, null, 2);
    };

    // handleReserveNow
    const handleReserveNow = async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const convertToISTTimestamp = (dateTime) => {
            const date = new Date(dateTime);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
        
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            hours = String(hours).padStart(2, '0');
        
            const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
            return formattedDate;
        };

        // Format the expiryDate to IST
        const formattedExpiryDate = convertToISTTimestamp(expiryDate);

        const payload = {
            connectorId: parseInt(reserveConnectorId, 10), // Convert to integer
            expiryDate: formattedExpiryDate, // Directly use the datetime-local value
            idTag: reserveIdTag, // Use the id tag value
        };
        
        await onSendCommand(payload, null, 2);
    };

    // handleReset
    const handleReset = async (e) => {
        e.preventDefault(); // Prevent default form submission

        const payload = {
            data: resetType // Use the selected reset type
        };
        await onSendCommand(payload, null, 2);
    }

    // handleTriggerMessage
    const handleTriggerMessage = async (e) => {
        e.preventDefault(); // Prevent default form submission

        const payload = {
            connectorId: triggerConnectorId ? parseInt(triggerConnectorId) : null, // Convert to integer or set to null
            requestedMessage: triggerMessage // Use the selected trigger message
        };
        await onSendCommand(payload, null, 2);
    };

    // handleUnlockConnectorConnectorId
    const handleUnlockConnector = async (e) => {
        e.preventDefault(); // Prevent default form submission
        const payload = {
            connectorId: unlockConnectorConnectorId ? parseInt(unlockConnectorConnectorId) : null, // Convert to integer or set to null
        };
        await onSendCommand(payload);
    }

    // Updated handleUpdateFirmware function
    const handleUpdateFirmware = async (e) => {
        e.preventDefault();

        // Helper function to convert date/time to formatted IST timestamp
        const convertToISTTimestamp = (dateTime) => {
            const date = new Date(dateTime);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();

            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            hours = String(hours).padStart(2, '0');

            const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
            return formattedDate;
        };

        const payload = {
            location: locationUpdatdeFirmware, // Use the input value directly
            retries: retriesUpdatdeFirmware ? parseInt(retriesUpdatdeFirmware, 10) : null, // Convert retries to integer if present
            retrieveDate: retrieveDate ? convertToISTTimestamp(retrieveDate) : null, // Convert to Unix timestamp in IST
            retryInterval: retryIntervalUpdatdeFirmware ? parseInt(retryIntervalUpdatdeFirmware, 10) : null, // Convert retry interval to integer if present
        };
        // Send payload
        await onSendCommand(payload);
    };

    // handleSendLocalList
    const handleSendLocalList = async (e) => {
        e.preventDefault();
    
        // Conditionally empty addUpdateList and deleteList based on sendEmptyListWhenFull
        const finalAddUpdateList = sendEmptyListWhenFull ? '' : addUpdateList;
        const finalDeleteList = sendEmptyListWhenFull ? '' : deleteList;
    
        // Construct the payload based on the checkbox and update type
        const payload = {
            hash: "DUMMY_DATA[64]",
            listVersion: Number(listVersion),
            updateType,
            addUpdateList: finalAddUpdateList,
            deleteList: finalDeleteList
        };
    
        // Send the command with the constructed payload
        await onSendCommand(payload);
    };

    // handleSetChargingProfile
    const handleSetChargingProfile = async (e) => {
        e.preventDefault();
    
        // Create a payload with appropriate fields
        const payload = {
            chargingProfilePk: chargingProfileId ? parseInt(chargingProfileId, 10) : 0,
            // chargingProfileId: chargingProfileId ? parseInt(chargingProfileId, 10) : 0,
            connectorId: setChargingProfileConnectorID ? parseInt(setChargingProfileConnectorID, 10) : 0,
        };
    
        await onSendCommand(payload);
    };

    // On command click handler for the action payload
    const onSendCommand = async (payload) => {
        try {
            if (!chargerId.trim()) {
                let setMessage = "Please enter a valid charger ID";
                RegError(setMessage);
                return false;
            }
    
            // Show SweetAlert
            Swal.fire({
                title: 'Loading',
                html: 'Waiting for command response...',
                didOpen: async () => {
                    Swal.showLoading();
    
                    try {
                        const response = await axiosInstance.get(`http://172.232.109.123:4444/OcppConfig/SendOCPPRequest?id=${chargerId}&req=${encodeURIComponent(JSON.stringify(payload))}&actionBtn=${selectedCommand}`);
                        const responseData = response.data;
    
                        Swal.close(); // Close the loading alert
    
                        // Handle "Device ID not found!" message
                        if (responseData.message === "Device ID not found!") {
                            Swal.fire({
                                position: 'center',
                                icon: 'warning',
                                title: 'Device ID not found!',
                                text: responseData.message,
                                showConfirmButton: true
                            });
                            return; // Exit early
                        }
    
                        // Handle successful response
                        setResponse(responseData, null, " ");
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Command Response Received successfully',
                            showConfirmButton: false,
                            timer: 1500
                        });
    
                    } catch (error) {
                        Swal.close(); // Close loading alert in case of error
                        
                        // Check if the error response contains data
                        if (error.response && error.response.data && error.response.data.message) {
                            Swal.fire({
                                position: 'center',
                                icon: 'warning',
                                title: 'Error',
                                text: error.response.data.message,
                                showConfirmButton: true
                            });
                        } else {
                            Swal.fire({
                                position: 'center',
                                icon: 'error',
                                title: 'Error occurred while processing the request',
                                text: error.message || 'Unknown error occurred',
                                showConfirmButton: true
                            });
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error sending command:', error);
            alert('An error occurred while sending the command.');
        }
    };
    
    // Function to handleChargerIdChange 
    const handleChargerIdChange = (event) => {
        setChargerId(event.target.value);
    };

    return{
chargerId,setChargerId,commandsLibrary,setCommandsLibrary,selectedCommand,setSelectedCommand,
response,setResponse,
getActionPayloadCalled,
reservationId, setReservationId,connectorId, setConnectorId,
availabilityType, setAvailabilityType,keyType, setKeyType,
configKey, setConfigKey,customConfigKey, setCustomConfigKey,
value, setValue,vendorId, setVendorId,
messageId, setMessageId,
data, setData,
customKeys, setCustomKeys,
location, setLocation,
retries, setRetries,
retryInterval, setRetryInterval,
startTime, setStartTime,
stopTime, setStopTime,
connectorIds, setConnectorIds,
idTag, setIdTag,
transaction, setTransaction,
reserveConnectorId, setReserveConnectorId,
expiryDate, setExpiryDate,
reserveIdTag, setReserveIdTag,
resetType, setResetType,
triggerMessage, setTriggerMessage,
triggerConnectorId, setTriggerConnectorId,
unlockConnectorConnectorId, setUnlockConnectorConnectorId,
locationUpdatdeFirmware,setLocationUpdatdeFirmware,
retriesUpdatdeFirmware,setRetriesUpdatdeFirmware,
retryIntervalUpdatdeFirmware,setRetryIntervalUpdatdeFirmware,
retrieveDate, setRetrieveDate,
listVersion, setListVersion,
updateType, setUpdateType,
addUpdateList, setAddUpdateList,
deleteList, setDeleteList,
sendEmptyListWhenFull, setSendEmptyListWhenFull,
errorMessage, setErrorMessage,
filterType, setFilterType,
clearChargingProfileConnectorId,
setClearChargingProfileConnectorId,
stackLevel,setStackLevel,
chargingProfilePurpose, setChargingProfilePurpose,
clearChargingProfileID, setClearChargingProfileID,
getCompositeScheduleConnectorId, setGetCompositeScheduleConnectorId,
duration, setDuration,
chargingRateUnit, setChargingRateUnit,
setChargingProfileConnectorID, setSetChargingProfileConnectorID,
chargingProfileId, setChargingProfileId,
keyTypeData, setKeyTypeData,
command, setCommand,
ip, setIp,
port, setPort,
url, setUrl,
chargerids, setChargerids,
faultParametersConfig, setFaultParametersConfig,
maxCurrent, SetMaxCurrent,
getActionPayload,
onCommandClick,
handleCancelReservation,
handleChangeAvailability,
handleChangeConfiguration,
handleClearCache,
handleClearChargingProfile,
handleDataTransferCustom,
handleDataTransfer,
handleGetCompositeSchedule,
handleSelectAll,
handleGetConfiguration,
handleGetDiagnostics,
handleGetLocalListVersion,
handleRemoteStartTransaction,
handleRemoteStopTransaction,
handleReserveNow,
handleReset,
handleTriggerMessage,
handleUnlockConnector,
handleUpdateFirmware,
handleSendLocalList,
handleSetChargingProfile,
onSendCommand,
handleChargerIdChange,
loading

}
}
export default useOcppConfig;