const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  getMyPosts,
  searchPosts,
  getTrendingPosts,
} = require('../controllers/postController');
const { authMiddleware } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { postValidation } = require('../utils/validators');

// Public routes
router.get('/search', searchPosts);
router.get('/trending', getTrendingPosts);
router.get('/', getPosts);
router.get('/my', authMiddleware, getMyPosts);
router.get('/:id', getPost);

// Protected routes
router.post('/', authMiddleware, postValidation, validateRequest, createPost);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
