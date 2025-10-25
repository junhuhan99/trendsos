const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const commentController = require('../controllers/commentController');
const { auth, isAdmin, isAuthorOrAdmin } = require('../middleware/auth');

// 게시글 목록 조회 (공개)
router.get('/', articleController.getArticles);

// 게시글 상세 조회 (공개)
router.get('/:id', articleController.getArticle);

// 게시글 작성 (작가 또는 관리자)
router.post('/', auth, isAuthorOrAdmin, articleController.createArticle);

// 게시글 수정 (관리자 또는 작성자)
router.put('/:id', auth, articleController.updateArticle);

// 게시글 삭제 (관리자 또는 작성자)
router.delete('/:id', auth, articleController.deleteArticle);

// 게시글 좋아요
router.post('/:id/like', auth, articleController.likeArticle);

// 게시글 북마크
router.post('/:id/bookmark', auth, articleController.bookmarkArticle);

// 댓글 조회 (공개)
router.get('/:articleId/comments', commentController.getComments);

// 댓글 작성 (로그인 필요)
router.post('/:articleId/comments', auth, commentController.createComment);

// 댓글 삭제 (관리자 또는 작성자)
router.delete('/:articleId/comments/:commentId', auth, commentController.deleteComment);

module.exports = router;
