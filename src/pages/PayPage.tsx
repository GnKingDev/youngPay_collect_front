import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import logo            from '../assets/logo.webp'
import orangeMoneyLogo from '../assets/orange_money.png'
import mtnLogo         from '../assets/MTN_MOBILE_MONEY.webp'
import soutraLogo      from '../assets/soutra_money.png'
import kuluLogo        from '../assets/kulu.png'
import paycardLogo     from '../assets/paycard.jpg'
import visaLogo        from '../assets/visa-mastercard.svg'

interface LinkData {
  id: string; title: string; amount: number; methods: string[]
  env: 'sandbox' | 'production'
  merchant: { name: string; city: string; sector: string }
}
type Step = 'loading' | 'error' | 'expired' | 'select' | 'phone' | 'pending' | 'success' | 'failed'

const OPERATORS: Record<string, { label: string; logo: string }> = {
  orange_money: { label: 'Orange Money',   logo: orangeMoneyLogo },
  mtn:          { label: 'MTN Mobile',     logo: mtnLogo },
  soutra:       { label: 'Soutra Money',   logo: soutraLogo },
  kulu:         { label: 'KULU',           logo: kuluLogo },
  paycard:      { label: 'PayCard',        logo: paycardLogo },
  card:         { label: 'Carte bancaire', logo: visaLogo },
}

const fmt = (n: number) => {
  const s = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n))
  return s.replace(/\s/g, ' ') + ' GNF'
}

