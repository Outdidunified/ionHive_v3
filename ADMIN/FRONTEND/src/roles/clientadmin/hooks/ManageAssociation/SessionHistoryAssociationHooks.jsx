import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useSessionhistoryass = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    // State to hold session data
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        let { sessiondata } = location.state || {};
        if (sessiondata) {
            if(sessiondata[0] === 'No session found'){
                sessiondata =[];
                setSessions(sessiondata);
            }else{
                // If sessiondata is provided in location state, set it to state
                setSessions(sessiondata); // Assuming sessiondata is an array, or else convert it to array if single object
            }
            // Save sessiondata to localStorage
            localStorage.setItem('sessiondataClient', JSON.stringify(sessiondata));
        } else {
            // If sessiondata not in location state, try to load from localStorage
            const savedSessionData = JSON.parse(localStorage.getItem('sessiondataClient'));
            if (savedSessionData) {
                setSessions([savedSessionData]);
            }
        }
    }, [location.state]);

    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value.toUpperCase();
        if (Array.isArray(sessions)) {
            const filteredData = sessions.filter((item) =>
                item.user.toUpperCase().includes(inputValue)||
                item.charger_id.toUpperCase().includes(inputValue)
            );
            setSessions(filteredData);
        }
    };

    // back page
    const goBack = () => {
        navigate(-1);
    };


     // formatTimestamp 
     const formatTimestamp = (originalTimestamp) => {
        const date = new Date(originalTimestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        hours = String(hours).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
    };

    return {
        sessions,
        setSessions,
        handleSearchInputChange,
        goBack,
        formatTimestamp
    }}
    export default useSessionhistoryass;
