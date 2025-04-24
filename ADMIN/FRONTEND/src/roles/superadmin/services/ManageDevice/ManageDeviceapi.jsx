import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;



// AddManageDevice API
export const fetchConnectorTypeName = (connectorType) => {
    return axios.post(`${BASE_URL}/superadmin/fetchConnectorTypeName`, {
        connector_type: connectorType
    });
};

export const createCharger = (payload) => {
    return axios.post(`${BASE_URL}/superadmin/CreateCharger`, payload);
};

export const fetchChargers = () => {
    return axios.get(`${BASE_URL}/superadmin/FetchCharger`);
};

//AssignReseller 


export const FetchResellersToAssgin=()=>{
    return axios.get(`${BASE_URL}/superadmin/FetchResellersToAssgin`)
};

export const FetchUnAllocatedChargerToAssgin=()=>{
    return axios.get(`${BASE_URL}/superadmin/FetchUnAllocatedChargerToAssgin`)
}

export const AssginChargerToReseller=(resellerID,charger_ids,userInfo)=>{
    return axios.post(`${BASE_URL}/superadmin/AssginChargerToReseller`,{
        reseller_id: resellerID,
        charger_ids:charger_ids,
        modified_by: userInfo.data.email_id
    })
}

//EditManageDevice
export const fetchConnectorTypeNameforupdate=(connectorType)=>{
return axios.post(`${BASE_URL}/superadmin/fetchConnectorTypeName`,{
    connector_type:connectorType
})
}

export const UpdateChargerManageDevice=(payload)=>{
return axios.post(`${BASE_URL}/superadmin/UpdateCharger`,payload)
}


//ManageDevice

export const FetchCharger=()=>{
    return axios.get(`${BASE_URL}/superadmin/FetchCharger`)
}

export const CreateChargerWithExcelFile = (file, email) => {
    const formData = new FormData();
    formData.append("req.file", file);
    formData.append("eq.body.created_by", email);

    return axios.post(`${BASE_URL}/superadmin/CreateChargerWithExcelFile`, formData);
};

// Allocated Device 
export const fetchAllocatedChargers = () => {
    return axios.get(`${BASE_URL}/superadmin/FetchAllocatedChargers`);
};

export const DeActivateOrActivateCharger = (chargerId, modifiedBy, currentStatus) => {
    return axios.post(`${BASE_URL}/superadmin/DeActivateOrActivateCharger`, {
        charger_id: chargerId,
        modified_by: modifiedBy,
        status: !currentStatus,
    });
};

//EditAllocManageDevice

export const UpdateConnectorTypeName = (connectorType) => {
    return axios.post(`${BASE_URL}/superadmin/fetchConnectorTypeName`, {
        connector_type: connectorType,
    });
};
export const Allocatedchargerupdate=(payload)=>{
    return axios.post(`${BASE_URL}/superadmin/UpdateCharger`,payload)
}


