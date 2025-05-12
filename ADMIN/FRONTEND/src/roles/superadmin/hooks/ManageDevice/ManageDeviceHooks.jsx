import { useState, useEffect, useRef } from 'react';
import {showErrorAlert,showSuccessAlert } from '../../../../utils/alert';
import axiosInstance from '../../../../utils/utils';
const useManageDevice = (userInfo) => {
  const [data, setData] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredData] = useState([]);
  const fetchDataCalled = useRef(false);

  // Fetch charger data
  useEffect(() => {
    if (!fetchDataCalled.current) {
      axiosInstance({method:'get',url:'/superadmin/FetchCharger'})
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
      fetchDataCalled.current = true;
    }
  }, []);

  // Update posts data when `data` or `filteredData` changes
  useEffect(() => {
    setPosts(data || filteredData);
  }, [data, filteredData]);

  // Search functionality
  const handleSearchInputChange = (e) => {
    const inputValue = e.target.value.toUpperCase();
    if (Array.isArray(data)) {
      const filtered = data.filter((item) =>
        item.charger_id.toUpperCase().includes(inputValue)
      );
      setPosts(filtered);
    }
  };

  // Upload Excel file
 const uploadFile = async (file) => {
  setLoading(true); // Optional: if you have a loading indicator

  const formData = new FormData();
  formData.append("req.file", file);
  formData.append("eq.body.created_by", userInfo.email_id);

  try {
    const response = await axiosInstance({
      method: 'post',
      url: '/superadmin/CreateChargerWithExcelFile',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data;
    setLoading(false);

    if (data?.status === 'Success') {
      fetchDataCalled.current = true;
      showSuccessAlert("File uploaded & Charger added successfully");
    } else {
      showErrorAlert("Error", "Failed to add charger: " + (data?.message || "Unknown error"));
    }
  } catch (error) {
    setLoading(false);
    const errorMessage = error?.response?.data?.message || error.message;
    console.error("Upload error:", errorMessage);
    showErrorAlert("Error", "An error occurred while adding the charger: " + errorMessage);
  }
};

  

  return {
    data,
    posts,
    loading,
    error,
    handleSearchInputChange,
    uploadFile,
    fetchDataCalled,
  };
};

export default useManageDevice;
