import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';

const Withdraw = ({ userInfo, handleLogout }) => {
    const [commissionAmount, setCommissionAmount] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [withdrawalRequests, setWithdrawalRequests] = useState([]);
     // eslint-disable-next-line
    const [associationData, setassociationData] = useState(null);
     // eslint-disable-next-line
    const [userData,setUserData]=useState(null);

    const fetchCommissionAmountCalled = useRef(false); 
    const isFetching = useRef(false);

    const fetchData = async () => {
        
        if (isFetching.current) return;
        isFetching.current = true;

        try {
            setIsLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/FetchPaymentRequest`, {
                user_id: userInfo.data.user_id,
            });

            if (response.status === 200 && response.data.data) {
                const { withdrawalDetails, associationData, user } = response.data.data;
                setWithdrawalRequests(withdrawalDetails);
                setassociationData(associationData);
                setUserData(user);
            } else {
                setWithdrawalRequests([]);
                setassociationData(null);
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
    
    
    
    useEffect(() => {
        const fetchCommissionAmount = async () => {
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/FetchCommissionAmtassociation`, {
                    user_id: userInfo.data.user_id,
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

        if (!fetchCommissionAmountCalled.current && userInfo.data.user_id) {
            fetchCommissionAmount();
            fetchCommissionAmountCalled.current = true; 
        }
    }, [userInfo.data.user_id]); 

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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/associationadmin/fetchUserBankDetails`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userInfo.data.user_id }),
            });
    
            if (response.status === 200) {
                const data = await response.json();
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
        if (!fetchUserDetailsCalled.current && userInfo.data.user_id) {
            fetchUserDetails();
            fetchUserDetailsCalled.current = true;
        }
        // eslint-disable-next-line
    }, [userInfo]);
    
    
    
    
    const handleChange = (e) => {
        const { name, value } = e.target;
    
       
        const uppercasedValue = value.toUpperCase();
    
      
        if (name === "accountNumber" && (!/^\d*$/.test(value) || value.length > 18)) return;
        if (name === "ifscNumber" && (!/^[A-Z0-9]{0,11}$/i.test(value))) return; // No hyphens allowed
        if (name === "accountHolderName" && (!/^[A-Z\s]{0,50}$/.test(uppercasedValue))) return; // Only uppercase letters and spaces
        if (name === "bankName" && (!/^[A-Z\s]{0,100}$/.test(uppercasedValue))) return; // Only uppercase letters and spaces
    
        setFormData((prevData) => ({
            ...prevData,
            user_id: userInfo?.data?.user_id || prevData.user_id,
            created_by: userInfo?.data?.email_id || prevData.created_by,
            [name]: uppercasedValue, 
        }));
    
       
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
                ? `${import.meta.env.VITE_API_URL}/associationadmin/updateUserBankDetails`
                : `${import.meta.env.VITE_API_URL}/associationadmin/saveUserBankDetails`;
    
            setIsLoading(true);
    
            const updatedFormData = {
                ...formData,
                modified_by: userInfo.data.email_id, // Ensure modified_by is set
            };
    
            console.log("Sending data:", updatedFormData); // Debugging line
    
            const response = await axios.post(endpoint, updatedFormData);
    
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
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/FetchCommissionAmtAssociation`, {
                user_id: userInfo.data.user_id,
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
            user_id: userInfo.data.user_id,
            withdrawalAmount,
            accountHolderName,
            accountNumber,
            bankName,
            ifscNumber,
            withdrawal_req_by: userInfo.data.email_id,
            modified_by: userInfo.data.email_id,
        };
    
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/associationadmin/ApplyWithdrawal`, withdrawalData);
    
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
    
    
    
    
       
         
 

    return (
        <div className="container-scroller">
            {/* Header */}
            <Header userInfo={userInfo} handleLogout={handleLogout} />
    
            <div className="container-fluid page-body-wrapper" style={{ paddingTop: '40px' }}>
                {/* Sidebar */}
                <Sidebar />
    
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-12 grid-margin">
                                <div className="row">
                                    <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                                        <h3 className="font-weight-bold">Wallet</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
    
                        {/* Wallet Balance */}
                        <div className="row">
                            <div className="col-md-12 mb-4 stretch-card transparent" style={{ position: 'relative' }}>
                                <div className="card card-tale">
                                    <div className="card-body-withdraw">
                                        <h3 className="mb-4 font-weight-bold">Wallet Balance</h3>
                                        <h3 className="fs-25 mb-2"><b>Rs: {commissionAmount}</b></h3>
    
                                        <div className="withdraw-button">
                                            <button
                                                onClick={handleWithdraw}
                                                className="btn shadow-lg"
                                            >
                                                <i className="fas fa-arrow-circle-right"></i> Withdraw
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
    
                        {/* User Account Details Form */}
                        <div className="row">
                            <div className="col-md-12 grid-margin stretch-card">
                                <div className="card border-0 rounded-3">
                                    <div className="card-body">
                                        <div className="text-center">
                                            <h2 className="card-title font-weight-bold text-primary">User Account Details</h2>
                                        </div>
                                        <form className="forms-sample" onSubmit={handleSubmit}>
                                            <div className="row">
                                                {/* A/C Holder Name */}
                                                <div className="col-md-6 mb-3">
                                                    <div className="form-group">
                                                        <label htmlFor="accountHolderName">A/C Holder Name</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text"><i className="fas fa-user"></i></span>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="accountHolderName"
                                                                value={formData.accountHolderName}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
    
                                                {/* Bank Name */}
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="bankName">Bank Name</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text"><i className="fas fa-university"></i></span>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="bankName"
                                                                value={formData.bankName}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
    
                                                {/* Account Number */}
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="accountNumber">Account Number</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text"><i className="fas fa-hashtag"></i></span>
                                                            <input
                                                                type="text"
                                                                className={`form-control ${errors.accountNumber ? "is-invalid" : ""}`}
                                                                name="accountNumber"
                                                                value={formData.accountNumber}
                                                                onChange={handleChange}
                                                                required
                                                                maxLength={18}
                                                            />
                                                        </div>
                                                        {errors.accountNumber && <small className="text-danger">{errors.accountNumber}</small>}
                                                    </div>
                                                </div>
    
                                                {/* IFSC Code */}
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label htmlFor="ifscNumber">IFSC Code</label>
                                                        <div className="input-group">
                                                            <span className="input-group-text"><i className="fas fa-barcode"></i></span>
                                                            <input
                                                                type="text"
                                                                className={`form-control ${errors.ifscNumber ? "is-invalid" : ""}`}
                                                                name="ifscNumber"
                                                                value={formData.ifscNumber}
                                                                onChange={handleChange}
                                                                required
                                                                maxLength={11}
                                                            />
                                                        </div>
                                                        {errors.ifscNumber && <small className="text-danger">{errors.ifscNumber}</small>}
                                                    </div>
                                                </div>
                                            </div>
    
                                            {/* Submit Button */}
                                            <div className="text-center mt-3">
                                                {isLoading ? (
                                                    <button type="button" className="btn btn-primary" disabled>
                                                        <span className="spinner-border spinner-border-sm"></span> Processing...
                                                    </button>
                                                ) : isEditing ? (
                                                    <button type="submit" className="btn btn-primary custom-btn" disabled={!hasChanges()}>
                                                        Update
                                                    </button>
                                                ) : (
                                                    <button type="submit" className="btn btn-success custom-btn" disabled={isLoading}>
                                                        <i className="fas fa-check-circle"></i> Create
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
    
                      
                        <div className="row">
    <div className="col-lg-12 grid-margin stretch-card">
        <div className="card">
            <div className="card-body">
                <div className="d-flex justify-content-end mb-2" style={{ width: '100%' }}>
                    <button className="btn btn-primary" onClick={fetchData}>
                        <i className="fa fa-sync"></i> Reload Data
                    </button>
                </div>


                       
                        <h4 className="card-title responsive-title" style={{ paddingTop: '20px', paddingLeft: '20px' }}>
                            Withdrawal Details
                        </h4>
                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            <table className="table table-striped">
                                <thead style={{ textAlign: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                    <tr>
                                        <th>Sl.No</th>
                                        <th>Total Amount</th>
                                        <th>Commission Amount</th>
                                        <th>Withdrawal Amount</th>
                                        <th>Requested Date</th>
                                        <th>Approved Date</th>
                                        <th>Status</th>
                                        <th>Reason</th>
                                    </tr>
                                </thead>
                                <tbody style={{ textAlign: 'center' }}>
    {isLoading ? (
        <tr>
            <td colSpan="8">Loading...</td>
        </tr>
    ) : withdrawalRequests.length > 0 ? (
        withdrawalRequests.map((withdrawal, index) => (
            <tr key={withdrawal._id} style={{ height: "95px" }}>
                <td>{index + 1}</td>
                <td>{withdrawal.totalWithdrawalAmount || '-'}</td>
                <td>{(withdrawal.commissionAmount || 0).toFixed(3)}</td>
<td>{(withdrawal.withdrawalAmount || 0).toFixed(2)}</td>

                <td>
                    {withdrawal.withdrawal_req_date
                        ? new Date(withdrawal.withdrawal_req_date).toLocaleDateString("en-GB")
                        : '-'}
                </td>
                <td>
                    {withdrawal.withdrawal_approved_date
                        ? new Date(withdrawal.withdrawal_approved_date).toLocaleDateString("en-GB")
                        : '-'}
                </td>
                <td style={{
                    color:
                        withdrawal.withdrawal_approved_status === 'Completed' ? 'green' :
                        withdrawal.withdrawal_approved_status === 'Pending' ? 'orange' :
                        withdrawal.withdrawal_approved_status === 'Initiated' ? 'blue' :
                        withdrawal.withdrawal_approved_status === 'Rejected' ? 'red' :
                        'black'
                }}>
                    {withdrawal.withdrawal_approved_status || '-'}
                </td>
                <td style={{ whiteSpace: 'normal', wordWrap: 'break-word', maxWidth: '150px' }}>
                            {withdrawal.withdrawal_rejected_message || '-'}
                        </td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="8" style={{ textAlign: 'center'}}>
                No Record Found
            </td>
        </tr>
    )}
</tbody>

                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
                    </div>
                    {/* Footer */}
                    <Footer />
                </div>
            </div>
        </div>
    );
    
    
};

export default Withdraw;
