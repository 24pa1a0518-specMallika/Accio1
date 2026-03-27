import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ItemCard from '../components/ItemCard';

export default function FoundItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: 'found', sort });
      if (search) params.append('search', search);
      const { data } = await api.get(`/items?${params}`);
      setItems(data.items);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [search, sort]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="page">
      <div className="page-content">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'24px',flexWrap:'wrap',gap:'12px'}}>
          <div className="page-header" style={{marginBottom:0}}>
            <div className="page-title">🟢 Found Items</div>
            <div className="page-subtitle">{items.length} found item{items.length!==1?'s':''} reported</div>
          </div>
          <Link to="/report-found" className="btn btn-primary btn-sm" style={{background:'linear-gradient(135deg,#10b981,#059669)'}}>+ Report Found Item</Link>
        </div>
        <div className="search-bar fade-in">
          <input className="form-control search-input" placeholder="🔍 Search found items..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
        {loading ? <div className="loading-wrap"><div className="spinner" /></div>
          : items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No found items yet</div>
              <div className="empty-sub">Found something? Report it to help someone!</div>
            </div>
          ) : (
            <div className="items-grid fade-in">
              {items.map(item => <ItemCard key={item._id} item={item} onStatusChange={fetch} />)}
            </div>
          )}
      </div>
    </div>
  );
}
