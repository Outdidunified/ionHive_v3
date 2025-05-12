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
          setData(res.data.data);      // <-- store full dataset here
          setPosts(res.data.data);     // <-- also store it for display and filtering
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
