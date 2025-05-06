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


    
     
    return {
        sessions,
        setSessions,
        handleSearchInputChange,
        goBack,
    }}
    export default useSessionhistoryass;
