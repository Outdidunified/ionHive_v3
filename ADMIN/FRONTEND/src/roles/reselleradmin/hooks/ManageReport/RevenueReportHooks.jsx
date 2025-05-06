import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../../utils/utils';
const useRevenueData = (userInfo) => {
    const [firstTableData, setFirstTableData] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState("0.000");
    const [firstTableLoading, setFirstTableLoading] = useState(true);
    const [secondTableLoading, setSecondTableLoading] = useState(true);
    const [firstTableSearchQuery, setFirstTableSearchQuery] = useState("");
    const [secondTableData, setSecondTableData] = useState([]);
    const [secondTableSearchQuery, setSecondTableSearchQuery] = useState("");

    const isFetchingFirst = useRef(false);
    const isFetchingSecond = useRef(false);


    const resellerId = userInfo?.reseller_id;

    useEffect(() => {
        if (!resellerId) return;  // Exit early if resellerId is not available

        const fetchData = async () => {
            if (isFetchingFirst.current) return;
            setFirstTableLoading(true);
            isFetchingFirst.current = true;

            try {
               
                const response = await axiosInstance.post(
                    '/reselleradmin/FetchSpecificChargerRevenue',
                    { reseller_id: resellerId }
                );
                setFirstTableData(response.data.revenueData || []);
                setTotalRevenue(response.data.TotalChargerRevenue || "0.000");
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setFirstTableLoading(false);
                isFetchingFirst.current = false;
            }
        };

        fetchData();
    }, [resellerId]); 

   
    useEffect(() => {
        if (!resellerId) return;  

        const fetchSessionData = async () => {
            if (isFetchingSecond.current) return;
            setSecondTableLoading(true);
            isFetchingSecond.current = true;
            try {
                
                const response = await axiosInstance.post(
                    '/reselleradmin/FetchChargerListWithAllCostWithRevenue',
                    { reseller_id: resellerId }
                );
                setSecondTableData(response.data.revenueData || []);
            } catch (error) {
                console.error("Error fetching session data:", error);
            } finally {
            setSecondTableLoading(false);
                isFetchingSecond.current = false;

            }
        };

        fetchSessionData();
    }, [resellerId]); // Runs only when resellerId changes

    const filteredFirstTableData = firstTableData.filter((item) => {
        const searchQuery = firstTableSearchQuery.toLowerCase();
        return (
            item.charger_id.toLowerCase().includes(searchQuery) ||
            item.client_email_id.toLowerCase().includes(searchQuery)
        );
    }).reverse();

    const filteredSecondTableData = secondTableData.flatMap((charger) =>
        charger.sessions.filter((session) => {
            const searchQuery = secondTableSearchQuery.toLowerCase();
            return (
                session.charger_id.toLowerCase().includes(searchQuery) ||
                session.client_email_id.toLowerCase().includes(searchQuery) ||
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

export default useRevenueData;
