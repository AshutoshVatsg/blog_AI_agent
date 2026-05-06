const Claim = require('../models/Claim');
const Post = require('../models/Post');

/**
 * Recalculate the credibility status for a single claim based on votes
 */
const recalculateClaimStatus = (claim) => {
  if (!claim.votes || claim.votes.length === 0) {
    return 'pending';
  }

  const totalVotes = claim.votes.length;
  const verifiedCount = claim.votes.filter((v) => v.verdict === 'verified').length;
  const misleadingCount = claim.votes.filter((v) => v.verdict === 'misleading').length;

  const verifiedPercent = (verifiedCount / totalVotes) * 100;
  const misleadingPercent = (misleadingCount / totalVotes) * 100;

  if (verifiedPercent > 70) return 'verified';
  if (misleadingPercent > 30) return 'misleading';
  return 'needs_source';
};

/**
 * Recalculate the overall credibility badge for a post
 * based on all its claims
 */
const recalculatePostCredibility = async (postId) => {
  const claims = await Claim.find({ postId });

  if (claims.length === 0) {
    await Post.findByIdAndUpdate(postId, { credibilityBadge: 'unverified' });
    return 'unverified';
  }

  const hasMisleading = claims.some((c) => c.status === 'misleading');
  const allVerified = claims.every((c) => c.status === 'verified');

  let badge = 'unverified';
  if (hasMisleading) badge = 'disputed';
  else if (allVerified) badge = 'verified';

  await Post.findByIdAndUpdate(postId, { credibilityBadge: badge });
  return badge;
};

module.exports = { recalculateClaimStatus, recalculatePostCredibility };
