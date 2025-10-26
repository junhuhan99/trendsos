const { Operator } = require('../models');
const bdidChain = require('../blockchain/bdid');
const { sessionManager } = require('../blockchain/smartSession');
const CryptoUtils = require('../utils/crypto');
const jwt = require('jsonwebtoken');

/**
 * 운영자 컨트롤러
 * 웹사이트 운영자 관리
 */

class OperatorController {
  /**
   * 운영자 회원가입
   * POST /api/operator/register
   */
  static async register(req, res) {
    try {
      const { email, password, name, company } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: email, password, name'
        });
      }

      // 이메일 중복 확인
      const existingOperator = Operator.findByEmail(email);
      if (existingOperator) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists'
        });
      }

      // 디바이스 해시
      const deviceHash = CryptoUtils.generateDeviceHash(
        req.headers['user-agent'] || '',
        req.ip || req.connection.remoteAddress
      );

      // 비밀번호 해시 생성
      const { hash: passwordHash, salt, nonce } = CryptoUtils.hashPassword(password);

      // DID 생성 (운영자용)
      const { did, didDocument } = bdidChain.createDID(email, 'blockpass.omega', deviceHash);

      // 운영자 생성
      const operator = Operator.create({
        email,
        passwordHash,
        passwordSalt: salt,
        passwordNonce: nonce,
        did,
        name,
        company: company || ''
      });

      console.log(`[Operator] New operator registered: ${email} (${operator.id})`);

      res.status(201).json({
        success: true,
        message: 'Operator registered successfully',
        data: {
          id: operator.id,
          email: operator.email,
          name: operator.name,
          company: operator.company,
          did,
          didDocument
        }
      });
    } catch (error) {
      console.error('[Operator] Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: error.message
      });
    }
  }

  /**
   * 운영자 로그인
   * POST /api/operator/login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: email, password'
        });
      }

      // 운영자 조회
      const operator = Operator.findByEmail(email);
      if (!operator) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // 비밀번호 검증
      const isValid = CryptoUtils.verifyPassword(
        password,
        operator.passwordHash,
        operator.passwordSalt,
        operator.passwordNonce
      );

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // DID 검증
      const isDIDValid = bdidChain.verifyDID(operator.did);
      if (!isDIDValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid DID'
        });
      }

      // SmartSession 생성
      const smartSession = sessionManager.createSession(
        operator.id,
        operator.did,
        24 * 60 * 60 * 1000 // 24시간
      );

      // JWT 토큰 생성
      const token = jwt.sign(
        {
          operatorId: operator.id,
          email: operator.email,
          did: operator.did,
          sessionContract: smartSession.contractAddress,
          role: 'operator'
        },
        process.env.JWT_SECRET || 'blockpass_omega_secret',
        { expiresIn: '24h' }
      );

      console.log(`[Operator] Login successful: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        data: {
          id: operator.id,
          email: operator.email,
          name: operator.name,
          company: operator.company,
          did: operator.did,
          sessionContract: smartSession.contractAddress
        }
      });
    } catch (error) {
      console.error('[Operator] Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        message: error.message
      });
    }
  }

  /**
   * 운영자 정보 조회
   * GET /api/operator/profile
   */
  static async getProfile(req, res) {
    try {
      const operator = Operator.findById(req.operator.operatorId);

      if (!operator) {
        return res.status(404).json({
          success: false,
          error: 'Operator not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: operator.id,
          email: operator.email,
          name: operator.name,
          company: operator.company,
          did: operator.did,
          createdAt: operator.createdAt,
          isActive: operator.isActive
        }
      });
    } catch (error) {
      console.error('[Operator] Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve profile',
        message: error.message
      });
    }
  }

  /**
   * 운영자 정보 업데이트
   * PUT /api/operator/profile
   */
  static async updateProfile(req, res) {
    try {
      const { name, company } = req.body;

      const operator = Operator.findById(req.operator.operatorId);

      if (!operator) {
        return res.status(404).json({
          success: false,
          error: 'Operator not found'
        });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (company) updateData.company = company;

      operator.update(updateData);

      console.log(`[Operator] Profile updated: ${operator.email}`);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: operator.id,
          email: operator.email,
          name: operator.name,
          company: operator.company
        }
      });
    } catch (error) {
      console.error('[Operator] Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        message: error.message
      });
    }
  }
}

module.exports = OperatorController;
