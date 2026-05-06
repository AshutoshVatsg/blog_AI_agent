const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  addComment,
  getComments,
  editComment,
  deleteComment,
} = require('../controllers/commentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { commentValidation } = require('../utils/validators');

router.get('/', getComments);
router.post('/', authMiddleware, commentValidation, validateRequest, addComment);
router.put('/:commentId', authMiddleware, editComment);
router.delete('/:commentId', authMiddleware, deleteComment);

module.exports = router;
