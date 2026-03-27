import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, unreadCount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">✦ ACCIO</Link>
        <div className="navbar-nav">
          <Link to="/dashboard" className={isActive('/dashboard')}>Home</Link>
          <Link to="/items" className={isActive('/items')}>All Items</Link>
          <Link to="/lost-items" className={isActive('/lost-items')}>Lost</Link>
          <Link to="/found-items" className={isActive('/found-items')}>Found</Link>
          <Link to="/reports" className={isActive('/reports')}>Reports</Link>
          {user?.role === 'admin' && <Link to="/admin" className={isActive('/admin')}>Admin</Link>}
        </div>
        <div className="navbar-actions">
          <Link to="/chat" className="notif-btn" title="Messages" style={{textDecoration:'none',fontSize:'18px'}}>💬</Link>
          <Link to="/notifications" className="notif-btn" title="Notifications">
            🔔
            {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </Link>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
        </div>
      </div>
    </nav>
  );
}
