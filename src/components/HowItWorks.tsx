import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Code2, Banknote, ArrowRight, LayoutDashboard, Link2, Share2 } from 'lucide-react'

const merchantSteps = [
  {
    number: '01',
    icon: <UserPlus className="w-7 h-7" />,
    title: 'Créez votre compte',
    description: 'Inscription gratuite en 5 minutes. Renseignez vos informations marchandes et soumettez vos documents KYB.',
    color: '#F59E0B',
  },
  {
    number: '02',
    icon: <Link2 className="w-7 h-7" />,
    title: 'Générez un lien de paiement',
    description: 'Depuis votre tableau de bord, choisissez le montant, la description et les moyens de paiement acceptés. Votre lien est prêt en 30 secondes.',
    color: '#F97316',
  },
  {
    number: '03',
    icon: <Share2 className="w-7 h-7" />,
    title: 'Partagez et encaissez',
    description: 'Envoyez le lien par WhatsApp, SMS ou email. Vos clients paient avec Orange Money, MTN ou d\'autres méthodes. Vous êtes notifié instantanément.',
    color: '#818CF8',
  },
]

const devSteps = [
  {
    number: '01',
    icon: <UserPlus className="w-7 h-7" />,
    title: 'Créez votre compte',
    description: 'Inscription gratuite. Accédez à vos clés API (publique & secrète) directement depuis le tableau de bord.',
    color: '#F59E0B',
  },
  {
    number: '02',
    icon: <Code2 className="w-7 h-7" />,
    title: 'Intégrez l\'API',
    description: 'Copiez vos clés API et suivez la documentation. SDK disponibles en JavaScript, Python et PHP. Sandbox pour tester sans risque.',
    color: '#F97316',
  },
  {
    number: '03',
    icon: <Banknote className="w-7 h-7" />,
    title: 'Encaissez en Guinée',
    description: 'Recevez vos paiements en temps réel en GNF. Webhooks, notifications et reversement automatique sur votre compte.',
    color: '#818CF8',
  },
]

export default function HowItWorks() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'merchant' | 'dev'>('merchant')
  const steps = tab === 'merchant' ? merchantSteps : devSteps

  return (
    <section className="section-pad bg-navy-50">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="badge-orange mb-5">Démarrage rapide</span>
          <h2 className="font-bold text-4xl md:text-5xl text-navy mb-5">
            Opérationnel en{' '}
            <span className="text-gradient">moins d'une heure</span>
          </h2>
          <p className="text-navy-500 text-lg max-w-xl mx-auto mb-8">
            Trois étapes simples, que vous soyez marchand ou développeur.
          </p>

          {/* Tabs */}
          <div className="inline-flex items-center bg-white rounded-2xl p-1.5 border border-navy-100 shadow-sm">
            <button
              onClick={() => setTab('merchant')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                tab === 'merchant'
                  ? 'text-white shadow-md'
                  : 'text-navy-500 hover:text-navy'
              }`}
              style={tab === 'merchant' ? { background: 'linear-gradient(135deg, #F59E0B, #F97316)' } : {}}
            >
              <LayoutDashboard className="w-4 h-4" />
              Je suis marchand
            </button>
            <button
              onClick={() => setTab('dev')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                tab === 'dev'
                  ? 'text-white shadow-md'
                  : 'text-navy-500 hover:text-navy'
              }`}
              style={tab === 'dev' ? { background: 'linear-gradient(135deg, #F59E0B, #F97316)' } : {}}
            >
              <Code2 className="w-4 h-4" />
              Je suis développeur
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line — desktop */}
          <div className="hidden lg:block absolute top-[68px] left-[calc(16.67%+56px)] right-[calc(16.67%+56px)] h-0.5 opacity-30"
            style={{ background: 'linear-gradient(to right, #F59E0B, #F97316, #F59E0B)' }} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="text-center group" style={{ animation: `fadeUp 0.4s ease-out ${i * 0.1}s both` }}>
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `${step.color}20`, animation: 'pulseRing 1.5s ease-out infinite' }} />
                  <div
                    className="relative w-[72px] h-[72px] rounded-2xl flex items-center justify-center shadow-card transition-all duration-300 group-hover:shadow-orange group-hover:scale-105"
                    style={{
                      background: i === 1 ? 'linear-gradient(135deg, #F59E0B, #F97316)' : 'white',
                      border: i === 1 ? 'none' : `2px solid ${step.color}30`,
                      color: i === 1 ? 'white' : step.color,
                    }}
                  >
                    {step.icon}
                    <div
                      className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white"
                      style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
                    >
                      {i + 1}
                    </div>
                  </div>
                </div>

                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: step.color }}>
                  Étape {step.number}
                </p>
                <h3 className="font-bold text-navy text-2xl mb-3">{step.title}</h3>
                <p className="text-navy-500 leading-relaxed text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <button onClick={() => navigate('/inscription')} className="btn-primary text-base py-4 px-10">
            Commencer maintenant <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-navy-400 text-sm mt-3">Gratuit · Aucune carte de crédit</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
