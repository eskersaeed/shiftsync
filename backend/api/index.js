const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = 'shiftsync_secret_key_change_in_production';

app.use(cors());
app.use(express.json());

// In-memory store (since Vercel serverless can't use SQLite file)
const users = [
  {
    id: 1,
    name: 'Demo Nurse',
    email: 'demo@shiftsync.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'nurse'
  }
];

const shifts = [
  { id: 1, user_id: 1, date: '2026-03-25', start_time: '07:00', end_time: '19:00', ward: 'Ward A', notes: 'Morning shift' },
  { id: 2, user_id: 1, date: '2026-03-27', start_time: '19:00', end_time: '07:00', ward: 'Ward B', notes: 'Night shift' },
  { id: 3, user_id: 1, date: '2026-03-29', start_time: '07:00', end_time: '19:00', ward: 'Ward A', notes: '' },
  { id: 4, user_id: 1, date: '2026-04-01', start_time: '13:00', end_time: '21:00', ward: 'ICU', notes: 'Late shift' },
];

let nextUserId = 2;
let nextShiftId = 5;

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

// POST /api/register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already registered' });
  const hashed = bcrypt.hashSync(password, 10);
  const user = { id: nextUserId++, name, email, password: hashed, role: 'nurse' };
  users.push(user);
  const token = jwt.sign({ id: user.id, name, email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name, email } });
});

// POST /api/login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// GET /api/me
app.get('/api/me', auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// GET /api/shifts
app.get('/api/shifts', auth, (req, res) => {
  const userShifts = shifts.filter(s => s.user_id === req.user.id);
  res.json(userShifts);
});

// POST /api/shifts
app.post('/api/shifts', auth, (req, res) => {
  const { date, start_time, end_time, ward, notes } = req.body;
  if (!date || !start_time || !end_time || !ward)
    return res.status(400).json({ error: 'date, start_time, end_time and ward are required' });
  const shift = { id: nextShiftId++, user_id: req.user.id, date, start_time, end_time, ward, notes: notes || '' };
  shifts.push(shift);
  res.status(201).json(shift);
});

// PUT /api/shifts/:id
app.put('/api/shifts/:id', auth, (req, res) => {
  const idx = shifts.findIndex(s => s.id === parseInt(req.params.id) && s.user_id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Shift not found' });
  const { date, start_time, end_time, ward, notes } = req.body;
  shifts[idx] = { ...shifts[idx], date: date || shifts[idx].date, start_time: start_time || shifts[idx].start_time, end_time: end_time || shifts[idx].end_time, ward: ward || shifts[idx].ward, notes: notes ?? shifts[idx].notes };
  res.json(shifts[idx]);
});

// DELETE /api/shifts/:id
app.delete('/api/shifts/:id', auth, (req, res) => {
  const idx = shifts.findIndex(s => s.id === parseInt(req.params.id) && s.user_id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Shift not found' });
  shifts.splice(idx, 1);
  res.json({ message: 'Shift deleted' });
});

module.exports = app;