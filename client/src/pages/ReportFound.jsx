import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ReportFound() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', location:'', dateTime:'', brand:'', colour:'', size:'', description:'' });
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
      fd.append('type', 'found');
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      await api.post('/items', fd, { headers:{'Content-Type':'multipart/form-data'} });
      toast.success('Found item reported! The owner will be notified 🤲');
      navigate('/found-items');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="page-content">
        <div className="page-header">
          <div className="page-title">🤲 Report Found Item</div>
          <div className="page-subtitle">Help someone get their item back. Your details help us match!</div>
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
                  <label className="form-label">Location Found *</label>
                  <input name="location" className="form-control" placeholder="e.g., Cafeteria Table 5" value={form.location} onChange={handle} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date & Time *</label>
                  <input name="dateTime" type="datetime-local" className="form-control" value={form.dateTime} onChange={handle} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input name="brand" className="form-control" placeholder="e.g., Apple" value={form.brand} onChange={handle} />
                </div>
                <div className="form-group">
                  <label className="form-label">Colour</label>
                  <input name="colour" className="form-control" placeholder="e.g., Black, Silver" value={form.colour} onChange={handle} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Size</label>
                  <input name="size" className="form-control" placeholder="e.g., Small, A4, 14-inch" value={form.size} onChange={handle} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input name="description" className="form-control" placeholder="Any notable features..." value={form.description} onChange={handle} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Upload Image *</label>
                <label className="file-upload" htmlFor="imgUploadFound">
                  <div className="file-upload-icon">📷</div>
                  <div className="file-upload-text">{preview ? 'Change image' : 'Click to upload a photo of the found item'}</div>
                  <input id="imgUploadFound" type="file" accept="image/*" style={{display:'none'}} onChange={handleImg} />
                </label>
                {preview && <img src={preview} className="file-preview" alt="preview" />}
              </div>
              <div style={{display:'flex',gap:'12px'}}>
                <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">← Cancel</button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{flex:1}}>
                  {loading ? '⏳ Submitting...' : '🤲 Report Found Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
