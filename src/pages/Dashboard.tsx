import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Menu, Bell, Settings } from 'lucide-react'
import logo from '../assets/logo.webp'

import { apiFetch, NAV, setSharedEnv } from './dashboard/shared'
import ScreenDashboard     from './dashboard/HomeScreen'
import ScreenTransactions  from './dashboard/TransactionsScreen'
import ScreenLinks         from './dashboard/LinksScreen'
import ScreenDirectCollect from './dashboard/DirectCollectScreen'
import ScreenReversements  from './dashboard/ReversementsScreen'
import ScreenDeveloper     from './dashboard/DeveloperScreen'
import ScreenSupport       from './dashboard/SupportScreen'
import ScreenAccount       from './dashboard/AccountScreen'

/* ── Placeholder for screens not yet implemented ──────── */
const ScreenPlaceholder = ({ label }: { label: string }) => (
  <div className="flex-1 flex items-center justify-center p-12">
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: 'rgba(245,158,11,0.12)' }}>
        <Settings className="w-8 h-8" style={{ color: '#F97316' }} />
      </div>
      <h3 className="font-bold text-navy text-xl mb-2">{label}</h3>
      <p className="text-navy-400 text-sm">Cette section est en cours de développement.</p>
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate     = useNavigate()
  const [tab,           setTab]          = useState('dashboard')
  const [sidebar,       setSidebar]       = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [env,           setEnv]           = useState<'sandbox' | 'production'>('sandbox')
  const [showNotifs,    setShowNotifs]    = useState(false)

  // Source de vérité : données fraîches du backend
  const [merchantServer, setMerchantServer] = useState<Record<string, unknown> | null>(null)

  // Données locales uniquement pour l'affichage initial (remplacées par merchantServer)
  const merchantRaw = localStorage.getItem('yp_merchant')
  const merchantLocal = merchantRaw ? JSON.parse(merchantRaw) as Record<string, unknown> : null

  // On utilise toujours merchantServer en priorité, localStorage en fallback d'affichage
  const merchant  = merchantServer ?? merchantLocal
  const initials  = (merchant?.name as string)
    ? (merchant!.name as string).split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'YP'

  useEffect(() => {
    const token = localStorage.getItem('yp_token')
    if (!token) { navigate('/connexion', { replace: true }); return }

    // Appel backend — source de vérité absolue pour production_enabled et statut
    fetch('/api/v1/auth/me?env=sandbox', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (r.status === 401) {
          localStorage.removeItem('yp_token')
          localStorage.removeItem('yp_merchant')
          navigate('/connexion', { replace: true })
          return null
        }
        return r.ok ? r.json() : null
      })
      .then(m => {
        if (!m) return
        setMerchantServer(m)
        // Env déterminé uniquement par production_enabled du backend
        setEnv(m.production_enabled === true ? 'production' : 'sandbox')
        // Cache local pour la prochaine ouverture (affichage seulement)
        localStorage.setItem('yp_merchant', JSON.stringify(m))
      })
      .catch(() => {})
  }, [navigate])

  // Sync module-level _env whenever env state changes
  useEffect(() => {
    setSharedEnv(env)
  }, [env])

  type Notif = { id: string | number; icon: string; title: string; desc: string; time: string; read: boolean }
  const [NOTIFS, setNOTIFS] = useState<Notif[]>([])

  useEffect(() => {
    apiFetch<Notif[]>('/notifications')
      .then(d => { if (Array.isArray(d)) setNOTIFS(d) })
      .catch(() => {})
  }, [env])

  const PAGE_TITLES: Record<string, string> = {
    dashboard:    'Tableau de bord',
    transactions: 'Transactions',
    links:        'Liens de paiement',
    reversements: 'Reversements',
    catalog:      'Produits / Services',
    analytics:    'Analytics',
    developer:    'Développeur',
    support:      'Support',
    settings:     'Mon compte',
  }

  const switchTab = (t: string) => {
    if (t === tab) return
    setTransitioning(true)
    setTimeout(() => { setTab(t); setTransitioning(false) }, 150)
    setSidebar(false)
  }

  return (
    <div className="flex h-screen overflow-hidden"
      style={{ fontFamily: 'Poppins, sans-serif' }}>

      {/* Mobile overlay */}
      {sidebar && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebar(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:min-h-screen ${
        sidebar ? 'translate-x-0' : '-translate-x-full'
      }`}
        style={{ background: '#FFFFFF', borderRight: '1px solid #F1F5F9', fontFamily: 'Poppins, sans-serif', boxShadow: '2px 0 12px rgba(0,0,0,0.04)', flexShrink: 0 }}>

        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <img src={logo} alt="YoungPay Collect" className="h-11 w-auto" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = tab === item.id
            return (
              <button key={item.id}
                onClick={() => switchTab(item.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left group"
                style={{
                  color:           active ? '#F97316' : '#64748B',
                  backgroundColor: active ? 'rgba(249,115,22,0.07)' : 'transparent',
                  borderLeft:      active ? '3px solid #F97316' : '3px solid transparent',
                  fontWeight:      active ? 600 : 400,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#F8FAFC' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}>
                <item.icon
                  className="flex-shrink-0"
                  style={{ width: 18, height: 18, color: active ? '#F97316' : '#94A3B8' }}
                />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Env badge */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
            style={env === 'sandbox'
              ? { background: '#FEF3C7', color: '#D97706' }
              : { background: '#D1FAE5', color: '#059669' }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: env === 'sandbox' ? '#F59E0B' : '#10B981' }} />
            {env === 'sandbox' ? 'Mode Sandbox (mode essai)' : 'Mode Production'}
          </div>
        </div>

        {/* User + logout */}
        <div className="px-3 py-4 space-y-2" style={{ borderTop: '1px solid #F1F5F9' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: '#F8FAFC' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#0F172A' }}>{(merchant?.name as string) ?? '—'}</p>
              <p className="text-[10px] truncate" style={{ color: '#94A3B8' }}>{(merchant?.email as string) ?? '—'}</p>
            </div>
          </div>
          <button onClick={() => {
            localStorage.removeItem('yp_token')
            localStorage.removeItem('yp_merchant')
            navigate('/connexion')
          }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.color = '#EF4444' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">

        {/* Header */}
        <header className="bg-white border-b border-navy-100 sticky top-0 z-40"
          style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-4 px-5 py-3.5">
            {/* Hamburger */}
            <button onClick={() => setSidebar(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-navy-100 transition-colors text-navy">
              <Menu className="w-5 h-5" />
            </button>

            {/* Page title */}
            <h1 className="font-bold text-navy text-lg hidden sm:block">{PAGE_TITLES[tab]}</h1>

            <div className="flex items-center gap-3 ml-auto">

              {/* ENV switch */}
              {(() => {
                // Toujours lire production_enabled depuis les données backend fraîches
                const productionEnabled = merchantServer?.production_enabled === true
                return (
                  <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl border border-navy-200 bg-navy-50">
                    {/* Sandbox — caché si déjà en production */}
                    {env !== 'production' && (
                      <button
                        onClick={() => setEnv('sandbox')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                        style={env === 'sandbox'
                          ? { background: 'linear-gradient(135deg,#F59E0B,#F97316)', color: 'white', boxShadow: '0 2px 8px rgba(249,115,22,0.30)' }
                          : { color: '#94A3B8' }}>
                        Sandbox
                      </button>
                    )}
                    <div className="relative group">
                      <button
                        onClick={() => {
                          if (env === 'production') return
                          if (!productionEnabled) { switchTab('settings'); return }
                          setEnv('production')
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                        style={env === 'production'
                          ? { background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', boxShadow: '0 2px 8px rgba(16,185,129,0.30)' }
                          : { color: !productionEnabled ? '#CBD5E1' : '#94A3B8', cursor: !productionEnabled ? 'not-allowed' : 'pointer' }}>
                        {env === 'production' ? '✓ Production' : 'Production'}
                      </button>
                      {!productionEnabled && env !== 'production' && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-navy text-white text-xs rounded-xl p-3 shadow-xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{ fontFamily: 'Poppins, sans-serif' }}>
                          <div className="absolute top-0 right-4 -translate-y-1/2 w-2 h-2 bg-navy rotate-45" />
                          <p className="font-semibold mb-1">⚠ Accès production requis</p>
                          <p className="text-white/70 leading-snug">Soumettez votre <strong className="text-white">pièce d'identité</strong> et votre <strong className="text-white">RCCM</strong> dans <em>Mon compte → KYC</em> pour activer le mode production.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Bell + dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(v => !v)}
                  className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-navy-100 transition-colors text-navy">
                  <Bell style={{ width: 18, height: 18 }} />
                  {NOTIFS.some(n => !n.read) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
                  )}
                </button>

                {showNotifs && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                    {/* Dropdown */}
                    <div className="absolute right-0 top-11 w-80 rounded-2xl border border-navy-100 overflow-hidden z-50"
                      style={{ background: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', animation: 'supportFadeUp 0.18s ease-out both' }}>
                      <div className="px-4 py-3 border-b border-navy-100 flex items-center justify-between">
                        <p className="font-bold text-navy text-sm">Notifications</p>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(249,115,22,0.10)', color: '#F97316' }}>
                          {NOTIFS.filter(n => !n.read).length} nouvelles
                        </span>
                      </div>
                      <div className="divide-y divide-navy-50 max-h-72 overflow-y-auto">
                        {NOTIFS.length === 0 && (
                          <p className="text-center text-navy-400 text-xs py-8">Aucune notification</p>
                        )}
                        {NOTIFS.map(n => (
                          <div key={n.id}
                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-navy-50 transition-colors ${!n.read ? 'bg-amber-50/40' : ''}`}>
                            <span className="text-lg flex-shrink-0 mt-0.5">{n.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-navy text-xs">{n.title}</p>
                                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
                              </div>
                              <p className="text-navy-400 text-[11px] mt-0.5 leading-snug">{n.desc}</p>
                              <p className="text-navy-300 text-[10px] mt-1">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-2.5 border-t border-navy-100">
                        <button
                          onClick={() => { setNOTIFS(n => n.map(x => ({ ...x, read: true }))); setShowNotifs(false) }}
                          className="w-full text-center text-xs font-semibold py-1.5 rounded-xl transition-colors hover:bg-navy-50"
                          style={{ color: '#F97316' }}>
                          Marquer tout comme lu
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto"
          style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'translateY(4px)' : 'translateY(0)',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
          }}>
          {tab === 'dashboard'    && <ScreenDashboard    key={env} setTab={setTab} />}
          {tab === 'transactions' && <ScreenTransactions key={env} />}
          {tab === 'links'        && <ScreenLinks        key={env} />}
          {tab === 'direct'       && <ScreenDirectCollect key={env} />}
          {tab === 'reversements' && <ScreenReversements  key={env} />}
          {tab === 'developer'    && <ScreenDeveloper />}
          {tab === 'support'      && <ScreenSupport />}
          {tab === 'settings'     && <ScreenAccount />}
        </main>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes supportFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
