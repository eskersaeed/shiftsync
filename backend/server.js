const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'shiftsync_secret_key_change_in_production';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new Database('shiftsync.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'nurse'
  );

  CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    ward TEXT NOT NULL,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed a demo user
const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get('demo@shiftsync.com');
if (!existingUser) {
  const hashed = bcrypt.hashSync('password123', 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Demo Nurse', 'demo@shiftsync.com', hashed, 'nurse');
  // Seed some demo shifts
  const demoUser = db.prepare('SELECT * FROM users WHERE email = ?').get('demo@shiftsync.com');
  const shifts = [
    { date: '2025-03-25', start_time: '07:00', end_time: '19:00', ward: 'Ward A', notes: 'Morning shift' },
    { date: '2025-03-27', start_time: '19:00', end_time: '07:00', ward: 'Ward B', notes: 'Night shift' },
    { date: '2025-03-29', start_time: '07:00', end_time: '19:00', ward: 'Ward A', notes: '' },
    { date: '2025-04-01', start_time: '13:00', end_time: '21:00', ward: 'ICU', notes: 'Late shift' },
  ];
  shifts.forEach(s => {
    db.prepare('INSERT INTO shifts (user_id, date, start_time, end_time, ward, notes) VALUES (?, ?, ?, ?, ?, ?)')
      .run(demoUser.id, s.date, s.start_time, s.end_time, s.ward, s.notes);
  });
}

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ── ROUTES ──────────────────────────────────────────────

// POST /api/register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields required' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(400).json({ error: 'Email already registered' });
  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashed);
  const token = jwt.sign({ id: result.lastInsertRowid, name, email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: result.lastInsertRowid, name, email } });
});

// POST /api/login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// GET /api/me
app.get('/api/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// GET /api/shifts
app.get('/api/shifts', auth, (req, res) => {
  const shifts = db.prepare('SELECT * FROM shifts WHERE user_id = ? ORDER BY date ASC').all(req.user.id);
  res.json(shifts);
});

// POST /api/shifts
app.post('/api/shifts', auth, (req, res) => {
  const { date, start_time, end_time, ward, notes } = req.body;
  if (!date || !start_time || !end_time || !ward)
    return res.status(400).json({ error: 'date, start_time, end_time and ward are required' });
  const result = db.prepare(
    'INSERT INTO shifts (user_id, date, start_time, end_time, ward, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, date, start_time, end_time, ward, notes || '');
  const shift = db.prepare('SELECT * FROM shifts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(shift);
});

// PUT /api/shifts/:id
app.put('/api/shifts/:id', auth, (req, res) => {
  const shift = db.prepare('SELECT * FROM shifts WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!shift) return res.status(404).json({ error: 'Shift not found' });
  const { date, start_time, end_time, ward, notes } = req.body;
  db.prepare(
    'UPDATE shifts SET date=?, start_time=?, end_time=?, ward=?, notes=? WHERE id=?'
  ).run(date || shift.date, start_time || shift.start_time, end_time || shift.end_time, ward || shift.ward, notes ?? shift.notes, shift.id);
  const updated = db.prepare('SELECT * FROM shifts WHERE id = ?').get(shift.id);
  res.json(updated);
});

// DELETE /api/shifts/:id
app.delete('/api/shifts/:id', auth, (req, res) => {
  const shift = db.prepare('SELECT * FROM shifts WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!shift) return res.status(404).json({ error: 'Shift not found' });
  db.prepare('DELETE FROM shifts WHERE id = ?').run(shift.id);
  res.json({ message: 'Shift deleted' });
});

app.listen(PORT, () => console.log(`ShiftSync backend running on http://localhost:${PORT}`));