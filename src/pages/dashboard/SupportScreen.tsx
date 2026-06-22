import React, { useState, useEffect, useRef } from 'react'
import { Check, Send, ChevronLeft, MessageCircle, Clock, CheckCircle, XCircle, Plus } from 'lucide-react'
import { apiFetch } from './shared'

type Priority = 'low' | 'medium' | 'high'
type TicketStatus = 'open' | 'closed'

interface Ticket {
  id:           string
  subject:      string
  category:     string | null
  priority:     Priority
  status:       TicketStatus
  unread_count: number
  created_at:   string
}

interface Message {
  id:         string
  ticket_id:  string
  from:       'merchant' | 'agent'
  text:       string
  read:       boolean
  created_at: string
}

const CATEGORIES = ['Problème de paiement', 'Reversement', 'Intégration API', 'Compte & KYC', 'Autre']

const PRIORITY_MAP: Record<Priority, { label: string; color: string; bg: string }> = {
  low:    { label: 'Faible',  color: '#10B981', bg: 'rgba(16,185,129,0.10)'  },
  medium: { label: 'Normale', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)'  },
  high:   { label: 'Urgente', color: '#EF4444', bg: 'rgba(239,68,68,0.10)'   },
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const p = PRIORITY_MAP[priority]
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ color: p.color, background: p.bg }}>
      {p.label}
    </span>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'À l\'instant'
  if (m < 60) return `Il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Il y a ${h}h`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

