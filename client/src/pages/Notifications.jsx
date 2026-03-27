import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

export default function Notifications() {
  const { notifications, setNotifications, setUnreadCount, markAllRead } = useAuth();
  const [loading, setLoading] = useState(false);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const typeIcon = { match_found: '🎉', item_returned: '✅', message: '💬', system: '📢' };

  return (
    <div className="page">
      <div className="page-content">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
          <div className="page-header" style={{marginBottom:0}}>
            <div className="page-title">🔔 Notifications</div>
            <div className="page-subtitle">{notifications.filter(n=>!n.isRead).length} unread</div>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button onClick={markAllRead} className="btn btn-secondary btn-sm">✓ Mark All Read</button>
          )}
        </div>

        {loading ? <div className="loading-wrap"><div className="spinner"/></div>
          : notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔕</div>
              <div className="empty-title">No notifications yet</div>
              <div className="empty-sub">We'll notify you when your items get matched!</div>
            </div>
          ) : (
            <div className="notif-list fade-in">
              {notifications.map(n => (
                <div key={n._id} className={`notif-item${!n.isRead?' unread':''}`} onClick={() => !n.isRead && markRead(n._id)} style={{cursor:!n.isRead?'pointer':'default'}}>
                  <div className="notif-icon">{typeIcon[n.type] || '📢'}</div>
                  <div style={{flex:1}}>
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-msg">{n.message}</div>
                    <div style={{display:'flex',alignItems:'center',gap:'12px',marginTop:'8px'}}>
                      <span className="notif-time">{timeAgo(n.createdAt)}</span>
                      {n.sender && (
                        <Link to={`/chat/${n.sender._id}`} className="btn btn-outline btn-sm" style={{fontSize:'11px',padding:'3px 10px'}} onClick={e => e.stopPropagation()}>
                          💬 Chat with {n.sender.name?.split(' ')[0]}
                        </Link>
                      )}
                    </div>
                  </div>
                  {!n.isRead && <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--brown-500)',flexShrink:0,marginTop:'6px'}}/>}
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
