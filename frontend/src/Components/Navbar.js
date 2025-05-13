import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { FaHome, FaUser, FaSignOutAlt, FaBell, FaSearch, FaTimes } from 'react-icons/fa';
import Search from './Search';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Nexus</span>
          <span className="logo-dot"></span>
        </Link>
        
        <div className="navbar-search-container">
          {showSearch ? (
            <Search />
          ) : (
            <button 
              className="search-toggle-btn"
              onClick={() => setShowSearch(true)}
            >
              <FaSearch /> Search
            </button>
          )}
        </div>
        
        <div className="menu-icon" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          {showMobileMenu ? <FaTimes /> : <div className="hamburger-menu">
            <span></span>
            <span></span>
            <span></span>
          </div>}
        </div>
        
        <ul className={showMobileMenu ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setShowMobileMenu(false)}>
              <FaHome /> <span>Home</span>
            </Link>
          </li>
          {currentUser && (
            <>
              <li className="nav-item">
                <Link to={`/profile/${currentUser.id}`} className="nav-link" onClick={() => setShowMobileMenu(false)}>
                  <FaUser /> <span>Profile</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/notifications" className="nav-link" onClick={() => setShowMobileMenu(false)}>
                  <FaBell /> <span>Notifications</span>
                </Link>
              </li>
            </>
          )}
          <li className="nav-item">
            <button onClick={handleLogout} className="nav-link logout-btn">
              <FaSignOutAlt /> <span>Logout</span>
            </button>
          </li>
        </ul>
        
        {currentUser && (
          <div className="navbar-user">
            <Link to={`/profile/${currentUser.id}`} className="user-avatar">
              <img 
                src={currentUser.profilePicture || 'https://via.placeholder.com/40'} 
                alt={currentUser.username} 
              />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
