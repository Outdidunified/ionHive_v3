import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import axios from 'axios';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import Chart from 'react-apexcharts';


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);




const Dashboard = ({ userInfo, handleLogout }) => {
    const [totalChargers, setTotalChargers] = useState(0);
    const [availableChargers, setAvailableChargers] = useState(0);
    const [faultedChargers, setFaultedChargers] = useState(0);
    const [offlineChargers, setOfflineChargers] = useState(0);
    const [totalsession, setTotalSession] = useState(0);
    const [scrollIndex, setScrollIndex] = useState(0);
    const visibleBars = 6;
    const containerRef = useRef(null);
    // eslint-disable-next-line
    const [hover, setHover] = useState(false);
    const totalChargersRef = useRef(null);
    const onlineChargersRef = useRef(null);
    const faultedChargersRef = useRef(null);
    const offlineChargersRef = useRef(null);
    const [selectedCharger, setSelectedCharger] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // eslint-disable-next-line
    const [totalCount, setTotalCounts] = useState({
        resellersCount: 0,
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
    const [viewMode, setViewMode] = useState('weekly');


    const isFetching = useRef(false);


    const fetchData = async (associationId) => {
        if (isFetching.current) return; // Prevent multiple calls
        isFetching.current = true;

        try {
            const totalRes = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/FetchTotalCharger`, {
                association_id: userInfo.data.association_id,
            });

            const onlineRes = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/FetchOnlineCharger`, {
                association_id: userInfo.data.association_id,
            });

            const faultRes = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/FetchFaultsCharger`, {
                association_id: userInfo.data.association_id,
            });

            const offlineRes = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/FetchOfflineCharger`, {
                association_id: userInfo.data.association_id,
            });

            const energyRes = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/FetchChargerTotalEnergy`, {
                association_id: userInfo.data.association_id,
            });

            const totalsession = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/FetchTotalChargersSession`, {
                association_id: userInfo.data.association_id,
            });

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/FetchTotalUsers`, {
                association_id: userInfo.data.association_id,
            });

            const { resellersCount, clientsCount, associatinsCount, appUsersCount } = res.data.TotalCounts;

            setTotalCounts({
                resellersCount,
                clientsCount,
                associatinsCount,
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
            isFetching.current = false; // ✅ Reset isFetching after request
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









    return (
        <div className="container-scroller" style={{ background: '#f4f7fb' }}>
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="container-fluid page-body-wrapper">
                <Sidebar />
                <div className="main-panel">
                    <div className="content-wrapper" style={{ padding: '20px' }}>
                        <div className="row">
                            <div className="col-md-12 grid-margin d-flex justify-content-between align-items-center admin-header">
                                <div>
                                    <h3 className="font-weight-bold" style={{ color: '#4B49AC' }}>
                                        Welcome to <span>{userInfo.data.email_id}</span>,
                                    </h3>
                                    <h4 className="font-weight-normal" style={{ fontSize: '1.4rem', color: '#333' }}>
                                        Association Admin Dashboard
                                    </h4>
                                </div>
                                <button className="btn btn-primary" onClick={fetchData}>
                                    <i className="fa fa-sync"></i> Reload Data
                                </button>
                            </div>

                        </div>
                        <div className="row d-flex justify-content-center">
                            <div className="col-md-6 mb-3 d-flex justify-content-center">
                                <div className="card p-4 text-center shadow-lg" style={{
                                    background: 'white',
                                    color: '#000',
                                    borderRadius: '15px',
                                    width: '100%',
                                    maxWidth: '100%',
                                    height: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
                                    position: 'relative',
                                }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                                    <h2 className="font-weight-bold" style={{
                                        fontSize: '1.1rem',
                                        textTransform: 'uppercase',
                                        marginBottom: '8px',
                                        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                                        letterSpacing: '1px',
                                    }}>
                                        EV ENERGY CONSUMED
                                    </h2>
                                    <p style={{
                                        fontSize: '1rem',
                                        fontWeight: 'lighter',
                                        marginTop: '3px',
                                        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                                        marginBottom: '12px',
                                    }}>
                                        Insights into energy consumption and environmental impact of EV chargers.
                                    </p>

                                    <div className="row" style={{ width: '100%', flexWrap: 'wrap' }}>
                                        {/* CO2 Savings Block */}
                                        <div className="col-12 col-md-6 d-flex align-items-center mb-3" style={{
                                            justifyContent: 'center',
                                            padding: '25px',
                                            position: 'relative',
                                            transform: 'scale(1)',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                        }} onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                            e.currentTarget.style.boxShadow = '0px 10px 40px rgba(0, 0, 0, 0.4)';
                                        }} onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}>
                                            <div className="d-flex flex-column align-items-center">
                                                <i className="fa fa-leaf" style={{
                                                    fontSize: '4rem',
                                                    color: '#28a745',
                                                    marginBottom: '15px',
                                                }}></i>
                                                <p style={{
                                                    fontSize: '1.3rem',
                                                    fontWeight: 'bold',
                                                    marginTop: '5px',
                                                    color: '#000',
                                                }}>
                                                    {(energyData && energyData.CO2_Savings !== undefined) ? energyData.CO2_Savings.toFixed(2) : '0.00'} kg
                                                </p>
                                                <p style={{
                                                    fontSize: '1.5rem',
                                                    fontWeight: 'bold',
                                                    color: '#FF9800',
                                                    letterSpacing: '1px',
                                                }}>
                                                    CO<sub>2</sub> Savings
                                                </p>
                                            </div>
                                        </div>

                                        {/* Other 3 Blocks on the Right Side */}
                                        <div className="col-12 col-md-6 d-flex flex-column justify-content-between" style={{ height: 'auto' }}>
                                            {/* Total Energy Consumed Block */}
                                            <div className="d-flex align-items-center mb-3" style={{ height: 'auto' }}>
                                                <div className="icon-circle" style={{
                                                    backgroundColor: '#007BFF',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    padding: '12px',
                                                    marginRight: '10px',
                                                }}>
                                                    <i className="fa fa-bolt" style={{ fontSize: '1.0rem' }}></i>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <p style={{ fontSize: '1rem', color: '#FF9800' }}>
                                                        Total Energy Consumed
                                                    </p>
                                                    <p style={{ fontSize: '1rem', color: '#000', lineHeight: '1.2', textAlign: 'left' }}>
                                                        {(energyData && energyData.totalEnergyConsumed !== undefined) ? energyData.totalEnergyConsumed.toFixed(2) : '0.00'} kWh
                                                    </p>
                                                </div>
                                            </div>

                                            {/* CO2 from EV Block */}
                                            <div className="d-flex align-items-center mb-3" style={{ height: 'auto' }}>
                                                <div className="icon-circle" style={{
                                                    backgroundColor: '#FFC107',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    padding: '12px',
                                                    marginRight: '10px',
                                                }}>
                                                    <i className="fa fa-car" style={{ fontSize: '1.0rem' }}></i>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <p style={{ fontSize: '1rem', color: '#FF9800' }}>
                                                        CO<sub>2</sub> from EV
                                                    </p>
                                                    <p style={{ fontSize: '1rem', color: '#000', lineHeight: '1.2', textAlign: 'left' }}>
                                                        {(energyData && energyData.CO2_from_EV !== undefined) ? energyData.CO2_from_EV.toFixed(2) : '0.00'} kg
                                                    </p>
                                                </div>
                                            </div>

                                            {/* CO2 from ICE Block */}
                                            <div className="d-flex align-items-center mb-3" style={{ height: 'auto' }}>
                                                <div className="icon-circle" style={{
                                                    backgroundColor: '#F44336',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    padding: '12px',
                                                    marginRight: '10px',
                                                }}>
                                                    <i className="fa fa-fire" style={{ fontSize: '1.0rem' }}></i>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <p style={{ fontSize: '1rem', color: '#FF9800' }}>
                                                        CO<sub>2</sub> from ICE
                                                    </p>
                                                    <p style={{ fontSize: '1rem', color: '#000', lineHeight: '1.2', textAlign: 'left' }}>
                                                        {(energyData && energyData.CO2_from_ICE !== undefined) ? energyData.CO2_from_ICE.toFixed(2) : '0.00'} kg
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>




                            {/* 2x2 Grid of Charger Statistics */}
                            <div className="col-md-6 d-flex flex-wrap justify-content-start" style={{ rowGap: '5px' }}>
                                {[

                                    { title: 'Total Chargers', count: totalChargers, color: '#007BFF', icon: 'fa fa-bolt', bgColor: '#007BFF', targetRef: totalChargersRef },
                                    { title: 'Total Chargers Session', count: totalsession, color: '#9C27B0', icon: 'fa-history', bgColor: '#9C27B0' },
                                    { title: 'Online Chargers', count: availableChargers, color: '#4CAF50', icon: 'fa-plug', bgColor: '#4CAF50', targetRef: onlineChargersRef },
                                    { title: 'Chargers Faulted', count: faultedChargers, color: '#FF9800', icon: 'fa-exclamation-triangle', bgColor: '#FF9800', targetRef: faultedChargersRef },
                                    { title: 'Offline Chargers', count: offlineChargers, color: '#F44336', icon: 'fa-ban', bgColor: '#F44336', targetRef: offlineChargersRef },
                                ].map((item, index) => (
                                    <div key={index} className="col-6 d-flex justify-content-center" style={{ paddingBottom: '5px' }}>
                                        <div className="card p-2" style={{
                                            backgroundColor: 'white',
                                            color: '#333',
                                            borderRadius: '10px',
                                            boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.1)',
                                            width: '100%',
                                            maxWidth: '280px',
                                            height: '80px',
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            padding: '10px',
                                            transition: 'transform 0.3s ease',
                                            transform: 'scale(1)',
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            onClick={() => item.targetRef && item.targetRef.current.scrollIntoView({ behavior: 'smooth' })}

                                        >
                                            {/* Left Side (Title and Count) */}
                                            <div style={{
                                                flex: 3,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                paddingRight: '10px',
                                            }}>
                                                <h6 className="mb-2 font-weight-normal" style={{ fontSize: '14px', opacity: '0.9' }}>
                                                    {item.title}
                                                </h6>
                                                <h3 className="font-weight-normal" style={{ fontSize: '21px', marginTop: '5px', color: item.color }}>
                                                    {item.count}
                                                </h3>
                                            </div>

                                            {/* Right Side (Icon Background with Unique Colors) */}
                                            <div style={{
                                                backgroundColor: item.bgColor,
                                                borderRadius: '8px',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                color: '#fff',
                                                flex: 1,
                                            }}>
                                                <i className={`fa ${item.icon}`} style={{ fontSize: '18px' }}></i>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>










                            {/* Energy Consumption Box moved above Chargers Unavailable Table */}
                            {/* 4 Boxes in One Row */}


                            {/* Chargers Data Tables */}
                            <div className="col-md-12 mt-4">
                                <div className="row mb-4" style={{ marginBottom: '20px' }}>
                                    {/* First Row: Chargers Overview & Energy Consumed */}
                                    <div className="col-md-4">
                                        <div className="card p-3 shadow-sm" style={{
                                            borderRadius: '15px',
                                            boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.1)',
                                            width: '100%',
                                            height: '350px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <h5 className="font-weight-normal mb-3" style={{
                                                color: '#4CAF50',
                                                textTransform: 'uppercase',
                                                fontSize: '18px',
                                                textAlign: 'center',
                                                letterSpacing: '1px',
                                            }}>
                                                Chargers Overview
                                            </h5>

                                            <div style={{ width: '100%', height: '230px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                {availableChargers === 0 && faultedChargers === 0 && offlineChargers === 0 ? (
                                                    <p style={{
                                                        color: '#999',
                                                        fontSize: '16px',
                                                        textAlign: 'center',
                                                        fontWeight: 'normal'
                                                    }}>
                                                        No Data Available
                                                    </p>
                                                ) : (
                                                    <Chart
                                                        options={{
                                                            chart: { type: 'pie' },
                                                            labels: ['Online Chargers', 'Faulted Chargers', 'Offline Chargers'],
                                                            colors: ['#4CAF50', '#FF9800', '#F44336'],
                                                            legend: { position: 'bottom' }
                                                        }}
                                                        series={[availableChargers, faultedChargers, offlineChargers]}
                                                        type="pie"
                                                        width="290"
                                                        height="220px"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>


                                    <div className="col-md-8">
                                        <div className="card p-3 shadow-sm" style={{ borderRadius: '15px', width: '100%', height: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <h5 className="text-center text-uppercase" style={{ color: '#FF6347', fontSize: '18px', marginBottom: '15px' }}>
                                                Total Energy Consumed
                                            </h5>

                                            {/* Buttons to switch between weekly/monthly/yearly */}
                                            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                                <button
                                                    onClick={() => { setViewMode('weekly'); setScrollIndex(0); }}
                                                    style={{
                                                        margin: '0 10px',
                                                        padding: '8px 18px',
                                                        backgroundColor: viewMode === 'weekly' ? '#1e7e34' : '#34d058', // Dark green for active
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '5px',
                                                        fontSize: '14px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                >
                                                    Weekly
                                                </button>
                                                <button
                                                    onClick={() => { setViewMode('monthly'); setScrollIndex(0); }}
                                                    style={{
                                                        margin: '0 10px',
                                                        padding: '8px 18px',
                                                        backgroundColor: viewMode === 'monthly' ? '#1e7e34' : '#34d058', // Dark green for active
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '5px',
                                                        fontSize: '14px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                >
                                                    Monthly
                                                </button>
                                                <button
                                                    onClick={() => { setViewMode('yearly'); setScrollIndex(0); }}
                                                    style={{
                                                        margin: '0 10px',
                                                        padding: '8px 18px',
                                                        backgroundColor: viewMode === 'yearly' ? '#1e7e34' : '#34d058', // Dark green for active
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '5px',
                                                        fontSize: '14px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
                                                    }}
                                                >
                                                    Yearly
                                                </button>
                                            </div>


                                            <div style={{ display: 'flex', alignItems: 'center', height: '270px', justifyContent: 'space-between' }}>
                                                <button
                                                    onClick={scrollLeft}
                                                    disabled={scrollIndex === 0}
                                                    style={{
                                                        fontSize: '18px',  // Smaller font size for the button
                                                        padding: '6px 12px',  // Smaller padding for a more compact button
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
                                                        border: 'none',
                                                        backgroundColor: '#ddd',
                                                        borderRadius: '50%',
                                                    }}
                                                >
                                                    &lt;
                                                </button>

                                                {/* Scrollable Chart */}
                                                <div
                                                    ref={containerRef}
                                                    style={{
                                                        overflowX: 'auto',
                                                        whiteSpace: 'nowrap',
                                                        width: '85%',  // Reduce width to make it fit better within the container
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        height: '100%',
                                                        marginBottom: '15px', // Add some space below the chart
                                                    }}
                                                >
                                                    {getChartData() ? (
                                                        <div style={{ width: `${visibleBars * 90}px`, height: '97%' }}>
                                                            <Bar
                                                                data={getChartData()}
                                                                options={{
                                                                    responsive: true,
                                                                    maintainAspectRatio: false,
                                                                    plugins: {
                                                                        tooltip: {
                                                                            callbacks: {
                                                                                label: (tooltipItem) => `${tooltipItem.raw} kWh`,
                                                                            },
                                                                        },
                                                                        legend: { display: false },
                                                                    },
                                                                    scales: {
                                                                        x: {
                                                                            grid: { display: false },
                                                                            ticks: {
                                                                                autoSkip: true,
                                                                                maxTicksLimit: 10,
                                                                                font: { size: 10 },  // Set the font size of the x-axis labels
                                                                            }
                                                                        },
                                                                        y: {
                                                                            beginAtZero: true,
                                                                            ticks: {
                                                                                max: Math.max(...getChartData().datasets[0].data) + 10
                                                                            }
                                                                        },
                                                                    },
                                                                    elements: {
                                                                        bar: {
                                                                            borderRadius: 5,
                                                                            barThickness: 8,  // Increased thickness of bars
                                                                            categoryPercentage: 0.3,  // Adjusted category width
                                                                            barPercentage: 0.7,      // Increased bar width within category
                                                                        }
                                                                    },
                                                                    backgroundColor: '#007BFF',  // Blue color for the bars
                                                                    borderColor: '#007BFF',      // Blue border color for the bars
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p>No data available.</p>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={scrollRight}
                                                    disabled={scrollIndex + visibleBars >= energyData[`${viewMode}EnergyConsumed`].length}
                                                    style={{
                                                        fontSize: '18px',  // Smaller font size for the button
                                                        padding: '6px 12px',  // Smaller padding for a more compact button
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
                                                        border: 'none',
                                                        backgroundColor: '#ddd',
                                                        borderRadius: '50%',
                                                    }}
                                                >
                                                    &gt;
                                                </button>
                                            </div>
                                        </div>


                                    </div>







                                </div>


                                <div className="row">
                                    {/* Top Row: Chargers Overview, Total Chargers, Online Chargers */}
                                    <div className="col-md-6 mb-3" ref={totalChargersRef}>
                                        <div className="card p-3 shadow-sm" style={{
                                            borderTop: `4px solid #007BFF`,
                                            borderRadius: '15px',
                                            boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.1)',
                                            minHeight: '350px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                        }}>
                                            <h5 className="font-weight-normal mb-3" style={{
                                                color: '#007BFF',
                                                textTransform: 'uppercase',
                                                fontSize: '18px',
                                                textAlign: 'center',
                                                letterSpacing: '1px',
                                            }}>
                                                Total Chargers
                                            </h5>
                                            <div style={{
                                                flexGrow: 1,
                                                overflow: 'auto',
                                                maxHeight: '270px',
                                                border: `1px solid #007BFF66`,
                                                borderRadius: '8px',
                                            }}>
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table className="table table-bordered table-hover" style={{ tableLayout: 'fixed', width: '100%' }}>
                                                        <thead>
                                                            <tr style={{
                                                                textAlign: 'center',
                                                                borderBottom: `2px solid #007BFF`,
                                                                backgroundColor: '#007BFF33',
                                                            }}>
                                                                <th style={{ width: '50%' }}>Charger ID</th>
                                                                <th style={{ width: '50%' }}>Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {chargersData.totalChargers.length > 0 ? (
                                                                chargersData.totalChargers.map((charger, idx) => {
                                                                    let { statusText, statusColor } = getChargerStatus(charger);
                                                                    return (
                                                                        <tr key={idx}>
                                                                            <td
                                                                                style={{ textAlign: 'center', cursor: 'pointer' }}
                                                                                onClick={() => handleChargerClick(charger)}
                                                                            >
                                                                                {charger.charger_id}
                                                                            </td>                                            <td style={{ textAlign: 'center', color: statusColor }}>
                                                                                {statusText}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="2" style={{ textAlign: 'center', color: '#9E9E9E' }}>No chargers found</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Online Chargers Section */}
                                    <div className="col-md-6 mb-3" ref={onlineChargersRef}>
                                        <div className="card p-3 shadow-sm" style={{
                                            borderTop: `4px solid #4CAF50`,
                                            borderRadius: '15px',
                                            boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.1)',
                                            minHeight: '350px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                        }}>
                                            <h5 className="font-weight-normal mb-3" style={{
                                                color: '#4CAF50',
                                                textTransform: 'uppercase',
                                                fontSize: '18px',
                                                textAlign: 'center',
                                                letterSpacing: '1px',
                                            }}>
                                                Online Chargers
                                            </h5>
                                            <div style={{
                                                flexGrow: 1,
                                                overflow: 'auto',
                                                maxHeight: '270px',
                                                border: `1px solid #4CAF5066`,
                                                borderRadius: '8px',
                                            }}>
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table className="table table-bordered table-hover" style={{ tableLayout: 'fixed', width: '100%' }}>
                                                        <thead>
                                                            <tr style={{
                                                                textAlign: 'center',
                                                                borderBottom: `2px solid #4CAF50`,
                                                                backgroundColor: '#4CAF5033',
                                                            }}>
                                                                <th style={{ width: '33%' }}>Charger ID</th>
                                                                <th style={{ width: '33%' }}>Status</th>
                                                                <th style={{ width: '34%' }}>Connector Type</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {chargersData.availableChargers.length > 0 ? (
                                                                chargersData.availableChargers.map((charger, idx) => {
                                                                    let { statusText, statusColor } = getChargerStatus(charger);
                                                                    let connectorType = charger.connector_type === 1 ? 'Socket' : 'Gun';
                                                                    let connectorColor = connectorType === 'Socket' ? '#007BFF' : '#4CAF50'; // Blue for Socket, Green for Gun
                                                                    return (
                                                                        <tr key={idx}>
                                                                            <td
                                                                                style={{ textAlign: 'center', cursor: 'pointer' }}
                                                                                onClick={() => handleChargerClick(charger)}
                                                                            >
                                                                                {charger.charger_id}
                                                                            </td>                                            <td style={{ textAlign: 'center', color: statusColor }}>
                                                                                {statusText}
                                                                            </td>
                                                                            <td style={{ textAlign: 'center', color: connectorColor }}>
                                                                                {connectorType}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="3" style={{ textAlign: 'center', color: '#9E9E9E' }}>No chargers found</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div className="row">

                                    <div className="col-md-6 mb-3" ref={faultedChargersRef}>
                                        <div className="card p-3 shadow-sm" style={{
                                            borderTop: `4px solid #FF9800`,
                                            borderRadius: '15px',
                                            boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.1)',
                                            minHeight: '350px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                        }}>
                                            <h5 className="font-weight-normal mb-3" style={{
                                                color: '#FF9800',
                                                textTransform: 'uppercase',
                                                fontSize: '18px',
                                                textAlign: 'center',
                                                letterSpacing: '1px',
                                            }}>
                                                Chargers Faulted
                                            </h5>
                                            <div style={{
                                                flexGrow: 1,
                                                overflow: 'auto',
                                                maxHeight: '270px',
                                                border: `1px solid #FF980066`,
                                                borderRadius: '8px',
                                            }}>
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table className="table table-bordered table-hover" style={{ tableLayout: 'fixed', width: '100%' }}>
                                                        <thead>
                                                            <tr style={{
                                                                textAlign: 'center',
                                                                borderBottom: `2px solid #FF9800`,
                                                                backgroundColor: '#FF980033',
                                                            }}>
                                                                <th style={{ width: '33%' }}>Charger ID</th>
                                                                <th style={{ width: '33%' }}>Status</th>
                                                                <th style={{ width: '34%' }}>Connector Type</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {chargersData.faultedChargers.length > 0 ? (
                                                                chargersData.faultedChargers.map((charger, idx) => {
                                                                    let { statusText, statusColor } = getChargerStatus(charger);
                                                                    let connectorType = charger.connector_type === 1 ? 'Socket' : 'Gun';
                                                                    let connectorColor = connectorType === 'Socket' ? '#007BFF' : '#4CAF50'; // Blue for Socket, Green for Gun
                                                                    return (
                                                                        <tr key={idx}>
                                                                            <td
                                                                                style={{ textAlign: 'center', cursor: 'pointer' }}
                                                                                onClick={() => handleChargerClick(charger)}
                                                                            >
                                                                                {charger.charger_id}
                                                                            </td>                                            <td style={{ textAlign: 'center', color: statusColor }}>
                                                                                {statusText}
                                                                            </td>
                                                                            <td style={{ textAlign: 'center', color: connectorColor }}>
                                                                                {connectorType}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="3" style={{ textAlign: 'center', color: '#9E9E9E' }}>No chargers found</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Offline Chargers Section */}
                                    <div className="col-md-6 mb-3" ref={offlineChargersRef}>
                                        <div className="card p-3 shadow-sm" style={{
                                            borderTop: `4px solid #F44336`,
                                            borderRadius: '15px',
                                            boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.1)',
                                            minHeight: '350px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                        }}>
                                            <h5 className="font-weight-normal mb-3" style={{
                                                color: '#F44336',
                                                textTransform: 'uppercase',
                                                fontSize: '18px',
                                                textAlign: 'center',
                                                letterSpacing: '1px',
                                            }}>
                                                Offline Chargers
                                            </h5>
                                            <div style={{
                                                flexGrow: 1,
                                                overflow: 'auto',
                                                maxHeight: '270px',
                                                border: `1px solid #F4433666`,
                                                borderRadius: '8px',
                                            }}>
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table className="table table-bordered table-hover" style={{ tableLayout: 'fixed', width: '100%' }}>
                                                        <thead>
                                                            <tr style={{
                                                                textAlign: 'center',
                                                                borderBottom: `2px solid #F44336`,
                                                                backgroundColor: '#F4433633',
                                                            }}>
                                                                <th style={{ width: '33%' }}>Charger ID</th>
                                                                <th style={{ width: '33%' }}>Status</th>
                                                                <th style={{ width: '34%' }}>Connector Type</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {chargersData.offlineChargers.length > 0 ? (
                                                                chargersData.offlineChargers.map((charger, idx) => {
                                                                    let { statusText, statusColor } = getChargerStatus(charger);
                                                                    let connectorType = charger.connector_type === 1 ? 'Socket' : 'Gun';
                                                                    let connectorColor = connectorType === 'Socket' ? '#007BFF' : '#4CAF50'; // Blue for Socket, Green for Gun
                                                                    return (
                                                                        <tr key={idx}>
                                                                            <td
                                                                                style={{ textAlign: 'center', cursor: 'pointer' }}
                                                                                onClick={() => handleChargerClick(charger)}
                                                                            >
                                                                                {charger.charger_id}
                                                                            </td>                                            <td style={{ textAlign: 'center', color: statusColor }}>
                                                                                {statusText}
                                                                            </td>
                                                                            <td style={{ textAlign: 'center', color: connectorColor }}>
                                                                                {connectorType}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="3" style={{ textAlign: 'center', color: '#9E9E9E' }}>No chargers found</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                    {isModalOpen && selectedCharger && (
    <div
        className="modal fade show"
        onClick={() => setIsModalOpen(false)} // Close on background click
        style={{
            display: 'flex',
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '100vw',
            zIndex: 1050,
            overflowY: 'auto',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // optional dim background
        }}
    >
        <div
            className="modal-dialog"
            style={{ maxWidth: '60%', width: '100%' }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
            <div className="modal-content rounded-4 shadow">
                <div
                    className="modal-header d-flex justify-content-between align-items-center"
                    style={{
                        borderTopLeftRadius: '1rem',
                        borderTopRightRadius: '1rem',
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid #dee2e6',
                    }}
                >
                    <h5 className="modal-title mb-0">
                        <span style={{ fontWeight: 500 }}>Charger Details</span>
                    </h5>
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <i className="fas fa-arrow-left me-2 pr-3"></i>Back
                    </button>
                </div>

                <div className="modal-body px-4 py-3">
                    <div className="row">
                        {Object.entries(selectedCharger)
                            .filter(([key, value]) => key !== '_id' && key !== 'connector_id' && key !== 'assigned_reseller_id' && key !== 'assigned_client_id' && key !== 'assigned_association_id' &&  key !== 'finance_id' && value !== undefined && value !== null)
                            .map(([key, value], idx) => {
                                let displayValue = value;

                                if (key === 'connector_type') {
                                    displayValue = value === 1 ? 'Socket' : value === 2 ? 'Gun' : value;
                                } else if (key === 'charger_accessibility') {
                                    displayValue = value === 1 ? 'Public' : value === 2 ? 'Private' : value;
                                }
                                else if (key === 'status') {
                                    displayValue = value ? 'Active' : 'Deactive';
                                }else if (typeof value === 'boolean') {
                                    displayValue = value ? 'Yes' : 'No';
                                } else if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
                                    displayValue = new Date(value).toLocaleString();
                                }
                                

                                return (
                                    <div className="col-md-4 mb-3" key={idx}>
                                    <div className="form-group">
                                        <div style={{ fontWeight: '500', color: '#212529' }}>
                                            {key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}:{' '}
                                            <span
                                                style={{
                                                    fontWeight: 'normal',
                                                    color:
                                                        key === 'status'
                                                            ? value
                                                                ? 'green'
                                                                : 'red'
                                                            : '#212529',
                                                }}
                                            >
                                                {displayValue}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                    </div>
                </div>
            </div>
        </div>
    </div>
)}

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>




                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );




};



export default Dashboard;
function getChargerStatus(charger) {
    if (!charger) {
        return { statusText: 'Unknown', statusColor: 'grey' };
    }

    let statusText = 'Unknown';
    let statusColor = 'grey';

    if (typeof charger.status === 'boolean') {
        statusText = charger.status ? 'Active' : 'Deactive';
        statusColor = charger.status ? 'green' : 'red';
    }
    else if (typeof charger.charger_status === 'string') {
        statusText = charger.charger_status || 'Unknown';
        switch (charger.charger_status) {
            case 'Available':
                statusColor = 'green';
                break;
            case 'Unavailable':
                statusColor = 'red';
                break;
            case 'Faulted':
                statusColor = 'red';
                break;
            default:
                statusColor = 'blue';
                break;
        }
    }

    return { statusText, statusColor };
}

