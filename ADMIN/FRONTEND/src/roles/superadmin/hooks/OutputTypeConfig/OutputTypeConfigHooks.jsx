import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../../../utils/utils';
import { showErrorAlert,showSuccessAlert } from '../../../../utils/alert';
const useOutputTypeConfig = ( userInfo ) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredData] = useState([]);
    const [posts, setPosts] = useState([]);
    const fetchUserRoleCalled = useRef(false);
    const [initialOutputTypeConfig, setInitialOutputTypeConfig] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isloading,setIsLoading]=useState(false)


    const fetchTagID = useCallback(async () => {
        setLoading(true); 
        try {
            const association_id = userInfo.association_id;
            console.log("Sending association_id:", association_id);
    
            const res = await axiosInstance.post('/superadmin/fetchAllOutputType', {
                association_id: association_id
            });
    
            if (res.data && res.data.status === 'Success') {
                if (typeof res.data.data === 'string' && res.data.data === 'No Output Type found') {
                    setError(res.data.data);
                    setData([]);
                } else if (Array.isArray(res.data.data)) {
                    setData(res.data.data);
                    setPosts(res.data.data); // Sync posts with fetched data
                    setError(null);
                } else {
                    setError('Unexpected response format.');
                }
            } else {
                setError('Error fetching data. Please try again.');
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error fetching data. Please try again.');
        } finally {
            setLoading(false); 
        }
    }, [userInfo.association_id]);
    

    useEffect(() => {
        if (!fetchUserRoleCalled.current) {
            fetchTagID();
            fetchUserRoleCalled.current = true;
        }
    }, [fetchTagID]);

    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value.toUpperCase();
        if (Array.isArray(data)) {
            const filteredData = data.filter((item) =>
                item.output_type.toUpperCase().includes(inputValue) ||
                item.output_type_name.toUpperCase().includes(inputValue)
            );
            setPosts(filteredData);
        }
    };

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

    const [showAddForm, setShowAddForm] = useState(false);

    const addChargers = () => {
        setShowAddForm(prev => !prev);
    };
    const closeAddModal = () => {
        setOutputTypeConfig('');
        setOutputType('');
        setShowAddForm(false);
        setTheadsticky('sticky');
        setTheadfixed('fixed');
        setTheadBackgroundColor('white');
    };
    const modalAddStyle = { display: showAddForm ? 'block' : 'none' };

    const [add_OutputType, setOutputType] = useState('');
    const [add_OutputTypeConfig, setOutputTypeConfig] = useState('');

    const addOutputTypeConfig = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
          await axiosInstance.post('/superadmin/createOutputType', {
            output_type: add_OutputType,
            output_type_name: add_OutputTypeConfig,
            created_by: userInfo.email_id
          });
      
           showSuccessAlert("Add Output Type Config successfully");
      
          setOutputType('');
          setOutputTypeConfig('');
          setShowAddForm(false);
          closeAddModal();
          fetchTagID();
        } catch (error) {
          const message = error.response?.data?.message || "An error occurred while adding Output Type Config";
           showErrorAlert("Error", message);
        } finally {
          setIsLoading(false);
        }
      };
      
    

    const handleModel = (e) => {
        setOutputType(e.target.value);
    };

    const [showEditForm, setShowEditForm] = useState(false);
    const [dataItem, setEditDataItem] = useState(null);

    const handleEditUser = (item) => {
        setEditDataItem(item);
        setEditOutputTypeConfig(item.output_type_name);
        setInitialOutputTypeConfig(item.output_type_name);
        setShowEditForm(true);
    };

    const closeEditModal = () => {
        setShowEditForm(false);
        setTheadsticky('sticky');
        setTheadfixed('fixed');
        setTheadBackgroundColor('white');
    };
    const modalEditStyle = { display: showEditForm ? 'block' : 'none' };

    const [theadBackgroundColor, setTheadBackgroundColor] = useState('white');
    const [theadsticky, setTheadsticky] = useState('sticky');
    const [theadfixed, setTheadfixed] = useState('fixed');

    const handleEditOutputTypeConfig = (item) => {
        handleEditUser(item);
        setTheadsticky(theadsticky === 'sticky' ? '' : 'sticky');
        setTheadfixed(theadfixed === 'fixed' ? 'transparent' : 'fixed');
        setTheadBackgroundColor(theadBackgroundColor === 'white' ? 'transparent' : 'white');
    };

    const handleAddAddOutputTypeConfig = () => {
        addChargers();
        setTheadsticky(theadsticky === 'sticky' ? '' : 'sticky');
        setTheadfixed(theadfixed === 'fixed' ? 'transparent' : 'fixed');
        setTheadBackgroundColor(theadBackgroundColor === 'white' ? 'transparent' : 'white');
    };

    const [output_type_name, setEditOutputTypeConfig] = useState('');

    const editOutputTypeConfig = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
          await axiosInstance.post('/superadmin/updateOutputType', {
            id: dataItem.id,
            output_type_name,
            modified_by: userInfo.email_id
          });
      
           showSuccessAlert("Update Output Type Config successfully");
      
          setEditOutputTypeConfig('');
          setShowEditForm(false);
          closeEditModal();
          fetchTagID();
        } catch (error) {
          const message = error.response?.data?.message || "An error occurred while updating Output Type Config";
           showErrorAlert("Error", message);
        } finally {
          setIsUpdating(false);
        }
      };
      
    

      const changeDeActivate = async (e, id) => {
        e.preventDefault();
        try {
          await axiosInstance.post('/superadmin/DeActivateOutputType', {
            id,
            status: false,
            modified_by: userInfo.email_id
          });
      
           showSuccessAlert("Deactivated successfully");
          fetchTagID();
        } catch (error) {
          const message = error.response?.data?.message || "An error occurred while deactivating";
           showErrorAlert("Error", message);
        }
      };
      
      const changeActivate = async (e, id) => {
        e.preventDefault();
        try {
          await axiosInstance.post('/superadmin/DeActivateOutputType', {
            id,
            status: true,
            modified_by: userInfo.email_id
          });
      
           showSuccessAlert("Activated successfully");
          fetchTagID();
        } catch (error) {
          const message = error.response?.data?.message || "An error occurred while activating";
           showErrorAlert("Error", message);
        }
      };
      

    return{
        data,setData,
        loading,
        setLoading,
        error,setError,
        filteredData,
        posts,setPosts,
        initialOutputTypeConfig,setInitialOutputTypeConfig,
        fetchTagID,
        handleSearchInputChange,
        showAddForm,
        setShowAddForm,
        addChargers,
        closeAddModal,
        modalAddStyle,
        add_OutputTypeConfig,
        add_OutputType,
        addOutputTypeConfig,
        handleModel,
        showEditForm,setShowEditForm,
        dataItem,setEditDataItem,handleEditUser,
        closeEditModal,modalEditStyle,
        theadBackgroundColor,
        theadfixed,theadsticky,handleEditOutputTypeConfig,
        handleAddAddOutputTypeConfig,output_type_name,
        setEditOutputTypeConfig,editOutputTypeConfig,changeDeActivate,
        changeActivate,
        setOutputTypeConfig,
        isUpdating,
        setIsUpdating,isloading



    }
}
    export default useOutputTypeConfig;