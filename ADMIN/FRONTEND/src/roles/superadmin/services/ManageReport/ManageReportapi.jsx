import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// Device Report APIs
export const FetchReportDevice = () => {
    return axios.get(`${BASE_URL}/superadmin/FetchReportDevice`);
};

export const ManageDeviceReport = (fromDate, toDate, selectDevice) => {
    return axios.post(`${BASE_URL}/superadmin/DeviceReport`, {
        from_date: fromDate,
        to_date: toDate,
        device_id: selectDevice,
    });
};

// Revenue Report APIs
export const FetchSpecificChargerRevenue = () => {
    return axios.get(`${BASE_URL}/superadmin/FetchSpecificChargerRevenue`);
};

export const FetchChargerListWithAllCostWithRevenue = () => {
    return axios.get(`${BASE_URL}/superadmin/FetchChargerListWithAllCostWithRevenue`);
};
