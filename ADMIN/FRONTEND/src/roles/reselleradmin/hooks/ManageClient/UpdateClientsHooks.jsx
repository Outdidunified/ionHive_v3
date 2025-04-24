// hooks/reselleradmin/useUpdateClientForm.js
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { showErrorAlert,showSuccessAlert } from '../../../../utils/alert';
import axiosInstance from '../../../../utils/utils';

const useUpdateClientForm = (userInfo) => {
    const navigate = useNavigate();
    const location = useLocation();

    const dataItems = location.state?.newUser || JSON.parse(localStorage.getItem('editDeviceData'));
    localStorage.setItem('editDeviceData', JSON.stringify(dataItems));

    const [client_name, setClientName] = useState(dataItems?.client_name || '');
    const [client_phone_no, setClientPhoneNo] = useState(dataItems?.client_phone_no || '');
    const [client_address, setClientAddress] = useState(dataItems?.client_address || '');
    const [client_wallet, setClientWallet] = useState(dataItems?.client_wallet || '0');
    const [status, setStatus] = useState(dataItems?.status ? 'true' : 'false');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const [initialValues, setInitialValues] = useState({
        client_phone_no: dataItems?.client_phone_no || '',
        client_wallet: dataItems?.client_wallet || '0',
        client_address: dataItems?.client_address || '',
        status: dataItems?.status ? 'true' : 'false',
    });

    useEffect(() => {
        setInitialValues({
            client_phone_no: dataItems?.client_phone_no || '',
            client_wallet: dataItems?.client_wallet || '0',
            client_address: dataItems?.client_address || '',
            status: dataItems?.status ? 'true' : 'false',
        });
    }, [dataItems]);

    const isModified = (
        String(client_phone_no) !== String(initialValues.client_phone_no) ||
        parseFloat(client_wallet) !== parseFloat(initialValues.client_wallet) ||
        String(client_address) !== String(initialValues.client_address) ||
        status !== initialValues.status
    );

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };
    const updateClientUser = async (e) => {
        e.preventDefault();
      
        const phoneRegex = /^\d{10}$/;
        if (!client_phone_no || !phoneRegex.test(client_phone_no)) {
          setErrorMessage('Phone number must be a 10-digit number.');
          return;
        }
      
        setLoading(true);
      
        try {
          const formattedUserData = {
            client_id: dataItems?.client_id,
            client_name,
            client_wallet,
            client_phone_no: parseInt(client_phone_no),
            client_address,
            modified_by: userInfo.email_id,
            status: status === 'true',
          };
      
          const response = await axiosInstance.post('/reselleradmin/updateClient/', formattedUserData);
      
          if (response.status === 200) {
             showSuccessAlert("Client updated successfully");
            navigate('/reselleradmin/ManageClient');
          }
        } catch (error) {
          const errorMsg = error.response?.data?.message || "Failed to update client. Please try again.";
           showErrorAlert("Error updating client", errorMsg);
        } finally {
          setLoading(false);
        }
      };
      
  

    const goBack = () => {
        navigate('/reselleradmin/ManageClient');
    };

    return {
        client_name,
        setClientName,
        client_phone_no,
        setClientPhoneNo,
        client_address,
        setClientAddress,
        client_wallet,
        setClientWallet,
        status,
        setStatus,
        errorMessage,
        isModified,
        handleStatusChange,
        updateClientUser,
        goBack,
        dataItems,
        loading,
        setErrorMessage
    };
};

export default useUpdateClientForm;
