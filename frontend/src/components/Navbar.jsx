import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Zap, User, Search, Command } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../store';
import { logout, selectUser, selectIsAuthenticated } from '../features/auth/store/authSlice';
import { ROUTES } from '../routes/routeConstants';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully!');
    navigate(ROUTES.LOGIN);
  };

  const handleOpenCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME} className="navbar-logo">
          <div className="logo-icon">⚡</div>
          <span className="gradient-text">TaskFlow Pro</span>
        </Link>

        {isAuthenticated && user && (
          <button
            type="button"
            className="navbar-search-command-btn"
            onClick={handleOpenCommandPalette}
            title="Search or Run Command (Ctrl+K)"
          >
            <Search size={14} className="navbar-cmd-icon" />
            <span className="navbar-cmd-text">Search or run command...</span>
            <kbd className="navbar-cmd-kbd">Ctrl+K</kbd>
          </button>
        )}

        <div className="navbar-actions">
          {isAuthenticated && user ? (
            <div style={{ position: 'relative' }} ref={menuRef}>
              <div className="user-avatar" onClick={() => setMenuOpen(!menuOpen)} title={user.name}>
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatarUrl}`}
                    alt={user.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  user.avatar || user.name?.slice(0, 2).toUpperCase()
                )}
              </div>

              {menuOpen && (
                <div className="user-menu">
                  <div className="user-menu-header">
                    <div className="user-menu-name">{user.name}</div>
                    <div className="user-menu-email">{user.email}</div>
                  </div>
                  <button className="user-menu-item" onClick={() => { navigate(ROUTES.DASHBOARD); setMenuOpen(false); }}>
                    <LayoutDashboard size={15} /> Dashboard
                  </button>
                  <button className="user-menu-item" onClick={() => { navigate(ROUTES.PROFILE); setMenuOpen(false); }}>
                    <User size={15} /> Profile
                  </button>
                  <button className="user-menu-item danger" onClick={handleLogout}>
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to={ROUTES.LOGIN} className="btn btn-secondary btn-sm">Login</Link>
              <Link to={ROUTES.REGISTER} className="btn btn-primary btn-sm">
                <Zap size={14} /> Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
