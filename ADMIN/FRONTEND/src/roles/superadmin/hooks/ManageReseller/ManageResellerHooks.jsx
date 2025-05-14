import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../../utils/utils';
const useResellerData = (userInfo) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState(null)
  const [filteredData] = useState([]);

  const FetchResellersCalled = useRef(false);

 useEffect(() => {
  if (!FetchResellersCalled.current) {
    const fetchResellers = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance({
          method: 'get',
          url: '/superadmin/FetchResellers',
        });

        setData(response.data.data);   // Store full dataset
        setPosts(response.data.data);  // Also store for display/filtering
      } catch (err) {
        console.error('Error fetching data:', err);
        const errorMessage = err?.response?.data?.message || 'Error fetching data. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchResellers();
    FetchResellersCalled.current = true;
  }
}, []);


  // Search functionality
  const handleSearchInputChange = (e) => {
    const inputValue = e.target.value.toLowerCase();
    if (Array.isArray(data)) {
      const filteredData = data.filter((item) =>
        item.reseller_name.toLowerCase().includes(inputValue)
      );
      setPosts(filteredData);
      console.log('filtered data', filteredData)
    }
  };

  

  return {
    data,
    loading,
    error,
    posts,
    handleSearchInputChange,
    filteredData
  };
};

export default useResellerData;
