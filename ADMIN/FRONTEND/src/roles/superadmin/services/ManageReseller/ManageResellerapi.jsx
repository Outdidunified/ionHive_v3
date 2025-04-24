// src/services/ManageReseller/resellerApi.js

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// Create Reseller
export const createReseller = (resellerData) => {
    return axios.post(`${BASE_URL}/superadmin/CreateReseller`, resellerData);
};

// Fetch Charger Details with Session
export const FetchChargerDetailsWithSession = (reseller_id) => {
    return axios.post(`${BASE_URL}/superadmin/FetchChargerDetailsWithSession`, {
        reseller_id,
    });
};

// AssignClients
export const fetchAssignedClients = (reseller_id) => {
    return axios.post(`${BASE_URL}/superadmin/FetchAssignedClients`, {
        reseller_id,
    });
};
//EditManageReseller

export const updateReseller = (resellerData) => {
    return axios.post(`${BASE_URL}/superadmin/UpdateReseller`, resellerData);
};

//Manage Reseller

export const FetchResellers=()=>{
    return axios.get(`${BASE_URL}/superadmin/FetchResellers`);
}

