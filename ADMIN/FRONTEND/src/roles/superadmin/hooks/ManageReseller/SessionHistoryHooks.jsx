// src/hooks/superadmin/useSessionHistory.js
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

const useSessionHistory = () => {
  const location = useLocation();
  const dataItem = location.state?.dataItem;

  const sessiondatass = useMemo(() => {
    return location.state?.sessiondata || JSON.parse(localStorage.getItem('sessiondata')) || [];
  }, [location.state]);

  const [posts, setPosts] = useState(sessiondatass);

  useEffect(() => {
    if (sessiondatass && sessiondatass.length > 0) {
      if (sessiondatass[0] === "No session found") {
        setPosts([]);
      } else {
        setPosts(sessiondatass);
      }
    }
    localStorage.setItem('sessiondata', JSON.stringify(sessiondatass));
  }, [sessiondatass]);

  const handleSearchInputChange = (e) => {
    const inputValue = e.target.value.toUpperCase();
    if (Array.isArray(sessiondatass)) {
      const filteredData = sessiondatass.filter((item) => {
        const user = item.user ? item.user.toUpperCase() : '';
        const chargerId = item.charger_id ? item.charger_id.toUpperCase() : '';
        return user.includes(inputValue) || chargerId.includes(inputValue);
      });
      setPosts(filteredData);
    }
  };

  const formatTimestamp = (originalTimestamp) => {
    const date = new Date(originalTimestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    hours = String(hours).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  return {
    posts,
    setPosts,
    handleSearchInputChange,
    formatTimestamp,
    dataItem,
  };
};

export default useSessionHistory;
