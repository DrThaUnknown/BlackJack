import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';


import Home from './pages/Home'; 
import Rules from './pages/Rules';
import GameTable from './pages/GameTable';
import Account from './pages/AccountPage'
import LoginForm from './pages/LoginForm';
import RegisterForm from './pages/RegisterForm';
import LogoutButton from './pages/LogoutButton';
import ProtectedRoute from './pages/ProtectedRoute';
import { useAuth } from './pages/AuthContext';
import Aurora from './components/Aurora';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '200px', zIndex: 0, pointerEvents: 'none' }}>
            <Aurora
              colorStops={["#FFD600", "#FFF59D", "#FFB300"]}
              blend={0.5}
              amplitude={1.0}
              speed={0.5}
            />
          </div>
          <nav className="app-nav" style={{ position: 'relative', zIndex: 1 }}>
            <Link to="/" className="nav-link">Home</Link>
            {user ? (
              <>
                <Link to="/table" className="nav-link">Play</Link>
                <Link to="/rules" className="nav-link">Rules</Link>
                <Link to="/account" className='nav-link'>Account</Link>
                <LogoutButton />
              </>
            ) : (
              <Link to="/login" className="nav-link">Login</Link>
            )}
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/table"
              element={
                <ProtectedRoute>
                  <GameTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account/>
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
