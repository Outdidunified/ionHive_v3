import React, { useEffect, useState, useRef, useCallback } from 'react';
import Header from '../../components/Header';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';

const Managefinance = ({ userInfo, handleLogout }) => {
    const navigate = useNavigate();
    const [financeDetails, setFinanceDetails] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const fetchUsersCalled = useRef(false); 

    // fetch finance details
    const fetchFinanceDetails = useCallback(async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/clientadmin/FetchFinanceDetails`, {
                client_id: userInfo.data.client_id
            });
          
            if (response.status === 200) {
                setFinanceDetails(response.data.data || []);
            } else {
                const data = response.data.data;
                console.error('Error fetching finance: ', data);
                setFinanceDetails([]);
            }
        } catch (error) {
            console.error('Error fetching finance:', error);
            setFinanceDetails([]);
        }
    }, [userInfo.data.client_id]);

    useEffect(() => {
        if (!fetchUsersCalled.current) {
            fetchFinanceDetails();
            fetchUsersCalled.current = true;
        }
    }, [fetchFinanceDetails]);

    // search
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };
    // Filtered finance details based on search query
    const filteredFinanceDetails = financeDetails.filter((finance) => {
        const searchFields = ['totalprice', 'eb_charges', 'app_charges', 'open_a_eb_charges', 'parking_charges', 'rent_charges'];
        return searchFields.some((field) =>
            finance[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
    });


    // view finance page
    const handleView = (finance) => {
        navigate('/clientadmin/ViewFinance', { state: { finance } });
    };

    // view create finance page
    const navigateToCreateUser = () => {
        navigate('/clientadmin/CreateFinance');
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
                                        <h3 className="font-weight-bold">Manage Finance</h3>
                                    </div>
                                    <div className="col-12 col-xl-4">
                                        <div className="justify-content-end d-flex">
                                            <button type="button" className="btn btn-success" onClick={navigateToCreateUser} style={{ marginRight: '10px' }} >Create Finance</button>
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
                                            <div className="col-12 col-xl-8">
                                                <h4 className="card-title" style={{ paddingTop: '10px' }}>Finance Details</h4>
                                            </div>
                                            <div className="col-12 col-xl-4">
                                                <div className="input-group">
                                                    <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                                        <span className="input-group-text" id="search">
                                                            <i className="icon-search"></i>
                                                        </span>
                                                    </div>
                                                    <input type="text" className="form-control" placeholder="Search now" value={searchQuery} onChange={handleSearch}/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            <table className="table table-striped">
                                                <thead style={{ textAlign: 'center', position: 'sticky', tableLayout: 'fixed', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                                    <tr> 
                                                        <th>Sl.No</th>
                                                        <th>Total Amount</th>
                                                        <th>EB Charges</th>
                                                        <th>App Charges</th>
                                                        <th>Open A EB Charges</th>
                                                        <th>Parking Charges</th>
                                                        <th>Rent Charges</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ textAlign: 'center' }}>
                                                    {filteredFinanceDetails.length > 0 ? (
                                                        filteredFinanceDetails.map((finance, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{finance.totalprice ? `₹ ${finance.totalprice}` : '-'}</td>
                                                                <td>{finance.eb_charges ? `₹ ${finance.eb_charges}` : '-'}</td>
                                                                <td>{finance.app_charges ? finance.app_charges +' %' : '-'}</td>
                                                                <td>{finance.open_a_eb_charges ?  finance.open_a_eb_charges +' %' : '-'}</td>
                                                                <td>{finance.parking_charges ? finance.parking_charges +' %' : '-'}</td>
                                                                <td>{finance.rent_charges ? finance.rent_charges +' %' : '-'}</td>
                                                                <td style={{ color: finance.status ? 'green' : 'red' }}>
                                                                    {finance.status ? 'Active' : 'DeActive'}
                                                                </td>
                                                                <td>
                                                                    <button type="button" className="btn btn-outline-success btn-icon-text" onClick={() => handleView(finance)} style={{ marginRight: '5px' }}><i className="mdi mdi-eye btn-icon-prepend"></i> View</button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr className="text-center">
                                                            <td colSpan="9">No Finance Details Found</td>
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

export default Managefinance;
