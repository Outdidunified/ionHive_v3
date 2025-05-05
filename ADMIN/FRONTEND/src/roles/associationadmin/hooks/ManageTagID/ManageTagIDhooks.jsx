import React, { useState, useEffect, useRef, useCallback } from 'react';
import { showSuccessAlert, showErrorAlert } from '../../../../utils/alert' // Import alert functions
import axiosInstance from '../../../../utils/utils';


const useManageTagID = (userInfo) => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredData] = useState([]);
    const [posts, setPosts] = useState([]);
    const fetchUserRoleCalled = useRef(false); // Ref to track if fetchProfile has been called
    const [initialTagID, setInitialTagID] = useState('');
    const [initialTagIDExpiryDateD, setInitialTagIDExpiryDate] = useState('');
    const [isloading, setIsLoading] = useState(false)
    const [editloading, setEditLoading] = useState(false)
    const fetchTagID = useCallback(async () => {
        try {
            const res = await axiosInstance.post('/associationadmin/FetchAllTagIDs', {
                association_id: userInfo.association_id
            });

            if (res.data && res.data.status === 'Success') {
                if (typeof res.data.data === 'string' && res.data.data === 'No tags found') {
                    // If the response indicates no tags were found
                    setError(res.data.data);
                    setData([]); // Clear the data since no tags were found
                } else if (Array.isArray(res.data.data)) {
                    // If the data is an array of tag IDs, set it directly
                    setData(res.data.data);
                    setPosts(res.data.data); // Add this line
                    setError(null);
                    // Clear any previous errors
                } else {
                    setError('Unexpected response format.');
                }
            } else {
                setError('Error fetching data. Please try again.');
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error fetching data. Please try again.');
            setLoading(false);
        }
    }, [userInfo.association_id]);

    useEffect(() => {
        if (!fetchUserRoleCalled.current) {
            fetchTagID();
            fetchUserRoleCalled.current = true;
        }
    }, [fetchTagID]);


    // Search data 
    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value.toUpperCase();
        if (Array.isArray(data)) {
            const filteredData = data.filter((item) =>
                item.tag_id.toUpperCase().includes(inputValue)
            );
            setPosts(filteredData);
        }
    };

    // Update table data 'data', and 'filteredData' 
    useEffect(() => {
        switch (data) {
            case 'filteredData':
                setPosts(filteredData);
                break;
            default:
                setPosts(data);
                break;
        }
    }, [data, filteredData]);

    

    // Add user role start 
    const [showAddForm, setShowAddForm] = useState(false);

    const addChargers = () => {
        setShowAddForm(prevState => !prevState); // Toggles the form visibility
    };
    const closeAddModal = () => {
        setTagID('');
        setTagIDExpiryDate('');
        setShowAddForm(false); // Close the form
        setTheadsticky('sticky');
        setTheadfixed('fixed');
        setTheadBackgroundColor('white');

    };
    const modalAddStyle = {
        display: showAddForm ? 'block' : 'none',
    }

    // Add addTagID
    const [add_tag_id, setTagID] = useState('');
    const [add_tag_id_expiry_date, setTagIDExpiryDate] = useState('');


const addTagID = async (e) => {
    e.preventDefault();
    try {
        setIsLoading(true);

        const response = await axiosInstance.post('/associationadmin/CreateTagID', {
            tag_id: add_tag_id, 
            tag_id_expiry_date: add_tag_id_expiry_date, 
            created_by: userInfo.email_id, 
            association_id: userInfo.association_id
        });

        if (response.status === 200) {
            showSuccessAlert("TagID added successfully");
            setTagID('');
            setTagIDExpiryDate('');
            setShowAddForm(false);
            closeAddModal();
            fetchTagID();
            setTheadsticky('sticky');
            setTheadfixed('fixed');
            setTheadBackgroundColor('white');
        } else {
            const responseData = response.data;
            showErrorAlert("Error", "Failed to add TagID, " + responseData.message);
        }
    } catch (error) {
        console.error("Error adding TagID:", error);
        showErrorAlert("Error", "An error occurred while adding TagID");
    } finally {
        setIsLoading(false);
    }
};

    // Edit user role start 
    const [showEditForm, setShowEditForm] = useState(false);
    const [dataItem, setEditDataItem] = useState(null);

    const handleEditUser = (dataItem) => {
        setEditDataItem(dataItem);
        setEditTagID(dataItem.tag_id);
        setEditTagIDExpiryDate(dataItem.tag_id_expiry_date);
        setInitialTagID(dataItem.tag_id);
        setInitialTagIDExpiryDate(dataItem.tag_id_expiry_date);
        setShowEditForm(true);
    };

    const closeEditModal = () => {
        setShowEditForm(false); // Close the form
        setTheadsticky('sticky');
        setTheadfixed('fixed');
        setTheadBackgroundColor('white');
    };

    const modalEditStyle = {
        display: showEditForm ? 'block' : 'none',
    }

    const [theadBackgroundColor, setTheadBackgroundColor] = useState('white');
    const [theadsticky, setTheadsticky] = useState('sticky');
    const [theadfixed, setTheadfixed] = useState('fixed');

    // Edit button thead bgcolor
    const handleEditUserAndToggleBackground = (dataItem) => {
        handleEditUser(dataItem);
        setTheadsticky(theadsticky === 'sticky' ? '' : 'sticky');
        setTheadfixed(theadfixed === 'fixed' ? 'transparent' : 'fixed');
        setTheadBackgroundColor(theadBackgroundColor === 'white' ? 'transparent' : 'white');
    };

    // Add button thead bgcolor
    const handleAddUserAndToggleBackground = () => {
        addChargers();
        setTheadsticky(theadsticky === 'sticky' ? '' : 'sticky');
        setTheadfixed(theadfixed === 'fixed' ? 'transparent' : 'fixed');
        setTheadBackgroundColor(theadBackgroundColor === 'white' ? 'transparent' : 'white');
    }

    // Edit user role
    const [tag_id, setEditTagID] = useState('');
    const [tag_id_expiry_date, setEditTagIDExpiryDate] = useState('');


