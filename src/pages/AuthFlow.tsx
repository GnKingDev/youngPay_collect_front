import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye, EyeOff, Check, Lock, Mail, KeyRound, ShieldCheck,
  ArrowRight, ArrowLeft, TrendingUp, X, Shield,
} from 'lucide-react'
import logo from '../assets/logo.png'

type Screen = 'login' | 'otp' | 'forgot' | 'reset'

/* ─── Helpers ────────────────────────────────────────── */
const pwStrength = (pw: string) => {
  let s = 0
  if (pw.length >= 8)          s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

const maskEmail = (email: string) => {
  const at = email.indexOf('@')
  if (at < 1) return email
  return email[0] + '***' + email.slice(at)
}

const strengthMeta = [
  { label: '',          color: '#E2E8F0' },
  { label: 'Faible',    color: '#EF4444' },
  { label: 'Moyen',     color: '#F59E0B' },
  { label: 'Fort',      color: '#3B82F6' },
  { label: 'Très fort', color: '#10B981' },
]

/* ─── Decorative background (centered screens) ────────── */
const PageBg = () => (
  <>
    <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
      style={{
        backgroundImage: 'radial-gradient(circle, #0F172A 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />
    <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none opacity-[0.07]"
      style={{ background: 'radial-gradient(circle, #F59E0B, #F97316)' }} />
    <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full pointer-events-none opacity-[0.04]"
      style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />
  </>
)

/* ─── Shared logo bar (centered screens) ─────────────── */
const LogoBar = () => (
  <div className="flex justify-center mb-8">
    <div className="bg-white rounded-xl px-5 py-3 border border-navy-100"
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
      <img src={logo} alt="YoungPay Collect" className="h-8 w-auto" />
    </div>
  </div>
)

/* ─── Mini Dashboard (login left panel) ──────────────── */
const MiniDashboard = () => (
  <div className="w-full max-w-xs mx-auto mt-8">
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/10">
        {['#EF4444', '#F59E0B', '#22C55E'].map(c => (
          <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
        ))}
        <span className="ml-2 text-white/40 text-xs font-mono">dashboard</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: 'Volume',   val: '4.2M GNF' },
            { label: 'Réussite', val: '98.5%' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-white/40 text-[9px] uppercase tracking-wide">{s.label}</p>
              <p className="text-white font-bold text-sm mt-0.5">{s.val}</p>
              <p className="text-[10px] mt-0.5 flex items-center gap-0.5" style={{ color: '#F59E0B' }}>
                <TrendingUp className="w-2.5 h-2.5" /> +12%
              </p>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-end gap-1 h-10">
            {[30, 55, 40, 75, 60, 90, 80, 100].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm"
                style={{ height: `${h}%`, background: 'linear-gradient(to top, #F97316, #F59E0B44)' }} />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          {[
            { name: 'Orange Money', amount: '+85 000 GNF', color: '#FF6200' },
            { name: 'MTN Mobile',   amount: '+42 000 GNF', color: '#FFCD00' },
          ].map(tx => (
            <div key={tx.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.color }} />
                <span className="text-white/60 text-[10px]">{tx.name}</span>
              </div>
              <span className="text-white text-[10px] font-semibold">{tx.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

/* ─── Left Panel (login only) ────────────────────────── */
const LeftPanel = () => {
  const navigate = useNavigate()
  return (
  <div className="relative flex flex-col w-full h-full px-10 py-10 overflow-hidden"
    style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 100%)' }}>

    <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none -translate-y-1/4 translate-x-1/4"
      style={{ background: 'radial-gradient(circle, #F59E0B, #F97316)' }} />
    <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10 pointer-events-none translate-y-1/4 -translate-x-1/4"
      style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />

    {/* Logo */}
    <div className="bg-white rounded-xl px-4 py-2.5 inline-flex w-fit mb-10 relative z-10">
      <img src={logo} alt="YoungPay Collect" className="h-9 w-auto" />
    </div>

    <div className="flex-1 relative z-10">
      <h2 className="font-bold text-3xl xl:text-4xl text-white leading-tight mb-3">
        Bon retour{' '}
        <span style={{
          background: 'linear-gradient(135deg, #F59E0B, #F97316)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          parmi nous
        </span>
      </h2>
      <p className="text-white/50 text-sm leading-relaxed mb-8">
        Accédez à votre portail marchand et suivez vos paiements en temps réel.
      </p>

      <div className="space-y-3.5">
        {[
          'Tableau de bord en temps réel',
          'Historique complet des transactions',
          'Support technique dédié',
        ].map((b, i) => (
          <div key={b} className="flex items-center gap-3"
            style={{ animation: `fadeInLeft 0.5s ease-out ${i * 0.1 + 0.2}s both` }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
            <span className="text-white/80 text-sm font-medium">{b}</span>
          </div>
        ))}
      </div>

      <MiniDashboard />
    </div>

    <p className="text-white/40 text-sm text-center mt-6 relative z-10">
      Pas encore de compte ?{' '}
      <button onClick={() => navigate('/inscription')}
        className="font-semibold underline underline-offset-2 cursor-pointer transition-opacity hover:opacity-80"
        style={{ color: '#F59E0B' }}>
        S'inscrire
      </button>
    </p>
  </div>
  )
}

/* ─── Screen 1 : Login ───────────────────────────────── */
const ScreenLogin = ({
  onNavigate, email, setEmail,
}: {
  onNavigate: (s: Screen) => void
  email: string
  setEmail: (v: string) => void
}) => {
  const navigate = useNavigate()
  const [password, setPassword]   = useState('')
  const [showPw,   setShowPw]     = useState(false)
  const [loading,  setLoading]    = useState(false)
  const [errors,   setErrors]     = useState<{ email?: string; password?: string }>({})
  const [touched,  setTouched]    = useState<{ email?: boolean; password?: boolean }>({})

  const emailValid    = /\S+@\S+\.\S+/.test(email)
  const passwordValid = password.length >= 8

  const validate = () => {
    const e: typeof errors = {}
    if (!email.trim())  e.email    = 'Email requis'
    else if (!emailValid) e.email  = 'Adresse email invalide'
    if (!password)      e.password = 'Mot de passe requis'
    else if (!passwordValid) e.password = 'Minimum 8 caractères'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    setTouched({ email: true, password: true })
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Identifiants invalides')
      // En mode dev, le backend peut retourner otp_dev si l'email échoue
      if (data.otp_dev) {
        console.info('[DEV] OTP:', data.otp_dev)
      }
      onNavigate('otp')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur de connexion'
      setErrors({ password: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full h-full">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-shrink-0">
        <LeftPanel />
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-white overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-navy-100"
          style={{ background: '#0F172A' }}>
          <div className="bg-white rounded-lg px-3 py-1.5">
            <img src={logo} alt="YoungPay Collect" className="h-7 w-auto" />
          </div>
          <button onClick={() => navigate('/')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-w-md mx-auto px-8 py-12">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, #F59E0B22, #F9731611)' }}>
                <Lock className="w-5 h-5" style={{ color: '#F97316' }} />
              </div>
              <h1 className="font-bold text-3xl text-navy mb-1.5">Connexion</h1>
              <p className="text-navy-400 text-sm leading-relaxed">
                Entrez vos identifiants pour accéder à votre espace marchand.
              </p>
            </div>
            <button onClick={() => navigate('/')}
              className="hidden lg:flex items-center gap-1.5 text-navy-400 hover:text-navy text-sm transition-colors mt-1">
              <X className="w-4 h-4" /> Fermer
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-5 mb-6">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-navy font-semibold text-sm">Adresse email professionnelle</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@entreprise.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (touched.email) setErrors(er => ({ ...er, email: undefined })) }}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  className={`w-full rounded-xl border-2 px-4 py-3.5 pr-10 text-sm text-navy font-medium outline-none transition-all duration-200 bg-white placeholder:text-navy-300 ${
                    touched.email && errors.email
                      ? 'border-red-400 bg-red-50/40 focus:border-red-400'
                      : emailValid
                        ? 'border-green-400 focus:border-green-400'
                        : 'border-navy-200 focus:border-amber-400'
                  }`}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
                {emailValid && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                  </div>
                )}
              </div>
              {touched.email && errors.email && (
                <p className="text-red-500 text-xs flex items-center gap-1"><span>⚠</span>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-navy font-semibold text-sm">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (touched.password) setErrors(er => ({ ...er, password: undefined })) }}
                  onBlur={() => setTouched(t => ({ ...t, password: true }))}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className={`w-full rounded-xl border-2 px-4 py-3.5 pr-12 text-sm text-navy font-medium outline-none transition-all duration-200 bg-white placeholder:text-navy-300 ${
                    touched.password && errors.password
                      ? 'border-red-400 bg-red-50/40 focus:border-red-400'
                      : passwordValid
                        ? 'border-green-400 focus:border-green-400'
                        : 'border-navy-200 focus:border-amber-400'
                  }`}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-red-500 text-xs flex items-center gap-1"><span>⚠</span>{errors.password}</p>
              )}
              <div className="flex justify-end">
                <button onClick={() => onNavigate('forgot')}
                  className="text-xs font-semibold transition-colors hover:opacity-80"
                  style={{ color: '#F97316' }}>
                  Mot de passe oublié ?
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-white font-bold text-sm transition-all duration-200 disabled:opacity-70 mb-5"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 8px 24px rgba(249,115,22,0.30)' }}>
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Connexion en cours…</>
            ) : (
              <>Se connecter <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          {/* Separator */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-navy-100" />
            <span className="text-navy-300 text-xs font-medium">— ou —</span>
            <div className="flex-1 h-px bg-navy-100" />
          </div>

          {/* Register CTA */}
          <button onClick={() => navigate('/inscription')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-navy-200 text-navy font-semibold text-sm hover:border-amber-400 hover:text-amber-500 transition-all duration-200 bg-white mb-8">
            Créer un compte gratuit <ArrowRight className="w-4 h-4" />
          </button>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-navy-400">
            <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-xs font-medium">Connexion sécurisée SSL 256 bits</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Screen 2 : OTP ─────────────────────────────────── */
const ScreenOTP = ({ onNavigate, email }: { onNavigate: (s: Screen) => void; email: string }) => {
  const navigate   = useNavigate()
  const [otp,      setOtp]      = useState(['', '', '', '', '', ''])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [countdown,setCountdown]= useState(120)
  const [canResend,setCanResend]= useState(false)

  const refs = [
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
  ]

  const startTimer = () => {
    setCountdown(120)
    setCanResend(false)
    const id = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(id); setCanResend(true); return 0 }
        return c - 1
      })
    }, 1000)
    return id
  }

  useEffect(() => {
    refs[0].current?.focus()
    const id = startTimer()
    return () => clearInterval(id)
  }, [])

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next)
    if (v && i < 5) refs[i + 1].current?.focus()
  }
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus()
  }

  const handleResend = async () => {
    setOtp(['', '', '', '', '', ''])
    setError('')
    refs[0].current?.focus()
    startTimer()
    try {
      await fetch('/v1/auth/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch { /* silently ignore */ }
  }

  const handleSubmit = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Entrez le code complet à 6 chiffres'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/v1/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Code invalide')
      localStorage.setItem('yp_token', data.token)
      localStorage.setItem('yp_merchant', JSON.stringify(data.merchant))
      navigate('/dashboard')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Code invalide')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="flex-1 bg-[#F8FAFC] relative overflow-y-auto flex items-center justify-center p-6">
      <PageBg />
      <div className="relative w-full max-w-md">
        <LogoBar />
        <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
          <div className="px-8 py-8">

            {/* Animated shield */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl animate-ping opacity-[0.15]"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', animationDuration: '2s' }} />
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 8px 24px rgba(249,115,22,0.35)' }}>
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <h1 className="font-bold text-2xl text-navy text-center mb-2">Vérification en deux étapes</h1>
            <p className="text-navy-400 text-sm text-center mb-8 leading-relaxed">
              Un code à 6 chiffres a été envoyé à<br />
              <span className="font-semibold text-navy">{maskEmail(email || 'marchand@exemple.com')}</span>
            </p>

            {/* OTP boxes */}
            <div className="flex gap-2 justify-center mb-3">
              {otp.map((v, i) => (
                <input
                  key={i}
                  ref={refs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={v}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200 bg-white text-navy ${
                    v
                      ? 'border-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]'
                      : 'border-navy-200 focus:border-amber-400 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.10)]'
                  }`}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-xs text-center mb-4">⚠ {error}</p>}

            {/* Timer / Resend */}
            <div className="text-center mb-6">
              {canResend ? (
                <button onClick={handleResend}
                  className="text-sm font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: '#F97316' }}>
                  Renvoyer le code
                </button>
              ) : (
                <p className="text-navy-300 text-sm">
                  Renvoyer dans <span className="font-semibold text-navy-500">{fmt(countdown)}</span>
                </p>
              )}
            </div>

            {/* Confirm */}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-white font-bold text-sm transition-all duration-200 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 8px 24px rgba(249,115,22,0.30)' }}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Vérification…</>
              ) : (
                <><Check className="w-4 h-4" /> Confirmer</>
              )}
            </button>
          </div>

          <div className="px-8 py-4 border-t border-navy-100 text-center">
            <button onClick={() => onNavigate('login')}
              className="inline-flex items-center gap-1.5 text-navy-400 hover:text-navy text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" /> Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Screen 3 : Forgot Password ─────────────────────── */
const ScreenForgot = ({ onNavigate, email: initEmail }: { onNavigate: (s: Screen) => void; email: string }) => {
  const [email,   setEmail]   = useState(initEmail)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [sent,    setSent]    = useState(false)

  const emailValid = /\S+@\S+\.\S+/.test(email)

  const handleSubmit = async () => {
    if (!email.trim())  { setError('Email requis'); return }
    if (!emailValid)    { setError('Adresse email invalide'); return }
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="flex-1 bg-[#F8FAFC] relative overflow-y-auto flex items-center justify-center p-6">
      <PageBg />
      <div className="relative w-full max-w-md">
        <LogoBar />
        <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
          <div className="px-8 py-8">
            {!sent ? (
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #F59E0B22, #F9731611)' }}>
                    <Mail className="w-8 h-8" style={{ color: '#F97316' }} />
                  </div>
                </div>

                <h1 className="font-bold text-2xl text-navy text-center mb-2">Mot de passe oublié ?</h1>
                <p className="text-navy-400 text-sm text-center mb-8 leading-relaxed">
                  Entrez l'adresse email de votre compte. Nous vous enverrons un lien de réinitialisation.
                </p>

                <div className="flex flex-col gap-1.5 mb-6">
                  <label className="text-navy font-semibold text-sm">Adresse email professionnelle</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="you@entreprise.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      className={`w-full rounded-xl border-2 px-4 py-3.5 pr-10 text-sm text-navy font-medium outline-none transition-all duration-200 bg-white placeholder:text-navy-300 ${
                        error
                          ? 'border-red-400 bg-red-50/40 focus:border-red-400'
                          : emailValid
                            ? 'border-green-400 focus:border-green-400'
                            : 'border-navy-200 focus:border-amber-400'
                      }`}
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    />
                    {emailValid && !error && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  {error && <p className="text-red-500 text-xs flex items-center gap-1"><span>⚠</span>{error}</p>}
                </div>

                <button onClick={handleSubmit} disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-white font-bold text-sm transition-all duration-200 disabled:opacity-70"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 8px 24px rgba(249,115,22,0.30)' }}>
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Envoi en cours…</>
                  ) : (
                    <>Envoyer le lien <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center" style={{ animation: 'scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-100"
                    style={{ boxShadow: '0 0 0 8px rgba(34,197,94,0.10)' }}>
                    <Check className="w-8 h-8 text-green-500" strokeWidth={2.5} />
                  </div>
                </div>
                <h1 className="font-bold text-2xl text-navy mb-2">Email envoyé !</h1>
                <p className="text-navy-400 text-sm leading-relaxed mb-8">
                  Vérifiez votre boîte mail. Le lien expire dans{' '}
                  <span className="font-semibold text-navy">15 minutes</span>.
                </p>
                <button onClick={() => onNavigate('otp')}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 8px 24px rgba(249,115,22,0.30)' }}>
                  Vérifier mon OTP <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="px-8 py-4 border-t border-navy-100 text-center">
            <button onClick={() => onNavigate('login')}
              className="inline-flex items-center gap-1.5 text-navy-400 hover:text-navy text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" /> Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Screen 4 : Reset Password ──────────────────────── */
const ScreenReset = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => {
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [showCf,   setShowCf]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  const score = pwStrength(password)

  const criteria = [
    { label: '8 caractères minimum', ok: password.length >= 8 },
    { label: 'Une lettre majuscule',  ok: /[A-Z]/.test(password) },
    { label: 'Un chiffre',            ok: /[0-9]/.test(password) },
    { label: 'Un caractère spécial',  ok: /[^A-Za-z0-9]/.test(password) },
  ]

  const confirmValid = confirm.length > 0 && password === confirm
  const confirmError = confirm.length > 0 && password !== confirm

  const handleSubmit = async () => {
    if (score < 2) { setError('Le mot de passe n\'est pas assez fort'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="flex-1 bg-[#F8FAFC] relative overflow-y-auto flex items-center justify-center p-6">
        <PageBg />
        <div className="relative w-full max-w-md">
          <LogoBar />
          <div className="bg-white rounded-2xl border border-navy-100 px-8 py-10 text-center"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)', animation: 'scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 8px 32px rgba(249,115,22,0.35)' }}>
                <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="font-bold text-2xl text-navy mb-2">Mot de passe réinitialisé !</h1>
            <p className="text-navy-400 text-sm leading-relaxed mb-8">
              Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.
            </p>
            <button onClick={() => onNavigate('login')}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 8px 24px rgba(249,115,22,0.30)' }}>
              Se connecter <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#F8FAFC] relative overflow-y-auto flex items-start justify-center p-6">
      <PageBg />
      <div className="relative w-full max-w-md mt-4">
        <LogoBar />
        <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
          <div className="px-8 py-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #F59E0B22, #F9731611)' }}>
                <KeyRound className="w-8 h-8" style={{ color: '#F97316' }} />
              </div>
            </div>

            <h1 className="font-bold text-2xl text-navy text-center mb-2">Nouveau mot de passe</h1>
            <p className="text-navy-400 text-sm text-center mb-8 leading-relaxed">
              Choisissez un mot de passe fort pour sécuriser votre compte.
            </p>

            <div className="space-y-5 mb-6">
              {/* New password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-navy font-semibold text-sm">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Minimum 8 caractères"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    className={`w-full rounded-xl border-2 px-4 py-3.5 pr-12 text-sm text-navy font-medium outline-none transition-all duration-200 bg-white placeholder:text-navy-300 ${
                      score >= 3
                        ? 'border-green-400 focus:border-green-400'
                        : password.length > 0 && score < 2
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-navy-200 focus:border-amber-400'
                    }`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength bars */}
                {password.length > 0 && (
                  <div className="space-y-1.5 mt-0.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                          style={{ backgroundColor: i <= score ? strengthMeta[score].color : '#E2E8F0' }} />
                      ))}
                    </div>
                    <p className="text-xs font-semibold transition-colors"
                      style={{ color: strengthMeta[score].color }}>
                      {strengthMeta[score].label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-navy font-semibold text-sm">Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    type={showCf ? 'text' : 'password'}
                    placeholder="Répétez votre mot de passe"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError('') }}
                    className={`w-full rounded-xl border-2 px-4 py-3.5 pr-12 text-sm text-navy font-medium outline-none transition-all duration-200 bg-white placeholder:text-navy-300 ${
                      confirmError
                        ? 'border-red-400 bg-red-50/40 focus:border-red-400'
                        : confirmValid
                          ? 'border-green-400 focus:border-green-400'
                          : 'border-navy-200 focus:border-amber-400'
                    }`}
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  />
                  <button type="button" onClick={() => setShowCf(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy transition-colors">
                    {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmError && (
                  <p className="text-red-500 text-xs flex items-center gap-1"><span>⚠</span>Les mots de passe ne correspondent pas</p>
                )}
              </div>

              {/* Criteria checklist */}
              <div className="bg-[#F8FAFC] rounded-xl p-4 border border-navy-100">
                <p className="text-navy text-[11px] font-bold uppercase tracking-wider mb-3">
                  Critères du mot de passe
                </p>
                <div className="space-y-2.5">
                  {criteria.map(c => (
                    <div key={c.label} className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        c.ok ? 'bg-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]' : 'border-2 border-navy-200 bg-white'
                      }`}>
                        {c.ok && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-xs font-medium transition-colors duration-200 ${
                        c.ok ? 'text-green-600' : 'text-navy-400'
                      }`}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center mb-4 flex items-center justify-center gap-1">
                <span>⚠</span>{error}
              </p>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-white font-bold text-sm transition-all duration-200 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 8px 24px rgba(249,115,22,0.30)' }}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Réinitialisation…</>
              ) : (
                <>Réinitialiser le mot de passe <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

          <div className="px-8 py-4 border-t border-navy-100 text-center">
            <button onClick={() => onNavigate('forgot')}
              className="inline-flex items-center gap-1.5 text-navy-400 hover:text-navy text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main export : AuthFlow ─────────────────────────── */
export default function AuthFlow() {
  const [screen,       setScreen]       = useState<Screen>('login')
  const [transitioning,setTransitioning]= useState(false)
  const [email,        setEmail]        = useState('')

  const switchTo = (to: Screen) => {
    setTransitioning(true)
    setTimeout(() => { setScreen(to); setTransitioning(false) }, 200)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{
        fontFamily: 'Poppins, sans-serif',
        opacity:   transitioning ? 0 : 1,
        transform: transitioning ? 'translateY(6px)' : 'translateY(0)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
    >
      {screen === 'login' && (
        <ScreenLogin
          onNavigate={switchTo}
          email={email}
          setEmail={setEmail}
        />
      )}
      {screen === 'otp'    && <ScreenOTP    onNavigate={switchTo} email={email} />}
      {screen === 'forgot' && <ScreenForgot onNavigate={switchTo} email={email} />}
      {screen === 'reset'  && <ScreenReset  onNavigate={switchTo} />}

      <style>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
