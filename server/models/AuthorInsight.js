const mongoose = require('mongoose');

const authorInsightSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    // Raw analytics snapshot
    analytics: {
      totalPosts: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
      avgConsensus: {
        mindChanging: { type: Number, default: 0 },
        originality: { type: Number, default: 0 },
        clarity: { type: Number, default: 0 },
      },
      bestPerformingPost: {
        postId: mongoose.Schema.Types.ObjectId,
        title: String,
        views: Number,
      },
      toneBreakdown: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
      topicBreakdown: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    // AI-generated suggestions
    insights: [
      {
        type: {
          type: String,
          enum: ['tone', 'topic', 'length', 'frequency', 'engagement'],
        },
        observation: String,
        suggestion: String,
        confidence: {
          type: String,
          enum: ['high', 'medium', 'low'],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

authorInsightSchema.index({ authorId: 1, generatedAt: -1 });

module.exports = mongoose.model('AuthorInsight', authorInsightSchema);
