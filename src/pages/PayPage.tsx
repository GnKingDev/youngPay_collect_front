import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import logo from '../assets/logo.png'

/* ─── Types ───────────────────────────────────────────── */
interface LinkData {
  id: string
  title: string
  amount: number
  methods: string[]
  env: 'sandbox' | 'production'
  merchant: { name: string; city: string; sector: string }
}

type Step = 'loading' | 'error' | 'expired' | 'select' | 'phone' | 'pending' | 'success' | 'failed'

/* ─── Operator meta ───────────────────────────────────── */
const OPERATORS: Record<string, { label: string; color: string; bg: string; initials: string }> = {
  orange_money: { label: 'Orange Money',   color: '#FF6200', bg: '#FF620015', initials: 'OM' },
  mtn:          { label: 'MTN Mobile',     color: '#E6B800', bg: '#FFCD0015', initials: 'MT' },
  soutra:       { label: 'Soutra Money',   color: '#10B981', bg: '#10B98115', initials: 'SM' },
  kulu:         { label: 'KULU',           color: '#8B5CF6', bg: '#8B5CF615', initials: 'KU' },
  paycard:      { label: 'PayCard',        color: '#F59E0B', bg: '#F59E0B15', initials: 'PC' },
  card:         { label: 'Carte bancaire', color: '#1A56DB', bg: '#1A56DB15', initials: 'CB' },
}

/* ─── Helpers ─────────────────────────────────────────── */
const fmt = (n: number) =>
  n.toLocaleString('fr-FR').replace(/ /g, ' ') + ' GNF'

