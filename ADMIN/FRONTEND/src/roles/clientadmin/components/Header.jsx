import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../utils/utils';

const Header = ({ handleLogout, userInfo }) => {
  const [showNotificationBox, setShowNotificationBox] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [visibleNotificationsCount, setVisibleNotificationsCount] = useState(5);
  const toggleButtonRef = useRef(null);
  const mobileToggleButtonRef = useRef(null);
  const notificationBoxRef = useRef(null); // Ref for the notification box
  const isFetching = useRef(false);

  const fetchNotifications = async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    if (!userInfo?.user_id) return;

    try {
      const response = await axiosInstance.post('/clientadmin/FetchPaymentNotification', {
        user_id: userInfo.user_id,
      });

      if (response.data.status === "Success") {
        const validNotifications = response.data.data.filter(n => n.withdrawal_notification !== null);

        const unreadCount = validNotifications.filter(n => n.rca_admin_notification_status !== 'read').length;

        setNotifications(validNotifications);
        setNotificationCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      isFetching.current = false;
    }
  };

  useEffect(() => {
    if (userInfo?.user_id) fetchNotifications();
    // eslint-disable-next-line
  }, [userInfo]);

  const markAsRead = async (notificationId, event) => {
    if (!notificationId) return;
    
    event.stopPropagation(); 
  
    try {
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) =>
          n.withdrawal_notification?._id === notificationId
            ? { ...n, rca_admin_notification_status: 'read' }
            : n
        )
      );
  
      setNotificationCount((prevCount) => Math.max(prevCount - 1, 0));
  
      const response = await axiosInstance.post('/clientadmin/MarkNotificationRead', {
        _id: notificationId,
        rca_admin_notification_status: 'read'
      });
  
      if (response.data.status === 'Success') {
        fetchNotifications(); // Fetch fresh data to ensure correctness
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  

  const handleToggleSidebar = () => {
    document.body.classList.toggle('sidebar-icon-only');
  };

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

    return () => {
      if (button) {
        button.removeEventListener('click', handleToggleSidebar);
      }
      if (mobileButton) {
        mobileButton.removeEventListener('click', handleMobileToggleSidebar);
      }
    };
  }, [button, mobileButton]);

  const handleShowMore = () => {
    setVisibleNotificationsCount(prevCount => prevCount + 5);  // Load 5 more notifications
  };

  const handleShowLess = () => setVisibleNotificationsCount(5);

  // Close notification box when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationBoxRef.current && !notificationBoxRef.current.contains(event.target) && !event.target.closest('.nav-link')) {
        setShowNotificationBox(false); // Close the notification box
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row" style={{ backgroundColor: 'white' }}>
      <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
        <Link className="navbar-brand brand-logo mr-5" to="/clientadmin/Dashboard">
          <img src="../../images/dashboard/EV-CLIENT-ADMIN.png" className="mr-2" alt="logo" style={{ paddingLeft: 10 }} />
        </Link>
        <Link className="navbar-brand brand-logo-mini" to="/clientadmin/Dashboard"><img src="../../images/dashboard/EV_Logo_16-12-2023.png" alt="logo" /></Link>
      </div>
      <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
        <ul className="navbar-nav navbar-nav-right">
          <li className="nav-item dropdown">
            <Link className="nav-link count-indicator dropdown-toggle" to="#" onClick={() => setShowNotificationBox(!showNotificationBox)}>
              <i className="icon-bell"></i>
              {notificationCount > 0 && <span className="badge badge-pill badge-danger">{notificationCount}</span>}
            </Link>

            {showNotificationBox && (
              <div
                className="notification-box"
                ref={notificationBoxRef} // Attach the ref to the notification box
                style={{
                  position: 'absolute', top: '50px', right: '10px', width: '350px', backgroundColor: 'white',
                  padding: '15px', border: '1px solid #ddd', maxHeight: '300px', overflowY: 'auto',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px'
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
                           onClick={(e) => markAsRead(notificationId, e)}
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
