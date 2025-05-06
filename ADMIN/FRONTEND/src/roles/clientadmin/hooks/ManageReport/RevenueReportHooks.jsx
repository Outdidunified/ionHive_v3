import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../../utils/utils';

const useRevenueReport = (userInfo) => {
    const [firstTableData, setFirstTableData] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState("0.000");
    const [firstTableLoading, setFirstTableLoading] = useState(true);
    const [secondTableLoading, setSecondTableLoading] = useState(true);
    const [firstTableSearchQuery, setFirstTableSearchQuery] = useState("");
    const [secondTableData, setSecondTableData] = useState([]);
    const [secondTableSearchQuery, setSecondTableSearchQuery] = useState("");

    const isFetchingFirst = useRef(false);
    const isFetchingSecond = useRef(false);

    const clientId = userInfo?.client_id;

    useEffect(() => {
        if (!clientId) return;
    
        const fetchData = async () => {
            if (isFetchingFirst.current) return;
            setFirstTableLoading(true);
            isFetchingFirst.current = true;
    
            try {
                const response = await axiosInstance.post(
                    '/clientadmin/FetchSpecificChargerRevenue',
                    { client_id: clientId }
                );
                setFirstTableData(response.data.revenueData || []);
                setTotalRevenue(response.data.TotalChargerRevenue || "0.000");
            } catch (error) {
                console.error("Error fetching first table data:", error);
            } finally {
                setFirstTableLoading(false);
                isFetchingFirst.current = false;
            }
        };
    
        fetchData();
    }, [clientId]);
    

    useEffect(() => {
        if (!clientId) return;

        const fetchSessionData = async () => {
            if (isFetchingSecond.current) return;
            setSecondTableLoading(true);
            isFetchingSecond.current = true;

            try {
              
                const response = await axiosInstance.post(
                    '/clientadmin/FetchChargerListWithAllCostWithRevenue',
                    { client_id: clientId }
                );
                setSecondTableData(response.data.revenueData || []);
            } catch (error) {
                console.error("Error fetching second table data:", error);
            } finally {
                setSecondTableLoading(false);
                isFetchingSecond.current = false;
            }
        };

        fetchSessionData();
    }, [clientId]);

    const filteredFirstTableData = firstTableData.filter((item) => {
        const searchQuery = firstTableSearchQuery.toLowerCase();
        return item.charger_id.toLowerCase().includes(searchQuery) ||
            item.association_email_id.toLowerCase().includes(searchQuery);
    }).reverse();

    const filteredSecondTableData = secondTableData.flatMap((charger) =>
        charger.sessions.filter((session) => {
            const searchQuery = secondTableSearchQuery.toLowerCase();
            return (
                session.charger_id.toLowerCase().includes(searchQuery) ||
                session.association_email_id.toLowerCase().includes(searchQuery) ||
                session.session_id.toString().toLowerCase().includes(searchQuery)
            );
        })
    ).reverse();

    return {
        firstTableData,
        totalRevenue,
        secondTableData,
        filteredFirstTableData,
        filteredSecondTableData,
        firstTableSearchQuery,
        secondTableSearchQuery,
        setSecondTableSearchQuery,
        setFirstTableSearchQuery,
        firstTableLoading,
        secondTableLoading
    };
};

export default useRevenueReport;