/* ─── Skeleton ────────────────────────────────────────── */
const Skeleton = () => (
  <div className="animate-pulse space-y-4 px-1">
    <div className="h-4 bg-slate-200 rounded-full w-2/3 mx-auto" />
    <div className="h-14 bg-slate-200 rounded-2xl w-full" />
    <div className="h-4 bg-slate-200 rounded-full w-1/2 mx-auto" />
    <div className="grid grid-cols-2 gap-3">
      {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-200 rounded-2xl" />)}
    </div>
  </div>
)

/* ─── Main ────────────────────────────────────────────── */
export default function PayPage() {
  const { linkId } = useParams<{ linkId: string }>()
  const [step, setStep]         = useState<Step>('loading')
  const [link, setLink]         = useState<LinkData | null>(null)
  const [operator, setOperator] = useState('')
  const [phone, setPhone]       = useState('')
  const [txId, setTxId]         = useState('')
  const [paying, setPaying]     = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const [animateIn, setAnimateIn] = useState(false)
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* ── Load link ── */
  useEffect(() => {
    if (!linkId) { setStep('error'); return }
    fetch(`/api/v1/pay/link/${linkId}`)
      .then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e)))
      .then(data => {
        setLink(data)
        setStep('select')
        setTimeout(() => setAnimateIn(true), 30)
      })
      .catch(err => {
        setStep(err?.error?.includes('expiré') ? 'expired' : 'error')
      })
  }, [linkId])

  /* ── Polling ── */
  useEffect(() => {
    if (step !== 'pending' || !txId) return
    let count = 0
    pollerRef.current = setInterval(async () => {
      count++
      setPollCount(count)
      try {
        const r = await fetch(`/api/v1/pay/status/${txId}`)
        const d = await r.json()
        if (d.status === 'SUCCESS') { clearInterval(pollerRef.current!); setStep('success') }
        if (d.status === 'FAILED')  { clearInterval(pollerRef.current!); setStep('failed')  }
        if (count >= 10)            { clearInterval(pollerRef.current!) }
      } catch { /* ignore */ }
    }, 3000)
    return () => { if (pollerRef.current) clearInterval(pollerRef.current) }
  }, [step, txId])

  /* ── Checkout ── */
  const handlePay = async () => {
    if (!link || !phone || !operator) return
    const phoneNum = phone.replace(/\s/g, '')
    if (!/^\d{8,9}$/.test(phoneNum)) return
    setPaying(true)
    try {
      const r = await fetch(`/api/v1/pay/link/${linkId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+224' + phoneNum, operator }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Erreur')
      setTxId(d.transaction_id)
      setPollCount(0)
      setStep('pending')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur lors du paiement')
    } finally {
      setPaying(false)
    }
  }

  const resetToStart = () => {
    setOperator(''); setPhone(''); setTxId('')
    setStep('select')
    setTimeout(() => setAnimateIn(true), 30)
  }

  const op = OPERATORS[operator]

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          fontFamily: 'Poppins, sans-serif',
        }}>

        {/* Background orbs */}
        <div className="absolute pointer-events-none"
          style={{ top: '-10%', right: '-10%', width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)' }} />
        <div className="absolute pointer-events-none"
          style={{ bottom: '-10%', left: '-10%', width: 350, height: 350, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />

        {/* Card */}
        <div className="w-full max-w-md relative z-10"
          style={{
            opacity: animateIn || step === 'loading' ? 1 : 0,
            transform: animateIn || step === 'loading' ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.35s ease-out, transform 0.35s ease-out',
          }}>

          {/* Logo header */}
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="bg-white rounded-xl px-3 py-2 inline-flex shadow-lg">
              <img src={logo} alt="YoungPay Collect" className="h-7 w-auto" />
            </div>
            {link && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={link.env === 'sandbox'
                  ? { background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }
                  : { background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                {link.env === 'sandbox' ? '⚡ Sandbox' : '✓ Production'}
              </span>
            )}
          </div>

          {/* Main card */}
          <div className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.2)' }}>

            {/* ── LOADING ── */}
            {step === 'loading' && (
              <div className="p-8"><Skeleton /></div>
            )}

            {/* ── ERROR ── */}
            {step === 'error' && (
              <div className="p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔗</span>
                </div>
                <h2 className="font-bold text-xl text-slate-800 mb-2">Lien introuvable</h2>
                <p className="text-slate-400 text-sm">Ce lien de paiement n'existe pas ou a été désactivé.</p>
              </div>
            )}

            {/* ── EXPIRED ── */}
            {step === 'expired' && (
              <div className="p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⏰</span>
                </div>
                <h2 className="font-bold text-xl text-slate-800 mb-2">Lien expiré</h2>
                <p className="text-slate-400 text-sm">Ce lien de paiement a expiré. Contactez le marchand.</p>
              </div>
            )}

            {/* ── SELECT OPERATOR ── */}
            {step === 'select' && link && (
              <div>
                {/* Merchant + amount header */}
                <div className="px-7 pt-7 pb-5"
                  style={{ background: 'linear-gradient(160deg, #0F172A, #1E293B)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                      {link.merchant.name.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm leading-tight">{link.merchant.name}</p>
                      <p className="text-white/40 text-xs">{link.merchant.city} · {link.merchant.sector}</p>
                    </div>
                  </div>
                  <p className="text-white/50 text-xs uppercase tracking-widest font-medium mb-1">{link.title}</p>
                  <p className="font-extrabold text-4xl leading-none"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                    {fmt(link.amount)}
                  </p>
                </div>

                {/* Operator grid */}
                <div className="p-6">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                    Choisir un moyen de paiement
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {link.methods.map(m => {
                      const meta = OPERATORS[m] ?? { label: m, color: '#94A3B8', bg: '#94A3B815', initials: m.slice(0,2).toUpperCase() }
                      const selected = operator === m
                      return (
                        <button key={m}
                          onClick={() => { setOperator(m); setTimeout(() => { setAnimateIn(false); setTimeout(() => { setStep('phone'); setAnimateIn(true) }, 50) }, 0) }}
                          className="relative flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200"
                          style={{
                            borderColor:   selected ? '#F97316' : '#E2E8F0',
                            background:    selected ? meta.bg : '#FAFAFA',
                            transform:     selected ? 'scale(1.02)' : 'scale(1)',
                            boxShadow:     selected ? `0 4px 20px ${meta.color}30` : 'none',
                          }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                            style={{ background: meta.bg, color: meta.color, border: `1.5px solid ${meta.color}40` }}>
                            {meta.initials}
                          </div>
                          <span className="font-semibold text-slate-700 text-sm leading-tight">{meta.label}</span>
                          {selected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── PHONE INPUT ── */}
            {step === 'phone' && link && op && (
              <div>
                {/* Header */}
                <div className="flex items-center gap-3 px-6 pt-6 pb-5 border-b border-slate-100">
                  <button onClick={() => { setAnimateIn(false); setTimeout(() => { setStep('select'); setAnimateIn(true) }, 50) }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{ background: op.bg, color: op.color, border: `1.5px solid ${op.color}40` }}>
                      {op.initials}
                    </div>
                    <span className="font-semibold text-slate-700 text-sm">{op.label}</span>
                  </div>
                </div>

                <div className="p-7">
                  {/* Amount recap */}
                  <div className="text-center mb-7">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">{link.title}</p>
                    <p className="font-extrabold text-3xl"
                      style={{
                        background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>
                      {fmt(link.amount)}
                    </p>
                  </div>

                  {/* Phone field */}
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Numéro {op.label}
                    </label>
                    <div className="flex rounded-2xl overflow-hidden border-2 transition-all duration-200 focus-within:border-orange-400"
                      style={{ borderColor: '#E2E8F0' }}>
                      <div className="flex items-center px-4 py-3.5 bg-slate-50 border-r border-slate-200">
                        <span className="text-sm font-bold text-slate-600">+224</span>
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="620 000 000"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                        className="flex-1 px-4 py-3.5 text-base font-semibold text-slate-800 outline-none bg-white"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                        autoFocus
                      />
                    </div>
                    {phone && !/^\d{8,9}$/.test(phone.replace(/\s/g, '')) && (
                      <p className="text-red-400 text-xs mt-1.5 ml-1">Numéro invalide (8 ou 9 chiffres)</p>
                    )}
                  </div>

                  {/* Pay button */}
                  <button
                    onClick={handlePay}
                    disabled={paying || !/^\d{8,9}$/.test(phone.replace(/\s/g, ''))}
                    className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                      boxShadow: '0 8px 32px rgba(249,115,22,0.40)',
                    }}>
                    {paying ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Traitement…
                      </span>
                    ) : `Payer ${fmt(link.amount)}`}
                  </button>

                  <p className="text-center text-slate-400 text-xs mt-4">
                    🔒 Paiement sécurisé par YoungPay Collect
                  </p>
                </div>
              </div>
            )}

            {/* ── PENDING ── */}
            {step === 'pending' && link && (
              <div className="p-10 text-center">
                {/* Animated rings */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full opacity-20 animate-ping"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }} />
                  <div className="absolute inset-2 rounded-full opacity-30 animate-ping"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', animationDelay: '0.3s' }} />
                  <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                    <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  </div>
                </div>
                <h2 className="font-bold text-xl text-slate-800 mb-2">En attente de confirmation</h2>
                <p className="text-slate-500 text-sm mb-1">{op?.label ?? 'Opérateur'}</p>
                <p className="text-slate-400 text-sm mb-6">Vérifiez votre téléphone et validez le paiement</p>
                <div className="bg-amber-50 rounded-2xl p-4 mb-6 text-left">
                  <p className="text-amber-700 text-xs font-medium">💡 Une notification a été envoyée sur votre téléphone. Approuvez-la pour valider votre paiement.</p>
                </div>
                <button onClick={async () => {
                  try {
                    const r = await fetch(`/api/v1/pay/status/${txId}`)
                    const d = await r.json()
                    if (d.status === 'SUCCESS') setStep('success')
                    if (d.status === 'FAILED')  setStep('failed')
                  } catch { /* ignore */ }
                }}
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 hover:border-orange-300 transition-colors">
                  Vérifier le statut {pollCount > 0 && `(${pollCount}/10)`}
                </button>
              </div>
            )}

            {/* ── SUCCESS ── */}
            {step === 'success' && link && (
              <div className="p-10 text-center" style={{ animation: 'scalePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-40" />
                  <div className="relative w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                    style={{ boxShadow: '0 8px 32px rgba(16,185,129,0.4)' }}>
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="font-extrabold text-2xl text-slate-800 mb-1">Paiement réussi !</h2>
                <p className="text-green-600 font-bold text-xl mb-4">{fmt(link.amount)}</p>
                <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Marchand</span>
                    <span className="font-semibold text-slate-700">{link.merchant.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Référence</span>
                    <span className="font-mono text-xs text-slate-600">{txId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Opérateur</span>
                    <span className="font-semibold text-slate-700">{op?.label}</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs">Vous pouvez fermer cette page. Merci !</p>
              </div>
            )}

            {/* ── FAILED ── */}
            {step === 'failed' && (
              <div className="p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6"
                  style={{ animation: 'scalePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both', boxShadow: '0 8px 32px rgba(239,68,68,0.25)' }}>
                  <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="font-extrabold text-2xl text-slate-800 mb-2">Paiement échoué</h2>
                <p className="text-slate-400 text-sm mb-8">Le paiement n'a pas pu être traité. Vérifiez votre solde ou réessayez.</p>
                <div className="flex gap-3">
                  <button onClick={resetToStart}
                    className="flex-1 py-3.5 rounded-2xl font-bold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}>
                    Réessayer
                  </button>
                  <button onClick={() => window.close()}
                    className="flex-1 py-3.5 rounded-2xl font-semibold text-slate-600 text-sm border-2 border-slate-200 hover:border-slate-300 transition-colors">
                    Annuler
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <p className="text-center text-white/25 text-xs mt-5">
            Sécurisé par <span className="text-white/40 font-semibold">YoungPay Collect</span> · Guinée
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scalePop {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </>
  )
}
