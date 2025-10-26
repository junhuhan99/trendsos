import { useState } from 'react'
import Layout from '../components/Layout'
import { Play, CheckCircle, XCircle, Code, User, Lock } from 'lucide-react'

export default function Demo() {
  const [activeTab, setActiveTab] = useState('register')
  const [formData, setFormData] = useState({
    userId: 'demo_user_' + Math.floor(Math.random() * 1000),
    password: 'Demo1234!'
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('demo_api_key')

  // BlockPass SDK 시뮬레이션
  const runDemo = async (action) => {
    setLoading(true)
    setResult(null)

    const code = getCodeExample(action)

    // 코드 실행 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1500))

    try {
      let response
      if (action === 'register') {
        response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: formData.userId,
            password: formData.password,
            apiKey: apiKey
          })
        })
      } else if (action === 'login') {
        response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: formData.userId,
            password: formData.password,
            apiKey: apiKey
          })
        })
      } else if (action === 'verify') {
        const token = localStorage.getItem('demo_token')
        response = await fetch('/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      }

      const data = await response.json()

      if (data.success) {
        if (action === 'login' && data.token) {
          localStorage.setItem('demo_token', data.token)
        }
        setResult({
          success: true,
          code,
          response: data
        })
      } else {
        setResult({
          success: false,
          code,
          error: data.error
        })
      }
    } catch (error) {
      setResult({
        success: false,
        code,
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const getCodeExample = (action) => {
    switch (action) {
      case 'register':
        return `// 회원가입
blockpass.register('${formData.userId}', '${formData.password}')
  .then(result => {
    console.log('Registration successful!');
    console.log('DID:', result.data.did);
    console.log('TX Hash:', result.data.txId);
  });`
      case 'login':
        return `// 로그인
blockpass.login('${formData.userId}', '${formData.password}')
  .then(result => {
    console.log('Login successful!');
    console.log('Token:', result.token);
    console.log('Session:', result.sessionContract);
    localStorage.setItem('token', result.token);
  });`
      case 'verify':
        return `// 세션 검증
const token = localStorage.getItem('token');
blockpass.verify(token)
  .then(result => {
    if (result.valid) {
      console.log('Session is valid');
      console.log('User:', result.data);
    }
  });`
      default:
        return ''
    }
  }

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            라이브 데모
          </h1>
          <p className="text-gray-600">
            BlockPass Ω SDK를 실시간으로 테스트해보세요. 회원가입, 로그인, 세션 검증을 직접 실행할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Controls */}
          <div className="space-y-6">
            {/* API Key */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">API 설정</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key (데모용)
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="input bg-gray-50"
                  placeholder="API Key"
                />
                <p className="text-xs text-gray-500 mt-1">
                  실제 서비스에서는 서비스 등록 후 발급받은 API 키를 사용합니다.
                </p>
              </div>
            </div>

            {/* User Input */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">사용자 정보</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      className="input pl-10"
                      placeholder="User ID"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input pl-10"
                      placeholder="Password"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">액션 실행</h3>
              <div className="space-y-3">
                <button
                  onClick={() => runDemo('register')}
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  회원가입 테스트
                </button>

                <button
                  onClick={() => runDemo('login')}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  로그인 테스트
                </button>

                <button
                  onClick={() => runDemo('verify')}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  세션 검증 테스트
                </button>
              </div>

              {loading && (
                <div className="mt-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <p className="text-sm text-gray-600 mt-2">블록체인 검증 중...</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Results */}
          <div className="space-y-6">
            {/* Code Example */}
            {result && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">실행된 코드</h3>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm text-green-400 overflow-x-auto">
                    {result.code}
                  </pre>
                </div>
              </div>
            )}

            {/* Response */}
            {result && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <h3 className="font-semibold text-gray-900">
                    {result.success ? '성공' : '실패'}
                  </h3>
                </div>

                {result.success ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-900 mb-2">
                        블록체인 인증 완료!
                      </p>

                      {result.response.data?.did && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-green-700">DID:</span>
                          <p className="text-xs text-green-800 font-mono break-all">
                            {result.response.data.did}
                          </p>
                        </div>
                      )}

                      {result.response.txHash && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-green-700">TX Hash:</span>
                          <p className="text-xs text-green-800 font-mono break-all">
                            {result.response.txHash}
                          </p>
                        </div>
                      )}

                      {result.response.sessionContract && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-green-700">Session Contract:</span>
                          <p className="text-xs text-green-800 font-mono break-all">
                            {result.response.sessionContract}
                          </p>
                        </div>
                      )}

                      {result.response.data?.ipfsHash && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-green-700">IPFS Hash:</span>
                          <p className="text-xs text-green-800 font-mono break-all">
                            {result.response.data.ipfsHash}
                          </p>
                        </div>
                      )}
                    </div>

                    <details className="bg-gray-50 rounded-lg p-4">
                      <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                        전체 응답 보기
                      </summary>
                      <pre className="text-xs text-gray-600 mt-2 overflow-x-auto">
                        {JSON.stringify(result.response, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-900 mb-1">
                      오류 발생
                    </p>
                    <p className="text-sm text-red-700">
                      {result.error}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Info */}
            <div className="card bg-blue-50 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">
                블록체인 검증 프로세스
              </h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>로컬에서 비밀번호 해시 생성 (SHA3-512)</li>
                <li>DID 자동 생성 및 BDID Chain 등록</li>
                <li>Fabric Chain에서 해시 검증</li>
                <li>Ethereum Layer에 영수증 기록</li>
                <li>SmartSession Contract 배포</li>
                <li>IPFS에 로그 저장</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
