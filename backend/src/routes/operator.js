const express = require('express');
const router = express.Router();
const OperatorController = require('../controllers/operatorController');
const { authenticateOperator } = require('../middleware/auth');

/**
 * 운영자 라우트
 */

// 운영자 회원가입
router.post('/register', OperatorController.register);

// 운영자 로그인
router.post('/login', OperatorController.login);

// 프로필 조회 (인증 필요)
router.get('/profile', authenticateOperator, OperatorController.getProfile);

// 프로필 업데이트 (인증 필요)
router.put('/profile', authenticateOperator, OperatorController.updateProfile);

module.exports = router;
