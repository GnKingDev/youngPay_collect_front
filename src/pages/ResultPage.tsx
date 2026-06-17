import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import logo from '../assets/logo.webp'

interface TxData {
  transaction_id: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED'
  amount: number
  operator: string
  phone?: string
}

const S = { fontFamily: 'DM Sans, sans-serif' }

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n)).replace(/\s/g, ' ') + ' GNF'

const OPERATOR_LABELS: Record<string, string> = {
  orange_money: 'Orange Money',
  mtn:          'MTN Mobile',
  soutra:       'Soutra Money',
  kulu:         'KULU',
  paycard:      'PayCard',
  card:         'Carte bancaire',
}

export default function ResultPage() {
  const { transactionId } = useParams<{ transactionId: string }>()
  const [tx, setTx]         = useState<TxData | null>(null)
  const [step, setStep]     = useState<'loading' | 'pending' | 'success' | 'failed' | 'error'>('loading')
  const pollerRef           = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!transactionId) { setStep('error'); return }

    const poll = async () => {
      try {
        const r = await fetch(`/api/v1/pay/status/${transactionId}`)
        if (!r.ok) { setStep('error'); return }
        const d: TxData = await r.json()
        setTx(d)
        if (d.status === 'SUCCESS') { clearInterval(pollerRef.current!); setStep('success') }
        else if (d.status === 'FAILED' || d.status === 'EXPIRED') { clearInterval(pollerRef.current!); setStep('failed') }
        else setStep('pending')
      } catch {
        setStep('error')
      }
    }

    poll()
    pollerRef.current = setInterval(poll, 3000)
    return () => { if (pollerRef.current) clearInterval(pollerRef.current) }
  }, [transactionId])

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-white flex flex-col" style={S}>

        {/* Header */}
        <header className="flex items-center justify-center px-5 pt-6 pb-4">
          <img src={logo} alt="YoungPay" className="h-7 w-auto" />
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

            {/* PENDING */}
            {step === 'pending' && (
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="w-20 h-20 rounded-full border-4 border-amber-200 border-t-amber-400 animate-spin" />
                <div>
                  <p className="font-semibold text-gray-800 text-lg">Paiement en cours…</p>
                  <p className="text-sm text-gray-400 mt-1">Veuillez valider sur votre téléphone</p>
                </div>
                {tx && (
                  <div className="w-full rounded-2xl border border-gray-100 p-4 text-left mt-2" style={{ background: '#F9FAFB' }}>
                    <Row label="Montant"   value={fmt(tx.amount)} />
                    <Row label="Opérateur" value={OPERATOR_LABELS[tx.operator] ?? tx.operator} />
                    {tx.phone && <Row label="Numéro" value={tx.phone} />}
                    <Row label="Référence" value={tx.transaction_id} mono />
                  </div>
                )}
              </div>
            )}

            {/* SUCCESS */}
            {step === 'success' && tx && (
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #D1FAE5, #6EE7B7)' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xl">Paiement réussi</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: '#059669' }}>{fmt(tx.amount)}</p>
                  <p className="text-sm text-gray-400 mt-1">via {OPERATOR_LABELS[tx.operator] ?? tx.operator}</p>
                </div>
                <div className="w-full rounded-2xl border border-gray-100 p-4 text-left mt-2" style={{ background: '#F9FAFB' }}>
                  {tx.phone && <Row label="Numéro" value={tx.phone} />}
                  <Row label="Référence" value={tx.transaction_id} mono />
                </div>
                <p className="text-xs text-gray-300 mt-2">Vous pouvez fermer cette page</p>
              </div>
            )}

            {/* FAILED */}
            {step === 'failed' && (
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FEE2E2, #FCA5A5)' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12M18 6L6 18" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xl">Paiement échoué</p>
                  <p className="text-sm text-gray-400 mt-1">La transaction n'a pas abouti</p>
                </div>
                {tx && (
                  <div className="w-full rounded-2xl border border-gray-100 p-4 text-left mt-2" style={{ background: '#F9FAFB' }}>
                    <Row label="Montant"   value={fmt(tx.amount)} />
                    <Row label="Référence" value={tx.transaction_id} mono />
                  </div>
                )}
                <p className="text-xs text-gray-300 mt-2">Vous pouvez fermer cette page</p>
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
                <p className="text-sm text-gray-400">Ce lien de résultat est invalide ou a expiré</p>
              </div>
            )}

          </div>
        </main>

        {/* Footer */}
        <footer className="pb-6 flex justify-center">
          <p className="text-xs text-gray-300">Sécurisé par YoungPay Collect</p>
        </footer>

      </div>
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
