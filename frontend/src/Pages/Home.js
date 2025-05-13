import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';
import PostForm from '../Components/PostForm';
import Post from '../Components/Post';

// Use environment variable or default to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:50010';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    fetchPosts();
  }, []);
  
  const fetchPosts = async () => {
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
        <PostForm onPostCreated={handlePostCreated} />
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <Post 
              key={post._id} 
              post={post} 
              onPostUpdated={handlePostUpdated} 
            />
          ))
        ) : (
          <div className="no-posts">
            <p>No posts yet. Follow some users or create your first post!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 