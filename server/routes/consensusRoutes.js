const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  submitRating,
  getAverages,
  getMyRating,
} = require('../controllers/consensusController');
const { authMiddleware } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { consensusValidation } = require('../utils/validators');

router.get('/', getAverages);
router.post('/', authMiddleware, consensusValidation, validateRequest, submitRating);
router.get('/me', authMiddleware, getMyRating);

module.exports = router;
