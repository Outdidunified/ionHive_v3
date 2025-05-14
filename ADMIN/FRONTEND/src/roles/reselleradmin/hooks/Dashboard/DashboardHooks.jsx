import axiosInstance from '../../../../utils/utils';
import { useState, useEffect, useRef } from 'react';


const useDashboard = ( userInfo ) => {
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
    const [viewMode, setViewMode] = useState('weekly'); // Default to 'monthly'\


    const isFetching = useRef(false); // Reference to track if fetchData is already running


    const fetchData = async () => {
        if (isFetching.current) return;
        isFetching.current = true; // Prevent multiple calls

        try {
            const totalRes = await axiosInstance({method:'post',url:'/reselleradmin/FetchTotalCharger',data: {
                reseller_id: userInfo.reseller_id,
            }});

            const onlineRes = await axiosInstance({method:'post',url:'/reselleradmin/FetchOnlineCharger', data:{
                reseller_id: userInfo.reseller_id,
            }});

            const faultRes = await axiosInstance({method:'post',url:'/reselleradmin/FetchFaultsCharger', data:{
                reseller_id: userInfo.reseller_id,
            }});

            const offlineRes = await axiosInstance({method:'post',url:'/reselleradmin/FetchOfflineCharger', data:{
                reseller_id: userInfo.reseller_id,
            }});

            const energyRes = await axiosInstance({method:'post',url:'/reselleradmin/FetchChargerTotalEnergy', data:{
                reseller_id: userInfo.reseller_id,
            }});

            const totalsession = await axiosInstance({method:'post',url:'/reselleradmin/FetchTotalChargersSession', data:{
                reseller_id: userInfo.reseller_id,
            }});

            const res = await axiosInstance({method:'post',url:'/reselleradmin/FetchTotalUsers', data:{
                reseller_id: userInfo.reseller_id,
            }});

            const { resellersCount, clientsCount, associationsCount, appUsersCount } = res.data.TotalCounts;

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

            const energyConsumed = energyRes.data.totalEnergyConsumed || 0;
const CO2_from_EV = energyRes.data.CO2_from_EV || 0;
const CO2_from_ICE = energyRes.data.CO2_from_ICE || 0;
const CO2_Savings = energyRes.data.CO2_Savings || 0;

const weeklyEnergyData = energyRes.data.weeklyTotalEnergyConsumed || [];
const monthlyEnergyData = energyRes.data.monthlyTotalEnergyConsumed || [];
const yearlyEnergyData = energyRes.data.yearlyTotalEnergyConsumed || [];

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
}
export default useDashboard;
