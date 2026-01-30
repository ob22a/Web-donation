import React, { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import '../style/base.css';
import '../style/notifications.css';

const Notifications = () => {
  const { user } = useAuth();
  const { fetchData } = useFetch();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try to load notifications from backend if available
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // attempt an API call if endpoint exists
        const res = await fetchData?.(async () => {
          const r = await fetch('/api/notifications/my');
          if (!r.ok) throw new Error('no-notifications-api');
          return r.json();
        });

        // If fetchData wrapper returned something expected
        if (res && Array.isArray(res.notifications)) {
          setNotifications(res.notifications);
        } else {
          // Fallback sample notifications when no backend
          setNotifications([
            { _id: '1', title: 'Welcome to Bright Et', body: 'Thanks for joining — explore campaigns to make impact!', read: false, createdAt: new Date().toISOString() },
            { _id: '2', title: 'Donation received', body: 'Your donation to Hope Fund was successful.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
          ]);
        }
      } catch (err) {
        // No backend or failure — show sample notifications
        setNotifications([
          { _id: '1', title: 'Welcome to Bright Et', body: 'Thanks for joining — explore campaigns to make impact!', read: false, createdAt: new Date().toISOString() },
          { _id: '2', title: 'Donation received', body: 'Your donation to Hope Fund was successful.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [fetchData, user]);

  const markRead = (id) => {
    setNotifications((prev) => prev.map(n => n._id === id ? { ...n, read: true } : n));
    // Optionally call backend here to persist
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => setNotifications([]);

  return (
    <main className="dashboard">
      <section className="section">
        <h3>Notifications</h3>
        <div className="card notifications-card">
          <div className="notifications-header">
            <div className="notifications-count">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</div>
            <div className="notifications-actions">
              <button className="btn" onClick={markAllRead}>Mark all read</button>
              <button className="btn btn-outline" onClick={clearAll}>Clear</button>
            </div>
          </div>

          {loading && <div className="notifications-loading">Loading notifications...</div>}
          {!loading && notifications.length === 0 && (
            <div className="notifications-empty">No notifications. We'll show updates here.</div>
          )}

          <ul className="notifications-list">
            {notifications.map((n) => (
              <li key={n._id} className="notification-item">
                <div className="notification-row">
                  <div>
                    <div className="notification-title" style={{ color: n.read ? 'var(--gray-text)' : 'var(--primary-green)' }}>{n.title}</div>
                    <div className="notification-body">{n.body}</div>
                    <div className="notification-meta">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="notification-actions">
                    {!n.read && <button className="btn primary-button" onClick={() => markRead(n._id)}>Mark read</button>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
};

export default Notifications;
