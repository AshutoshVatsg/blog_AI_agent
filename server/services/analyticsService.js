const Post = require('../models/Post');
const ConsensusRating = require('../models/ConsensusRating');

/**
 * Run MongoDB aggregation queries to produce analytics data
 * for the AI insights dashboard
 */
const getAuthorAnalytics = async (authorId) => {
  // Get all published posts by this author
  const posts = await Post.find({
    authorId,
    status: 'published',
  }).lean();

  const totalPosts = posts.length;
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

  // Find best performing post
  let bestPerformingPost = null;
  if (posts.length > 0) {
    const best = posts.sort((a, b) => b.views - a.views)[0];
    bestPerformingPost = {
      postId: best._id,
      title: best.title,
      views: best.views,
    };
  }

  // Get consensus averages across all posts
  const postIds = posts.map((p) => p._id);
  const consensusAgg = await ConsensusRating.aggregate([
    { $match: { postId: { $in: postIds } } },
    {
      $group: {
        _id: null,
        avgMindChanging: { $avg: '$mindChanging' },
        avgOriginality: { $avg: '$originality' },
        avgClarity: { $avg: '$clarity' },
      },
    },
  ]);

  const avgConsensus = consensusAgg.length > 0
    ? {
        mindChanging: Math.round(consensusAgg[0].avgMindChanging * 10) / 10,
        originality: Math.round(consensusAgg[0].avgOriginality * 10) / 10,
        clarity: Math.round(consensusAgg[0].avgClarity * 10) / 10,
      }
    : { mindChanging: 0, originality: 0, clarity: 0 };

  // Tone breakdown: group posts by tone → avg views
  const toneBreakdown = {};
  posts.forEach((post) => {
    const tone = post.toneAnalysis?.tone || 'unknown';
    if (!toneBreakdown[tone]) {
      toneBreakdown[tone] = { count: 0, totalViews: 0, avgViews: 0 };
    }
    toneBreakdown[tone].count += 1;
    toneBreakdown[tone].totalViews += post.views || 0;
  });
  Object.keys(toneBreakdown).forEach((key) => {
    toneBreakdown[key].avgViews = Math.round(
      toneBreakdown[key].totalViews / toneBreakdown[key].count
    );
  });

  // Topic breakdown: group posts by topic → avg views
  const topicBreakdown = {};
  posts.forEach((post) => {
    const topic = post.toneAnalysis?.topicCategory || 'unknown';
    if (!topicBreakdown[topic]) {
      topicBreakdown[topic] = { count: 0, totalViews: 0, avgViews: 0 };
    }
    topicBreakdown[topic].count += 1;
    topicBreakdown[topic].totalViews += post.views || 0;
  });
  Object.keys(topicBreakdown).forEach((key) => {
    topicBreakdown[key].avgViews = Math.round(
      topicBreakdown[key].totalViews / topicBreakdown[key].count
    );
  });

  return {
    totalPosts,
    totalViews,
    avgConsensus,
    bestPerformingPost,
    toneBreakdown,
    topicBreakdown,
  };
};

module.exports = { getAuthorAnalytics };
