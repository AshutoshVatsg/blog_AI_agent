const ConsensusRating = require('../models/ConsensusRating');

// @desc    Submit or update consensus rating
// @route   POST /api/posts/:postId/consensus
exports.submitRating = async (req, res) => {
  try {
    const { mindChanging, originality, clarity } = req.body;

    // Upsert: create or update the user's rating for this post
    const rating = await ConsensusRating.findOneAndUpdate(
      { postId: req.params.postId, userId: req.user._id },
      { mindChanging, originality, clarity },
      { upsert: true, new: true, runValidators: true }
    );

    res.json(rating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get community averages for a post
// @route   GET /api/posts/:postId/consensus
exports.getAverages = async (req, res) => {
  try {
    const result = await ConsensusRating.aggregate([
      {
        $match: {
          postId: require('mongoose').Types.ObjectId.createFromHexString(req.params.postId),
        },
      },
      {
        $group: {
          _id: null,
          avgMindChanging: { $avg: '$mindChanging' },
          avgOriginality: { $avg: '$originality' },
          avgClarity: { $avg: '$clarity' },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return res.json({
        avgMindChanging: 0,
        avgOriginality: 0,
        avgClarity: 0,
        totalRatings: 0,
      });
    }

    res.json({
      avgMindChanging: Math.round(result[0].avgMindChanging * 10) / 10,
      avgOriginality: Math.round(result[0].avgOriginality * 10) / 10,
      avgClarity: Math.round(result[0].avgClarity * 10) / 10,
      totalRatings: result[0].totalRatings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's rating for a post
// @route   GET /api/posts/:postId/consensus/me
exports.getMyRating = async (req, res) => {
  try {
    const rating = await ConsensusRating.findOne({
      postId: req.params.postId,
      userId: req.user._id,
    });

    res.json(rating || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
