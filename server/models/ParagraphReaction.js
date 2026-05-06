const mongoose = require('mongoose');

const paragraphReactionSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paragraphIndex: {
      type: Number,
      required: true,
    },
    emoji: {
      type: String,
      enum: ['👍', '❤️', '😂', '😮', '😢'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Aggregate reactions by paragraph
paragraphReactionSchema.index({ postId: 1, paragraphIndex: 1 });
// One reaction per paragraph per user
paragraphReactionSchema.index(
  { postId: 1, userId: 1, paragraphIndex: 1 },
  { unique: true }
);

module.exports = mongoose.model('ParagraphReaction', paragraphReactionSchema);
