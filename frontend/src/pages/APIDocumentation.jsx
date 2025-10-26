import Layout from '../components/Layout'
import { Code, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function APIDocumentation() {
  const [copied, setCopied] = useState('')

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  const endpoints = [
    {
      method: 'POST',
      path: '/api/auth/register',
      description: '회원가입 + DID 자동 생성',
      request: {
        userId: 'user001',
        password: 'mypassword123',
        apiKey: 'your_api_key_here'
      },
      response: {
        success: true,
        message: 'User registered successfully',
        data: {
          userId: 'user001',
          did: 'did:bdid:omega:abc123:def456',
          didDocument: { /* DID Document */ },
          txId: 'tx_1234567890_abc123',
          ipfsHash: 'QmXyZ...',
          arweaveHash: 'ArweaveHashHere'
        }
      }
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      description: '로그인',
      request: {
        userId: 'user001',
        password: 'mypassword123',
        apiKey: 'your_api_key_here'
      },
      response: {
        success: true,
        message: 'Login successful',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        txHash: '0xabc123...',
        sessionContract: '0xSs001...',
        data: {
          userId: 'user001',
          did: 'did:bdid:omega:abc123:def456',
          sessionInfo: { /* Session Info */ }
        }
      }
    },
    {
      method: 'GET',
      path: '/api/auth/verify',
      description: '세션 검증',
      headers: {
        Authorization: 'Bearer YOUR_TOKEN_HERE'
      },
      response: {
        success: true,
        valid: true,
        data: {
          userId: 'user001',
          did: 'did:bdid:omega:abc123:def456',
          sessionValid: true,
          didValid: true
        }
      }
    },
    {
      method: 'POST',
      path: '/api/auth/logout',
      description: '로그아웃',
      headers: {
        Authorization: 'Bearer YOUR_TOKEN_HERE'
      },
      response: {
        success: true,
        message: 'Logged out successfully'
      }
    },
    {
      method: 'GET',
      path: '/api/auth/logs',
      description: '로그 조회',
      headers: {
        Authorization: 'Bearer YOUR_TOKEN_HERE'
      },
      params: {
        apiKey: 'your_api_key_here'
      },
      response: {
        success: true,
        count: 10,
        logs: [
          {
            ipfsHash: 'QmXyZ...',
            log: {
              type: 'LOGIN_SUCCESS',
              userId: 'user001',
              timestamp: 1234567890
            },
            timestamp: 1234567890
          }
        ]
      }
    }
  ]

  const operatorEndpoints = [
    {
      method: 'POST',
      path: '/api/operator/register',
      description: '운영자 회원가입',
      request: {
        email: 'operator@example.com',
        password: 'securepassword',
        name: '홍길동',
        company: '테크컴퍼니'
      }
    },
    {
      method: 'POST',
      path: '/api/operator/login',
      description: '운영자 로그인',
      request: {
        email: 'operator@example.com',
        password: 'securepassword'
      }
    },
    {
      method: 'POST',
      path: '/api/service/register',
      description: '서비스 등록',
      headers: {
        Authorization: 'Bearer OPERATOR_TOKEN'
      },
      request: {
        name: '내 웹사이트',
        url: 'https://example.com',
        description: '웹사이트 설명',
        plan: 'free'
      }
    }
  ]

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            API 문서
          </h1>
          <p className="text-gray-600">
            BlockPass Ω REST API 레퍼런스 문서
          </p>
        </div>

        {/* Base URL */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Base URL</h2>
          <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
            <code className="text-green-400">http://15.165.30.90/api</code>
            <button
              onClick={() => handleCopy('http://15.165.30.90/api', 'base-url')}
              className="text-gray-400 hover:text-white"
            >
              {copied === 'base-url' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Authentication Endpoints */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            인증 API
          </h2>
          <p className="text-gray-600 mb-4">
            최종 사용자 인증을 위한 엔드포인트입니다.
          </p>

          <div className="space-y-6">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="card">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    endpoint.method === 'POST'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-gray-900 font-mono">{endpoint.path}</code>
                </div>

                <p className="text-gray-600 mb-4">{endpoint.description}</p>

                {endpoint.headers && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Headers</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <pre className="text-sm text-gray-700">
                        {JSON.stringify(endpoint.headers, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {endpoint.request && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Request Body</h4>
                    <div className="bg-gray-900 rounded-lg p-4 relative">
                      <button
                        onClick={() => handleCopy(JSON.stringify(endpoint.request, null, 2), `req-${index}`)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      >
                        {copied === `req-${index}` ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <pre className="text-sm text-green-400 overflow-x-auto">
                        {JSON.stringify(endpoint.request, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {endpoint.response && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Response</h4>
                    <div className="bg-gray-900 rounded-lg p-4 relative">
                      <button
                        onClick={() => handleCopy(JSON.stringify(endpoint.response, null, 2), `res-${index}`)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      >
                        {copied === `res-${index}` ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <pre className="text-sm text-blue-400 overflow-x-auto">
                        {JSON.stringify(endpoint.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Operator Endpoints */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            운영자 API
          </h2>
          <p className="text-gray-600 mb-4">
            웹사이트 운영자를 위한 엔드포인트입니다.
          </p>

          <div className="space-y-6">
            {operatorEndpoints.map((endpoint, index) => (
              <div key={index} className="card">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-lg text-sm font-medium bg-purple-100 text-purple-700">
                    {endpoint.method}
                  </span>
                  <code className="text-gray-900 font-mono">{endpoint.path}</code>
                </div>

                <p className="text-gray-600 mb-4">{endpoint.description}</p>

                {endpoint.headers && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Headers</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <pre className="text-sm text-gray-700">
                        {JSON.stringify(endpoint.headers, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {endpoint.request && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Request Body</h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-sm text-green-400 overflow-x-auto">
                        {JSON.stringify(endpoint.request, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Codes */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            에러 코드
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4">코드</th>
                  <th className="text-left py-2 px-4">설명</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 font-mono">400</td>
                  <td className="py-2 px-4">Bad Request - 잘못된 요청</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 font-mono">401</td>
                  <td className="py-2 px-4">Unauthorized - 인증 실패</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 font-mono">403</td>
                  <td className="py-2 px-4">Forbidden - 권한 없음</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 font-mono">404</td>
                  <td className="py-2 px-4">Not Found - 리소스를 찾을 수 없음</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 font-mono">409</td>
                  <td className="py-2 px-4">Conflict - 중복된 데이터</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-4 font-mono">429</td>
                  <td className="py-2 px-4">Too Many Requests - 사용량 초과</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono">500</td>
                  <td className="py-2 px-4">Internal Server Error - 서버 오류</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
