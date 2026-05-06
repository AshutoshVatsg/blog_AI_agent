const Post = require('../models/Post');
const AuthorInsight = require('../models/AuthorInsight');
const { analyzePostTone, generateWritingInsights } = require('../services/aiService');
const { getAuthorAnalytics } = require('../services/analyticsService');

// @desc    Trigger tone analysis for a specific post
// @route   POST /api/insights/analyze/:postId
exports.analyzePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const fullContent = post.paragraphs.map((p) => p.content).join(' ');
    const analysis = await analyzePostTone(fullContent);

    post.toneAnalysis = analysis;
    await post.save();

    res.json({ toneAnalysis: analysis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current author's latest insights
// @route   GET /api/insights/my
exports.getMyInsights = async (req, res) => {
  try {
    const insight = await AuthorInsight.findOne({
      authorId: req.user._id,
    }).sort({ generatedAt: -1 });

    if (!insight) {
      return res.json({
        message: 'No insights generated yet. Publish posts and click "Refresh Insights".',
        analytics: null,
        insights: [],
      });
    }

    res.json(insight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Force regenerate insights from post history
// @route   POST /api/insights/generate
exports.generateInsights = async (req, res) => {
  try {
    // Step 1: Aggregate analytics
    const analytics = await getAuthorAnalytics(req.user._id);

    if (analytics.totalPosts === 0) {
      return res.status(400).json({
        message: 'You need at least one published post to generate insights',
      });
    }

    // Step 2: Generate AI suggestions from analytics
    const insights = await generateWritingInsights(analytics);

    // Step 3: Save to AuthorInsight collection
    const authorInsight = await AuthorInsight.create({
      authorId: req.user._id,
      generatedAt: new Date(),
      analytics,
      insights,
    });

    res.json(authorInsight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
