const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/serviceController');
const { authenticateOperator } = require('../middleware/auth');

/**
 * 서비스 관리 라우트
 */

// 모든 라우트는 운영자 인증 필요
router.use(authenticateOperator);

// 서비스 등록
router.post('/register', ServiceController.registerService);

// 서비스 목록 조회
router.get('/list', ServiceController.getServices);

// 서비스 상세 조회
router.get('/:id', ServiceController.getService);

// 서비스 업데이트
router.put('/:id', ServiceController.updateService);

// API 키 재생성
router.post('/:id/regenerate-key', ServiceController.regenerateApiKey);

// 서비스 사용량 통계
router.get('/:id/stats', ServiceController.getServiceStats);

// 서비스 삭제
router.delete('/:id', ServiceController.deleteService);

module.exports = router;
