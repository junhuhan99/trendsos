import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import NewService from './pages/NewService'
import SDKDownload from './pages/SDKDownload'
import Demo from './pages/Demo'
import APIDocumentation from './pages/APIDocumentation'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />
  }

  return (
    <Routes>
      <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/services"
        element={
          <PrivateRoute>
            <Services />
          </PrivateRoute>
        }
      />

      <Route
        path="/services/new"
        element={
          <PrivateRoute>
            <NewService />
          </PrivateRoute>
        }
      />

      <Route
        path="/services/:id"
        element={
          <PrivateRoute>
            <ServiceDetail />
          </PrivateRoute>
        }
      />

      <Route
        path="/sdk"
        element={
          <PrivateRoute>
            <SDKDownload />
          </PrivateRoute>
        }
      />

      <Route
        path="/demo"
        element={
          <PrivateRoute>
            <Demo />
          </PrivateRoute>
        }
      />

      <Route
        path="/api-docs"
        element={
          <PrivateRoute>
            <APIDocumentation />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

export default App
