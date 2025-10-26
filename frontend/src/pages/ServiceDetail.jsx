import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { serviceAPI } from '../utils/api'
import Layout from '../components/Layout'
import { Copy, RefreshCw, Trash2, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function ServiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSecret, setShowSecret] = useState(false)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    fetchService()
    fetchStats()
  }, [id])

  const fetchService = async () => {
    try {
      const response = await serviceAPI.getService(id)
      if (response.data.success) {
        setService(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch service:', error)
      navigate('/services')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await serviceAPI.getStats(id)
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleRegenerateKey = async () => {
    if (!confirm('API 키를 재생성하시겠습니까? 기존 키는 더 이상 사용할 수 없습니다.')) {
      return
    }

    try {
      const response = await serviceAPI.regenerateKey(id)
      if (response.data.success) {
        fetchService()
        alert('API 키가 재생성되었습니다.')
      }
    } catch (error) {
      alert('API 키 재생성에 실패했습니다.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말로 이 서비스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    try {
      const response = await serviceAPI.delete(id)
      if (response.data.success) {
        alert('서비스가 삭제되었습니다.')
        navigate('/services')
      }
    } catch (error) {
      alert('서비스 삭제에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">로딩 중...</div>
      </Layout>
    )
  }

  if (!service) {
    return null
  }

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {service.name}
          </h1>
          <p className="text-gray-600">{service.url}</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              사용량 통계
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">현재 사용량</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.currentUsage.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">월간 제한</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.usageLimit === Infinity ? '무제한' : stats.usageLimit.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">사용률</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.usagePercent}%
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    parseFloat(stats.usagePercent) > 80
                      ? 'bg-red-500'
                      : parseFloat(stats.usagePercent) > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(parseFloat(stats.usagePercent), 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* API Keys */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              API 인증 정보
            </h2>
            <button
              onClick={handleRegenerateKey}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              키 재생성
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={service.apiKey}
                  readOnly
                  className="input flex-1 bg-gray-50"
                />
                <button
                  onClick={() => handleCopy(service.apiKey, 'apiKey')}
                  className="btn-secondary flex items-center gap-2"
                >
                  {copied === 'apiKey' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      복사
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Secret
              </label>
              <div className="flex gap-2">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={service.apiSecret}
                  readOnly
                  className="input flex-1 bg-gray-50"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="btn-secondary"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleCopy(service.apiSecret, 'apiSecret')}
                  className="btn-secondary flex items-center gap-2"
                >
                  {copied === 'apiSecret' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      복사
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>주의:</strong> API Secret은 안전한 곳에 보관하세요. 외부에 노출되지 않도록 주의해야 합니다.
            </p>
          </div>
        </div>

        {/* SDK Integration */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            SDK 통합 예제
          </h2>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-green-400">
{`<script src="https://cdn.blockpass.omega/sdk.js"></script>
<script>
  const blockpass = new BlockPass({
    apiKey: '${service.apiKey}',
    domain: '${service.url}'
  });

  // 회원가입
  blockpass.register('userId', 'password')
    .then(result => console.log('Registered!', result));

  // 로그인
  blockpass.login('userId', 'password')
    .then(result => console.log('Logged in!', result));
</script>`}
            </pre>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-2 border-red-200">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            위험 구역
          </h2>
          <p className="text-gray-600 mb-4">
            서비스를 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
          </p>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            서비스 삭제
          </button>
        </div>
      </div>
    </Layout>
  )
}
