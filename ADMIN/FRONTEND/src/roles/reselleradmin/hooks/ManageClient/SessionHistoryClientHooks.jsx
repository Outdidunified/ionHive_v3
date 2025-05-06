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

    

    return {
        sessions,
        setSessions,
        goBack,
        handleSearchInputChange,
    };
};

export default useSessionHistoryClient;
