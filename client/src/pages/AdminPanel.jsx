import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('items');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/admin/items?${params}`);
      setItems(data.items);
    } catch { toast.error('Failed to load items'); }
  };

  const fetchUsers = async () => {
    try { const { data } = await api.get('/admin/users'); setUsers(data); }
    catch { toast.error('Failed to load users'); }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchItems(), fetchUsers()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchItems(); }, [search, statusFilter]);

  const toggleVisibility = async (itemId, field, currentVal) => {
    try {
      const item = items.find(i => i._id === itemId);
      const payload = {
        hideBrand: item.hideBrand, hideColour: item.hideColour,
        hideSize: item.hideSize, hideImage: item.hideImage,
        [field]: !currentVal
      };
      const { data } = await api.put(`/admin/items/${itemId}/visibility`, payload);
      setItems(prev => prev.map(i => i._id === itemId ? { ...i, ...data } : i));
    } catch { toast.error('Failed to update visibility'); }
  };

  const changeStatus = async (itemId, status) => {
    try {
      const { data } = await api.put(`/admin/items/${itemId}/status`, { status });
      setItems(prev => prev.map(i => i._id === itemId ? { ...i, ...data } : i));
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/admin/items/${itemId}`);
      setItems(prev => prev.filter(i => i._id !== itemId));
      toast.success('Item deleted');
    } catch { toast.error('Failed'); }
  };

  const ToggleChip = ({ label, hidden, onClick }) => (
    <button onClick={onClick} className={`toggle-chip ${hidden ? 'hidden' : 'visible'}`}>
      {hidden ? '🚫' : '👁️'} {label}
    </button>
  );

  return (
    <div className="page">
      <div className="page-content">
        <div className="page-header">
          <div className="page-title">🛡️ Admin Panel</div>
          <div className="page-subtitle">Full control over items and users</div>
        </div>

        <div style={{display:'flex',gap:'8px',marginBottom:'24px'}}>
          <button onClick={() => setTab('items')} className={`btn ${tab==='items'?'btn-primary':'btn-secondary'}`}>📋 Items ({items.length})</button>
          <button onClick={() => setTab('users')} className={`btn ${tab==='users'?'btn-primary':'btn-secondary'}`}>👥 Users ({users.length})</button>
        </div>

        {tab === 'items' && (
          <>
            <div className="search-bar" style={{marginBottom:'20px'}}>
              <input className="form-control search-input" placeholder="🔍 Search items..." value={search} onChange={e => setSearch(e.target.value)} />
              <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
                <option value="matched">Matched</option>
                <option value="returned">Returned</option>
              </select>
            </div>
            {loading ? <div className="loading-wrap"><div className="spinner"/></div> : (
              <div className="card" style={{overflowX:'auto'}}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Item</th><th>Type</th><th>Location</th><th>Reported By</th>
                      <th>Status</th><th>Visibility</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item._id}>
                        <td>
                          <div style={{fontWeight:600}}>{item.name}</div>
                          {item.brand && <div style={{fontSize:'11px',color:'var(--text-muted)'}}>🏷️ {item.brand}</div>}
                          {item.colour && <div style={{fontSize:'11px',color:'var(--text-muted)'}}>🎨 {item.colour}</div>}
                          {item.size && <div style={{fontSize:'11px',color:'var(--text-muted)'}}>📐 {item.size}</div>}
                          {item.matchScore > 0 && <div className="match-score" style={{marginTop:'4px'}}>⚡ {item.matchScore}%</div>}
                        </td>
                        <td><span className={`badge badge-${item.type}`}>{item.type}</span></td>
                        <td style={{fontSize:'13px'}}>📍 {item.location}</td>
                        <td style={{fontSize:'13px'}}>
                          <div style={{fontWeight:500}}>{item.reportedBy?.name}</div>
                          <div style={{color:'var(--text-muted)',fontSize:'11px'}}>{item.reportedBy?.email}</div>
                        </td>
                        <td>
                          <select value={item.status} onChange={e => changeStatus(item._id, e.target.value)} className="filter-select" style={{fontSize:'12px',padding:'4px 8px'}}>
                            <option value="lost">Lost</option>
                            <option value="found">Found</option>
                            <option value="matched">Matched</option>
                            <option value="returned">Returned</option>
                          </select>
                        </td>
                        <td>
                          <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
                            <ToggleChip label="Brand" hidden={item.hideBrand} onClick={() => toggleVisibility(item._id,'hideBrand',item.hideBrand)} />
                            <ToggleChip label="Colour" hidden={item.hideColour} onClick={() => toggleVisibility(item._id,'hideColour',item.hideColour)} />
                            <ToggleChip label="Size" hidden={item.hideSize} onClick={() => toggleVisibility(item._id,'hideSize',item.hideSize)} />
                            <ToggleChip label="Image" hidden={item.hideImage} onClick={() => toggleVisibility(item._id,'hideImage',item.hideImage)} />
                          </div>
                        </td>
                        <td>
                          <button onClick={() => deleteItem(item._id)} className="btn btn-danger btn-sm">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {items.length === 0 && <div className="empty-state"><div className="empty-icon">📭</div><div className="empty-title">No items</div></div>}
              </div>
            )}
          </>
        )}

        {tab === 'users' && (
          <div className="card" style={{overflowX:'auto'}}>
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{fontWeight:600}}>{u.name}</td>
                    <td style={{fontSize:'13px'}}>{u.email}</td>
                    <td><span style={{padding:'2px 8px',borderRadius:'10px',fontSize:'11px',fontWeight:700,background:u.role==='admin'?'#fef3cd':'var(--brown-100)',color:u.role==='admin'?'#856404':'var(--text-secondary)'}}>{u.role.toUpperCase()}</span></td>
                    <td style={{fontSize:'12px',color:'var(--text-muted)'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
