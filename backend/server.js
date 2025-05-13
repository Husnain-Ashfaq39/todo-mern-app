// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 50010;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Import models
const User = require('./Models/User');
const Post = require('./Models/Post');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    req.userId = decoded.id;
    next();
  });
};

// Auth Routes
// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });
    
    // Save user
    const savedUser = await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign({ id: savedUser._id }, JWT_SECRET, { expiresIn: '1h' });
    
    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        profilePicture: savedUser.profilePicture,
        bio: savedUser.bio
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User Routes
// Get current user
app.get('/api/users/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile
app.put('/api/users/me', verifyToken, async (req, res) => {
  try {
    const { username, bio, profilePicture } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { username, bio, profilePicture },
      { new: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Follow user
app.post('/api/users/:id/follow', verifyToken, async (req, res) => {
  try {
    if (req.userId === req.params.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);
    
    if (!user || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.followers.includes(req.userId)) {
      return res.status(400).json({ message: 'You already follow this user' });
    }
    
    // Add to followers and following
    await User.findByIdAndUpdate(req.params.id, { $push: { followers: req.userId } });
    await User.findByIdAndUpdate(req.userId, { $push: { following: req.params.id } });
    
    res.json({ message: 'User followed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unfollow user
app.post('/api/users/:id/unfollow', verifyToken, async (req, res) => {
  try {
    if (req.userId === req.params.id) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }
    
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);
    
    if (!user || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.followers.includes(req.userId)) {
      return res.status(400).json({ message: 'You do not follow this user' });
    }
    
    // Remove from followers and following
    await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.userId } });
    await User.findByIdAndUpdate(req.userId, { $pull: { following: req.params.id } });
    
    res.json({ message: 'User unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post Routes
// Create post
app.post('/api/posts', verifyToken, async (req, res) => {
  try {
    const { content, image } = req.body;
    
    const newPost = new Post({
      userId: req.userId,
      content,
      image
    });
    
    const savedPost = await newPost.save();
    
    // Populate user data
    const populatedPost = await Post.findById(savedPost._id).populate('userId', 'username profilePicture');
    
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all posts (feed)
app.get('/api/posts', verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    
    // Get posts from current user and followed users
    const posts = await Post.find({
      $or: [
        { userId: req.userId },
        { userId: { $in: currentUser.following } }
      ]
    })
    .populate('userId', 'username profilePicture')
    .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user posts
app.get('/api/users/:id/posts', async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.id })
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like post
app.post('/api/posts/:id/like', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.likes.includes(req.userId)) {
      // Unlike
      await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.userId } });
      res.json({ message: 'Post unliked' });
    } else {
      // Like
      await Post.findByIdAndUpdate(req.params.id, { $push: { likes: req.userId } });
      res.json({ message: 'Post liked' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add comment
app.post('/api/posts/:id/comments', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const comment = {
      userId: req.userId,
      text
    };
    
    await Post.findByIdAndUpdate(req.params.id, { $push: { comments: comment } });
    
    // Get updated post with populated comments
    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.userId', 'username profilePicture');
    
    res.status(201).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
