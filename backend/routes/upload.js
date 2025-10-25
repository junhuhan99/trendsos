const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../config/upload');
const { auth } = require('../middleware/auth');

// 단일 이미지 업로드 (인증 필요)
router.post('/image', auth, upload.single('image'), uploadController.uploadImage);

// 다중 이미지 업로드 (인증 필요, 최대 10개)
router.post('/images', auth, upload.array('images', 10), uploadController.uploadImages);

module.exports = router;
