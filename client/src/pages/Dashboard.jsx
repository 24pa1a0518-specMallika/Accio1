import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalLost: 0, totalFound: 0, totalMatched: 0, totalReturned: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get('/reports/summary').then(r => setStats(r.data)).catch(() => {});
    api.get('/items?limit=4&sort=-createdAt').then(r => setRecent(r.data.items)).catch(() => {});
  }, []);

  const actions = [
    { icon: '🔍', title: 'Report Lost Item', desc: 'I lost something', path: '/report-lost', color: '#fef3cd' },
    { icon: '🤲', title: 'Report Found Item', desc: 'I found something', path: '/report-found', color: '#d1fae5' },
    { icon: '📋', title: 'View All Items', desc: 'Browse all reports', path: '/items', color: '#dbeafe' },
    { icon: '❌', title: 'Lost Items', desc: 'Only lost items', path: '/lost-items', color: '#fee2e2' },
    { icon: '✅', title: 'Found Items', desc: 'Only found items', path: '/found-items', color: '#d1fae5' },
    { icon: '📊', title: 'Analytics', desc: 'View reports & stats', path: '/reports', color: '#ede9fe' },
    { icon: '💬', title: 'Messages', desc: 'Chat with users', path: '/chat', color: '#fce7f3' },
    { icon: '🔔', title: 'Notifications', desc: 'Your alerts', path: '/notifications', color: '#fff3e0' },
    ...(user?.role === 'admin' ? [{ icon: '🛡️', title: 'Admin Panel', desc: 'Manage all items', path: '/admin', color: '#f0fdf4' }] : [])
  ];

  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard-hero fade-in">
          <div style={{position:'relative',zIndex:1}}>
            <div className="hero-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</div>
            <div className="hero-sub">Your campus lost & found hub — powered by intelligent matching</div>
            {user?.role === 'admin' && <span style={{background:'rgba(255,255,255,0.2)',padding:'4px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:600,marginTop:'12px',display:'inline-block'}}>🛡️ Admin Access</span>}
          </div>
        </div>

        <div className="stats-grid fade-in">
          {[
            { n: stats.totalLost, l: 'Total Lost', c: '#f59e0b' },
            { n: stats.totalFound, l: 'Total Found', c: '#10b981' },
            { n: stats.totalMatched, l: 'Matched', c: '#3b82f6' },
            { n: stats.totalReturned, l: 'Returned', c: '#6b7280' },
          ].map(s => (
            <div className="stat-card" key={s.l}>
              <div className="stat-number" style={{color:s.c}}>{s.n}</div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>

        <h3 style={{fontSize:'16px', fontWeight:700, color:'var(--text-secondary)', marginBottom:'16px'}}>Quick Actions</h3>
        <div className="action-grid fade-in">
          {actions.map(a => (
            <Link key={a.path} to={a.path} className="action-card" style={{backgroundColor:a.color}}>
              <div className="action-icon">{a.icon}</div>
              <div className="action-title">{a.title}</div>
              <div className="action-desc">{a.desc}</div>
            </Link>
          ))}
        </div>

        {recent.length > 0 && (
          <>
            <h3 style={{fontSize:'16px', fontWeight:700, color:'var(--text-secondary)', margin:'32px 0 16px'}}>Recent Reports</h3>
            <div className="items-grid fade-in">
              {recent.map(item => <ItemCard key={item._id} item={item} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ItemCard({ item }) {
  const statusEmoji = { lost:'🔴', found:'🟢', matched:'🔵', returned:'⚫' };
  return (
    <div className="card item-card">
      {item.image && !item.hideImage
        ? <div className="item-card-image"><img src={item.image} alt={item.name} /></div>
        : <div className="item-card-no-image">{item.type === 'lost' ? '🔍' : '📦'}</div>
      }
      <div className="item-card-body">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
          <div className="item-card-title">{item.name}</div>
          <span className={`badge badge-${item.status}`}>{statusEmoji[item.status]} {item.status}</span>
        </div>
        <div className="item-card-meta">
          <span>📍 {item.location}</span>
          <span>{new Date(item.dateTime).toLocaleDateString()}</span>
        </div>
        {item.description && <div className="item-card-desc">{item.description.slice(0,80)}{item.description.length>80?'...':''}</div>}
        {item.matchScore > 0 && <div className="match-score" style={{marginTop:'8px'}}>⚡ {item.matchScore}% Match</div>}
      </div>
    </div>
  );
}
