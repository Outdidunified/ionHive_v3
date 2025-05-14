import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { showErrorAlert,showSuccessAlert } from '../../../../utils/alert';
import axiosInstance from '../../../../utils/utils';
const useAddManageReseller = (userInfo) => {
  const navigate = useNavigate();
  const [reseller_name, setResellerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reseller_email_id, setEmailID] = useState('');
  const [reseller_address, setAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Navigate back to ManageReseller page
  const backManageReseller = useCallback(() => {
    navigate('/superadmin/ManageReseller');
  }, [navigate]);

  // Form submission handler
  const addManageReseller = useCallback(async (e) => {
    e.preventDefault();
    if (loading) return;  // prevent duplicate submits
  
    // Validate phone number
    const phoneRegex = /^\d{10}$/;
    if (!phoneNumber) {
      setErrorMessage("Phone can't be empty.");
      return;
    }
    if (!phoneRegex.test(phoneNumber)) {
      setErrorMessage('Oops! Phone must be a 10‑digit number.');
      return;
    }
  
    try {
      setLoading(true);
      const payload = {
        reseller_name,
        reseller_phone_no: phoneNumber,  // Keep phone as a string
        reseller_email_id,
        reseller_address,
        created_by: userInfo.email_id
      };
  
      const response = await axiosInstance({method:'post',url:'/superadmin/CreateReseller', data:payload});
  
      // Ensure response structure matches what you expect
      if (response.data && response.data.status === 'Success') {
         showSuccessAlert('Reseller added successfully');
        setResellerName('');
        setPhoneNumber('');
        setEmailID('');
        setAddress('');
        backManageReseller();
      } else {
         showErrorAlert('Error', response.data.message || 'Failed to add reseller.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred while adding the reseller.';
       showErrorAlert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [reseller_name, phoneNumber, reseller_email_id, reseller_address, userInfo, loading, backManageReseller]);

  return {
    reseller_name,
    setResellerName,
    phoneNumber,
    setPhoneNumber,
    reseller_email_id,
    setEmailID,
    reseller_address,
    setAddress,
    errorMessage,
    loading,
    backManageReseller,
    addManageReseller
  };
};

export default useAddManageReseller;
