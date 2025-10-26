const jwt = require('jsonwebtoken');

/**
 * JWT 인증 미들웨어
 */

const authenticateOperator = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'blockpass_omega_secret');

    if (decoded.role !== 'operator') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Operator role required'
      });
    }

    req.operator = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: error.message
    });
  }
};

const authenticateUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'blockpass_omega_secret');

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: error.message
    });
  }
};

module.exports = {
  authenticateOperator,
  authenticateUser
};
