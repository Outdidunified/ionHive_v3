import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';
import { showErrorAlert,showSuccessAlert } from '../../../../utils/alert';

const useCreateClient = (userInfo) => {
    const navigate = useNavigate();

    const [client_name, setClientName] = useState('');
    const [client_phone_no, setPhoneNumber] = useState('');
    const [client_email_id, setEmailID] = useState('');
    const [client_address, setAddress] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const backManageClient = () => {
        navigate('/reselleradmin/ManageClient');
    };

    const addManageClient = async (e) => {
        e.preventDefault();
      
        const phoneRegex = /^\d{10}$/;
        if (!client_phone_no) {
          setErrorMessage("Phone can't be empty.");
          return;
        }
        if (!phoneRegex.test(client_phone_no)) {
          setErrorMessage('Oops! Phone must be a 10-digit number.');
          return;
        }
      
        try {
          setLoading(true);
      
          const PhoneNumber = parseInt(client_phone_no);
      
          const response = await axiosInstance.post('/reselleradmin/addNewClient', {
            reseller_id: userInfo.reseller_id,
            client_name,
            client_phone_no: PhoneNumber,
            client_email_id,
            client_address,
            created_by: userInfo.email_id
          });
      
          if (response.status === 200) {
             showSuccessAlert("Client added successfully");
      
            setClientName('');
            setPhoneNumber('');
            setEmailID('');
            setAddress('');
            backManageClient();
          } else {
            const responseData = await response.json();
             showErrorAlert("Error", "Failed to add client, " + responseData.message);
          }
        } catch (error) {
          const errorMsg = error?.response?.data?.message || "An error occurred while adding the client";
           showErrorAlert("Error", errorMsg);
        } finally {
          setLoading(false);
        }
      };
      

    return {
        client_name,
        setClientName,
        client_phone_no,
        setPhoneNumber,
        client_email_id,
        setEmailID,
        client_address,
        setAddress,
        errorMessage,
        setErrorMessage,
        loading,
        addManageClient,
        backManageClient
    };
};

export default useCreateClient;
