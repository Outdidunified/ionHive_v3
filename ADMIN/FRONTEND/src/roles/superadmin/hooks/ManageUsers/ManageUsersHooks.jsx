import { useNavigate } from 'react-router-dom';
import { showErrorAlert,showSuccessAlert } from '../../../../utils/alert';
import { useState,useRef,useEffect} from 'react';

import axiosInstance from '../../../../utils/utils';
const ManageUser = ( userInfo ) => {
    const navigate = useNavigate();
    
    const [showAddForm, setShowAddForm] = useState(false);

    const addChargers = () => {
        setShowAddForm(prevState => !prevState);
    };
    const closeAddModal = () => {
        setRole('');
        setSelectedReseller('');
        setuserName(''); 
        setemailID(''); 
        setPassword(''); 
        setPhone(''); 
        setShowAddForm(false);
        setTheadsticky('sticky');
        setTheadfixed('fixed');
        setTheadBackgroundColor('white');
        setErrorMessage('');
    
    };
    const modalAddStyle = {
        display: showAddForm ? 'block' : 'none',
    }

    // Add Manage User
    const [role, setRole] = useState({ role_id: '', role_name: '' });
    const [reseller_id, setSelectedReseller] = useState('');
    const [username, setuserName] = useState('');
    const [email_id, setemailID] = useState('');
    const [Password, setPassword] = useState('');
    const [phoneNo, setPhone] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false); // New state for loading
    const [isloading, setIsLoading] = useState(true); // New state for loading


    const handleResellerChange = (e) => {
        const [role_id, role_name] = e.target.value.split('|');
        setRole({ role_id, role_name });
    }; 


    const handleselectionReseller = (e) => {
        setSelectedReseller(e.target.value);
    };

    const [theadsticky, setTheadsticky] = useState('sticky');
    const [theadfixed, setTheadfixed] = useState('fixed');
    const [theadBackgroundColor, setTheadBackgroundColor] = useState('white');


    // Add button thead bgcolor
    const handleAddUser = () => {
        addChargers();
        setTheadsticky(theadsticky === 'sticky' ? '' : 'sticky');
        setTheadfixed(theadfixed === 'fixed' ? 'transparent' : 'fixed');
        setTheadBackgroundColor(theadBackgroundColor === 'white' ? 'transparent' : 'white');
    }
    
    const addManageUser = async (e) => {
        e.preventDefault();
      
        const phoneRegex = /^\d{10}$/;
        if (!phoneNo) {
          setErrorMessage("Phone can't be empty.");
          return;
        }
        if (!phoneRegex.test(phoneNo)) {
          setErrorMessage('Oops! Phone must be a 10-digit number.');
          return;
        }
      
        const passwordRegex = /^\d{4}$/;
        if (!Password) {
          setErrorMessage("Password can't be empty.");
          return;
        }
        if (!passwordRegex.test(Password)) {
          setErrorMessage('Oops! Password must be a 4-digit number.');
          return;
        }
      
        setLoading(true);
      
        try {
          const roleID = parseInt(role.role_id);
          const resellerID = reseller_id ? parseInt(reseller_id) : null;
          const password = parseInt(Password);
          const phone_no = parseInt(phoneNo);
      
          const payload = {
            role_id: roleID,
            username,
            email_id,
            password,
            phone_no,
            created_by: userInfo.email_id,
          };
      
          if (resellerID !== null) {
            payload.reseller_id = resellerID;
          }
      
          const response = await axiosInstance({method:'post',url:'/superadmin/CreateUser',data: payload});
      
          if (response.data.status === 'Success') {
             showSuccessAlert('User added successfully');
      
            // Reset states
            setRole('');
            setSelectedReseller('');
            setuserName('');
            setemailID('');
            setPassword('');
            setPhone('');
            setShowAddForm(false);
            setTheadsticky('sticky');
            setTheadfixed('fixed');
            setTheadBackgroundColor('white');
            fetchUsers();
            setErrorMessage('');
          } else {
             showErrorAlert('Error', response.data.message || 'Failed to add user');
          }
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
           showErrorAlert('Error', message);
        } finally {
          setLoading(false);
        }
      };
      
    
    
    // Add Manage User end

    const [selectionRoles, setSelectionRoles] = useState([]);
    const [selectionReseller, setSelectionReseller] = useState([]);
    const fetchSpecificUserRoleForSelectionCalled = useRef(false);
    const FetchResellerForSelectionCalled = useRef(false);
    const FetchUsersCalled = useRef(false);

    // Get Specific User
    useEffect(() => {
        if (!fetchSpecificUserRoleForSelectionCalled.current) {
            // const url = '/superadmin/FetchSpecificUserRoleForSelection';
            axiosInstance({method:'get',url:'/superadmin/FetchSpecificUserRoleForSelection'})
                .then((res) => {
                    setSelectionRoles(res.data.data);
                })
                .catch((err) => {
                    console.error('Error fetching data:', err);
                });
            fetchSpecificUserRoleForSelectionCalled.current = true;
        }
    }, []);

    // Get Reseller data
    useEffect(() => {
        if (!FetchResellerForSelectionCalled.current) {
            // const url = '/superadmin/FetchResellerForSelection';
            axiosInstance({method:'get',url:'/superadmin/FetchResellerForSelection'})
                .then((res) => {
                    setSelectionReseller(res.data.data);
                })
                .catch((err) => {
                    console.error('Error fetching data:', err);
                });
                FetchResellerForSelectionCalled.current = true;
        }        
    }, []);
    

    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [filteredData] = useState([]);
    const [posts, setPosts] = useState([]);

    // Get user data
    const fetchUsers = async () => {
        setIsLoading(true); // Show loading before API call
        try {
            // const url = '/superadmin/FetchUsers';
            const res = await axiosInstance({method:'get',url:'/superadmin/FetchUsers'});
            setData(res.data.data);
            setPosts(res.data.data); // Make sure to update 'posts' which is used in rendering
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error fetching data. Please try again.');
        } finally {
            setIsLoading(false); // Hide loading after everything is done
        }
    };
    

    useEffect(() => {
        if (!FetchUsersCalled.current) {
            fetchUsers();
            FetchUsersCalled.current = true;
        }
    }, []);

    // Search data 
    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value.toUpperCase();
        if (Array.isArray(data)) {
            const filteredData = data.filter((item) =>
                item.username.toUpperCase().includes(inputValue)
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

    return {
        
        closeAddModal,
        handleSearchInputChange,fetchUsers,
        loading,
        showAddForm,
        modalAddStyle,
        data,filteredData,
        error,
        posts,
        selectionRoles,
        selectionReseller,
        addManageUser,
        handleAddUser,
        handleResellerChange,
        handleselectionReseller,
        addChargers,
        errorMessage,
        setuserName,
        role,
        email_id,reseller_id,
        setemailID,setPhone,setPassword,isloading,

        phoneNo,username, Password,theadsticky,theadfixed,theadBackgroundColor





    }
};
    export default ManageUser;
