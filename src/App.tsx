import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import AuthFlow from './pages/AuthFlow'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DevPage from './pages/DevPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('yp_token')
  if (!token) return <Navigate to="/connexion" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/"            element={<LandingPage />} />
        <Route path="/connexion"   element={<AuthFlow />} />
        <Route path="/inscription" element={<Register />} />
        <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/docs"        element={<DevPage />} />
        <Route path="/developpeur" element={<ProtectedRoute><DevPage /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}
