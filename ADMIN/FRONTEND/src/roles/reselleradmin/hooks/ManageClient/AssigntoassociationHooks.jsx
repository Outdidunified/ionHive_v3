import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../utils/utils';

const useAssignToAssociation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const fetchCalled = useRef(false);
    const [isLoading, setIsLoading] = useState(false); // New loading state


    const client_id = location.state?.client_id || JSON.parse(localStorage.getItem('client_id'));

    useEffect(() => {
        if (client_id && !fetchCalled.current) {
            fetchAssignToAssociationData(client_id);
            fetchCalled.current = true;
        }
    }, [client_id, location]);

    const fetchAssignToAssociationData = async (client_id) => {
        setIsLoading(true); // Start loading
        try {
            const response = await axiosInstance({method:'post',url:'/reselleradmin/FetchAssignedAssociation', data:{
                client_id: client_id
            }});
    
            if (response.data.status === 'Success' && response.data.data.length > 0) {
                const fetchedData = response.data.data.map(item => ({
                    association_name: item.association_name,
                    charger_id: item.charger_id,
                    association_email_id: item.association_email_id,
                    association_phone_no: item.association_phone_no,
                    association_address: item.association_address,
                    status: item.status,
                }));
    
                setData(fetchedData);
                setFilteredData(fetchedData);
            } else {
                setData([]);
                setFilteredData([]);
            }
        } catch (error) {
            console.error('Error fetching assigned association data:', error);
        } finally {
            setIsLoading(false); // Stop loading in both success/failure
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = data.filter(item =>
            item.association_name.toLowerCase().includes(query)
        );
        setFilteredData(filtered);
    };

    const goBack = () => {
        navigate('/reselleradmin/ManageClient');
    };

    return {
        searchQuery,
        data,
        filteredData,
        handleSearch,
        goBack,
        isLoading
    };
};

export default useAssignToAssociation;
