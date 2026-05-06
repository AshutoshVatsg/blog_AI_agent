const express = require('express');
const router = express.Router();
const {
  getDashboard,
  listUsers,
  changeRole,
  forceDeletePost,
  forceDeleteComment,
  dismissClaim,
} = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', getDashboard);
router.get('/users', listUsers);
router.put('/users/:id/role', changeRole);
router.delete('/posts/:id', forceDeletePost);
router.delete('/comments/:id', forceDeleteComment);
router.delete('/claims/:id', dismissClaim);

module.exports = router;
