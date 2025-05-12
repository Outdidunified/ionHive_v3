import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../../utils/utils';
 const useAssignClient = (dataItem) => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const FetchAssignedClientsCalled = useRef(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAssignedClients = async () => {
          try {
            setIsLoading(true); // Start loading
      
            const response = await axiosInstance({method:'post',url:'/superadmin/FetchAssignedClients',data: {
              reseller_id: dataItem.reseller_id,
            }});
      
            if (response.data.status === 'Success') {
              setData(response.data.data);
              setFilteredData(response.data.data);
            } else {
              console.error('Failed to fetch assigned clients');
              console.log('Response:', response.data);
            }
          } catch (error) {
            console.error('An error occurred while fetching the clients');
            console.error('Error:', error);
          } finally {
            setIsLoading(false); // Stop loading
          }
        };
      
        if (!FetchAssignedClientsCalled.current && dataItem?.reseller_id) {
          fetchAssignedClients();
          FetchAssignedClientsCalled.current = true;
        }
      }, [dataItem]);
      

    useEffect(() => {
        if (dataItem) {
            localStorage.setItem('dataItem', JSON.stringify(dataItem));
        }
    }, [dataItem]);

    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value.toUpperCase();
        const filtered = data.filter((item) =>
            item.client_name.toUpperCase().includes(inputValue)
        );
        setFilteredData(filtered);
    };

    return {
        data,
        filteredData,
        handleSearchInputChange,
        isLoading,
    };
};
export default useAssignClient;
