import { ArrowRight, Copy, Check, Terminal, Zap, Globe, Lock } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const codeSnippet = `// Initier un paiement avec YoungPay Collect
const response = await fetch(
  'https://api.youngpaycollect.com/v2/payments/initiate',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk_live_••••••••••',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: 500000,
      currency: 'GNF',
      method: 'orange_money',
      phone: '+224 620 000 000',
      description: 'Commande #4521',
      webhook_url: 'https://votresite.com/webhook',
    }),
  }
)

const { transaction_id, payment_url } =
  await response.json()

// Rediriger vers la page de paiement
window.location.href = payment_url`

const devFeatures = [
  { icon: <Zap       className="w-5 h-5" />, title: 'Webhooks instantanés', desc: 'Notifications en temps réel à chaque événement de paiement.',          color: '#F97316' },
  { icon: <Globe     className="w-5 h-5" />, title: 'API RESTful',          desc: 'Architecture standard, documentation Swagger/OpenAPI complète.',        color: '#F59E0B' },
  { icon: <Lock      className="w-5 h-5" />, title: 'Sandbox de test',      desc: 'Environnement isolé avec données simulées pour vos tests.',             color: '#F97316' },
]

export default function DeveloperSection() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="developpeurs" className="section-pad relative overflow-hidden" style={{ background: '#0F172A' }}>
      {/* Orange glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[400px] rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, #F59E0B, #F97316)' }} />

      <div className="container-max relative z-10">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* Left — code */}
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden border border-white/10"
              style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
              {/* Toolbar */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-navy-800/80 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                    <div className="w-3 h-3 rounded-full bg-green-400/70" />
                  </div>
                  <span className="text-navy-400 text-xs font-mono">paiement.js</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-navy-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5"
                >
                  {copied
                    ? <><Check className="w-3.5 h-3.5 text-primary" /><span className="text-primary">Copié !</span></>
                    : <><Copy className="w-3.5 h-3.5" />Copier</>
                  }
                </button>
              </div>
              {/* Code */}
              <div className="p-5 overflow-x-auto" style={{ background: '#0A0F1E' }}>
                <pre className="font-mono text-sm leading-relaxed">
                  <code className="text-navy-300">
                    {codeSnippet.split('\n').map((line, i) => {
                      const isComment = line.trim().startsWith('//')
                      if (isComment) return <span key={i} className="block text-navy-600 italic">{line}{'\n'}</span>
                      if (line.includes('amount:') || line.includes('currency:') || line.includes('method:')) {
                        return <span key={i} className="block"><span className="text-amber-300">{line}</span>{'\n'}</span>
                      }
                      return <span key={i} className="block">{line}{'\n'}</span>
                    })}
                  </code>
                </pre>
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 mt-5">
              {[
                { value: '99.9%',  label: 'Disponibilité' },
                { value: '<200ms', label: 'Latence API' },
                { value: '6+',     label: 'Méthodes' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-4 text-center border border-white/8 bg-white/5">
                  <p className="font-bold text-white text-lg">{s.value}</p>
                  <p className="text-navy-400 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — copy */}
          <div className="order-1 lg:order-2">
            <span className="badge-orange mb-6 inline-flex">Pour les développeurs</span>

            <h2 className="font-bold text-4xl md:text-5xl text-white mb-5 leading-tight">
              Une API conçue pour{' '}
              <span className="text-gradient">la simplicité</span>
            </h2>
            <p className="text-navy-400 text-lg leading-relaxed mb-8">
              Intégrez YoungPay Collect en quelques lignes de code. Documentation claire,
              exemples concrets et SDK pour vos langages préférés.
            </p>

            <div className="space-y-5 mb-10">
              {devFeatures.map((feat) => (
                <div key={feat.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${feat.color}20`, color: feat.color }}>
                    {feat.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-0.5">{feat.title}</h4>
                    <p className="text-navy-400 text-sm">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/docs')} className="btn-primary">
                Voir la documentation <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/docs')} className="btn-secondary">
                <Terminal className="w-4 h-4 text-primary" />
                Explorer l'API
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
