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

  

  return {
    posts,
    setPosts,
    handleSearchInputChange,
    dataItem,
  };
};

export default useSessionHistory;
