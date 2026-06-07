import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight, Zap, Shield, Headphones, BarChart3 } from 'lucide-react'

const included = [
  { icon: <Zap className="w-4 h-4" />,        text: 'Accès complet au portail marchand' },
  { icon: <BarChart3 className="w-4 h-4" />,  text: 'Tableau de bord & analytics en temps réel' },
  { icon: <Shield className="w-4 h-4" />,     text: 'Génération de clés API (publique & secrète)' },
  { icon: <Check className="w-4 h-4" />,      text: 'Accès à tous les moyens de paiement GN' },
  { icon: <Check className="w-4 h-4" />,      text: 'Webhooks & notifications instantanées' },
  { icon: <Check className="w-4 h-4" />,      text: 'Historique complet des transactions' },
  { icon: <Headphones className="w-4 h-4" />, text: 'Support technique dédié' },
  { icon: <Check className="w-4 h-4" />,      text: 'Documentation API complète' },
  { icon: <Check className="w-4 h-4" />,      text: 'Reversement sans frais supplémentaires' },
]

export default function Pricing() {
  const navigate = useNavigate()
  return (
    <section id="tarifs" className="section-pad bg-white">
      <div className="container-max">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="badge-orange mb-5">Tarification</span>
          <h2 className="font-bold text-4xl md:text-5xl text-navy mb-5">
            Simple, transparent,{' '}
            <span className="text-gradient">sans surprise</span>
          </h2>
          <p className="text-navy-500 text-lg max-w-xl mx-auto">
            Aucun abonnement mensuel. Vous ne payez que lorsque vous encaissez.
          </p>
        </div>

        {/* Pricing card */}
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-navy-100"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>

            {/* Orange header */}
            <div className="px-10 py-10 text-center text-white"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
              <p className="font-semibold text-white/80 uppercase tracking-widest text-sm mb-3">
                Accès au portail
              </p>

              {/* Free badge */}
              <div className="flex items-end justify-center gap-3 mb-2">
                <span className="font-bold text-6xl">Gratuit</span>
              </div>
              <p className="text-white/80 text-base">Aucun frais d'inscription · Aucun abonnement mensuel</p>

              {/* Commission highlight */}
              <div className="mt-6 inline-flex items-center gap-3 bg-white/15 border border-white/25 rounded-2xl px-6 py-4">
                <div className="text-left">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Commission par transaction</p>
                  <p className="text-white font-bold text-3xl leading-none mt-0.5">1,2 <span className="text-xl">%</span></p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <p className="text-white/80 text-sm text-left max-w-[140px] leading-snug">
                  Déduit automatiquement à chaque paiement reçu
                </p>
              </div>
            </div>

            {/* Included features */}
            <div className="bg-white px-10 py-8">
              <p className="font-semibold text-navy text-sm uppercase tracking-widest mb-6">
                Tout est inclus
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {included.map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#F97316' }}>
                      {item.icon}
                    </div>
                    <span className="text-navy-600 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={() => navigate('/inscription')} className="btn-primary flex-1 justify-center py-4 text-base">
                  Créer mon compte gratuitement
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a href="#" className="btn-secondary justify-center py-4 px-6 text-sm">
                  Parler à un expert
                </a>
              </div>

              <p className="text-center text-navy-400 text-xs mt-4">
                Inscription en 5 minutes · Aucune carte bancaire requise
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
