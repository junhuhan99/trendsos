const Article = require('../models/Article');
const Comment = require('../models/Comment');

// 게시글 목록 조회
exports.getArticles = async (req, res) => {
  try {
    const { category, sort, featured, limit = 20, page = 1 } = req.query;

    const query = {};
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { views: -1, likes: -1 };
    } else if (sort === 'recent') {
      sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const articles = await Article.find(query)
      .populate('author', 'name email bio avatar')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip);

    // 댓글 수 추가
    const articlesWithComments = await Promise.all(
      articles.map(async (article) => {
        const commentCount = await Comment.countDocuments({ article: article._id });
        return {
          ...article.toObject(),
          commentCount,
        };
      })
    );

    const total = await Article.countDocuments(query);

    res.json({
      articles: articlesWithComments,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ message: '게시글을 불러올 수 없습니다.' });
  }
};

// 게시글 상세 조회
exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name email bio avatar');

    if (!article) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 조회수 증가
    await article.incrementViews();

    res.json(article);
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ message: '게시글을 불러올 수 없습니다.' });
  }
};

// 게시글 작성
exports.createArticle = async (req, res) => {
  try {
    const { title, content, summary, category, thumbnail, featured } = req.body;

    const article = new Article({
      title,
      content,
      summary,
      category,
      thumbnail,
      featured: featured || false,
      author: req.user._id,
    });

    await article.save();

    const populatedArticle = await Article.findById(article._id)
      .populate('author', 'name email bio avatar');

    res.status(201).json({
      message: '게시글이 작성되었습니다.',
      article: populatedArticle,
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ message: '게시글 작성에 실패했습니다.' });
  }
};

// 게시글 수정
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 관리자이거나 작성자인 경우에만 수정 가능
    if (req.user.role !== 'admin' && article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    const { title, content, summary, category, thumbnail, featured } = req.body;

    article.title = title || article.title;
    article.content = content || article.content;
    article.summary = summary || article.summary;
    article.category = category || article.category;
    article.thumbnail = thumbnail !== undefined ? thumbnail : article.thumbnail;
    article.featured = featured !== undefined ? featured : article.featured;

    await article.save();

    const populatedArticle = await Article.findById(article._id)
      .populate('author', 'name email bio avatar');

    res.json({
      message: '게시글이 수정되었습니다.',
      article: populatedArticle,
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ message: '게시글 수정에 실패했습니다.' });
  }
};

// 게시글 삭제
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    // 관리자이거나 작성자인 경우에만 삭제 가능
    if (req.user.role !== 'admin' && article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    await Article.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ article: req.params.id });

    res.json({ message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ message: '게시글 삭제에 실패했습니다.' });
  }
};

// 게시글 좋아요
exports.likeArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const userId = req.user._id;
    const hasLiked = article.likedBy.includes(userId);

    if (hasLiked) {
      // 좋아요 취소
      article.likedBy = article.likedBy.filter(id => id.toString() !== userId.toString());
      article.likes -= 1;
    } else {
      // 좋아요 추가
      article.likedBy.push(userId);
      article.likes += 1;
    }

    await article.save();

    res.json({
      message: hasLiked ? '좋아요가 취소되었습니다.' : '좋아요를 눌렀습니다.',
      likes: article.likes,
      hasLiked: !hasLiked,
    });
  } catch (error) {
    console.error('Like article error:', error);
    res.status(500).json({ message: '좋아요 처리에 실패했습니다.' });
  }
};

// 게시글 북마크
exports.bookmarkArticle = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const articleId = req.params.id;

    const hasBookmarked = user.bookmarks.includes(articleId);

    if (hasBookmarked) {
      // 북마크 취소
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== articleId);
    } else {
      // 북마크 추가
      user.bookmarks.push(articleId);
    }

    await user.save();

    res.json({
      message: hasBookmarked ? '북마크가 취소되었습니다.' : '북마크에 추가되었습니다.',
      hasBookmarked: !hasBookmarked,
    });
  } catch (error) {
    console.error('Bookmark article error:', error);
    res.status(500).json({ message: '북마크 처리에 실패했습니다.' });
  }
};
