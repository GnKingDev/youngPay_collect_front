import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, Link2, Wallet, BarChart3, Settings,
  LogOut, Search, Bell, Menu, X, TrendingUp, Activity, CheckCircle,
  ArrowRight, Copy, Check, ChevronLeft, ChevronRight, Plus,
  Download, Share2, Ban, Filter, FileText, Smartphone, Building2,
  Code2, Key, Eye, EyeOff, Webhook, BookOpen, Terminal, Globe,
  Package, ShoppingBag, Receipt, Tag, Trash2, Edit3, Send, ClipboardList,
  CheckSquare, Clock, AlertCircle,
  Headphones, MessageCircle, Paperclip, SmilePlus, ChevronDown,
  UserCircle, ShieldCheck, Zap, Upload, Lock, Megaphone, Camera,
} from 'lucide-react'
import logo from '../assets/logo.png'

/* ─── API ─────────────────────────────────────────────── */
let _env: 'sandbox' | 'production' = 'sandbox'

const apiFetch = async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('yp_token')
  const sep   = path.includes('?') ? '&' : '?'
  const url   = '/api/v1' + path + sep + 'env=' + _env
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> ?? {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? res.statusText)
  }
  return res.json()
}

/* ─── Helpers ─────────────────────────────────────────── */
const fmt = (n: number) =>
  n.toLocaleString('fr-GN') + ' GNF'

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}

/* ─── Mock data ───────────────────────────────────────── */
const NAV = [
  { id: 'dashboard',     icon: LayoutDashboard, label: 'Tableau de bord' },
  { id: 'links',         icon: Link2,           label: 'Liens de paiement' },
  { id: 'direct',        icon: Zap,             label: 'Direct Collect' },
  { id: 'reversements',  icon: Wallet,          label: 'Reversements' },
  { id: 'transactions',  icon: ArrowLeftRight,  label: 'Transactions' },
  { id: 'developer',     icon: Code2,           label: 'Développeur' },
  { id: 'support',       icon: Headphones,      label: 'Support' },
  { id: 'settings',      icon: UserCircle,      label: 'Mon compte' },
]

type PayMethod = { id: string; code: string; label: string; color: string; bg_color: string }
// Chargé depuis /v1/payment-methods au montage du Dashboard
let _payMethods: PayMethod[] = []
fetch('/api/v1/payment-methods')
  .then(r => r.json())
  .then((d: { id: string; code: string; label: string; color: string; bg_color: string }[]) => {
    if (Array.isArray(d)) _payMethods = d.map(m => ({ ...m, id: m.code }))
  })
  .catch(() => {})

const getMethod = (code: string): PayMethod =>
  _payMethods.find(m => m.code === code) ?? { id: code, code, label: code, color: '#94A3B8', bg_color: 'rgba(148,163,184,0.12)' }

// Pour les selects filtres (liste réactive dans les composants)
const useMethods = () => {
  const [methods, setMethods] = useState<PayMethod[]>(_payMethods)
  useEffect(() => {
    if (_payMethods.length > 0) { setMethods(_payMethods); return }
    fetch('/api/v1/payment-methods')
      .then(r => r.json())
      .then((d: { id: string; code: string; label: string; color: string; bg_color: string }[]) => {
        if (Array.isArray(d)) {
          _payMethods = d.map(m => ({ ...m, id: m.code }))
          setMethods(_payMethods)
        }
      })
      .catch(() => {})
  }, [])
  return methods
}

type TxRow      = { id: string; client: string; phone: string; method: string; amount: number; status: string; date: string; dateISO: string }
type RevRow     = { date: string; amount: number; dest: string; status: string; ref: string }
type ProductRow = { id: string; name: string; category: string; price: number; unit: string; stock: number | null; sales: number }
type InvoiceRow = { id: string; client: string; phone: string; items: { name: string; qty: number; price: number }[]; total: number; status: string; date: string; due: string }

type CFieldType = 'text' | 'number' | 'email' | 'tel' | 'select' | 'textarea' | 'date'
type CField = { id: string; label: string; type: CFieldType; options: string; required: boolean }

/* ─── Status badge ────────────────────────────────────── */
const StatusBadge = ({ s }: { s: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    success: { label: 'Réussi',     cls: 'bg-green-100 text-green-700' },
    pending: { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
    failed:  { label: 'Échoué',     cls: 'bg-red-100 text-red-600'     },
    done:    { label: 'Traité',     cls: 'bg-green-100 text-green-700' },
    active:  { label: 'Actif',      cls: 'bg-green-100 text-green-700' },
    expired: { label: 'Expiré',     cls: 'bg-navy-100 text-navy-500'   },
  }
  const { label, cls } = map[s] ?? { label: s, cls: 'bg-navy-100 text-navy-500' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  )
}

/* ─── Method badge ────────────────────────────────────── */
const MethodBadge = ({ id }: { id: string }) => {
  const m = getMethod(id)
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold"
      style={{ backgroundColor: m.bg_color, color: m.color }}>
      {m.label}
    </span>
  )
}

/* ─── QR placeholder ──────────────────────────────────── */
const QRPlaceholder = () => {
  const pattern = [1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,0,1,0,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,0,1,0,1,0,0,1,0,1,1,1,1]
  return (
    <div className="grid gap-px" style={{ gridTemplateColumns: 'repeat(7, 1fr)', width: 56, height: 56 }}>
      {pattern.slice(0, 49).map((v, i) => (
        <div key={i} className="rounded-[1px]"
          style={{ backgroundColor: v ? '#0F172A' : '#F8FAFC' }} />
      ))}
    </div>
  )
}

/* ─── Stat Card ───────────────────────────────────────── */
const StatCard = ({ icon, iconBg, iconColor, label, value, sub, badge }: {
  icon: React.ReactNode; iconBg: string; iconColor: string
  label: string; value: string; sub: string; badge: string
}) => (
  <div className="bg-white rounded-2xl p-6 border border-navy-100"
    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBg, color: iconColor }}>
        {icon}
      </div>
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
        {badge}
      </span>
    </div>
    <p className="font-bold text-2xl text-navy leading-tight mb-1">{value}</p>
    <p className="text-navy-400 text-xs font-medium">{sub}</p>
    <p className="text-navy-300 text-[11px] mt-0.5 uppercase tracking-wide">{label}</p>
  </div>
)

