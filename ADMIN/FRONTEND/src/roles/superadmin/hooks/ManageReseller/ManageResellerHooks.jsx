
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
      const url = '/superadmin/FetchResellers';
      setLoading(true);
      axiosInstance
        .get(url)
        .then((res) => {
          setPosts(res.data.data); 
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching data:', err);
          setError('Error fetching data. Please try again.');
          setLoading(false);
        });
      FetchResellersCalled.current = true;
    }
  }, []);
  
  // Search functionality
  const handleSearchInputChange = (e) => {
    const inputValue = e.target.value.toUpperCase();
    if (Array.isArray(data)) {
      const filteredData = data.filter((item) =>
        item.reseller_name.toUpperCase().includes(inputValue)
      );
      setPosts(filteredData);
    }
  };

  // Update posts with fetched data
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
    data,
    loading,
    error,
    posts,
    handleSearchInputChange,
    filteredData
  };
};

export default useResellerData;
