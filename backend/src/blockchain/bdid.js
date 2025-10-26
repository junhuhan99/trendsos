const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * BDID (Blockchain Distributed ID) Chain
 * DID 생성 및 관리
 */

class BDIDChain {
  constructor() {
    this.didRegistry = new Map(); // In-memory DID registry (실제로는 블록체인에 저장)
    this.chain = []; // DID 블록체인
  }

  /**
   * DID 생성
   * did:bdid:omega:<domainHash>:<hash(ID+deviceHash)>
   */
  createDID(userId, domain, deviceHash) {
    const domainHash = this.hashData(domain);
    const userDeviceHash = this.hashData(`${userId}:${deviceHash}`);
    const did = `did:bdid:omega:${domainHash.substring(0, 8)}:${userDeviceHash.substring(0, 16)}`;

    // 키쌍 생성
    const { publicKey, privateKey } = this.generateKeyPair();

    const didDocument = {
      '@context': 'https://www.w3.org/ns/did/v1',
      id: did,
      publicKey: [{
        id: `${did}#keys-1`,
        type: 'EcdsaSecp256k1VerificationKey2019',
        controller: did,
        publicKeyHex: publicKey
      }],
      authentication: [`${did}#keys-1`],
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    // DID를 체인에 등록
    this.registerDID(did, didDocument, privateKey);

    return {
      did,
      didDocument,
      privateKey // 실제로는 안전하게 저장되어야 함
    };
  }

  /**
   * DID 등록 (블록체인에 기록)
   */
  registerDID(did, didDocument, privateKey) {
    const block = {
      index: this.chain.length,
      timestamp: Date.now(),
      did,
      didDocument,
      hash: this.hashData(JSON.stringify(didDocument)),
      previousHash: this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : '0'
    };

    this.chain.push(block);
    this.didRegistry.set(did, { didDocument, privateKey, block });

    console.log(`[BDID Chain] DID registered: ${did}`);
    return block;
  }

  /**
   * DID 조회
   */
  resolveDID(did) {
    const entry = this.didRegistry.get(did);
    if (!entry) {
      throw new Error(`DID not found: ${did}`);
    }
    return entry.didDocument;
  }

  /**
   * DID 검증
   */
  verifyDID(did) {
    try {
      const entry = this.didRegistry.get(did);
      if (!entry) return false;

      // 블록체인에서 검증
      const block = entry.block;
      const computedHash = this.hashData(JSON.stringify(entry.didDocument));

      return block.hash === computedHash;
    } catch (error) {
      console.error('[BDID Chain] DID verification failed:', error);
      return false;
    }
  }

  /**
   * 키쌍 생성
   */
  generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp256k1',
      publicKeyEncoding: { type: 'spki', format: 'der' },
      privateKeyEncoding: { type: 'pkcs8', format: 'der' }
    });

    return {
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex')
    };
  }

  /**
   * 데이터 해시
   */
  hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * 체인 전체 조회
   */
  getChain() {
    return this.chain;
  }

  /**
   * 체인 검증
   */
  validateChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      const computedHash = this.hashData(JSON.stringify(currentBlock.didDocument));
      if (currentBlock.hash !== computedHash) {
        return false;
      }
    }
    return true;
  }
}

// Singleton instance
const bdidChain = new BDIDChain();

module.exports = bdidChain;