// Edit TagID
const editTagID = async (e) => {
    e.preventDefault();
    try {
        setEditLoading(true);

        const response = await axiosInstance.post('/associationadmin/UpdateTagID', {
            id: dataItem.id, 
            tag_id, 
            tag_id_expiry_date, 
            status: dataItem.status, 
            modified_by: userInfo.email_id
        });

        if (response.status === 200) {
            showSuccessAlert("TagID updated successfully");
            setEditTagID('');
            setEditTagIDExpiryDate('');
            setShowEditForm(false);
            closeEditModal();
            fetchTagID();
            setTheadsticky('sticky');
            setTheadfixed('fixed');
            setTheadBackgroundColor('white');
        } else {
            const responseData = response.data;
            showErrorAlert("Error", "Failed to update TagID, " + responseData.message);
        }
    } catch (error) {
        showErrorAlert("Error", "An error occurred while updating TagID");
    } finally {
        setEditLoading(false);
    }
};

// Deactivate TagID
const changeDeActivate = async (e, id) => {
    e.preventDefault();
    try {
        const response = await axiosInstance.post('/associationadmin/DeactivateOrActivateTagID', {
            id, 
            status: false, 
            modified_by: userInfo.email_id
        });

        if (response.status === 200) {
            showSuccessAlert("Deactivated successfully", "TagID deactivated successfully");
            fetchTagID();
        } else {
            const responseData = response.data;
            showErrorAlert("Error", "Failed to Deactivate, " + responseData.message);
        }
    } catch (error) {
        showErrorAlert("Error", "An error occurred while deactivating TagID");
    }
};

// Activate TagID
const changeActivate = async (e, id) => {
    e.preventDefault();
    try {
        const response = await axiosInstance.post('/associationadmin/DeactivateOrActivateTagID', {
            id, 
            status: true, 
            modified_by: userInfo.email_id
        });

        if (response.status === 200) {
            showSuccessAlert("Activated successfully", "TagID activated successfully");
            fetchTagID();
        } else {
            const responseData = response.data;
            showErrorAlert("Error", "Failed to Activate, " + responseData.message);
        }
    } catch (error) {
        showErrorAlert("Error", "An error occurred while activating TagID");
    }
};


    function formatDateForInput(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // const getMinDate = () => {
    //     const date = new Date();
    //     date.setDate(date.getDate() +2); // Move to the next day
    //     date.setHours(0, 0, 0, 0); // Set time to midnight (00:00:00) of the next day
    //     return date.toISOString().slice(0, 16); // Format for datetime-local input
    // }; 

    const getMinDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 1); // Move to two days ahead
        date.setHours(0, 5, 0, 0); // Set time to 12:05 AM (local time) on the next day

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        // Format the date and time string for the datetime-local input
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    return {
        data, setData,
        loading, setLoading,
        error, setError, closeEditModal,
        filteredData,
        posts, setPosts,
        fetchUserRoleCalled,
        initialTagID, setInitialTagID,
        initialTagIDExpiryDateD, setInitialTagIDExpiryDate,
        fetchTagID, handleSearchInputChange,
        showAddForm, setShowAddForm,
        addChargers,
        closeAddModal,
        modalAddStyle, add_tag_id, setTagID,
        add_tag_id_expiry_date, setTagIDExpiryDate,
        addTagID, modalEditStyle,
        theadBackgroundColor, setTheadBackgroundColor,
        theadsticky, setTheadsticky, theadfixed, setTheadfixed,
        handleEditUserAndToggleBackground,
        handleAddUserAndToggleBackground,
        tag_id, setEditTagID,
        tag_id_expiry_date, setEditTagIDExpiryDate,
        editTagID, changeDeActivate,
        changeActivate, formatDateForInput,
        getMinDate, isloading, editloading

    }
}
export default useManageTagID;