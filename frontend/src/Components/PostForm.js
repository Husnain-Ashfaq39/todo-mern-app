import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';
import { FaImage, FaTimes } from 'react-icons/fa';

// Use environment variable or default to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:50010';

const PostForm = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { currentUser } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.post(`${API_URL}/api/posts`, {
        content,
        image
      }, config);
      
      setContent('');
      setImage('');
      
      if (onPostCreated) {
        onPostCreated(response.data);
      }
    } catch (err) {
      setError('Failed to create post');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="post-form">
      <div className="post-form-header">
        <img 
          src={currentUser?.profilePicture || 'https://via.placeholder.com/40'} 
          alt={currentUser?.username} 
          className="avatar"
        />
        <h3>What's on your mind?</h3>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Share your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        
        {image && (
          <div className="image-preview">
            <img src={image} alt="Preview" />
            <button 
              type="button" 
              className="remove-image"
              onClick={() => setImage('')}
            >
              <FaTimes />
            </button>
          </div>
        )}
        
        <div className="post-form-actions">
          <button 
            type="button" 
            className="add-image"
            onClick={() => {
              const url = prompt('Enter image URL:');
              if (url) setImage(url);
            }}
          >
            <FaImage /> Add Image
          </button>
          
          <button 
            type="submit" 
            className="post-button" 
            disabled={loading || !content.trim()}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;