// ── Vue : liste des tickets ──────────────────────────────────────────────────
function TicketList({ onNew, onOpen }: { onNew: () => void; onOpen: (t: Ticket) => void }) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<Ticket[]>('/support/tickets')
      .then(r => setTickets(Array.isArray(r) ? r : []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-navy text-xl mb-1">Support</h2>
          <p className="text-navy-400 text-sm">Notre équipe répond sous 24h ouvrées.</p>
        </div>
        <button onClick={onNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all"
          style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', boxShadow: '0 4px 12px rgba(249,115,22,0.30)' }}>
          <Plus className="w-4 h-4" /> Nouveau ticket
        </button>
      </div>

      {/* Contacts */}
      <div className="bg-white rounded-2xl border border-navy-100 p-5"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-4">Nos coordonnées</p>
        <div className="flex flex-wrap gap-5">
          {[
            { icon: '✉️', label: 'Email support',  value: 'support@youngpaycollect.com' },
            { icon: '📞', label: 'Téléphone',       value: '+224 620 000 000'           },
            { icon: '⏰', label: 'Disponibilité',   value: 'Lun–Ven · 8h–18h'          },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(249,115,22,0.10)' }}>
                <span className="text-base">{c.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-navy-400 uppercase tracking-wide">{c.label}</p>
                <p className="text-sm font-semibold text-navy">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des tickets */}
      <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="px-5 py-4 border-b border-navy-100 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-navy-400" />
          <span className="font-semibold text-navy text-sm">Mes tickets</span>
          {tickets.length > 0 && (
            <span className="ml-auto text-xs text-navy-400">{tickets.length} ticket{tickets.length > 1 ? 's' : ''}</span>
          )}
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center text-navy-400 text-sm">
            Aucun ticket — cliquez sur "Nouveau ticket" pour commencer
          </div>
        ) : (
          <div className="divide-y divide-navy-100">
            {tickets.map(t => (
              <button key={t.id} onClick={() => onOpen(t)}
                className="w-full text-left px-5 py-4 hover:bg-[#F8FAFC] transition-colors flex items-start gap-4">
                {/* Icône statut */}
                <div className="mt-0.5 flex-shrink-0">
                  {t.status === 'open'
                    ? <Clock className="w-5 h-5 text-amber-500" />
                    : <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-navy text-sm truncate">{t.subject}</span>
                    {t.unread_count > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                        style={{ background: '#F97316' }}>{t.unread_count}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {t.category && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{t.category}</span>
                    )}
                    <PriorityBadge priority={t.priority} />
                    <span className="text-[10px] text-navy-400">{timeAgo(t.created_at)}</span>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-navy-300 rotate-180 flex-shrink-0 mt-1" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Vue : nouveau ticket ─────────────────────────────────────────────────────
function NewTicket({ onBack, onCreated }: { onBack: () => void; onCreated: (ref: string) => void }) {
  const [subject,  setSubject]  = useState('')
  const [category, setCategory] = useState('')
  const [message,  setMessage]  = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim() || !category) return
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch<{ id: string }>('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject, category, message, priority }),
      })
      onCreated(res.id)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl border border-navy-200 flex items-center justify-center hover:border-amber-400 transition-colors">
          <ChevronLeft className="w-4 h-4 text-navy" />
        </button>
        <div>
          <h2 className="font-bold text-navy text-xl">Nouveau ticket</h2>
          <p className="text-navy-400 text-sm">Notre équipe répond sous 24h ouvrées.</p>
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
            {(Object.entries(PRIORITY_MAP) as [Priority, typeof PRIORITY_MAP[Priority]][]).map(([v, p]) => (
              <button key={v} onClick={() => setPriority(v)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all"
                style={{
                  borderColor: priority === v ? p.color : '#E2E8F0',
                  background:  priority === v ? p.color + '15' : '#FAFAFA',
                  color:       priority === v ? p.color : '#94A3B8',
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

        {error && (
          <p className="text-red-500 text-xs flex items-center gap-1.5">
            <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </p>
        )}

        <button onClick={handleSubmit}
          disabled={loading || !subject.trim() || !message.trim() || !category}
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

// ── Vue : confirmation après création ────────────────────────────────────────
function TicketSent({ ticketRef, onBack }: { ticketRef: string; onBack: () => void }) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'linear-gradient(135deg,#10B981,#34D399)', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
        <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
      </div>
      <h2 className="font-bold text-navy text-xl mb-2">Ticket soumis !</h2>
      <p className="text-navy-400 text-sm mb-1">Référence : <span className="font-mono font-semibold text-navy">{ticketRef}</span></p>
      <p className="text-navy-400 text-sm mb-6 max-w-xs">Notre équipe vous répondra par email dans les 24h ouvrées.</p>
      <button onClick={onBack}
        className="px-6 py-2.5 rounded-xl text-sm font-semibold border-2 border-navy-200 text-navy hover:border-amber-400 transition-colors">
        Voir mes tickets
      </button>
    </div>
  )
}

// ── Vue : fil de messages d'un ticket ───────────────────────────────────────
function TicketDetail({ ticket, onBack }: { ticket: Ticket; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text,     setText]     = useState('')
  const [sending,  setSending]  = useState(false)
  const [closing,  setClosing]  = useState(false)
  const [status,   setStatus]   = useState<TicketStatus>(ticket.status)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    apiFetch<Message[]>(`/support/tickets/${ticket.id}/messages`)
      .then(r => setMessages(Array.isArray(r) ? r : []))
      .catch(() => {})
  }, [ticket.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const msg = await apiFetch<Message>(`/support/tickets/${ticket.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
      setMessages(prev => [...prev, msg])
      setText('')
    } catch { /* ignore */ }
    finally { setSending(false) }
  }

  const toggleClose = async () => {
    setClosing(true)
    try {
      await apiFetch(`/support/tickets/${ticket.id}/close`, { method: 'POST' })
      setStatus(s => s === 'open' ? 'closed' : 'open')
    } catch { /* ignore */ }
    finally { setClosing(false) }
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={onBack}
          className="w-9 h-9 rounded-xl border border-navy-200 flex items-center justify-center hover:border-amber-400 transition-colors flex-shrink-0 mt-0.5">
          <ChevronLeft className="w-4 h-4 text-navy" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-navy text-base truncate">{ticket.subject}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {ticket.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">{ticket.category}</span>
            )}
            <PriorityBadge priority={ticket.priority} />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              status === 'open' ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50'
            }`}>
              {status === 'open' ? 'Ouvert' : 'Fermé'}
            </span>
          </div>
        </div>
        <button onClick={toggleClose} disabled={closing}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-50"
          style={status === 'open'
            ? { borderColor: '#FCA5A5', color: '#EF4444', background: '#FEF2F2' }
            : { borderColor: '#6EE7B7', color: '#059669', background: '#F0FDF4' }}>
          {status === 'open' ? <><XCircle className="w-3.5 h-3.5" />Fermer</> : <><CheckCircle className="w-3.5 h-3.5" />Rouvrir</>}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white rounded-2xl border border-navy-100 overflow-hidden flex flex-col"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)', minHeight: 320 }}>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-navy-400 text-sm py-8">Aucun message</p>
          )}
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.from === 'merchant' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={m.from === 'merchant'
                  ? { background: 'linear-gradient(135deg,#F59E0B,#F97316)', color: '#fff', borderBottomRightRadius: 4 }
                  : { background: '#F1F5F9', color: '#0F172A', borderBottomLeftRadius: 4 }}>
                {m.text}
                <p className={`text-[10px] mt-1 ${m.from === 'merchant' ? 'text-white/60 text-right' : 'text-slate-400'}`}>
                  {timeAgo(m.created_at)}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {status === 'open' && (
          <div className="border-t border-navy-100 p-4 flex gap-3 items-end">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Votre message… (Entrée pour envoyer)"
              rows={2}
              className="flex-1 rounded-xl border border-navy-200 px-3 py-2.5 text-sm text-navy outline-none focus:border-amber-400 transition-colors resize-none"
              style={{ fontFamily: 'Poppins, sans-serif' }} />
            <button onClick={sendMessage} disabled={!text.trim() || sending}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)' }}>
              {sending
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Send className="w-4 h-4" />}
            </button>
          </div>
        )}
        {status === 'closed' && (
          <div className="border-t border-navy-100 px-5 py-3 text-center text-xs text-navy-400">
            Ce ticket est fermé — rouvrez-le pour envoyer un message
          </div>
        )}
      </div>
    </div>
  )
}

// ── Composant principal ──────────────────────────────────────────────────────
type View = 'list' | 'new' | 'sent' | 'detail'

const ScreenSupport = () => {
  const [view,       setView]       = useState<View>('list')
  const [ticketRef,  setTicketRef]  = useState('')
  const [openTicket, setOpenTicket] = useState<Ticket | null>(null)
  const [listKey,    setListKey]    = useState(0)

  return (
    <>
      {view === 'list' && (
        <TicketList
          key={listKey}
          onNew={() => setView('new')}
          onOpen={t => { setOpenTicket(t); setView('detail') }}
        />
      )}
      {view === 'new' && (
        <NewTicket
          onBack={() => setView('list')}
          onCreated={ref => { setTicketRef(ref); setView('sent') }}
        />
      )}
      {view === 'sent' && (
        <TicketSent
          ticketRef={ticketRef}
          onBack={() => { setListKey(k => k + 1); setView('list') }}
        />
      )}
      {view === 'detail' && openTicket && (
        <TicketDetail
          ticket={openTicket}
          onBack={() => { setListKey(k => k + 1); setView('list') }}
        />
      )}
    </>
  )
}

export default ScreenSupport
