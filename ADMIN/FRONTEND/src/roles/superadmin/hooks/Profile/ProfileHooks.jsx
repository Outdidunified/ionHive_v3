import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../../../utils/utils';
import { showErrorAlert,showSuccessAlert } from '../../../../utils/alert';

const useProfile = (userInfo) => {
    const [data, setPosts] = useState({});
    const [username, setUpdateUname] = useState('');
    const [email_id, setUpdateEmail] = useState('');
    const [phone_no, setUpdatePhone] = useState('');
    const [password, setUpdatePassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [initialUserData, setInitialUserData] = useState({});
    const [userModified, setUserModified] = useState(false);
    const [loading, setLoading] = useState(false); 
    const fetchProfileCalled = useRef(false);

    const fetchProfile = useCallback(async () => {
        try {
            const response = await axiosInstance({method:'post',url:'/superadmin/FetchUserProfile', data:{
                user_id: userInfo.user_id
            }});

            if (response.status === 200) {
                const data = response.data;
                setPosts(data.data);
                setInitialUserData(data.data);
            } else {
                setErrorMessage('Failed to fetch profile');
                console.error('Failed to fetch profile:', response.statusText);
            }
        } catch (error) {
            setErrorMessage('An error occurred while fetching the profile');
            console.error('Error:', error);
        }
    }, [userInfo]);

    useEffect(() => {
        if (!fetchProfileCalled.current && userInfo?.user_id) {
            fetchProfile();
            fetchProfileCalled.current = true;
        }
    }, [fetchProfile, userInfo]);

    useEffect(() => {
        if (data) {
            setUpdateUname(data.username || '');
            setUpdateEmail(data.email_id || '');
            setUpdatePhone(data.phone_no || '');
            setUpdatePassword(data.password || '');
        }
    }, [data]);

    useEffect(() => {
        setUserModified(
            String(username) !== String(initialUserData.username) ||
            String(phone_no) !== String(initialUserData.phone_no) ||
            String(password) !== String(initialUserData.password)
        );
    }, [username, phone_no, password, initialUserData]);

    useEffect(() => {
        if (errorMessage) {
            const timeout = setTimeout(() => setErrorMessage(''), 5000);
            return () => clearTimeout(timeout);
        }
    }, [errorMessage]);

    const addProfileUpdate = async (e) => {
        e.preventDefault();
      
        const phoneRegex = /^\d{10}$/;
        if (!phone_no) return setErrorMessage("Phone can't be empty.");
        if (!phoneRegex.test(phone_no)) return setErrorMessage('Phone must be a 10-digit number.');
      
        const passwordRegex = /^\d{4}$/;
        if (!password) return setErrorMessage("Password can't be empty.");
        if (!passwordRegex.test(password)) return setErrorMessage('Password must be a 4-digit number.');
      
        try {
          setLoading(true);
      
          const response = await axiosInstance({method:'post',url:'/superadmin/UpdateUserProfile', data:{
            user_id: userInfo.user_id,
            username,
            phone_no: parseInt(phone_no),
            password: parseInt(password),
            status: true,
            modified_by: userInfo.email_id
          }});
      
          if (response.status === 200) {
             showSuccessAlert("Profile updated successfully");
            fetchProfile();
          } else {
             showErrorAlert("Error", "Failed to update profile");
          }
        } catch (error) {
          const message = error.response?.data?.message || "An error occurred while updating the profile";
           showErrorAlert("Error", message);
        } finally {
          setLoading(false);
        }
      };
      

    return {
        username,
        setUpdateUname,
        email_id,
        phone_no,
        setUpdatePhone,
        password,
        setUpdatePassword,
        errorMessage,
        userModified,
        addProfileUpdate,
        loading, 
    };
};

export default useProfile;
