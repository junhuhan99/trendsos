const Comment = require('../models/Comment');
const Article = require('../models/Article');

// 댓글 조회
exports.getComments = async (req, res) => {
  try {
    const { articleId } = req.params;

    const comments = await Comment.find({ article: articleId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: '댓글을 불러올 수 없습니다.' });
  }
};

// 댓글 작성
exports.createComment = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { content } = req.body;

    // 게시글 존재 확인
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const comment = new Comment({
      content,
      article: articleId,
      author: req.user._id,
    });

    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email avatar');

    res.status(201).json({
      message: '댓글이 작성되었습니다.',
      comment: populatedComment,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: '댓글 작성에 실패했습니다.' });
  }
};

// 댓글 삭제
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    // 관리자이거나 작성자인 경우에만 삭제 가능
    if (req.user.role !== 'admin' && comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: '댓글 삭제에 실패했습니다.' });
  }
};
