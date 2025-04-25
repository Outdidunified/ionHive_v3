import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';

const EditManageUsers = ({ userInfo, handleLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dataItem = location.state?.newUser || JSON.parse(localStorage.getItem('editDeviceData'));
    localStorage.setItem('editDeviceData', JSON.stringify(dataItem));

    const [errorMessage, setErrorMessage] = useState('');
    const [selectStatus, setSelectedStatus] = useState(dataItem.status ? 'true' : 'false');

    // Edit manage device
    const [username, setUsername] = useState(dataItem?.username || '');
    const [password, setPassword] = useState(dataItem?.password || '');
    const [phone_no, setPhoneNumber] = useState(dataItem?.phone_no || '');

    // Store initial values
    const [initialValues, setInitialValues] = useState({
        password: dataItem?.password || '',
        phone_no: dataItem?.phone_no || '',
        status: dataItem.status ? 'true' : 'false'
    });

    // Check if any field has been modified
    const isModified = (
        String(password) !== String(initialValues.password) ||
        String(phone_no) !== String(initialValues.phone_no) ||
        selectStatus !== initialValues.status
    );
    

    /// Selected status
    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
    };

    // Back Manage user page 
    const backManageUser = () => {
        navigate('/associationadmin/ManageUsers');
    };

    // Update manage user
    const editManageUser = async (e) => {
        e.preventDefault();

        // Validate phone number
        const phoneRegex = /^\d{10}$/;
        if (!phone_no) {
            setErrorMessage("Phone can't be empty.");
            return;
        }
        if (!phoneRegex.test(phone_no)) {
            setErrorMessage('Oops! Phone must be a 10-digit number.');
            return;
        }
  
        // Validate password
        const passwordRegex = /^\d{4}$/;
        if (!password) {
            setErrorMessage("Password can't be empty.");
            return;
        }
        if (!passwordRegex.test(password)) {
            setErrorMessage('Oops! Password must be a 4-digit number.');
            return;
        }

        try {
            const updatedUser = {
                user_id: dataItem.user_id,
                username: username,
                phone_no: parseInt(phone_no),
                password: parseInt(password),
                status: selectStatus === 'true',
                modified_by: userInfo.data.email_id,
            };
            const response = await fetch(`${import.meta.env.VITE_API_URL}/associationadmin/UpdateUser`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser),
            });

            if (response.ok) {
                Swal.fire({
                    title: 'User updated successfully',
                    icon: 'success',
                });
                backManageUser();
            } else {
                const responseData = await response.json();
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to update user, ' + responseData.message,
                    icon: 'error',
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'An error occurred while updating the user',
                icon: 'error',
            });
        }
    };

    useEffect(() => {
        // Update initial values if dataItem changes
        setInitialValues({
            password: dataItem?.password || '',
            phone_no: dataItem?.phone_no || '',
            status: dataItem.status ? 'true' : 'false'
        });
    }, [dataItem]);
    
    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className='container-scroller'>
            {/* Header */}
            <Header userInfo={userInfo} handleLogout={handleLogout} />
            <div className="container-fluid page-body-wrapper">
                {/* Sidebar */}
                <Sidebar />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-12 grid-margin">
                                <div className="row">
                                    <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                                        <h3 className="font-weight-bold">Edit User List</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={goBack}>
                                                Back
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 grid-margin stretch-card">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="col-12 grid-margin">
                                            <div className="card">
                                                <div className="card-body">
                                                    <h4 className="card-title">Manage User</h4>
                                                    <form className="form-sample" onSubmit={editManageUser}>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">User Name</label>
                                                                    <div className="col-sm-12">
                                                                        <input type="text" className="form-control" value={username} maxLength={25} onChange={(e) => {const value = e.target.value; const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, ''); setUsername(sanitizedValue);}} readOnly required/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Phone Number</label>
                                                                    <div className="col-sm-12">
                                                                        <input type="text" className="form-control" value={phone_no} maxLength={10} onChange={(e) => {const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setPhoneNumber(sanitizedValue);}} required/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Email ID</label>
                                                                    <div className="col-sm-12">
                                                                        <input type="email" className="form-control" value={dataItem.email_id} readOnly required/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Password</label>
                                                                    <div className="col-sm-12">
                                                                        <input type="text" className="form-control" value={password} maxLength={4} onChange={(e) => {const value = e.target.value; const sanitizedValue = value.replace(/[^0-9]/g, ''); setPassword(sanitizedValue);}} required/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group row">
                                                                    <label className="col-sm-12 col-form-label labelInput">Status</label>
                                                                    <div className="col-sm-12">
                                                                        <select className="form-control" value={selectStatus} onChange={handleStatusChange}  required >
                                                                            <option value="true">Active</option>
                                                                            <option value="false">DeActive</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {errorMessage && <div className="text-danger">{errorMessage}</div>}<br/>
                                                        <div style={{ textAlign: 'center', padding:'15px'}}>
                                                            <button type="submit" className="btn btn-primary mr-2" disabled={!isModified}>Update</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
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

export default EditManageUsers;
