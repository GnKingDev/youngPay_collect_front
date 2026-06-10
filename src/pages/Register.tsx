import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, ArrowLeft, Eye, EyeOff, Check,
  TrendingUp, Building2, X,
} from 'lucide-react'
import logo from '../assets/logo.png'

/* ─── Types ─────────────────────────────────────────── */
interface FormData {
  company: string; sector: string; rccm: string; phone: string
  firstName: string; lastName: string; email: string
  password: string; confirmPassword: string
  otp: string[]; acceptCgu: boolean
}
interface Errors { [key: string]: string }

/* ─── Helpers ────────────────────────────────────────── */
function pwStrength(pw: string) {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const strengthMeta = [
  { label: '', color: '#E2E8F0' },
  { label: 'Faible',    color: '#EF4444' },
  { label: 'Moyen',     color: '#F59E0B' },
  { label: 'Fort',      color: '#3B82F6' },
  { label: 'Très fort', color: '#10B981' },
]

/* ─── Mini Dashboard (left panel) ───────────────────── */
const MiniDashboard = () => (
  <div className="w-full max-w-xs mx-auto mt-8">
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/10">
        {['#EF4444','#F59E0B','#22C55E'].map(c => (
          <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
        ))}
        <span className="ml-2 text-white/40 text-xs font-mono">dashboard</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: 'Volume', val: '4.2M GNF', up: true },
            { label: 'Réussite', val: '98.5%', up: true },
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
            {[30,55,40,75,60,90,80,100].map((h, i) => (
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
const LeftPanel = () => {
  const navigate = useNavigate()
  return (
  <div className="relative flex flex-col h-full px-10 py-10 overflow-hidden"
    style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 100%)' }}>

    {/* Orbs */}
    <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 pointer-events-none -translate-y-1/4 translate-x-1/4"
      style={{ background: 'radial-gradient(circle, #F59E0B, #F97316)' }} />
    <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10 pointer-events-none translate-y-1/4 -translate-x-1/4"
      style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />

    {/* Close (mobile) */}
    <button onClick={() => navigate('/')}
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
        Commencez à encaisser{' '}
        <span style={{
          background: 'linear-gradient(135deg, #F59E0B, #F97316)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          en Guinée
        </span>{' '}
        dès aujourd'hui
      </h2>
      <p className="text-white/50 text-sm leading-relaxed mb-8">
        Rejoignez les premiers marchands guinéens qui font confiance à YoungPay Collect.
      </p>

      {/* Benefits */}
      <div className="space-y-3.5">
        {[
          'Accès gratuit au portail',
          'Seulement 1,2% par transaction',
          'Reversement sans frais',
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

      {/* Mini dashboard */}
      <MiniDashboard />
    </div>

    {/* Bottom link */}
    <p className="text-white/40 text-sm text-center mt-6 relative z-10">
      Déjà un compte ?{' '}
      <button onClick={() => navigate('/connexion')}
        className="font-semibold underline underline-offset-2 transition-colors cursor-pointer"
        style={{ color: '#F59E0B' }}>
        Se connecter
      </button>
    </p>
  </div>
  )
}

/* ─── Step Progress Bar ──────────────────────────────── */
const steps = ['Entreprise', 'Compte', 'Vérification']
const ProgressBar = ({ current }: { current: number }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-3">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
              i < current
                ? 'text-white border-transparent'
                : i === current
                  ? 'text-white border-transparent'
                  : 'text-navy-300 border-navy-200 bg-white'
            }`}
              style={i <= current ? { background: 'linear-gradient(135deg, #F59E0B, #F97316)', borderColor: 'transparent' } : {}}>
              {i < current ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
            </div>
            <span className={`text-[11px] mt-1.5 font-medium whitespace-nowrap transition-colors duration-300 ${
              i <= current ? 'text-navy' : 'text-navy-300'
            }`}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-3 mb-5 rounded-full overflow-hidden bg-navy-100">
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: i < current ? '100%' : '0%',
                  background: 'linear-gradient(135deg, #F59E0B, #F97316)'
                }} />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)

/* ─── Input Component ────────────────────────────────── */
const Input = ({
  label, name, type = 'text', placeholder, value, onChange, error, required, suffix, prefix, children
}: {
  label: string; name: string; type?: string; placeholder?: string
  value: string; onChange: (v: string) => void
  error?: string; required?: boolean
  suffix?: React.ReactNode; prefix?: React.ReactNode
  children?: React.ReactNode
}) => {
  const valid = value.length > 0 && !error
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-navy font-semibold text-sm">
        {label}
        {!required && <span className="text-navy-400 font-normal ml-1">(optionnel)</span>}
      </label>
      <div className="relative">
        {prefix && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            {prefix}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`w-full rounded-xl border-2 px-4 py-3.5 text-sm text-navy font-medium outline-none transition-all duration-200 bg-white placeholder:text-navy-300 ${
            prefix ? 'pl-16' : ''
          } ${suffix ? 'pr-12' : ''} ${
            error
              ? 'border-red-400 bg-red-50/50 focus:border-red-400'
              : valid
                ? 'border-green-400 focus:border-green-400'
                : 'border-navy-200 focus:border-amber-400'
          }`}
          style={{ fontFamily: 'Poppins, sans-serif' }}
        />
        {children}
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
        {valid && !suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  )
}

/* ─── Select Component ───────────────────────────────── */
type SelectOption = string | { group: string; items: string[] }

const Select = ({
  label, name, value, onChange, options, error
}: {
  label: string; name: string; value: string
  onChange: (v: string) => void
  options: SelectOption[]; error?: string
}) => {
  const valid = value.length > 0 && !error
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-navy font-semibold text-sm">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`w-full rounded-xl border-2 px-4 py-3.5 text-sm font-medium outline-none transition-all duration-200 bg-white appearance-none cursor-pointer ${
            error ? 'border-red-400 bg-red-50/50' : valid ? 'border-green-400' : 'border-navy-200 focus:border-amber-400'
          } ${value ? 'text-navy' : 'text-navy-300'}`}
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <option value="">Sélectionner un secteur</option>
          {options.map(o =>
            typeof o === 'string'
              ? <option key={o} value={o}>{o}</option>
              : <optgroup key={o.group} label={`── ${o.group}`}>
                  {o.items.map(item => <option key={item} value={item}>{item}</option>)}
                </optgroup>
          )}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-navy-400">
          ▾
        </div>
      </div>
      {error && <p className="text-red-500 text-xs">⚠ {error}</p>}
    </div>
  )
}

/* ─── OTP Input ──────────────────────────────────────── */
const OtpInput = ({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) => {
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return
    const next = [...value]
    next[i] = v.slice(-1)
    onChange(next)
    if (v && i < 5) refs[i + 1].current?.focus()
  }
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs[i - 1].current?.focus()
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200 bg-white text-navy ${
            value[i] ? 'border-amber-400 shadow-sm' : 'border-navy-200 focus:border-amber-400'
          }`}
          style={{ fontFamily: 'Poppins, sans-serif' }}
        />
      ))}
    </div>
  )
}

/* ─── Main Register Page ─────────────────────────────── */
export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [animating, setAnimating] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState<FormData>({
    company: '', sector: '', rccm: '', phone: '',
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '',
    otp: Array(6).fill(''), acceptCgu: false,
  })
  const [errors, setErrors] = useState<Errors>({})

  const set = (field: keyof FormData) => (v: string | boolean) => {
    setForm(f => ({ ...f, [field]: v }))
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  /* validation per step */
  const validate = useCallback(() => {
    const e: Errors = {}
    if (step === 0) {
      if (!form.company.trim())  e.company = 'Nom de l\'entreprise requis'
      if (!form.sector)          e.sector  = 'Veuillez choisir un secteur'
      if (!form.phone.trim())    e.phone   = 'Numéro de téléphone requis'
      else if (!/^\d{8,9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Numéro invalide (8-9 chiffres)'
    }
    if (step === 1) {
      if (!form.firstName.trim()) e.firstName = 'Prénom requis'
      if (!form.lastName.trim())  e.lastName  = 'Nom requis'
      if (!form.email.trim())     e.email     = 'Email requis'
      else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(form.email)) e.email = 'Adresse email invalide'
      if (!form.password)         e.password  = 'Mot de passe requis'
      else if (form.password.length < 8) e.password = 'Minimum 8 caractères'
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas'
    }
    if (step === 2) {
      if (form.otp.filter(Boolean).length < 6) e.otp = 'Entrez le code à 6 chiffres reçu par email'
      if (!form.acceptCgu) e.acceptCgu = 'Vous devez accepter les conditions'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }, [step, form])

  const goNext = async () => {
    if (!validate()) return
    if (step === 2) { handleSubmit(); return }

    if (step === 1) {
      setLoading(true)
      try {
        const res = await fetch('/api/v1/auth/register/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, name: form.company }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Erreur lors de l\'envoi du code')
        if (data.otp_dev) console.info('[dev] OTP inscription:', data.otp_dev)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Erreur lors de l\'envoi du code'
        setErrors({ email: msg })
        setLoading(false)
        return
      }
      setLoading(false)
    }

    setDirection('forward')
    setAnimating(true)
    setTimeout(() => { setStep(s => s + 1); setAnimating(false) }, 250)
  }
  const goBack = () => {
    setDirection('back')
    setAnimating(true)
    setTimeout(() => { setStep(s => s - 1); setAnimating(false) }, 250)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:       form.company,
          first_name: form.firstName,
          last_name:  form.lastName,
          email:      form.email,
          phone:      '+224 ' + form.phone,
          password:   form.password,
          city:       'Conakry',
          sector:     form.sector,
          otp:        form.otp.join(''),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur lors de l\'inscription')
      setSuccess(true)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur lors de l\'inscription'
      setErrors({ submit: msg })
    } finally {
      setLoading(false)
    }
  }

  const pwScore = pwStrength(form.password)

  return (
    <div className="fixed inset-0 z-50 flex" style={{ fontFamily: 'Poppins, sans-serif' }}>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-shrink-0">
        <LeftPanel />
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-white overflow-y-auto">

        {/* ── Success screen ── */}
        {success && (
          <div className="flex flex-col items-center justify-center min-h-full px-8 py-16 text-center"
            style={{ animation: 'fadeInUp 0.4s ease-out both' }}>

            {/* Animated checkmark */}
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                  boxShadow: '0 12px 40px rgba(249,115,22,0.35)',
                  animation: 'scalePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
                }}>
                <Check className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              {/* Ring pulse */}
              <div className="absolute inset-0 rounded-full"
                style={{
                  border: '2px solid #F97316',
                  opacity: 0,
                  animation: 'ringPulse 1s ease-out 0.3s both',
                }} />
            </div>

            <h1 className="font-bold text-3xl text-navy mb-2">
              Compte créé avec succès !
            </h1>
            <p className="text-navy-400 text-base mb-1">
              Bienvenue, <span className="font-semibold text-navy">{form.firstName} {form.lastName}</span>
            </p>
            <p className="text-navy-400 text-sm mb-8 max-w-xs leading-relaxed">
              Votre compte marchand pour{' '}
              <span className="font-semibold text-navy">{form.company}</span>{' '}
              est prêt. Connectez-vous pour commencer à encaisser.
            </p>

            {/* Info card */}
            <div className="w-full max-w-sm bg-[#F8FAFC] rounded-2xl border border-navy-100 p-5 mb-8 text-left space-y-3"
              style={{ animation: 'fadeInUp 0.4s ease-out 0.15s both' }}>
              {[
                { label: 'Email de connexion', value: form.email },
                { label: 'Entreprise',          value: form.company },
                { label: 'Secteur',             value: form.sector },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-navy-400 font-medium">{label}</span>
                  <span className="text-navy font-semibold truncate max-w-[180px]">{value}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="w-full max-w-sm space-y-3"
              style={{ animation: 'fadeInUp 0.4s ease-out 0.25s both' }}>
              <button
                onClick={() => navigate('/connexion')}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 8px 24px rgba(249,115,22,0.35)' }}>
                Se connecter maintenant <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3.5 rounded-xl border-2 border-navy-200 text-navy font-semibold text-sm hover:border-navy-300 hover:bg-navy-50 transition-all duration-200">
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}

        {/* Mobile header */}
        {!success && (
        <>
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-navy-100"
          style={{ background: '#0F172A' }}>
          <div className="bg-white rounded-lg px-3 py-1.5">
            <img src={logo} alt="YoungPay Collect" className="h-7 w-auto" />
          </div>
          <button onClick={() => navigate('/')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-w-lg mx-auto px-8 py-10">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-1">
              <p className="text-navy-400 text-sm">Étape {step + 1} sur 3</p>
              <button onClick={() => navigate('/')} className="hidden lg:flex items-center gap-1.5 text-navy-400 hover:text-navy text-sm transition-colors">
                <X className="w-4 h-4" /> Annuler
              </button>
            </div>
            <ProgressBar current={step} />
          </div>

          {/* Form area with animation */}
          <div
            className="transition-all duration-250"
            style={{
              opacity: animating ? 0 : 1,
              transform: animating
                ? `translateX(${direction === 'forward' ? '20px' : '-20px'})`
                : 'translateX(0)',
            }}
          >

            {/* ── Step 1 ── */}
            {step === 0 && (
              <div>
                <div className="mb-7">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'linear-gradient(135deg, #F59E0B22, #F9731611)' }}>
                    <Building2 className="w-5 h-5" style={{ color: '#F97316' }} />
                  </div>
                  <h1 className="font-bold text-2xl text-navy">Votre entreprise</h1>
                  <p className="text-navy-400 text-sm mt-1">Parlez-nous de votre activité</p>
                </div>

                <div className="space-y-5">
                  <Input label="Nom de l'entreprise" name="company" placeholder="Ex: Conakry Commerce SARL"
                    value={form.company} onChange={set('company')} error={errors.company} required />

                  <Select label="Secteur d'activité" name="sector" value={form.sector} onChange={set('sector')}
                    options={[
                      { group: 'Commerce & Distribution', items: [
                        'E-commerce', 'Commerce de détail', 'Import / Export',
                        'Alimentation & Épicerie', 'Textile & Habillement', 'Électronique & Téléphonie',
                      ]},
                      { group: 'Services', items: [
                        'Restauration & Traiteur', 'Hôtellerie & Hébergement', 'Transport & Logistique',
                        'Livraison express', 'Nettoyage & Entretien', 'Sécurité & Gardiennage',
                      ]},
                      { group: 'Santé & Bien-être', items: [
                        'Santé & Pharmacie', 'Beauté & Cosmétiques', 'Fitness & Sport',
                      ]},
                      { group: 'Éducation & Formation', items: [
                        'Éducation & Formation', 'Auto-école', 'Coaching & Consulting',
                      ]},
                      { group: 'Technologie', items: [
                        'Tech & Informatique', 'Médias & Communication', 'Agence digitale',
                      ]},
                      { group: 'Artisanat & Culture', items: [
                        'Artisanat & Décoration', 'Événementiel & Fêtes', 'Art & Photographie',
                      ]},
                      { group: 'Immobilier & BTP', items: [
                        'Immobilier', 'BTP & Construction', 'Agriculture & Élevage',
                      ]},
                      { group: 'Autres', items: [
                        'Assurance & Finance', 'ONG & Association', 'Autre',
                      ]},
                    ]}
                    error={errors.sector} />

                  <Input label="Numéro RCCM" name="rccm" placeholder="Ex: RCCM/GN/CON/2024/B/XXXX"
                    value={form.rccm} onChange={set('rccm')} error={errors.rccm} required={false} />

                  <Input label="Numéro de téléphone" name="phone" type="tel" placeholder="620 000 000"
                    value={form.phone} onChange={set('phone')} error={errors.phone} required
                    prefix={<span className="text-navy-500 text-sm font-semibold border-r border-navy-200 pr-3">+224</span>} />
                </div>
              </div>
            )}

            {/* ── Step 2 ── */}
            {step === 1 && (
              <div>
                <div className="mb-7">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'linear-gradient(135deg, #F59E0B22, #F9731611)' }}>
                    <span className="text-lg" style={{ color: '#F97316' }}>👤</span>
                  </div>
                  <h1 className="font-bold text-2xl text-navy">Votre compte</h1>
                  <p className="text-navy-400 text-sm mt-1">Créez vos identifiants de connexion</p>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Prénom" name="firstName" placeholder="Moussa"
                      value={form.firstName} onChange={set('firstName')} error={errors.firstName} required />
                    <Input label="Nom" name="lastName" placeholder="Camara"
                      value={form.lastName} onChange={set('lastName')} error={errors.lastName} required />
                  </div>

                  <Input label="Email professionnel" name="email" type="email" placeholder="you@entreprise.com"
                    value={form.email} onChange={set('email')} error={errors.email} required />

                  <div className="flex flex-col gap-1.5">
                    <Input label="Mot de passe" name="password" type={showPw ? 'text' : 'password'}
                      placeholder="Minimum 8 caractères"
                      value={form.password} onChange={set('password')} error={errors.password} required
                      suffix={
                        <button type="button" onClick={() => setShowPw(v => !v)}
                          className="text-navy-400 hover:text-navy transition-colors">
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      } />
                    {form.password && (
                      <div className="space-y-1.5 mt-1">
                        <div className="flex gap-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                              style={{ backgroundColor: i <= pwScore ? strengthMeta[pwScore].color : '#E2E8F0' }} />
                          ))}
                        </div>
                        <p className="text-xs font-medium" style={{ color: strengthMeta[pwScore].color }}>
                          {strengthMeta[pwScore].label}
                        </p>
                      </div>
                    )}
                  </div>

                  <Input label="Confirmer le mot de passe" name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'} placeholder="Répétez votre mot de passe"
                    value={form.confirmPassword} onChange={set('confirmPassword')}
                    error={errors.confirmPassword} required
                    suffix={
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        className="text-navy-400 hover:text-navy transition-colors">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    } />
                </div>
              </div>
            )}

            {/* ── Step 3 ── */}
            {step === 2 && (
              <div>
                <div className="mb-7">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'linear-gradient(135deg, #F59E0B22, #F9731611)' }}>
                    <span className="text-lg" style={{ color: '#F97316' }}>✉</span>
                  </div>
                  <h1 className="font-bold text-2xl text-navy">Vérification email</h1>
                  <p className="text-navy-400 text-sm mt-1">
                    Un code à 6 chiffres a été envoyé à{' '}
                    <span className="font-semibold text-navy">{form.email}</span>
                  </p>
                </div>

                {/* OTP boxes */}
                <div className="mb-6">
                  <OtpInput
                    value={form.otp}
                    onChange={v => { setForm(f => ({ ...f, otp: v })); if (errors.otp) setErrors(e => { const n = { ...e }; delete n.otp; return n }) }}
                  />
                  {errors.otp && <p className="text-red-500 text-xs mt-3 text-center">⚠ {errors.otp}</p>}
                </div>

                {/* Resend */}
                <p className="text-center text-navy-400 text-sm mb-6">
                  Vous n'avez pas reçu le code ?{' '}
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/v1/auth/register/send-otp', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: form.email, name: form.company }),
                        })
                        const data = await res.json()
                        if (data.otp_dev) console.info('[dev] OTP renvoyé:', data.otp_dev)
                      } catch { /* ignore */ }
                    }}
                    className="font-semibold underline underline-offset-2 cursor-pointer"
                    style={{ color: '#F97316' }}
                  >
                    Renvoyer
                  </button>
                </p>

                {/* CGU */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div
                      onClick={() => set('acceptCgu')(!form.acceptCgu)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 cursor-pointer ${
                        form.acceptCgu ? 'border-transparent' : 'border-navy-200 group-hover:border-amber-400'
                      }`}
                      style={form.acceptCgu ? { background: 'linear-gradient(135deg, #F59E0B, #F97316)' } : {}}>
                      {form.acceptCgu && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-navy-500 text-sm leading-relaxed">
                      J'accepte les{' '}
                      <a href="#" className="font-semibold underline underline-offset-2" style={{ color: '#F97316' }}>
                        Conditions Générales d'Utilisation
                      </a>{' '}
                      et la{' '}
                      <a href="#" className="font-semibold underline underline-offset-2" style={{ color: '#F97316' }}>
                        Politique de confidentialité
                      </a>{' '}
                      de YoungPay Collect.
                    </span>
                  </label>
                  {errors.acceptCgu && <p className="text-red-500 text-xs mt-1">⚠ {errors.acceptCgu}</p>}
                </div>
                {errors.submit && <p className="text-red-500 text-xs mt-3 text-center">⚠ {errors.submit}</p>}
              </div>
            )}

          </div>

          {/* Buttons */}
          <div className={`flex gap-3 mt-8 ${step > 0 ? 'flex-row' : 'flex-col'}`}>
            {step > 0 && (
              <button onClick={goBack}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-navy-200 text-navy font-semibold text-sm hover:border-navy-300 transition-all duration-200 hover:bg-navy-50">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
            )}
            <button
              onClick={goNext}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm transition-all duration-200 disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 8px 24px rgba(249,115,22,0.30)' }}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Création en cours...</>
              ) : step === 2 ? (
                <><Check className="w-4 h-4" /> Créer mon compte</>
              ) : (
                <>Continuer <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

          {step === 0 && (
            <p className="text-center text-navy-400 text-xs mt-4">
              Déjà un compte ?{' '}
              <button onClick={() => navigate('/connexion')} className="font-semibold cursor-pointer" style={{ color: '#F97316' }}>
                Se connecter
              </button>
            </p>
          )}
        </div>
        </>
        )}
      </div>

      <style>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scalePop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes ringPulse {
          from { transform: scale(1); opacity: 0.6; }
          to   { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
