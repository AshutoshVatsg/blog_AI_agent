const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Claim = require('../models/Claim');
const { recalculatePostCredibility } = require('../services/credibilityService');

// @desc    Platform-wide stats
// @route   GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments({ status: { $ne: 'deleted' } });
    const totalComments = await Comment.countDocuments();
    const totalClaims = await Claim.countDocuments();
    const disputedPosts = await Post.countDocuments({ credibilityBadge: 'disputed' });

    res.json({
      totalUsers,
      totalPosts,
      totalComments,
      totalClaims,
      disputedPosts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List all users with roles
// @route   GET /api/admin/users
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Attach post count to each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const postCount = await Post.countDocuments({
          authorId: user._id,
          status: { $ne: 'deleted' },
        });
        return { ...user, postCount };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
exports.changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'user', 'guest'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Force delete any post
// @route   DELETE /api/admin/posts/:id
exports.forceDeletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.status = 'deleted';
    await post.save();
    res.json({ message: 'Post force-deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Force delete any comment
// @route   DELETE /api/admin/comments/:id
exports.forceDeleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Dismiss any claim
// @route   DELETE /api/admin/claims/:id
exports.dismissClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    const postId = claim.postId;
    await Claim.findByIdAndDelete(req.params.id);
    await recalculatePostCredibility(postId);
    res.json({ message: 'Claim dismissed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
