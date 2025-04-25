import React, { useState, useEffect, useRef } from 'react';
import {
    showSuccessAlert,
    showErrorAlert,showWarningAlert
  } from '../../../../utils/alert'; // Update import path as needed
  import Swal from 'sweetalert2';
  import axiosInstance from '../../../../utils/utils';

const useWithdraw = (userInfo) => {
    const [commissionAmount, setCommissionAmount] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [withdrawalRequests, setWithdrawalRequests] = useState([]);
     // eslint-disable-next-line
    const [clientData, setClientData] = useState(null);
     // eslint-disable-next-line
    const [userData,setUserData]=useState(null);

    const fetchCommissionAmountCalled = useRef(false); 
    const isFetching = useRef(false);

    // Function to fetch withdrawal requests and reseller data
    const fetchData = async () => {
        if (isFetching.current) return;
        isFetching.current = true;

        try {
            setIsLoading(true);
            const response = await axiosInstance.post('/clientadmin/FetchPaymentRequest', {
                user_id: userInfo.user_id,
            });

            if (response.status === 200 && response.data.data) {
                const { withdrawalDetails, clientData, user } = response.data.data;
                setWithdrawalRequests(withdrawalDetails);
                setClientData(clientData);
                setUserData(user);
            } else {
                setWithdrawalRequests([]);
                setClientData(null);
                setUserData(null);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    };

   
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    

    // fetch the commission amount
    useEffect(() => {
        const fetchCommissionAmount = async () => {
            try {
                const response = await axiosInstance.post('/clientadmin/FetchCommissionAmtClient', {
                    user_id: userInfo.user_id,
                });
                if (response.status === 200) {
                    setCommissionAmount(response.data.data);
                } else {
                    console.log('Failed to fetch commission amount');
                }
            } catch (error) {
                console.error('Error fetching commission amount:', error);
            }
        };

        if (!fetchCommissionAmountCalled.current && userInfo.user_id) {
            fetchCommissionAmount();
            fetchCommissionAmountCalled.current = true; // Mark fetchCommissionAmount as called
        }
    }, [userInfo.user_id]); // Include userInfo.data.user_id in the dependency array

    const [formData, setFormData] = useState({
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        ifscNumber: "",
    });
    
    const [initialData, setInitialData] = useState(null); // Store initial fetched data
    const [errors, setErrors] = useState({
        accountNumber: "",
        ifscNumber: "",
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const fetchUserDetailsCalled = useRef(false);
    
    const fetchUserDetails = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post('/clientadmin/fetchUserBankDetails', {
               user_id: userInfo.user_id })
    
            if (response.status === 200) {
                const data = response.data
                if (data?.data) {
                    setFormData(data.data);
                    setInitialData(data.data);
                    setIsEditing(true);
                } else {
                    setIsEditing(false);
                }
            }
        } catch (error) {
            console.error("Error fetching user bank details:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (!fetchUserDetailsCalled.current && userInfo.user_id) {
            fetchUserDetails();
            fetchUserDetailsCalled.current = true;
        }
    // eslint-disable-next-line
    }, [userInfo]);
    
    
    
    // Handle Input Change with Validation
    const handleChange = (e) => {
        const { name, value } = e.target;
    
        // Convert input to uppercase
        const uppercasedValue = value.toUpperCase();
    
        // Validation Rules
        if (name === "accountNumber" && (!/^\d*$/.test(value) || value.length > 18)) return;
        if (name === "ifscNumber" && (!/^[A-Z0-9]{0,11}$/i.test(value))) return; // No hyphens allowed
        if (name === "accountHolderName" && (!/^[A-Z\s]{0,50}$/.test(uppercasedValue))) return; // Only uppercase letters and spaces
        if (name === "bankName" && (!/^[A-Z\s]{0,100}$/.test(uppercasedValue))) return; // Only uppercase letters and spaces
    
        setFormData((prevData) => ({
            ...prevData,
            user_id: userInfo?.user_id || prevData.user_id,
            created_by: userInfo?.email_id || prevData.created_by,
            [name]: uppercasedValue, // Use the uppercase value for both fields
        }));
    
        // Remove Errors on Valid Input
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
        }));
    };
    
    
    // Check if form has changes
    const hasChanges = () => {
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
      
        if (!hasChanges()) return;
      
        try {
          const endpoint = isEditing
            ? '/clientadmin/updateUserBankDetails'
            : '/clientadmin/saveUserBankDetails';
      
          setIsLoading(true);
      
          const updatedFormData = {
            ...formData,
            modified_by: userInfo.email_id,
          };
      
          console.log("Sending data:", updatedFormData);
      
          const response = await axiosInstance.post(endpoint, updatedFormData);
      
          if (response.data?.message?.toLowerCase().includes("success")) {
            setInitialData({ ...formData });
            setIsEditing(true);
      
            // Force re-fetch of user details
            fetchUserDetailsCalled.current = false;
            fetchUserDetails();
      
            showSuccessAlert(
              'Success',
              isEditing ? 'Details updated successfully!' : 'Details saved successfully!'
            );
          } else {
            showErrorAlert('Error', response.data?.message || 'Failed to save details.');
          }
        } catch (error) {
          showErrorAlert('Error', error.response?.data?.message || 'Something went wrong.');
        } finally {
          setIsLoading(false);
        }
      };
      
    
     // Update import path as needed
      
      const handleWithdraw = async () => {
        const { accountHolderName, bankName, accountNumber, ifscNumber } = formData;
      
        if (!accountHolderName || !bankName || !accountNumber || !ifscNumber) {
          showWarningAlert(
            'Incomplete Details',
            'Please fill in all account details before proceeding with withdrawal.'
          );
          return;
        }
      
        let walletBalance = 0;
        try {
          const response = await axiosInstance.post('/clientadmin/FetchCommissionAmtClient', {
            user_id: userInfo.user_id,
          });
      
          if (response.status === 200) {
            walletBalance = response.data.data;
          }
        } catch (error) {
          console.error("Error fetching wallet balance:", error);
        }
      
        if (walletBalance < 100) {
          showWarningAlert(
            'Insufficient Balance',
            'Your wallet balance is less than Rs 100, and you cannot proceed with the withdrawal.'
          );
          return;
        }
      
        const { value: withdrawalAmount } = await Swal.fire({
          title: "<h3 style='color:#333;'>Withdraw Funds</h3>",
          html: `
            <div style="text-align: left; font-size: 16px;">
                <p><b>Wallet Balance:</b> Rs ${walletBalance}</p>
                <p><b>Account Holder:</b> ${accountHolderName}</p>
                <p><b>Bank Name:</b> ${bankName}</p>
                <p><b>Account Number:</b> ${accountNumber}</p>
                <p><b>IFSC Code:</b> ${ifscNumber}</p>
                <hr>
                <label for="withdrawAmount" style="font-weight: bold;">Enter Amount:</label>
                <input 
                    type="text"  
                    id="withdrawAmount" 
                    class="swal2-input" 
                    value="${walletBalance}" 
                    style="font-size: 18px; text-align: center;"
                    placeholder="Enter withdrawal amount"
                >
                <div id="commissionText" style="margin-top: 10px; color: #d32f2f; font-weight: normal;"></div>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: "<i class='fas fa-check-circle'></i> Proceed",
          cancelButtonText: "<i class='fas fa-times'></i> Cancel",
          confirmButtonColor: "#4CAF50",
          cancelButtonColor: "#f44336",
          focusConfirm: false,
          preConfirm: () => {
            const amount = parseFloat(document.getElementById("withdrawAmount").value);
            if (!amount || isNaN(amount) || amount <= 0) {
              Swal.showValidationMessage("Please enter a valid amount.");
              return false;
            }
            if (amount < 100) {
              Swal.showValidationMessage("You cannot withdraw less than Rs 100.");
              return false;
            }
            if (amount > walletBalance) {
              Swal.showValidationMessage("You cannot withdraw more than your wallet balance.");
              return false;
            }
            return amount;
          },
          didOpen: () => {
            const inputField = document.getElementById("withdrawAmount");
            const commissionText = document.getElementById("commissionText");
      
            inputField.setAttribute("max", walletBalance);
      
            const updateCommissionDetails = () => {
              let amount = inputField.value.replace(/[^0-9.]/g, '');
              if ((amount.match(/\./g) || []).length > 1) {
                amount = amount.slice(0, -1);
              }
      
              inputField.value = amount;
      
              const numericAmount = parseFloat(amount);
              commissionText.innerHTML = "";
      
              if (isNaN(numericAmount) || numericAmount <= 0) {
                commissionText.innerHTML = `<span style="color: red;">Please enter a valid amount.</span>`;
                Swal.showValidationMessage("Please enter a valid amount.");
                return;
              }
      
              if (numericAmount < 100) {
                commissionText.innerHTML = `<span style="color: red;">You cannot withdraw less than Rs 100.</span>`;
                Swal.showValidationMessage("You cannot withdraw less than Rs 100.");
                return;
              }
      
              if (numericAmount > walletBalance) {
                inputField.value = walletBalance;
                commissionText.innerHTML = `<span style="color: red;">You cannot withdraw more than Rs ${walletBalance}.</span>`;
                return;
              }
      
              Swal.resetValidationMessage();
      
              const commission = (numericAmount * 2) / 100;
              const finalAmount = numericAmount - commission;
      
              commissionText.innerHTML = `
                <i class="fas fa-percentage"></i> Commission (2%): Rs ${commission.toFixed(3)}<br>
                <i class="fas fa-wallet"></i> Final Amount: Rs ${finalAmount.toFixed(2)}
              `;
            };
      
            updateCommissionDetails();
            inputField.addEventListener("input", updateCommissionDetails);
          }
        });
      
        if (!withdrawalAmount) return;
      
        const withdrawalData = {
          user_id: userInfo.user_id,
          withdrawalAmount,
          accountHolderName,
          accountNumber,
          bankName,
          ifscNumber,
          withdrawal_req_by: userInfo.email_id,
          modified_by: userInfo.email_id,
        };
      
        try {
          const response = await axiosInstance.post('/clientadmin/ApplyWithdrawal', withdrawalData);
      
          if (response.status === 200) {
            showSuccessAlert(
              'Success',
              'Your withdrawal request has been initiated successfully!'
            );
            fetchData();
          }
        } catch (error) {
          showErrorAlert('Error', error.response?.data?.message || error.message);
        }
      };
      
    
    return {
        commissionAmount, setCommissionAmount,
        isLoading, setIsLoading,
        withdrawalRequests, setWithdrawalRequests,
        clientData, setClientData,
        userData, setUserData,
        formData, setFormData,
        initialData, setInitialData,
        isEditing, setIsEditing,errors, setErrors,
        handleChange,
        hasChanges,
        handleSubmit,handleWithdraw,
        fetchData
    }}
export default useWithdraw;  
       