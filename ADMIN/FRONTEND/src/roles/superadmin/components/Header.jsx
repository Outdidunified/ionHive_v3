import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../utils/utils'; 

const Header = ({ handleLogout }) => {
  const [showNotificationBox, setShowNotificationBox] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [visibleNotificationsCount, setVisibleNotificationsCount] = useState(5);
  const toggleButtonRef = useRef(null);
  const mobileToggleButtonRef = useRef(null);
  const isFetching = useRef(false);
  const notificationBoxRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (isFetching.current) return; // Prevent multiple requests if already fetching
    isFetching.current = true;

    try {
      const response = await axiosInstance.get('/superadmin/FetchPaymentNotification'); 

      const data = response.data;

      if (data.status === "Success") {
        const filteredNotifications = data.data.filter(n => n.withdrawal_notification);
        setNotificationCount(filteredNotifications.filter(n => n.rca_admin_notification_status !== 'read').length);
        setNotifications(filteredNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      isFetching.current = false; // Reset fetching flag after request
    }
  };

  useEffect(() => {
    fetchNotifications();  // Call on initial load
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId, index) => {
    console.log('Notification ID:', notificationId);

    if (!notificationId) {
      console.error('Notification ID is undefined or invalid.');
      return;
    }

    try {
      const response = await axiosInstance.post('/superadmin/MarkNotificationRead', { // ✅ use axiosInstance
        _id: notificationId,
        superadmin_notification_status: 'read'  
      });

      const data = response.data;
      if (data.status === 'Success') {
        fetchNotifications();
        setNotificationCount(prevCount => Math.max(prevCount - 1, 0));  // Decrease notification count
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Toggle sidebar for desktop
  const handleToggleSidebar = () => {
    document.body.classList.toggle('sidebar-icon-only');
  };

  // Toggle sidebar for mobile
  const handleMobileToggleSidebar = () => {
    document.querySelector('.sidebar-offcanvas').classList.toggle('active');
  };

  const button = toggleButtonRef.current;
  const mobileButton = mobileToggleButtonRef.current;

  useEffect(() => {
    if (button) {
      button.addEventListener('click', handleToggleSidebar);
    }

    if (mobileButton) {
      mobileButton.addEventListener('click', handleMobileToggleSidebar);
    }

    // Cleanup event listeners on component unmount
    return () => {
      if (button) {
        button.removeEventListener('click', handleToggleSidebar);
      }
      if (mobileButton) {
        mobileButton.removeEventListener('click', handleMobileToggleSidebar);
      }
    };
  }, [button, mobileButton]);

  // Handle clicks outside notification box to close it
  const handleClickOutside = (event) => {
    if (notificationBoxRef.current && !notificationBoxRef.current.contains(event.target)) {
      setShowNotificationBox(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Toggle notification box visibility
  const handleNotificationClick = (event) => {
    event.stopPropagation(); // Prevent click from propagating to the body
    setShowNotificationBox(!showNotificationBox); // Toggle the notification box visibility
  };

  // Show more notifications
  const handleShowMore = () => {
    setVisibleNotificationsCount(prevCount => prevCount + 5);  // Load 5 more notifications
  };

  // Show less notifications
  const handleShowLess = () => setVisibleNotificationsCount(5);
  return (
    <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row" style={{ backgroundColor: 'white' }}>
      <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
        <Link className="navbar-brand brand-logo mr-5" to="/superadmin/Dashboard">
          <img src="../../images/dashboard/EV-SUPER-ADMIN-1.png" className="mr-2" alt="logo" style={{ paddingLeft: 10 }} />
        </Link>
        <Link className="navbar-brand brand-logo-mini" to="/superadmin/Dashboard">
          <img src="../../images/dashboard/EV_Logo_16-12-2023.png" alt="logo" />
        </Link>
      </div>
           <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
             <ul className="navbar-nav navbar-nav-right">
               <li className="nav-item dropdown">
                 <Link
                   className="nav-link count-indicator dropdown-toggle"
                   to="#"
                   onClick={handleNotificationClick} // Use handleNotificationClick for notification toggle
                 >
                   <i className="icon-bell"></i>
                   {notificationCount > 0 && <span className="badge badge-pill badge-danger">{notificationCount}</span>}
                 </Link>
     
                 {showNotificationBox && (
                   <div
                     ref={notificationBoxRef}
                     className="notification-box"
                     style={{
                       position: 'absolute',
                       top: '50px',
                       right: '10px',
                       width: '350px',
                       backgroundColor: 'white',
                       padding: '15px',
                       border: '1px solid #ddd',
                       maxHeight: '300px',
                       overflowY: 'auto',
                       boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                       borderRadius: '8px',
                     }}
                   >
                     <h6 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: '600' }}>Recent Notifications</h6>
     
                     {notifications.length === 0 ? (
                       <p>No notifications available</p>
                     ) : (
                       notifications.slice(0, visibleNotificationsCount).map(notification => {
                         const withdrawalNotification = notification.withdrawal_notification;
                         const notificationId = withdrawalNotification?._id;
     
                         return (
                           <div key={notificationId} style={{
                             marginBottom: '15px', padding: '10px', borderRadius: '5px',
                             backgroundColor: notification.rca_admin_notification_status === 'read' ? 'white' : '#d9edf7'
                           }}>
                             <p>
                               <strong>{withdrawalNotification?.username}</strong> withdrawal request is currently <strong>{withdrawalNotification?.withdrawal_approved_status}</strong>.
                             </p>
                             <p><strong>Email:</strong> {withdrawalNotification?.email_id}</p>
                             <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <span><strong>Status:</strong> {withdrawalNotification?.withdrawal_approved_status}</span>
                               {notification.rca_admin_notification_status !== 'read' && (
                                 <button
                                   onClick={() => markAsRead(notificationId)}
                                   style={{
                                     backgroundColor: 'red', color: 'white', border: 'none', padding: '3px 6px',
                                     borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
                                   }}
                                 >
                                   Mark as Read
                                 </button>
                               )}
                             </p>
     
                             <hr style={{ borderColor: '#ddd' }} />
                           </div>
                         );
                       })
                     )}
     
                     {notifications.length > 5 && (
                       <div style={{ textAlign: 'center', marginTop: '10px' }}>
                         {visibleNotificationsCount < notifications.length ? (
                           <span onClick={handleShowMore} style={{ color: '#007bff', cursor: 'pointer', fontSize: '12px' }}>See more...</span>
                         ) : (
                           <span onClick={handleShowLess} style={{ color: '#007bff', cursor: 'pointer', fontSize: '12px' }}>See less...</span>
                         )}
                       </div>
                     )}
                   </div>
                 )}
               </li>
     
               <li className="nav-item dropdown">
                 <Link className="nav-link count-indicator dropdown-toggle" id="notificationDropdown" to="#" data-toggle="dropdown">
                   <i className="icon-ellipsis"></i>
                 </Link>
                 <div className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="notificationDropdown">
                   <button className="dropdown-item" onClick={handleLogout}>
                     <i className="ti-power-off text-primary"></i>
                     Logout
                   </button>
                 </div>
               </li>
             </ul>
     
             <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" ref={mobileToggleButtonRef}>
               <span className="icon-menu"></span>
             </button>
           </div>
         </nav>
       );
     };
     
     export default Header;