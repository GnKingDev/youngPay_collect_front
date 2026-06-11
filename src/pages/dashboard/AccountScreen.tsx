import React, { useState, useEffect } from 'react'
import {
  UserCircle, Building2, ShieldCheck, Lock, Bell, Key, Smartphone, Camera,
  CheckCircle, Check, Upload, AlertCircle, Clock, Zap, Tag, TrendingUp,
  Wallet, BarChart3, Megaphone,
} from 'lucide-react'
import { apiFetch, _env, ErrorDialog } from './shared'

/* ─── Toggle ──────────────────────────────────────────── */
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

/* ─── KYCDoc ──────────────────────────────────────────── */
const KYCDoc = ({
  title, subtitle, status, rejectionReason, uploading, onUpload, accept, formatHint,
}: {
  title: string; subtitle: string
  status: 'approved' | 'submitted' | 'missing' | 'rejected'
  rejectionReason?: string | null
  uploading?: boolean
  onUpload?: (f: File) => void
  accept?: string
  formatHint?: string
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
          <input ref={inputRef} type="file" accept={accept ?? '.jpg,.jpeg,.png,.pdf'} className="hidden"
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
                <p className="text-navy-400 text-[10px] mt-0.5 mb-2.5">{formatHint ?? 'JPG, PNG ou PDF · Max 5 Mo'}</p>
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

/* ─── ScreenAccount ───────────────────────────────────── */
const ScreenAccount = () => {
  type Section = 'profile' | 'company' | 'kyc' | 'security' | 'notifs'
  const [activeSection, setActiveSection] = useState<Section>('profile')
  const [saved,        setSaved]        = useState(false)
  const [twoFA,        setTwoFA]        = useState(false)
  const [showPwForm,   setShowPwForm]   = useState(false)
  const [phoneOtp,     setPhoneOtp]     = useState(true)
  const [phoneOtpSaving, setPhoneOtpSaving] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)
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
  const [profile, setProfile] = useState({
    firstName: '', lastName: '', email: '', phone: '', city: 'Conakry', country: 'Guinée',
  })
  const [company, setCompany] = useState({
    name: '', sector: '', address: '', rccm: '', email: '', website: '',
  })

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      setAccountError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du document')
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
    { id: 'kyc',      icon: <ShieldCheck className="w-4 h-4" />, label: 'Vérification KYC' },
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
          onUpload={f => handleKycUpload('id', f)}
          accept=".jpg,.jpeg,.pdf"
          formatHint="PDF ou JPG uniquement · Max 10 Mo" />
        <KYCDoc title="Registre de commerce (RCCM)" subtitle="Document officiel d'enregistrement de l'entreprise"
          status={kycDocs.rccm.status} rejectionReason={kycDocs.rccm.rejection_reason}
          uploading={uploadingDoc === 'rccm'}
          onUpload={f => handleKycUpload('rccm', f)}
          accept=".jpg,.jpeg,.png,.pdf"
          formatHint="JPG, PNG ou PDF · Max 5 Mo" />
        <KYCDoc title="Logo de l'entreprise" subtitle="Format PNG ou JPG, fond transparent recommandé"
          status={kycDocs.logo.status} rejectionReason={kycDocs.logo.rejection_reason}
          uploading={uploadingDoc === 'logo'}
          onUpload={f => handleKycUpload('logo', f)}
          accept=".jpg,.jpeg,.png"
          formatHint="JPG ou PNG · Max 2 Mo" />

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
        </div>
      </div>

      {/* OTP téléphone */}
      <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-navy-100">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: phoneOtp ? 'rgba(99,102,241,0.12)' : 'rgba(15,23,42,0.06)' }}>
            <Smartphone className="w-4 h-4" style={{ color: phoneOtp ? '#6366F1' : '#64748B' }} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-navy text-sm">OTP par téléphone (SMS)</h3>
            <p className="text-navy-400 text-xs mt-0.5">Recevoir le code OTP par SMS en plus de l'email</p>
          </div>
          <Toggle active={phoneOtp} onToggle={async () => {
            const next = !phoneOtp
            setPhoneOtp(next)
            setPhoneOtpSaving(true)
            try {
              await apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify({ phone_otp_enabled: next }) })
            } catch { /* ignore */ } finally { setPhoneOtpSaving(false) }
          }} />
        </div>
        <div className="px-6 py-4">
          {phoneOtp ? (
            <p className="text-navy-500 text-sm">
              Un SMS sera envoyé au <strong className="text-navy">{profile.phone || '—'}</strong> à chaque connexion.
              {phoneOtpSaving && <span className="ml-2 text-xs text-navy-400">Sauvegarde…</span>}
            </p>
          ) : (
            <p className="text-navy-400 text-sm">Activez cette option pour recevoir également votre code OTP par SMS.</p>
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
      {accountError && <ErrorDialog message={accountError} onClose={() => setAccountError(null)} />}
    </div>
  )
}

export default ScreenAccount
