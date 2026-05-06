const express = require('express');
const router = express.Router();
const { saveProgress, getProgress } = require('../controllers/progressController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/:postId', authMiddleware, saveProgress);
router.get('/:postId', authMiddleware, getProgress);

module.exports = router;
