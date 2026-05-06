const express = require('express');
const router = express.Router();
const {
  analyzePost,
  getMyInsights,
  generateInsights,
} = require('../controllers/insightController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/analyze/:postId', authMiddleware, analyzePost);
router.get('/my', authMiddleware, getMyInsights);
router.post('/generate', authMiddleware, generateInsights);

module.exports = router;
