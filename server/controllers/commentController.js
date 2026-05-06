const Comment = require('../models/Comment');

// @desc    Add comment to post
// @route   POST /api/posts/:postId/comments
exports.addComment = async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;

    const comment = await Comment.create({
      postId: req.params.postId,
      userId: req.user._id,
      content,
      parentCommentId: parentCommentId || null,
    });

    const populated = await Comment.findById(comment._id).populate(
      'userId',
      'name avatar'
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all comments for a post
// @route   GET /api/posts/:postId/comments
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: 1 })
      .lean();

    // Build nested comment tree
    const commentMap = {};
    const rootComments = [];

    comments.forEach((comment) => {
      comment.replies = [];
      commentMap[comment._id] = comment;
    });

    comments.forEach((comment) => {
      if (comment.parentCommentId) {
        const parent = commentMap[comment.parentCommentId];
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    res.json(rootComments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit own comment
// @route   PUT /api/posts/:postId/comments/:commentId
exports.editComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own comments' });
    }

    comment.content = req.body.content;
    await comment.save();

    const populated = await Comment.findById(comment._id).populate(
      'userId',
      'name avatar'
    );

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment (author or admin)
// @route   DELETE /api/posts/:postId/comments/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isOwner = comment.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete this comment and all its replies
    await Comment.deleteMany({
      $or: [
        { _id: req.params.commentId },
        { parentCommentId: req.params.commentId },
      ],
    });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
