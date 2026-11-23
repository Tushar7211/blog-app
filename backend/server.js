
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Post Schema and Model
const Post = mongoose.model(
  'Post',
  new mongoose.Schema(
    {
      title: { type: String, required: true },
      author: { type: String, default: 'Anonymous' },
      content: { type: String, required: true },
    },
    { timestamps: true }
  )
);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET - Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Create a new post
app.post('/api/posts', async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE - Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server and Connect MongoDB
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blogdb', {
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
      console.log('MongoDB connected successfully');

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('MongoDB connection failed:', err.message);
      process.exit(1);
    });
}

module.exports = app;
//test