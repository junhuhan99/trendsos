const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 인증 미들웨어
exports.auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// 관리자 권한 확인
exports.isAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  }
  next();
};

// 작가 또는 관리자 권한 확인
exports.isAuthorOrAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin' && !req.user.isAuthor) {
    return res.status(403).json({ message: '작가 권한이 필요합니다. 작가 신청을 해주세요.' });
  }
  next();
};
