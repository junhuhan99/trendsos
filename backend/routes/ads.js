const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const { auth, isAdmin } = require('../middleware/auth');

// 공개 라우트
router.get('/active', adController.getActiveAds);
router.post('/:id/impression', adController.incrementImpressions);
router.post('/:id/click', adController.incrementClicks);

// 인증 필요 라우트
router.get('/my', auth, adController.getMyAds);
router.post('/', auth, adController.createAd);
router.put('/:id', auth, adController.updateAd);
router.delete('/:id', auth, adController.deleteAd);

// 관리자 전용 라우트
router.get('/admin/all', auth, isAdmin, adController.getAllAds);
router.post('/:id/approve', auth, isAdmin, adController.approveAd);

module.exports = router;
