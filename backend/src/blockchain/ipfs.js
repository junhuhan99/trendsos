const crypto = require('crypto');

/**
 * IPFS + Arweave Layer
 * 로그인 로그 분산 저장
 */

class IPFSLogLayer {
  constructor() {
    this.ipfsClient = null;
    this.logStorage = new Map(); // 시뮬레이션용 (실제로는 IPFS/Arweave)
    this.isConnected = false;
  }

  /**
   * IPFS 클라이언트 초기화
   */
  async initialize(ipfsConfig) {
    try {
      // IPFS 연결 시도
      // const { create } = require('ipfs-http-client');
      // this.ipfsClient = create(ipfsConfig);
      // this.isConnected = true;
      console.log('[IPFS Layer] Running in simulation mode');
      this.isConnected = false;
    } catch (error) {
      console.error('[IPFS Layer] Initialization failed:', error.message);
      this.isConnected = false;
    }
  }

  /**
   * 로그인 로그 저장
   */
  async storeLog(logData) {
    const timestamp = Date.now();

    // 로그 암호화
    const encryptedLog = this.encryptLog(logData);

    // IPFS에 저장 (연결된 경우)
    if (this.isConnected && this.ipfsClient) {
      try {
        const { cid } = await this.ipfsClient.add(JSON.stringify(encryptedLog));
        const ipfsHash = cid.toString();

        console.log(`[IPFS Layer] Log stored on IPFS: ${ipfsHash}`);

        // Arweave에 해시만 영구 저장
        const arweaveHash = await this.storeToArweave(ipfsHash);

        return {
          success: true,
          ipfsHash,
          arweaveHash,
          timestamp
        };
      } catch (error) {
        console.error('[IPFS Layer] Storage failed:', error.message);
      }
    }

    // 시뮬레이션 모드
    const ipfsHash = this.generateIPFSHash();
    const arweaveHash = this.generateArweaveHash();

    const logRecord = {
      ipfsHash,
      arweaveHash,
      encryptedLog,
      timestamp,
      expiresAt: timestamp + (7 * 24 * 60 * 60 * 1000), // 7일 후
      status: 'STORED'
    };

    this.logStorage.set(ipfsHash, logRecord);

    console.log(`[IPFS Layer] Log stored (simulation): ${ipfsHash}`);

    return {
      success: true,
      ipfsHash,
      arweaveHash,
      timestamp
    };
  }

  /**
   * 로그 조회
   */
  async retrieveLog(ipfsHash) {
    // 실제 IPFS에서 조회
    if (this.isConnected && this.ipfsClient) {
      try {
        const chunks = [];
        for await (const chunk of this.ipfsClient.cat(ipfsHash)) {
          chunks.push(chunk);
        }
        const data = Buffer.concat(chunks).toString();
        return JSON.parse(data);
      } catch (error) {
        console.error('[IPFS Layer] Retrieval failed:', error.message);
      }
    }

    // 시뮬레이션 모드
    const logRecord = this.logStorage.get(ipfsHash);
    if (!logRecord) {
      throw new Error('Log not found');
    }

    // 만료 확인
    if (Date.now() > logRecord.expiresAt) {
      this.logStorage.delete(ipfsHash);
      throw new Error('Log expired and removed');
    }

    // 복호화
    return this.decryptLog(logRecord.encryptedLog);
  }

  /**
   * 사용자별 로그 조회
   */
  async getUserLogs(userId, limit = 10) {
    const userLogs = [];

    for (const [hash, record] of this.logStorage) {
      try {
        const decryptedLog = this.decryptLog(record.encryptedLog);
        if (decryptedLog.userId === userId) {
          userLogs.push({
            ipfsHash: hash,
            log: decryptedLog,
            timestamp: record.timestamp
          });
        }
      } catch (error) {
        // Skip invalid logs
      }
    }

    // 최신순 정렬
    userLogs.sort((a, b) => b.timestamp - a.timestamp);

    return userLogs.slice(0, limit);
  }

  /**
   * 만료된 로그 자동 삭제
   */
  async cleanupExpiredLogs() {
    const now = Date.now();
    let deletedCount = 0;

    for (const [hash, record] of this.logStorage) {
      if (now > record.expiresAt) {
        this.logStorage.delete(hash);
        deletedCount++;
      }
    }

    console.log(`[IPFS Layer] Cleaned up ${deletedCount} expired logs`);
    return deletedCount;
  }

  /**
   * 로그 암호화
   */
  encryptLog(logData) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(logData), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      data: encrypted,
      key: key.toString('hex'),
      iv: iv.toString('hex')
    };
  }

  /**
   * 로그 복호화
   */
  decryptLog(encryptedLog) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(encryptedLog.key, 'hex');
    const iv = Buffer.from(encryptedLog.iv, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedLog.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  /**
   * Arweave에 저장 (시뮬레이션)
   */
  async storeToArweave(ipfsHash) {
    // 실제 Arweave 저장 로직
    // ...

    // 시뮬레이션
    return this.generateArweaveHash();
  }

  /**
   * IPFS 해시 생성 (시뮬레이션)
   */
  generateIPFSHash() {
    return 'Qm' + crypto.randomBytes(23).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Arweave 해시 생성 (시뮬레이션)
   */
  generateArweaveHash() {
    return crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * 저장소 통계
   */
  getStorageStats() {
    const now = Date.now();
    let activeCount = 0;
    let expiredCount = 0;

    for (const [hash, record] of this.logStorage) {
      if (now > record.expiresAt) {
        expiredCount++;
      } else {
        activeCount++;
      }
    }

    return {
      totalLogs: this.logStorage.size,
      activeLogs: activeCount,
      expiredLogs: expiredCount,
      isConnected: this.isConnected
    };
  }
}

// Singleton instance
const ipfsLayer = new IPFSLogLayer();

module.exports = ipfsLayer;
