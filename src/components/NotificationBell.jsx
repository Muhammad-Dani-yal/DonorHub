import { useEffect, useRef, useState } from "react";
import { FaBell, FaCheck, FaClipboardCheck, FaExclamationTriangle, FaTint } from "react-icons/fa";
import { useAuth } from "../context/useAuth";
import {
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
} from "../services/firebaseService";
import "./NotificationBell.css";

function NotificationBell() {
  const { user } = useAuth();
  const panelRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?.uid || user.role === "admin") return undefined;
    return subscribeToNotifications(user.uid, setNotifications);
  }, [user?.uid, user?.role]);

  useEffect(() => {
    const closePanel = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", closePanel);
    return () => document.removeEventListener("mousedown", closePanel);
  }, []);

  if (!user || user.role === "admin") return null;

  const unreadCount = notifications.filter((item) => !item.read).length;

  const iconFor = (type) => {
    if (type === "request_approved" || type === "request_fulfilled") return <FaClipboardCheck />;
    if (type === "request_rejected" || type === "account_suspended") return <FaExclamationTriangle />;
    return <FaTint />;
  };

  const openNotification = async (notification) => {
    if (!notification.read) {
      await markNotificationRead(user.uid, notification.id);
    }
  };

  const markAllRead = async () => {
    await markAllNotificationsRead(user.uid, notifications);
  };

  const timeLabel = (timestamp) => {
    if (!timestamp) return "Recently";
    return new Date(timestamp).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="notification-bell" ref={panelRef}>
      <button
        className="notification-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
      >
        <FaBell />
        {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-heading">
            <div>
              <strong>Notifications</strong>
              <span>{unreadCount} unread</span>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead}><FaCheck /> Mark all read</button>
            )}
          </div>

          <div className="notification-list">
            {notifications.slice(0, 20).map((notification) => (
              <button
                className={`notification-item ${notification.read ? "" : "unread"}`}
                key={notification.id}
                onClick={() => openNotification(notification)}
              >
                <span className={`notification-icon ${notification.type}`}>{iconFor(notification.type)}</span>
                <span className="notification-copy">
                  <strong>{notification.title}</strong>
                  <span>{notification.message}</span>
                  <small>{timeLabel(notification.createdAt)}</small>
                </span>
              </button>
            ))}

            {notifications.length === 0 && (
              <div className="notification-empty">
                <FaBell />
                <strong>No notifications yet</strong>
                <span>Your request and account updates will appear here.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
