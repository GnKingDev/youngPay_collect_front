import React, { useState, useEffect } from 'react'
import { Search, FileSpreadsheet, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiFetch, fmt, _env, MethodBadge, StatusBadge, useMethods } from './shared'
import type { TxRow } from './shared'

const ScreenTransactions = () => {
  const [search,   setSearch]   = useState('')
  const [method,   setMethod]   = useState('')
  const [status,   setStatus]   = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')
  const [page,     setPage]     = useState(1)
  const [selAll,   setSelAll]   = useState(false)
  const [txData,   setTxData]   = useState<TxRow[]>([])
  const [total,    setTotal]    = useState(0)
  const [pages,    setPages]    = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const methods = useMethods()
  const [selected, setSelected] = useState<string[]>([])
  const PER = 5

  // Debounce search — évite un appel API à chaque frappe
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  // Fetch backend à chaque changement de page ou filtre
  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(PER) })
    if (debouncedSearch) params.set('search',    debouncedSearch)
    if (method)          params.set('operator',  method)
    if (status)          params.set('status',    status.toUpperCase())
    if (dateFrom)        params.set('date_from', dateFrom)
    if (dateTo)          params.set('date_to',   dateTo)

    apiFetch<{ data: Record<string, unknown>[]; total: number; pages: number }>(
      `/transactions?${params.toString()}`
    ).then(r => {
      setTotal(r.total ?? 0)
      setPages(r.pages ?? 1)
      setTxData((r.data ?? []).map(tx => ({
        id:      tx.id as string,
        client:  (tx.description as string) || '—',
        phone:   (tx.phone as string) || '—',
        method:  tx.operator as string,
        amount:  Number(tx.amount),
        status:  (tx.status as string).toLowerCase(),
        date:    new Date(tx.created_at as string).toLocaleString('fr-GN'),
        dateISO: (tx.created_at as string).slice(0, 10),
      })))
      setSelAll(false)
      setSelected([])
    }).catch(() => {})
  }, [page, debouncedSearch, method, status, dateFrom, dateTo])

  const hasFilters = search || method || status || dateFrom || dateTo

  const toggleRow = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  function resetFilters() {
    setSearch(''); setMethod(''); setStatus(''); setDateFrom(''); setDateTo(''); setPage(1)
  }

  async function exportIds(ids: string[]) {
    const token = localStorage.getItem('yp_token') || ''
    const url   = `/api/v1/transactions/export?env=${_env}&ids=${ids.join(',')}`
    const res   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return
    const blob  = await res.blob()
    const href  = URL.createObjectURL(blob)
    const a     = document.createElement('a')
    a.href      = href
    a.download  = `transactions_selection_${new Date().toISOString().slice(0,10)}.xlsx`
    a.click()
    URL.revokeObjectURL(href)
  }

  return (
    <div className="p-6 space-y-5">

      {/* Barre de sélection contextuelle */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 rounded-2xl border border-amber-200"
          style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', animation: 'fadeUp 0.2s ease-out' }}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)' }}>
              <span className="text-white text-xs font-bold">{selected.length}</span>
            </div>
            <span className="text-sm font-semibold text-navy">
              {selected.length} transaction{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => exportIds(selected)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all"
              style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', boxShadow: '0 4px 12px rgba(249,115,22,0.30)' }}>
              <FileSpreadsheet className="w-3.5 h-3.5" /> Exporter la sélection
            </button>
            <button onClick={() => { setSelected([]); setSelAll(false) }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-navy-500 border border-navy-200 hover:border-amber-400 transition-colors">
              Désélectionner
            </button>
          </div>
        </div>
      )}

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
          <button
            onClick={async () => {
              const params = new URLSearchParams()
              if (debouncedSearch) params.set('search',    debouncedSearch)
              if (method)          params.set('operator',  method)
              if (status)          params.set('status',    status.toUpperCase())
              if (dateFrom)        params.set('date_from', dateFrom)
              if (dateTo)          params.set('date_to',   dateTo)
              const token = localStorage.getItem('yp_token') || ''
              const qs    = params.toString()
              const url   = `/api/v1/transactions/export?env=${_env}${qs ? '&' + qs : ''}`
              const res   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
              if (!res.ok) return
              const blob  = await res.blob()
              const href  = URL.createObjectURL(blob)
              const a     = document.createElement('a')
              a.href      = href
              a.download  = `transactions_${new Date().toISOString().slice(0,10)}.xlsx`
              a.click()
              URL.revokeObjectURL(href)
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-navy-200 text-sm font-semibold text-navy bg-white hover:border-amber-400 transition-colors">
            <FileSpreadsheet className="w-4 h-4 text-green-600" /> Exporter Excel
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
                    onChange={e => { setSelAll(e.target.checked); setSelected(e.target.checked ? txData.map(r => r.id) : []) }}
                    className="rounded" />
                </th>
                {['ID Transaction','Client','Méthode','Montant GNF','Frais (1.2%)','Net reçu','Statut','Date & Heure'].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 font-semibold text-navy-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txData.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-navy-400 text-sm">Aucune transaction trouvée</td></tr>
              ) : txData.map(tx => {
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
            Affichage {total === 0 ? 0 : (page - 1) * PER + 1}–{Math.min(page * PER, total)} sur {total} transaction{total > 1 ? 's' : ''}
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

export default ScreenTransactions
