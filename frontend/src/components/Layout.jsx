import { Link, useNavigate } from 'react-router-dom'
import { Home, Server, Download, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const operator = JSON.parse(localStorage.getItem('operator') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('operator')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-primary-600">
                BlockPass Ω
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{operator.name || operator.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white h-[calc(100vh-64px)] border-r border-gray-200">
            <nav className="p-4 space-y-2">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Home className="w-5 h-5" />
                대시보드
              </Link>

              <Link
                to="/services"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Server className="w-5 h-5" />
                서비스 관리
              </Link>

              <Link
                to="/sdk"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Download className="w-5 h-5" />
                SDK 다운로드
              </Link>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
