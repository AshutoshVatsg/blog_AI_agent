const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  flagClaim,
  getClaims,
  voteClaim,
  respondToClaim,
  dismissClaim,
  getCredibility,
} = require('../controllers/claimController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { claimValidation, claimVoteValidation } = require('../utils/validators');

router.get('/', getClaims);
router.post('/', authMiddleware, claimValidation, validateRequest, flagClaim);
router.post('/:claimId/vote', authMiddleware, claimVoteValidation, validateRequest, voteClaim);
router.put('/:claimId/respond', authMiddleware, respondToClaim);
router.delete('/:claimId', authMiddleware, adminMiddleware, dismissClaim);

// Credibility badge endpoint
router.get('/credibility', getCredibility);

module.exports = router;
