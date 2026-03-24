import React, { useState, useEffect } from 'react';
import API from '../api';

const WARDS = ['Ward A', 'Ward B', 'Ward C', 'ICU', 'A&E', 'Maternity', 'Surgical', 'Medical'];

function ShiftForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState({
    date: '',
    start_time: '',
    end_time: '',
    ward: 'Ward A',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        date: initial.date,
        start_time: initial.start_time,
        end_time: initial.end_time,
        ward: initial.ward,
        notes: initial.notes || ''
      });
    }
  }, [initial]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (initial) {
        res = await API.put(`/shifts/${initial.id}`, form);
      } else {
        res = await API.post('/shifts', form);
      }
      onSaved(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save shift.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 24, padding: '20px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>
        {initial ? '✏️ Edit Shift' : '➕ Add New Shift'}
      </h3>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="shift-form">
          <div className="form-group">
            <label>Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Ward</label>
            <select name="ward" value={form.ward} onChange={handleChange}>
              {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Start Time</label>
            <input name="start_time" type="time" value={form.start_time} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input name="end_time" type="time" value={form.end_time} onChange={handleChange} required />
          </div>
          <div className="form-group full-width">
            <label>Notes (optional)</label>
            <input name="notes" type="text" value={form.notes} onChange={handleChange} placeholder="e.g. Night shift, cover for colleague..." />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Saving...' : initial ? 'Update Shift' : 'Add Shift'}
          </button>
          <button className="btn btn-secondary-modal" type="button" onClick={onCancel} style={{ flex: 1 }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ShiftForm;