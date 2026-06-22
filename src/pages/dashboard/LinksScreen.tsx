import React, { useState, useEffect } from 'react'
import { Link2, X, Plus, ChevronDown, Check, Copy, Share2, Ban, Eye, Edit3, Send } from 'lucide-react'
import {
  apiFetch, fmt, _env, useMethods, MethodBadge, StatusBadge,
  FIELD_TYPE_OPTS, MAX_CUSTOM_FIELDS,
} from './shared'
import type { LinkItem, CField, CFieldType } from './shared'

const ScreenLinks = () => {
  const allMethods = useMethods()

  // Sélectionner toutes les méthodes dès qu'elles sont chargées
  useEffect(() => {
    if (allMethods.length > 0 && methods.length === 0) {
      setMethods(allMethods.map(m => m.code))
    }
  }, [allMethods])

  const [shareStep,    setShareStep]    = useState<null | 'sms' | 'email'>(null)
  const [shareInput,   setShareInput]   = useState('')
  const [shareSending, setShareSending] = useState(false)
  const [shareDone,    setShareDone]    = useState(false)
  const [shareLinkId,  setShareLinkId]  = useState<string>('')
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
  const [totalLinks,      setTotalLinks]      = useState(0)
  const [selectedLink,    setSelectedLink]    = useState<LinkItem | null>(null)
  const [editFields,      setEditFields]      = useState<CField[]>([])

  const getPayUrl = (linkId: string) => `https://youngpaycollect.com/pay/${linkId}`

  const LINKS_PAGE_SIZE = 5

  useEffect(() => {
    apiFetch<{ data: Record<string, unknown>[]; total: number }>(
      `/payment-links?page=${page}&limit=${LINKS_PAGE_SIZE}`
    ).then(r => {
      setTotalLinks(r.total ?? 0)
      setLinksData((r.data ?? []).map(l => ({
        id:           l.id as string,
        title:        l.title as string,
        amount:       Number(l.amount) || 0,
        status:       l.status as string,
        payments:     Number(l.payments_count) || 0,
        created:      new Date(l.created_at as string).toLocaleDateString('fr-GN'),
        methods:      (l.methods as string[]) || [],
        customFields: [],
      })))
    }).catch(() => {})
  }, [page])

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
      // Recharger la page 1 depuis le backend
      setPage(1)
    } catch {
      setShowConfirm(false)
    }
  }

  const handleCopy = (id: string, link: string) => {
    navigator.clipboard.writeText(link).catch(() => {})
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
          Créer un lien de paiement
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
                                setAmount(raw ? Number(raw).toLocaleString('fr-FR').replace(/ /g, ' ') : '')
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
                            <option value="1x">Une seule fois</option>
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
                    <p className="text-navy-400 text-sm">{title} — {Number(amount.replace(/\s/g,'')).toLocaleString('fr-GN')} GNF</p>
                  </div>
                  <div className="flex items-center justify-between bg-navy-50 rounded-xl px-4 py-3 border border-navy-200 mb-4">
                    <div className="flex items-center gap-2 min-w-0">
                      {_env === 'sandbox' && (
                        <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(245,158,11,0.15)', color: '#D97706' }}>
                          Sandbox
                        </span>
                      )}
                      <span className="text-navy text-xs font-medium truncate">{generatedLink}</span>
                    </div>
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
        const totalPages = Math.max(1, Math.ceil(totalLinks / LINKS_PAGE_SIZE))
        return (
          <>
            <div className="space-y-3">
              {linksData.map(link => (
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
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setSelectedLink(link)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                      style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.22)', color: '#F97316' }}>
                      <Eye className="w-3.5 h-3.5" /> Détail
                    </button>
                    <button onClick={() => handleCopy(link.id, getPayUrl(link.id))}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-navy-200 text-xs font-semibold text-navy hover:border-amber-400 transition-colors">
                      {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === link.id ? 'Copié' : 'Copier'}
                    </button>
                    <button onClick={() => { setShareLink(getPayUrl(link.id)); setShareLinkId(link.id); setShareStep(null); setShareDone(false); setShareInput(''); setShowShareModal(true) }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-navy-200 text-xs font-semibold text-navy hover:border-amber-400 transition-colors">
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
                  Liens <span className="font-semibold text-navy">{totalLinks === 0 ? 0 : (page - 1) * LINKS_PAGE_SIZE + 1}–{Math.min(page * LINKS_PAGE_SIZE, totalLinks)}</span> sur <span className="font-semibold text-navy">{totalLinks}</span>
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
                ].map((row, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-navy-100' : ''}`}>
                    <span className="text-xs text-navy-400 font-medium">{row.label}</span>
                    <span className="text-xs font-semibold text-navy text-right max-w-[200px] truncate">{row.value}</span>
                  </div>
                ))}
                {/* Ligne Lien avec badge sandbox */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-navy-100">
                  <span className="text-xs text-navy-400 font-medium">Lien</span>
                  <div className="flex items-center gap-2 min-w-0">
                    {_env === 'sandbox' && (
                      <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#D97706' }}>
                        Sandbox
                      </span>
                    )}
                    <span className="text-xs font-semibold text-navy truncate max-w-[160px]">{getPayUrl(selectedLink.id)}</span>
                  </div>
                </div>
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
                <button onClick={() => handleCopy(selectedLink.id, getPayUrl(selectedLink.id))}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy hover:border-amber-400 transition-colors">
                  {copiedId === selectedLink.id ? <><Check className="w-4 h-4 text-green-500" />Lien copié !</> : <><Copy className="w-4 h-4" />Copier le lien</>}
                </button>
                <button onClick={() => { setShareLink(getPayUrl(selectedLink.id)); setShareLinkId(selectedLink.id); setShareStep(null); setShareDone(false); setShareInput(''); setShowShareModal(true) }}
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
                    { label: 'Expiration', value: expiry === 'inf' ? 'Sans limite' : expiry === '1x' ? 'Une seule fois' : expiry },
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
            onClick={() => { setShowShareModal(false); setShareStep(null); setShareInput(''); setShareDone(false) }} />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" style={{ animation: 'fadeUp 0.2s ease-out' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-navy-100">
                <div className="flex items-center gap-2">
                  {shareStep && (
                    <button onClick={() => { setShareStep(null); setShareInput(''); setShareDone(false) }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-navy-400 hover:bg-navy-100 transition-colors text-lg font-bold">
                      ‹
                    </button>
                  )}
                  <h3 className="font-bold text-navy">
                    {shareStep === 'sms' ? 'Envoyer par SMS' : shareStep === 'email' ? 'Envoyer par Email' : 'Partager le lien'}
                  </h3>
                </div>
                <button onClick={() => { setShowShareModal(false); setShareStep(null); setShareInput(''); setShareDone(false) }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-navy-400 hover:bg-navy-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                {/* URL du lien */}
                <div className="bg-navy-50 rounded-xl p-3 mb-4">
                  <span className="text-xs text-navy-500 font-mono break-all">{shareLink}</span>
                </div>

                {!shareStep ? (
                  <div className="space-y-2">
                    <button onClick={() => { navigator.clipboard.writeText(shareLink).catch(()=>{}); setShowShareModal(false) }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-navy-200 hover:border-amber-400 transition-colors text-sm font-semibold text-navy">
                      <Copy className="w-4 h-4 text-navy-400" /> Copier le lien
                    </button>
                    <a href={`https://wa.me/?text=${encodeURIComponent('Payez via YoungPay Collect :\n' + shareLink)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors text-sm font-semibold"
                      style={{ borderColor: '#25D36620', background: '#25D36608', color: '#128C7E' }}>
                      <span className="text-xl leading-none">📱</span> Partager via WhatsApp
                    </a>
                    <button onClick={() => { setShareStep('sms'); setShareDone(false); setShareInput('') }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-navy-200 hover:border-amber-400 transition-colors text-sm font-semibold text-navy">
                      <span className="text-xl leading-none">💬</span> Envoyer par SMS
                    </button>
                    <button onClick={() => { setShareStep('email'); setShareDone(false); setShareInput('') }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-navy-200 hover:border-amber-400 transition-colors text-sm font-semibold text-navy">
                      <span className="text-xl leading-none">✉️</span> Envoyer par Email
                    </button>
                  </div>
                ) : shareDone ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="font-bold text-navy text-base mb-1">Envoyé !</p>
                    <p className="text-navy-400 text-sm">Le lien a été envoyé avec succès.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type={shareStep === 'email' ? 'email' : 'tel'}
                      value={shareInput}
                      onChange={e => setShareInput(e.target.value)}
                      placeholder={shareStep === 'email' ? 'Adresse email du destinataire' : 'Numéro de téléphone (+224...)'}
                      className="w-full rounded-xl border-2 border-navy-200 px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                      autoFocus
                    />
                    <button
                      disabled={!shareInput || shareSending}
                      onClick={async () => {
                        if (!shareInput || !shareLinkId) return
                        setShareSending(true)
                        try {
                          await apiFetch(`/payment-links/${shareLinkId}/share`, {
                            method: 'POST',
                            body: JSON.stringify({ via: shareStep, recipient: shareInput }),
                          })
                          setShareDone(true)
                        } catch {
                          // on reste sur le formulaire
                        } finally {
                          setShareSending(false)
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', boxShadow: '0 4px 16px rgba(249,115,22,0.30)' }}>
                      {shareSending
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <Send className="w-4 h-4" />}
                      {shareSending ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  )
}

export default ScreenLinks
