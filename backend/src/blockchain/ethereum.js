const { ethers } = require('ethers');
const crypto = require('crypto');

/**
 * Ethereum/Polygon Layer
 * 로그인 영수증(Receipt) 영구 기록 및 Audit
 */

class EthereumAuditLayer {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.auditRecords = new Map(); // 시뮬레이션용 (실제로는 블록체인)
    this.isConnected = false;
  }

  /**
   * Ethereum 네트워크 연결 초기화
   */
  async initialize(rpcUrl, privateKey, contractAddress) {
    try {
      if (rpcUrl && privateKey) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.isConnected = true;
        console.log('[Ethereum Layer] Connected to network');
      } else {
        console.log('[Ethereum Layer] Running in simulation mode');
        this.isConnected = false;
      }
    } catch (error) {
      console.error('[Ethereum Layer] Initialization failed:', error.message);
      this.isConnected = false;
    }
  }

  /**
   * AuthReceipt를 Ethereum에 기록
   */
  async recordAuthReceipt(authReceipt) {
    const timestamp = Date.now();
    const receiptHash = this.hashReceipt(authReceipt);

    // 실제 Ethereum 트랜잭션 (연결된 경우)
    if (this.isConnected && this.contract) {
      try {
        const tx = await this.contract.recordAuth(
          receiptHash,
          authReceipt.userId,
          authReceipt.did
        );
        const receipt = await tx.wait();

        console.log(`[Ethereum Layer] Auth recorded on-chain: ${receipt.hash}`);

        return {
          success: true,
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          receiptHash
        };
      } catch (error) {
        console.error('[Ethereum Layer] Transaction failed:', error.message);
        // Fall back to simulation
      }
    }

    // 시뮬레이션 모드
    const auditRecord = {
      receiptHash,
      authReceipt,
      timestamp,
      blockNumber: this.auditRecords.size + 1,
      txHash: this.generateTxHash(),
      status: 'CONFIRMED'
    };

    this.auditRecords.set(receiptHash, auditRecord);

    console.log(`[Ethereum Layer] Auth receipt recorded (simulation): ${receiptHash}`);

    return {
      success: true,
      txHash: auditRecord.txHash,
      blockNumber: auditRecord.blockNumber,
      receiptHash
    };
  }

  /**
   * Audit 기록 조회
   */
  async getAuditRecord(receiptHash) {
    // 실제 블록체인에서 조회 (연결된 경우)
    if (this.isConnected && this.contract) {
      try {
        const record = await this.contract.getAuthRecord(receiptHash);
        return record;
      } catch (error) {
        console.error('[Ethereum Layer] Query failed:', error.message);
      }
    }

    // 시뮬레이션 모드
    return this.auditRecords.get(receiptHash);
  }

  /**
   * 사용자별 Audit 기록 조회
   */
  async getUserAuditRecords(userId) {
    const records = [];
    for (const [hash, record] of this.auditRecords) {
      if (record.authReceipt.userId === userId) {
        records.push(record);
      }
    }
    return records;
  }

  /**
   * Receipt 해시 생성
   */
  hashReceipt(receipt) {
    const data = JSON.stringify({
      txId: receipt.txId,
      userId: receipt.userId,
      did: receipt.did,
      timestamp: receipt.timestamp
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * 트랜잭션 해시 생성 (시뮬레이션)
   */
  generateTxHash() {
    return '0x' + crypto.randomBytes(32).toString('hex');
  }

  /**
   * 블록 검증
   */
  async verifyAuditRecord(receiptHash) {
    const record = await this.getAuditRecord(receiptHash);
    if (!record) return false;

    const computedHash = this.hashReceipt(record.authReceipt);
    return computedHash === receiptHash;
  }

  /**
   * Audit 통계
   */
  getAuditStats() {
    return {
      totalRecords: this.auditRecords.size,
      isConnected: this.isConnected,
      networkType: this.isConnected ? 'Ethereum Testnet' : 'Simulation'
    };
  }
}

// Singleton instance
const ethereumLayer = new EthereumAuditLayer();

module.exports = ethereumLayer;
