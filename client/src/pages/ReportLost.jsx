import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ReportLost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', location:'', dateTime:'', brand:'', description:'' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleImg = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('type', 'lost');
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      await api.post('/items', fd, { headers:{'Content-Type':'multipart/form-data'} });
      toast.success('Lost item reported! We\'ll notify you if a match is found 🔍');
      navigate('/lost-items');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="page-content">
        <div className="page-header">
          <div className="page-title">🔍 Report Lost Item</div>
          <div className="page-subtitle">Describe what you lost. We'll try to find a match!</div>
        </div>
        <div className="card report-form-card fade-in">
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input name="name" className="form-control" placeholder="e.g., Blue Water Bottle" value={form.name} onChange={handle} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Location Lost *</label>
                  <input name="location" className="form-control" placeholder="e.g., Library 2nd Floor" value={form.location} onChange={handle} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date & Time *</label>
                  <input name="dateTime" type="datetime-local" className="form-control" value={form.dateTime} onChange={handle} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Brand Name</label>
                <input name="brand" className="form-control" placeholder="e.g., Nike, Apple, Samsung" value={form.brand} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-control" placeholder="Describe the item — color, size, any distinctive markings..." value={form.description} onChange={handle} rows={4} />
              </div>
              <div className="form-group">
                <label className="form-label">Upload Image (optional)</label>
                <label className="file-upload" htmlFor="imgUpload">
                  <div className="file-upload-icon">📷</div>
                  <div className="file-upload-text">{preview ? 'Change image' : 'Click to upload a photo of the item'}</div>
                  <input id="imgUpload" type="file" accept="image/*" style={{display:'none'}} onChange={handleImg} />
                </label>
                {preview && <img src={preview} className="file-preview" alt="preview" />}
              </div>
              <div style={{display:'flex',gap:'12px'}}>
                <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">← Cancel</button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{flex:1}}>
                  {loading ? '⏳ Submitting...' : '🔍 Report Lost Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
