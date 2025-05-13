import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaUserPlus, FaUserCheck } from 'react-icons/fa';
import { useAuth } from '../Context/AuthContext';

// Use environment variable or default to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:50010';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    if (query.trim().length >= 2) {
      searchUsers();
    } else {
      setResults([]);
    }
  }, [query]);
  
  const searchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/api/users/search?q=${query}`, config);
      setResults(response.data);
      setShowResults(true);
    } catch (err) {
      setError('Failed to search users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFollowUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.post(`${API_URL}/api/users/${userId}/follow`, {}, config);
      
      // Update results to show user is now followed
      setResults(results.map(user => 
        user._id === userId 
          ? { ...user, followers: [...user.followers, currentUser.id] }
          : user
      ));
    } catch (err) {
      setError('Failed to follow user');
      console.error(err);
    }
  };
  
  const handleUnfollowUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.post(`${API_URL}/api/users/${userId}/unfollow`, {}, config);
      
      // Update results to show user is now unfollowed
      setResults(results.map(user => 
        user._id === userId 
          ? { ...user, followers: user.followers.filter(id => id !== currentUser.id) }
          : user
      ));
    } catch (err) {
      setError('Failed to unfollow user');
      console.error(err);
    }
  };
  
  const handleClickOutside = (e) => {
    if (!e.target.closest('.search-container')) {
      setShowResults(false);
    }
  };
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          className="search-input"
        />
      </div>
      
      {showResults && query.trim().length >= 2 && (
        <div className="search-results">
          {loading && <div className="search-loading">Searching...</div>}
          
          {error && <div className="search-error">{error}</div>}
          
          {!loading && results.length === 0 && (
            <div className="no-results">No users found</div>
          )}
          
          {results.map(user => {
            const isFollowing = user.followers?.includes(currentUser?.id);
            const isCurrentUser = user._id === currentUser?.id;
            
            return (
              <div key={user._id} className="search-result-item">
                <Link to={`/profile/${user._id}`} className="user-info">
                  <img 
                    src={user.profilePicture || 'https://via.placeholder.com/40'} 
                    alt={user.username} 
                    className="avatar"
                  />
                  <div>
                    <h4>{user.username}</h4>
                    <p className="user-bio">{user.bio?.substring(0, 50)}{user.bio?.length > 50 ? '...' : ''}</p>
                  </div>
                </Link>
                
                {!isCurrentUser && (
                  <button 
                    onClick={() => isFollowing ? handleUnfollowUser(user._id) : handleFollowUser(user._id)}
                    className={`follow-button ${isFollowing ? 'following' : ''}`}
                  >
                    {isFollowing ? <FaUserCheck /> : <FaUserPlus />}
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Search; 