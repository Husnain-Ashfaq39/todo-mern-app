import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';
import PostForm from '../Components/PostForm';
import Post from '../Components/Post';
import { FaGlobeAmericas, FaUserFriends, FaSearch } from 'react-icons/fa';
import Search from '../Components/Search';

// Use environment variable or default to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:50010';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'discover'
  const [showSearch, setShowSearch] = useState(false);
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    if (activeTab === 'feed') {
      fetchFeedPosts();
    } else {
      fetchAllPosts();
    }
  }, [activeTab]);
  
  const fetchFeedPosts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/api/posts`, config);
      setPosts(response.data);
    } catch (err) {
      setError('Failed to fetch posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.get(`${API_URL}/api/posts/discover`, config);
      setPosts(response.data);
    } catch (err) {
      setError('Failed to fetch posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };
  
  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };
  
  return (
    <div className="home-container">
      <div className="feed">
        <div className="feed-tabs">
          <button 
            className={`tab-button ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <FaUserFriends /> <span>My Feed</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            <FaGlobeAmericas /> <span>Discover</span>
          </button>
          <button 
            className="tab-button search-tab"
            onClick={() => setShowSearch(!showSearch)}
          >
            <FaSearch /> <span>Find Friends</span>
          </button>
        </div>
        
        {showSearch && (
          <div className="home-search-container">
            <Search />
          </div>
        )}
        
        <PostForm onPostCreated={handlePostCreated} />
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length > 0 ? (
          <div className="posts-container">
            {posts.map(post => (
              <Post 
                key={post._id} 
                post={post} 
                onPostUpdated={handlePostUpdated} 
              />
            ))}
          </div>
        ) : (
          <div className="no-posts">
            {activeTab === 'feed' ? (
              <>
                <h3>Your feed is empty</h3>
                <p>Follow some users to see their posts here, or switch to Discover to see posts from everyone.</p>
              </>
            ) : (
              <>
                <h3>No posts yet</h3>
                <p>Be the first to create a post!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 