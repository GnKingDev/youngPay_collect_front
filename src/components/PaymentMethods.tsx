import { CheckCircle2 } from 'lucide-react'
import { paymentMethods } from '../data/mockData'

import orangeMoneyLogo  from '../assets/orange_money.png'
import mtnLogo          from '../assets/MTN_MOBILE_MONEY.webp'
import kuluLogo         from '../assets/kulu.png'
import soutraLogo       from '../assets/soutra_money.png'
import paycardLogo      from '../assets/paycard.jpg'
import visaMcLogo       from '../assets/visa-mastercard.svg'

const logoMap: Record<string, string> = {
  'orange-money':   orangeMoneyLogo,
  'mtn-momo':       mtnLogo,
  'kulu':           kuluLogo,
  'soutra-money':   soutraLogo,
  'paycard':        paycardLogo,
  'visa-mastercard':visaMcLogo,
}

const methodDetails: Record<string, string[]> = {
  'orange-money':   ['Disponible en Guinée', 'Réseau Orange GN', 'Toutes régions'],
  'mtn-momo':       ['Disponible en Guinée', 'Réseau MTN GN', 'Toutes régions'],
  'kulu':           ['Disponible en Guinée', 'Application KULU', 'Conakry & régions'],
  'soutra-money':   ['Disponible en Guinée', 'Application Soutra', 'Paiement rapide'],
  'paycard':        ['Disponible en Guinée', 'Carte prépayée GN', 'Paiement en ligne'],
  'visa-mastercard':['Cartes internationales', 'Visa & Mastercard', 'Paiement 3D Secure'],
}

export default function PaymentMethods() {
  return (
    <section id="paiements" className="section-pad bg-navy-50">
      <div className="container-max">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="badge-orange mb-5">Moyens de paiement</span>
          <h2 className="font-bold text-4xl md:text-5xl text-navy mb-5">
            Tous les paiements guinéens,{' '}
            <span className="text-gradient">une seule API</span>
          </h2>
          <p className="text-navy-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Acceptez les paiements de vos clients guinéens qu'ils utilisent Orange Money,
            MTN Mobile Money, KULU, Soutra Money, PayCard ou une carte bancaire internationale.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paymentMethods.map((pm) => {
            const logoSrc = logoMap[pm.id]
            return (
              <div key={pm.id} className="card card-hover p-6 group cursor-default border border-navy-100">

                {/* Logo ou lettre */}
                <div className="mb-5">
                  {logoSrc ? (
                    <div className="w-full h-16 flex items-center">
                      <img
                        src={logoSrc}
                        alt={pm.name}
                        className="h-12 w-auto max-w-[160px] object-contain"
                        style={{ mixBlendMode: 'multiply' }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: pm.bg,
                        border: `1px solid ${pm.border}`,
                        color: pm.color,
                      }}
                    >
                      {pm.letter}
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-navy text-xl mb-1">{pm.name}</h3>
                <p className="text-navy-400 text-sm mb-4">{pm.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {(methodDetails[pm.id] ?? []).map((d) => (
                    <div key={d} className="flex items-center gap-1 bg-navy-50 rounded-full px-2.5 py-1 border border-navy-100">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: pm.color }} />
                      <span className="text-navy-500 text-xs">{d}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom accent */}
                <div className="mt-5 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                  style={{ backgroundColor: pm.color + '60' }} />
              </div>
            )
          })}
        </div>

        <p className="text-center mt-10 text-navy-400 text-sm">
          D'autres moyens de paiement bientôt disponibles ·{' '}
          <a href="#" className="text-primary hover:text-primary-dark font-medium underline underline-offset-2 transition-colors">
            Suggérer un moyen
          </a>
        </p>
      </div>
    </section>
  )
}
