import { Zap, Banknote, Activity, Headphones, BarChart3, Link2, LayoutDashboard } from 'lucide-react'
import { features } from '../data/mockData'

const iconMap: Record<string, React.ReactNode> = {
  Zap:             <Zap className="w-6 h-6" />,
  Banknote:        <Banknote className="w-6 h-6" />,
  Activity:        <Activity className="w-6 h-6" />,
  Headphones:      <Headphones className="w-6 h-6" />,
  BarChart3:       <BarChart3 className="w-6 h-6" />,
  Link2:           <Link2 className="w-6 h-6" />,
  LayoutDashboard: <LayoutDashboard className="w-6 h-6" />,
}

export default function Features() {
  return (
    <section id="fonctionnalites" className="section-pad bg-white">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="badge-orange mb-5">Pourquoi YoungPay Collect</span>
          <h2 className="font-bold text-4xl md:text-5xl text-navy mb-5">
            Conçu pour les marchands{' '}
            <span className="text-gradient">et les développeurs</span>
          </h2>
          <p className="text-navy-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Que vous soyez commerçant sans équipe tech ou développeur expérimenté,
            YoungPay Collect s'adapte à votre façon de travailler.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div key={feat.title} className={`card card-hover p-7 group border border-navy-100 ${i < 2 ? 'ring-1 ring-amber-200/60' : ''}`}>
              {/* Merchant badge for first 2 */}
              {i < 2 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-3 px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#F97316' }}>
                  Marchands
                </span>
              )}
              {i === 5 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-3 px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(52,211,153,0.12)', color: '#10B981' }}>
                  Développeurs
                </span>
              )}

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: feat.bg, color: feat.color }}
              >
                {iconMap[feat.icon]}
              </div>

              <h3 className="font-bold text-navy text-xl mb-3 group-hover:text-gradient transition-all duration-200">
                {feat.title}
              </h3>
              <p className="text-navy-500 text-sm leading-relaxed">
                {feat.description}
              </p>

              {/* Bottom line */}
              <div
                className="mt-5 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                style={{ backgroundColor: feat.color + '50' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
