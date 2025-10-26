# BlockPass Ω SDK

블록체인 기반 로그인 인프라 JavaScript SDK

## 설치

### CDN 사용

```html
<script src="https://cdn.blockpass.omega/sdk.js"></script>
```

### NPM 설치

```bash
npm install @blockpass/omega-sdk
```

## 빠른 시작

### 1. SDK 초기화

```javascript
const blockpass = new BlockPass({
  apiKey: 'your_api_key_here',
  domain: 'https://your-website.com',
  apiUrl: 'https://api.blockpass.omega' // 선택사항
});
```

### 2. 회원가입

```javascript
blockpass.register('userId', 'password')
  .then(result => {
    console.log('Registration successful!');
    console.log('DID:', result.data.did);
    console.log('Transaction Hash:', result.data.txId);
    console.log('IPFS Hash:', result.data.ipfsHash);
  })
  .catch(error => {
    console.error('Registration failed:', error);
  });
```

### 3. 로그인

```javascript
blockpass.login('userId', 'password')
  .then(result => {
    console.log('Login successful!');
    console.log('Token:', result.token);
    console.log('Session Contract:', result.sessionContract);

    // 토큰 저장
    localStorage.setItem('token', result.token);
  })
  .catch(error => {
    console.error('Login failed:', error);
  });
```

### 4. 세션 검증

```javascript
const token = localStorage.getItem('token');

blockpass.verify(token)
  .then(result => {
    if (result.valid) {
      console.log('Session is valid');
      console.log('User:', result.data);
    }
  })
  .catch(error => {
    console.error('Session invalid:', error);
  });
```

### 5. 로그아웃

```javascript
const token = localStorage.getItem('token');

blockpass.logout(token)
  .then(() => {
    console.log('Logged out successfully');
    localStorage.removeItem('token');
  })
  .catch(error => {
    console.error('Logout failed:', error);
  });
```

## API 레퍼런스

### `new BlockPass(config)`

SDK 인스턴스를 생성합니다.

**파라미터:**
- `config.apiKey` (string, required): 서비스 API 키
- `config.domain` (string, optional): 서비스 도메인
- `config.apiUrl` (string, optional): API 서버 URL

### `register(userId, password)`

사용자를 등록하고 DID를 자동으로 생성합니다.

**파라미터:**
- `userId` (string): 사용자 ID
- `password` (string): 비밀번호

**반환값:**
```javascript
{
  success: true,
  data: {
    userId: "user001",
    did: "did:bdid:omega:...",
    didDocument: { ... },
    txId: "tx_...",
    ipfsHash: "Qm...",
    arweaveHash: "..."
  }
}
```

### `login(userId, password)`

사용자를 로그인합니다.

**파라미터:**
- `userId` (string): 사용자 ID
- `password` (string): 비밀번호

**반환값:**
```javascript
{
  success: true,
  token: "eyJhbGciOiJI...",
  txHash: "0xabc123...",
  sessionContract: "0xSs001...",
  data: {
    userId: "user001",
    did: "did:bdid:omega:...",
    sessionInfo: { ... }
  }
}
```

### `verify(token)`

세션을 검증합니다.

**파라미터:**
- `token` (string): JWT 토큰

**반환값:**
```javascript
{
  success: true,
  valid: true,
  data: {
    userId: "user001",
    did: "did:bdid:omega:...",
    sessionValid: true,
    didValid: true
  }
}
```

### `logout(token)`

로그아웃합니다.

**파라미터:**
- `token` (string): JWT 토큰

**반환값:**
```javascript
{
  success: true,
  message: "Logged out successfully"
}
```

### `getLogs(token)`

사용자의 로그인 로그를 조회합니다.

**파라미터:**
- `token` (string): JWT 토큰

**반환값:**
```javascript
{
  success: true,
  count: 10,
  logs: [ ... ]
}
```

## 전체 예제

```html
<!DOCTYPE html>
<html>
<head>
  <title>BlockPass Example</title>
</head>
<body>
  <h1>BlockPass Ω Example</h1>

  <!-- 회원가입 -->
  <div id="register-form">
    <h2>Register</h2>
    <input type="text" id="reg-userid" placeholder="User ID">
    <input type="password" id="reg-password" placeholder="Password">
    <button onclick="register()">Register</button>
  </div>

  <!-- 로그인 -->
  <div id="login-form">
    <h2>Login</h2>
    <input type="text" id="login-userid" placeholder="User ID">
    <input type="password" id="login-password" placeholder="Password">
    <button onclick="login()">Login</button>
  </div>

  <!-- 로그아웃 -->
  <button onclick="logout()">Logout</button>

  <script src="https://cdn.blockpass.omega/sdk.js"></script>
  <script>
    const blockpass = new BlockPass({
      apiKey: 'bp_omega_...',
      domain: window.location.origin
    });

    async function register() {
      const userId = document.getElementById('reg-userid').value;
      const password = document.getElementById('reg-password').value;

      try {
        const result = await blockpass.register(userId, password);
        alert('Registration successful! DID: ' + result.data.did);
      } catch (error) {
        alert('Registration failed: ' + error.message);
      }
    }

    async function login() {
      const userId = document.getElementById('login-userid').value;
      const password = document.getElementById('login-password').value;

      try {
        const result = await blockpass.login(userId, password);
        alert('Login successful! Session: ' + result.sessionContract);
      } catch (error) {
        alert('Login failed: ' + error.message);
      }
    }

    async function logout() {
      const token = blockpass.getStoredToken();

      if (!token) {
        alert('Not logged in');
        return;
      }

      try {
        await blockpass.logout(token);
        alert('Logged out successfully');
      } catch (error) {
        alert('Logout failed: ' + error.message);
      }
    }
  </script>
</body>
</html>
```

## 특징

- ✅ **블록체인 해시체인**: 비밀번호를 블록체인에서 검증
- ✅ **스마트컨트랙트 세션**: 세션 자체를 블록체인 자산으로 관리
- ✅ **DID 자동 생성**: 사용자별 고유 분산 ID
- ✅ **분산 로그 저장**: IPFS + Arweave 영구 기록
- ✅ **이중 합의 검증**: Private + Public Chain 병행

## 라이선스

MIT License

## 문의

- GitHub: https://github.com/junhuhan99/tendsos
- Email: support@blockpass-omega.io
