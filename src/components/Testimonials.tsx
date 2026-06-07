import { Quote, Star } from 'lucide-react'
import { testimonials } from '../data/mockData'

export default function Testimonials() {
  return (
    <section className="section-pad bg-navy-50">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="badge-orange mb-5">Témoignages</span>
          <h2 className="font-bold text-4xl md:text-5xl text-navy mb-5">
            Ils font confiance à{' '}
            <span className="text-gradient">YoungPay Collect</span>
          </h2>
          <p className="text-navy-500 text-lg max-w-xl mx-auto">
            Des marchands guinéens partagent leur expérience.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card card-hover p-7 group relative overflow-hidden border border-navy-100">
              {/* Quote icon */}
              <div className="absolute top-5 right-5 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                <Quote className="w-14 h-14 text-primary" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} className="w-4 h-4 text-primary fill-primary" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-navy-600 text-sm leading-relaxed mb-7">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-navy-100">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-navy font-semibold text-sm leading-none mb-0.5">{t.name}</p>
                  <p className="text-navy-400 text-xs">{t.role} · {t.company}</p>
                </div>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(90deg, transparent, #F59E0B, #F97316, transparent)' }} />
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
          <p className="text-navy-400 text-sm">Également utilisé par :</p>
          {['Conakry Commerce', 'Guinea Tech', 'Kaloum Shop', 'PayLocal GN', 'Marché Direct GN'].map((c) => (
            <span key={c} className="text-navy-300 text-sm font-medium hover:text-navy-500 transition-colors cursor-default">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
