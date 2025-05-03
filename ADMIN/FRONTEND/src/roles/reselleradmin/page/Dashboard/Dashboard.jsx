import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import Chart from 'react-apexcharts';
import useDashboard from '../../hooks/Dashboard/DashboardHooks';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Dashboard = ({ userInfo, handleLogout }) => {
    const {
        totalChargers,
        availableChargers,
        faultedChargers,
        offlineChargers,
        totalsession,
        scrollIndex, setScrollIndex,
        visibleBars,
        containerRef,
        setHover,
        totalChargersRef,
        onlineChargersRef,
        faultedChargersRef,
        offlineChargersRef,
        selectedCharger,
        isModalOpen,
        setIsModalOpen,
        totalCounts, chargersData,
        energyData, viewMode, setViewMode,
        fetchData, getChartData, scrollLeft,
        scrollRight, handleChargerClick,
    } = useDashboard(userInfo);




    return (
        <div className="container-scroller" style={{ background: '#f4f7fb' }}>
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="container-fluid page-body-wrapper">
                <Sidebar />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-12 grid-margin d-flex justify-content-between align-items-center admin-header">
                                <div>
                                    <h3 className="font-weight-bold" style={{ color: '#4B49AC' }}>
                                        Welcome to <span>{userInfo.email_id}</span>,
                                    </h3>
                                    <h4 className="font-weight-normal" style={{ fontSize: '1.4rem', color: '#333' }}>
                                        Reseller Admin Dashboard
                                    </h4>
                                </div>
                                <button className="btn btn-primary" onClick={fetchData}>
                                    <i className="fa fa-sync"></i> Reload Data
                                </button>
                            </div>

                        </div>
                        <div className="row d-flex justify-content-center">
                            <div className="col-md-6 mb-3 d-flex justify-content-center">
                                <div className="card p-4 text-center shadow-lg card-custom-box" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                                    <h2 className="title-energy-consumed">
                                        EV ENERGY CONSUMED
                                    </h2>
                                    <p className="description">
                                        Insights into energy consumption and environmental impact of EV chargers.
                                    </p>

                                    <div className="row" style={{ width: '100%', flexWrap: 'wrap' }}>
                                        {/* CO2 Savings Block */}
                                        <div className="col-12 col-md-6 d-flex align-items-center mb-3 co2-savings-block">
                                            <div className="d-flex flex-column align-items-center">
                                                <i className="fa fa-leaf co2-icon"></i>
                                                <p className="co2-savings-text">
                                                    {(energyData && energyData.CO2_Savings !== undefined) ? energyData.CO2_Savings.toFixed(2) : '0.00'} kg
                                                </p>
                                                <p className="co2-savings-title">
                                                    CO<sub>2</sub> Savings
                                                </p>
                                            </div>
                                        </div>

                                        {/* Other 3 Blocks on the Right Side */}
                                        <div className="col-12 col-md-6 d-flex flex-column justify-content-between" style={{ height: 'auto' }}>
                                            {/* Total Energy Consumed Block */}
                                            <div className="d-flex align-items-center mb-3 energy-block">
                                                <div className="icon-circle">
                                                    <i className="fa fa-bolt" style={{ fontSize: '1.0rem' }}></i>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <p className="energy-text">
                                                        Total Energy Consumed
                                                    </p>
                                                    <p className="energy-value">
                                                        {(energyData && energyData.totalEnergyConsumed !== undefined) ? energyData.totalEnergyConsumed.toFixed(2) : '0.00'} kWh
                                                    </p>
                                                </div>
                                            </div>

                                            {/* CO2 from EV Block */}
                                            <div className="d-flex align-items-center mb-3 co2-from-ev-block">
                                                <div className="icon-circle car">
                                                    <i className="fa fa-car" style={{ fontSize: '1.0rem' }}></i>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <p className="energy-text">
                                                        CO<sub>2</sub> from EV
                                                    </p>
                                                    <p className="energy-value">
                                                        {(energyData && energyData.CO2_from_EV !== undefined) ? energyData.CO2_from_EV.toFixed(2) : '0.00'} kg
                                                    </p>
                                                </div>
                                            </div>

                                            {/* CO2 from ICE Block */}
                                            <div className="d-flex align-items-center mb-3 co2-from-ice-block">
                                                <div className="icon-circle fire">
                                                    <i className="fa fa-fire" style={{ fontSize: '1.0rem' }}></i>
                                                </div>
                                                <div className="d-flex flex-column">
                                                    <p className="energy-text">
                                                        CO<sub>2</sub> from ICE
                                                    </p>
                                                    <p className="energy-value">
                                                        {(energyData && energyData.CO2_from_ICE !== undefined) ? energyData.CO2_from_ICE.toFixed(2) : '0.00'} kg
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>



                            {/* 2x2 Grid of Charger Statistics */}
                            <div className="col-md-6 d-flex flex-wrap justify-content-start">
                                {[
                                    { title: 'Total Chargers', count: totalChargers, color: '#007BFF', icon: 'fa fa-bolt', bgColor: '#007BFF', targetRef: totalChargersRef },
                                    { title: 'Total Chargers Session', count: totalsession, color: '#9C27B0', icon: 'fa-history', bgColor: '#9C27B0' },
                                    { title: 'Online Chargers', count: availableChargers, color: '#4CAF50', icon: 'fa-plug', bgColor: '#4CAF50', targetRef: onlineChargersRef },
                                    { title: 'Chargers Faulted', count: faultedChargers, color: '#FF9800', icon: 'fa-exclamation-triangle', bgColor: '#FF9800', targetRef: faultedChargersRef },
                                    { title: 'Offline Chargers', count: offlineChargers, color: '#F44336', icon: 'fa-ban', bgColor: '#F44336', targetRef: offlineChargersRef },
                                    { title: 'Clients', count: totalCounts.clientsCount, color: '#2196F3', icon: 'fa-user-tie', bgColor: '#2196F3' },
                                    { title: 'Associations', count: totalCounts.associationsCount, color: '#8BC34A', icon: 'fa-handshake', bgColor: '#8BC34A' },
                                ].map((item, index) => (
                                    <div key={index} className="col-12 col-md-4 mb-3 d-flex justify-content-center">
                                        <div
                                            className="dashboard-card"
                                            onMouseEnter={(e) => e.currentTarget.classList.add('hover-scale')}
                                            onMouseLeave={(e) => e.currentTarget.classList.remove('hover-scale')}
                                            onClick={() => item.targetRef && item.targetRef.current.scrollIntoView({ behavior: 'smooth' })}
                                        >
                                            <div className="card-content">
                                                <h6 className="card-title">{item.title}</h6>
                                                <h3 className="card-count" style={{ color: item.color }}>{item.count}</h3>
                                            </div>
                                            <div className="card-icon" style={{ backgroundColor: item.bgColor }}>
                                                <i className={`fa ${item.icon}`}></i>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Energy Consumption Box moved above Chargers Unavailable Table */}
                            {/* 4 Boxes in One Row */}


                            {/* Chargers Data Tables */}
                            <div className="col-md-12 mt-4">
                                <div className="row mb-4 card-container">
                                    {/* First Row: Chargers Overview & Energy Consumed */}
                                    <div className="col-md-4">
                                        <div className="card p-3 shadow-sm card-custom">
                                            <h5 className="font-weight-normal mb-3 title-chargers-overview">
                                                Chargers Overview
                                            </h5>

                                            <div className="chart-container">
                                                {availableChargers === 0 && faultedChargers === 0 && offlineChargers === 0 ? (
                                                    <p className="no-data-message">
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
                                                        height="240px"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>


                                    <div className="col-md-8">
                                        <div className="card p-3 shadow-sm card-custom-energy">
                                            <h5 className="title-energy-consumed-title">
                                                Total Energy Consumed
                                            </h5>

                                            {/* Buttons to switch between weekly/monthly/yearly */}
                                            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                                <button
                                                    onClick={() => { setViewMode('weekly'); setScrollIndex(0); }}
                                                    className={`button-custom ${viewMode === 'weekly' ? 'button-weekly-active' : 'button-weekly-inactive'}`}
                                                >
                                                    Weekly
                                                </button>
                                                <button
                                                    onClick={() => { setViewMode('monthly'); setScrollIndex(0); }}
                                                    className={`button-custom ${viewMode === 'monthly' ? 'button-weekly-active' : 'button-weekly-inactive'}`}
                                                >
                                                    Monthly
                                                </button>
                                                <button
                                                    onClick={() => { setViewMode('yearly'); setScrollIndex(0); }}
                                                    className={`button-custom ${viewMode === 'yearly' ? 'button-weekly-active' : 'button-weekly-inactive'}`}
                                                >
                                                    Yearly
                                                </button>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', height: '270px', justifyContent: 'space-between' }}>
                                                <button
                                                    onClick={scrollLeft}
                                                    disabled={scrollIndex === 0}
                                                    className={`button-left-right ${scrollIndex === 0 ? 'button-disabled' : 'button-enabled'}`}
                                                >
                                                    &lt;
                                                </button>

                                                {/* Scrollable Chart */}
                                                <div
                                                    ref={containerRef}
                                                    className="chart-container"
                                                >
                                                    {getChartData() ? (
                                                        <div style={{ width: '80%', height: '97%' }}>
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
                                                    className={`button-left-right ${scrollIndex + visibleBars >= energyData[`${viewMode}EnergyConsumed`].length ? 'button-disabled' : 'button-enabled'}`}
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
                                                                            </td>
                                                                            <td style={{ textAlign: 'center', color: statusColor }}>
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
                                                                            </td>                                              <td style={{ textAlign: 'center', color: statusColor }}>
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
                                                                            </td>
                                                                            <td style={{ textAlign: 'center', color: statusColor }}>
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
                                                                            </td>                                              <td style={{ textAlign: 'center', color: statusColor }}>
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
                                                                                .filter(([key, value]) => key !== '_id' && key !== 'connector_id' && key !== 'assigned_reseller_id' && key !== 'assigned_client_id' && key !== 'assigned_association_id' && key !== 'finance_id' && value !== undefined && value !== null)
                                                                                .map(([key, value], idx) => {
                                                                                    let displayValue = value;

                                                                                    if (key === 'connector_type') {
                                                                                        displayValue = value === 1 ? 'Socket' : value === 2 ? 'Gun' : value;
                                                                                    } else if (key === 'charger_accessibility') {
                                                                                        displayValue = value === 1 ? 'Public' : value === 2 ? 'Private' : value;
                                                                                    }
                                                                                    else if (key === 'status') {
                                                                                        displayValue = value ? 'Active' : 'Deactive';
                                                                                    } else if (typeof value === 'boolean') {
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






                                {/* Second Row: Chargers Unavailable + Energy Consumption */}

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

    // First, check if charger.status is a boolean
    if (typeof charger.status === 'boolean') {
        statusText = charger.status ? 'Active' : 'Deactive';
        statusColor = charger.status ? 'green' : 'red';
    }
    // If it's not a boolean, check charger_status (assuming it's a string like 'Available', 'Unavailable', etc.)
    else if (typeof charger.charger_status === 'string') {
        statusText = charger.charger_status || 'Unknown'; // Return the status as it is
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
                statusColor = 'blue'; // Default color for unknown statuses
                break;
        }
    }

    return { statusText, statusColor };
}

