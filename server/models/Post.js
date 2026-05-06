const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    // Content stored as array of paragraphs — enables paragraph-level reactions and claim scoring
    paragraphs: [
      {
        index: { type: Number, required: true },
        content: { type: String, required: true },
        type: {
          type: String,
          enum: ['text', 'heading', 'code', 'quote'],
          default: 'text',
        },
      },
    ],
    summary: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    tags: [String],
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Basic Metrics
    views: {
      type: Number,
      default: 0,
    },
    // AI Tone Analysis (Feature 4)
    toneAnalysis: {
      tone: { type: String, default: '' },
      topicCategory: { type: String, default: '' },
      vocabularyLevel: { type: String, default: '' },
      avgSentenceLength: { type: Number, default: 0 },
      wordCount: { type: Number, default: 0 },
      analyzedAt: Date,
    },
    // Credibility Badge (Feature 3)
    credibilityBadge: {
      type: String,
      enum: ['verified', 'disputed', 'unverified'],
      default: 'unverified',
    },
    // Status
    status: {
      type: String,
      enum: ['draft', 'published', 'deleted'],
      default: 'draft',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and filtering
postSchema.index({ title: 'text', tags: 'text' });
postSchema.index({ authorId: 1, status: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
