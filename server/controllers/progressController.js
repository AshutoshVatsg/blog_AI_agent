const ReadingProgress = require('../models/ReadingProgress');

// @desc    Save reading progress
// @route   POST /api/progress/:postId
exports.saveProgress = async (req, res) => {
  try {
    const { lastParagraphIndex, completed } = req.body;

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId: req.user._id, postId: req.params.postId },
      {
        lastParagraphIndex,
        completed: completed || false,
      },
      { upsert: true, new: true }
    );

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reading progress for a post
// @route   GET /api/progress/:postId
exports.getProgress = async (req, res) => {
  try {
    const progress = await ReadingProgress.findOne({
      userId: req.user._id,
      postId: req.params.postId,
    });

    res.json(progress || { lastParagraphIndex: 0, completed: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
