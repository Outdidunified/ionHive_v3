// hooks/superadmin/useDashboardData.js
import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../utils/utils';
const useDashboardData = () => {
  const [totalChargers, setTotalChargers] = useState(0);
  const [availableChargers, setAvailableChargers] = useState(0);
  const [faultedChargers, setFaultedChargers] = useState(0);
  const [offlineChargers, setOfflineChargers] = useState(0);
  const [totalsession, setTotalSession] = useState(0);
  const [totalCounts, setTotalCounts] = useState({
    resellersCount: 0,
    clientsCount: 0,
    associationsCount: 0,
    appUsersCount: 0,
  });
  const [chargersData, setChargersData] = useState({
    totalChargers: [],
    availableChargers: [],
    faultedChargers: [],
    offlineChargers: [],
  });
  const [energyData, setEnergyData] = useState({
    totalEnergyConsumed: 0,
    CO2_from_EV: 0,
    CO2_from_ICE: 0,
    CO2_Savings: 0,
    weeklyEnergyConsumed: [],
    monthlyEnergyConsumed: [],
    yearlyEnergyConsumed: [],
  });

      const [scrollIndex, setScrollIndex] = useState(0);
      const visibleBars = 6; // Show only 6 bars at a time
      const containerRef = useRef(null);
      // eslint-disable-next-line
      const [hover, setHover] = useState(false);
      const totalChargersRef = useRef(null);
      const onlineChargersRef = useRef(null);
      const faultedChargersRef = useRef(null);
      const offlineChargersRef = useRef(null);
      const [selectedCharger, setSelectedCharger] = useState(null);
      const [isModalOpen, setIsModalOpen] = useState(false);
   
      const [viewMode, setViewMode] = useState('weekly'); 

  const isFetching = useRef(false);

  const fetchData = async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      const totalRes = await axiosInstance.get('/superadmin/FetchTotalCharger');
      const onlineRes = await axiosInstance.get('/superadmin/FetchOnlineCharger');
      const faultRes = await axiosInstance.get('/superadmin/FetchFaultsCharger');
      const offlineRes = await axiosInstance.get('/superadmin/FetchOfflineCharger');
      const energyRes = await axiosInstance.get('/superadmin/FetchChargerTotalEnergy');
      const totalsession = await axiosInstance.get('/superadmin/FetchTotalChargersSession');
      const userRes = await axiosInstance.get('/superadmin/FetchTotalUsers');

      const { resellersCount, clientsCount, associationsCount, appUsersCount } = userRes.data.TotalCounts;

      setTotalCounts({ resellersCount, clientsCount, associationsCount, appUsersCount });
      setTotalChargers(totalRes.data.totalCount);
      setAvailableChargers(onlineRes.data.totalCount);
      setFaultedChargers(faultRes.data.totalCount);
      setOfflineChargers(offlineRes.data.totalCount);
      setTotalSession(totalsession.data.totalCount);

      setChargersData({
        totalChargers: totalRes.data.data || [],
        availableChargers: onlineRes.data.data || [],
        faultedChargers: faultRes.data.data || [],
        offlineChargers: offlineRes.data.data || [],
      });

      const energy = energyRes.data.ChargerTotalEnergy;
      setEnergyData({
        totalEnergyConsumed: energy.totalEnergyConsumed || 0,
        CO2_from_EV: energy.CO2_from_EV || 0,
        CO2_from_ICE: energy.CO2_from_ICE || 0,
        CO2_Savings: energy.CO2_Savings || 0,
        weeklyEnergyConsumed: energy.weeklyTotalEnergyConsumed || [],
        monthlyEnergyConsumed: energy.monthlyTotalEnergyConsumed || [],
        yearlyEnergyConsumed: energy.yearlyTotalEnergyConsumed || [],
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      isFetching.current = false;
    }
  };

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  const getChartData = () => {
    let availableData = [];

    if (viewMode === 'weekly') {
        availableData = energyData.weeklyEnergyConsumed;
    } else if (viewMode === 'monthly') {
        availableData = energyData.monthlyEnergyConsumed;
    } else if (viewMode === 'yearly') {
        availableData = energyData.yearlyEnergyConsumed;
    }

    // Limit data to only visibleBars count
    const visibleData = availableData.slice(scrollIndex, scrollIndex + visibleBars);
    const labels = visibleData.map(entry =>
        viewMode === 'weekly' ? ` ${entry.week}` :
            viewMode === 'monthly' ? `${entry.month}Month` :
                `Year ${entry.year}`
    );

    const data = visibleData.map(entry => entry.totalEnergyConsumed);

    return {
        labels,
        datasets: [
            {
                label: 'Energy Consumed (kWh)',
                data,
                backgroundColor: '#FF6347',
                borderColor: '#FF6347',
                borderWidth: 1,
            },
        ],
    };
};

const handleChargerClick = (charger) => {
    setSelectedCharger(charger);
    setIsModalOpen(true);
};

const scrollLeft = () => {
    if (scrollIndex > 0) {
        setScrollIndex(scrollIndex - 1);
    }
};

const scrollRight = () => {
    if (scrollIndex + visibleBars < energyData[`${viewMode}EnergyConsumed`].length) {
        setScrollIndex(scrollIndex + 1);
    }
};
  return {
    totalChargers,
    availableChargers,
    faultedChargers,
    offlineChargers,
    totalsession,
    totalCounts,
    chargersData,
    energyData,
    fetchData,
    getChartData,
    containerRef,
    hover,
    scrollIndex,
    visibleBars,
    totalChargersRef,
    onlineChargersRef,
    faultedChargersRef,
    offlineChargersRef,
    selectedCharger,
    isModalOpen,
    viewMode,
    setIsModalOpen,
    setViewMode,
    setHover,
    handleChargerClick,
    scrollLeft,
    scrollRight,setScrollIndex
    

  };


};

export default useDashboardData;
