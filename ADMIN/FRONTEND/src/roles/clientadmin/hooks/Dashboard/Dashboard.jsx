import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import axiosInstance from '../../../../utils/utils';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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


    const [totalCounts, setTotalCounts] = useState({
        clientsCount: 0,
        associatinsCount: 0,
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

    const [viewMode, setViewMode] = useState('weekly'); // Default to 'monthly'\
    const [selectedCharger, setSelectedCharger] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const isFetching = useRef(false);


    const fetchData = async (clientId) => {
        if (isFetching.current) return; // Prevent multiple simultaneous requests
        isFetching.current = true;

        try {
            const totalRes = await axiosInstance({method:'post',url:'/clientadmin/FetchTotalCharger',data: {
                client_id: userInfo.client_id,
            }});

            const onlineRes = await axiosInstance({method:'post',url:'/clientadmin/FetchOnlineCharger', data:{
                client_id: userInfo.client_id,
            }});

            const faultRes = await axiosInstance({method:'post',url:'/clientadmin/FetchFaultsCharger', data:{
                client_id: userInfo.client_id,
            }});

            const offlineRes = await axiosInstance({method:'post',url:'/clientadmin/FetchOfflineCharger', data:{
                client_id: userInfo.client_id,
            }});

            const energyRes = await axiosInstance({method:'post',url:'/clientadmin/FetchChargerTotalEnergy', data:{
                client_id: userInfo.client_id,
            }});

            const totalsession = await axiosInstance({method:'post',url:'/clientadmin/FetchTotalChargersSession', data:{
                client_id: userInfo.client_id,
            }});

            const res = await axiosInstance({method:'post',url:'/clientadmin/FetchTotalUsers', data:{
                client_id: userInfo.client_id,
            }});

            const {associationsCount, appUsersCount } = res.data.totalCounts;

            setTotalCounts({
                associationsCount,
                appUsersCount,
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

            const energyConsumed = energyRes.data.ChargerTotalEnergy.totalEnergyConsumed || 0;
            const CO2_from_EV = energyRes.data.ChargerTotalEnergy.CO2_from_EV || 0;
            const CO2_from_ICE = energyRes.data.ChargerTotalEnergy.CO2_from_ICE || 0;
            const CO2_Savings = energyRes.data.ChargerTotalEnergy.CO2_Savings || 0;

            const weeklyEnergyData = energyRes.data.ChargerTotalEnergy.weeklyTotalEnergyConsumed || [];
            const monthlyEnergyData = energyRes.data.ChargerTotalEnergy.monthlyTotalEnergyConsumed || [];
            const yearlyEnergyData = energyRes.data.ChargerTotalEnergy.yearlyTotalEnergyConsumed || [];

            setEnergyData({
                totalEnergyConsumed: energyConsumed,
                CO2_from_EV,
                CO2_from_ICE,
                CO2_Savings,
                weeklyEnergyConsumed: weeklyEnergyData,
                monthlyEnergyConsumed: monthlyEnergyData,
                yearlyEnergyConsumed: yearlyEnergyData,
            });

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            isFetching.current = false; 
        }
    };


    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
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
                viewMode === 'monthly' ? `Month ${entry.month}` :
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

    const handleChargerClick = (charger) => {
        setSelectedCharger(charger);
        setIsModalOpen(true);
    };

return {
    totalChargers, setTotalChargers,
    availableChargers, setAvailableChargers,
    faultedChargers, setFaultedChargers,
    offlineChargers, setOfflineChargers,
    totalsession, setTotalSession,
    scrollIndex, setScrollIndex,
    visibleBars,containerRef,
    hover, setHover,
    totalChargersRef,
    onlineChargersRef,
    faultedChargersRef,
    offlineChargersRef,totalCounts, setTotalCounts,
    chargersData, setChargersData,
    energyData, setEnergyData,
    viewMode, setViewMode,
    selectedCharger, setSelectedCharger,
    isModalOpen, setIsModalOpen,
    fetchData,
    getChartData,
    scrollLeft,
    scrollRight,
    handleChargerClick

}}
export default useDashboard;


