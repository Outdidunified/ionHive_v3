import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useViewManageReseller = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [newUser, setNewUser] = useState({
    reseller_name: '', reseller_email_id: '', reseller_phone_no: '', reseller_address: '', reseller_id: '',
    status: '', created_by: '', created_date: '', modified_by: '', modified_date: '', reseller_wallet: '', _id: '',
  });

  useEffect(() => {
    const { dataItem } = location.state || {};
    if (dataItem) {
      setNewUser({
        reseller_name: dataItem.reseller_name || '',
        reseller_email_id: dataItem.reseller_email_id || '',
        reseller_phone_no: dataItem.reseller_phone_no || '',
        reseller_address: dataItem.reseller_address || '',
        reseller_id: dataItem.reseller_id || '',
        status: dataItem.status || '',
        created_by: dataItem.created_by || '',
        created_date: dataItem.created_date || '',
        modified_by: dataItem.modified_by || '',
        modified_date: dataItem.modified_date || '',
        reseller_wallet: dataItem.reseller_wallet || '',
        _id: dataItem._id || '',
      });
      localStorage.setItem('userData', JSON.stringify(dataItem));
    } else {
      const savedData = JSON.parse(localStorage.getItem('userData'));
      if (savedData) {
        setNewUser(savedData);
      }
    }
  }, [location]);

  

  

  return {
    newUser
  };
};

export default useViewManageReseller;
