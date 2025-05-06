import React, { useEffect, useState, useCallback, useRef } from 'react';
import { showSuccessAlert, showErrorAlert } from '../../../../utils/alert'; // Make sure the path is correct
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';

const useAssignuser = (userInfo) => {
  const navigate = useNavigate();
  const [usersToUnassign, setUsersToUnassign] = useState([]);
  const [originalUsersToUnassign, setOriginalUsersToUnassign] = useState([]); // Store original users list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email_id, setAssEmail] = useState('');
  const [errorMessage2, setErrorMessage2] = useState('');
  const fetchUsersToUnassignCalled = useRef(false);

  // fetch user to unassign data
  const fetchUsersToUnassign = useCallback(async () => {
    try {
      const response = await axiosInstance.post('/associationadmin/FetchUsersWithSpecificRolesToUnAssign', {
        association_id: userInfo.association_id,
      });
      const users = response.data.data || []; // Use an empty array if data is undefined
      setUsersToUnassign(users);
      setOriginalUsersToUnassign(users); // Store the original list
      setLoading(false);
    } catch (error) {
      setError('Error fetching data. Please try again.');
      console.error(error);
      setLoading(false); // Ensure loading state is updated in case of error
    }
  }, [userInfo.association_id]);

  useEffect(() => {
    if (!fetchUsersToUnassignCalled.current) {
      fetchUsersToUnassign();
      fetchUsersToUnassignCalled.current = true;
    }
  }, [fetchUsersToUnassign]);

  // Function to handle selecting and removing a user

const handleSelectRemove = async (userId) => {
    try {
        await axiosInstance.post('/associationadmin/RemoveUserFromAssociation', {
            association_id: userInfo.association_id,
            user_id: parseInt(userId),
            modified_by: userInfo.email_id
        });

        showSuccessAlert('Success!', 'User has been removed from the association.');
        fetchUsersToUnassign(); // Refresh the list after removal
    } catch (error) {
        console.error(error);
        showErrorAlert('Error!', 'There was a problem removing the user.');
    }
};


  // Search assign users name
  const handleSearchInputChange = (e) => {
    const inputValue = e.target.value.toUpperCase();
    if (inputValue === '') {
      setUsersToUnassign(originalUsersToUnassign); // Reset to original list if search is cleared
      setErrorMessage2(''); // Clear any existing error message
    } else {
      const filteredAssignUsers = originalUsersToUnassign.filter((item) =>
        item.username?.toUpperCase().includes(inputValue) // Use optional chaining
      );
      setUsersToUnassign(filteredAssignUsers);

      // Set error message if no users are found
      if (filteredAssignUsers.length === 0) {
        setErrorMessage2('');
      } else {
        setErrorMessage2(''); // Clear error message if users are found
      }
    }
  };


  const handleAssuserSubmits = async (e) => {
      e.preventDefault();
  
      try {
          const response = await axiosInstance.post('/associationadmin/AssUserToAssociation', {
              association_id: userInfo.association_id,
              email_id,
              modified_by: userInfo.email_id
          });
  
          fetchUsersToUnassign();
  
          // Check if the response status is 200 (OK)
          if (response.status === 200) {
              showSuccessAlert('Success!', 'Users have been added to the association.');
              setAssEmail('');
              // setAssPhone('');
          } else {
              showErrorAlert('Error!', 'Unexpected response: ' + response.status);
          }
  
      } catch (error) {
          if (error.response) {
              // Handle 400, 404 or any server response
              showErrorAlert('Error!', error.response.data.message || 'Something went wrong.');
          } else {
              // Network error or other unknown error
              showErrorAlert('Error!', 'There was a problem assigning the users: ' + error.message);
          }
      }
  };
    

  // View user list
  const handleViewAssignTagID = (dataItem) => {
    navigate('/associationadmin/AssignTagID', { state: { dataItem } });
  };

  return {
    usersToUnassign, setUsersToUnassign,
    originalUsersToUnassign,setOriginalUsersToUnassign,
    loading,
    setLoading,
    error,setError,
    email_id,setAssEmail,
    errorMessage2,setErrorMessage2,
    fetchUsersToUnassignCalled,
    fetchUsersToUnassign,
    handleSelectRemove,handleSearchInputChange,
    handleAssuserSubmits,handleViewAssignTagID
  }}
  export default useAssignuser;
