import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import logo            from '../assets/logo.webp'
import orangeMoneyLogo from '../assets/orange_money.png'
import mtnLogo         from '../assets/MTN_MOBILE_MONEY.webp'
import soutraLogo      from '../assets/soutra_money.png'
import kuluLogo        from '../assets/kulu.png'
import paycardLogo     from '../assets/paycard.jpg'
import visaLogo        from '../assets/visa-mastercard.svg'

interface TxData {
  transaction_id: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED'
  amount: number
  operator: string
  description?: string
  env?: 'sandbox' | 'production'
  phone?: string
  merchant?: { name: string; city: string; sector: string }
}

type Step = 'loading' | 'form' | 'pending' | 'success' | 'failed' | 'error'

const S = { fontFamily: 'DM Sans, sans-serif' }

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n)).replace(/\s/g, ' ') + ' GNF'

function amountFs(n: number, base: number): number {
  const len = fmt(n).length
  if (len <= 10) return base
  if (len <= 12) return Math.round(base * 0.82)
  if (len <= 14) return Math.round(base * 0.65)
  return Math.round(base * 0.52)
}

const OPERATORS: Record<string, { label: string; logo: string }> = {
  orange_money: { label: 'Orange Money',   logo: orangeMoneyLogo },
  mtn:          { label: 'MTN Mobile',     logo: mtnLogo },
  soutra:       { label: 'Soutra Money',   logo: soutraLogo },
  kulu:         { label: 'KULU',           logo: kuluLogo },
  paycard:      { label: 'PayCard',        logo: paycardLogo },
  card:         { label: 'Carte bancaire', logo: visaLogo },
}

