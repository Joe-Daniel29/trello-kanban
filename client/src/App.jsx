import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import ProtectedRoute from './components/routing/ProtectedRoute';
import BoardPage from './components/board/BoardPage';
import './App.css';

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kanban Board</h1>
        {user && (
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        )}
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<BoardPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
