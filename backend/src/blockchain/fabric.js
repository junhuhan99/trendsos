const crypto = require('crypto');

/**
 * Fabric Private Chain Simulator
 * Auth Contract - 로그인 해시 비교 및 세션 생성
 */

class FabricAuthChain {
  constructor() {
    this.authLedger = new Map(); // 사용자 인증 데이터 저장
    this.transactions = []; // 트랜잭션 기록
  }

  /**
   * 사용자 등록 (비밀번호 해시 저장)
   */
  async registerUser(userId, passwordHash, did, deviceHash) {
    const timestamp = Date.now();
    const txId = this.generateTxId();

    const userData = {
      userId,
      passwordHash,
      did,
      deviceHash,
      registeredAt: timestamp,
      lastLogin: null,
      loginAttempts: 0,
      isLocked: false
    };

    // Fabric 체인에 기록
    const transaction = {
      txId,
      type: 'REGISTER_USER',
      timestamp,
      data: userData,
      status: 'VALID'
    };

    this.authLedger.set(userId, userData);
    this.transactions.push(transaction);

    console.log(`[Fabric Chain] User registered: ${userId} with DID: ${did}`);

    return {
      success: true,
      txId,
      receipt: this.generateReceipt(transaction)
    };
  }

  /**
   * 로그인 인증 (해시 비교)
   */
  async authenticateUser(userId, passwordHash, did, deviceHash) {
    const timestamp = Date.now();
    const txId = this.generateTxId();

    const userData = this.authLedger.get(userId);

    if (!userData) {
      return {
        success: false,
        error: 'User not found',
        txId
      };
    }

    // 계정 잠금 확인
    if (userData.isLocked) {
      return {
        success: false,
        error: 'Account is locked',
        txId
      };
    }

    // 비밀번호 해시 비교
    const isValid = userData.passwordHash === passwordHash;

    if (isValid) {
      // 로그인 성공
      userData.lastLogin = timestamp;
      userData.loginAttempts = 0;

      const authReceipt = {
        txId,
        userId,
        did,
        deviceHash,
        timestamp,
        status: 'SUCCESS'
      };

      const transaction = {
        txId,
        type: 'LOGIN_SUCCESS',
        timestamp,
        data: authReceipt,
        status: 'VALID'
      };

      this.transactions.push(transaction);

      console.log(`[Fabric Chain] Login successful: ${userId}`);

      return {
        success: true,
        txId,
        receipt: this.generateReceipt(transaction),
        authReceipt
      };
    } else {
      // 로그인 실패
      userData.loginAttempts++;

      if (userData.loginAttempts >= 5) {
        userData.isLocked = true;
      }

      const transaction = {
        txId,
        type: 'LOGIN_FAILED',
        timestamp,
        data: { userId, did, attempts: userData.loginAttempts },
        status: 'INVALID'
      };

      this.transactions.push(transaction);

      console.log(`[Fabric Chain] Login failed: ${userId} (${userData.loginAttempts} attempts)`);

      return {
        success: false,
        error: 'Invalid credentials',
        txId,
        attempts: userData.loginAttempts
      };
    }
  }

  /**
   * 사용자 데이터 조회
   */
  getUserData(userId) {
    return this.authLedger.get(userId);
  }

  /**
   * 트랜잭션 조회
   */
  getTransaction(txId) {
    return this.transactions.find(tx => tx.txId === txId);
  }

  /**
   * 사용자별 트랜잭션 조회
   */
  getUserTransactions(userId) {
    return this.transactions.filter(tx =>
      tx.data && (tx.data.userId === userId || tx.data.user === userId)
    );
  }

  /**
   * 영수증 생성
   */
  generateReceipt(transaction) {
    const receiptData = {
      txId: transaction.txId,
      type: transaction.type,
      timestamp: transaction.timestamp,
      status: transaction.status,
      blockNumber: this.transactions.length,
      hash: this.hashTransaction(transaction)
    };

    return receiptData;
  }

  /**
   * 트랜잭션 ID 생성
   */
  generateTxId() {
    return `tx_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * 트랜잭션 해시
   */
  hashTransaction(transaction) {
    const data = JSON.stringify({
      txId: transaction.txId,
      type: transaction.type,
      timestamp: transaction.timestamp,
      data: transaction.data
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * 체인 통계
   */
  getChainStats() {
    return {
      totalUsers: this.authLedger.size,
      totalTransactions: this.transactions.length,
      successfulLogins: this.transactions.filter(tx => tx.type === 'LOGIN_SUCCESS').length,
      failedLogins: this.transactions.filter(tx => tx.type === 'LOGIN_FAILED').length
    };
  }
}

// Singleton instance
const fabricChain = new FabricAuthChain();

module.exports = fabricChain;
