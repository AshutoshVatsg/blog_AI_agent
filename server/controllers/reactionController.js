const ParagraphReaction = require('../models/ParagraphReaction');

// @desc    Add emoji reaction to a paragraph
// @route   POST /api/posts/:postId/reactions
exports.addReaction = async (req, res) => {
  try {
    const { paragraphIndex, emoji } = req.body;

    // Upsert: one reaction per user per paragraph
    const reaction = await ParagraphReaction.findOneAndUpdate(
      {
        postId: req.params.postId,
        userId: req.user._id,
        paragraphIndex,
      },
      { emoji },
      { upsert: true, new: true }
    );

    res.json(reaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove own reaction
// @route   DELETE /api/posts/:postId/reactions/:reactionId
exports.removeReaction = async (req, res) => {
  try {
    const reaction = await ParagraphReaction.findById(req.params.reactionId);

    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    if (reaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await ParagraphReaction.findByIdAndDelete(req.params.reactionId);
    res.json({ message: 'Reaction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reactions grouped by paragraph
// @route   GET /api/posts/:postId/reactions
exports.getReactions = async (req, res) => {
  try {
    const reactions = await ParagraphReaction.find({
      postId: req.params.postId,
    })
      .populate('userId', 'name')
      .lean();

    // Group by paragraph index
    const grouped = {};
    reactions.forEach((r) => {
      if (!grouped[r.paragraphIndex]) {
        grouped[r.paragraphIndex] = [];
      }
      grouped[r.paragraphIndex].push(r);
    });

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get heatmap data (aggregated counts per paragraph)
// @route   GET /api/posts/:postId/reactions/heatmap
exports.getHeatmap = async (req, res) => {
  try {
    const heatmap = await ParagraphReaction.aggregate([
      {
        $match: {
          postId: require('mongoose').Types.ObjectId.createFromHexString(req.params.postId),
        },
      },
      {
        $group: {
          _id: {
            paragraphIndex: '$paragraphIndex',
            emoji: '$emoji',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.paragraphIndex',
          totalReactions: { $sum: '$count' },
          emojis: {
            $push: {
              emoji: '$_id.emoji',
              count: '$count',
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(heatmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
