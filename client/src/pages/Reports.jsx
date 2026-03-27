import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const BROWN_COLORS = ['#a0652a', '#c08550', '#d4a976', '#ead5b8', '#7d4e1f', '#5c3716'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/summary').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="page-content"><div className="loading-wrap"><div className="spinner"/></div></div></div>;
  if (!data) return null;

  const pieData = [
    { name: 'Lost', value: data.totalLost },
    { name: 'Found', value: data.totalFound },
    { name: 'Matched', value: data.totalMatched },
    { name: 'Returned', value: data.totalReturned },
  ].filter(d => d.value > 0);

  const locationData = data.locationStats?.map(l => ({ location: l._id?.slice(0,15), count: l.count })) || [];

  // Build monthly trend
  const monthMap = {};
  data.monthlyTrend?.forEach(t => {
    const key = `${MONTHS[t._id.month-1]} ${t._id.year}`;
    if (!monthMap[key]) monthMap[key] = { month: key, lost: 0, found: 0 };
    monthMap[key][t._id.type] = t.count;
  });
  const monthlyData = Object.values(monthMap).slice(-6);

  const summaryCards = [
    { title: 'Total Lost', value: data.totalLost, icon: '🔴', color: '#f59e0b' },
    { title: 'Total Found', value: data.totalFound, icon: '🟢', color: '#10b981' },
    { title: 'Matched', value: data.totalMatched, icon: '🔵', color: '#3b82f6' },
    { title: 'Returned', value: data.totalReturned, icon: '⚫', color: '#6b7280' },
    { title: 'Success Rate', value: `${data.successRate}%`, icon: '📈', color: '#8b5cf6' },
    { title: 'Total Users', value: data.totalUsers, icon: '👥', color: '#ec4899' },
  ];

  const tooltipStyle = { background:'white', border:'1px solid var(--border)', borderRadius:'8px', fontSize:'13px' };

  return (
    <div className="page">
      <div className="page-content">
        <div className="page-header">
          <div className="page-title">📊 Analytics Reports</div>
          <div className="page-subtitle">Overview of the Campus Lost & Found Portal activity</div>
        </div>

        <div className="stats-grid fade-in" style={{gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))'}}>
          {summaryCards.map(s => (
            <div className="stat-card" key={s.title}>
              <div style={{fontSize:'24px',marginBottom:'8px'}}>{s.icon}</div>
              <div className="stat-number" style={{color:s.color,fontSize:'28px'}}>{s.value}</div>
              <div className="stat-label">{s.title}</div>
            </div>
          ))}
        </div>

        <div className="charts-grid fade-in">
          {/* Pie Chart */}
          <div className="card">
            <div className="card-header"><strong>Item Status Distribution</strong></div>
            <div className="card-body">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={BROWN_COLORS[i%BROWN_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle}/>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="empty-state" style={{padding:'40px'}}><div className="empty-title">No data yet</div></div>}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="card">
            <div className="card-header"><strong>Monthly Trend (Last 6 Months)</strong></div>
            <div className="card-body">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={monthlyData}>
                    <XAxis dataKey="month" tick={{fontSize:11}} />
                    <YAxis tick={{fontSize:11}} />
                    <Tooltip contentStyle={tooltipStyle}/>
                    <Legend />
                    <Line type="monotone" dataKey="lost" stroke="#f59e0b" strokeWidth={2} name="Lost" dot={{r:4}} />
                    <Line type="monotone" dataKey="found" stroke="#10b981" strokeWidth={2} name="Found" dot={{r:4}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <div className="empty-state" style={{padding:'40px'}}><div className="empty-title">No trend data</div></div>}
            </div>
          </div>

          {/* Top Locations */}
          {locationData.length > 0 && (
            <div className="card" style={{gridColumn:'1/-1'}}>
              <div className="card-header"><strong>Top Locations</strong></div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={locationData} layout="vertical">
                    <XAxis type="number" tick={{fontSize:11}}/>
                    <YAxis type="category" dataKey="location" width={130} tick={{fontSize:11}}/>
                    <Tooltip contentStyle={tooltipStyle}/>
                    <Bar dataKey="count" name="Reports" radius={[0,4,4,0]}>
                      {locationData.map((_, i) => <Cell key={i} fill={BROWN_COLORS[i%BROWN_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="card fade-in" style={{marginTop:'24px',padding:'24px',background:'linear-gradient(135deg,var(--brown-50),var(--brown-100))'}}>
          <div style={{display:'flex',gap:'40px',flexWrap:'wrap',justifyContent:'center'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'13px',color:'var(--text-muted)',fontWeight:600}}>THIS WEEK — LOST</div>
              <div style={{fontSize:'32px',fontWeight:800,color:'#f59e0b'}}>{data.recentLost}</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'13px',color:'var(--text-muted)',fontWeight:600}}>THIS WEEK — FOUND</div>
              <div style={{fontSize:'32px',fontWeight:800,color:'#10b981'}}>{data.recentFound}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
