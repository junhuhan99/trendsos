const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');
const { auth, isAdmin } = require('../middleware/auth');

// 작가 목록 (공개)
router.get('/', authorController.getAuthors);

// 작가 상세 정보 (공개)
router.get('/:id', authorController.getAuthor);

// 작가 신청 (로그인 필요)
router.post('/apply', auth, authorController.applyAuthor);

// 작가 신청 목록 (관리자)
router.get('/admin/pending', auth, isAdmin, authorController.getPendingAuthors);

// 작가 승인/거부 (관리자)
router.post('/admin/approve', auth, isAdmin, authorController.approveAuthor);

// 팔로우/언팔로우
router.post('/:id/follow', auth, authorController.toggleFollow);

// 팔로잉 목록
router.get('/me/following', auth, authorController.getFollowing);

// 팔로워 목록
router.get('/:id/followers', authorController.getFollowers);

module.exports = router;
