import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useLocation, useNavigate } from 'react-router-dom';

const ViewFinance = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [newfinance, setNewFinance] = useState({
        association_id: '', client_id: '', eb_charges: '', app_charges: '', other_charges: '', parking_charges: '',
        rent_charges: '', open_a_eb_charges: '', open_other_charges: '', created_by: '', created_date: '',
        modified_by: '', modified_date: '', finance_id: '', status: '',
    });

    useEffect(() => {
        const { finance } = location.state || {};
        if (finance) {
            setNewFinance({
                association_id: finance.association_id || '',
                client_id: finance.client_id || '',
                eb_charges: finance.eb_charges || '',
                app_charges: finance.app_charges || '',
                other_charges: finance.other_charges || '',
                parking_charges: finance.parking_charges || '',
                rent_charges: finance.rent_charges || '',
                open_a_eb_charges: finance.open_a_eb_charges || '',
                open_other_charges: finance.open_other_charges || '',
                created_by: finance.created_by || '',
                created_date: finance.created_date || '',
                modified_by: finance.modified_by || '',
                modified_date: finance.modified_date || '',
                finance_id: finance.finance_id || '',
                status: finance.status || '',
            });
         // Save to localStorage
         localStorage.setItem('userData', JSON.stringify(finance));
        } else {
            // Load from localStorage if available
            const savedData = JSON.parse(localStorage.getItem('userData'));
            if (savedData) {
                setNewFinance(savedData);
            }
        }
    }, [location]);

    // back page
    const goBack = () => {
        navigate(-1);
    };

    // Timestamp data 
    function formatTimestamp(originalTimestamp) {
        const date = new Date(originalTimestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        hours = String(hours).padStart(2, '0');
    
        const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
        return formattedDate;
    } 


    // view edit page
    const handleEdit = (newfinance) => {
        navigate('/clientadmin/EditFinance', { state: { newfinance } });
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
                                        <h3 className="font-weight-bold">View Details</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-outline-primary btn-icon-text" onClick={() => handleEdit(newfinance)} style={{ marginRight: '10px' }}><i className="mdi mdi-pencil btn-icon-prepend"></i> Edit</button>

                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                onClick={goBack}
                                                style={{ marginRight: '10px' }}
                                            >
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
                                        <div className="row">
                                            <div className="col-md-12 grid-margin">
                                                <div className="row">
                                                    <div className="col-12 col-xl-12">
                                                        <div style={{textAlign:'center'}}>
                                                            <h4 className="card-title" style={{paddingTop:'10px'}}>Finance Details</h4>  
                                                            <hr></hr>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>EB Charges: <span style={{fontWeight:'normal'}}>{newfinance.eb_charges ? `₹ ${newfinance.eb_charges}` : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>App Charges: <span style={{fontWeight:'normal'}}>{newfinance.app_charges ?  newfinance.app_charges +' %' : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Other Charges: <span style={{ fontWeight: 'normal' }}>{newfinance.other_charges ?  newfinance.other_charges +' %' : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Parking Charges: <span style={{fontWeight:'normal'}}>{newfinance.parking_charges ?  newfinance.parking_charges +' %' : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Rent Charges: <span style={{fontWeight:'normal'}}>{newfinance.rent_charges ? newfinance.rent_charges +' %' : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Open A EB Charges: <span style={{fontWeight:'normal'}}>{newfinance.open_a_eb_charges ? newfinance.open_a_eb_charges +' %' : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Open Other Charges: <span style={{fontWeight:'normal'}}>{newfinance.open_other_charges ?  newfinance.open_other_charges +' %' : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Created By: <span style={{fontWeight:'normal'}}>{newfinance.created_by ? newfinance.created_by: '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Created Date: <span style={{fontWeight:'normal'}}>{newfinance.created_date ? formatTimestamp(newfinance.created_date) : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row col-12 col-xl-12 viewDataCss">
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Modified By: <span style={{fontWeight:'normal'}}>{newfinance.modified_by ? newfinance.modified_by : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Modified Date: <span style={{fontWeight:'normal'}}>{newfinance.modified_date ? formatTimestamp(newfinance.modified_date) : '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group row">
                                                                <div className="col-sm-12" style={{ fontWeight: 'bold' }}>Status: <span style={{fontWeight:'normal'}}>{newfinance.status === true ? <span className="text-success">Active</span> :  <span className="text-danger">DeActive</span>}</span></div>
                                                            </div>
                                                        </div>  
                                                    </div>
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
}

export default ViewFinance;
