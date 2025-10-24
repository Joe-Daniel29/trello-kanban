import { Routes, Route } from 'react-router-dom'; // <-- Removed 'BrowserRouter as Router'
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import BoardPage from './components/board/BoardPage.jsx';
import BoardDetail from './components/board/BoardDetail.jsx'; // <-- The component for the empty page
import ProtectedRoute from './components/routing/ProtectedRoute.jsx';
import Header from './components/layout/Header.jsx'; // <-- The new, styled header
import './App.css';

/**
 * This component contains the main layout and routing logic.
 * It's wrapped by AuthProvider in the main App function.
 */
function AppContent() {
  const { user } = useAuth(); // Get user state to conditionally render header

  return (
    <div className="app">
      {/* This renders our new, styled header instead of the old one */}
      {user && <Header />}

      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes Wrapper */}
          <Route element={<ProtectedRoute />}>
            {/* Main dashboard page */}
            <Route path="/" element={<BoardPage />} />

            {/* THIS IS THE MISSING PIECE:
              This route matches /board/some-id and renders the BoardDetail component.
            */}
            <Route path="/board/:boardId" element={<BoardDetail />} />
          </Route>

        </Routes>
      </main>
    </div>
  );
}

/**
 * The main App component just sets up the providers (Auth)
 * The Router is now in main.jsx
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* <Router> was here and is now removed */}
        <AppContent />
        {/* </Router> was here and is now removed */}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

