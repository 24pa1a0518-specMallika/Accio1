import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ItemCard({ item, onStatusChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const statusEmoji = { lost:'🔴', found:'🟢', matched:'🔵', returned:'⚫' };

  const canEdit = user && (user.id === item.reportedBy?._id || user.role === 'admin');

  const markReturned = async () => {
    try {
      await api.put(`/items/${item._id}/status`, { status: 'returned' });
      toast.success('Item marked as returned!');
      if (onStatusChange) onStatusChange();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className={`card item-card${item.status === 'returned' ? ' returned-card' : ''}`}
      style={item.status === 'returned' ? { opacity: 0.6 } : {}}>
      {item.image && !item.hideImage
        ? <div className="item-card-image"><img src={item.image} alt={item.name} /></div>
        : <div className="item-card-no-image">{item.type === 'lost' ? '🔍' : '📦'}</div>
      }
      <div className="item-card-body">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px',gap:'8px'}}>
          <div className="item-card-title" style={{flex:1}}>{item.name}</div>
          <span className={`badge badge-${item.status}`}>{statusEmoji[item.status]} {item.status}</span>
        </div>
        <div className="item-card-meta">
          <span>📍 {item.location}</span>
          <span>🕐 {new Date(item.dateTime).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'})}</span>
        </div>
        {item.description && <div className="item-card-desc" style={{margin:'8px 0'}}>{item.description.slice(0,90)}{item.description.length>90?'…':''}</div>}
        <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginTop:'8px'}}>
          {item.brand && !item.hideBrand && <span style={{fontSize:'11px',padding:'2px 8px',background:'var(--brown-100)',borderRadius:'10px',color:'var(--text-secondary)'}}>🏷️ {item.brand}</span>}
          {item.colour && !item.hideColour && <span style={{fontSize:'11px',padding:'2px 8px',background:'var(--brown-100)',borderRadius:'10px',color:'var(--text-secondary)'}}>🎨 {item.colour}</span>}
          {item.size && !item.hideSize && <span style={{fontSize:'11px',padding:'2px 8px',background:'var(--brown-100)',borderRadius:'10px',color:'var(--text-secondary)'}}>📐 {item.size}</span>}
          {item.matchScore > 0 && <span className="match-score">⚡ {item.matchScore}% Match</span>}
        </div>
        {item.reportedBy && (
          <div style={{marginTop:'10px',fontSize:'12px',color:'var(--text-muted)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span>👤 {item.reportedBy.name}</span>
            {user && user.id !== item.reportedBy._id && item.status !== 'returned' && (
              <Link to={`/chat/${item.reportedBy._id}`} className="btn btn-outline btn-sm" style={{fontSize:'11px',padding:'4px 10px'}}>💬 Contact</Link>
            )}
          </div>
        )}
        {canEdit && item.status !== 'returned' && (
          <div style={{marginTop:'10px',paddingTop:'10px',borderTop:'1px solid var(--border)'}}>
            <button onClick={markReturned} className="btn btn-secondary btn-sm btn-full">✓ Mark as Returned</button>
          </div>
        )}
      </div>
    </div>
  );
}
