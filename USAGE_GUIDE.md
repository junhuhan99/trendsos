# BlockPass Ω 사용 가이드

## 🎯 빠른 시작 (3단계)

### 1단계: 운영자 계정 생성

http://15.165.30.90 접속 후 회원가입

```
이메일: your@email.com
이름: 홍길동
비밀번호: 안전한비밀번호
```

### 2단계: 서비스 등록

대시보드 → "새 서비스 등록"

```
서비스 이름: 내 웹사이트
URL: https://mywebsite.com
플랜: Free (무료)
```

API 키와 시크릿이 자동으로 발급됩니다!

### 3단계: SDK 통합

발급받은 API 키로 웹사이트에 통합:

```html
<script src="http://15.165.30.90/blockpass-sdk.js"></script>
<script>
  const blockpass = new BlockPass({
    apiKey: 'bp_omega_your_api_key',
    domain: 'https://mywebsite.com'
  });
</script>
```

## 📱 주요 기능 사용법

### 회원가입

```javascript
blockpass.register('userId', 'password')
  .then(result => {
    console.log('DID:', result.data.did);
    console.log('TX Hash:', result.data.txId);
    // 자동으로 DID가 생성되고 블록체인에 기록됩니다
  })
  .catch(error => {
    console.error('Registration failed:', error);
  });
```

**백그라운드에서 일어나는 일:**
1. ✅ 비밀번호 로컬 해시 (SHA3-512)
2. ✅ DID 자동 생성 및 BDID Chain 등록
3. ✅ Fabric Chain에 해시 저장
4. ✅ Ethereum Layer에 영수증 기록
5. ✅ IPFS에 로그 저장

### 로그인

```javascript
blockpass.login('userId', 'password')
  .then(result => {
    console.log('Token:', result.token);
    console.log('Session Contract:', result.sessionContract);

    // 토큰 저장
    localStorage.setItem('token', result.token);
  })
  .catch(error => {
    console.error('Login failed:', error);
  });
```

**백그라운드에서 일어나는 일:**
1. ✅ Fabric Chain에서 해시 검증
2. ✅ SmartSession Contract 배포
3. ✅ Ethereum Layer에 로그인 영수증 기록
4. ✅ JWT 토큰 발급
5. ✅ IPFS에 로그인 로그 저장

### 세션 검증

```javascript
const token = localStorage.getItem('token');

blockpass.verify(token)
  .then(result => {
    if (result.valid) {
      console.log('Session is valid');
      console.log('User:', result.data.userId);
      console.log('DID:', result.data.did);

      // 페이지 접근 허용
    } else {
      // 로그인 페이지로 리다이렉트
    }
  });
```

### 로그아웃

```javascript
const token = localStorage.getItem('token');

blockpass.logout(token)
  .then(() => {
    console.log('Logged out');
    localStorage.removeItem('token');

    // 로그인 페이지로 리다이렉트
  });
```

**백그라운드에서 일어나는 일:**
1. ✅ SmartSession Contract 무효화
2. ✅ IPFS에 로그아웃 로그 저장

## 🖥️ 대시보드 기능

### 1. 통계 확인
- 총 서비스 수
- 월간 사용량
- 사용률

### 2. 서비스 관리
- 서비스 등록/수정/삭제
- API 키 재생성
- 사용량 통계 확인

### 3. 라이브 데모
- 회원가입 테스트
- 로그인 테스트
- 세션 검증 테스트
- 실시간 결과 확인

### 4. API 문서
- 전체 엔드포인트 문서
- 요청/응답 예제
- 에러 코드 설명

### 5. SDK 다운로드
- JavaScript SDK 다운로드
- 통합 가이드
- 코드 예제

## 💻 실전 예제

### 완전한 로그인 폼 예제

