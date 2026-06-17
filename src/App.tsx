import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Landing page — chargée immédiatement (page d'entrée)
import LandingPage from './pages/LandingPage'

// Tout le reste — chargé à la demande uniquement
const AuthFlow  = lazy(() => import('./pages/AuthFlow'))
const Register  = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DevPage   = lazy(() => import('./pages/DevPage'))
const PayPage    = lazy(() => import('./pages/PayPage'))
const ResultPage = lazy(() => import('./pages/ResultPage'))

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

// Fallback minimal — ne bloque pas le rendu
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"            element={<LandingPage />} />
          <Route path="/connexion"   element={<AuthFlow />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/docs"        element={<DevPage />} />
          <Route path="/developpeur" element={<ProtectedRoute><DevPage /></ProtectedRoute>} />
          <Route path="/pay/:linkId"              element={<PayPage />} />
          <Route path="/result/:transactionId"   element={<ResultPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
