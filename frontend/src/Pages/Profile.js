import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';
import Post from '../Components/Post';
import { FaUserEdit, FaUserPlus, FaUserMinus } from 'react-icons/fa';

// Use environment variable or default to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:50010';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  
  const { currentUser, updateProfile } = useAuth();
  
  const isOwnProfile = currentUser?.id === id;
  const isFollowing = profile?.followers?.includes(currentUser?.id);
  
  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [id]);
  
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${API_URL}/api/users/${id}`);
      setProfile(response.data);
      
      if (isOwnProfile) {
        setBio(response.data.bio || '');
        setProfilePicture(response.data.profilePicture || '');
      }
    } catch (err) {
      setError('Failed to fetch profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/${id}/posts`);
      setPosts(response.data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };
  
  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.post(`${API_URL}/api/users/${id}/follow`, {}, config);
      
      // Update profile
      setProfile({
        ...profile,
        followers: [...profile.followers, currentUser.id]
      });
    } catch (err) {
      setError('Failed to follow user');
      console.error(err);
    }
  };
  
  const handleUnfollow = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.post(`${API_URL}/api/users/${id}/unfollow`, {}, config);
      
      // Update profile
      setProfile({
        ...profile,
        followers: profile.followers.filter(followerId => followerId !== currentUser.id)
      });
    } catch (err) {
      setError('Failed to unfollow user');
      console.error(err);
    }
  };
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      const result = await updateProfile({
        bio,
        profilePicture
      });
      
      if (result.success) {
        setIsEditing(false);
        setProfile({
          ...profile,
          bio,
          profilePicture
        });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };
  
  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };
  
  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!profile) {
    return <div className="not-found">User not found</div>;
  }
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <img 
          src={profile.profilePicture || 'https://via.placeholder.com/150'} 
          alt={profile.username} 
          className="profile-picture"
        />
        <div className="profile-info">
          <h2>{profile.username}</h2>
          <p className="bio">{profile.bio}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{posts.length}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat">
              <span className="stat-value">{profile.followers?.length || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-value">{profile.following?.length || 0}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
          
          {isOwnProfile ? (
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className="profile-action-button edit"
            >
              <FaUserEdit /> {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          ) : (
            <button 
              onClick={isFollowing ? handleUnfollow : handleFollow} 
              className={`profile-action-button ${isFollowing ? 'unfollow' : 'follow'}`}
            >
              {isFollowing ? <><FaUserMinus /> Unfollow</> : <><FaUserPlus /> Follow</>}
            </button>
          )}
        </div>
      </div>
      
      {isEditing && (
        <div className="edit-profile-form">
          <h3>Edit Profile</h3>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label htmlFor="profilePicture">Profile Picture URL</label>
              <input
                type="text"
                id="profilePicture"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
              />
            </div>
            <button type="submit" className="save-button">Save Changes</button>
          </form>
        </div>
      )}
      
      <div className="profile-posts">
        <h3>Posts</h3>
        {posts.length > 0 ? (
          posts.map(post => (
            <Post 
              key={post._id} 
              post={post} 
              onPostUpdated={handlePostUpdated} 
            />
          ))
        ) : (
          <div className="no-posts">
            <p>No posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 