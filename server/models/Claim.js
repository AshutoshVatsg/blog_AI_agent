const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paragraphIndex: {
      type: Number,
      required: true,
    },
    claimText: {
      type: String,
      required: true,
    },
    startOffset: {
      type: Number,
      required: true,
    },
    endOffset: {
      type: Number,
      required: true,
    },
    // Community voting
    votes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        verdict: {
          type: String,
          enum: ['verified', 'misleading', 'needs_source'],
          required: true,
        },
        reason: String,
        votedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Author can respond to the claim
    authorResponse: {
      text: String,
      sourceUrl: String,
      respondedAt: Date,
    },
    // Computed status from votes
    status: {
      type: String,
      enum: ['verified', 'misleading', 'needs_source', 'pending'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

claimSchema.index({ postId: 1 });

module.exports = mongoose.model('Claim', claimSchema);
