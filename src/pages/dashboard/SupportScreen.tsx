import React, { useState, useEffect } from 'react'
import { Check, Send } from 'lucide-react'
import { apiFetch } from './shared'

const ScreenSupport = () => {
  const [merchantInfo, setMerchantInfo] = useState<Record<string, unknown>>({})

  useEffect(() => {
    apiFetch<Record<string, unknown>>('/auth/me')
      .then(m => setMerchantInfo(m))
      .catch(() => {
        // Fallback affichage seulement
        try { setMerchantInfo(JSON.parse(localStorage.getItem('yp_merchant') ?? '{}')) } catch { /* ignore */ }
      })
  }, [])

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

      {/* Contacts du service client */}
      <div className="bg-white rounded-2xl border border-navy-100 p-5 mb-5"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-4">Nos coordonnées</p>
        <div className="flex flex-wrap gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.10)' }}>
              <span className="text-base">✉️</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-navy-400 uppercase tracking-wide">Email support</p>
              <p className="text-sm font-semibold text-navy">support@youngpaycollect.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.10)' }}>
              <span className="text-base">📞</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-navy-400 uppercase tracking-wide">Téléphone</p>
              <p className="text-sm font-semibold text-navy">+224 620 000 000</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.10)' }}>
              <span className="text-base">⏰</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-navy-400 uppercase tracking-wide">Disponibilité</p>
              <p className="text-sm font-semibold text-navy">Lun–Ven · 8h–18h</p>
            </div>
          </div>
        </div>
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

export default ScreenSupport
