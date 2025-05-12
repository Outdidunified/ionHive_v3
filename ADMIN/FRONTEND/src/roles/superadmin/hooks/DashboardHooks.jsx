import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../utils/utils';

// Register ChartJS components
const useDashboard = (userInfo) => {
    const [totalChargers, setTotalChargers] = useState(0);
    const [availableChargers, setAvailableChargers] = useState(0);
    const [faultedChargers, setFaultedChargers] = useState(0);
    const [offlineChargers, setOfflineChargers] = useState(0);
    const [totalsession, setTotalSession] = useState(0);
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
 


    const [totalCounts, setTotalCounts] = useState({
        resellersCount: 0,
        clientsCount: 0,
        associationsCount: 0,
        appUsersCount: 0
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
        daytodaytotalEnergyConsumed: [],
        weeklyEnergyConsumed: [],
        monthlyEnergyConsumed: [],
        yearlyEnergyConsumed: [],
    });
    const [viewMode, setViewMode] = useState('weekly'); // Default to 'weekly'

    const isFetching = useRef(false); // Reference to track if fetchData is already running

    const fetchData = async () => {
        if (isFetching.current) return; // Prevent running fetch if it's already in progress
        isFetching.current = true; // Mark as fetching

        try {
            const totalRes = await axiosInstance({method:'get',url:'/superadmin/FetchTotalCharger'});
            const onlineRes = await axiosInstance({method:'get',url:'/superadmin/FetchOnlineCharger'});
            const faultRes = await axiosInstance({method:'get',url:'/superadmin/FetchFaultsCharger'});
            const offlineRes = await axiosInstance({method:'get',url:'/superadmin/FetchOfflineCharger'});
            const energyRes = await axiosInstance({method:'get',url:'/superadmin/FetchChargerTotalEnergy'});
            const totalsession = await axiosInstance({method:'get',url:'/superadmin/FetchTotalChargersSession'});

            const res = await axiosInstance({method:'get',url:'/superadmin/FetchTotalUsers'});
            const { resellersCount, clientsCount, associationsCount, appUsersCount } = res.data.totalCounts;

            setTotalCounts({
                resellersCount,
                clientsCount,
                associationsCount,
                appUsersCount
            });

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
                totalsession: totalsession.data.data || [],
            });

            const energyConsumed = energyRes.data.data.totalEnergyConsumed || 0;
            const CO2_from_EV = energyRes.data.data.CO2_from_EV || 0;
            const CO2_from_ICE = energyRes.data.data.CO2_from_ICE || 0;
            const CO2_Savings = energyRes.data.data.CO2_Savings || 0;

            const weeklyEnergyData = energyRes.data.data.weeklyTotalEnergyConsumed || [];
            const monthlyEnergyData = energyRes.data.data.monthlyTotalEnergyConsumed || [];
            const yearlyEnergyData = energyRes.data.data.yearlyTotalEnergyConsumed || [];

            setEnergyData({
                totalEnergyConsumed: energyConsumed,
                CO2_from_EV: CO2_from_EV,
                CO2_from_ICE: CO2_from_ICE,
                CO2_Savings: CO2_Savings,
                weeklyEnergyConsumed: weeklyEnergyData,
                monthlyEnergyConsumed: monthlyEnergyData,
                yearlyEnergyConsumed: yearlyEnergyData,
            });

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            isFetching.current = false; // Mark as not fetching
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
    totalChargers, setTotalChargers,
    availableChargers, setAvailableChargers,
    faultedChargers, setFaultedChargers,
    offlineChargers, setOfflineChargers,
    totalsession, setTotalSession,
    scrollIndex, setScrollIndex,
    visibleBars,
    containerRef,
    hover, setHover,
    totalChargersRef,
    onlineChargersRef,
    faultedChargersRef,
    offlineChargersRef,
    selectedCharger,
    setSelectedCharger,
    isModalOpen,
    setIsModalOpen,
    totalCounts,setTotalCounts,chargersData,setChargersData,
    energyData, setEnergyData,viewMode, setViewMode,
    isFetching,fetchData,getChartData,scrollLeft,
    scrollRight,handleChargerClick,

}

};



export default useDashboard;


