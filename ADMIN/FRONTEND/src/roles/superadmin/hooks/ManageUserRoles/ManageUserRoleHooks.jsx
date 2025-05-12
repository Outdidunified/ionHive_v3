import { useState, useEffect, useRef } from 'react';
import { showErrorAlert,showSuccessAlert } from '../../../../utils/alert';
import axiosInstance from '../../../../utils/utils';
const useManageUserRole = (userInfo) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [posts, setPosts] = useState([]);
    const [filteredData] = useState([]);
    const fetchUserRoleCalled = useRef(false);

    const [roleEditname, setEdituserRole] = useState('');
    const [dataItem, setEditDataItem] = useState({});
    const [showEditForm, setShowEditForm] = useState(false);
    const [initialRoleEditname, setInitialRoleEditname] = useState('');

    const [theadBackgroundColor, setTheadBackgroundColor] = useState('white');
    const [theadsticky, setTheadsticky] = useState('sticky');
    const [theadfixed, setTheadfixed] = useState('fixed');
    const [editLoading, setEditLoading] = useState(false);



    const fetchUserRoles = async () => {
        try {
          setLoading(true)
            const res = await axiosInstance({method:'get',url:'/superadmin/FetchUserRoles'});
            setData(res.data.data);
            setPosts(res.data.data);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error fetching data. Please try again.');
        }finally{
          setLoading(false)
        }
    };

    useEffect(() => {
        if (!fetchUserRoleCalled.current) {
            fetchUserRoles();
            fetchUserRoleCalled.current = true;
        }
    }, []);

    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value.toUpperCase();
        if (Array.isArray(data)) {
            const filtered = data.filter((item) =>
                item.role_name.toUpperCase().includes(inputValue)
            );
            setPosts(filtered);
        }
    };

    useEffect(() => {
        setPosts(data);
    }, [data, filteredData]);

    const handleEditUser = (dataItem) => {
        setEditDataItem(dataItem);
        setEdituserRole(dataItem.role_name);
        setInitialRoleEditname(dataItem.role_name);
        setShowEditForm(true);
    };

    const closeEditModal = () => {
        setShowEditForm(false);
        setTheadsticky('sticky');
        setTheadfixed('fixed');
        setTheadBackgroundColor('white');
    };

    

    const modalEditStyle = {
        display: showEditForm ? 'block' : 'none',
    }

    

    const handleEditUserAndToggleBackground = (dataItem) => {
        handleEditUser(dataItem);
        setTheadsticky(theadsticky === 'sticky' ? '' : 'sticky');
        setTheadfixed(theadfixed === 'fixed' ? 'transparent' : 'fixed');
        setTheadBackgroundColor(theadBackgroundColor === 'white' ? 'transparent' : 'white');
    };


    const editUserRole = async (e) => {
        e.preventDefault();
        setEditLoading(true);
      
        try {
          const response = await axiosInstance({method:'post',url:'/superadmin/UpdateUserRole', data:{
            role_id: dataItem.role_id,
            role_name: roleEditname,
            modified_by: userInfo.email_id,
          }});
      
          if (response.data.status === 'Success') {
             showSuccessAlert('Update user role successfully');
            setEdituserRole('');
            closeEditModal();
            fetchUserRoles();
            setShowEditForm(false);
            setTheadsticky('sticky');
            setTheadfixed('fixed');
            setTheadBackgroundColor('white');

          } else {
             showErrorAlert('Error', 'Failed to update user role, ' + response.data.message);
          }
        } catch (error) {
          const errorMessage = error?.response?.data?.message || 'An error occurred while updating user role';
          showErrorAlert('Error', errorMessage);
        }
         finally {
          setEditLoading(false);
        }
      };
      
    

      const changeDeActivate = async (e, role_id) => {
        e.preventDefault();
        try {
          const response = await axiosInstance({method:'post',url:'/superadmin/DeActivateOrActivateUserRole', data:{
            role_id,
            status: false,
            modified_by: userInfo.email_id,
          }});
      
          if (response.status === 200) {
            await showSuccessAlert('Deactivated successfully');
            fetchUserRoles();
          } else {
            const responseData = await response.json();
            await showErrorAlert('Error', 'Failed to deactivate: ' + responseData.message);
          }
        } catch (error) {
          await showErrorAlert('Error', 'An error occurred while deactivating user role');
        }
      };
      

    // Active
    const changeActivate = async (e, role_id) => {
        e.preventDefault();
        try {
          const response = await axiosInstance({method:'post',url:'/superadmin/DeActivateOrActivateUserRole', data:{
            role_id,
            status: true,
            modified_by: userInfo.email_id,
          }});
      
          if (response.status === 200) {
            await showSuccessAlert('Activated successfully');
            fetchUserRoles();
          } else {
            const responseData = await response.json();
            await showErrorAlert('Error', 'Failed to activate: ' + responseData.message);
          }
        } catch (error) {
          await showErrorAlert('Error', 'An error occurred while activating user role');
        }
      };
      

    return {
        data,
        posts,
        loading,
        error,
        roleEditname,
        showEditForm,
        initialRoleEditname,
        theadsticky,
        theadfixed,
        theadBackgroundColor,
        setEdituserRole,
        handleSearchInputChange,
        handleEditUser,
        closeEditModal,
        handleEditUserAndToggleBackground,
        editUserRole,
        changeActivate,
        modalEditStyle,
        changeDeActivate,editLoading
    };
};

export default useManageUserRole;