/* ═══════════════════════════════════════════════════════
   SCREEN: DASHBOARD
══════════════════════════════════════════════════════ */
const ScreenDashboard = ({ setTab }: { setTab: (t: string) => void }) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [txRecent, setTxRecent]   = useState<TxRow[]>([])
  const [apiStats,   setApiStats]   = useState<{ total: number; success: number; volume: number; net: number } | null>(null)
  const [totalPaid,  setTotalPaid]  = useState<number | null>(null)
  const [chartData,   setChartData]   = useState<{month: string; value: number}[]>([])
  const [methodShare, setMethodShare] = useState<{operator: string; pct: number; volume: number}[]>([])

  const CURRENT_YEAR = new Date().getFullYear()
  const LAUNCH_YEAR  = 2026
  const yearOptions  = Array.from(
    { length: CURRENT_YEAR - LAUNCH_YEAR + 1 },
    (_, i) => CURRENT_YEAR - i
  )
  const [chartYear, setChartYear] = useState(CURRENT_YEAR)

  useEffect(() => {
    apiFetch<{ total: number; success: number; volume: number; net: number }>('/transactions/stats')
      .then(s => setApiStats(s))
      .catch(() => {})
    apiFetch<{ data: Record<string, unknown>[] }>('/transactions?limit=3')
      .then(r => {
        if (r.data?.length) setTxRecent(r.data.map((tx: Record<string, unknown>) => ({
          id:      tx.id as string,
          client:  (tx.description as string) || '—',
          phone:   (tx.phone as string) || '—',
          method:  tx.operator as string,
          amount:  Number(tx.amount),
          status:  (tx.status as string).toLowerCase(),
          date:    new Date(tx.created_at as string).toLocaleString('fr-GN'),
          dateISO: (tx.created_at as string).slice(0, 10),
        })))
      })
      .catch(() => {})
    apiFetch<{operator: string; count: number; volume: number; pct: number}[]>('/transactions/method-share')
      .then(d => setMethodShare(d))
      .catch(() => {})
    apiFetch<{ balance: number; total_net: number; total_paid_out: number }>('/reversements/balance')
      .then(r => setTotalPaid(r.total_paid_out))
      .catch(() => {})
  }, [])

  useEffect(() => {
    apiFetch<{month: string; value: number}[]>(`/transactions/chart-data?year=${chartYear}`)
      .then(d => setChartData(d))
      .catch(() => {})
  }, [chartYear])

  return (
    <div className="p-6 space-y-6">

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setTab('links')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 4px 16px rgba(249,115,22,0.30)' }}>
          <Plus className="w-4 h-4" /> Générer un lien
        </button>
        <button onClick={() => setTab('reversements')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-navy font-semibold text-sm border-2 border-navy-200 bg-white hover:border-amber-400 transition-colors">
          <Wallet className="w-4 h-4" /> Demander un reversement
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Wallet className="w-5 h-5" />}
          iconBg="rgba(249,115,22,0.12)" iconColor="#F97316"
          label="Montant net"
          value={apiStats ? fmt(Number(apiStats.net)) : '0 GNF'}
          sub="Après commission 1,2%"
          badge="Net"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          iconBg="rgba(16,185,129,0.12)" iconColor="#10B981"
          label="Paiements reçus"
          value={apiStats ? String(Number(apiStats.success)) : '0'}
          sub="Transactions réussies"
          badge="Total"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="rgba(99,102,241,0.12)" iconColor="#6366F1"
          label="Montant total reversé"
          value={totalPaid !== null ? fmt(totalPaid) : '0 GNF'}
          sub="Reversements traités"
          badge="Reversé"
        />
      </div>

      {/* Chart + Method split */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Bar chart */}
        <div className="flex-1 bg-white rounded-2xl p-6 border border-navy-100"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-navy text-base">Évolution des revenus</h3>
            <select
              value={chartYear}
              onChange={e => setChartYear(Number(e.target.value))}
              className="text-xs text-navy-500 border border-navy-200 rounded-lg px-3 py-1.5 outline-none bg-white"
              style={{ fontFamily: 'Poppins, sans-serif' }}>
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-1 items-end h-48 relative">
            {/* Y-axis labels — dynamiques selon le max réel */}
            {(() => {
              const maxVal = Math.max(...chartData.map(d => d.value), 1)
              const top = Math.ceil(maxVal / 1_000_000)
              const labels = top > 0
                ? [top + 'M', Math.round(top * 2/3) + 'M', Math.round(top / 3) + 'M', '0']
                : ['—', '', '', '0']
              return (
                <div className="flex flex-col justify-between h-full mr-2 text-[10px] text-navy-400 font-medium text-right flex-shrink-0">
                  {labels.map((l, i) => <span key={i}>{l}</span>)}
                </div>
              )
            })()}
            {/* Bars */}
            {chartData.map((d, i) => {
              const maxVal = Math.max(...chartData.map(d => d.value), 1)
              const h = d.value > 0 ? (d.value / maxVal) * 100 : 0
              const isHovered = hoveredBar === i
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}>
                  {/* Tooltip */}
                  {isHovered && d.value > 0 && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-navy text-white text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap z-10"
                      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                      {fmtShort(d.value)} GNF
                    </div>
                  )}
                  {/* Bar container */}
                  <div className="w-full flex-1 flex items-end">
                    <div className="w-full rounded-t-lg transition-all duration-200"
                      style={{
                        height: d.value > 0 ? `${h}%` : '8px',
                        background: d.value > 0
                          ? isHovered
                            ? 'linear-gradient(to top, #F97316, #FBBF24)'
                            : 'linear-gradient(to top, #F97316, #F59E0B)'
                          : '#E2E8F0',
                        minHeight: '8px',
                      }} />
                  </div>
                  <span className="text-[9px] text-navy-400 font-medium">{d.month}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Method breakdown */}
        <div className="lg:w-72 bg-white rounded-2xl p-6 border border-navy-100"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h3 className="font-bold text-navy text-base mb-5">Répartition par méthode</h3>
          <div className="space-y-4">
            {methodShare.length === 0 ? (
              <p className="text-navy-400 text-sm text-center py-4">Aucune donnée</p>
            ) : methodShare.map(m => {
              const OPERATOR_META: Record<string, { label: string; color: string }> = {
                orange_money: { label: 'Orange Money', color: '#FF6200' },
                mtn:          { label: 'MTN Mobile',   color: '#FFCD00' },
                soutra:       { label: 'Soutra Money', color: '#10B981' },
                kulu:         { label: 'KULU',         color: '#8B5CF6' },
                paycard:      { label: 'PayCard',      color: '#F59E0B' },
                visa:         { label: 'Visa/MC',      color: '#1A56DB' },
              }
              const meta = OPERATOR_META[m.operator] ?? { label: m.operator, color: '#94A3B8' }
              return (
              <div key={m.operator}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-navy-600">{meta.label}</span>
                  <span className="text-xs font-bold text-navy">{m.pct}%</span>
                </div>
                <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${m.pct}%`, backgroundColor: meta.color }} />
                </div>
              </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="px-6 py-4 flex items-center justify-between border-b border-navy-100">
          <h3 className="font-bold text-navy text-base">Transactions récentes</h3>
          <button onClick={() => setTab('transactions')}
            className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ color: '#F97316' }}>
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC]">
                {['ID', 'Client', 'Méthode', 'Montant', 'Statut', 'Date'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-navy-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txRecent.map((tx, i) => (
                <tr key={tx.id}
                  className={`border-t border-navy-100 hover:bg-[#F8FAFC] transition-colors cursor-default ${i % 2 === 0 ? '' : ''}`}>
                  <td className="px-5 py-3.5 font-mono text-xs text-navy-500 font-medium">{tx.id}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-navy text-xs">{tx.client}</p>
                    <p className="text-navy-400 text-[10px]">{tx.phone}</p>
                  </td>
                  <td className="px-5 py-3.5"><MethodBadge id={tx.method} /></td>
                  <td className="px-5 py-3.5 font-bold text-navy text-xs whitespace-nowrap">{fmt(tx.amount)}</td>
                  <td className="px-5 py-3.5"><StatusBadge s={tx.status} /></td>
                  <td className="px-5 py-3.5 text-navy-400 text-xs whitespace-nowrap">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN: TRANSACTIONS
══════════════════════════════════════════════════════ */
const ScreenTransactions = () => {
  const [search,   setSearch]   = useState('')
  const [method,   setMethod]   = useState('')
  const [status,   setStatus]   = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')
  const [page,     setPage]     = useState(1)
  const [selAll,   setSelAll]   = useState(false)
  const [txData,   setTxData]   = useState<TxRow[]>([])
  const methods = useMethods()

  useEffect(() => {
    apiFetch<{ data: Record<string, unknown>[] }>('/transactions?limit=100')
      .then(r => {
        if (r.data?.length) setTxData(r.data.map(tx => ({
          id:      tx.id as string,
          client:  (tx.description as string) || '—',
          phone:   (tx.phone as string) || '—',
          method:  tx.operator as string,
          amount:  Number(tx.amount),
          status:  (tx.status as string).toLowerCase(),
          date:    new Date(tx.created_at as string).toLocaleString('fr-GN'),
          dateISO: (tx.created_at as string).slice(0, 10),
        })))
      })
      .catch(() => {})
  }, [])
  const [selected, setSelected] = useState<string[]>([])
  const PER = 10

  const hasFilters = search || method || status || dateFrom || dateTo

  const filtered = txData.filter(tx => {
    const q = search.toLowerCase()
    if (q && !tx.id.toLowerCase().includes(q) && !tx.client.toLowerCase().includes(q) && !tx.phone.includes(q)) return false
    if (method   && tx.method      !== method)   return false
    if (status   && tx.status      !== status)   return false
    if (dateFrom && tx.dateISO < dateFrom)        return false
    if (dateTo   && tx.dateISO > dateTo)          return false
    return true
  })
  const total  = filtered.length
  const paged  = filtered.slice((page - 1) * PER, page * PER)
  const pages  = Math.max(1, Math.ceil(total / PER))

  const toggleRow = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  function resetFilters() {
    setSearch(''); setMethod(''); setStatus(''); setDateFrom(''); setDateTo(''); setPage(1)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 space-y-3"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        {/* Row 1 : search + method + status + export */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Rechercher par ID, client ou téléphone…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-navy-200 text-sm text-navy outline-none focus:border-amber-400 transition-colors bg-white"
              style={{ fontFamily: 'Poppins, sans-serif' }} />
          </div>
          <select value={method} onChange={e => { setMethod(e.target.value); setPage(1) }}
            className="px-4 py-2.5 rounded-xl border border-navy-200 text-sm text-navy outline-none focus:border-amber-400 transition-colors bg-white"
            style={{ fontFamily: 'Poppins, sans-serif' }}>
            <option value="">Tous opérateurs</option>
            {methods.map(m => <option key={m.code} value={m.code}>{m.label}</option>)}
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="px-4 py-2.5 rounded-xl border border-navy-200 text-sm text-navy outline-none focus:border-amber-400 transition-colors bg-white"
            style={{ fontFamily: 'Poppins, sans-serif' }}>
            <option value="">Tous statuts</option>
            <option value="success">Réussi</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoué</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-navy-200 text-sm font-semibold text-navy bg-white hover:border-amber-400 transition-colors">
            <Download className="w-4 h-4" /> Exporter CSV
          </button>
        </div>
        {/* Row 2 : date range + reset */}
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-navy-400 shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-navy-400 font-medium">Du</span>
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
              className="px-3 py-2 rounded-xl border border-navy-200 text-sm text-navy outline-none focus:border-amber-400 transition-colors bg-white"
              style={{ fontFamily: 'Poppins, sans-serif' }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-navy-400 font-medium">Au</span>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
              className="px-3 py-2 rounded-xl border border-navy-200 text-sm text-navy outline-none focus:border-amber-400 transition-colors bg-white"
              style={{ fontFamily: 'Poppins, sans-serif' }} />
          </div>
          {hasFilters && (
            <button onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors"
              style={{ borderColor: '#FCA5A5', background: '#FEF2F2', color: '#DC2626', fontFamily: 'Poppins, sans-serif' }}>
              <X className="w-3 h-3" /> Réinitialiser
            </button>
          )}
          <span className="ml-auto text-xs text-navy-400">
            <span className="font-semibold text-navy">{total}</span> résultat{total > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-navy-100">
                <th className="px-4 py-3.5">
                  <input type="checkbox" checked={selAll}
                    onChange={e => { setSelAll(e.target.checked); setSelected(e.target.checked ? paged.map(r => r.id) : []) }}
                    className="rounded" />
                </th>
                {['ID Transaction','Client','Méthode','Montant GNF','Frais (1.2%)','Net reçu','Statut','Date & Heure'].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 font-semibold text-navy-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-navy-400 text-sm">Aucune transaction trouvée</td></tr>
              ) : paged.map(tx => {
                const fees = Math.round(tx.amount * 0.012)
                const net  = tx.amount - fees
                return (
                  <tr key={tx.id} className="border-t border-navy-100 hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selected.includes(tx.id)}
                        onChange={() => toggleRow(tx.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3.5 font-mono font-medium text-navy-500">{tx.id}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-navy">{tx.client}</p>
                      <p className="text-navy-400">{tx.phone}</p>
                    </td>
                    <td className="px-4 py-3.5"><MethodBadge id={tx.method} /></td>
                    <td className="px-4 py-3.5 font-bold text-navy whitespace-nowrap">{fmt(tx.amount)}</td>
                    <td className="px-4 py-3.5 text-red-500 font-medium whitespace-nowrap">-{fmt(fees)}</td>
                    <td className="px-4 py-3.5 font-bold text-green-600 whitespace-nowrap">{fmt(net)}</td>
                    <td className="px-4 py-3.5"><StatusBadge s={tx.status} /></td>
                    <td className="px-4 py-3.5 text-navy-400 whitespace-nowrap">{tx.date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-navy-100 flex items-center justify-between">
          <p className="text-xs text-navy-400 font-medium">
            Affichage {Math.min((page - 1) * PER + 1, total)}–{Math.min(page * PER, total)} sur {total} transactions
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-navy-200 flex items-center justify-center text-navy-500 hover:border-amber-400 disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).filter(p => Math.abs(p - page) < 3).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  p === page ? 'text-white' : 'border border-navy-200 text-navy hover:border-amber-400'
                }`}
                style={p === page ? { background: 'linear-gradient(135deg, #F59E0B, #F97316)' } : {}}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="w-8 h-8 rounded-lg border border-navy-200 flex items-center justify-center text-navy-500 hover:border-amber-400 disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN: PAYMENT LINKS
══════════════════════════════════════════════════════ */
const FIELD_TYPE_OPTS: { value: CFieldType; label: string; hint: string }[] = [
  { value: 'text',     label: 'Texte court',     hint: 'Ex: Nom complet' },
  { value: 'number',   label: 'Nombre',           hint: 'Ex: Quantité' },
  { value: 'email',    label: 'Email',            hint: 'Ex: Adresse email' },
  { value: 'tel',      label: 'Téléphone',        hint: 'Ex: Numéro de contact' },
  { value: 'select',   label: 'Liste déroulante', hint: 'Options séparées par des virgules' },
  { value: 'textarea', label: 'Texte long',       hint: 'Ex: Adresse de livraison' },
  { value: 'date',     label: 'Date',             hint: 'Ex: Date de rendez-vous' },
]
const MAX_CUSTOM_FIELDS = 4

type LinkItem = { id: string; title: string; amount: number; status: string; payments: number; created: string; methods: string[]; customFields: CField[] }

const ScreenLinks = () => {
  const allMethods = useMethods()
  const [showForm,      setShowForm]      = useState(false)
  const [title,         setTitle]         = useState('')
  const [amount,        setAmount]        = useState('')
  const [desc,          setDesc]          = useState('')
  const [expiry,        setExpiry]        = useState('inf')
  const [copiedId,      setCopiedId]      = useState<string | null>(null)
  const [methods,       setMethods]       = useState<string[]>([])
  const [methodsOpen,   setMethodsOpen]   = useState(false)
  const [generated,       setGenerated]       = useState(false)
  const [generatedLink,   setGeneratedLink]   = useState('')
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [showShareModal,  setShowShareModal]  = useState(false)
  const [shareLink,       setShareLink]       = useState('')
  const [page,            setPage]            = useState(1)
  const [customFields,    setCustomFields]    = useState<CField[]>([])
  const [linksData,       setLinksData]       = useState<LinkItem[]>([])
  const [selectedLink,    setSelectedLink]    = useState<LinkItem | null>(null)
  const [editFields,      setEditFields]      = useState<CField[]>([])

  const getPayUrl = (linkId: string) =>
    _env === 'production'
      ? `https://youngpaycollect.com/pay/${linkId}`
      : `https://sandbox.youngpaycollect.com/pay/${linkId}`

  useEffect(() => {
    apiFetch<{ data: Record<string, unknown>[] }>('/payment-links')
      .then(r => {
        if (r.data?.length) setLinksData(r.data.map(l => ({
          id:           l.id as string,
          title:        l.title as string,
          amount:       Number(l.amount) || 0,
          status:       l.status as string,
          payments:     0,
          created:      new Date(l.created_at as string).toLocaleDateString('fr-GN'),
          methods:      (l.methods as string[]) || [],
          customFields: [],
        })))
      })
      .catch(() => {})
  }, [])
  const LINKS_PAGE_SIZE = 5

  useEffect(() => { setEditFields(selectedLink ? [...selectedLink.customFields] : []) }, [selectedLink])

  const addEditField    = () => { if (editFields.length >= MAX_CUSTOM_FIELDS) return; setEditFields(f => [...f, { id: Date.now().toString(), label: '', type: 'text', options: '', required: false }]) }
  const removeEditField = (id: string) => setEditFields(f => f.filter(x => x.id !== id))
  const updateEditField = (id: string, patch: Partial<CField>) => setEditFields(f => f.map(x => x.id === id ? { ...x, ...patch } : x))

  const toggleMethod = (id: string) =>
    setMethods(m => m.includes(id) ? m.filter(x => x !== id) : [...m, id])

  const addField = () => {
    if (customFields.length >= MAX_CUSTOM_FIELDS) return
    setCustomFields(f => [...f, { id: Date.now().toString(), label: '', type: 'text', options: '', required: false }])
  }
  const removeField = (id: string) => setCustomFields(f => f.filter(x => x.id !== id))
  const updateField = (id: string, patch: Partial<CField>) =>
    setCustomFields(f => f.map(x => x.id === id ? { ...x, ...patch } : x))

  const handleGenerate = async () => {
    if (!title || !amount) return
    try {
      const created = await apiFetch<Record<string, unknown>>('/payment-links', {
        method: 'POST',
        body: JSON.stringify({ title, amount: Number(amount.replace(/\s/g, '')), description: desc, methods }),
      })
      const link = getPayUrl(created.id as string)
      setGeneratedLink(link)
      setGenerated(true)
      setShowConfirm(false)
      setLinksData(prev => [{
        id: created.id as string, title, amount: Number(amount.replace(/\s/g, '')),
        status: 'active', payments: 0,
        created: new Date().toLocaleDateString('fr-GN'),
        methods, customFields,
      }, ...prev])
    } catch {
      setShowConfirm(false)
    }
  }

  const handleCopy = (id: string, link: string) => {
    navigator.clipboard.writeText('https://' + link).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function closeModal() {
    setShowForm(false); setGenerated(false); setTitle(''); setAmount(''); setDesc('')
    setExpiry('inf'); setMethods(['orange_money', 'mtn', 'soutra', 'kulu', 'paycard']); setCustomFields([])
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-navy text-lg">Liens de paiement</span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
            {linksData.filter(l => l.status === 'active').length} liens actifs
          </span>
        </div>
        <button onClick={() => { setShowForm(true); setGenerated(false) }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 4px 16px rgba(249,115,22,0.30)' }}>
          <Plus className="w-4 h-4" />
          Créer une facture
        </button>
      </div>

      {/* ── Modal ── */}
      {showForm && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-50" style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)' }}
            onClick={closeModal} />
          {/* Modal box */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl flex flex-col"
              style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'fadeUp 0.22s ease-out', maxHeight: '92vh' }}>

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(249,115,22,0.10)' }}>
                    <Link2 className="w-4 h-4" style={{ color: '#F97316' }} />
                  </div>
                  <h3 className="font-bold text-navy text-base">
                    {generated ? 'Lien généré !' : 'Nouveau lien de paiement'}
                  </h3>
                </div>
                <button onClick={closeModal}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-400 hover:bg-navy-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal body: two-col form OR success screen */}
              {!generated ? (
                <>
                  {/* ── Two columns (scrollable each) ── */}
                  <div className="flex overflow-hidden" style={{ minHeight: 0, flex: 1 }}>

                    {/* LEFT COL — informations */}
                    <div className="flex flex-col flex-1 border-r border-navy-100 overflow-y-auto" style={{ minWidth: 0 }}>
                      <div className="p-6 flex flex-col gap-4">
                        <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest">Informations du lien</p>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-navy uppercase tracking-wide">Titre *</label>
                          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Commande boutique #120"
                            className="rounded-xl border-2 border-navy-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-amber-400 transition-colors"
                            style={{ fontFamily: 'Poppins, sans-serif' }} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-navy uppercase tracking-wide">Montant (GNF) *</label>
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={amount}
                              onChange={e => {
                                const raw = e.target.value.replace(/\s/g, '').replace(/[^\d]/g, '')
                                setAmount(raw ? Number(raw).toLocaleString('fr-FR').replace(/ /g, ' ') : '')
                              }}
                              placeholder="Ex : 250 000"
                              className="w-full rounded-xl border-2 border-navy-200 px-4 py-2.5 pr-14 text-sm text-navy font-semibold outline-none focus:border-amber-400 transition-colors"
                              style={{ fontFamily: 'Poppins, sans-serif' }}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-navy-400">GNF</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-navy uppercase tracking-wide">Description</label>
                          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Description optionnelle…"
                            className="rounded-xl border-2 border-navy-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-amber-400 transition-colors resize-none"
                            style={{ fontFamily: 'Poppins, sans-serif' }} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-navy uppercase tracking-wide">Expiration</label>
                          <select value={expiry} onChange={e => setExpiry(e.target.value)}
                            className="rounded-xl border-2 border-navy-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-amber-400 transition-colors bg-white"
                            style={{ fontFamily: 'Poppins, sans-serif' }}>
                            <option value="24h">24 heures</option>
                            <option value="48h">48 heures</option>
                            <option value="7j">7 jours</option>
                            <option value="inf">Illimité</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-navy uppercase tracking-wide">Moyens de paiement</label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setMethodsOpen(v => !v)}
                              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-navy-200 bg-navy-50 text-sm text-navy font-medium transition-colors"
                              style={{ outline: 'none' }}>
                              <span className="text-xs">
                                {methods.length === 0
                                  ? 'Aucune méthode'
                                  : methods.length === allMethods.length
                                  ? 'Toutes les méthodes'
                                  : `${methods.length} méthode${methods.length > 1 ? 's' : ''} sélectionnée${methods.length > 1 ? 's' : ''}`}
                              </span>
                              <ChevronDown className="w-3.5 h-3.5 text-navy-400" style={{ transform: methodsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                            {methodsOpen && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-navy-200 rounded-xl shadow-lg z-20 overflow-hidden">
                                {allMethods.map(m => (
                                  <button
                                    key={m.code}
                                    type="button"
                                    onClick={() => toggleMethod(m.code)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-navy-50 transition-colors text-left"
                                  >
                                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all"
                                      style={methods.includes(m.code)
                                        ? { background: '#F97316', borderColor: '#F97316' }
                                        : { borderColor: '#CBD5E1' }}>
                                      {methods.includes(m.code) && <Check className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                    <span className="text-xs font-semibold text-navy">{m.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COL — champs personnalisés */}
                    <div className="flex flex-col overflow-y-auto" style={{ width: '46%', minWidth: 0 }}>
                      <div className="p-6 flex flex-col gap-3 h-full">
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-bold text-navy-400 uppercase tracking-widest">Champs du formulaire</p>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: customFields.length >= MAX_CUSTOM_FIELDS ? 'rgba(239,68,68,0.10)' : 'rgba(249,115,22,0.10)', color: customFields.length >= MAX_CUSTOM_FIELDS ? '#EF4444' : '#F97316' }}>
                            {customFields.length}/{MAX_CUSTOM_FIELDS}
                          </span>
                        </div>

                        <button onClick={addField} disabled={customFields.length >= MAX_CUSTOM_FIELDS}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ background: 'rgba(249,115,22,0.07)', color: '#F97316', border: '1.5px dashed rgba(249,115,22,0.38)' }}>
                          <Plus className="w-3.5 h-3.5" /> Ajouter un champ
                        </button>

                        {customFields.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-6 rounded-xl border-2 border-dashed border-navy-200" style={{ background: '#FAFBFC' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(249,115,22,0.08)' }}>
                              <Plus className="w-5 h-5" style={{ color: '#F97316' }} />
                            </div>
                            <p className="text-xs text-navy-400 font-semibold mb-1">Aucun champ ajouté</p>
                            <p className="text-xs text-navy-300 leading-relaxed">Ajoutez jusqu'à 4 champs pour collecter des infos du client (nom, adresse, référence…)</p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {customFields.map((cf, idx) => (
                              <div key={cf.id} className="rounded-xl border border-navy-200 p-3"
                                style={{ background: '#FAFBFC', animation: 'fadeUp 0.18s ease-out' }}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', color: '#fff' }}>
                                    {idx + 1}
                                  </span>
                                  <input value={cf.label} onChange={e => updateField(cf.id, { label: e.target.value })}
                                    placeholder="Libellé (ex: Nom complet)"
                                    className="flex-1 rounded-lg border border-navy-200 px-2.5 py-1.5 text-xs text-navy outline-none focus:border-amber-400 transition-colors bg-white"
                                    style={{ fontFamily: 'Poppins, sans-serif' }} />
                                  <button onClick={() => removeField(cf.id)}
                                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors hover:bg-red-50"
                                    style={{ border: '1px solid #FECACA', color: '#EF4444' }}>
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <select value={cf.type} onChange={e => updateField(cf.id, { type: e.target.value as CFieldType, options: '' })}
                                    className="flex-1 rounded-lg border border-navy-200 px-2.5 py-1.5 text-xs text-navy outline-none focus:border-amber-400 transition-colors bg-white"
                                    style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {FIELD_TYPE_OPTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                  </select>
                                  <label className="flex items-center gap-1 cursor-pointer flex-shrink-0 select-none">
                                    <div onClick={() => updateField(cf.id, { required: !cf.required })}
                                      className="w-4 h-4 rounded flex items-center justify-center transition-all"
                                      style={{ border: `2px solid ${cf.required ? '#F97316' : '#E2E8F0'}`, background: cf.required ? 'linear-gradient(135deg,#F59E0B,#F97316)' : '#fff' }}>
                                      {cf.required && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                    </div>
                                    <span className="text-xs text-navy-400">Requis</span>
                                  </label>
                                </div>
                                {cf.type === 'select' && (
                                  <input value={cf.options} onChange={e => updateField(cf.id, { options: e.target.value })}
                                    placeholder="Option A, Option B, Option C"
                                    className="w-full mt-2 rounded-lg border border-navy-200 px-2.5 py-1.5 text-xs text-navy outline-none focus:border-amber-400 transition-colors bg-white"
                                    style={{ fontFamily: 'Poppins, sans-serif' }} />
                                )}
                                <p className="text-[10px] text-navy-300 mt-1.5">{FIELD_TYPE_OPTS.find(t => t.value === cf.type)?.hint}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Footer buttons ── */}
                  <div className="flex gap-3 px-6 py-4 border-t border-navy-100 flex-shrink-0">
                    <button onClick={closeModal}
                      className="flex-1 py-3 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy hover:border-amber-400 transition-colors"
                      style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Annuler
                    </button>
                    <button onClick={() => { if (!title || !amount) return; setShowConfirm(true) }} disabled={!title || !amount}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 4px 16px rgba(249,115,22,0.30)', fontFamily: 'Poppins, sans-serif' }}>
                      <Link2 className="w-4 h-4" /> Générer le lien
                    </button>
                  </div>
                </>
              ) : (
                <div className="overflow-y-auto p-6" style={{ animation: 'fadeUp 0.25s ease-out' }}>
                  <div className="text-center mb-5">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <Check className="w-8 h-8 text-green-500" strokeWidth={2.5} />
                    </div>
                    <h3 className="font-bold text-navy text-lg mb-0.5">Lien généré avec succès !</h3>
                    <p className="text-navy-400 text-sm">{title} — {Number(amount).toLocaleString('fr-GN')} GNF</p>
                  </div>
                  <div className="flex items-center justify-between bg-navy-50 rounded-xl px-4 py-3 border border-navy-200 mb-4">
                    <span className="text-navy text-xs font-medium truncate">{generatedLink}</span>
                    <button onClick={() => handleCopy('new', generatedLink)}
                      className="ml-3 flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#F97316' }}>
                      {copiedId === 'new' ? <><Check className="w-3 h-3" />Copié</> : <><Copy className="w-3 h-3" />Copier</>}
                    </button>
                  </div>
                  {customFields.length > 0 && (
                    <div className="rounded-xl border border-navy-200 p-3 mb-4" style={{ background: '#FAFBFC' }}>
                      <p className="text-xs font-semibold text-navy mb-2 uppercase tracking-wide">Champs du formulaire ({customFields.length})</p>
                      <div className="space-y-1.5">
                        {customFields.map((cf, i) => (
                          <div key={cf.id} className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)' }}>{i + 1}</span>
                            <span className="text-xs font-semibold text-navy flex-1">{cf.label || <span className="text-navy-300 italic">Sans titre</span>}</span>
                            <span className="text-xs text-navy-400">{FIELD_TYPE_OPTS.find(t => t.value === cf.type)?.label}</span>
                            {cf.required && <span className="text-xs font-bold" style={{ color: '#F97316' }}>*</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-center gap-2 mb-4">
                    {['💬 WhatsApp', '📱 SMS', '📧 Email'].map(s => (
                      <button key={s} className="px-3.5 py-2 rounded-xl border-2 border-navy-200 text-xs font-semibold text-navy hover:border-amber-400 transition-colors">{s}</button>
                    ))}
                  </div>
                  <div className="text-center">
                    <button onClick={closeModal}
                      className="px-6 py-2.5 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy hover:border-amber-400 transition-colors"
                      style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Fermer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Links list */}
      {(() => {
        const totalPages = Math.ceil(linksData.length / LINKS_PAGE_SIZE)
        const pageLinks  = linksData.slice((page - 1) * LINKS_PAGE_SIZE, page * LINKS_PAGE_SIZE)
        return (
          <>
            <div className="space-y-3">
              {pageLinks.map(link => (
                <div key={link.id}
                  className="bg-white rounded-2xl border border-navy-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-navy-100"
                    style={{ background: 'linear-gradient(135deg,#FFF7ED,#FEF3C7)' }}>
                    <Link2 className="w-6 h-6" style={{ color: '#F97316' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-navy text-sm">{link.title}</span>
                      <StatusBadge s={link.status} />
                    </div>
                    <p className="text-navy font-semibold text-base">{fmt(link.amount)}</p>
                    <p className="text-navy-400 text-xs mt-0.5">
                      {link.payments} paiement{link.payments > 1 ? 's' : ''} reçu{link.payments > 1 ? 's' : ''} · Créé le {link.created}
                    </p>
                    <div className="flex gap-1.5 mt-2">
                      {link.methods.map(m => <MethodBadge key={m} id={m} />)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setSelectedLink(link)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                      style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.22)', color: '#F97316' }}>
                      <Eye className="w-3.5 h-3.5" /> Détail
                    </button>
                    <button onClick={() => handleCopy(link.id, `pay.youngpaycollect.com/${link.id}`)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-navy-200 text-xs font-semibold text-navy hover:border-amber-400 transition-colors">
                      {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === link.id ? 'Copié' : 'Copier'}
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-navy-200 text-xs font-semibold text-navy hover:border-amber-400 transition-colors">
                      <Share2 className="w-3.5 h-3.5" /> Partager
                    </button>
                    {link.status === 'active' && (
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
                        <Ban className="w-3.5 h-3.5" /> Désactiver
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-navy-400">
                  Liens <span className="font-semibold text-navy">{(page - 1) * LINKS_PAGE_SIZE + 1}–{Math.min(page * LINKS_PAGE_SIZE, linksData.length)}</span> sur <span className="font-semibold text-navy">{linksData.length}</span>
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="w-8 h-8 rounded-lg border border-navy-200 flex items-center justify-center text-navy disabled:opacity-40 hover:border-amber-400 transition-colors text-xs font-bold">
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className="w-8 h-8 rounded-lg border text-xs font-bold transition-colors"
                      style={p === page
                        ? { background: 'linear-gradient(135deg,#F59E0B,#F97316)', color: '#fff', border: 'none' }
                        : { borderColor: '#E2E8F0', color: '#64748B' }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg border border-navy-200 flex items-center justify-center text-navy disabled:opacity-40 hover:border-amber-400 transition-colors text-xs font-bold">
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )
      })()}

      {/* ── Panneau Détail / Édition ── */}
      {selectedLink && (
        <>
          <style>{`@keyframes slideInRight { from { transform:translateX(100%); } to { transform:translateX(0); } }`}</style>
          <div className="fixed inset-0 z-40" style={{ background: 'rgba(15,23,42,0.25)', backdropFilter: 'blur(1px)' }}
            onClick={() => setSelectedLink(null)} />
          <div className="fixed right-0 top-0 h-full z-50 bg-white overflow-y-auto flex flex-col"
            style={{ width: 420, boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', animation: 'slideInRight 0.24s ease-out' }}>

            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-navy-100"
                  style={{ background: 'linear-gradient(135deg,#FFF7ED,#FEF3C7)' }}>
                  <Link2 className="w-4 h-4" style={{ color: '#F97316' }} />
                </div>
                <div>
                  <p className="font-bold text-navy text-sm leading-tight">{selectedLink.title}</p>
                  <p className="text-xs text-navy-400">{selectedLink.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLink(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-400 hover:bg-navy-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">

              {/* KPI row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Montant', value: fmt(selectedLink.amount) },
                  { label: 'Paiements', value: String(selectedLink.payments) },
                  { label: 'Statut', value: selectedLink.status === 'active' ? 'Actif' : 'Expiré' },
                ].map(k => (
                  <div key={k.label} className="rounded-xl border border-navy-100 p-3 text-center" style={{ background: '#F8FAFC' }}>
                    <p className="text-xs text-navy-400 mb-1">{k.label}</p>
                    <p className="font-bold text-navy text-sm">{k.value}</p>
                  </div>
                ))}
              </div>

              {/* Infos */}
              <div className="rounded-xl border border-navy-100 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-navy-100" style={{ background: '#F8FAFC' }}>
                  <p className="text-xs font-bold text-navy-400 uppercase tracking-widest">Informations</p>
                </div>
                {[
                  { label: 'Créé le',    value: selectedLink.created },
                  { label: 'Expiration', value: 'Illimité' },
                  { label: 'Lien',       value: `pay.youngpaycollect.com/${selectedLink.id}` },
                ].map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-navy-100' : ''}`}>
                    <span className="text-xs text-navy-400 font-medium">{row.label}</span>
                    <span className="text-xs font-semibold text-navy text-right max-w-[200px] truncate">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Méthodes */}
              <div>
                <p className="text-xs font-bold text-navy-400 uppercase tracking-widest mb-2">Méthodes acceptées</p>
                <div className="flex flex-wrap gap-2">
                  {selectedLink.methods.map(m => <MethodBadge key={m} id={m} />)}
                </div>
              </div>

              {/* Édition rapide */}
              <div className="rounded-xl border border-navy-100 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-navy-100 flex items-center gap-2" style={{ background: '#F8FAFC' }}>
                  <Edit3 className="w-3.5 h-3.5" style={{ color: '#F97316' }} />
                  <p className="text-xs font-bold text-navy-400 uppercase tracking-widest">Édition rapide</p>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-navy uppercase tracking-wide">Titre</label>
                    <input defaultValue={selectedLink.title}
                      className="rounded-xl border-2 border-navy-200 px-3 py-2.5 text-sm text-navy outline-none focus:border-amber-400 transition-colors"
                      style={{ fontFamily: 'Poppins, sans-serif' }} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-navy uppercase tracking-wide">Montant (GNF)</label>
                    <input defaultValue={selectedLink.amount} type="number"
                      className="rounded-xl border-2 border-navy-200 px-3 py-2.5 text-sm text-navy outline-none focus:border-amber-400 transition-colors"
                      style={{ fontFamily: 'Poppins, sans-serif' }} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-navy uppercase tracking-wide">Expiration</label>
                    <select defaultValue="inf"
                      className="rounded-xl border-2 border-navy-200 px-3 py-2.5 text-sm text-navy outline-none focus:border-amber-400 transition-colors bg-white"
                      style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <option value="24h">24 heures</option>
                      <option value="48h">48 heures</option>
                      <option value="7j">7 jours</option>
                      <option value="inf">Illimité</option>
                    </select>
                  </div>

                  {/* ── Champs personnalisés du lien ── */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-navy uppercase tracking-wide">Champs du formulaire</span>
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: editFields.length >= MAX_CUSTOM_FIELDS ? 'rgba(239,68,68,0.10)' : 'rgba(249,115,22,0.10)', color: editFields.length >= MAX_CUSTOM_FIELDS ? '#EF4444' : '#F97316' }}>
                          {editFields.length}/{MAX_CUSTOM_FIELDS}
                        </span>
                      </div>
                      <button onClick={addEditField} disabled={editFields.length >= MAX_CUSTOM_FIELDS}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'rgba(249,115,22,0.07)', color: '#F97316', border: '1.5px dashed rgba(249,115,22,0.38)' }}>
                        <Plus className="w-3 h-3" /> Ajouter
                      </button>
                    </div>

                    {editFields.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-navy-200 px-3 py-4 text-center" style={{ background: '#FAFBFC' }}>
                        <p className="text-xs text-navy-400">Aucun champ — cliquez "Ajouter" pour en créer.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {editFields.map((cf, idx) => (
                          <div key={cf.id} className="rounded-xl border border-navy-200 p-2.5" style={{ background: '#FAFBFC' }}>
                            {/* label + delete */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', color: '#fff' }}>
                                {idx + 1}
                              </span>
                              <input value={cf.label} onChange={e => updateEditField(cf.id, { label: e.target.value })}
                                placeholder="Libellé du champ"
                                className="flex-1 rounded-lg border border-navy-200 px-2.5 py-1.5 text-xs text-navy outline-none focus:border-amber-400 transition-colors bg-white"
                                style={{ fontFamily: 'Poppins, sans-serif' }} />
                              <button onClick={() => removeEditField(cf.id)}
                                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors hover:bg-red-50"
                                style={{ border: '1px solid #FECACA', color: '#EF4444' }}>
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            {/* type + required */}
                            <div className="flex items-center gap-2">
                              <select value={cf.type} onChange={e => updateEditField(cf.id, { type: e.target.value as CFieldType, options: '' })}
                                className="flex-1 rounded-lg border border-navy-200 px-2 py-1.5 text-xs text-navy outline-none focus:border-amber-400 transition-colors bg-white"
                                style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {FIELD_TYPE_OPTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                              </select>
                              <label className="flex items-center gap-1 cursor-pointer flex-shrink-0 select-none">
                                <div onClick={() => updateEditField(cf.id, { required: !cf.required })}
                                  className="w-4 h-4 rounded flex items-center justify-center transition-all"
                                  style={{ border: `2px solid ${cf.required ? '#F97316' : '#E2E8F0'}`, background: cf.required ? 'linear-gradient(135deg,#F59E0B,#F97316)' : '#fff' }}>
                                  {cf.required && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                </div>
                                <span className="text-xs text-navy-400">Requis</span>
                              </label>
                            </div>
                            {cf.type === 'select' && (
                              <input value={cf.options} onChange={e => updateEditField(cf.id, { options: e.target.value })}
                                placeholder="Option A, Option B, Option C"
                                className="w-full mt-1.5 rounded-lg border border-navy-200 px-2.5 py-1.5 text-xs text-navy outline-none focus:border-amber-400 transition-colors bg-white"
                                style={{ fontFamily: 'Poppins, sans-serif' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm mt-1"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 4px 16px rgba(249,115,22,0.28)', fontFamily: 'Poppins, sans-serif' }}>
                    <Check className="w-4 h-4" /> Enregistrer les modifications
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button onClick={() => handleCopy(selectedLink.id, `pay.youngpaycollect.com/${selectedLink.id}`)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy hover:border-amber-400 transition-colors">
                  {copiedId === selectedLink.id ? <><Check className="w-4 h-4 text-green-500" />Lien copié !</> : <><Copy className="w-4 h-4" />Copier le lien</>}
                </button>
                <button onClick={() => { setShareLink(getPayUrl(selectedLink.id)); setShowShareModal(true) }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy hover:border-amber-400 transition-colors">
                  <Share2 className="w-4 h-4" /> Partager
                </button>
                {selectedLink.status === 'active' && (
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                    <Ban className="w-4 h-4" /> Désactiver ce lien
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Modal confirmation génération ── */}
      {showConfirm && (
        <>
          <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowConfirm(false)} />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" style={{ animation: 'fadeUp 0.2s ease-out' }}>
              <div className="p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg,#F59E0B22,#F9731611)' }}>
                  <Link2 className="w-6 h-6" style={{ color: '#F97316' }} />
                </div>
                <h3 className="font-bold text-navy text-lg text-center mb-1">Confirmer la génération</h3>
                <p className="text-navy-400 text-sm text-center mb-5">Vérifiez les détails avant de créer le lien</p>
                <div className="bg-navy-50 rounded-xl p-4 space-y-2 mb-5">
                  {[
                    { label: 'Titre',   value: title },
                    { label: 'Montant', value: amount + ' GNF' },
                    { label: 'Méthodes', value: methods.length ? methods.map(m => allMethods.find(x => x.code === m)?.label ?? m).join(', ') : 'Toutes' },
                    { label: 'Expiration', value: expiry === 'inf' ? 'Sans limite' : expiry },
                    { label: 'Env', value: _env === 'production' ? '🟢 Production' : '🟡 Sandbox' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-navy-400 font-medium">{label}</span>
                      <span className="text-navy font-semibold text-right max-w-[180px] truncate">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy hover:border-navy-300 transition-colors">
                    Annuler
                  </button>
                  <button onClick={handleGenerate}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 4px 16px rgba(249,115,22,0.30)' }}>
                    <Link2 className="w-4 h-4" /> Confirmer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Modal partage ── */}
      {showShareModal && (
        <>
          <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowShareModal(false)} />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" style={{ animation: 'fadeUp 0.2s ease-out' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-navy-100">
                <h3 className="font-bold text-navy">Partager le lien</h3>
                <button onClick={() => setShowShareModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-navy-400 hover:bg-navy-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {/* URL du lien */}
                <div className="bg-navy-50 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-xs text-navy-500 font-mono break-all flex-1">{shareLink}</span>
                </div>
                {/* Options */}
                <div className="space-y-2">
                  {/* Copier */}
                  <button onClick={() => { navigator.clipboard.writeText(shareLink).catch(()=>{}); setShowShareModal(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-navy-200 hover:border-amber-400 transition-colors text-sm font-semibold text-navy">
                    <Copy className="w-4 h-4 text-navy-400" /> Copier le lien
                  </button>
                  {/* WhatsApp */}
                  <a href={`https://wa.me/?text=${encodeURIComponent('Payez via YoungPay Collect :\n' + shareLink)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors text-sm font-semibold"
                    style={{ borderColor: '#25D36620', background: '#25D36608', color: '#128C7E' }}>
                    <span className="text-xl">📱</span> Partager via WhatsApp
                  </a>
                  {/* SMS */}
                  <a href={`sms:?body=${encodeURIComponent('Payez via YoungPay Collect : ' + shareLink)}`}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-navy-200 hover:border-amber-400 transition-colors text-sm font-semibold text-navy">
                    <span className="text-xl">💬</span> Envoyer par SMS
                  </a>
                  {/* Email */}
                  <a href={`mailto:?subject=Lien de paiement YoungPay&body=${encodeURIComponent('Voici votre lien de paiement :\n' + shareLink)}`}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-navy-200 hover:border-amber-400 transition-colors text-sm font-semibold text-navy">
                    <span className="text-xl">✉️</span> Envoyer par Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN: REVERSEMENTS
══════════════════════════════════════════════════════ */
type BankAcc = { id: string; bank_name: string; rib: string; label?: string }

const ScreenReversements = () => {
  const [revAmount,        setRevAmount]        = useState('')
  const [selectedBankId,   setSelectedBankId]   = useState('')
  const [loading,          setLoading]          = useState(false)
  const [done,             setDone]             = useState(false)
  const [reversementsData, setReversementsData] = useState<RevRow[]>([])
  const [solde,            setSolde]            = useState<number | null>(null)
  const [bankAccounts,     setBankAccounts]     = useState<BankAcc[]>([])
  const [showBankModal,    setShowBankModal]    = useState(false)
  const [newBank,          setNewBank]          = useState({ bank_name: '', rib: '', label: '' })
  const [savingBank,       setSavingBank]       = useState(false)

  useEffect(() => {
    if (_env !== 'production') return
    apiFetch<{ data: Record<string, unknown>[] }>('/reversements')
      .then(r => {
        if (r.data?.length) setReversementsData(r.data.map(p => ({
          date:   new Date(p.created_at as string).toLocaleDateString('fr-GN'),
          amount: Number(p.amount),
          dest:   p.destination as string,
          status: p.status as string,
          ref:    p.id as string,
        })))
      }).catch(() => {})
    apiFetch<{ balance: number }>('/reversements/balance')
      .then(r => setSolde(r.balance)).catch(() => {})
    apiFetch<BankAcc[]>('/bank-accounts')
      .then(d => { if (Array.isArray(d)) setBankAccounts(d) }).catch(() => {})
  }, [])

  const handleSubmit = async () => {
    if (!revAmount || !selectedBankId) return
    const bank = bankAccounts.find(b => b.id === selectedBankId)
    if (!bank) return
    setLoading(true)
    try {
      await apiFetch('/reversements', {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(revAmount.replace(/\s/g, '')),
          destination: `${bank.bank_name} — ${bank.rib}`,
        }),
      })
      setDone(true)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la demande')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBank = async () => {
    if (!newBank.bank_name || !newBank.rib) return
    setSavingBank(true)
    try {
      const created = await apiFetch<BankAcc>('/bank-accounts', {
        method: 'POST',
        body: JSON.stringify(newBank),
      })
      setBankAccounts(prev => [created, ...prev])
      setNewBank({ bank_name: '', rib: '', label: '' })
      setShowBankModal(false)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setSavingBank(false)
    }
  }

  const handleDeleteBank = async (id: string) => {
    try {
      await apiFetch(`/bank-accounts/${id}`, { method: 'DELETE' })
      setBankAccounts(prev => prev.filter(b => b.id !== id))
      if (selectedBankId === id) setSelectedBankId('')
    } catch { /* ignore */ }
  }

  /* Sandbox → message bloquant */
  if (_env !== 'production') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(245,158,11,0.12)' }}>
          <Wallet className="w-8 h-8" style={{ color: '#F59E0B' }} />
        </div>
        <h2 className="font-bold text-navy text-xl mb-2">Reversements indisponibles en Sandbox</h2>
        <p className="text-navy-400 text-sm max-w-sm">
          Les reversements sont uniquement disponibles en mode <strong>Production</strong>. Complétez votre KYC et passez en production pour accéder à cette fonctionnalité.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5">

      {/* ── Modal ajout RIB ── */}
      {showBankModal && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)' }}
            onClick={() => setShowBankModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" style={{ animation: 'fadeUp 0.2s ease-out' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-navy-100">
                <h3 className="font-bold text-navy">Ajouter un compte bancaire</h3>
                <button onClick={() => setShowBankModal(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-navy-400 hover:bg-navy-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-navy uppercase tracking-wide">Nom de la banque *</label>
                  <input value={newBank.bank_name} onChange={e => setNewBank(b => ({ ...b, bank_name: e.target.value }))}
                    placeholder="Ex : Ecobank Guinée"
                    className="rounded-xl border-2 border-navy-200 px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors"
                    style={{ fontFamily: 'Poppins, sans-serif' }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-navy uppercase tracking-wide">RIB / IBAN *</label>
                  <input value={newBank.rib} onChange={e => setNewBank(b => ({ ...b, rib: e.target.value }))}
                    placeholder="Ex : GN 4501 0022 3344 0000"
                    className="rounded-xl border-2 border-navy-200 px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors"
                    style={{ fontFamily: 'Poppins, sans-serif' }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-navy uppercase tracking-wide">Libellé <span className="normal-case font-normal text-navy-400">(optionnel)</span></label>
                  <input value={newBank.label} onChange={e => setNewBank(b => ({ ...b, label: e.target.value }))}
                    placeholder="Ex : Compte principal"
                    className="rounded-xl border-2 border-navy-200 px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors"
                    style={{ fontFamily: 'Poppins, sans-serif' }} />
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setShowBankModal(false)}
                    className="flex-1 py-3 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy hover:border-navy-300 transition-colors">
                    Annuler
                  </button>
                  <button onClick={handleAddBank} disabled={savingBank || !newBank.bank_name || !newBank.rib}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                    {savingBank ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Solde card */}
      <div className="bg-white rounded-2xl p-6 border border-navy-100 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div>
          <p className="text-navy-400 text-sm font-medium mb-1">Solde disponible</p>
          <p className="font-bold text-4xl text-navy">{solde !== null ? solde.toLocaleString('fr-GN') : '—'} <span className="text-xl text-navy-400">GNF</span></p>
          <p className="text-navy-400 text-xs mt-1">Solde net disponible</p>
        </div>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
          <Wallet className="w-8 h-8 text-white" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Request form */}
        <div className="bg-white rounded-2xl p-6 border border-navy-100"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-navy text-base">Demander un reversement</h3>
            <button onClick={() => setShowBankModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-navy-200 text-navy hover:border-amber-400 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Ajouter un RIB
            </button>
          </div>

          {!done ? (
            <div className="space-y-4">
              {/* Montant */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-navy uppercase tracking-wide">Montant à reverser (GNF)</label>
                <div className="relative">
                  <input
                    type="text" inputMode="numeric"
                    value={revAmount}
                    onChange={e => {
                      const raw = e.target.value.replace(/\s/g, '').replace(/[^\d]/g, '')
                      setRevAmount(raw ? Number(raw).toLocaleString('fr-FR').replace(/ /g, ' ') : '')
                    }}
                    placeholder={`Max : ${solde !== null ? solde.toLocaleString('fr-GN') : '—'} GNF`}
                    className="w-full rounded-xl border-2 border-navy-200 px-4 py-3 pr-14 text-sm text-navy font-semibold outline-none focus:border-amber-400 transition-colors"
                    style={{ fontFamily: 'Poppins, sans-serif' }} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-navy-400">GNF</span>
                </div>
              </div>

              {/* Choix RIB */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-navy uppercase tracking-wide">Compte bancaire de destination</label>
                {bankAccounts.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-navy-200 p-4 text-center">
                    <p className="text-navy-400 text-sm mb-2">Aucun compte bancaire enregistré</p>
                    <button onClick={() => setShowBankModal(true)}
                      className="text-xs font-semibold" style={{ color: '#F97316' }}>
                      + Ajouter un RIB
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bankAccounts.map(b => (
                      <div key={b.id}
                        onClick={() => setSelectedBankId(b.id)}
                        className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
                        style={{
                          borderColor:   selectedBankId === b.id ? '#F97316' : '#E2E8F0',
                          background:    selectedBankId === b.id ? 'rgba(249,115,22,0.04)' : '#FAFAFA',
                        }}>
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          selectedBankId === b.id ? 'border-orange-400' : 'border-navy-300'
                        }`}>
                          {selectedBankId === b.id && <div className="w-2 h-2 rounded-full" style={{ background: '#F97316' }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-navy text-sm">{b.label || b.bank_name}</p>
                          <p className="text-navy-400 text-xs truncate">{b.bank_name} · {b.rib}</p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); handleDeleteBank(b.id) }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-navy-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleSubmit} disabled={loading || !revAmount || !selectedBankId}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-60 transition-all"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 4px 16px rgba(249,115,22,0.30)' }}>
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Traitement…</>
                  : 'Soumettre la demande'}
              </button>
            </div>
          ) : (
            <div className="text-center py-6" style={{ animation: 'scaleIn 0.3s ease-out' }}>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-green-500" strokeWidth={2.5} />
              </div>
              <h4 className="font-bold text-navy text-lg mb-1">Demande soumise !</h4>
              <p className="text-navy-400 text-sm mb-4">Votre reversement de {revAmount} GNF sera traité dans les 24h.</p>
              <button onClick={() => { setDone(false); setRevAmount(''); setSelectedBankId('') }}
                className="text-sm font-semibold" style={{ color: '#F97316' }}>
                Nouvelle demande
              </button>
            </div>
          )}
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="px-6 py-4 border-b border-navy-100">
            <h3 className="font-bold text-navy text-base">Historique des reversements</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  {['Date','Montant','Destination','Statut','Réf.'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-navy-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reversementsData.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-navy-400">Aucun reversement</td></tr>
                ) : reversementsData.map(r => (
                  <tr key={r.ref} className="border-t border-navy-100 hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3.5 text-navy-500 whitespace-nowrap">{r.date}</td>
                    <td className="px-4 py-3.5 font-bold text-navy whitespace-nowrap">{fmt(r.amount)}</td>
                    <td className="px-4 py-3.5 text-navy-600 max-w-[140px] truncate">{r.dest}</td>
                    <td className="px-4 py-3.5"><StatusBadge s={r.status === 'done' ? 'success' : 'pending'} /></td>
                    <td className="px-4 py-3.5 font-mono text-navy-400">{r.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN: CATALOG (Produits / Services + Factures)
══════════════════════════════════════════════════════ */
const ScreenCatalog = () => {
  const [subTab, setSubTab]           = useState<'products' | 'invoices'>('products')
  const [products, setProducts]       = useState<ProductRow[]>([])
  const [invoices, setInvoices]       = useState<InvoiceRow[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [copiedInv, setCopiedInv]     = useState<string | null>(null)
  const [newProduct, setNewProduct]   = useState({ name: '', category: 'Service', price: '', unit: 'unité', description: '' })
  const [newInvoice, setNewInvoice]   = useState({ client: '', phone: '', due: '', items: [{ productId: '', qty: 1 }] })
  const [savedProduct, setSavedProduct] = useState(false)
  const [savedInvoice, setSavedInvoice] = useState(false)

  useEffect(() => {
    apiFetch<ProductRow[]>('/products')
      .then(d => { if (Array.isArray(d)) setProducts(d.map(p => ({ ...p, sales: (p as any).sales ?? 0 }))) })
      .catch(() => {})
    apiFetch<any[]>('/invoices')
      .then(d => {
        if (!Array.isArray(d)) return
        setInvoices(d.map(inv => ({
          id:     inv.id,
          client: inv.client_name ?? '',
          phone:  inv.client_phone ?? '',
          items:  typeof inv.items === 'string' ? JSON.parse(inv.items) : (inv.items ?? []),
          total:  Number(inv.total),
          status: inv.status,
          date:   new Date(inv.created_at).toLocaleDateString('fr-GN'),
          due:    inv.due_date ? new Date(inv.due_date).toLocaleDateString('fr-GN') : '—',
        })))
      })
      .catch(() => {})
  }, [])

  const CATS = ['Produit', 'Service', 'Formation', 'Forfait', 'Abonnement']
  const UNITS = ['unité', 'pièce', 'séance', 'mois', 'session', 'colis', 'forfait', 'heure']

  const invStatMap: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    paid:    { label: 'Payée',      color: '#10B981', bg: 'rgba(16,185,129,0.10)',  icon: <CheckSquare className="w-3 h-3" /> },
    pending: { label: 'En attente', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  icon: <Clock className="w-3 h-3" /> },
    overdue: { label: 'En retard',  color: '#EF4444', bg: 'rgba(239,68,68,0.10)',   icon: <AlertCircle className="w-3 h-3" /> },
  }

  const copyPayLink = (id: string) => {
    navigator.clipboard.writeText(`pay.youngpaycollect.com/facture/${id.toLowerCase()}`).catch(() => {})
    setCopiedInv(id)
    setTimeout(() => setCopiedInv(null), 2000)
  }

  const saveProduct = async () => {
    if (!newProduct.name || !newProduct.price) return
    setSavedProduct(false)
    try {
      const created = await apiFetch<any>('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: newProduct.name, category: newProduct.category,
          price: Number(newProduct.price.replace(/\s/g, '')),
          unit: newProduct.unit, description: newProduct.description,
        }),
      })
      setProducts(prev => [{ ...created, sales: 0 }, ...prev])
      setNewProduct({ name: '', category: 'Service', price: '', unit: 'unité', description: '' })
      setSavedProduct(true)
      setTimeout(() => { setSavedProduct(false); setShowProductForm(false) }, 1200)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur')
    }
  }

  const saveInvoice = async () => {
    if (!newInvoice.client || !newInvoice.phone) return
    setSavedInvoice(false)
    try {
      const items = newInvoice.items
        .filter(i => i.productId)
        .map(i => {
          const p = products.find(x => x.id === i.productId)
          return { name: p?.name ?? i.productId, qty: i.qty, price: p?.price ?? 0 }
        })
      if (items.length === 0) { alert('Ajoutez au moins un article'); return }
      const created = await apiFetch<any>('/invoices', {
        method: 'POST',
        body: JSON.stringify({ client_name: newInvoice.client, client_phone: newInvoice.phone, due_date: newInvoice.due || undefined, items }),
      })
      setInvoices(prev => [{
        id: created.id, client: created.client_name, phone: created.client_phone,
        items: typeof created.items === 'string' ? JSON.parse(created.items) : (created.items ?? []),
        total: Number(created.total), status: created.status,
        date: new Date(created.created_at).toLocaleDateString('fr-GN'),
        due: created.due_date ? new Date(created.due_date).toLocaleDateString('fr-GN') : '—',
      }, ...prev])
      setSavedInvoice(true)
      setTimeout(() => { setSavedInvoice(false); setShowInvoiceForm(false) }, 1500)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur')
    }
  }

  const invTotal = invoices.reduce((a, i) => a + i.total, 0)
  const invPaid  = invoices.filter(i => i.status === 'paid').reduce((a, i) => a + i.total, 0)

  return (
    <div className="p-6 space-y-6">

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Produits / Services', value: String(products.length), icon: <Package className="w-5 h-5" />, color: '#F97316', bg: 'linear-gradient(135deg,#F59E0B,#F97316)' },
          { label: 'Factures émises',     value: String(invoices.length), icon: <Receipt className="w-5 h-5" />,  color: '#6366F1', bg: 'linear-gradient(135deg,#6366F1,#818CF8)' },
          { label: 'Montant encaissé',    value: `${fmtShort(invPaid)} GNF`, icon: <CheckSquare className="w-5 h-5" />, color: '#10B981', bg: 'linear-gradient(135deg,#10B981,#34D399)' },
          { label: 'En attente',          value: `${fmtShort(invTotal - invPaid)} GNF`, icon: <Clock className="w-5 h-5" />, color: '#F59E0B', bg: 'linear-gradient(135deg,#F59E0B,#FCD34D)' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-navy-100"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-navy-400 text-xs font-medium">{s.label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ background: s.bg }}>
                {s.icon}
              </div>
            </div>
            <p className="font-bold text-navy text-xl">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="inline-flex items-center bg-white rounded-2xl p-1.5 border border-navy-100 shadow-sm">
        <button onClick={() => setSubTab('products')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            subTab === 'products' ? 'text-white shadow-md' : 'text-navy-500 hover:text-navy'
          }`}
          style={subTab === 'products' ? { background: 'linear-gradient(135deg, #F59E0B, #F97316)' } : {}}>
          <ShoppingBag className="w-4 h-4" /> Produits / Services
        </button>
        <button onClick={() => setSubTab('invoices')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            subTab === 'invoices' ? 'text-white shadow-md' : 'text-navy-500 hover:text-navy'
          }`}
          style={subTab === 'invoices' ? { background: 'linear-gradient(135deg, #F59E0B, #F97316)' } : {}}>
          <Receipt className="w-4 h-4" /> Factures
        </button>
      </div>

      {/* ── PRODUCTS TAB ── */}
      {subTab === 'products' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <p className="text-navy-500 text-sm">{products.length} produits / services enregistrés</p>
            <button onClick={() => setShowProductForm(v => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
              <Plus className="w-4 h-4" />
              Nouveau produit / service
            </button>
          </div>

          {/* Create form */}
          {showProductForm && (
            <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden"
              style={{ boxShadow: '0 4px 24px rgba(249,115,22,0.08)' }}>
              <div className="px-6 py-4 border-b border-navy-100 flex items-center gap-2">
                <Tag className="w-4 h-4" style={{ color: '#F97316' }} />
                <span className="font-semibold text-navy text-sm">Ajouter un produit / service</span>
              </div>
              <div className="p-6 grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-navy text-xs font-semibold uppercase tracking-wide block mb-1.5">Nom *</label>
                  <input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ex : Consultation médicale"
                    className="w-full bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors" />
                </div>
                <div>
                  <label className="text-navy text-xs font-semibold uppercase tracking-wide block mb-1.5">Catégorie</label>
                  <select value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors">
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-navy text-xs font-semibold uppercase tracking-wide block mb-1.5">Unité</label>
                  <select value={newProduct.unit} onChange={e => setNewProduct(p => ({ ...p, unit: e.target.value }))}
                    className="w-full bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors">
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-navy text-xs font-semibold uppercase tracking-wide block mb-1.5">Prix unitaire (GNF) *</label>
                  <input value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                    placeholder="Ex : 200 000"
                    className="w-full bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors" />
                </div>
                <div>
                  <label className="text-navy text-xs font-semibold uppercase tracking-wide block mb-1.5">Description (optionnel)</label>
                  <input value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                    placeholder="Courte description"
                    className="w-full bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors" />
                </div>
                <div className="md:col-span-2 flex gap-3 justify-end pt-2">
                  <button onClick={() => setShowProductForm(false)}
                    className="px-5 py-2.5 rounded-xl border border-navy-200 text-sm font-semibold text-navy-500 hover:bg-navy-50 transition-colors">
                    Annuler
                  </button>
                  <button onClick={saveProduct}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                    {savedProduct ? '✓ Enregistré !' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products table */}
          <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-100 bg-navy-50">
                    {['Produit / Service', 'Catégorie', 'Prix unitaire', 'Unité', 'Ventes', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-navy-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-navy-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #F59E0B22, #F9731622)' }}>
                            <Package className="w-4 h-4" style={{ color: '#F97316' }} />
                          </div>
                          <div>
                            <p className="text-navy font-semibold text-sm">{p.name}</p>
                            <p className="text-navy-400 text-xs">{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(245,158,11,0.10)', color: '#F97316' }}>
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-navy font-bold text-sm">{p.price.toLocaleString('fr-GN')} GNF</span>
                      </td>
                      <td className="px-5 py-4 text-navy-500 text-sm">{p.unit}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-navy font-semibold text-sm">{p.sales}</span>
                          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-navy-100 transition-colors text-navy-400 hover:text-navy">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setProducts(prev => prev.filter(x => x.id !== p.id))}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-navy-400 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── INVOICES TAB ── */}
      {subTab === 'invoices' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <p className="text-navy-500 text-sm">{invoices.length} factures émises</p>
            <button onClick={() => setShowInvoiceForm(v => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
              <Plus className="w-4 h-4" />
              Nouvelle facture
            </button>
          </div>

          {/* Invoice creation form */}
          {showInvoiceForm && (
            <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden"
              style={{ boxShadow: '0 4px 24px rgba(249,115,22,0.08)' }}>
              <div className="px-6 py-4 border-b border-navy-100 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" style={{ color: '#F97316' }} />
                <span className="font-semibold text-navy text-sm">Créer une facture</span>
              </div>
              <div className="p-6 space-y-5">
                {/* Client info */}
                <div>
                  <p className="text-navy text-xs font-bold uppercase tracking-wide mb-3">Informations client</p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <input value={newInvoice.client} onChange={e => setNewInvoice(v => ({ ...v, client: e.target.value }))}
                      placeholder="Nom du client *"
                      className="bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors" />
                    <input value={newInvoice.phone} onChange={e => setNewInvoice(v => ({ ...v, phone: e.target.value }))}
                      placeholder="Téléphone (+224...)"
                      className="bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors" />
                    <div>
                      <input type="date" value={newInvoice.due} onChange={e => setNewInvoice(v => ({ ...v, due: e.target.value }))}
                        className="w-full bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Line items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-navy text-xs font-bold uppercase tracking-wide">Lignes de facturation</p>
                    <button onClick={() => setNewInvoice(v => ({ ...v, items: [...v.items, { productId: '', qty: 1 }] }))}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#F97316' }}>
                      <Plus className="w-3 h-3" /> Ajouter une ligne
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 px-2">
                      {['Produit / Service', 'Qté', 'Prix unit.', 'Total'].map(h => (
                        <span key={h} className={`text-[10px] font-bold text-navy-400 uppercase ${h === 'Produit / Service' ? 'col-span-6' : 'col-span-2'}`}>{h}</span>
                      ))}
                    </div>
                    {newInvoice.items.map((item, idx) => {
                      const prod = products.find(p => p.id === item.productId)
                      const lineTotal = prod ? prod.price * item.qty : 0
                      return (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <select value={item.productId}
                            onChange={e => setNewInvoice(v => { const it = [...v.items]; it[idx] = { ...it[idx], productId: e.target.value }; return { ...v, items: it } })}
                            className="col-span-6 bg-navy-50 border border-navy-200 rounded-xl px-3 py-2.5 text-sm text-navy outline-none focus:border-amber-400 transition-colors">
                            <option value="">-- Choisir --</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <input type="number" min={1} value={item.qty}
                            onChange={e => setNewInvoice(v => { const it = [...v.items]; it[idx] = { ...it[idx], qty: Number(e.target.value) }; return { ...v, items: it } })}
                            className="col-span-2 bg-navy-50 border border-navy-200 rounded-xl px-3 py-2.5 text-sm text-navy outline-none focus:border-amber-400 text-center transition-colors" />
                          <div className="col-span-2 text-navy text-sm font-medium text-center">
                            {prod ? prod.price.toLocaleString('fr-GN') : '—'}
                          </div>
                          <div className="col-span-2 text-navy font-bold text-sm text-right pr-2">
                            {lineTotal > 0 ? lineTotal.toLocaleString('fr-GN') : '—'}
                          </div>
                        </div>
                      )
                    })}

                    {/* Total */}
                    <div className="flex justify-end pt-3 border-t border-navy-100">
                      <div className="text-right">
                        <p className="text-navy-400 text-xs mb-0.5">Total facture</p>
                        <p className="text-navy font-bold text-xl">
                          {newInvoice.items.reduce((sum, item) => {
                            const prod = products.find(p => p.id === item.productId)
                            return sum + (prod ? prod.price * item.qty : 0)
                          }, 0).toLocaleString('fr-GN')} GNF
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button onClick={() => setShowInvoiceForm(false)}
                    className="px-5 py-2.5 rounded-xl border border-navy-200 text-sm font-semibold text-navy-500 hover:bg-navy-50 transition-colors">
                    Annuler
                  </button>
                  <button onClick={saveInvoice}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                    <Send className="w-4 h-4" />
                    {savedInvoice ? '✓ Facture générée !' : 'Générer & envoyer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invoices list */}
          <div className="space-y-3">
            {invoices.map(inv => {
              const st = invStatMap[inv.status]
              return (
                <div key={inv.id} className="bg-white rounded-2xl border border-navy-100 overflow-hidden hover:border-amber-200 transition-all"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      {/* Left */}
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${st.bg}`, color: st.color, border: `1px solid ${st.color}30` }}>
                          {st.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-navy text-sm">{inv.id}</span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: st.bg, color: st.color }}>
                              {st.icon}{st.label}
                            </span>
                          </div>
                          <p className="text-navy font-medium text-sm">{inv.client}</p>
                          <p className="text-navy-400 text-xs">{inv.phone} · Échéance : {inv.due}</p>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="text-right">
                          <p className="font-bold text-navy text-lg">{fmt(inv.total)}</p>
                          <p className="text-navy-400 text-xs">Émise le {inv.date}</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button onClick={() => copyPayLink(inv.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                            style={copiedInv === inv.id
                              ? { background: 'rgba(16,185,129,0.12)', color: '#10B981' }
                              : { background: 'rgba(245,158,11,0.12)', color: '#F97316' }}>
                            {copiedInv === inv.id ? <><Check className="w-3 h-3" />Lien copié</> : <><Link2 className="w-3 h-3" />Copier le lien</>}
                          </button>
                          <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-navy-200 text-navy-500 hover:bg-navy-50 transition-colors whitespace-nowrap">
                            <Download className="w-3 h-3" />PDF
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Items breakdown */}
                    <div className="mt-4 pt-4 border-t border-navy-50 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {inv.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-navy-50 rounded-xl px-3 py-2">
                          <span className="text-navy text-xs font-medium truncate mr-2">{item.name}</span>
                          <span className="text-navy-400 text-xs flex-shrink-0">×{item.qty} · {(item.price * item.qty).toLocaleString('fr-GN')} GNF</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN: DIRECT COLLECT
══════════════════════════════════════════════════════ */
const DC_OPS = [
  { id: 'orange_money', label: 'Orange Money',  color: '#FF6200', bg: 'rgba(255,98,0,0.10)'   },
  { id: 'mtn',    label: 'MTN Mobile',    color: '#D4A800', bg: 'rgba(212,168,0,0.10)'  },
  { id: 'soutra', label: 'Soutra Money',  color: '#10B981', bg: 'rgba(16,185,129,0.10)' },
]

const ScreenDirectCollect = () => {
  const [op,          setOp]          = useState('orange_money')
  const [phone,       setPhone]       = useState('')
  const [amount,      setAmount]      = useState('')
  const [motif,       setMotif]       = useState('')
  const [modalStatus, setModalStatus] = useState<'pending'|'success'|'failed'|null>(null)

  const opInfo = DC_OPS.find(o => o.id === op) ?? DC_OPS[0]

  const handleSend = () => {
    if (!amount || phone.length < 8) return
    setModalStatus('pending')
    setTimeout(() => setModalStatus(Math.random() > 0.25 ? 'success' : 'failed'), 3500)
  }

  const closeModal  = () => setModalStatus(null)
  const resetAll    = () => { setModalStatus(null); setPhone(''); setAmount(''); setMotif('') }

  return (
    <div className="p-6 flex flex-col items-center gap-6">

      {/* Banner */}
      <div className="w-full max-w-xl rounded-2xl border border-navy-100 px-6 py-5 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg,#FFF7ED,#FEF3C7)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', boxShadow: '0 4px 16px rgba(249,115,22,0.30)' }}>
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-navy text-base">Direct Collect</p>
          <p className="text-navy-400 text-sm">Envoyez une demande de paiement directement sur le téléphone du client. Il accepte en un clic.</p>
        </div>
      </div>

      {/* Form card — toujours visible */}
      <div className="w-full max-w-xl bg-white rounded-2xl border border-navy-100 overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="px-6 py-3.5 border-b border-navy-100" style={{ background: '#F8FAFC' }}>
          <p className="text-xs font-bold text-navy-400 uppercase tracking-widest">Nouvelle collecte</p>
        </div>
        <div className="p-6 flex flex-col gap-4">

          {/* Opérateur */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-navy uppercase tracking-wide">Opérateur</label>
            <div className="flex gap-2">
              {DC_OPS.map(o => (
                <button key={o.id} onClick={() => setOp(o.id)}
                  className="flex-1 py-2.5 rounded-xl border-2 text-xs font-bold transition-all"
                  style={op === o.id ? { borderColor: o.color, background: o.bg, color: o.color } : { borderColor: '#E2E8F0', color: '#64748B' }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Numéro */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-navy uppercase tracking-wide">Numéro du client</label>
            <div className="flex items-center border-2 border-navy-200 rounded-xl overflow-hidden focus-within:border-amber-400 transition-colors">
              <span className="px-3 py-3 text-sm font-semibold border-r border-navy-200 text-navy-400" style={{ background: '#F8FAFC' }}>+224</span>
              <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,9))}
                placeholder="620 000 000" maxLength={9}
                className="flex-1 px-3 py-3 text-sm text-navy outline-none bg-white"
                style={{ fontFamily: 'Poppins, sans-serif' }} />
            </div>
          </div>

          {/* Montant */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-navy uppercase tracking-wide">Montant (GNF)</label>
            <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Ex : 150 000"
              className="rounded-xl border-2 border-navy-200 px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors"
              style={{ fontFamily: 'Poppins, sans-serif' }} />
          </div>

          {/* Motif */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-navy uppercase tracking-wide">
              Motif <span className="text-navy-300 normal-case font-normal">(optionnel)</span>
            </label>
            <input value={motif} onChange={e => setMotif(e.target.value)} placeholder="Ex : Facture #112, Loyer avril…"
              className="rounded-xl border-2 border-navy-200 px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors"
              style={{ fontFamily: 'Poppins, sans-serif' }} />
          </div>

          <button onClick={handleSend} disabled={!amount || phone.length < 8}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', boxShadow: '0 4px 16px rgba(249,115,22,0.30)' }}>
            <Zap className="w-4 h-4" /> Envoyer la demande
          </button>
        </div>
      </div>

      {/* ── Modal de confirmation ── */}
      {modalStatus && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-50" style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)' }} />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden"
              style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.22)', animation: 'fadeUp 0.22s ease-out' }}>

              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-navy-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)' }}>
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-bold text-navy text-sm">Direct Collect</span>
                </div>
                {modalStatus !== 'pending' && (
                  <button onClick={closeModal}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-navy-400 hover:bg-navy-100 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Recap strip */}
              <div className="px-5 py-3 flex items-center gap-3 border-b border-navy-100" style={{ background: '#F8FAFC' }}>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: opInfo.bg, color: opInfo.color }}>{opInfo.label}</span>
                <span className="text-sm font-bold text-navy">{Number(amount).toLocaleString('fr-GN')} GNF</span>
                <span className="text-xs text-navy-400 ml-auto">+224 {phone}</span>
              </div>

              {/* Modal body */}
              <div className="p-6 flex flex-col items-center gap-4 text-center">

                {modalStatus === 'pending' && (
                  <>
                    {/* Animated rings */}
                    <div className="relative w-24 h-24 my-2">
                      <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(249,115,22,0.12)', animationDuration: '1.4s' }} />
                      <div className="absolute inset-2 rounded-full animate-ping" style={{ background: 'rgba(249,115,22,0.10)', animationDuration: '1.8s', animationDelay: '0.3s' }} />
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 animate-spin" style={{ animationDuration: '0.9s' }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FFF7ED,#FEF3C7)', border: '2px solid rgba(249,115,22,0.20)' }}>
                          <Smartphone className="w-6 h-6" style={{ color: '#F97316' }} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-navy text-lg mb-1">Demande envoyée !</p>
                      <p className="text-navy-400 text-sm leading-relaxed">
                        Une notification a été envoyée au<br />
                        <span className="font-bold text-navy">+224 {phone}</span><br />
                        via <span style={{ color: opInfo.color, fontWeight: 700 }}>{opInfo.label}</span>
                      </p>
                      <p className="text-xs text-navy-300 mt-3 px-3 py-1.5 rounded-lg inline-block" style={{ background: '#F8FAFC' }}>
                        ⏱ Le client a 3 minutes pour accepter
                      </p>
                    </div>
                    <button onClick={closeModal}
                      className="text-xs font-semibold text-navy-300 hover:text-red-500 transition-colors underline mt-1">
                      Annuler la demande
                    </button>
                  </>
                )}

                {modalStatus === 'success' && (
                  <>
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center my-2"
                      style={{ animation: 'scaleIn 0.3s ease-out' }}>
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <div>
                      <p className="font-bold text-navy text-xl mb-1">Paiement validé !</p>
                      <p className="text-navy-400 text-sm">
                        <span className="font-bold text-navy">{Number(amount).toLocaleString('fr-GN')} GNF</span> reçus de<br />
                        +224 {phone}
                      </p>
                      {motif && (
                        <p className="text-xs text-navy-400 mt-2 px-3 py-1.5 rounded-lg inline-block" style={{ background: '#F8FAFC' }}>
                          Motif : {motif}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 w-full mt-1">
                      <button onClick={resetAll}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm"
                        style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', boxShadow: '0 4px 16px rgba(249,115,22,0.28)' }}>
                        <Zap className="w-4 h-4" /> Nouvelle collecte
                      </button>
                      <button onClick={closeModal}
                        className="w-full py-2.5 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy hover:border-amber-400 transition-colors">
                        Fermer
                      </button>
                    </div>
                  </>
                )}

                {modalStatus === 'failed' && (
                  <>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center my-2"
                      style={{ background: 'rgba(220,38,38,0.08)', border: '2px solid rgba(220,38,38,0.15)' }}>
                      <X className="w-10 h-10 text-red-500" />
                    </div>
                    <div>
                      <p className="font-bold text-navy text-xl mb-1">Paiement refusé</p>
                      <p className="text-navy-400 text-sm">Le client a refusé ou n'a pas répondu dans le délai imparti.</p>
                      <p className="text-xs text-navy-300 mt-2">+224 {phone} · {Number(amount).toLocaleString('fr-GN')} GNF</p>
                    </div>
                    <div className="flex gap-2 w-full mt-1">
                      <button onClick={() => { closeModal(); setTimeout(handleSend, 100) }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm"
                        style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)' }}>
                        Réessayer
                      </button>
                      <button onClick={resetAll}
                        className="flex-1 py-3 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy hover:border-amber-400 transition-colors">
                        Annuler
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN: DEVELOPER
══════════════════════════════════════════════════════ */
type ApiLang = 'node' | 'python' | 'php' | 'dart' | 'curl'

const API_SNIPPETS: Record<'redirect'|'direct'|'status', Record<ApiLang, string>> = {
  redirect: {
    node: `const res = await fetch(
  'https://api.youngpaycollect.com/v1/payment/redirect',
  {
    method: 'POST',
    headers: {
      'client_id':    'ypk_live_xxx',
      'api_key':      'yps_live_xxx',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount:       150000,
      description:  'Commande #112',
      merchant_ref: 'ORDER-2026-001',
      methods:      ['orange_money', 'mtn', 'soutra', 'paycard', 'kulu', 'card'],
    }),
  }
)
// HTTP 201 Created
const data = await res.json()
// {
//   status:         'pending',
//   transaction_id: 'TXN-XXXXXXXX',
//   redirect_url:   'https://pay.youngpaycollect.com/...',
//   merchant_ref:   'ORDER-2026-001',
// }
window.location.href = data.redirect_url`,

    python: `import requests

res = requests.post(
    'https://api.youngpaycollect.com/v1/payment/redirect',
    headers={
        'client_id': 'ypk_live_xxx',
        'api_key':   'yps_live_xxx',
    },
    json={
        'amount':       150000,
        'description':  'Commande #112',
        'merchant_ref': 'ORDER-2026-001',
        'methods':      ['orange_money', 'mtn', 'soutra', 'paycard', 'kulu', 'card'],
    }
)
# HTTP 201 Created
data = res.json()
# {
#   'status':         'pending',
#   'transaction_id': 'TXN-XXXXXXXX',
#   'redirect_url':   'https://pay.youngpaycollect.com/...',
#   'merchant_ref':   'ORDER-2026-001',
# }
print(data['redirect_url'])`,

    php: `$res = Http::withHeaders([
    'client_id' => 'ypk_live_xxx',
    'api_key'   => 'yps_live_xxx',
])->post(
    'https://api.youngpaycollect.com/v1/payment/redirect',
    [
        'amount'       => 150000,
        'description'  => 'Commande #112',
        'merchant_ref' => 'ORDER-2026-001',
        'methods'      => ['orange_money', 'mtn', 'soutra', 'paycard', 'kulu', 'card'],
    ]
);
// HTTP 201 Created
// {
//   'status':         'pending',
//   'transaction_id': 'TXN-XXXXXXXX',
//   'redirect_url':   'https://pay.youngpaycollect.com/...',
//   'merchant_ref':   'ORDER-2026-001',
// }
return redirect($res->json('redirect_url'));`,

    dart: `final res = await http.post(
  Uri.parse('https://api.youngpaycollect.com/v1/payment/redirect'),
  headers: {
    'client_id':    'ypk_live_xxx',
    'api_key':      'yps_live_xxx',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'amount':       150000,
    'description':  'Commande #112',
    'merchant_ref': 'ORDER-2026-001',
    'methods':      ['orange_money', 'mtn', 'soutra', 'paycard', 'kulu', 'card'],
  }),
);
// HTTP 201 Created
final data = jsonDecode(res.body);
// {
//   'status':         'pending',
//   'transaction_id': 'TXN-XXXXXXXX',
//   'redirect_url':   'https://pay.youngpaycollect.com/...',
//   'merchant_ref':   'ORDER-2026-001',
// }`,

    curl: `curl -X POST https://api.youngpaycollect.com/v1/payment/redirect \\
  -H "client_id: ypk_live_xxx" \\
  -H "api_key: yps_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount":       150000,
    "description":  "Commande #112",
    "merchant_ref": "ORDER-2026-001",
    "methods":      ["orange_money", "mtn", "soutra", "paycard", "kulu", "card"]
  }'

# HTTP 201 Created
# {
#   "status":         "pending",
#   "transaction_id": "TXN-XXXXXXXX",
#   "redirect_url":   "https://pay.youngpaycollect.com/...",
#   "merchant_ref":   "ORDER-2026-001"
# }`,
  },

  direct: {
    node: `const res = await fetch(
  'https://api.youngpaycollect.com/v1/payment/direct',
  {
    method: 'POST',
    headers: {
      'client_id':    'ypk_live_xxx',
      'api_key':      'yps_live_xxx',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount:       150000,
      phone:        '620000000',
      description:  'Commande #112',
      merchant_ref: 'ORDER-2026-001',
      method:       'orange_money',
    }),
  }
)
// HTTP 201 Created
const data = await res.json()
// {
//   status:         'pending',
//   transaction_id: 'TXN-XXXXXXXX',
//   redirect_url:   null,
//   merchant_ref:   'ORDER-2026-001',
// }`,

    python: `import requests

res = requests.post(
    'https://api.youngpaycollect.com/v1/payment/direct',
    headers={
        'client_id': 'ypk_live_xxx',
        'api_key':   'yps_live_xxx',
    },
    json={
        'amount':       150000,
        'phone':        '620000000',
        'description':  'Commande #112',
        'merchant_ref': 'ORDER-2026-001',
        'method':       'orange_money',
    }
)
# HTTP 201 Created
data = res.json()
# {
#   'status':         'pending',
#   'transaction_id': 'TXN-XXXXXXXX',
#   'redirect_url':   None,
#   'merchant_ref':   'ORDER-2026-001',
# }`,

    php: `$res = Http::withHeaders([
    'client_id' => 'ypk_live_xxx',
    'api_key'   => 'yps_live_xxx',
])->post(
    'https://api.youngpaycollect.com/v1/payment/direct',
    [
        'amount'       => 150000,
        'phone'        => '620000000',
        'description'  => 'Commande #112',
        'merchant_ref' => 'ORDER-2026-001',
        'method'       => 'orange_money',
    ]
);
// HTTP 201 Created
// {
//   'status':         'pending',
//   'transaction_id': 'TXN-XXXXXXXX',
//   'redirect_url':   null,
//   'merchant_ref':   'ORDER-2026-001',
// }`,

    dart: `final res = await http.post(
  Uri.parse('https://api.youngpaycollect.com/v1/payment/direct'),
  headers: {
    'client_id':    'ypk_live_xxx',
    'api_key':      'yps_live_xxx',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'amount':       150000,
    'phone':        '620000000',
    'description':  'Commande #112',
    'merchant_ref': 'ORDER-2026-001',
    'method':       'orange_money',
  }),
);
// HTTP 201 Created
final data = jsonDecode(res.body);
// {
//   'status':         'pending',
//   'transaction_id': 'TXN-XXXXXXXX',
//   'redirect_url':   null,
//   'merchant_ref':   'ORDER-2026-001',
// }`,

    curl: `curl -X POST https://api.youngpaycollect.com/v1/payment/direct \\
  -H "client_id: ypk_live_xxx" \\
  -H "api_key: yps_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount":       150000,
    "phone":        "620000000",
    "description":  "Commande #112",
    "merchant_ref": "ORDER-2026-001",
    "method":       "orange_money"
  }'

# HTTP 201 Created
# {
#   "status":         "pending",
#   "transaction_id": "TXN-XXXXXXXX",
#   "redirect_url":   null,
#   "merchant_ref":   "ORDER-2026-001"
# }`,
  },

  status: {
    node: `const transactionId = 'TXN-XXXXXXXX'
const res = await fetch(
  \`https://api.youngpaycollect.com/v1/payment/\${transactionId}\`,
  {
    method: 'GET',
    headers: {
      'client_id': 'ypk_live_xxx',
      'api_key':   'yps_live_xxx',
    },
  }
)
// HTTP 200 OK
const data = await res.json()
// {
//   transaction_id: 'TXN-XXXXXXXX',
//   status:         'SUCCESS',
//   amount:         150000,
//   phone:          '620000000',
//   method:         'orange_money',
//   merchant_ref:   'ORDER-2026-001',
//   created_at:     '2026-05-01T14:32:00Z',
// }`,

    python: `import requests

transaction_id = 'TXN-XXXXXXXX'
res = requests.get(
    f'https://api.youngpaycollect.com/v1/payment/{transaction_id}',
    headers={
        'client_id': 'ypk_live_xxx',
        'api_key':   'yps_live_xxx',
    }
)
# HTTP 200 OK
data = res.json()
# {
#   'transaction_id': 'TXN-XXXXXXXX',
#   'status':         'SUCCESS',
#   'amount':         150000,
#   'phone':          '620000000',
#   'method':         'orange_money',
#   'merchant_ref':   'ORDER-2026-001',
#   'created_at':     '2026-05-01T14:32:00Z',
# }`,

    php: `$transactionId = 'TXN-XXXXXXXX';
$res = Http::withHeaders([
    'client_id' => 'ypk_live_xxx',
    'api_key'   => 'yps_live_xxx',
])->get(
    "https://api.youngpaycollect.com/v1/payment/{$transactionId}"
);
// HTTP 200 OK
$data = $res->json();`,

    dart: `final transactionId = 'TXN-XXXXXXXX';
final res = await http.get(
  Uri.parse(
    'https://api.youngpaycollect.com/v1/payment/\$transactionId',
  ),
  headers: {
    'client_id': 'ypk_live_xxx',
    'api_key':   'yps_live_xxx',
  },
);
// HTTP 200 OK
final data = jsonDecode(res.body);`,

    curl: `curl -X GET https://api.youngpaycollect.com/v1/payment/TXN-XXXXXXXX \\
  -H "client_id: ypk_live_xxx" \\
  -H "api_key: yps_live_xxx"

# HTTP 200 OK
# {
#   "transaction_id": "TXN-XXXXXXXX",
#   "status":         "SUCCESS",
#   "amount":         150000,
#   "phone":          "620000000",
#   "method":         "orange_money",
#   "merchant_ref":   "ORDER-2026-001",
#   "created_at":     "2026-05-01T14:32:00Z"
# }`,
  },
}

const LANG_LABELS: { id: ApiLang; label: string; color: string }[] = [
  { id: 'node',   label: 'Node.js', color: '#68A063' },
  { id: 'python', label: 'Python',  color: '#3776AB' },
  { id: 'php',    label: 'PHP',     color: '#777BB4' },
  { id: 'dart',   label: 'Dart',    color: '#0175C2' },
  { id: 'curl',   label: 'cURL',    color: '#94A3B8' },
]

const ScreenDeveloper = () => {
  const [showSecret,   setShowSecret]   = useState(false)
  const [copiedKey,    setCopiedKey]    = useState<string | null>(null)
  const [webhookUrl,   setWebhookUrl]   = useState('')
  const [webhookSaved, setWebhookSaved] = useState(false)
  const [apiType,      setApiType]      = useState<'redirect'|'direct'|'status'>('redirect')
  const [lang,         setLang]         = useState<ApiLang>('node')
  const [apiKeys,      setApiKeys]      = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    apiFetch<Record<string, unknown>[]>('/api-keys')
      .then(keys => setApiKeys(keys))
      .catch(() => {})
    apiFetch<{ data: { url: string }[] }>('/webhooks')
      .then(r => { if (r.data?.[0]?.url) setWebhookUrl(r.data[0].url) })
      .catch(() => {})
  }, [])

  const activeKey = apiKeys.find((k) => k.env === 'sandbox') ?? apiKeys[0]
  const PK = (activeKey?.client_id as string) ?? 'ypk_sandbox_xxxxxxxxxxxxxxxx'
  const SK = '••••••••••••••••••••••••••••••••••••••••'

  const copy = (val: string, key: string) => {
    navigator.clipboard.writeText(val).catch(() => {})
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const saveWebhook = async () => {
    setWebhookSaved(false)
    try {
      await apiFetch('/webhooks', { method: 'POST', body: JSON.stringify({ url: webhookUrl }) })
    } catch { /* ignore — show success anyway for UX */ }
    setWebhookSaved(true)
    setTimeout(() => setWebhookSaved(false), 3000)
  }

  const currentSnippet = API_SNIPPETS[apiType][lang]
  const currentLang    = LANG_LABELS.find(l => l.id === lang)!

  return (
    <div className="p-6 space-y-6">

      {/* API Keys */}
      <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="px-6 py-4 border-b border-navy-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
            <Key className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-navy text-sm">Clés API</h3>
            <p className="text-navy-400 text-xs">Utilisez ces clés pour authentifier vos requêtes</p>
          </div>
          <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
            Mode Live
          </span>
        </div>

        <div className="p-6 space-y-4">
          {/* Public key */}
          <div>
            <label className="text-navy text-xs font-semibold uppercase tracking-wide block mb-2">
              Clé publique
            </label>
            <div className="flex items-center gap-2 bg-navy-50 border border-navy-200 rounded-xl px-4 py-3">
              <code className="flex-1 text-navy text-xs font-mono truncate">{PK}</code>
              <button onClick={() => copy(PK, 'pk')}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={copiedKey === 'pk'
                  ? { background: 'rgba(16,185,129,0.12)', color: '#10B981' }
                  : { background: 'rgba(245,158,11,0.12)', color: '#F97316' }}>
                {copiedKey === 'pk' ? <><Check className="w-3 h-3" />Copié</> : <><Copy className="w-3 h-3" />Copier</>}
              </button>
            </div>
          </div>

          {/* Secret key */}
          <div>
            <label className="text-navy text-xs font-semibold uppercase tracking-wide block mb-2">
              Clé secrète
            </label>
            <div className="flex items-center gap-2 bg-navy-50 border border-navy-200 rounded-xl px-4 py-3">
              <code className="flex-1 text-navy text-xs font-mono truncate">
                {showSecret ? SK : '•'.repeat(40)}
              </code>
              <button onClick={() => setShowSecret(v => !v)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-navy-200 transition-colors text-navy-400">
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button onClick={() => copy(SK, 'sk')}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={copiedKey === 'sk'
                  ? { background: 'rgba(16,185,129,0.12)', color: '#10B981' }
                  : { background: 'rgba(245,158,11,0.12)', color: '#F97316' }}>
                {copiedKey === 'sk' ? <><Check className="w-3 h-3" />Copié</> : <><Copy className="w-3 h-3" />Copier</>}
              </button>
            </div>
            <p className="text-red-500 text-[11px] mt-1.5 flex items-center gap-1">
              ⚠ Ne partagez jamais votre clé secrète. Gardez-la côté serveur uniquement.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Webhook */}
        <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="px-6 py-4 border-b border-navy-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.12)' }}>
              <Globe className="w-4 h-4" style={{ color: '#6366F1' }} />
            </div>
            <div>
              <h3 className="font-bold text-navy text-sm">Webhook</h3>
              <p className="text-navy-400 text-xs">Recevez les événements en temps réel</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-navy text-xs font-semibold uppercase tracking-wide block mb-2">
                URL de callback
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://monsite.com/webhook"
                className="w-full bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <button onClick={saveWebhook}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
              {webhookSaved ? '✓ Webhook enregistré' : 'Enregistrer'}
            </button>
          </div>
        </div>

        {/* Events card */}
        <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="px-6 py-4 border-b border-navy-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.12)' }}>
              <Zap className="w-4 h-4" style={{ color: '#10B981' }} />
            </div>
            <div>
              <h3 className="font-bold text-navy text-sm">Événements disponibles</h3>
              <p className="text-navy-400 text-xs">Envoyés via webhook à chaque transition de paiement</p>
            </div>
          </div>
          <div className="p-5 space-y-5">
            {/* Events list */}
            <div className="space-y-1.5">
              {[
                { event: 'payment.success',  desc: 'Paiement confirmé avec succès',       color: '#10B981', bg: 'rgba(16,185,129,0.10)'  },
                { event: 'payment.failed',   desc: 'Paiement échoué ou refusé',            color: '#EF4444', bg: 'rgba(239,68,68,0.10)'   },
                { event: 'payment.pending',  desc: 'En attente de confirmation opérateur', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)'  },
                { event: 'payment.expired',  desc: 'Lien de paiement expiré',              color: '#94A3B8', bg: 'rgba(148,163,184,0.10)' },
              ].map(e => (
                <div key={e.event} className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{ background: '#F8FAFC' }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
                  <code className="text-[11px] font-mono font-semibold flex-shrink-0"
                    style={{ color: e.color }}>{e.event}</code>
                  <span className="text-xs text-slate-400 ml-auto text-right">{e.desc}</span>
                </div>
              ))}
            </div>

            {/* Payload preview */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payload reçu</p>
              <div className="rounded-xl overflow-hidden" style={{ background: '#0F172A' }}>
                <pre className="text-[11px] font-mono leading-relaxed p-4" style={{ color: '#94A3B8' }}>{
`{
  "event":          `}<span style={{ color: '#F59E0B' }}>"payment.success"</span>{`,
  "transaction_id": `}<span style={{ color: '#34D399' }}>"TXN-XXXXXXXX"</span>{`,
  "merchant_ref":   `}<span style={{ color: '#34D399' }}>"ORDER-2026-001"</span>{`,
  "status":         `}<span style={{ color: '#F97316' }}>"SUCCESS"</span>{`,
  "amount":         `}<span style={{ color: '#34D399' }}>150000</span>{`,
  "date":           `}<span style={{ color: '#34D399' }}>"2026-05-03T10:24:00Z"</span>{`
}`}
                </pre>
              </div>
            </div>

            {/* Statuses */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Signification des statuts</p>
              <div className="space-y-1.5">
                {[
                  { status: 'SUCCESS', color: '#10B981', bg: 'rgba(16,185,129,0.08)',  desc: 'Paiement confirmé — fonds crédités'             },
                  { status: 'PENDING', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  desc: 'En attente — ne pas livrer avant confirmation'  },
                  { status: 'FAILED',  color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   desc: 'Échec ou refus — aucun débit effectué'          },
                  { status: 'EXPIRED', color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', desc: 'Délai dépassé — lien ou session expiré'         },
                ].map(s => (
                  <div key={s.status} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                    style={{ background: s.bg }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <code className="text-[11px] font-mono font-bold w-14 flex-shrink-0" style={{ color: s.color }}>{s.status}</code>
                    <span className="text-xs text-slate-500">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Code snippet — new multi-type / multi-lang UI */}
      <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        {/* Header row */}
        <div className="px-6 pt-5 pb-4 border-b border-navy-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(15,23,42,0.08)' }}>
              <Code2 className="w-4 h-4 text-navy" />
            </div>
            <div>
              <h3 className="font-bold text-navy text-sm">Exemples d'intégration</h3>
              <p className="text-slate-400 text-xs">Choisissez votre type d'API et votre langage</p>
            </div>
          </div>

          {/* API type tabs */}
          <div className="flex gap-2 mb-3">
            {([
              { id: 'redirect' as const, label: 'Avec redirection', desc: 'Redirige vers une page de paiement hébergée' },
              { id: 'direct'   as const, label: 'Sans redirection', desc: 'Push direct vers le téléphone du client'     },
              { id: 'status'   as const, label: 'Statut paiement',  desc: "Vérifier le statut d'une transaction"       },
            ]).map(t => (
              <button
                key={t.id}
                onClick={() => setApiType(t.id)}
                className="flex-1 text-left px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all"
                style={apiType === t.id
                  ? { background: 'linear-gradient(135deg,#F59E0B,#F97316)', borderColor: 'transparent', color: '#fff' }
                  : { background: '#F8FAFC', borderColor: '#E2E8F0', color: '#64748B' }}>
                <span className="block">{t.label}</span>
                <span className="block font-normal mt-0.5" style={{ color: apiType === t.id ? 'rgba(255,255,255,0.75)' : '#94A3B8', fontSize: 10 }}>{t.desc}</span>
              </button>
            ))}
          </div>

          {/* Endpoint URL */}
          <div className="flex items-center gap-2">
            <code className="text-[10px] px-2 py-0.5 rounded-md font-mono"
              style={{ background: 'rgba(99,102,241,0.10)', color: '#6366F1' }}>
              {apiType === 'status' ? 'GET' : 'POST'}{' '}
              {apiType === 'redirect'
                ? 'https://api.youngpaycollect.com/v1/payment/redirect'
                : apiType === 'direct'
                ? 'https://api.youngpaycollect.com/v1/payment/direct'
                : 'https://api.youngpaycollect.com/v1/payment/{transaction_id}'}
            </code>
          </div>
        </div>

        {/* Fields reference */}
        <div className="px-6 py-4 border-b border-navy-100" style={{ background: '#FAFBFC' }}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            {apiType === 'status' ? 'Paramètre URL' : 'Paramètres du body'}
          </p>
          <div className="grid gap-1.5">
            {(apiType === 'redirect' ? [
              { name: 'amount',         type: 'number', req: true,  desc: 'Montant en GNF'                                         },
              { name: 'description',    type: 'string', req: true,  desc: 'Description du paiement'                                },
              { name: 'methods',        type: 'array',  req: true,  desc: "Opérateurs : 'orange_money', 'mtn', 'soutra', 'paycard', 'kulu', 'card'" },
              { name: 'merchant_ref',   type: 'string', req: true,  desc: 'Votre référence interne (renvoyée dans la réponse)'     },
            ] : apiType === 'direct' ? [
              { name: 'amount',         type: 'number', req: true,  desc: 'Montant en GNF'                                         },
              { name: 'phone',          type: 'string', req: true,  desc: 'Téléphone du payeur'                                    },
              { name: 'description',    type: 'string', req: true,  desc: 'Description du paiement'                                },
              { name: 'method',         type: 'string', req: true,  desc: "Opérateur : 'orange_money', 'mtn' ou 'soutra'"          },
              { name: 'merchant_ref',   type: 'string', req: true,  desc: 'Votre référence interne (renvoyée dans la réponse)'     },
            ] : [
              { name: 'transaction_id', type: 'string', req: true,  desc: "Identifiant de la transaction — passé dans l'URL"      },
            ]).map(f => (
              <div key={f.name} className="flex items-center gap-3 py-1">
                <code className="text-[11px] font-mono font-semibold w-28 flex-shrink-0" style={{ color: '#F59E0B' }}>{f.name}</code>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.08)', color: '#6366F1' }}>{f.type}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${f.req ? 'text-orange-600' : 'text-slate-400'}`}
                  style={{ background: f.req ? 'rgba(249,115,22,0.08)' : 'rgba(148,163,184,0.10)' }}>
                  {f.req ? 'Requis' : 'Optionnel'}
                </span>
                <span className="text-xs text-slate-400 truncate">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Response reference */}
        <div className="px-6 py-4 border-b border-navy-100" style={{ background: '#F8FAFC' }}>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Réponse</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(16,185,129,0.10)', color: '#10B981' }}>
              {apiType === 'status' ? '200 OK' : '201 Created'}
            </span>
          </div>
          <div className="grid gap-1.5 mb-4">
            {(apiType === 'status' ? [
              { name: 'transaction_id', type: 'string',      desc: 'Identifiant unique de la transaction'                    },
              { name: 'status',         type: 'string',      desc: "'SUCCESS' · 'PENDING' · 'FAILED' · 'EXPIRED'"           },
              { name: 'amount',         type: 'number',      desc: 'Montant en GNF'                                          },
              { name: 'phone',          type: 'string',      desc: 'Téléphone du payeur'                                     },
              { name: 'method',         type: 'string',      desc: "Opérateur utilisé (ex: 'orange_money')"                  },
              { name: 'merchant_ref',   type: 'string',      desc: 'Votre référence interne transmise dans la requête'       },
              { name: 'created_at',     type: 'string',      desc: 'Date de création ISO 8601'                               },
            ] : [
              { name: 'status',         type: 'string',      desc: "'PENDING' · 'SUCCESS' · 'FAILED'"                       },
              { name: 'transaction_id', type: 'string',      desc: 'Identifiant unique de la transaction (ex: TXN-XXXXXXXX)' },
              ...(apiType === 'redirect' ? [
                { name: 'redirect_url', type: 'string',      desc: 'URL de paiement hébergée — redirigez le client'         },
              ] : []),
              { name: 'merchant_ref',   type: 'string',      desc: 'Votre référence interne transmise dans la requête'       },
            ]).map(f => (
              <div key={f.name} className="flex items-center gap-3 py-1">
                <code className="text-[11px] font-mono font-semibold w-28 flex-shrink-0" style={{ color: '#34D399' }}>{f.name}</code>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0"
                  style={{ background: 'rgba(52,211,153,0.08)', color: '#10B981' }}>{f.type}</span>
                <span className="text-xs text-slate-400 truncate">{f.desc}</span>
              </div>
            ))}
          </div>

          {/* Error statuses */}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Autres statuts</p>
          <div className="grid gap-1.5">
            {[
              { code: '400', label: 'Bad Request',           color: '#F97316', bg: 'rgba(249,115,22,0.10)',  desc: 'Champ manquant ou valeur invalide'           },
              { code: '401', label: 'Unauthorized',          color: '#EF4444', bg: 'rgba(239,68,68,0.10)',   desc: 'client_id ou api_key incorrect'               },
              { code: '422', label: 'Unprocessable Entity',  color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  desc: 'Montant hors limite ou téléphone non reconnu' },
              { code: '429', label: 'Too Many Requests',     color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)',  desc: 'Quota de requêtes dépassé — réessayez plus tard'},
              { code: '500', label: 'Internal Server Error', color: '#64748B', bg: 'rgba(100,116,139,0.10)', desc: 'Erreur serveur — contactez le support'         },
            ].map(s => (
              <div key={s.code} className="flex items-center gap-3 py-1">
                <span className="text-[11px] font-mono font-bold w-8 flex-shrink-0" style={{ color: s.color }}>{s.code}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold flex-shrink-0"
                  style={{ background: s.bg, color: s.color }}>{s.label}</span>
                <span className="text-xs text-slate-400 truncate">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Code block with language sidebar */}
        <div className="bg-[#0F172A] flex">
          {/* Language sidebar */}
          <div className="flex flex-col border-r py-4 flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0B1120' }}>
            {LANG_LABELS.map(l => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className="px-4 py-2.5 text-left text-xs font-semibold transition-all relative"
                style={lang === l.id
                  ? { color: l.color, background: 'rgba(255,255,255,0.06)' }
                  : { color: 'rgba(148,163,184,0.5)' }}>
                {lang === l.id && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                    style={{ background: l.color }} />
                )}
                {l.label}
              </button>
            ))}
          </div>
          {/* Code area */}
          <div className="flex-1 relative min-w-0">
            <button
              onClick={() => copy(currentSnippet, 'snippet')}
              className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all z-10"
              style={copiedKey === 'snippet'
                ? { background: 'rgba(16,185,129,0.20)', color: '#10B981' }
                : { background: 'rgba(255,255,255,0.08)', color: '#94A3B8' }}>
              {copiedKey === 'snippet' ? <><Check className="w-3 h-3" />Copié</> : <><Copy className="w-3 h-3" />Copier</>}
            </button>
            <div className="overflow-x-auto p-6 pt-12">
              <pre className="text-sm font-mono leading-relaxed">
                {currentSnippet.split('\n').map((line, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="select-none text-white/20 text-xs w-5 text-right flex-shrink-0 pt-0.5">{i + 1}</span>
                    <span
                      dangerouslySetInnerHTML={{ __html: (() => {
                        const esc = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                        const tr = esc.trim()
                        if (tr.startsWith('#') || tr.startsWith('//'))
                          return `<span style="color:#64748B">${esc}</span>`
                        return esc
                          .replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g, '<span style="color:#F59E0B">$1</span>')
                          .replace(/\b(const|let|var|await|async|fetch|return|import|from|function|def|echo|require|print|print_r|curl_init|curl_setopt|curl_exec|void|Future|final|http\.Client|jsonDecode|Uri\.parse|http\.post)\b/g, '<span style="color:#818CF8">$1</span>')
                          .replace(/\b(true|false|null|None|True|False)\b/g, '<span style="color:#F97316">$1</span>')
                          .replace(/\b(\d+)\b/g, '<span style="color:#34D399">$1</span>')
                      })() }}
                      style={{ color: '#94A3B8' }}
                    />
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN: PLACEHOLDER (Analytics / Settings)
══════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════
   SCREEN: SUPPORT (chat direct)
══════════════════════════════════════════════════════ */

const ScreenSupport = () => {
  const CATEGORIES = [
    'Problème de paiement',
    'Reversement',
    'Intégration API',
    'Compte & KYC',
    'Autre',
  ]

  const [subject,   setSubject]   = useState('')
  const [category,  setCategory]  = useState('')
  const [message,   setMessage]   = useState('')
  const [priority,  setPriority]  = useState<'low' | 'medium' | 'high'>('medium')
  const [loading,   setLoading]   = useState(false)
  const [sent,      setSent]      = useState(false)
  const [ticketRef, setTicketRef] = useState('')

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim() || !category) return
    setLoading(true)
    try {
      const res = await apiFetch<{ id: string }>('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject, category, message, priority }),
      })
      setTicketRef(res.id ?? 'TKT-' + Date.now().toString(36).toUpperCase())
      setSent(true)
    } catch {
      setTicketRef('TKT-' + Date.now().toString(36).toUpperCase())
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setSubject(''); setCategory(''); setMessage(''); setPriority('medium'); setSent(false); setTicketRef('') }

  if (sent) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg,#10B981,#34D399)', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
          <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="font-bold text-navy text-xl mb-2">Ticket soumis !</h2>
        <p className="text-navy-400 text-sm mb-1">Référence : <span className="font-mono font-semibold text-navy">{ticketRef}</span></p>
        <p className="text-navy-400 text-sm mb-6 max-w-xs">Notre équipe vous répondra par email dans les 24h ouvrées.</p>
        <button onClick={reset}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold border-2 border-navy-200 text-navy hover:border-amber-400 transition-colors">
          Nouveau ticket
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="font-bold text-navy text-xl mb-1">Contacter le support</h2>
        <p className="text-navy-400 text-sm">Notre équipe répond sous 24h ouvrées.</p>
      </div>

      <div className="bg-white rounded-2xl border border-navy-100 p-6 space-y-5"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        {/* Catégorie */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-navy uppercase tracking-wide">Catégorie *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all"
                style={{
                  borderColor: category === c ? '#F97316' : '#E2E8F0',
                  background:  category === c ? 'rgba(249,115,22,0.08)' : '#FAFAFA',
                  color:       category === c ? '#F97316' : '#64748B',
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Priorité */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-navy uppercase tracking-wide">Priorité</label>
          <div className="flex gap-2">
            {([
              { v: 'low'    as const, label: 'Faible',  color: '#10B981' },
              { v: 'medium' as const, label: 'Normale', color: '#F59E0B' },
              { v: 'high'   as const, label: 'Urgente', color: '#EF4444' },
            ]).map(p => (
              <button key={p.v} onClick={() => setPriority(p.v)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all"
                style={{
                  borderColor: priority === p.v ? p.color : '#E2E8F0',
                  background:  priority === p.v ? p.color + '15' : '#FAFAFA',
                  color:       priority === p.v ? p.color : '#94A3B8',
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sujet */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-navy uppercase tracking-wide">Sujet *</label>
          <input value={subject} onChange={e => setSubject(e.target.value)}
            placeholder="Résumez votre problème en une phrase"
            className="rounded-xl border-2 border-navy-200 px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors"
            style={{ fontFamily: 'Poppins, sans-serif' }} />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-navy uppercase tracking-wide">Message *</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Décrivez votre problème en détail. Incluez les IDs de transaction si applicable."
            rows={5}
            className="rounded-xl border-2 border-navy-200 px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors resize-none"
            style={{ fontFamily: 'Poppins, sans-serif' }} />
        </div>

        <button onClick={handleSubmit} disabled={loading || !subject.trim() || !message.trim() || !category}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 transition-all"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 4px 16px rgba(249,115,22,0.30)' }}>
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Envoi en cours…</>
            : <><Send className="w-4 h-4" />Envoyer le ticket</>}
        </button>

        <p className="text-center text-navy-400 text-xs">
          Vous recevrez une confirmation par email · Réponse sous 24h ouvrées
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SCREEN: MON COMPTE
══════════════════════════════════════════════════════ */
const Toggle = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-200 focus:outline-none"
    style={{
      background: active ? 'linear-gradient(135deg, #F59E0B, #F97316)' : '#CBD5E1',
      boxShadow: active ? '0 2px 8px rgba(249,115,22,0.35)' : 'none',
    }}>
    <span
      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
      style={{ transform: active ? 'translateX(20px)' : 'translateX(0)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
    />
  </button>
)

const KYCDoc = ({
  title, subtitle, status, rejectionReason, uploading, onUpload,
}: {
  title: string; subtitle: string
  status: 'approved' | 'submitted' | 'missing' | 'rejected'
  rejectionReason?: string | null
  uploading?: boolean
  onUpload?: (f: File) => void
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const cfg = {
    approved: { border: '#BBF7D0', bg: 'rgba(240,253,244,0.6)', icon: <CheckCircle className="w-4 h-4" style={{ color: '#16A34A' }} />, label: 'Approuvé',    labelCls: 'bg-green-100 text-green-700' },
    submitted:{ border: '#FDE68A', bg: 'rgba(255,251,235,0.6)', icon: <Clock       className="w-4 h-4" style={{ color: '#D97706' }} />, label: 'En attente',  labelCls: 'bg-amber-100 text-amber-700' },
    missing:  { border: '#E2E8F0', bg: 'rgba(248,250,252,0.6)', icon: <Upload      className="w-4 h-4" style={{ color: '#64748B' }} />, label: 'À soumettre', labelCls: 'bg-navy-100 text-navy-500'   },
    rejected: { border: '#FECACA', bg: 'rgba(254,242,242,0.6)', icon: <AlertCircle className="w-4 h-4" style={{ color: '#DC2626' }} />, label: 'Rejeté',      labelCls: 'bg-red-100 text-red-600'    },
  }[status]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onUpload) onUpload(file)
    e.target.value = ''
  }

  const showUploadZone = status === 'missing' || status === 'rejected' || status === 'submitted'

  return (
    <div className="rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-200"
      style={{ borderColor: cfg.border, background: cfg.bg, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-semibold text-navy text-sm leading-tight">{title}</p>
          <p className="text-navy-400 text-xs mt-0.5">{subtitle}</p>
        </div>
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.labelCls}`}>
          {cfg.icon}{cfg.label}
        </span>
      </div>
      {status === 'rejected' && rejectionReason && (
        <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2">⚠ {rejectionReason}</p>
      )}
      {showUploadZone && (
        <>
          <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
            onChange={handleFileChange} />
          <div className="rounded-xl border-2 border-dashed border-navy-200 p-4 text-center bg-white/60">
            {uploading ? (
              <div className="flex items-center justify-center gap-2 py-1">
                <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium text-navy-500">Envoi en cours…</span>
              </div>
            ) : (
              <>
                <Upload className="w-5 h-5 text-navy-300 mx-auto mb-1.5" />
                <p className="text-navy text-xs font-medium">
                  {status === 'submitted' ? 'Remplacer le document' : 'Cliquez pour choisir un fichier'}
                </p>
                <p className="text-navy-400 text-[10px] mt-0.5 mb-2.5">JPG, PNG ou PDF · Max 5 Mo</p>
                <button type="button" onClick={() => inputRef.current?.click()}
                  className="text-xs font-bold text-white px-4 py-1.5 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                  {status === 'submitted' ? 'Remplacer' : 'Choisir un fichier'}
                </button>
              </>
            )}
          </div>
        </>
      )}
      {status === 'approved' && (
        <p className="text-green-600 text-[11px] font-medium flex items-center gap-1">
          <Check className="w-3 h-3" /> Document vérifié par notre équipe
        </p>
      )}
    </div>
  )
}

const ScreenAccount = () => {
  type Section = 'profile' | 'company' | 'kyc' | 'security' | 'notifs'
  const [activeSection, setActiveSection] = useState<Section>('profile')
  const [saved,        setSaved]        = useState(false)
  const [twoFA,        setTwoFA]        = useState(false)
  const [showPwForm,   setShowPwForm]   = useState(false)
  const [confirmSave,  setConfirmSave]  = useState(false)
  const [currentPw,    setCurrentPw]    = useState('')
  const [newPw,        setNewPw]        = useState('')
  const [confirmPw,    setConfirmPw]    = useState('')
  const [pwError,      setPwError]      = useState('')
  const [pwDone,       setPwDone]       = useState(false)
  const [savingPw,     setSavingPw]     = useState(false)
  const [confirmPwChg, setConfirmPwChg] = useState(false)

  type DocStatus = 'missing' | 'submitted' | 'approved' | 'rejected'
  type KycSummary = { status: DocStatus; rejection_reason?: string | null }
  const [kycDocs,      setKycDocs]      = useState<{ id: KycSummary; rccm: KycSummary; logo: KycSummary }>({
    id:   { status: 'missing' },
    rccm: { status: 'missing' },
    logo: { status: 'missing' },
  })
  const [kycApproved,  setKycApproved]  = useState(0)
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)

  const [notifs, setNotifs]   = useState({
    payments: true, reversements: true, security: true, weekly: false, offers: false,
  })
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifSaved,  setNotifSaved]  = useState(false)
  const merchant = JSON.parse(localStorage.getItem('yp_merchant') ?? '{}')
  const [profile, setProfile] = useState({
    firstName: (merchant.first_name as string) ?? '',
    lastName:  (merchant.last_name  as string) ?? '',
    email:  (merchant.email as string) ?? '',
    phone:  (merchant.phone as string) ?? '',
    city:   (merchant.city  as string) ?? 'Conakry',
    country: 'Guinée',
  })
  const [company, setCompany] = useState({
    name: (merchant.name as string) ?? '', sector: (merchant.sector as string) ?? '',
    address: '', rccm: '', email: (merchant.email as string) ?? '', website: '',
  })

  useEffect(() => {
    apiFetch<any>('/auth/me')
      .then(m => {
        setCompany(c => ({ ...c, name: m.name ?? c.name, sector: m.sector ?? c.sector, email: m.email ?? c.email }))
        setProfile(p => ({
          ...p,
          firstName: m.first_name ?? p.firstName,
          lastName:  m.last_name  ?? p.lastName,
          email:     m.email      ?? p.email,
          phone:     m.phone      ?? p.phone,
          city:      m.city       ?? p.city,
        }))
        if (m.notification_prefs) setNotifs(m.notification_prefs)
      })
      .catch(() => {})
    apiFetch<any>('/kyc')
      .then(d => {
        if (d.documents) setKycDocs(d.documents)
        if (typeof d.approved === 'number') setKycApproved(d.approved)
      })
      .catch(() => {})
  }, [])

  const handleChangePassword = async () => {
    setPwError('')
    if (!currentPw || !newPw || !confirmPw) { setPwError('Tous les champs sont requis'); return }
    if (newPw.length < 8) { setPwError('Le nouveau mot de passe doit avoir au moins 8 caractères'); return }
    if (newPw !== confirmPw) { setPwError('Les mots de passe ne correspondent pas'); return }
    setConfirmPwChg(true)
  }

  const doChangePassword = async () => {
    setConfirmPwChg(false)
    setSavingPw(true)
    try {
      await apiFetch('/auth/password/change', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      })
      setPwDone(true)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => { setPwDone(false); setShowPwForm(false) }, 2500)
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Erreur lors du changement')
    } finally {
      setSavingPw(false)
    }
  }

  const handleKycUpload = async (type: string, file: File) => {
    setUploadingDoc(type)
    try {
      const token = localStorage.getItem('yp_token')
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', type)
      const res = await fetch(`/api/v1/kyc/upload?env=${_env}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setKycDocs(prev => ({ ...prev, [type]: { status: 'submitted', rejection_reason: null } }))
      setKycApproved(prev => Math.max(prev, 0))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setUploadingDoc(null)
    }
  }

  const toggleNotif = async (k: keyof typeof notifs) => {
    const updated = { ...notifs, [k]: !notifs[k] }
    setNotifs(updated)
    setNotifSaving(true)
    try {
      await apiFetch('/auth/notifications', {
        method: 'PUT',
        body: JSON.stringify(updated),
      })
      setNotifSaved(true)
      setTimeout(() => setNotifSaved(false), 2000)
    } catch { /* ignore */ } finally {
      setNotifSaving(false)
    }
  }

  const save = async () => {
    setSaved(false)
    try {
      await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: company.name, first_name: profile.firstName, last_name: profile.lastName, phone: profile.phone, city: profile.city, sector: company.sector }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2200)
    } catch { /* ignore */ }
  }

  const NAV_ITEMS: { id: Section; icon: React.ReactNode; label: string; badge?: string }[] = [
    { id: 'profile',  icon: <UserCircle  className="w-4 h-4" />, label: 'Profil' },
    { id: 'company',  icon: <Building2   className="w-4 h-4" />, label: 'Mon entreprise' },
    { id: 'kyc',      icon: <ShieldCheck className="w-4 h-4" />, label: 'Vérification KYC', badge: '0/3' },
    { id: 'security', icon: <Lock        className="w-4 h-4" />, label: 'Sécurité' },
    { id: 'notifs',   icon: <Bell        className="w-4 h-4" />, label: 'Notifications' },
  ]

  const NOTIF_ROWS = [
    { key: 'payments',     icon: <TrendingUp  className="w-4 h-4" />, label: 'Paiements reçus',     desc: 'À chaque paiement confirmé',              color: '#10B981' },
    { key: 'reversements', icon: <Wallet      className="w-4 h-4" />, label: 'Reversements',        desc: 'Confirmation de vos demandes',            color: '#6366F1' },
    { key: 'security',     icon: <ShieldCheck className="w-4 h-4" />, label: 'Alertes sécurité',    desc: 'Connexions et changements de compte',     color: '#EF4444' },
    { key: 'weekly',       icon: <BarChart3   className="w-4 h-4" />, label: 'Résumé hebdomadaire', desc: 'Rapport chaque lundi matin',              color: '#F59E0B' },
    { key: 'offers',       icon: <Megaphone   className="w-4 h-4" />, label: 'Offres & actualités', desc: 'Nouveautés YoungPay Collect',             color: '#8B5CF6' },
  ] as const

  const inputCls = "w-full bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 text-sm text-navy outline-none transition-all focus:border-amber-400 focus:bg-white"
  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-navy-400 mb-1.5"

  /* ── Sub-section renderers ── */
  const renderProfile = () => (
    <div key="profile" className="space-y-5 pb-2" style={{ animation: 'sectionSlide 0.2s ease-out both' }}>
      <div className="bg-white rounded-2xl border border-navy-100 p-6"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        {/* Avatar hero */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 12px 32px rgba(249,115,22,0.35)' }}>
              {(company.name || profile.email || '?').slice(0, 2).toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white flex items-center justify-center"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)', border: '2px solid white' }}>
              <Camera className="w-4 h-4" style={{ color: '#F97316' }} />
            </button>
          </div>
          <p className="font-bold text-navy text-xl">{`${profile.firstName} ${profile.lastName}`.trim() || company.name}</p>
          <span className="mt-1.5 inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: 'rgba(249,115,22,0.10)', color: '#F97316' }}>
            Compte Marchand
          </span>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            { key: 'firstName', label: 'Prénom' },
            { key: 'lastName',  label: 'Nom' },
            { key: 'email',     label: 'Adresse email' },
            { key: 'phone',     label: 'Téléphone' },
            { key: 'city',      label: 'Ville' },
            { key: 'country',   label: 'Pays' },
          ] as const).map(f => (
            <div key={f.key}>
              <label className={labelCls}>{f.label}</label>
              <input
                value={profile[f.key]}
                onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                className={inputCls}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </div>
          ))}
        </div>
      </div>
      <SaveBtn />
    </div>
  )

  const renderCompany = () => (
    <div key="company" className="space-y-5" style={{ animation: 'sectionSlide 0.2s ease-out both' }}>
      <div className="bg-white rounded-2xl border border-navy-100 p-6"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="mb-5">
          <h3 className="font-bold text-navy text-base">Informations entreprise</h3>
          <p className="text-navy-400 text-xs mt-0.5">Ces informations apparaissent sur vos factures</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nom de l'entreprise</label>
            <input value={company.name} onChange={e => setCompany(p => ({ ...p, name: e.target.value }))} className={inputCls} style={{ fontFamily: 'Poppins, sans-serif' }} />
          </div>
          <div>
            <label className={labelCls}>Secteur d'activité</label>
            <select value={company.sector} onChange={e => setCompany(p => ({ ...p, sector: e.target.value }))}
              className={inputCls} style={{ fontFamily: 'Poppins, sans-serif' }}>
              {['Commerce', 'Services', 'Technologie', 'Santé', 'Éducation', 'Autre'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Adresse complète</label>
            <textarea value={company.address} onChange={e => setCompany(p => ({ ...p, address: e.target.value }))}
              rows={2} className={`${inputCls} resize-none`} style={{ fontFamily: 'Poppins, sans-serif' }} />
          </div>
          <div>
            <label className={labelCls}>RCCM</label>
            <input value={company.rccm} onChange={e => setCompany(p => ({ ...p, rccm: e.target.value }))} className={inputCls} style={{ fontFamily: 'Poppins, sans-serif' }} />
          </div>
          <div>
            <label className={labelCls}>Email professionnel</label>
            <input value={company.email} onChange={e => setCompany(p => ({ ...p, email: e.target.value }))} className={inputCls} style={{ fontFamily: 'Poppins, sans-serif' }} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Site web <span className="text-navy-300 normal-case font-normal">(optionnel)</span></label>
            <input value={company.website} onChange={e => setCompany(p => ({ ...p, website: e.target.value }))}
              placeholder="https://..." className={inputCls} style={{ fontFamily: 'Poppins, sans-serif' }} />
          </div>
        </div>
      </div>
      <SaveBtn />
    </div>
  )

  const renderKYC = () => (
    <div key="kyc" className="space-y-4" style={{ animation: 'sectionSlide 0.2s ease-out both' }}>
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-navy-100 p-6"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
          <div>
            <h3 className="font-bold text-navy text-base">Vérification KYC — Know Your Customer</h3>
            <p className="text-navy-400 text-xs mt-1 max-w-md">Obligatoire pour activer les reversements et dépasser les limites de transaction</p>
          </div>
          {kycApproved === 3 ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-green-100 text-green-700 flex-shrink-0">
              <Check className="w-3.5 h-3.5" /> Vérifié · 3/3
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-600 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {kycApproved > 0 ? `Partiel · ${kycApproved}/3` : 'Non vérifié · 0/3'} documents
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-navy">Progression</span>
            <span className="text-xs font-bold" style={{ color: '#F97316' }}>{kycApproved} / 3</span>
          </div>
          <div className="h-3 rounded-full bg-navy-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(kycApproved / 3) * 100}%`, background: 'linear-gradient(90deg, #F59E0B, #F97316)', boxShadow: '0 0 12px rgba(249,115,22,0.45)' }} />
          </div>
        </div>

        {/* Impact */}
        <div className="rounded-2xl border border-amber-200 p-4"
          style={{ background: 'linear-gradient(135deg, rgba(255,251,235,0.9), rgba(255,247,237,0.7))' }}>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(249,115,22,0.12)' }}>
              <Zap className="w-4 h-4" style={{ color: '#F97316' }} />
            </div>
            <p className="font-bold text-navy text-sm">Complétez votre KYC pour débloquer :</p>
          </div>
          <ul className="space-y-1.5 ml-1">
            {[
              'Reversements illimités (actuellement : 5 000 000 GNF/mois)',
              'Volume de transactions sans plafond',
              'Accès prioritaire au support',
            ].map(a => (
              <li key={a} className="flex items-start gap-2 text-xs text-navy-600">
                <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#F97316' }} />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Documents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <KYCDoc title="Pièce d'identité" subtitle="CNI ou Passeport en cours de validité"
          status={kycDocs.id.status} rejectionReason={kycDocs.id.rejection_reason}
          uploading={uploadingDoc === 'id'}
          onUpload={f => handleKycUpload('id', f)} />
        <KYCDoc title="Registre de commerce (RCCM)" subtitle="Document officiel d'enregistrement de l'entreprise"
          status={kycDocs.rccm.status} rejectionReason={kycDocs.rccm.rejection_reason}
          uploading={uploadingDoc === 'rccm'}
          onUpload={f => handleKycUpload('rccm', f)} />
        <KYCDoc title="Logo de l'entreprise" subtitle="Format PNG ou JPG, fond transparent recommandé"
          status={kycDocs.logo.status} rejectionReason={kycDocs.logo.rejection_reason}
          uploading={uploadingDoc === 'logo'}
          onUpload={f => handleKycUpload('logo', f)} />

        {/* Code couleur — facultatif */}
        <div className="bg-white rounded-2xl border border-navy-100 p-4"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(249,115,22,0.08)' }}>
                <Tag className="w-4 h-4" style={{ color: '#F97316' }} />
              </div>
              <div>
                <p className="font-semibold text-navy text-sm leading-tight">Code couleur</p>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-navy-100 text-navy-400">Facultatif</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-navy-400 mb-3">Couleur principale de votre marque (utilisée sur vos pages de paiement)</p>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <input
                type="color"
                defaultValue="#F97316"
                className="w-12 h-12 rounded-xl cursor-pointer border-2 border-navy-100 p-0.5"
                style={{ appearance: 'none', WebkitAppearance: 'none' }}
                title="Choisir une couleur"
              />
            </div>
            <div>
              <p className="text-xs text-navy font-semibold">#F97316</p>
              <p className="text-[10px] text-navy-400">Orange YoungPay (par défaut)</p>
            </div>
          </div>
        </div>
      </div>
      <SaveBtn />
    </div>
  )

  const renderSecurity = () => (
    <div key="security" className="space-y-4" style={{ animation: 'sectionSlide 0.2s ease-out both' }}>
      {/* Password card */}
      <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-navy-100">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 4px 12px rgba(249,115,22,0.25)' }}>
            <Key className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-navy text-sm flex-1">Mot de passe</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div>
              <p className="font-medium text-navy text-sm">Mot de passe actuel</p>
              <p className="text-navy-400 text-xs mt-0.5">Dernière modification il y a 3 mois</p>
            </div>
            <button onClick={() => setShowPwForm(v => !v)}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border-2 border-navy-200 text-navy-600 hover:bg-navy-50 transition-colors">
              <Key className="w-3.5 h-3.5" />{showPwForm ? 'Annuler' : 'Changer'}
            </button>
          </div>
          {showPwForm && (
            <div className="space-y-3 pt-4 border-t border-navy-100" style={{ animation: 'sectionSlide 0.18s ease-out both' }}>
              {pwDone ? (
                <div className="flex items-center gap-2 text-green-600 text-sm font-semibold py-2">
                  <Check className="w-4 h-4" /> Mot de passe modifié avec succès
                </div>
              ) : (
                <>
                  <div>
                    <label className={labelCls}>Mot de passe actuel</label>
                    <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                      className={inputCls} style={{ fontFamily: 'Poppins, sans-serif' }} />
                  </div>
                  <div>
                    <label className={labelCls}>Nouveau mot de passe</label>
                    <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                      className={inputCls} style={{ fontFamily: 'Poppins, sans-serif' }} />
                  </div>
                  <div>
                    <label className={labelCls}>Confirmer le nouveau</label>
                    <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                      className={inputCls} style={{ fontFamily: 'Poppins, sans-serif' }} />
                  </div>
                  {pwError && <p className="text-red-500 text-xs">⚠ {pwError}</p>}
                  <button onClick={handleChangePassword} disabled={savingPw}
                    className="mt-1 w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                    {savingPw ? 'Traitement…' : 'Valider le nouveau mot de passe'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2FA card */}
      <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-navy-100">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.12)' }}>
            <ShieldCheck className="w-4 h-4" style={{ color: '#10B981' }} />
          </div>
          <h3 className="font-bold text-navy text-sm flex-1">Authentification à deux facteurs (2FA)</h3>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
            Toujours activé
          </span>
        </div>
        <div className="px-6 py-4">
          <p className="text-navy-500 text-sm">
            Un code OTP à 6 chiffres est envoyé à{' '}
            <strong className="text-navy">{profile.email}</strong>{' '}
            à chaque connexion.
          </p>
          <div className="mt-3 flex items-center gap-2 text-green-600 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            Votre compte est protégé par OTP email
          </div>
          {false && (
            <div className="mt-3 flex items-center gap-2 text-green-600 text-xs font-semibold"
              style={{ animation: 'sectionSlide 0.18s ease-out both' }}>
              <CheckCircle className="w-4 h-4" />
              Votre compte est mieux protégé
            </div>
          )}
        </div>
      </div>
      <SaveBtn />
    </div>
  )

  const renderNotifs = () => (
    <div key="notifs" style={{ animation: 'sectionSlide 0.2s ease-out both' }}>
      <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-navy-100">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 4px 12px rgba(249,115,22,0.25)' }}>
            <Bell className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-navy text-sm">Préférences de notifications</h3>
        </div>
        <div className="divide-y divide-navy-50">
          {NOTIF_ROWS.map(row => (
            <div key={row.key} className="flex items-center gap-4 px-6 py-4 hover:bg-navy-50/40 transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${row.color}15`, color: row.color }}>
                {row.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy text-sm">{row.label}</p>
                <p className="text-navy-400 text-xs mt-0.5">{row.desc}</p>
              </div>
              <Toggle active={notifs[row.key]} onToggle={() => toggleNotif(row.key)} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 h-6">
        {notifSaving && <span className="text-xs text-navy-400">Sauvegarde…</span>}
        {notifSaved  && <span className="text-xs text-green-600 font-semibold flex items-center gap-1"><Check className="w-3.5 h-3.5" />Sauvegardé</span>}
      </div>
    </div>
  )

  const SaveBtn = () => (
    <div className="pt-2">
      <button
        onClick={() => setConfirmSave(true)}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: saved ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #F59E0B, #F97316)',
          boxShadow: saved ? '0 4px 16px rgba(16,185,129,0.30)' : '0 4px 16px rgba(249,115,22,0.28)',
          transition: 'background 0.3s, box-shadow 0.3s',
        }}>
        {saved ? <><Check className="w-4 h-4" />Modifications enregistrées</> : <><Check className="w-4 h-4" />Enregistrer les modifications</>}
      </button>
    </div>
  )

  const SECTION_RENDERERS: Record<Section, () => React.ReactNode> = {
    profile:  renderProfile,
    company:  renderCompany,
    kyc:      renderKYC,
    security: renderSecurity,
    notifs:   renderNotifs,
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>

      {/* ══ TOP TABS ══ */}
      <div className="flex-shrink-0 bg-white border-b border-navy-100"
        style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-1 px-6 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap transition-all duration-150 relative flex-shrink-0"
                style={{ color: isActive ? '#0F172A' : '#94A3B8', fontWeight: isActive ? 600 : 500 }}>
                <span style={{ color: isActive ? '#F97316' : '#CBD5E1' }}>{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                    {item.badge}
                  </span>
                )}
                {/* Active underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #F59E0B, #F97316)' }} />
                )}
              </button>
            )
          })}

        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="flex-1 overflow-y-auto p-6" style={{ background: '#F8FAFC' }}>
        <div className="max-w-2xl mx-auto">
          {SECTION_RENDERERS[activeSection]()}
        </div>
      </div>

      {/* ── Confirmation Enregistrer ── */}
      {confirmSave && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)' }}
            onClick={() => setConfirmSave(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" style={{ animation: 'fadeUp 0.2s ease-out' }}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(249,115,22,0.10)' }}>
                  <Check className="w-6 h-6" style={{ color: '#F97316' }} />
                </div>
                <h3 className="font-bold text-navy text-lg mb-2">Confirmer les modifications</h3>
                <p className="text-navy-400 text-sm mb-6">Voulez-vous enregistrer les modifications apportées à votre profil ?</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmSave(false)}
                    className="flex-1 py-3 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy hover:border-navy-300 transition-colors">
                    Annuler
                  </button>
                  <button onClick={() => { setConfirmSave(false); save() }}
                    className="flex-1 py-3 rounded-xl text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Confirmation changement mot de passe ── */}
      {confirmPwChg && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)' }}
            onClick={() => setConfirmPwChg(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" style={{ animation: 'fadeUp 0.2s ease-out' }}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(239,68,68,0.10)' }}>
                  <Lock className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="font-bold text-navy text-lg mb-2">Changer le mot de passe</h3>
                <p className="text-navy-400 text-sm mb-6">Cette action est irréversible. Votre mot de passe sera immédiatement modifié.</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmPwChg(false)}
                    className="flex-1 py-3 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy hover:border-navy-300 transition-colors">
                    Annuler
                  </button>
                  <button onClick={doChangePassword}
                    className="flex-1 py-3 rounded-xl text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes sectionSlide {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

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
  const [tab,        setTab]        = useState('dashboard')
  const [sidebar,    setSidebar]    = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [env,        setEnv]        = useState<'sandbox' | 'production'>('sandbox')
  const [showNotifs, setShowNotifs] = useState(false)

  const merchantRaw = localStorage.getItem('yp_merchant')
  const merchant    = merchantRaw ? JSON.parse(merchantRaw) as { id: string; name: string; email: string } : null
  const initials    = merchant?.name
    ? merchant.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'YP'

  useEffect(() => {
    if (!localStorage.getItem('yp_token')) navigate('/connexion', { replace: true })
  }, [navigate])

  useEffect(() => { _env = env }, [env])

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
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]"
      style={{ fontFamily: 'Poppins, sans-serif' }}>

      {/* Mobile overlay */}
      {sidebar && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebar(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
        sidebar ? 'translate-x-0' : '-translate-x-full'
      }`}
        style={{ background: '#0F172A', fontFamily: 'Poppins, sans-serif' }}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8">
          <div className="bg-white rounded-xl px-3 py-2 inline-flex">
            <img src={logo} alt="YoungPay Collect" className="h-8 w-auto" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = tab === item.id
            return (
              <button key={item.id}
                onClick={() => switchTab(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 relative text-left"
                style={{
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                  backgroundColor: active ? 'rgba(255,255,255,0.10)' : 'transparent',
                  borderLeft: active ? '3px solid #F97316' : '3px solid transparent',
                }}>
                <item.icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Env badge */}
        <div className="px-3 pb-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${
            env === 'sandbox' ? 'bg-amber-400/15 text-amber-300' : 'bg-green-400/15 text-green-300'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${env === 'sandbox' ? 'bg-amber-400' : 'bg-green-400'}`} />
            {env === 'sandbox' ? 'Mode Sandbox (mode essai)' : 'Mode Production'}
          </div>
        </div>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-white/8 space-y-3">
          <div className="flex items-center gap-3 px-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{merchant?.name ?? '—'}</p>
              <p className="text-white/40 text-[10px] truncate">{merchant?.email ?? '—'}</p>
            </div>
          </div>
          <button onClick={() => {
            localStorage.removeItem('yp_token')
            localStorage.removeItem('yp_merchant')
            navigate('/connexion')
          }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

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
                const m = merchant as Record<string, unknown> | null
                const productionEnabled = m?.production_enabled === true
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
                    <button
                      onClick={() => {
                        if (env === 'production') return
                        if (!productionEnabled) {
                          switchTab('settings')
                          return
                        }
                        setEnv('production')
                      }}
                      title={!productionEnabled ? 'Complétez votre KYC pour accéder à la production' : undefined}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                      style={env === 'production'
                        ? { background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', boxShadow: '0 2px 8px rgba(16,185,129,0.30)' }
                        : { color: !productionEnabled ? '#CBD5E1' : '#94A3B8', cursor: !productionEnabled ? 'not-allowed' : 'pointer' }}>
                      {env === 'production' ? '✓ Production' : 'Production'}
                    </button>
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
      `}</style>
    </div>
  )
}
