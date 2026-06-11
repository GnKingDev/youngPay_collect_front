import React, { useState, useEffect } from 'react'
import { Plus, Wallet, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { apiFetch, fmt, fmtShort, StatCard, MethodBadge, StatusBadge } from './shared'
import type { TxRow } from './shared'

const ScreenDashboard = ({ setTab }: { setTab: (t: string) => void }) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
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

export default ScreenDashboard
