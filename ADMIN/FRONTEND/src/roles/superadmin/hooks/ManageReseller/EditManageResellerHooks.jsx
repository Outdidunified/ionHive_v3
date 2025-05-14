import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';
import { showErrorAlert,showSuccessAlert } from '../../../../utils/alert';

const useEditResellerForm = (userInfo) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dataItem = location.state?.newUser || JSON.parse(localStorage.getItem('editDeviceData'));
    localStorage.setItem('editDeviceData', JSON.stringify(dataItem));

    const [errorMessage, setErrorMessage] = useState('');
    const [selectStatus, setSelectedStatus] = useState(dataItem?.status ? 'true' : 'false');
    const [reseller_name, setResellerName] = useState(dataItem?.reseller_name || '');
    const [reseller_phone_no, setResellerPhoneNumber] = useState(dataItem?.reseller_phone_no || '');
    const [reseller_email_id, setEmilaID] = useState(dataItem?.reseller_email_id || '');
    const [reseller_address, setResellerAddress] = useState(dataItem?.reseller_address || '');
    const [reseller_wallet, setResellerWallet] = useState(dataItem?.reseller_wallet || '0');
    const [loading, setLoading] = useState(false);

    const [initialValues, setInitialValues] = useState({
        reseller_phone_no: dataItem?.reseller_phone_no || '',
        reseller_wallet: dataItem?.reseller_wallet || '0',
        reseller_address: dataItem?.reseller_address || '',
        status: dataItem?.status ? 'true' : 'false',
    });

    const isModified = (
        reseller_phone_no !== initialValues.reseller_phone_no ||
        parseFloat(reseller_wallet).toFixed(2) !== parseFloat(initialValues.reseller_wallet).toFixed(2) ||
        reseller_address !== initialValues.reseller_address ||
        selectStatus !== initialValues.status
    );

    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
    };

    const EditBackManageResellers = () => {
      navigate('/superadmin/ManageReseller');
  };

  const editManageReseller = async (e) => {
    e.preventDefault();
  
    const phoneRegex = /^\d{10}$/;
    if (!reseller_phone_no || !phoneRegex.test(reseller_phone_no)) {
      setErrorMessage('Phone number must be a 10-digit number.');
      return;
    }
  
    try {
      setLoading(true); // Start loading
  
      const reseller_phone_nos = parseInt(reseller_phone_no);
  
      const updatedReseller = {
        reseller_id: dataItem?.reseller_id,
        reseller_name,
        reseller_wallet,
        reseller_phone_no: reseller_phone_nos,
        status: selectStatus === 'true',
        reseller_address,
        modified_by: userInfo.email_id,
      };
  
      const response = await axiosInstance({method:'post',url:'/superadmin/UpdateReseller',data:updatedReseller});
  
      if (response.status === 200) {
        // Directly handle success alert and navigation here
       showSuccessAlert('Reseller updated successfully');  // Ensure this returns a promise
        EditBackManageResellers(); // Navigate after alert is confirmed
      } else {
        await showErrorAlert('Error', 'Failed to update reseller: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (error) {
      await showErrorAlert('Error', 'An error occurred while updating the reseller');
      console.error('Update Error:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };
  
    useEffect(() => {
        setInitialValues({
            reseller_phone_no: dataItem?.reseller_phone_no || '',
            reseller_address: dataItem?.reseller_address || '',
            reseller_wallet: dataItem?.reseller_wallet || '0',
            status: dataItem?.status ? 'true' : 'false',
        });
    }, [dataItem]);

    return {
        reseller_name,
        setResellerName,
        reseller_phone_no,
        setResellerPhoneNumber,
        reseller_email_id,
        setEmilaID,
        reseller_address,
        setResellerAddress,
        reseller_wallet,
        setResellerWallet,
        selectStatus,
        handleStatusChange,
        isModified,
        errorMessage,
        setErrorMessage,
        loading,editManageReseller,EditBackManageResellers
    };
};

export default useEditResellerForm;
