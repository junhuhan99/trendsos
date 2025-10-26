const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

/**
 * 최종 사용자 인증 라우트
 * BlockPass Ω API
 */

// 회원가입 + DID 자동 생성
router.post('/register', AuthController.register);

// 로그인
router.post('/login', AuthController.login);

// 세션 검증
router.get('/verify', AuthController.verify);

// 로그아웃
router.post('/logout', AuthController.logout);

// 로그 조회
router.get('/logs', authenticateUser, AuthController.getLogs);

module.exports = router;
