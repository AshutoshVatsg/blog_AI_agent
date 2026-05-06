const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  addReaction,
  removeReaction,
  getReactions,
  getHeatmap,
} = require('../controllers/reactionController');
const { authMiddleware } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { reactionValidation } = require('../utils/validators');

router.get('/', getReactions);
router.get('/heatmap', getHeatmap);
router.post('/', authMiddleware, reactionValidation, validateRequest, addReaction);
router.delete('/:reactionId', authMiddleware, removeReaction);

module.exports = router;
