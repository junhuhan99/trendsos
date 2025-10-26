/**
 * BlockPass Ω SDK
 * Blockchain-based Login Infrastructure
 *
 * @version 1.0.0
 * @author BlockPass Omega Team
 */

class BlockPass {
  constructor(config) {
    if (!config || !config.apiKey) {
      throw new Error('BlockPass: API key is required');
    }

    this.apiKey = config.apiKey;
    this.domain = config.domain || window.location.origin;
    this.apiUrl = config.apiUrl || 'http://localhost:5000/api';

    console.log(`[BlockPass Ω] Initialized for ${this.domain}`);
  }

  /**
   * 회원가입 + DID 자동 생성
   * @param {string} userId - 사용자 ID
   * @param {string} password - 비밀번호
   * @returns {Promise<Object>} 회원가입 결과
   */
  async register(userId, password) {
    try {
      const response = await this._makeRequest('/auth/register', 'POST', {
        userId,
        password,
        apiKey: this.apiKey
      });

      if (response.success) {
        console.log('[BlockPass Ω] Registration successful');
        console.log('  User ID:', userId);
        console.log('  DID:', response.data.did);
        console.log('  TX Hash:', response.data.txId);
        console.log('  IPFS Hash:', response.data.ipfsHash);
      }

      return response;
    } catch (error) {
      console.error('[BlockPass Ω] Registration failed:', error.message);
      throw error;
    }
  }

  /**
   * 로그인
   * @param {string} userId - 사용자 ID
   * @param {string} password - 비밀번호
   * @returns {Promise<Object>} 로그인 결과 (token, sessionContract 포함)
   */
  async login(userId, password) {
    try {
      const response = await this._makeRequest('/auth/login', 'POST', {
        userId,
        password,
        apiKey: this.apiKey
      });

      if (response.success) {
        console.log('[BlockPass Ω] Login successful');
        console.log('  User ID:', userId);
        console.log('  DID:', response.data.did);
        console.log('  Session Contract:', response.sessionContract);
        console.log('  TX Hash:', response.txHash);

        // 토큰을 로컬 스토리지에 저장 (선택사항)
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('blockpass_token', response.token);
          localStorage.setItem('blockpass_session', response.sessionContract);
        }
      }

      return response;
    } catch (error) {
      console.error('[BlockPass Ω] Login failed:', error.message);
      throw error;
    }
  }

  /**
   * 세션 검증
   * @param {string} token - JWT 토큰
   * @returns {Promise<Object>} 검증 결과
   */
  async verify(token) {
    try {
      const response = await this._makeRequest('/auth/verify', 'GET', null, token);

      if (response.success) {
        console.log('[BlockPass Ω] Session verified');
        console.log('  Valid:', response.valid);
        console.log('  User ID:', response.data.userId);
        console.log('  DID:', response.data.did);
      }

      return response;
    } catch (error) {
      console.error('[BlockPass Ω] Verification failed:', error.message);
      throw error;
    }
  }

  /**
   * 로그아웃
   * @param {string} token - JWT 토큰
   * @returns {Promise<Object>} 로그아웃 결과
   */
  async logout(token) {
    try {
      const response = await this._makeRequest('/auth/logout', 'POST', null, token);

      if (response.success) {
        console.log('[BlockPass Ω] Logout successful');

        // 로컬 스토리지에서 토큰 삭제
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('blockpass_token');
          localStorage.removeItem('blockpass_session');
        }
      }

      return response;
    } catch (error) {
      console.error('[BlockPass Ω] Logout failed:', error.message);
      throw error;
    }
  }

  /**
   * 로그 조회
   * @param {string} token - JWT 토큰
   * @returns {Promise<Object>} 로그 목록
   */
  async getLogs(token) {
    try {
      const response = await this._makeRequest(
        `/auth/logs?apiKey=${encodeURIComponent(this.apiKey)}`,
        'GET',
        null,
        token
      );

      if (response.success) {
        console.log('[BlockPass Ω] Logs retrieved');
        console.log('  Total logs:', response.count);
      }

      return response;
    } catch (error) {
      console.error('[BlockPass Ω] Get logs failed:', error.message);
      throw error;
    }
  }

  /**
   * 로컬 스토리지에서 토큰 가져오기
   * @returns {string|null} 저장된 토큰
   */
  getStoredToken() {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('blockpass_token');
    }
    return null;
  }

  /**
   * 로컬 스토리지에서 세션 컨트랙트 주소 가져오기
   * @returns {string|null} 저장된 세션 컨트랙트 주소
   */
  getStoredSession() {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('blockpass_session');
    }
    return null;
  }

  /**
   * HTTP 요청 헬퍼
   * @private
   */
  async _makeRequest(endpoint, method = 'GET', body = null, token = null) {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Network error');
    }
  }
}

// Export for browser and Node.js
if (typeof window !== 'undefined') {
  window.BlockPass = BlockPass;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlockPass;
}
