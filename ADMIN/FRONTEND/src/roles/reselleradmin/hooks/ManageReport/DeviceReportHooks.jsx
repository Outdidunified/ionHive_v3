import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../../utils/utils';
import { showWarningAlert,showErrorAlert } from '../../../../utils/alert';

const useDeviceReport = (userInfo) => {
  const [deviceData, setDeviceData] = useState([]);
  const [loadingDevice, setLoadingDevice] = useState(true);
  const [errorDevice, setErrorDevice] = useState(null);
  const fetchDataCalled = useRef(false);
  const [error, setError] = useState(null);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectDevice, setDevice] = useState('');
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [deviceId, setDeviceId] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Fetch device list
 useEffect(() => {
  if (!fetchDataCalled.current) {
    const fetchReportDevice = async () => {
      setLoadingDevice(true);
      try {
        const response = await axiosInstance({
          method: 'post',
          url: '/reselleradmin/FetchReportDevice',
          data: {
            reseller_id: userInfo?.reseller_id,
          },
        });

        setDeviceData(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (err) {
        const errorMessage = err?.response?.data?.message || 'Failed to Fetch Report Device';
        setErrorDevice(errorMessage);
        console.error('Error fetching report device:', err);
      } finally {
        setLoadingDevice(false);
      }
    };

    fetchReportDevice();
    fetchDataCalled.current = true;
  }
}, [userInfo]);

  // Handle search
  
  
  const handleSearch = async () => {
    setError(null);
  
    if (!fromDate && !toDate && !selectDevice) {
       showWarningAlert("Missing Fields", "Please select From Date, To Date, and Device.");
      return;
    }
  
    if (!fromDate && !toDate) {
       showWarningAlert("Missing Dates", "Please select both From Date and To Date.");
      return;
    }
  
    if (!fromDate) {
       showWarningAlert("Missing From Date", "Please select a valid From Date.");
      return;
    }
  
    if (!toDate) {
       showWarningAlert("Missing To Date", "Please select a valid To Date.");
      return;
    }
  
    if (new Date(fromDate) > new Date(toDate)) {
       showWarningAlert("Invalid Date Range", "From Date cannot be later than To Date.");
      return;
    }
  
    if (!selectDevice) {
       showWarningAlert("Missing Device", "Please select a device.");
      return;
    }
  
    setLoading(true);
    setTableData([]);
    setDeviceId('');
  
    try {
      const response = await axiosInstance({method:'post',url:'/reselleradmin/DeviceReport', data:{
        from_date: fromDate, to_date: toDate, device_id: selectDevice
      }});
  
      const responseData = response.data;
  
      if (responseData?.status === "Failed") {
         showWarningAlert("No Data", responseData?.message || "No data found for the selected date range.");
        return;
      }
  
      if (response.status === 200 && responseData?.data?.sessions?.length > 0) {
        setDeviceId(responseData.data.device_id || "");
        setTableData(responseData.data.sessions || []);
      } else {
         showWarningAlert("No Data", "No data found for the selected date range.");
      }
  
    } catch (error) {
      console.error("Error fetching device report:", error);
  
      if (error.response && error.response.status === 404) {
        const errorMessage = error.response.data?.message || "Resource not found.";
         showErrorAlert("Error", errorMessage);
      } else {
         showErrorAlert("Error", error.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handlePrint = () => {
    if (!tableData || tableData.length === 0) {
      showWarningAlert('Warning', 'No data available to print.', 3000);
      return;
    }
  
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Charger Data</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid black; padding: 10px; text-align: center; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h2>Charger Data</h2>
                <table>
                    <thead>
                        <tr> 
                            <th>Sl.No</th>
                            <th>Charger ID</th>
                            <th>Session ID</th>
                            <th>User Name</th>
                            <th>Start Time</th>
                            <th>Stop Time</th>
                            <th>Unit Consumed</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableData.map((session, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${deviceId || "-"}</td>
                                <td>${session.session_id || "-"}</td>
                                <td>${session.user || "-"}</td>
                                <td>${session.start_time || "-"}</td>
                                <td>${session.stop_time || "-"}</td>
                                <td>${session.unit_consumed || "-"}</td>
                                <td>${session.price || "-"}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };
  

  // Handle Export to CSV
  const handleExport = () => {
      if (!tableData || tableData.length === 0) {
        showWarningAlert('Warning', 'No data available to export.', 3000);
        return;
      }
    
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += `"Sl.No","Charger ID","Session ID","User Name","Start Time","Stop Time","Unit Consumed","Price"\r\n`;
    
      tableData.forEach((session, index) => {
        let chargerId = deviceId ? `"'${deviceId}"` : `"-"`;
        csvContent += `"${index + 1}",${chargerId},"${session.session_id || "-"}","${session.user || "-"}","${session.start_time || "-"}","${session.stop_time || "-"}","${session.unit_consumed || "-"}","${session.price || "-"}"\r\n`;
      });
    
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.href = encodedUri;
      link.download = "charger_data.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };




  return {
    today,
    deviceData,
    loadingDevice,
    errorDevice,
    fromDate,
    toDate,
    handleExport,
    handlePrint,
    setFromDate,
    setToDate,
    selectDevice,
    setDevice,
    loading,
    tableData,
    deviceId,
    handleSearch,
    error
  };
};

export default useDeviceReport;
