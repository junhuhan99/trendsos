import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serviceAPI } from '../utils/api'
import Layout from '../components/Layout'
import { Globe, Type, FileText, AlertCircle, CheckCircle } from 'lucide-react'

export default function NewService() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    plan: 'free'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await serviceAPI.register(formData)

      if (response.data.success) {
        navigate(`/services/${response.data.data.id}`)
      }
    } catch (err) {
      setError(err.response?.data?.error || '서비스 등록에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            새 서비스 등록
          </h1>
          <p className="text-gray-600">
            웹사이트 정보를 입력하고 BlockPass 인증을 시작하세요.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              서비스 이름 *
            </label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input pl-10"
                placeholder="내 웹사이트"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              웹사이트 URL *
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="input pl-10"
                placeholder="https://example.com"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              HTTPS 프로토콜을 포함한 전체 URL을 입력하세요.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명 (선택)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input pl-10 min-h-[100px]"
                placeholder="서비스에 대한 간단한 설명을 입력하세요."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              플랜 선택
            </label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              className="input"
            >
              <option value="free">Free - 월 10만 회 (무료)</option>
              <option value="basic">Basic - 월 100만 회 (무료)</option>
              <option value="pro">Pro - 월 1000만 회 (무료)</option>
              <option value="enterprise">Enterprise - 무제한 (무료)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              현재 모든 플랜이 무료로 제공됩니다.
            </p>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h3 className="font-medium text-primary-900 mb-2">
              등록 후 진행 사항
            </h3>
            <ul className="text-sm text-primary-800 space-y-1">
              <li>✓ API 키 및 시크릿 자동 생성</li>
              <li>✓ SDK 다운로드 및 통합 가이드 제공</li>
              <li>✓ 블록체인 기반 인증 즉시 사용 가능</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="btn-secondary flex-1"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? '등록 중...' : '서비스 등록'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
