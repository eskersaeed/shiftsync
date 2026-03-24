# 🏥 ShiftSync — Nurse Rota App

A full-stack shift scheduling web application built to solve real rota management problems observed on the ward.

## 🚀 Features
- User registration and JWT-based authentication
- Add, view, edit and delete shifts (full CRUD)
- Ward selection, shift type detection (Day/Late/Night)
- Clean dashboard with shift stats
- Demo account included

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Axios |
| Backend | Node.js, Express |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT + bcrypt |

## 📦 Getting Started

### Backend
```bash
cd backend
npm install
node server.js
```
Backend runs on http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:3000

## 🧪 Demo Account
- **Email:** demo@shiftsync.com
- **Password:** password123

## 📁 Project Structure
```
shiftsync/
├── backend/
│   ├── server.js        # Express server, routes & DB
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   ├── ShiftForm.js
    │   │   └── ShiftList.js
    │   ├── api.js        # Axios instance
    │   └── App.js
    └── package.json
```

## 👤 Author
Saeed Mahmoud — github.com/eskersaeed