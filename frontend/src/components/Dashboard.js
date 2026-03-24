import React, { useState, useEffect } from 'react';
import API from '../api';
import ShiftForm from './ShiftForm';
import ShiftList from './ShiftList';

function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editShift, setEditShift] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, shiftsRes] = await Promise.all([
        API.get('/me'),
        API.get('/shifts')
      ]);
      setUser(userRes.data);
      setShifts(shiftsRes.data);
    } catch {
      onLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleSaved = (shift) => {
    if (editShift) {
      setShifts(shifts.map(s => s.id === shift.id ? shift : s));
    } else {
      setShifts([...shifts, shift]);
    }
    setShowForm(false);
    setEditShift(null);
  };

  const handleEdit = (shift) => {
    setEditShift(shift);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shift?')) return;
    await API.delete(`/shifts/${id}`);
    setShifts(shifts.filter(s => s.id !== id));
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditShift(null);
  };

  // Stats
  const today = new Date().toISOString().split('T')[0];
  const upcoming = shifts.filter(s => s.date >= today);
  const wards = [...new Set(shifts.map(s => s.ward))];

  if (loading) return <div className="loading">Loading your shifts...</div>;

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          🏥 ShiftSync
          <span>Nurse Rota</span>
        </div>
        <div className="navbar-right">
          <span className="user-badge">👋 {user?.name}</span>
          <button className="btn btn-danger btn-sm" onClick={onLogout}>Log out</button>
        </div>
      </nav>

      <div className="main-content">

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="num">{shifts.length}</div>
            <div className="label">Total Shifts</div>
          </div>
          <div className="stat-card">
            <div className="num">{upcoming.length}</div>
            <div className="label">Upcoming Shifts</div>
          </div>
          <div className="stat-card">
            <div className="num">{wards.length}</div>
            <div className="label">Wards</div>
          </div>
        </div>

        {/* Add Shift */}
        <div className="card">
          <div className="card-header">
            <h2>📅 My Shifts</h2>
            <button className="btn-sm btn-outline" onClick={() => { setEditShift(null); setShowForm(!showForm); }}>
              {showForm ? '✕ Cancel' : '+ Add Shift'}
            </button>
          </div>

          {showForm && (
            <ShiftForm
              initial={editShift}
              onSaved={handleSaved}
              onCancel={handleCancel}
            />
          )}

          <ShiftList
            shifts={shifts}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

      </div>
    </div>
  );
}

export default Dashboard;