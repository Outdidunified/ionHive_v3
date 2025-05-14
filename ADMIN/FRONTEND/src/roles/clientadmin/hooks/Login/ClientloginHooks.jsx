// src/hooks/useClientAdminLogin.js
import { useState } from 'react';
import axios from 'axios';
import { isValidFourDigitPassword } from '../../../../utils/validation';

export const useClientAdminLogin = (handleLogin) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading,setLoading]=useState(false)

  const handleLoginFormSubmit = async (e) => {
    e.preventDefault();

     if (!password || !isValidFourDigitPassword(password)) {
         setErrorMessage('Password number must be a 4-digit number.');
         return;
       }

    try {
        setLoading(true)
      const parsedPassword = parseInt(password);
      // const response = await axios.post(
      //   `${import.meta.env.VITE_API_URL}/clientadmin/CheckLoginCredentials`,
      //   { email, password: parsedPassword }
      // );

     const baseurl=`${import.meta.env.VITE_API_URL}/clientadmin/CheckLoginCredentials`;
     const response=await axios({method:'post',url:baseurl,
      data:{email,password:parsedPassword}
     })

      if (response.status === 200 && response.data.status === 'Success') {
        handleLogin(response.data); // Send full user data
        setErrorMessage('');
        setSuccessMessage('Login successful!');
      } else {
        setErrorMessage('Login failed. ' + (response?.data?.message || ''));
      }
    } catch (error) {
      setSuccessMessage('');
      if (error.response) {
        setErrorMessage(`Error: ${error.response.data.message || error.response.statusText}`);
      } else {
        setErrorMessage('An error occurred during login. Please try again later.');
      }
    }finally{
        setLoading(false)
    }
  };

  return {
    email,
    password,
    errorMessage,
    successMessage,
    setEmail,
    setPassword,
    handleLoginFormSubmit,loading
  };
};
