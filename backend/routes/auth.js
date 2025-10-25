const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// 회원가입
router.post('/register', authController.register);

// 로그인
router.post('/login', authController.login);

// 현재 사용자 정보
router.get('/me', auth, authController.me);

module.exports = router;
