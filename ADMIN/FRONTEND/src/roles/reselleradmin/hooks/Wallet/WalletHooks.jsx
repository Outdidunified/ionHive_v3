import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../utils/utils';

const useWallet = (userInfo) => {
    const [commissionAmount, setCommissionAmount] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [withdrawalRequests, setWithdrawalRequests] = useState([]);
     // eslint-disable-next-line
    const [resellerData, setResellerData] = useState(null);
    // eslint-disable-next-line
    const [userData, setUserData] = useState(null);

    const fetchCommissionAmountCalled = useRef(false); 
    const isFetching = useRef(false);

    const fetchData = async () => {
        if (isFetching.current) return;
        isFetching.current = true;


        try {
            setIsLoading(true);
            const response = await axiosInstance.post('/reselleradmin/FetchPaymentRequest', {
                user_id: userInfo.user_id,
            });

            if (response.status === 200 && response.data.data) {
                const { withdrawalDetails, resellerData, user } = response.data.data;
                setWithdrawalRequests(withdrawalDetails);
                setResellerData(resellerData);
                setUserData(user);
            } else {
                setWithdrawalRequests([]);
                setResellerData(null);
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
        // eslint-disable-next-line
    }, []);
    
        useEffect(() => {
        const fetchCommissionAmount = async () => {
            try {
                const response = await axiosInstance.post('/reselleradmin/FetchCommissionAmtReseller', {
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
            fetchCommissionAmountCalled.current = true; 
        }
    }, [userInfo.user_id]); 

    const [formData, setFormData] = useState({
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        ifscNumber: "",
    });
    
    const [initialData, setInitialData] = useState(null); 
    const [errors, setErrors] = useState({
        accountNumber: "",
        ifscNumber: "",
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const fetchUserDetailsCalled = useRef(false);
    
    const fetchUserDetails = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post('/reselleradmin/fetchUserBankDetails', {
                user_id: userInfo.user_id
            });
    
            if (response.status === 200) {
                const data = response.data;
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
            user_id: userInfo?.data?.user_id || prevData.user_id,
            created_by: userInfo?.data?.email_id || prevData.created_by,
            [name]: uppercasedValue, // Use the uppercase value for both fields
        }));
    
        // Remove Errors on Valid Input
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
        }));
    };
    
    const hasChanges = () => {
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!hasChanges()) return; // Prevent submission if no changes
    
        try {
            const endpoint = isEditing
                ? '/reselleradmin/updateUserBankDetails'
                : '/reselleradmin/saveUserBankDetails';
    
            setIsLoading(true);
    
            const updatedFormData = {
                ...formData,
                user_id: userInfo?.user_id || formData.user_id,
                created_by: userInfo?.email_id || formData.created_by,
                modified_by: userInfo?.email_id,
            };
            
    
            const response = await axiosInstance.post(endpoint, updatedFormData);
    
            if (response.data?.message?.toLowerCase().includes("success")) {
                const updatedData = { ...formData }; // Ensure fresh reference
    
                setInitialData(updatedData); // Update initialData properly
                setIsEditing(true);
    
                // **Force re-fetch of user details**
                fetchUserDetailsCalled.current = false;
                fetchUserDetails(); // This will update the data properly
    
                Swal.fire({
                    title: "Success",
                    text: isEditing ? "Details updated successfully!" : "Details saved successfully!",
                    icon: "success",
                    timer: 3000,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire({
                    title: "Error",
                    text: response.data?.message || "Failed to save details.",
                    icon: "error",
                    timer: 3000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Something went wrong.",
                icon: "error",
                timer: 3000,
                showConfirmButton: false,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    
    
    const handleWithdraw = async () => {
        const { accountHolderName, bankName, accountNumber, ifscNumber } = formData;
    
        if (!accountHolderName || !bankName || !accountNumber || !ifscNumber) {
            Swal.fire({
                title: "Incomplete Details",
                text: "Please fill in all account details before proceeding with withdrawal.",
                icon: "warning",
                confirmButtonColor: "#ff9800",
                confirmButtonText: "OK",
            });
            return;
        }
    
        let walletBalance = 0;
        try {
            const response = await axiosInstance.post('/reselleradmin/FetchCommissionAmtReseller', {
                user_id: userInfo.user_id,
            });
    
            if (response.status === 200) {
                walletBalance = response.data.data;
            }
        } catch (error) {
            console.error("Error fetching wallet balance:", error);
        }
    
        if (walletBalance < 100) {
            Swal.fire({
                title: "Insufficient Balance",
                text: "Your wallet balance is less than Rs 100, and you cannot proceed with the withdrawal.",
                icon: "warning",
                confirmButtonColor: "#ff9800",
                confirmButtonText: "OK",
            });
            return;
        }
    
        const { value: withdrawalAmount } = await Swal.fire({
            title: "<h3 style='color:#333;'>Withdraw Funds</h3>",
            html: `
                <div style="text-align: left; font-size: 16px;">
                    <p><i class="fas fa-wallet"></i> <b>Wallet Balance:</b> Rs ${walletBalance}</p>
                    <p><i class="fas fa-user-circle"></i> <b>Account Holder:</b> ${accountHolderName}</p>
                    <p><i class="fas fa-university"></i> <b>Bank Name:</b> ${bankName}</p>
                    <p><i class="fas fa-credit-card"></i> <b>Account Number:</b> ${accountNumber}</p>
                    <p><i class="fas fa-barcode"></i> <b>IFSC Code:</b> ${ifscNumber}</p>
                    <hr>
                    <label for="withdrawAmount" style="font-weight: bold;">Enter Amount:</label>
                    <input 
                        type="text"  
                        id="withdrawAmount" 
                        class="swal2-input" 
                        value="${(walletBalance)}" 
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
                               
                                   inputField.setAttribute("max", walletBalance); // Set max limit
                               
                                   const updateCommissionDetails = () => {
                                       let amount = inputField.value;
                               
                                       // Allow only numbers and a single decimal point
                                       amount = amount.replace(/[^0-9.]/g, ''); // Remove non-numeric characters except '.'
                                       if ((amount.match(/\./g) || []).length > 1) {
                                           amount = amount.slice(0, -1); // Remove extra decimal points
                                       }
                               
                                       inputField.value = amount; // Update the input field with valid input
                               
                                       const numericAmount = parseFloat(amount);
                                       commissionText.innerHTML = ""; // Clear previous messages
                               
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
                               
                                       Swal.resetValidationMessage(); // Clear previous validation warnings
                               
                                       // Display commission details
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
            const response = await axiosInstance.post('/reselleradmin/ApplyWithdrawal', withdrawalData);
    
            if (response.status === 200) {
                Swal.fire({
                    title: "<i class='fas fa-check-circle' style='color: green;'></i> Success",
                    text: "Your withdrawal request has been initiated successfully!",
                    icon: "success",
                    confirmButtonColor: "#4CAF50",
                    timer: 3000,
                    showConfirmButton: false,
                });
            } else {
                Swal.fire({
                    text: `Failed to initiate withdrawal: ${response?.data?.message}`,
                    icon: "error",
                    confirmButtonColor: "#d32f2f",
                });
            }
        } catch (error) {
            Swal.fire({
                text: `${error.response?.data?.message || error.message}`,
                icon: "error",
                confirmButtonColor: "#d32f2f",
            });
        }
    };
    
    return {
        commissionAmount, setCommissionAmount,
        isLoading, setIsLoading,
        withdrawalRequests, setWithdrawalRequests,
        resellerData, setResellerData,
        userData, setUserData,
        formData, setFormData,
        initialData, setInitialData,
        isEditing, setIsEditing,errors, setErrors,
        handleChange,
        hasChanges,
        handleSubmit,handleWithdraw,
        fetchData


    }
}
export default useWallet;