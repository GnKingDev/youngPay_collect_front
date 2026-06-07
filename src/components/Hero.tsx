import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Play, TrendingUp, Wallet, ShieldCheck } from 'lucide-react'
import orangeMoneyLogo from '../assets/orange_money.png'
import mtnLogo        from '../assets/MTN_MOBILE_MONEY.webp'
import kuluLogo       from '../assets/kulu.png'
import soutraLogo     from '../assets/soutra_money.png'
import paycardLogo    from '../assets/paycard.jpg'
import visaMcLogo     from '../assets/visa-mastercard.svg'

const DashboardMockup = () => (
  <div className="relative w-full max-w-[480px] mx-auto">
    {/* Glow behind */}
    <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20 scale-105"
      style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }} />

    {/* Main window */}
    <div className="relative bg-white rounded-2xl overflow-hidden border border-navy-100"
      style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.12)' }}>

      {/* Window bar */}
      <div className="flex items-center gap-2 px-5 py-3.5 bg-navy-50 border-b border-navy-100">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-3">
          <div className="bg-white rounded-md px-3 py-1 text-xs text-navy-400 font-medium border border-navy-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-green-500" />
            dashboard.youngpaycollect.com
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="p-5">
        {/* Top */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-navy font-bold text-sm">Tableau de bord</p>
            <p className="text-navy-400 text-xs mt-0.5">Avril 2026</p>
          </div>
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-600 text-xs font-medium">En ligne</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Volume', value: '12.5M GNF', trend: '+18%' },
            { label: 'Transactions', value: '1 234', trend: '+12%' },
            { label: 'Réussite', value: '98.5%', trend: '+2%' },
          ].map((s) => (
            <div key={s.label} className="bg-navy-50 rounded-xl p-3 border border-navy-100">
              <p className="text-navy-400 text-[10px] font-medium uppercase tracking-wide mb-1">{s.label}</p>
              <p className="text-navy font-bold text-sm leading-none">{s.value}</p>
              <p className="text-green-500 text-[10px] mt-1 flex items-center gap-0.5 font-medium">
                <TrendingUp className="w-2.5 h-2.5" />{s.trend}
              </p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-navy-50 rounded-xl p-4 mb-4 border border-navy-100">
          <p className="text-navy-400 text-xs font-medium mb-3">Évolution des revenus</p>
          <div className="flex items-end gap-1.5 h-16">
            {[30,55,40,72,58,85,68,92,78,100,88,95].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm relative overflow-hidden" style={{ height: `${h}%` }}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #F97316aa, #F59E0B33)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="space-y-2">
          {[
            { name: 'Orange Money',  amount: '+250 000 GNF', status: 'success', color: '#FF6200' },
            { name: 'MTN Mobile',    amount: '+180 000 GNF', status: 'success', color: '#FFCD00' },
            { name: 'Soutra Money',  amount: '+75 000 GNF',  status: 'pending', color: '#10B981' },
          ].map((tx) => (
            <div key={tx.name} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tx.color }} />
                <span className="text-navy text-xs font-medium">{tx.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-navy font-semibold text-xs">{tx.amount}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  tx.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {tx.status === 'success' ? '✓ OK' : '⏳'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Floating card — top right */}
    <div className="absolute -top-5 -right-4 bg-white rounded-2xl p-3.5 shadow-card-hover animate-float border border-navy-100">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #FF620020, #FF620008)', color: '#FF6200', border: '1px solid #FF620030' }}>O</div>
        <div>
          <p className="text-navy-400 text-[10px] font-medium">Orange Money</p>
          <p className="text-navy font-bold text-sm leading-tight">+500 000 GNF</p>
          <p className="text-green-500 text-[10px] font-medium">✓ Reçu</p>
        </div>
      </div>
    </div>

    {/* Floating card — bottom left */}
    <div className="absolute -bottom-5 -left-4 bg-white rounded-2xl p-3.5 shadow-card-hover animate-float-delayed border border-navy-100">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
          <Wallet className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-navy-400 text-[10px] font-medium">Taux de réussite</p>
          <p className="text-navy font-bold text-sm">98.5%</p>
          <p className="text-[10px] font-medium text-gradient">↑ +2.1%</p>
        </div>
      </div>
    </div>
  </div>
)

export default function Hero() {
  const navigate = useNavigate()
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
      {/* Very subtle warm gradient bg */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #FFFBF0 60%, #FEF3C7 100%)' }} />

      {/* Decorative orange blobs */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full opacity-[0.06] pointer-events-none translate-x-1/3"
        style={{ background: 'radial-gradient(circle, #F59E0B, #F97316)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.04] pointer-events-none -translate-x-1/3"
        style={{ background: 'radial-gradient(circle, #F59E0B, #F97316)' }} />

      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #0F172A 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

      <div className="container-max px-6 relative z-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left */}
          <div className="text-center lg:text-left">
            {/* H1 */}
            <h1 className="font-bold text-5xl md:text-6xl lg:text-[62px] leading-[1.1] tracking-tight text-navy mb-6">
              Encaissez partout en Guinée{' '}
              <span className="text-gradient block">simplement, à 1,2% seulement</span>
            </h1>

            <p className="text-navy-500 text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
              YoungPay Collect permet aux <strong className="text-navy font-semibold">marchands</strong> de générer des liens de paiement sans code,
              et aux <strong className="text-navy font-semibold">développeurs</strong> d'intégrer tous les moyens de paiement guinéens via une API unifiée.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
              <button onClick={() => navigate('/inscription')} className="btn-primary text-base w-full sm:w-auto justify-center py-4 px-8">
                Créer un compte gratuit
                <ArrowRight className="w-4 h-4" />
              </button>
              <a href="#" className="btn-secondary text-base w-full sm:w-auto justify-center py-4 px-8 group">
                <Play className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                Voir la démo
              </a>
            </div>

            {/* Trust */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 text-sm text-navy-500">
              {['Inscription gratuite', 'Aucune carte requise', 'Intégration < 1h'].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex justify-center lg:justify-end">
            <DashboardMockup />
          </div>
        </div>

        {/* Payment method pills */}
        <div className="mt-20">
          <p className="text-center text-navy-400 text-xs font-semibold uppercase tracking-widest mb-6">
            Tous les moyens de paiement supportés
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { name: 'Orange Money',     logo: orangeMoneyLogo, color: '#FF6200', letter: 'OM'  },
              { name: 'MTN Mobile Money', logo: mtnLogo,         color: '#FFCD00', letter: 'MTN' },
              { name: 'KULU',             logo: kuluLogo,        color: '#8B5CF6', letter: 'KU'  },
              { name: 'Soutra Money',     logo: soutraLogo,      color: '#10B981', letter: 'SM'  },
              { name: 'PayCard',          logo: paycardLogo, color: '#F59E0B', letter: 'PC' },
              { name: 'Visa / Mastercard',logo: visaMcLogo,  color: '#1A56DB', letter: 'CB' },
            ].map((pm) => (
              <div key={pm.name} className="bg-white border border-navy-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5 hover:border-primary hover:shadow-card transition-all duration-200 hover:-translate-y-0.5 cursor-default">
                {pm.logo ? (
                  <img
                    src={pm.logo}
                    alt={pm.name}
                    className="h-6 w-auto max-w-[40px] object-contain"
                    style={{ mixBlendMode: 'multiply' }}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                    style={{ backgroundColor: pm.color + '18', color: pm.color, border: `1px solid ${pm.color}30` }}>
                    {pm.letter}
                  </div>
                )}
                <span className="text-navy text-sm font-medium whitespace-nowrap">{pm.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
