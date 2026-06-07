import { useNavigate } from 'react-router-dom'
import { ArrowRight, Link2, Share2, CheckCircle2, Smartphone, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const benefits = [
  'Aucun code, aucune intégration technique',
  'Lien de paiement prêt en 30 secondes',
  'Partagez par WhatsApp, SMS ou email',
  'Notifications instantanées à chaque paiement',
  'Tous les moyens de paiement guinéens',
  'Suivi en temps réel depuis le dashboard',
]

const PaymentLinkMockup = () => {
  const [copied, setCopied] = useState(false)
  const [amount, setAmount] = useState('150 000')
  const [method, setMethod] = useState('orange')

  const link = `pay.youngpaycollect.com/lien/${method === 'orange' ? 'om' : 'mtn'}-${amount.replace(/\s/g, '')}`

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative w-full max-w-[500px] mx-auto">
      {/* Glow */}
      <div className="absolute inset-0 rounded-3xl blur-3xl opacity-15 scale-105"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }} />

      {/* Card */}
      <div className="relative bg-white rounded-2xl border border-navy-100 overflow-hidden"
        style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.10)' }}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-navy-100 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-3">
            <div className="bg-navy-50 rounded-md px-3 py-1 text-xs text-navy-400 font-medium border border-navy-200 flex items-center gap-1.5">
              <Link2 className="w-3 h-3" />
              Générer un lien de paiement
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#F97316' }}>
            <Link2 className="w-3.5 h-3.5" />
            Nouveau lien de paiement
          </div>

          {/* Form */}
          <div className="space-y-4 mb-5">
            <div>
              <label className="text-navy text-xs font-semibold uppercase tracking-wide block mb-1.5">
                Montant (GNF)
              </label>
              <div className="flex items-center border-2 border-navy-200 rounded-xl overflow-hidden focus-within:border-amber-400 transition-colors">
                <span className="px-3 text-navy-400 text-sm font-medium border-r border-navy-200 py-3 bg-navy-50">GNF</span>
                <input
                  type="text"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="flex-1 px-3 py-3 text-sm font-semibold text-navy outline-none bg-white"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
              </div>
            </div>

            <div>
              <label className="text-navy text-xs font-semibold uppercase tracking-wide block mb-1.5">
                Moyens de paiement acceptés
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'orange', label: 'Orange Money', color: '#FF6200' },
                  { id: 'mtn',    label: 'MTN Mobile',   color: '#FFCD00' },
                  { id: 'all',    label: 'Tous',          color: '#10B981' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-semibold transition-all duration-150 ${
                      method === m.id ? 'border-transparent text-white' : 'border-navy-200 text-navy-500'
                    }`}
                    style={method === m.id ? { background: `linear-gradient(135deg, #F59E0B, #F97316)` } : {}}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generated link preview */}
          <div className="bg-navy-50 rounded-xl p-3.5 border border-navy-100 mb-4">
            <p className="text-[10px] text-navy-400 font-semibold uppercase tracking-wide mb-1.5">Lien généré</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-navy text-xs font-medium truncate">{link}</p>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all duration-200"
                style={copied
                  ? { background: 'rgba(16,185,129,0.12)', color: '#10B981' }
                  : { background: 'rgba(245,158,11,0.12)', color: '#F97316' }
                }
              >
                {copied ? <><Check className="w-3 h-3" />Copié</> : <><Copy className="w-3 h-3" />Copier</>}
              </button>
            </div>
          </div>

          {/* Share row */}
          <div className="flex gap-2">
            {[
              { label: 'WhatsApp', emoji: '💬', color: '#25D366' },
              { label: 'SMS',      emoji: '📱', color: '#3B82F6' },
              { label: 'Email',    emoji: '📧', color: '#F59E0B' },
            ].map(s => (
              <button
                key={s.label}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-navy-200 text-xs font-semibold text-navy-600 hover:border-amber-400 hover:text-navy transition-all duration-150"
              >
                <span>{s.emoji}</span>{s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <div className="absolute -bottom-5 -right-4 bg-white rounded-2xl p-3.5 border border-navy-100 animate-float"
        style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.10)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.12)' }}>
            <Smartphone className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="text-navy-400 text-[10px] font-medium">Paiement reçu</p>
            <p className="text-navy font-bold text-sm">+{amount} GNF</p>
            <p className="text-green-500 text-[10px] font-medium">✓ Confirmé</p>
          </div>
        </div>
      </div>

      {/* Floating QR hint */}
      <div className="absolute -top-4 -left-4 bg-white rounded-2xl p-3 border border-navy-100"
        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', animation: 'float 3s ease-in-out 1s infinite alternate' }}>
        <div className="grid grid-cols-4 gap-0.5">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: [0,1,3,4,5,7,8,10,11,12,14,15].includes(i) ? '#0F172A' : '#F8FAFC' }} />
          ))}
        </div>
        <p className="text-[9px] text-navy-400 font-medium text-center mt-1.5">QR Code</p>
      </div>
    </div>
  )
}

export default function MerchantSection() {
  const navigate = useNavigate()

  return (
    <section className="section-pad bg-[#FFFBF0] relative overflow-hidden">
      {/* Subtle warm gradient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(160deg, #FFFBF0 0%, #FEF3C7 60%, #FFFBF0 100%)' }} />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.06] pointer-events-none translate-x-1/3 -translate-y-1/3"
        style={{ background: 'radial-gradient(circle, #F59E0B, #F97316)' }} />

      <div className="container-max relative z-10">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* Left — copy */}
          <div>
            <span className="badge-orange mb-6 inline-flex">Pour les marchands</span>

            <h2 className="font-bold text-4xl md:text-5xl text-navy mb-5 leading-tight">
              Encaissez sans écrire{' '}
              <span className="text-gradient">une seule ligne de code</span>
            </h2>
            <p className="text-navy-500 text-lg leading-relaxed mb-8">
              YoungPay Collect, c'est aussi un tableau de bord complet pour les marchands.
              Générez des liens de paiement, partagez-les et recevez vos fonds — sans équipe technique.
            </p>

            <div className="space-y-3.5 mb-10">
              {benefits.map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#F97316' }} />
                  <span className="text-navy-600 text-sm font-medium">{b}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/inscription')} className="btn-primary">
                Créer mon compte gratuit <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right — interactive mockup */}
          <div className="flex justify-center lg:justify-end py-8">
            <PaymentLinkMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
