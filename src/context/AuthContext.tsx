import React, { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Merchant {
  id: string; name: string; email: string; phone: string
  status: string; kyc_status: string
}
interface AuthCtx {
  merchant: Merchant | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthCtx>(null!)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  const [merchant, setMerchant] = useState<Merchant | null>(() => {
    try { return JSON.parse(localStorage.getItem('yp_merchant') ?? 'null') }
    catch { return null }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('yp_token'))

  const login = async (email: string, password: string) => {
    const res = await fetch('/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Erreur de connexion')
    localStorage.setItem('yp_token', data.token)
    localStorage.setItem('yp_merchant', JSON.stringify(data.merchant))
    setToken(data.token)
    setMerchant(data.merchant)
  }

  const logout = () => {
    localStorage.removeItem('yp_token')
    localStorage.removeItem('yp_merchant')
    setToken(null)
    setMerchant(null)
    navigate('/connexion')
  }

  return (
    <AuthContext.Provider value={{ merchant, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
