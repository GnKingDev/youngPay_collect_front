import React, { useState, useEffect } from 'react'
import { Wallet, Plus, X, Check, Trash2 } from 'lucide-react'
import { apiFetch, fmt, _env, StatusBadge, ErrorDialog } from './shared'
import type { RevRow, BankAcc } from './shared'

const ScreenReversements = () => {
  const [revAmount,        setRevAmount]        = useState('')
  const [selectedBankId,   setSelectedBankId]   = useState('')
  const [loading,          setLoading]          = useState(false)
  const [done,             setDone]             = useState(false)
  const [reversementsData, setReversementsData] = useState<RevRow[]>([])
  const [solde,            setSolde]            = useState<number | null>(null)
  const [bankAccounts,     setBankAccounts]     = useState<BankAcc[]>([])
  const [revError,         setRevError]         = useState<string | null>(null)
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
      setRevError(err instanceof Error ? err.message : 'Erreur lors de la demande')
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
      setRevError(err instanceof Error ? err.message : "Erreur")
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
      {revError && <ErrorDialog message={revError} onClose={() => setRevError(null)} />}
    </div>
  )
}

export default ScreenReversements
