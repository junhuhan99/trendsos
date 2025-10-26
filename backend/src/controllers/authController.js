const { EndUser, Service } = require('../models');
const bdidChain = require('../blockchain/bdid');
const fabricChain = require('../blockchain/fabric');
const ethereumLayer = require('../blockchain/ethereum');
const ipfsLayer = require('../blockchain/ipfs');
const { sessionManager } = require('../blockchain/smartSession');
const CryptoUtils = require('../utils/crypto');
const jwt = require('jsonwebtoken');

/**
 * 최종 사용자 인증 컨트롤러
 * BlockPass Ω 인증 프로토콜 구현
 */

class AuthController {
  /**
   * 회원가입 + DID 자동 생성
   * POST /api/auth/register
   */
  static async register(req, res) {
    try {
      const { userId, password, apiKey } = req.body;

      if (!userId || !password || !apiKey) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, password, apiKey'
        });
      }

      // API 키로 서비스 조회
      const service = Service.findByApiKey(apiKey);
      if (!service || !service.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or inactive API key'
        });
      }

      // 이미 등록된 사용자 확인
      const existingUser = EndUser.findByServiceAndUserId(service.id, userId);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User already exists'
        });
      }

      // 디바이스 해시 생성
      const deviceHash = CryptoUtils.generateDeviceHash(
        req.headers['user-agent'] || '',
        req.ip || req.connection.remoteAddress
      );

      // Step 1: 비밀번호 해시 생성 (SHA3-512 + Salt + Nonce)
      const { hash: passwordHash, salt, nonce } = CryptoUtils.hashPassword(password);

      // Step 2: DID 자동 생성
      const { did, didDocument } = bdidChain.createDID(userId, service.url, deviceHash);

      // Step 3: Fabric Chain에 등록
      const fabricResult = await fabricChain.registerUser(userId, passwordHash, did, deviceHash);

      // Step 4: 사용자 데이터 저장
      const user = EndUser.create({
        serviceId: service.id,
        userId,
        did,
        passwordHash,
        passwordSalt: salt,
        passwordNonce: nonce,
        deviceHash
      });

      // Step 5: 로그 저장 (IPFS)
      const logData = {
        type: 'REGISTER',
        userId,
        did,
        serviceId: service.id,
        serviceName: service.name,
        timestamp: Date.now(),
        deviceHash,
        txId: fabricResult.txId
      };

      const ipfsResult = await ipfsLayer.storeLog(logData);

      console.log(`[Auth] User registered: ${userId} with DID: ${did}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          userId,
          did,
          didDocument,
          txId: fabricResult.txId,
          ipfsHash: ipfsResult.ipfsHash,
          arweaveHash: ipfsResult.arweaveHash
        }
      });
    } catch (error) {
      console.error('[Auth] Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: error.message
      });
    }
  }

  /**
   * 로그인
   * POST /api/auth/login
   */
  static async login(req, res) {
    try {
      const { userId, password, apiKey } = req.body;

      if (!userId || !password || !apiKey) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, password, apiKey'
        });
      }

      // API 키로 서비스 조회
      const service = Service.findByApiKey(apiKey);
      if (!service || !service.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or inactive API key'
        });
      }

      // 사용량 체크
      if (service.currentUsage >= service.usageLimit) {
        return res.status(429).json({
          success: false,
          error: 'Usage limit exceeded'
        });
      }

      // 사용자 조회
      const user = EndUser.findByServiceAndUserId(service.id, userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // 디바이스 해시
      const deviceHash = CryptoUtils.generateDeviceHash(
        req.headers['user-agent'] || '',
        req.ip || req.connection.remoteAddress
      );

      // Step 1: 비밀번호 해시 생성
      const { hash: passwordHash } = CryptoUtils.hashPassword(
        password,
        user.passwordSalt,
        user.passwordNonce
      );

      // Step 2: DID 검증
      const isDIDValid = bdidChain.verifyDID(user.did);
      if (!isDIDValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid DID'
        });
      }

      // Step 3: Fabric Chain 인증
      const fabricResult = await fabricChain.authenticateUser(
        userId,
        passwordHash,
        user.did,
        deviceHash
      );

      if (!fabricResult.success) {
        // 로그인 실패 로그 저장
        const logData = {
          type: 'LOGIN_FAILED',
          userId,
          did: user.did,
          serviceId: service.id,
          timestamp: Date.now(),
          reason: fabricResult.error,
          attempts: fabricResult.attempts
        };

        await ipfsLayer.storeLog(logData);

        return res.status(401).json({
          success: false,
          error: fabricResult.error,
          attempts: fabricResult.attempts
        });
      }

      // Step 4: Ethereum에 AuthReceipt 기록
      const ethereumResult = await ethereumLayer.recordAuthReceipt(fabricResult.authReceipt);

      // Step 5: SmartSession 생성
      const smartSession = sessionManager.createSession(
        userId,
        user.did,
        24 * 60 * 60 * 1000 // 24시간
      );

      // Step 6: JWT 토큰 생성
      const token = jwt.sign(
        {
          userId,
          did: user.did,
          serviceId: service.id,
          sessionContract: smartSession.contractAddress
        },
        process.env.JWT_SECRET || 'blockpass_omega_secret',
        { expiresIn: '24h' }
      );

      // Step 7: 사용자 정보 업데이트
      user.incrementLoginCount();

      // Step 8: 서비스 사용량 증가
      service.incrementUsage();

      // Step 9: 로그인 성공 로그 저장
      const logData = {
        type: 'LOGIN_SUCCESS',
        userId,
        did: user.did,
        serviceId: service.id,
        serviceName: service.name,
        timestamp: Date.now(),
        deviceHash,
        txId: fabricResult.txId,
        ethereumTxHash: ethereumResult.txHash,
        sessionContract: smartSession.contractAddress
      };

      const ipfsResult = await ipfsLayer.storeLog(logData);

      console.log(`[Auth] Login successful: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        txHash: ethereumResult.txHash,
        sessionContract: smartSession.contractAddress,
        data: {
          userId,
          did: user.did,
          sessionInfo: smartSession.getInfo()
        }
      });
    } catch (error) {
      console.error('[Auth] Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        message: error.message
      });
    }
  }

  /**
   * 세션 검증
   * GET /api/auth/verify
   */
  static async verify(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      // JWT 검증
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'blockpass_omega_secret');

      // SmartSession 검증
      const validation = sessionManager.validateSession(decoded.sessionContract);

      if (!validation.valid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid session',
          reason: validation.reason
        });
      }

      // DID 검증
      const isDIDValid = bdidChain.verifyDID(decoded.did);

      res.status(200).json({
        success: true,
        valid: true,
        data: {
          userId: decoded.userId,
          did: decoded.did,
          sessionValid: validation.valid,
          didValid: isDIDValid
        }
      });
    } catch (error) {
      console.error('[Auth] Verification error:', error);
      res.status(401).json({
        success: false,
        valid: false,
        error: 'Token verification failed',
        message: error.message
      });
    }
  }

  /**
   * 로그아웃
   * POST /api/auth/logout
   */
  static async logout(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'blockpass_omega_secret');

      // SmartSession 무효화
      const result = sessionManager.invalidateSession(decoded.sessionContract, 'logout');

      // 로그아웃 로그 저장
      const logData = {
        type: 'LOGOUT',
        userId: decoded.userId,
        did: decoded.did,
        serviceId: decoded.serviceId,
        timestamp: Date.now(),
        sessionContract: decoded.sessionContract
      };

      await ipfsLayer.storeLog(logData);

      console.log(`[Auth] Logout: ${decoded.userId}`);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
        message: error.message
      });
    }
  }

  /**
   * 로그 조회
   * GET /api/auth/logs
   */
  static async getLogs(req, res) {
    try {
      const { apiKey } = req.query;
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token || !apiKey) {
        return res.status(401).json({
          success: false,
          error: 'Missing token or API key'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'blockpass_omega_secret');

      // 사용자 로그 조회
      const logs = await ipfsLayer.getUserLogs(decoded.userId, 50);

      res.status(200).json({
        success: true,
        count: logs.length,
        logs
      });
    } catch (error) {
      console.error('[Auth] Get logs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve logs',
        message: error.message
      });
    }
  }
}

module.exports = AuthController;
