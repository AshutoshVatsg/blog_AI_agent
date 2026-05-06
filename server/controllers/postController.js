const Post = require('../models/Post');
const { analyzePostTone } = require('../services/aiService');

// @desc    Create new post
// @route   POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const { title, paragraphs, summary, coverImage, tags, status, isAnonymous } = req.body;

    // Index paragraphs if not already indexed
    const indexedParagraphs = paragraphs.map((p, i) => ({
      index: p.index !== undefined ? p.index : i,
      content: p.content,
      type: p.type || 'text',
    }));

    const post = await Post.create({
      title,
      paragraphs: indexedParagraphs,
      summary: summary || '',
      coverImage: coverImage || '',
      tags: tags || [],
      authorId: req.user._id,
      status: status || 'published',
      isAnonymous: isAnonymous || false,
    });

    // Trigger tone analysis asynchronously
    if (post.status === 'published') {
      const fullContent = indexedParagraphs.map((p) => p.content).join(' ');
      analyzePostTone(fullContent)
        .then((analysis) => {
          Post.findByIdAndUpdate(post._id, { toneAnalysis: analysis }).exec();
        })
        .catch((err) => console.error('Tone analysis error:', err.message));
    }

    const populatedPost = await Post.findById(post._id).populate('authorId', 'name avatar');
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all published posts (paginated)
// @route   GET /api/posts
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { status: 'published' };

    // Tag filter
    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate('authorId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      posts,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single post + increment view
// @route   GET /api/posts/:id
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'authorId',
      'name avatar bio'
    );

    if (!post || post.status === 'deleted') {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update post (author only)
// @route   PUT /api/posts/:id
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the author can edit this post' });
    }

    const { title, paragraphs, summary, coverImage, tags, status, isAnonymous } = req.body;

    if (title) post.title = title;
    if (paragraphs) {
      post.paragraphs = paragraphs.map((p, i) => ({
        index: p.index !== undefined ? p.index : i,
        content: p.content,
        type: p.type || 'text',
      }));
    }
    if (summary !== undefined) post.summary = summary;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (tags) post.tags = tags;
    if (status) post.status = status;
    if (isAnonymous !== undefined) post.isAnonymous = isAnonymous;

    const updated = await post.save();
    const populatedPost = await Post.findById(updated._id).populate('authorId', 'name avatar');

    // Re-analyze tone if content changed
    if (paragraphs && post.status === 'published') {
      const fullContent = post.paragraphs.map((p) => p.content).join(' ');
      analyzePostTone(fullContent)
        .then((analysis) => {
          Post.findByIdAndUpdate(post._id, { toneAnalysis: analysis }).exec();
        })
        .catch((err) => console.error('Tone re-analysis error:', err.message));
    }

    res.json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Soft delete post (author or admin)
// @route   DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isAuthor = post.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    post.status = 'deleted';
    await post.save();

    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's posts
// @route   GET /api/posts/my
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      authorId: req.user._id,
      status: { $ne: 'deleted' },
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search posts by keyword or tag
// @route   GET /api/posts/search?q=&tag=
exports.searchPosts = async (req, res) => {
  try {
    const { q, tag } = req.query;
    const filter = { status: 'published' };

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { 'paragraphs.content': { $regex: q, $options: 'i' } },
      ];
    }

    if (tag) {
      filter.tags = tag;
    }

    const posts = await Post.find(filter)
      .populate('authorId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trending posts (sorted by views + consensus)
// @route   GET /api/posts/trending
exports.getTrendingPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('authorId', 'name avatar')
      .sort({ views: -1 })
      .limit(6)
      .lean();

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
