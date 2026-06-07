import { useState } from 'react'
import { Eye, EyeOff, Check, TrendingUp, X, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import logo from '../assets/logo.png'

/* ─── Mini Dashboard (left panel) ───────────────────── */
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
            { label: 'Volume', val: '4.2M GNF' },
            { label: 'Réussite', val: '98.5%' },
          ].map(s => (
            <div key={s.label} className="bg-white/8 rounded-xl p-2.5">
              <p className="text-white/40 text-[9px] uppercase tracking-wide">{s.label}</p>
              <p className="text-white font-bold text-sm mt-0.5">{s.val}</p>
              <p className="text-[10px] mt-0.5 flex items-center gap-0.5" style={{ color: '#F59E0B' }}>
                <TrendingUp className="w-2.5 h-2.5" /> +12%
              </p>
            </div>
          ))}
        </div>
        <div className="bg-white/8 rounded-xl p-3">
          <div className="flex items-end gap-1 h-10">
            {[30, 55, 40, 75, 60, 90, 80, 100].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm" style={{
                height: `${h}%`,
                background: 'linear-gradient(to top, #F97316, #F59E0B44)'
              }} />
            ))}
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
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

/* ─── Left Panel ─────────────────────────────────────── */
const LeftPanel = ({ onClose, onShowRegister }: { onClose: () => void; onShowRegister: () => void }) => (
  <div className="relative flex flex-col h-full px-10 py-10 overflow-hidden"
    style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 100%)' }}>

    {/* Orbs */}
    <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none -translate-y-1/4 translate-x-1/4"
      style={{ background: 'radial-gradient(circle, #F59E0B, #F97316)' }} />
    <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10 pointer-events-none translate-y-1/4 -translate-x-1/4"
      style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />

    {/* Close (mobile) */}
    <button onClick={onClose}
      className="lg:hidden absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors">
      <X className="w-4 h-4" />
    </button>

    {/* Logo */}
    <div className="bg-white rounded-xl px-4 py-2.5 inline-flex w-fit mb-10">
      <img src={logo} alt="YoungPay Collect" className="h-9 w-auto" />
    </div>

    {/* Headline */}
    <div className="flex-1">
      <h2 className="font-bold text-3xl xl:text-4xl text-white leading-tight mb-3">
        Bon retour{' '}
        <span style={{
          background: 'linear-gradient(135deg, #F59E0B, #F97316)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          parmi nous
        </span>
      </h2>
      <p className="text-white/50 text-sm leading-relaxed mb-8">
        Accédez à votre portail marchand et suivez vos paiements en temps réel.
      </p>

      {/* Benefits */}
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

    {/* Bottom link */}
    <p className="text-white/40 text-sm text-center mt-6 relative z-10">
      Pas encore de compte ?{' '}
      <button onClick={onShowRegister}
        className="font-semibold underline underline-offset-2 transition-colors cursor-pointer"
        style={{ color: '#F59E0B' }}>
        S'inscrire
      </button>
    </p>
  </div>
)

/* ─── Main Login Page ────────────────────────────────── */
export default function Login({ onClose, onShowRegister }: { onClose: () => void; onShowRegister: () => void }) {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [errors, setErrors]       = useState<{ email?: string; password?: string }>({})
  const [touched, setTouched]     = useState<{ email?: boolean; password?: boolean }>({})

  const emailValid    = /\S+@\S+\.\S+/.test(email)
  const passwordValid = password.length >= 8

  const validateField = (field: 'email' | 'password', val: string) => {
    const e = { ...errors }
    if (field === 'email') {
      if (!val.trim())               e.email = 'Email requis'
      else if (!/\S+@\S+\.\S+/.test(val)) e.email = 'Adresse email invalide'
      else                           delete e.email
    }
    if (field === 'password') {
      if (!val)             e.password = 'Mot de passe requis'
      else if (val.length < 8) e.password = 'Minimum 8 caractères'
      else                  delete e.password
    }
    setErrors(e)
  }

  const handleSubmit = async () => {
    setTouched({ email: true, password: true })
    const e: typeof errors = {}
    if (!email.trim())              e.email    = 'Email requis'
    else if (!emailValid)           e.email    = 'Adresse email invalide'
    if (!password)                  e.password = 'Mot de passe requis'
    else if (!passwordValid)        e.password = 'Minimum 8 caractères'
    if (Object.keys(e).length > 0) { setErrors(e); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setLoading(false)
    alert('Connexion réussie !')
  }

  return (
    <div className="fixed inset-0 z-50 flex" style={{ fontFamily: 'Poppins, sans-serif' }}>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-shrink-0">
        <LeftPanel onClose={onClose} onShowRegister={onShowRegister} />
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-white overflow-y-auto">

        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-navy-100"
          style={{ background: '#0F172A' }}>
          <div className="bg-white rounded-lg px-3 py-1.5">
            <img src={logo} alt="YoungPay Collect" className="h-7 w-auto" />
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form container */}
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
                Entrez vos identifiants pour accéder<br className="hidden sm:block" /> à votre espace marchand.
              </p>
            </div>
            <button onClick={onClose}
              className="hidden lg:flex items-center gap-1.5 text-navy-400 hover:text-navy text-sm transition-colors mt-1">
              <X className="w-4 h-4" /> Fermer
            </button>
          </div>

          {/* Email field */}
          <div className="space-y-5 mb-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-navy font-semibold text-sm">Adresse email professionnelle</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@entreprise.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    if (touched.email) validateField('email', e.target.value)
                  }}
                  onBlur={() => {
                    setTouched(t => ({ ...t, email: true }))
                    validateField('email', email)
                  }}
                  className={`w-full rounded-xl border-2 px-4 py-3.5 pr-12 text-sm text-navy font-medium outline-none transition-all duration-200 bg-white placeholder:text-navy-300 ${
                    errors.email && touched.email
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
              {errors.email && touched.email && (
                <p className="text-red-500 text-xs flex items-center gap-1"><span>⚠</span>{errors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-navy font-semibold text-sm">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value)
                    if (touched.password) validateField('password', e.target.value)
                  }}
                  onBlur={() => {
                    setTouched(t => ({ ...t, password: true }))
                    validateField('password', password)
                  }}
                  className={`w-full rounded-xl border-2 px-4 py-3.5 pr-12 text-sm text-navy font-medium outline-none transition-all duration-200 bg-white placeholder:text-navy-300 ${
                    errors.password && touched.password
                      ? 'border-red-400 bg-red-50/40 focus:border-red-400'
                      : passwordValid
                        ? 'border-green-400 focus:border-green-400'
                        : 'border-navy-200 focus:border-amber-400'
                  }`}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-red-500 text-xs flex items-center gap-1"><span>⚠</span>{errors.password}</p>
              )}

              {/* Forgot password */}
              <div className="flex justify-end">
                <button className="text-xs font-semibold transition-colors"
                  style={{ color: '#F97316' }}>
                  Mot de passe oublié ?
                </button>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-white font-bold text-sm transition-all duration-200 disabled:opacity-70 mb-5"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 8px 24px rgba(249,115,22,0.30)' }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Connexion en cours…
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Separator */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-navy-100" />
            <span className="text-navy-300 text-xs font-medium">— ou —</span>
            <div className="flex-1 h-px bg-navy-100" />
          </div>

          {/* Register CTA */}
          <button
            onClick={onShowRegister}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-navy-200 text-navy font-semibold text-sm hover:border-amber-400 hover:text-amber-500 transition-all duration-200 bg-white mb-8"
          >
            Créer un compte gratuit
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-navy-400">
            <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-xs font-medium">Connexion sécurisée SSL 256 bits</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
