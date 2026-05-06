const mongoose = require('mongoose');

const consensusRatingSchema = new mongoose.Schema(
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
    mindChanging: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    originality: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    clarity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

// One rating per user per post
consensusRatingSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ConsensusRating', consensusRatingSchema);
