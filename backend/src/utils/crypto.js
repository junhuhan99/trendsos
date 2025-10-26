const crypto = require('crypto');
const CryptoJS = require('crypto-js');

/**
 * 암호화 유틸리티
 * SHA3-512 + Salt + Nonce 해싱
 */

class CryptoUtils {
  /**
   * 비밀번호 해시 생성 (SHA3-512 + Salt + Nonce)
   * PDF 사양에 따름
   */
  static hashPassword(password, salt = null, nonce = null) {
    // Salt 생성 (없는 경우)
    if (!salt) {
      salt = crypto.randomBytes(32).toString('hex');
    }

    // Nonce 생성 (없는 경우)
    if (!nonce) {
      nonce = crypto.randomBytes(16).toString('hex');
    }

    // SHA3-512 해시 (CryptoJS 사용)
    const combined = `${password}:${salt}:${nonce}`;
    const hash = CryptoJS.SHA3(combined, { outputLength: 512 }).toString();

    return {
      hash,
      salt,
      nonce
    };
  }

  /**
   * 비밀번호 검증
   */
  static verifyPassword(password, storedHash, salt, nonce) {
    const { hash } = this.hashPassword(password, salt, nonce);
    return hash === storedHash;
  }

  /**
   * 디바이스 해시 생성
   */
  static generateDeviceHash(userAgent, ipAddress) {
    const data = `${userAgent}:${ipAddress}:${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * 도메인 해시 생성
   */
  static hashDomain(domain) {
    return crypto.createHash('sha256').update(domain).digest('hex');
  }

  /**
   * 데이터 해시 (SHA-256)
   */
  static hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * HMAC 서명
   */
  static sign(data, secret) {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * HMAC 검증
   */
  static verify(data, signature, secret) {
    const computed = this.sign(data, secret);
    return computed === signature;
  }

  /**
   * 랜덤 토큰 생성
   */
  static generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * API 키 생성
   */
  static generateApiKey() {
    const prefix = 'bp_omega';
    const key = crypto.randomBytes(24).toString('hex');
    return `${prefix}_${key}`;
  }

  /**
   * API 시크릿 생성
   */
  static generateApiSecret() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = CryptoUtils;
