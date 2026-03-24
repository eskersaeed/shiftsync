import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [page, setPage] = useState('login');

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    setPage('login');
  };

  if (token) return <Dashboard onLogout={handleLogout} />;

  return (
    <div className="auth-wrapper">
      {page === 'login'
        ? <Login onLogin={setToken} onSwitch={() => setPage('register')} />
        : <Register onLogin={setToken} onSwitch={() => setPage('login')} />
      }
    </div>
  );
}

export default App;