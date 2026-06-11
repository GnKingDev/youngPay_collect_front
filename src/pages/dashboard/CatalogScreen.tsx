import React, { useState, useEffect } from 'react'
import {
  Package, Receipt, CheckSquare, Clock, ShoppingBag, Plus, Tag, Trash2, Edit3,
  TrendingUp, Send, Link2, Download, Check, ClipboardList,
} from 'lucide-react'
import { apiFetch, fmt, fmtShort, ErrorDialog, invStatMap } from './shared'
import type { ProductRow, InvoiceRow } from './shared'

const ScreenCatalog = () => {
  const [subTab, setSubTab]           = useState<'products' | 'invoices'>('products')
  const [products, setProducts]       = useState<ProductRow[]>([])
  const [invoices, setInvoices]       = useState<InvoiceRow[]>([])
  const [catError, setCatError]       = useState<string | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [copiedInv, setCopiedInv]     = useState<string | null>(null)
  const [newProduct, setNewProduct]   = useState({ name: '', category: 'Service', price: '', unit: 'unité', description: '' })
  const [newInvoice, setNewInvoice]   = useState({ client: '', phone: '', due: '', items: [{ productId: '', qty: 1 }] })
  const [savedProduct, setSavedProduct] = useState(false)
  const [savedInvoice, setSavedInvoice] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiFetch<ProductRow[]>('/products')
      .then(d => { if (Array.isArray(d)) setProducts(d.map(p => ({ ...p, sales: (p as any).sales ?? 0 }))) })
      .catch(() => {})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiFetch<any[]>('/invoices')
      .then(d => {
        if (!Array.isArray(d)) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setInvoices(d.map((inv: any) => ({
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

  const copyPayLink = (id: string) => {
    navigator.clipboard.writeText(`pay.youngpaycollect.com/facture/${id.toLowerCase()}`).catch(() => {})
    setCopiedInv(id)
    setTimeout(() => setCopiedInv(null), 2000)
  }

  const saveProduct = async () => {
    if (!newProduct.name || !newProduct.price) return
    setSavedProduct(false)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      setCatError(err instanceof Error ? err.message : "Erreur")
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
      if (items.length === 0) { setCatError("Ajoutez au moins un article"); return }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      setCatError(err instanceof Error ? err.message : "Erreur")
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
      {catError && <ErrorDialog message={catError} onClose={() => setCatError(null)} />}
    </div>
  )
}

export default ScreenCatalog
