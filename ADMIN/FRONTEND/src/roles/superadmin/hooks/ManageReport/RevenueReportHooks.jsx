import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../../../utils/utils';

const useRevenueReport = () => {
    const [firstTableData, setFirstTableData] = useState([]);
    const [secondTableData, setSecondTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [firstTableSearchQuery, setFirstTableSearchQuery] = useState('');
    const [secondTableSearchQuery, setSecondTableSearchQuery] = useState('');
    const isFetching = useRef(false);

    const fetchData = useCallback(async () => {
  if (isFetching.current) return;
  isFetching.current = true;
  setLoading(true);

  try {
    const [firstTableResponse, secondTableResponse] = await Promise.all([
      axiosInstance({
        method: 'get',
        url: '/superadmin/FetchSpecificChargerRevenue',
      }),
      axiosInstance({
        method: 'get',
        url: '/superadmin/FetchChargerListWithAllCostWithRevenue',
      }),
    ]);

    const processedFirstTableData = firstTableResponse.data.revenueData.map(item => ({
      chargeId: item.charger_id,
      reseller: item.reseller_email_id,
      client: item.client_email_id,
      association: item.association_email_id,
      totalRevenue: item.TotalRevenue,
    }));

    const processedSecondTableData = secondTableResponse.data.revenueData.flatMap(item => {
      if (item?.sessions && Array.isArray(item.sessions)) {
        return item.sessions.map(session => ({
          chargerId: item.charger_id,
          sessionId: session.session_id,
          customerName: session.customerName,
          startTime: session.start_time,
          stopTime: session.stop_time,
          duration: session.duration,
          location: session.location,
          energyConsumed: session.energyConsumed,
          price: session.price,
          reseller: session.reseller_revenue,
          client: session.client_revenue,
          association: session.association_revenue,
          totalRevenue: session.totalRevenue,
        }));
      }
      return [];
    });

    setFirstTableData(processedFirstTableData);
    setSecondTableData(processedSecondTableData);
  } catch (error) {
    console.error("Error fetching revenue report data:", error);
    const errorMessage = error?.response?.data?.message || "Failed to fetch revenue report data";
    showErrorAlert("Error", errorMessage);
  } finally {
    setLoading(false);
  }
}, []);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredFirstTableData = firstTableData.filter(item =>
        (item.chargeId && item.chargeId.toLowerCase().includes(firstTableSearchQuery.toLowerCase())) ||
        (item.reseller && item.reseller.toLowerCase().includes(firstTableSearchQuery.toLowerCase())) ||
        (item.client && item.client.toLowerCase().includes(firstTableSearchQuery.toLowerCase())) ||
        (item.association && item.association.toLowerCase().includes(firstTableSearchQuery.toLowerCase()))
    ).reverse();

    const filteredSecondTableData = secondTableData.filter(item =>
        (item.chargerId && item.chargerId.toLowerCase().includes(secondTableSearchQuery.toLowerCase())) ||
        (item.sessionId && item.sessionId.toString().includes(secondTableSearchQuery.toLowerCase())) ||
        (item.customerName && item.customerName.toLowerCase().includes(secondTableSearchQuery.toLowerCase())) ||
        (item.energyConsumed && item.energyConsumed.toString().includes(secondTableSearchQuery)) ||
        (item.reseller && item.reseller.toString().includes(secondTableSearchQuery)) ||
        (item.client && item.client.toString().includes(secondTableSearchQuery)) ||
        (item.association && item.association.toString().includes(secondTableSearchQuery))
    ).reverse();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return {
        loading,
        formatDate,
        filteredFirstTableData,
        filteredSecondTableData,
        firstTableSearchQuery,
        secondTableSearchQuery,
        setFirstTableSearchQuery,
        setSecondTableSearchQuery
    };
};

export default useRevenueReport;
