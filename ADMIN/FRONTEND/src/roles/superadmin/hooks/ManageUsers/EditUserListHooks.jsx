import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';
import { showErrorAlert,showSuccessAlert } from '../../../../utils/alert';

const useEditUser = (userInfo) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dataItem = location.state?.newUser || JSON.parse(localStorage.getItem('editDeviceData'));
    localStorage.setItem('editDeviceData', JSON.stringify(dataItem));

    // Edit manage device
    const [loading, setLoading] = useState(false);

    const [username, setUsername] = useState(dataItem?.username || '');
    const [email_id, setEmailId] = useState(dataItem?.email_id || '');
    const [passwords, setPassword] = useState(dataItem?.password ? String(dataItem.password) : '');
const [phone_no, setPhoneNo] = useState(dataItem?.phone_no ? String(dataItem.phone_no) : '');
const [wallet_bal, setWalletBal] = useState(dataItem?.wallet_bal ? String(dataItem.wallet_bal) : '0');

    const [errorMessage, setErrorMessage] = useState('');
    const [selectStatus, setSelectStatus] = useState(dataItem?.status ? 'true' : 'false');

    // Store initial values
    const [initialValues, setInitialValues] = useState({
        username: dataItem?.username || '',
        email_id: dataItem?.email_id || '',
        passwords: dataItem?.password || '',
        phone_no: dataItem?.phone_no || '',
        wallet_bal: dataItem?.wallet_bal || '0',
        status: dataItem?.status ? 'true' : 'false',
    });

    // Check if any field has been modified
    const isModified = (
        username !== initialValues.username ||
        email_id !== initialValues.email_id ||
        passwords !== initialValues.passwords ||
        phone_no !== initialValues.phone_no ||
        wallet_bal !== initialValues.wallet_bal ||
        selectStatus !== initialValues.status
    );

    // Select status
    const handleStatusChange = (e) => {
        setSelectStatus(e.target.value);
    };

    const editBackManageDevice = () => {
        navigate('/superadmin/ManageUsers');
    };
    // Update manage user
    const editManageUser = async (e) => {
        e.preventDefault();
        setLoading(true);
      
        const phoneRegex = /^\d{10}$/;
        if (!phone_no || !phoneRegex.test(phone_no)) {
          setErrorMessage('Phone number must be a 10-digit number.');
          setLoading(false);
          return;
        }
      
        if (passwords) {
          const passwordRegex = /^\d{4}$/;
          if (!passwordRegex.test(passwords)) {
            setErrorMessage('Password must be a 4-digit number.');
            setLoading(false);
            return;
          }
        }
      
        const requestBody = {
          user_id: dataItem?.user_id,
          username,
          phone_no: parseInt(phone_no),
          password: passwords ? parseInt(passwords) : null,
          status: selectStatus === 'true',
          modified_by: userInfo.email_id,
        };
      
        if (dataItem.role_id === 5) {
          requestBody.wallet_bal = parseInt(wallet_bal);
        }
      
        try {
          const response = await axiosInstance({method:'post',url:'/superadmin/UpdateUser', data:requestBody});
      
          if (response.data.status === 'Success') {
             showSuccessAlert('User updated successfully');
            editBackManageDevice();
          } else {
            const errorMessage = response.data.message || 'Failed to update user';
             showErrorAlert('Error', errorMessage);
          }
        } catch (error) {
          console.error('Error updating user:', error);
          const errorMessage = error.response?.data?.message || 'An error occurred while updating the user';
           showErrorAlert('Error', errorMessage);
        } finally {
          setLoading(false);
        }
      };
      

    useEffect(() => {
        setInitialValues({
            username: dataItem?.username || '',
            email_id: dataItem?.email_id || '',
            passwords: dataItem?.password ? String(dataItem.password) : '',
            phone_no: dataItem?.phone_no ? String(dataItem.phone_no) : '',
            wallet_bal: dataItem?.wallet_bal ? String(dataItem.wallet_bal) : '0',
            status: dataItem?.status ? 'true' : 'false',
        });
    }, [dataItem]);
    

    return {
        editManageUser,
        handleStatusChange,isModified,
        username,
        email_id,
        passwords,
        phone_no,
        wallet_bal,
        errorMessage,
        loading,
        selectStatus,initialValues,dataItem,setPassword,setPhoneNo
    }
};
    export default useEditUser;