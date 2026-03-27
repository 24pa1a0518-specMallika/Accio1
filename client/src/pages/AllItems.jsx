import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import ItemCard from '../components/ItemCard';

export default function AllItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, page, limit: 12 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      const { data } = await api.get(`/items?${params}`);
      setItems(data.items); setTotalPages(data.pages);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [search, statusFilter, typeFilter, sort, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setPage(1); }, [search, statusFilter, typeFilter]);

  return (
    <div className="page">
      <div className="page-content">
        <div className="page-header">
          <div className="page-title">📋 All Items</div>
          <div className="page-subtitle">Combined list of all lost and found reports</div>
        </div>
        <div className="search-bar fade-in">
          <input className="form-control search-input" placeholder="🔍 Search items..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
            <option value="matched">Matched</option>
            <option value="returned">Returned</option>
          </select>
          <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="name">Name A-Z</option>
          </select>
          <button onClick={fetchItems} className="btn btn-primary">Refresh</button>
        </div>
        {loading ? <div className="loading-wrap"><div className="spinner" /></div>
          : items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No items found</div>
              <div className="empty-sub">Try adjusting your search or filters</div>
            </div>
          ) : (
            <>
              <div className="items-grid fade-in">
                {items.map(item => <ItemCard key={item._id} item={item} onStatusChange={fetchItems} />)}
              </div>
              {totalPages > 1 && (
                <div style={{display:'flex',justifyContent:'center',gap:'8px',marginTop:'32px'}}>
                  <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="btn btn-outline btn-sm">← Prev</button>
                  <span style={{padding:'7px 14px',fontSize:'14px',color:'var(--text-muted)'}}>Page {page} of {totalPages}</span>
                  <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} className="btn btn-outline btn-sm">Next →</button>
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
}
