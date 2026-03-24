import React from 'react';

function getShiftType(start) {
  const hour = parseInt(start?.split(':')[0] || 0);
  if (hour >= 6 && hour < 14) return { label: 'Day', cls: 'day' };
  if (hour >= 14 && hour < 20) return { label: 'Late', cls: 'late' };
  return { label: 'Night', cls: 'night' };
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function ShiftList({ shifts, onEdit, onDelete }) {
  if (!shifts.length) {
    return (
      <div className="empty-state">
        <p>📋 No shifts yet</p>
        <span>Click "Add Shift" to add your first shift</span>
      </div>
    );
  }

  const sorted = [...shifts].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <table className="shifts-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Ward</th>
          <th>Type</th>
          <th>Notes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map(shift => {
          const type = getShiftType(shift.start_time);
          return (
            <tr key={shift.id}>
              <td><strong>{formatDate(shift.date)}</strong></td>
              <td>{shift.start_time} – {shift.end_time}</td>
              <td><span className="ward-badge">{shift.ward}</span></td>
              <td><span className={`shift-type ${type.cls}`}>{type.label}</span></td>
              <td style={{ color: '#94a3b8', fontSize: 13 }}>{shift.notes || '—'}</td>
              <td>
                <div className="action-btns">
                  <button className="btn-icon btn-edit" onClick={() => onEdit(shift)}>Edit</button>
                  <button className="btn-icon btn-del" onClick={() => onDelete(shift.id)}>Delete</button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default ShiftList;