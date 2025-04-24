// src/services/superadmin/userRoleService.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchUserRoles = async () => {
  const response = await axios.get(`${API_URL}/superadmin/FetchUserRoles`);
  return response.data.data;
};

export const updateUserRole = async ({ role_id, role_name, modified_by }) => {
  return await axios.post(`${API_URL}/superadmin/UpdateUserRole`, {
    role_id,
    role_name,
    modified_by,
  });
};

export const changeUserRoleStatus = async ({ role_id, status, modified_by }) => {
  return await axios.post(`${API_URL}/superadmin/DeActivateOrActivateUserRole`, {
    role_id,
    status,
    modified_by,
  });
};

// Optional if you plan to add this back later
export const createUserRole = async ({ role_name, created_by }) => {
  return await axios.post(`${API_URL}/superadmin/CreateUserRole`, {
    role_name,
    created_by,
  });
};
