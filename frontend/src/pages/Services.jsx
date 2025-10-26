import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { serviceAPI } from '../utils/api'
import Layout from '../components/Layout'
import { Plus, Server, ExternalLink } from 'lucide-react'

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await serviceAPI.getList()
      if (response.data.success) {
        setServices(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              서비스 관리
            </h1>
            <p className="text-gray-600">
              등록된 웹사이트 서비스를 관리하고 API 키를 확인하세요.
            </p>
          </div>
          <Link to="/services/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            새 서비스 등록
          </Link>
        </div>

        {loading ? (
          <div className="card text-center py-12">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        ) : services.length === 0 ? (
          <div className="card text-center py-12">
            <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              등록된 서비스가 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              첫 번째 서비스를 등록하고 BlockPass를 시작하세요.
            </p>
            <Link to="/services/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              서비스 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.map((service) => {
              const usagePercent = (service.currentUsage / service.usageLimit) * 100

              return (
                <div key={service.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {service.name}
                      </h3>
                      <a
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        {service.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      service.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {service.isActive ? '활성화' : '비활성화'}
                    </span>
                  </div>

                  {service.description && (
                    <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">사용량</span>
                      <span className="font-medium">
                        {service.currentUsage.toLocaleString()} / {service.usageLimit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          usagePercent > 80
                            ? 'bg-red-500'
                            : usagePercent > 50
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">{service.plan}</span> 플랜
                    </span>
                    <Link
                      to={`/services/${service.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      상세 보기 →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
