const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  getUserStats,
  deleteUser,
  getAllUsers,
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.get('/:id', getUserProfile);
router.put('/:id', authMiddleware, updateProfile);
router.get('/:id/stats', getUserStats);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
