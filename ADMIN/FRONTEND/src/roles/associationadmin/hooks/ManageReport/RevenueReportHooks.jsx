import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../../utils/utils';

const useRevenueReport = ( userInfo) => {
    const [firstTableData, setFirstTableData] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState("0.000");
    const [firstTableLoading, setFirstTableLoading] = useState(true);
    const [secondTableLoading, setSecondTableLoading] = useState(true);
    const [firstTableSearchQuery, setFirstTableSearchQuery] = useState("");
    const [secondTableData, setSecondTableData] = useState([]);
    const [secondTableSearchQuery, setSecondTableSearchQuery] = useState("");

    const isFetchingFirst = useRef(false);
    const isFetchingSecond = useRef(false);

    
    const associationId = userInfo?.association_id;

    useEffect(() => {
        if (!associationId) return;  

        const fetchData = async () => {
            if (isFetchingFirst.current) return;
            setFirstTableLoading(true);
            isFetchingFirst.current = true;
            try {
                ;
                const response = await axiosInstance({method:'post',url:
                    '/associationadmin/FetchSpecificChargerRevenue',
                    data:{ association_id:associationId }
            });

                setFirstTableData(response.data.revenueData || []);
                setTotalRevenue(response.data.TotalChargerRevenue || "0.000");
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setFirstTableLoading(false);
                isFetchingFirst.current = false;            }
        };

      
            fetchData();
        
    }, [associationId]);

    useEffect(() => {
        if (!associationId) return;
    
        const fetchSessionData = async () => {
            if (isFetchingSecond.current) return;
            setSecondTableLoading(true);
            isFetchingSecond.current = true;
            try {
             
    
                const response = await axiosInstance({method:'post',url:
                    '/associationadmin/FetchChargerListWithAllCostWithRevenue',
                    data:{ association_id: associationId }
            });
                setSecondTableData(response.data.revenueData || []);
            } catch (error) {
                console.error("Error fetching second table data:", error);
            } finally {
                setSecondTableLoading(false);
                isFetchingSecond.current = false;
            }
        };

    
        fetchSessionData();
    }, [associationId]);

    const filteredFirstTableData = firstTableData.filter((item) => {
        const searchQuery = firstTableSearchQuery?.toLowerCase() || "";
        return item?.charger_id?.toString()?.toLowerCase()?.includes(searchQuery);
    }).reverse();
    
    const filteredSecondTableData = secondTableData
  .flatMap(charger => charger.sessions.map(session => ({
    chargerId: charger.charger_id,
    ...session
  })))
  .filter(session => {
    const query = secondTableSearchQuery.toLowerCase();
    return (
      session.customerName?.toLowerCase().includes(query) ||
      session.chargerId?.toLowerCase().includes(query) ||
      session.session_id?.toString().includes(query)
    );
  }).reverse();
    
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();  // This will format the date as a readable string
    };

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
        secondTableLoading,formatDate


    }}
    export default useRevenueReport;