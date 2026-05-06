const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get user profile (public)
// @route   GET /api/users/:id
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update own profile
// @route   PUT /api/users/:id
exports.updateProfile = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const { name, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, bio, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user stats
// @route   GET /api/users/:id/stats
exports.getUserStats = async (req, res) => {
  try {
    const postCount = await Post.countDocuments({
      authorId: req.params.id,
      status: 'published',
    });

    const viewsAgg = await Post.aggregate([
      {
        $match: {
          authorId: require('mongoose').Types.ObjectId.createFromHexString(req.params.id),
          status: 'published',
        },
      },
      { $group: { _id: null, totalViews: { $sum: '$views' } } },
    ]);

    const totalViews = viewsAgg.length > 0 ? viewsAgg[0].totalViews : 0;

    res.json({ postCount, totalViews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List all users (admin only)
// @route   GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
