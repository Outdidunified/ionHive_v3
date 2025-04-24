import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useSessionHistoryClient = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        let { sessiondata } = location.state || {};
        if (sessiondata) {
            if (sessiondata[0] === 'No session found') {
                sessiondata = [];
            }
            setSessions(sessiondata);
            localStorage.setItem('sessiondataClient', JSON.stringify(sessiondata));
        } else {
            const savedSessionData = JSON.parse(localStorage.getItem('sessiondataClient'));
            if (savedSessionData) {
                setSessions([savedSessionData].flat()); // Ensure it's always an array
            }
        }
    }, [location.state]);

    const goBack = () => {
        navigate(-1);
    };

    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value.toUpperCase();
        const savedSessionData = JSON.parse(localStorage.getItem('sessiondataClient')) || [];
        const filteredData = savedSessionData.filter((item) =>
            item.user?.toUpperCase().includes(inputValue) ||
            item.charger_id?.toUpperCase().includes(inputValue)
        );
        setSessions(filteredData);
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
        sessions,
        setSessions,
        goBack,
        handleSearchInputChange,
        formatTimestamp
    };
};

export default useSessionHistoryClient;