export default function ResultPage() {
  const { transactionId } = useParams<{ transactionId: string }>()
  const [tx, setTx]       = useState<TxData | null>(null)
  const [step, setStep]   = useState<Step>('loading')
  const [phone, setPhone] = useState('')
  const [paying, setPaying] = useState(false)
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = () => { if (pollerRef.current) clearInterval(pollerRef.current) }

  /* ── Chargement initial ── */
  useEffect(() => {
    if (!transactionId) { setStep('error'); return }

    fetch(`/api/v1/pay/tx/${transactionId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: TxData) => {
        setTx(d)
        if (d.status === 'SUCCESS')                    setStep('success')
        else if (d.status === 'FAILED' || d.status === 'EXPIRED') setStep('failed')
        else if (!d.phone)                             setStep('form')
        else                                           startPolling()
      })
      .catch(() => setStep('error'))

    return stopPolling
  }, [transactionId])

  /* ── Polling statut ── */
  const startPolling = () => {
    setStep('pending')
    pollerRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/v1/pay/status/${transactionId}`)
        const d = await r.json()
        if (d.status === 'SUCCESS') { stopPolling(); setTx(prev => prev ? { ...prev, ...d } : d); setStep('success') }
        if (d.status === 'FAILED')  { stopPolling(); setTx(prev => prev ? { ...prev, ...d } : d); setStep('failed')  }
      } catch { /* ignore */ }
    }, 3000)
  }

  /* ── Payer ── */
  const handlePay = async () => {
    if (!tx || !phone) return
    const phoneNum = phone.replace(/\s/g, '')
    if (!/^\d{8,9}$/.test(phoneNum)) return
    setPaying(true)
    try {
      const r = await fetch(`/api/v1/pay/tx/${transactionId}/checkout`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: '+224' + phoneNum }),
      })
      if (!r.ok) return
      setTx(prev => prev ? { ...prev, phone: '+224' + phoneNum } : prev)
      startPolling()
    } catch { /* ignore */ } finally { setPaying(false) }
  }

  const op = tx ? OPERATORS[tx.operator] : null

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-white flex flex-col" style={S}>

        {/* Header */}
        <header className="relative flex items-center justify-center px-5 pt-6 pb-4">
          <img src={logo} alt="YoungPay" className="h-7 w-auto" />
          {tx?.env === 'sandbox' && (
            <span className="absolute right-5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: '#FEF3C7', color: '#D97706' }}>
              ⚡ Sandbox
            </span>
          )}
        </header>

        <main className="flex-1 flex items-center justify-center px-5 pb-16">
          <div className="w-full max-w-sm">

            {/* LOADING */}
            {step === 'loading' && (
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-gray-100" />
                <div className="h-4 bg-gray-100 rounded-full w-2/3" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2" />
              </div>
            )}

            {/* FORM — saisie du numéro de téléphone */}
            {step === 'form' && tx && (
              <div style={{ animation: 'fadeUp 0.3s ease-out both' }}>

                {/* Merchant card */}
                <div className="rounded-2xl border border-gray-100 p-4 mb-6"
                  style={{ background: '#F9FAFB', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                  {tx.merchant && (
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)' }}>
                        {tx.merchant.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm leading-tight">{tx.merchant.name}</p>
                        <p className="text-gray-400 text-xs">{tx.merchant.city} · {tx.merchant.sector}</p>
                      </div>
                    </div>
                  )}
                  <p className="text-gray-400 text-xs uppercase tracking-widest font-medium mb-1">{tx.description}</p>
                  <p className="font-bold leading-none" style={{ fontSize: amountFs(tx.amount, 40), color: '#F97316' }}>{fmt(tx.amount)}</p>
                  <div className="mt-3 h-px" style={{ background: 'linear-gradient(90deg,#F59E0B40,#F9731640,transparent)' }} />
                </div>

                {/* Opérateur sélectionné */}
                {op && (
                  <div className="flex items-center gap-3 mb-5 px-1">
                    <img src={op.logo} alt={op.label} className="h-8 w-auto object-contain" />
                    <span className="font-semibold text-gray-800 text-sm">{op.label}</span>
                  </div>
                )}

                {/* Numéro de téléphone */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Numéro {op?.label ?? tx.operator}
                  </label>
                  <div className="flex rounded-2xl overflow-hidden border-2 transition-all focus-within:border-orange-400"
                    style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center px-4 py-3.5 border-r border-gray-200" style={{ background: '#F9FAFB' }}>
                      <span className="text-sm font-bold text-gray-600">+224</span>
                    </div>
                    <input
                      type="tel" inputMode="numeric" placeholder="620 000 000"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                      className="flex-1 px-4 py-3.5 text-base font-semibold text-gray-900 outline-none bg-white"
                      style={S} autoFocus
                    />
                  </div>
                  {phone && !/^\d{8,9}$/.test(phone.replace(/\s/g, '')) && (
                    <p className="text-red-400 text-xs mt-1.5">Numéro invalide (8 ou 9 chiffres)</p>
                  )}
                </div>

                <button
                  onClick={handlePay}
                  disabled={paying || !/^\d{8,9}$/.test(phone.replace(/\s/g, ''))}
                  className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', boxShadow: '0 8px 24px rgba(249,115,22,0.35)' }}>
                  {paying
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Traitement…
                      </span>
                    : `Payer ${fmt(tx.amount)}`}
                </button>
                <p className="text-center text-gray-400 text-xs mt-4">🔒 Paiement sécurisé YoungPay Collect</p>
              </div>
            )}

            {/* PENDING */}
            {step === 'pending' && tx && (
              <div className="flex flex-col items-center gap-5 text-center" style={{ animation: 'fadeUp 0.3s ease-out both' }}>
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: '#F97316', animationDuration: '1.5s' }} />
                  <div className="w-20 h-20 rounded-full border-4 border-amber-200 border-t-amber-400 animate-spin" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">En attente de confirmation</p>
                  <p className="text-sm text-gray-400 mt-1">Vérifiez votre téléphone et validez</p>
                </div>
                <div className="w-full rounded-2xl border border-gray-100 p-4 text-left" style={{ background: '#F9FAFB' }}>
                  <Row label="Montant"   value={fmt(tx.amount)} />
                  <Row label="Opérateur" value={op?.label ?? tx.operator} />
                  {tx.phone && <Row label="Numéro" value={tx.phone} />}
                  <Row label="Référence" value={tx.transaction_id} mono />
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 w-full text-left">
                  <p className="text-amber-700 text-xs font-medium">💡 Une notification a été envoyée sur votre téléphone. Approuvez-la pour valider.</p>
                </div>
              </div>
            )}

            {/* SUCCESS */}
            {step === 'success' && tx && (
              <div className="flex flex-col items-center gap-5 text-center" style={{ animation: 'fadeUp 0.3s ease-out both' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #D1FAE5, #6EE7B7)', boxShadow: '0 8px 32px rgba(16,185,129,0.3)' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xl">Paiement réussi !</p>
                  <p className="font-bold mt-1" style={{ fontSize: amountFs(tx.amount, 28), color: '#059669' }}>{fmt(tx.amount)}</p>
                  <p className="text-sm text-gray-400 mt-1">via {op?.label ?? tx.operator}</p>
                </div>
                <div className="w-full rounded-2xl border border-gray-100 p-4 text-left" style={{ background: '#F9FAFB' }}>
                  {tx.merchant && <Row label="Marchand" value={tx.merchant.name} />}
                  {tx.phone    && <Row label="Numéro"   value={tx.phone} />}
                  <Row label="Référence" value={tx.transaction_id} mono />
                </div>
                <p className="text-xs text-gray-300">Vous pouvez fermer cette page. Merci !</p>
              </div>
            )}

            {/* FAILED */}
            {step === 'failed' && tx && (
              <div className="flex flex-col items-center gap-5 text-center" style={{ animation: 'fadeUp 0.3s ease-out both' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FEE2E2, #FCA5A5)', boxShadow: '0 8px 24px rgba(239,68,68,0.2)' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12M18 6L6 18" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xl">Paiement échoué</p>
                  <p className="text-sm text-gray-400 mt-1">La transaction n'a pas abouti</p>
                </div>
                <div className="w-full rounded-2xl border border-gray-100 p-4 text-left" style={{ background: '#F9FAFB' }}>
                  <Row label="Montant"   value={fmt(tx.amount)} />
                  <Row label="Référence" value={tx.transaction_id} mono />
                </div>
                <p className="text-xs text-gray-300">Vous pouvez fermer cette page</p>
              </div>
            )}

            {/* ERROR */}
            {step === 'error' && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                      stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-700">Transaction introuvable</p>
                <p className="text-sm text-gray-400">Ce lien est invalide ou a expiré</p>
              </div>
            )}

          </div>
        </main>

        <footer className="pb-6 flex justify-center">
          <p className="text-xs text-gray-300">Sécurisé par YoungPay Collect</p>
        </footer>

      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-xs font-medium text-gray-700 ${mono ? 'font-mono' : ''}`}
        style={mono ? { fontSize: 10 } : {}}>
        {value}
      </span>
    </div>
  )
}
