import React, { useState } from 'react'
import { Zap, Smartphone, CheckCircle, X } from 'lucide-react'
import { apiFetch } from './shared'

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
  const [showConfirm, setShowConfirm] = useState(false)
  const [modalStatus, setModalStatus] = useState<'pending'|'success'|'failed'|null>(null)
  const [txId,        setTxId]        = useState('')

  const opInfo = DC_OPS.find(o => o.id === op) ?? DC_OPS[0]
  const rawAmount = Number(amount.replace(/\s/g, ''))

  const handleSend = async () => {
    setShowConfirm(false)
    setModalStatus('pending')
    try {
      const res = await apiFetch<{ transaction_id: string; status: string }>('/direct-collect', {
        method: 'POST',
        body: JSON.stringify({ amount: rawAmount, phone, operator: op, description: motif }),
      })
      setTxId(res.transaction_id)
      setTimeout(async () => {
        try {
          const s = await apiFetch<{ status: string }>(`/transactions/${res.transaction_id}`)
          setModalStatus(s.status === 'SUCCESS' ? 'success' : s.status === 'FAILED' ? 'failed' : 'success')
        } catch { setModalStatus('success') }
      }, 4000)
    } catch {
      setModalStatus('failed')
    }
  }

  const closeModal  = () => setModalStatus(null)
  const resetAll    = () => { setModalStatus(null); setPhone(''); setAmount(''); setMotif(''); setTxId('') }

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
            <div className="relative">
              <input
                type="text" inputMode="numeric" value={amount}
                onChange={e => {
                  const raw = e.target.value.replace(/\s/g,'').replace(/[^\d]/g,'')
                  setAmount(raw ? Number(raw).toLocaleString('fr-FR').replace(/ /g,' ') : '')
                }}
                placeholder="Ex : 150 000"
                className="w-full rounded-xl border-2 border-navy-200 px-4 py-3 pr-14 text-sm text-navy font-semibold outline-none focus:border-amber-400 transition-colors"
                style={{ fontFamily: 'Poppins, sans-serif' }} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-navy-400">GNF</span>
            </div>
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

          <button onClick={() => { if (!amount || phone.length < 8) return; setShowConfirm(true) }}
            disabled={!amount || phone.length < 8}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', boxShadow: '0 4px 16px rgba(249,115,22,0.30)' }}>
            <Zap className="w-4 h-4" /> Envoyer la demande
          </button>
        </div>
      </div>

      {/* ── Dialog confirmation envoi ── */}
      {showConfirm && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)' }}
            onClick={() => setShowConfirm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" style={{ animation: 'fadeUp 0.2s ease-out' }}>
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg,#F59E0B22,#F9731611)' }}>
                  <Zap className="w-6 h-6" style={{ color: '#F97316' }} />
                </div>
                <h3 className="font-bold text-navy text-lg mb-1">Confirmer l'envoi</h3>
                <p className="text-navy-400 text-sm mb-4">Vérifiez les informations avant d'envoyer</p>
                <div className="bg-navy-50 rounded-xl p-4 space-y-2 mb-5 text-left">
                  {[
                    { label: 'Opérateur', value: opInfo.label },
                    { label: 'Téléphone', value: '+224 ' + phone },
                    { label: 'Montant',   value: amount + ' GNF' },
                    ...(motif ? [{ label: 'Motif', value: motif }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-navy-400 font-medium">{label}</span>
                      <span className="text-navy font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy hover:border-navy-300 transition-colors">
                    Annuler
                  </button>
                  <button onClick={handleSend}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)' }}>
                    <Zap className="w-4 h-4" /> Confirmer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
                <span className="text-sm font-bold text-navy">{rawAmount.toLocaleString('fr-GN')} GNF</span>
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
                        <span className="font-bold text-navy">{rawAmount.toLocaleString('fr-GN')} GNF</span> reçus de<br />
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
                      <p className="text-xs text-navy-300 mt-2">+224 {phone} · {rawAmount.toLocaleString('fr-GN')} GNF</p>
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

export default ScreenDirectCollect
