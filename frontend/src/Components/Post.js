import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';
import { FaHeart, FaRegHeart, FaComment, FaTrash } from 'react-icons/fa';

// Use environment variable or default to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:50010';

const Post = ({ post, onPostUpdated }) => {
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { currentUser } = useAuth();
  
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const created = new Date(timestamp);
    const diffInSeconds = Math.floor((now - created) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };
  
  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.post(`${API_URL}/api/posts/${post._id}/like`, {}, config);
      
      // Update post in parent component
      const isLiked = post.likes.includes(currentUser.id);
      const updatedPost = {
        ...post,
        likes: isLiked
          ? post.likes.filter(id => id !== currentUser.id)
          : [...post.likes, currentUser.id]
      };
      
      onPostUpdated(updatedPost);
    } catch (err) {
      setError('Failed to like post');
      console.error(err);
    }
  };
  
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
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
      
      const response = await axios.post(`${API_URL}/api/posts/${post._id}/comments`, {
        text: comment
      }, config);
      
      setComment('');
      onPostUpdated(response.data);
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const isLiked = post.likes.includes(currentUser?.id);
  
  return (
    <div className="post">
      <div className="post-header">
        <Link to={`/profile/${post.userId._id}`} className="post-user">
          <img 
            src={post.userId.profilePicture || 'https://via.placeholder.com/40'} 
            alt={post.userId.username} 
            className="avatar"
          />
          <div>
            <h4>{post.userId.username}</h4>
            <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
          </div>
        </Link>
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
        {post.image && (
          <img src={post.image} alt="Post" className="post-image" />
        )}
      </div>
      
      <div className="post-actions">
        <button onClick={handleLike} className="action-button">
          {isLiked ? <FaHeart className="liked" /> : <FaRegHeart />}
          <span>{post.likes.length}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)} 
          className="action-button"
        >
          <FaComment />
          <span>{post.comments.length}</span>
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {showComments && (
        <div className="post-comments">
          <form onSubmit={handleAddComment} className="comment-form">
            <input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post'}
            </button>
          </form>
          
          {post.comments.length > 0 ? (
            <div className="comments-list">
              {post.comments.map((comment, index) => (
                <div key={index} className="comment">
                  <div className="comment-header">
                    <Link to={`/profile/${comment.userId._id}`} className="comment-user">
                      <img 
                        src={comment.userId.profilePicture || 'https://via.placeholder.com/30'} 
                        alt={comment.userId.username} 
                        className="avatar small"
                      />
                      <h5>{comment.userId.username}</h5>
                    </Link>
                    <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p>{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-comments">No comments yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Post; 