export default function PayPage() {
  const { linkId } = useParams<{ linkId: string }>()
  const [step, setStep]           = useState<Step>('loading')
  const [link, setLink]           = useState<LinkData | null>(null)
  const [operator, setOperator]   = useState('')
  const [phone, setPhone]         = useState('')
  const [txId, setTxId]           = useState('')
  const [paying, setPaying]       = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const [animateIn, setAnimateIn] = useState(false)
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* ── Load link ── */
  useEffect(() => {
    if (!linkId) { setStep('error'); return }
    fetch(`/api/v1/pay/link/${linkId}`)
      .then(r => r.ok ? r.json() : r.json().then((e: { error?: string }) => Promise.reject(e)))
      .then((data: LinkData) => {
        setLink(data)
        setStep('select')
        setTimeout(() => setAnimateIn(true), 30)
      })
      .catch((err: { error?: string }) => {
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
    } catch { /* ignore */ } finally { setPaying(false) }
  }

  const op = OPERATORS[operator]
  const S = { fontFamily: 'DM Sans, sans-serif' }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-white flex flex-col" style={S}>

        {/* Header */}
        <header className="relative flex items-center justify-center px-5 pt-6 pb-4">
          <img src={logo} alt="YoungPay" className="h-7 w-auto" />
          {link?.env === 'sandbox' && (
            <span className="absolute right-5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: '#FEF3C7', color: '#D97706' }}>
              ⚡ Sandbox
            </span>
          )}
        </header>

        <main className="flex-1 px-5 pb-8 max-w-sm mx-auto w-full">

          {/* LOADING — skeleton fidèle à la vraie page */}
          {step === 'loading' && (
            <div className="mt-4 animate-pulse">

              {/* Skeleton carte marchande */}
              <div className="rounded-2xl border border-gray-100 p-4 mb-6"
                style={{ background: '#F9FAFB' }}>
                {/* Avatar + nom */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-200 rounded-full w-2/3" />
                    <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
                  </div>
                </div>
                {/* Titre */}
                <div className="h-2.5 bg-gray-200 rounded-full w-1/3 mb-2" />
                {/* Montant */}
                <div className="h-10 bg-gray-200 rounded-xl w-3/4" />
                {/* Séparateur */}
                <div className="mt-3 h-px bg-gray-100" />
              </div>

              {/* Label "Moyen de paiement" */}
              <div className="h-2.5 bg-gray-200 rounded-full w-1/3 mb-3" />

              {/* Grille opérateurs */}
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="rounded-2xl border border-gray-100 py-5 px-3 flex flex-col items-center gap-2.5"
                    style={{ background: '#FAFAFA' }}>
                    <div className="w-12 h-10 bg-gray-200 rounded-lg" />
                    <div className="h-2.5 bg-gray-200 rounded-full w-2/3" />
                  </div>
                ))}
              </div>

              {/* Indicateur de chargement discret en bas */}
              <div className="flex items-center justify-center gap-2 mt-8">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-orange-400 animate-spin" />
                <span className="text-xs text-gray-400" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  Chargement du lien…
                </span>
              </div>
            </div>
          )}

          {/* ERROR */}
          {step === 'error' && (
            <div className="mt-20 text-center">
              <div className="text-5xl mb-4">🔗</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Lien introuvable</h2>
              <p className="text-gray-500 text-sm">Ce lien de paiement n'existe pas ou a été désactivé.</p>
            </div>
          )}

          {/* EXPIRED */}
          {step === 'expired' && (
            <div className="mt-20 text-center">
              <div className="text-5xl mb-4">⏰</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Lien expiré</h2>
              <p className="text-gray-500 text-sm">Ce lien a expiré. Contactez le marchand.</p>
            </div>
          )}

          {/* SELECT OPERATOR */}
          {step === 'select' && link && (
            <div style={{ opacity: animateIn ? 1 : 0, transform: animateIn ? 'none' : 'translateY(16px)', transition: 'all 0.35s ease-out' }}>

              {/* Merchant card */}
              <div className="mt-4 rounded-2xl border border-gray-100 p-4 mb-6"
                style={{ background: '#F9FAFB', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)' }}>
                    {link.merchant.name.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{link.merchant.name}</p>
                    <p className="text-gray-400 text-xs">{link.merchant.city} · {link.merchant.sector}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-xs uppercase tracking-widest font-medium mb-1">{link.title}</p>
                <p className="font-bold leading-none" style={{ fontSize: 40, color: '#F97316' }}>{fmt(link.amount)}</p>
                <div className="mt-3 h-px" style={{ background: 'linear-gradient(90deg,#F59E0B40,#F9731640,transparent)' }} />
              </div>

              {/* Operators */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Moyen de paiement</p>
              <div className="grid grid-cols-2 gap-3">
                {link.methods.map(m => {
                  const meta = OPERATORS[m]
                  if (!meta) return null
                  const sel = operator === m
                  return (
                    <button key={m} onClick={() => { setOperator(m); setAnimateIn(false); setTimeout(() => { setStep('phone'); setAnimateIn(true) }, 50) }}
                      className="relative flex flex-col items-center justify-center gap-2.5 py-5 px-3 rounded-2xl border-2 transition-all duration-200 active:scale-95"
                      style={{
                        borderColor: sel ? '#F97316' : '#E5E7EB',
                        background:  sel ? 'rgba(249,115,22,0.04)' : '#FFFFFF',
                        boxShadow:   sel ? '0 4px 20px rgba(249,115,22,0.15)' : '0 1px 4px rgba(0,0,0,0.05)',
                        transform:   sel ? 'scale(1.02)' : 'scale(1)',
                      }}>
                      {sel && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]"
                          style={{ background: '#F97316' }}>✓</span>
                      )}
                      <img src={meta.logo} alt={meta.label} className="h-10 w-auto object-contain" />
                      <span className="text-xs font-semibold text-center leading-tight" style={{ color: '#374151' }}>{meta.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* PHONE INPUT */}
          {step === 'phone' && link && op && (
            <div style={{ opacity: animateIn ? 1 : 0, transform: animateIn ? 'none' : 'translateY(16px)', transition: 'all 0.3s ease-out' }}>

              {/* Back + operator */}
              <div className="flex items-center gap-3 mt-4 mb-6">
                <button onClick={() => { setAnimateIn(false); setTimeout(() => { setStep('select'); setAnimateIn(true) }, 50) }}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                  ←
                </button>
                <img src={op.logo} alt={op.label} className="h-8 w-auto object-contain" />
                <span className="font-semibold text-gray-800 text-sm">{op.label}</span>
              </div>

              {/* Amount recap */}
              <div className="text-center mb-8">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{link.title}</p>
                <p className="font-bold" style={{ fontSize: 44, color: '#F97316', lineHeight: 1 }}>{fmt(link.amount)}</p>
              </div>

              {/* Phone field */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Numéro {op.label}
                </label>
                <div className="flex rounded-2xl overflow-hidden border-2 transition-all focus-within:border-orange-400"
                  style={{ borderColor: '#E5E7EB' }}>
                  <div className="flex items-center px-4 py-3.5 border-r border-gray-200" style={{ background: '#F9FAFB' }}>
                    <span className="text-sm font-bold text-gray-600">+224</span>
                  </div>
                  <input type="tel" inputMode="numeric" placeholder="620 000 000" value={phone}
                    onChange={e => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                    className="flex-1 px-4 py-3.5 text-base font-semibold text-gray-900 outline-none bg-white"
                    style={S} autoFocus />
                </div>
                {phone && !/^\d{8,9}$/.test(phone.replace(/\s/g,'')) && (
                  <p className="text-red-400 text-xs mt-1.5">Numéro invalide (8 ou 9 chiffres)</p>
                )}
              </div>

              <button onClick={handlePay} disabled={paying || !/^\d{8,9}$/.test(phone.replace(/\s/g,''))}
                className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', boxShadow: '0 8px 24px rgba(249,115,22,0.35)' }}>
                {paying
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Traitement…
                    </span>
                  : `Payer ${fmt(link.amount)}`}
              </button>
              <p className="text-center text-gray-400 text-xs mt-4">🔒 Paiement sécurisé YoungPay Collect</p>
            </div>
          )}

          {/* PENDING */}
          {step === 'pending' && (
            <div className="mt-16 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: '#F97316', animationDuration: '1.5s' }} />
                <div className="absolute inset-2 rounded-full animate-ping opacity-15" style={{ background: '#F97316', animationDuration: '1.8s', animationDelay: '0.3s' }} />
                <div className="relative w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', boxShadow: '0 8px 32px rgba(249,115,22,0.35)' }}>
                  <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">En attente de confirmation</h2>
              <p className="text-gray-500 text-sm mb-1">{op?.label}</p>
              <p className="text-gray-400 text-sm mb-6">Vérifiez votre téléphone et validez le paiement</p>
              <div className="bg-amber-50 rounded-2xl p-4 mb-5 text-left">
                <p className="text-amber-700 text-xs font-medium">💡 Une notification a été envoyée sur votre téléphone. Approuvez-la pour valider.</p>
              </div>
              <button onClick={async () => {
                try {
                  const r = await fetch(`/api/v1/pay/status/${txId}`)
                  const d = await r.json()
                  if (d.status === 'SUCCESS') setStep('success')
                  if (d.status === 'FAILED') setStep('failed')
                } catch { /* ignore */ }
              }} className="text-sm font-semibold px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-orange-300 transition-colors">
                Vérifier {pollCount > 0 && `(${pollCount}/10)`}
              </button>
            </div>
          )}

          {/* SUCCESS */}
          {step === 'success' && link && (
            <div className="mt-12 text-center" style={{ animation: 'scalePop 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-30" />
                <div className="relative w-24 h-24 rounded-full bg-green-500 flex items-center justify-center"
                  style={{ boxShadow: '0 8px 32px rgba(16,185,129,0.4)' }}>
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Paiement réussi !</h2>
              <p className="text-green-600 font-bold text-xl mb-5">{fmt(link.amount)}</p>
              <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Marchand</span>
                  <span className="font-semibold text-gray-800">{link.merchant.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Opérateur</span>
                  <span className="font-semibold text-gray-800">{op?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Référence</span>
                  <span className="font-mono text-xs text-gray-600">{txId}</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-5">Vous pouvez fermer cette page. Merci !</p>
            </div>
          )}

          {/* FAILED */}
          {step === 'failed' && (
            <div className="mt-12 text-center">
              <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6"
                style={{ animation: 'scalePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both', boxShadow: '0 8px 24px rgba(239,68,68,0.2)' }}>
                <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement échoué</h2>
              <p className="text-gray-400 text-sm mb-8">Le paiement n'a pas pu être traité.</p>
              <div className="flex gap-3">
                <button onClick={() => { setOperator(''); setPhone(''); setStep('select'); setTimeout(() => setAnimateIn(true), 30) }}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}>
                  Réessayer
                </button>
                <button onClick={() => window.close()}
                  className="flex-1 py-3.5 rounded-2xl font-semibold text-gray-600 text-sm border-2 border-gray-200 hover:border-gray-300 transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="text-center py-4">
          <p className="text-gray-300 text-xs">Sécurisé par <span className="text-gray-400 font-semibold">YoungPay Collect</span> · Guinée</p>
        </footer>
      </div>

      <style>{`
        @keyframes scalePop {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  )
}
