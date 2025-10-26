import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { serviceAPI } from '../utils/api'
import Layout from '../components/Layout'
import { Server, TrendingUp, Activity, Plus } from 'lucide-react'

export default function Dashboard() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const operator = JSON.parse(localStorage.getItem('operator') || '{}')

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

  const totalUsage = services.reduce((sum, service) => sum + service.currentUsage, 0)
  const totalLimit = services.reduce((sum, service) => sum + service.usageLimit, 0)
  const activeServices = services.filter(s => s.isActive).length

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            대시보드
          </h1>
          <p className="text-gray-600">
            안녕하세요, {operator.name}님! BlockPass Ω 플랫폼에 오신 것을 환영합니다.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">총 서비스</h3>
              <Server className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{services.length}</p>
            <p className="text-sm text-green-600 mt-2">
              {activeServices} 활성화
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">이번 달 사용량</h3>
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {totalUsage.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              / {totalLimit.toLocaleString()} 제한
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">사용률</h3>
              <Activity className="w-5 h-5 text-primary-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {totalLimit > 0 ? ((totalUsage / totalLimit) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-gray-500 mt-2">
              전체 서비스 평균
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            빠른 시작
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/services/new"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">새 서비스 등록</h3>
                <p className="text-sm text-gray-600">웹사이트에 BlockPass 연동하기</p>
              </div>
            </Link>

            <Link
              to="/sdk"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Server className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">SDK 다운로드</h3>
                <p className="text-sm text-gray-600">BlockPass SDK 설치 가이드</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Services */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              최근 서비스
            </h2>
            <Link to="/services" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              전체 보기 →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              로딩 중...
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">등록된 서비스가 없습니다.</p>
              <Link to="/services/new" className="btn-primary inline-block">
                첫 서비스 등록하기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {services.slice(0, 5).map((service) => (
                <Link
                  key={service.id}
                  to={`/services/${service.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.url}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {service.currentUsage.toLocaleString()} / {service.usageLimit.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{service.plan} 플랜</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
