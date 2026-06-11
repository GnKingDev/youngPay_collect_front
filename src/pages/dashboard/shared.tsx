import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard, ArrowLeftRight, Link2, Wallet, Code2,
  Headphones, UserCircle, Zap, TrendingUp, CheckCircle, ArrowRight,
  Clock, AlertCircle, Check,
} from 'lucide-react'

/* ─── API ─────────────────────────────────────────────── */
export let _env: 'sandbox' | 'production' = 'sandbox'

export function setSharedEnv(e: 'sandbox' | 'production') {
  _env = e
}

export const apiFetch = async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
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
  if (res.status === 401) {
    localStorage.removeItem('yp_token')
    localStorage.removeItem('yp_merchant')
    window.location.href = '/connexion'
    throw new Error('Session expirée')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? res.statusText)
  }
  return res.json()
}

/* ─── Helpers ─────────────────────────────────────────── */
export const fmt = (n: number) =>
  n.toLocaleString('fr-GN') + ' GNF'

export const fmtShort = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}

/* ─── Types ───────────────────────────────────────────── */
export type TxRow      = { id: string; client: string; phone: string; method: string; amount: number; status: string; date: string; dateISO: string }
export type RevRow     = { date: string; amount: number; dest: string; status: string; ref: string }
export type ProductRow = { id: string; name: string; category: string; price: number; unit: string; stock: number | null; sales: number }
export type InvoiceRow = { id: string; client: string; phone: string; items: { name: string; qty: number; price: number }[]; total: number; status: string; date: string; due: string }
export type BankAcc    = { id: string; bank_name: string; rib: string; label?: string }
export type PayMethod  = { id: string; code: string; label: string; color: string; bg_color: string }
export type LinkItem   = { id: string; title: string; amount: number; status: string; payments: number; created: string; methods: string[]; customFields: CField[] }
export type CFieldType = 'text' | 'number' | 'email' | 'tel' | 'select' | 'textarea' | 'date'
export type CField     = { id: string; label: string; type: CFieldType; options: string; required: boolean }

/* ─── Payment methods ─────────────────────────────────── */
export let _payMethods: PayMethod[] = []
fetch('/api/v1/payment-methods')
  .then(r => r.json())
  .then((d: { id: string; code: string; label: string; color: string; bg_color: string }[]) => {
    if (Array.isArray(d)) _payMethods = d.map(m => ({ ...m, id: m.code }))
  })
  .catch(() => {})

export const getMethod = (code: string): PayMethod =>
  _payMethods.find(m => m.code === code) ?? { id: code, code, label: code, color: '#94A3B8', bg_color: 'rgba(148,163,184,0.12)' }

export const useMethods = () => {
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

/* ─── Constants ───────────────────────────────────────── */
export const FIELD_TYPE_OPTS: { value: CFieldType; label: string; hint: string }[] = [
  { value: 'text',     label: 'Texte court',     hint: 'Ex: Nom complet' },
  { value: 'number',   label: 'Nombre',           hint: 'Ex: Quantité' },
  { value: 'email',    label: 'Email',            hint: 'Ex: Adresse email' },
  { value: 'tel',      label: 'Téléphone',        hint: 'Ex: Numéro de contact' },
  { value: 'select',   label: 'Liste déroulante', hint: 'Options séparées par des virgules' },
  { value: 'textarea', label: 'Texte long',       hint: 'Ex: Adresse de livraison' },
  { value: 'date',     label: 'Date',             hint: 'Ex: Date de rendez-vous' },
]
export const MAX_CUSTOM_FIELDS = 4

export const NAV = [
  { id: 'dashboard',     icon: LayoutDashboard, label: 'Tableau de bord' },
  { id: 'links',         icon: Link2,           label: 'Liens de paiement' },
  { id: 'direct',        icon: Zap,             label: 'Direct Collect' },
  { id: 'reversements',  icon: Wallet,          label: 'Reversements' },
  { id: 'transactions',  icon: ArrowLeftRight,  label: 'Transactions' },
  { id: 'developer',     icon: Code2,           label: 'Développeur' },
  { id: 'support',       icon: Headphones,      label: 'Support' },
  { id: 'settings',      icon: UserCircle,      label: 'Mon compte' },
]

/* ─── Error Dialog ────────────────────────────────────── */
export const ErrorDialog = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <>
    <div className="fixed inset-0 z-[70]" style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={onClose} />
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center" style={{ animation: 'fadeUp 0.2s ease-out', fontFamily: 'Poppins, sans-serif' }}>
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠</span>
        </div>
        <p className="font-bold text-navy mb-2">Erreur</p>
        <p className="text-navy-400 text-sm mb-5 leading-relaxed">{message}</p>
        <button onClick={onClose}
          className="w-full py-2.5 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy hover:border-navy-300 transition-colors">
          Fermer
        </button>
      </div>
    </div>
  </>
)

/* ─── Status badge ────────────────────────────────────── */
export const StatusBadge = ({ s }: { s: string }) => {
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
export const MethodBadge = ({ id }: { id: string }) => {
  const m = getMethod(id)
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold"
      style={{ backgroundColor: m.bg_color, color: m.color }}>
      {m.label}
    </span>
  )
}

/* ─── Stat Card ───────────────────────────────────────── */
export const StatCard = ({ icon, iconBg, iconColor, label, value, sub, badge }: {
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

/* ─── Invoice status map (shared between CatalogScreen & others) ── */
export const invStatMap: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  paid:    { label: 'Payée',      color: '#10B981', bg: 'rgba(16,185,129,0.10)',  icon: <CheckCircle className="w-3 h-3" /> },
  pending: { label: 'En attente', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  icon: <Clock       className="w-3 h-3" /> },
  overdue: { label: 'En retard',  color: '#EF4444', bg: 'rgba(239,68,68,0.10)',   icon: <AlertCircle className="w-3 h-3" /> },
}

/* ─── KYCBadge ────────────────────────────────────────── */
export const KYCBadge = ({ approved }: { approved: number }) =>
  approved === 3 ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-green-100 text-green-700 flex-shrink-0">
      <Check className="w-3.5 h-3.5" /> Vérifié · 3/3
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-600 flex-shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      {approved > 0 ? `Partiel · ${approved}/3` : 'Non vérifié · 0/3'} documents
    </span>
  )
