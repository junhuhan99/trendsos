const crypto = require('crypto');

/**
 * SmartSessionContract (SSC)
 * 세션 자체를 블록체인 자산으로 관리
 */

class SmartSessionContract {
  constructor(userId, did, expiresIn = 24 * 60 * 60 * 1000) {
    this.contractAddress = this.generateContractAddress();
    this.userId = userId;
    this.did = did;
    this.sessionHash = this.generateSessionHash();
    this.createdAt = Date.now();
    this.expiresAt = this.createdAt + expiresIn;
    this.isValid = true;
    this.accessCount = 0;
    this.lastAccessedAt = this.createdAt;
  }

  /**
   * 세션 검증
   */
  validate() {
    const now = Date.now();

    if (!this.isValid) {
      return { valid: false, reason: 'Session invalidated' };
    }

    if (now > this.expiresAt) {
      this.invalidate('expired');
      return { valid: false, reason: 'Session expired' };
    }

    // 세션 접근 기록
    this.accessCount++;
    this.lastAccessedAt = now;

    return { valid: true };
  }

  /**
   * 세션 무효화
   */
  invalidate(reason = 'logout') {
    this.isValid = false;
    this.invalidatedAt = Date.now();
    this.invalidationReason = reason;

    console.log(`[SmartSession] Session invalidated: ${this.contractAddress} (${reason})`);

    return {
      success: true,
      contractAddress: this.contractAddress,
      reason
    };
  }

  /**
   * 세션 연장
   */
  extend(additionalTime = 24 * 60 * 60 * 1000) {
    if (!this.isValid) {
      return { success: false, reason: 'Session already invalidated' };
    }

    this.expiresAt += additionalTime;

    console.log(`[SmartSession] Session extended: ${this.contractAddress}`);

    return {
      success: true,
      newExpiresAt: this.expiresAt
    };
  }

  /**
   * 세션 정보 조회
   */
  getInfo() {
    return {
      contractAddress: this.contractAddress,
      userId: this.userId,
      did: this.did,
      sessionHash: this.sessionHash,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      isValid: this.isValid,
      accessCount: this.accessCount,
      lastAccessedAt: this.lastAccessedAt,
      invalidatedAt: this.invalidatedAt,
      invalidationReason: this.invalidationReason
    };
  }

  /**
   * 컨트랙트 주소 생성
   */
  generateContractAddress() {
    return '0xSs' + crypto.randomBytes(18).toString('hex');
  }

  /**
   * 세션 해시 생성
   */
  generateSessionHash() {
    const data = `${this.userId}:${this.did}:${this.createdAt}:${crypto.randomBytes(16).toString('hex')}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Solidity 스타일 컨트랙트 표현
   */
  toSolidityFormat() {
    return {
      contract: 'SmartSession',
      address: this.contractAddress,
      user: this.userId,
      sessionHash: `0x${this.sessionHash}`,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      isValid: this.isValid
    };
  }
}

/**
 * SmartSession Manager
 * 모든 세션 컨트랙트 관리
 */

class SmartSessionManager {
  constructor() {
    this.sessions = new Map(); // contractAddress => SmartSessionContract
    this.userSessions = new Map(); // userId => Set<contractAddress>
  }

  /**
   * 새로운 세션 컨트랙트 생성
   */
  createSession(userId, did, expiresIn) {
    const session = new SmartSessionContract(userId, did, expiresIn);

    this.sessions.set(session.contractAddress, session);

    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, new Set());
    }
    this.userSessions.get(userId).add(session.contractAddress);

    console.log(`[SmartSession Manager] New session created: ${session.contractAddress} for user: ${userId}`);

    return session;
  }

  /**
   * 세션 조회
   */
  getSession(contractAddress) {
    return this.sessions.get(contractAddress);
  }

  /**
   * 세션 검증
   */
  validateSession(contractAddress) {
    const session = this.sessions.get(contractAddress);

    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    return session.validate();
  }

  /**
   * 세션 무효화
   */
  invalidateSession(contractAddress, reason) {
    const session = this.sessions.get(contractAddress);

    if (!session) {
      return { success: false, reason: 'Session not found' };
    }

    return session.invalidate(reason);
  }

  /**
   * 사용자의 모든 세션 무효화
   */
  invalidateAllUserSessions(userId, reason = 'logout_all') {
    const contractAddresses = this.userSessions.get(userId);

    if (!contractAddresses) {
      return { success: true, count: 0 };
    }

    let count = 0;
    for (const address of contractAddresses) {
      const session = this.sessions.get(address);
      if (session && session.isValid) {
        session.invalidate(reason);
        count++;
      }
    }

    console.log(`[SmartSession Manager] Invalidated ${count} sessions for user: ${userId}`);

    return { success: true, count };
  }

  /**
   * 사용자의 활성 세션 조회
   */
  getUserActiveSessions(userId) {
    const contractAddresses = this.userSessions.get(userId);

    if (!contractAddresses) {
      return [];
    }

    const activeSessions = [];
    for (const address of contractAddresses) {
      const session = this.sessions.get(address);
      if (session && session.isValid && Date.now() <= session.expiresAt) {
        activeSessions.push(session.getInfo());
      }
    }

    return activeSessions;
  }

  /**
   * 만료된 세션 자동 정리
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [address, session] of this.sessions) {
      if (session.isValid && now > session.expiresAt) {
        session.invalidate('expired');
        cleanedCount++;
      }
    }

    console.log(`[SmartSession Manager] Cleaned up ${cleanedCount} expired sessions`);

    return cleanedCount;
  }

  /**
   * 세션 통계
   */
  getStats() {
    let validCount = 0;
    let invalidCount = 0;
    let expiredCount = 0;
    const now = Date.now();

    for (const [address, session] of this.sessions) {
      if (session.isValid) {
        if (now > session.expiresAt) {
          expiredCount++;
        } else {
          validCount++;
        }
      } else {
        invalidCount++;
      }
    }

    return {
      total: this.sessions.size,
      valid: validCount,
      invalid: invalidCount,
      expired: expiredCount,
      totalUsers: this.userSessions.size
    };
  }
}

// Singleton instance
const sessionManager = new SmartSessionManager();

// 자동 정리 작업 (5분마다)
setInterval(() => {
  sessionManager.cleanupExpiredSessions();
}, 5 * 60 * 1000);

module.exports = {
  SmartSessionContract,
  sessionManager
};
