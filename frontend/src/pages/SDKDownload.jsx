import Layout from '../components/Layout'
import { Download, Code, FileCode, Book } from 'lucide-react'

export default function SDKDownload() {
  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            BlockPass Ω SDK
          </h1>
          <p className="text-gray-600">
            블록체인 기반 로그인을 웹사이트에 통합하세요.
          </p>
        </div>

        {/* Quick Start */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            빠른 시작
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                CDN으로 SDK 추가
              </h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-sm text-green-400 overflow-x-auto">
{`<script src="https://cdn.blockpass.omega/sdk.js"></script>`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                SDK 초기화
              </h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-sm text-green-400 overflow-x-auto">
{`<script>
  const blockpass = new BlockPass({
    apiKey: 'your_api_key_here',
    domain: 'https://your-website.com'
  });
</script>`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                회원가입 및 로그인 구현
              </h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-sm text-green-400 overflow-x-auto">
{`// 회원가입
blockpass.register(userId, password)
  .then(result => {
    console.log('Registration successful:', result);
    // DID: result.did
    // Transaction Hash: result.txId
  })
  .catch(error => {
    console.error('Registration failed:', error);
  });

// 로그인
blockpass.login(userId, password)
  .then(result => {
    console.log('Login successful:', result);
    // Token: result.token
    // Session Contract: result.sessionContract
    // Store token for future requests
    localStorage.setItem('token', result.token);
  })
  .catch(error => {
    console.error('Login failed:', error);
  });

// 세션 검증
blockpass.verify(token)
  .then(result => {
    console.log('Session valid:', result);
  })
  .catch(error => {
    console.error('Session invalid:', error);
  });

// 로그아웃
blockpass.logout(token)
  .then(() => {
    console.log('Logged out');
    localStorage.removeItem('token');
  });`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              간편한 통합
            </h3>
            <p className="text-gray-600">
              단 몇 줄의 코드만으로 블록체인 기반 로그인을 웹사이트에 통합할 수 있습니다.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <FileCode className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              TypeScript 지원
            </h3>
            <p className="text-gray-600">
              완전한 타입 정의를 제공하여 개발 생산성을 높입니다.
            </p>
          </div>
        </div>

        {/* Download Links */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            다운로드 링크
          </h2>

          <div className="space-y-3">
            <a
              href="/blockpass-sdk.js"
              download="blockpass-sdk.js"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">blockpass-sdk.js</p>
                  <p className="text-sm text-gray-600">JavaScript SDK (Ready to use)</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">v1.0.0</span>
            </a>

            <a
              href="https://github.com/junhuhan99/tendsos/blob/main/sdk/src/blockpass.js"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">소스 코드 보기</p>
                  <p className="text-sm text-gray-600">GitHub에서 소스 코드 확인</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </a>

            <a
              href="https://github.com/junhuhan99/tendsos/blob/main/sdk/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <Book className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">SDK 문서</p>
                  <p className="text-sm text-gray-600">전체 사용 가이드 및 예제</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
