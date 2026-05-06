const Claim = require('../models/Claim');
const Post = require('../models/Post');
const {
  recalculateClaimStatus,
  recalculatePostCredibility,
} = require('../services/credibilityService');

// @desc    Flag a claim (highlight text)
// @route   POST /api/posts/:postId/claims
exports.flagClaim = async (req, res) => {
  try {
    const { paragraphIndex, claimText, startOffset, endOffset } = req.body;

    const claim = await Claim.create({
      postId: req.params.postId,
      flaggedBy: req.user._id,
      paragraphIndex,
      claimText,
      startOffset,
      endOffset,
    });

    const populated = await Claim.findById(claim._id).populate(
      'flaggedBy',
      'name avatar'
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all claims for a post
// @route   GET /api/posts/:postId/claims
exports.getClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ postId: req.params.postId })
      .populate('flaggedBy', 'name avatar')
      .populate('votes.userId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vote on a claim
// @route   POST /api/posts/:postId/claims/:claimId/vote
exports.voteClaim = async (req, res) => {
  try {
    const { verdict, reason } = req.body;
    const claim = await Claim.findById(req.params.claimId);

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Check if user already voted
    const existingVoteIndex = claim.votes.findIndex(
      (v) => v.userId.toString() === req.user._id.toString()
    );

    if (existingVoteIndex !== -1) {
      // Update existing vote
      claim.votes[existingVoteIndex].verdict = verdict;
      claim.votes[existingVoteIndex].reason = reason || '';
      claim.votes[existingVoteIndex].votedAt = new Date();
    } else {
      // Add new vote
      claim.votes.push({
        userId: req.user._id,
        verdict,
        reason: reason || '',
        votedAt: new Date(),
      });
    }

    // Recalculate claim status
    claim.status = recalculateClaimStatus(claim);
    await claim.save();

    // Recalculate post credibility badge
    await recalculatePostCredibility(req.params.postId);

    const populated = await Claim.findById(claim._id)
      .populate('flaggedBy', 'name avatar')
      .populate('votes.userId', 'name');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Author responds to claim
// @route   PUT /api/posts/:postId/claims/:claimId/respond
exports.respondToClaim = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the post author can respond to claims' });
    }

    const claim = await Claim.findById(req.params.claimId);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.authorResponse = {
      text: req.body.text,
      sourceUrl: req.body.sourceUrl || '',
      respondedAt: new Date(),
    };

    await claim.save();

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin dismisses a claim
// @route   DELETE /api/posts/:postId/claims/:claimId
exports.dismissClaim = async (req, res) => {
  try {
    await Claim.findByIdAndDelete(req.params.claimId);
    await recalculatePostCredibility(req.params.postId);
    res.json({ message: 'Claim dismissed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get overall credibility badge
// @route   GET /api/posts/:postId/credibility
exports.getCredibility = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).select('credibilityBadge');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ credibilityBadge: post.credibilityBadge });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