```html
<!DOCTYPE html>
<html>
<head>
  <title>BlockPass Login</title>
  <style>
    .container { max-width: 400px; margin: 50px auto; padding: 20px; }
    input { width: 100%; padding: 10px; margin: 10px 0; }
    button { width: 100%; padding: 10px; background: #0ea5e9; color: white; border: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>로그인</h1>

    <!-- 회원가입 -->
    <div id="register-form">
      <h2>회원가입</h2>
      <input type="text" id="reg-userid" placeholder="User ID">
      <input type="password" id="reg-password" placeholder="Password">
      <button onclick="register()">회원가입</button>
    </div>

    <!-- 로그인 -->
    <div id="login-form">
      <h2>로그인</h2>
      <input type="text" id="login-userid" placeholder="User ID">
      <input type="password" id="login-password" placeholder="Password">
      <button onclick="login()">로그인</button>
    </div>

    <!-- 로그인 후 -->
    <div id="user-info" style="display: none;">
      <h2>환영합니다!</h2>
      <p>User ID: <span id="current-user"></span></p>
      <p>DID: <span id="current-did"></span></p>
      <button onclick="logout()">로그아웃</button>
    </div>
  </div>

  <script src="http://15.165.30.90/blockpass-sdk.js"></script>
  <script>
    const blockpass = new BlockPass({
      apiKey: 'your_api_key_here',
      domain: window.location.origin
    });

    // 페이지 로드 시 세션 확인
    window.onload = function() {
      const token = localStorage.getItem('token');
      if (token) {
        blockpass.verify(token)
          .then(result => {
            if (result.valid) {
              showUserInfo(result.data);
            }
          })
          .catch(() => {
            localStorage.removeItem('token');
          });
      }
    };

    async function register() {
      const userId = document.getElementById('reg-userid').value;
      const password = document.getElementById('reg-password').value;

      try {
        const result = await blockpass.register(userId, password);
        alert('회원가입 성공! DID: ' + result.data.did);

        // 자동 로그인
        login();
      } catch (error) {
        alert('회원가입 실패: ' + error.message);
      }
    }

    async function login() {
      const userId = document.getElementById('login-userid').value;
      const password = document.getElementById('login-password').value;

      try {
        const result = await blockpass.login(userId, password);
        showUserInfo(result.data);
      } catch (error) {
        alert('로그인 실패: ' + error.message);
      }
    }

    async function logout() {
      const token = localStorage.getItem('token');

      try {
        await blockpass.logout(token);
        hideUserInfo();
      } catch (error) {
        alert('로그아웃 실패: ' + error.message);
      }
    }

    function showUserInfo(data) {
      document.getElementById('register-form').style.display = 'none';
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('user-info').style.display = 'block';
      document.getElementById('current-user').textContent = data.userId;
      document.getElementById('current-did').textContent = data.did;
    }

    function hideUserInfo() {
      document.getElementById('register-form').style.display = 'block';
      document.getElementById('login-form').style.display = 'block';
      document.getElementById('user-info').style.display = 'none';
    }
  </script>
</body>
</html>
```

## 🔐 보안 권장사항

### 1. API 키 관리
- ❌ 클라이언트 코드에 API Secret 노출 금지
- ✅ API Key만 클라이언트에서 사용
- ✅ API Secret은 서버에서만 사용

### 2. 토큰 관리
- ✅ 토큰을 localStorage에 안전하게 저장
- ✅ HTTPS 사용 권장
- ✅ 주기적으로 세션 검증

### 3. 비밀번호 정책
- ✅ 최소 8자 이상
- ✅ 영문, 숫자 조합 권장
- ✅ SDK가 자동으로 SHA3-512 해싱

## 📊 플랜별 제한

| 플랜 | 월 로그인 횟수 | 가격 |
|------|--------------|------|
| Free | 100,000 | 무료 |
| Basic | 1,000,000 | 무료 |
| Pro | 10,000,000 | 무료 |
| Enterprise | 무제한 | 무료 |

*현재 모든 플랜이 무료로 제공됩니다!*

## 🆘 트러블슈팅

### API 키 오류
```javascript
// Error: Invalid or inactive API key
```
**해결:** 대시보드에서 API 키 확인 또는 재생성

### 세션 만료
```javascript
// Error: Session expired
```
**해결:** 다시 로그인

### 사용량 초과
```javascript
// Error: Usage limit exceeded
```
**해결:** 플랜 업그레이드 또는 다음 달 대기

## 📞 문의 및 지원

- **GitHub**: https://github.com/junhuhan99/tendsos
- **Issues**: https://github.com/junhuhan99/tendsos/issues
- **문서**: http://15.165.30.90/api-docs

## 🚀 다음 단계

1. ✅ 대시보드에서 서비스 등록
2. ✅ SDK 통합
3. ✅ 라이브 데모에서 테스트
4. ✅ 프로덕션 배포

**"보이지 않는 블록체인이 당신의 로그인 뒤에서 작동한다."**
