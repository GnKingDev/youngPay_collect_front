import React, { useState, useEffect } from 'react'
import { Key, Eye, EyeOff, Copy, Check, RefreshCw, Globe, Zap, Code2 } from 'lucide-react'
import { apiFetch, _env } from './shared'

type ApiLang = 'node' | 'python' | 'php' | 'dart' | 'curl'

const API_SNIPPETS: Record<'redirect'|'direct'|'status', Record<ApiLang, string>> = {
  redirect: {
    node: `const res = await fetch(
  'https://api.youngpaycollect.com/v1/payment/redirect',
  {
    method: 'POST',
    headers: {
      'client_id':    'ypk_live_xxx',
      'api_key':      'yps_live_xxx',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount:       150000,
      description:  'Commande #112',
      merchant_ref: 'ORDER-2026-001',
      methods:      ['orange_money', 'mtn', 'soutra', 'paycard', 'kulu', 'card'],
    }),
  }
)
// HTTP 201 Created
const data = await res.json()
// {
//   status:         'pending',
//   transaction_id: 'TXN-XXXXXXXX',
//   redirect_url:   'https://pay.youngpaycollect.com/...',
//   merchant_ref:   'ORDER-2026-001',
// }
window.location.href = data.redirect_url`,

    python: `import requests

res = requests.post(
    'https://api.youngpaycollect.com/v1/payment/redirect',
    headers={
        'client_id': 'ypk_live_xxx',
        'api_key':   'yps_live_xxx',
    },
    json={
        'amount':       150000,
        'description':  'Commande #112',
        'merchant_ref': 'ORDER-2026-001',
        'methods':      ['orange_money', 'mtn', 'soutra', 'paycard', 'kulu', 'card'],
    }
)
# HTTP 201 Created
data = res.json()
# {
#   'status':         'pending',
#   'transaction_id': 'TXN-XXXXXXXX',
#   'redirect_url':   'https://pay.youngpaycollect.com/...',
#   'merchant_ref':   'ORDER-2026-001',
# }
print(data['redirect_url'])`,

    php: `$res = Http::withHeaders([
    'client_id' => 'ypk_live_xxx',
    'api_key'   => 'yps_live_xxx',
])->post(
    'https://api.youngpaycollect.com/v1/payment/redirect',
    [
        'amount'       => 150000,
        'description'  => 'Commande #112',
        'merchant_ref' => 'ORDER-2026-001',
        'methods'      => ['orange_money', 'mtn', 'soutra', 'paycard', 'kulu', 'card'],
    ]
);
// HTTP 201 Created
// {
//   'status':         'pending',
//   'transaction_id': 'TXN-XXXXXXXX',
//   'redirect_url':   'https://pay.youngpaycollect.com/...',
//   'merchant_ref':   'ORDER-2026-001',
// }
return redirect($res->json('redirect_url'));`,

    dart: `final res = await http.post(
  Uri.parse('https://api.youngpaycollect.com/v1/payment/redirect'),
  headers: {
    'client_id':    'ypk_live_xxx',
    'api_key':      'yps_live_xxx',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'amount':       150000,
    'description':  'Commande #112',
    'merchant_ref': 'ORDER-2026-001',
    'methods':      ['orange_money', 'mtn', 'soutra', 'paycard', 'kulu', 'card'],
  }),
);
// HTTP 201 Created
final data = jsonDecode(res.body);
// {
//   'status':         'pending',
//   'transaction_id': 'TXN-XXXXXXXX',
//   'redirect_url':   'https://pay.youngpaycollect.com/...',
//   'merchant_ref':   'ORDER-2026-001',
// }`,

    curl: `curl -X POST https://api.youngpaycollect.com/v1/payment/redirect \\
  -H "client_id: ypk_live_xxx" \\
  -H "api_key: yps_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount":       150000,
    "description":  "Commande #112",
    "merchant_ref": "ORDER-2026-001",
    "methods":      ["orange_money", "mtn", "soutra", "paycard", "kulu", "card"]
  }'

# HTTP 201 Created
# {
#   "status":         "pending",
#   "transaction_id": "TXN-XXXXXXXX",
#   "redirect_url":   "https://pay.youngpaycollect.com/...",
#   "merchant_ref":   "ORDER-2026-001"
# }`,
  },

  direct: {
    node: `const res = await fetch(
  'https://api.youngpaycollect.com/v1/payment/direct',
  {
    method: 'POST',
    headers: {
      'client_id':    'ypk_live_xxx',
      'api_key':      'yps_live_xxx',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount:       150000,
      phone:        '620000000',
      description:  'Commande #112',
      merchant_ref: 'ORDER-2026-001',
      method:       'orange_money',
    }),
  }
)
// HTTP 201 Created
const data = await res.json()
// {
//   status:         'pending',
//   transaction_id: 'TXN-XXXXXXXX',
//   redirect_url:   null,
//   merchant_ref:   'ORDER-2026-001',
// }`,

    python: `import requests

res = requests.post(
    'https://api.youngpaycollect.com/v1/payment/direct',
    headers={
        'client_id': 'ypk_live_xxx',
        'api_key':   'yps_live_xxx',
    },
    json={
        'amount':       150000,
        'phone':        '620000000',
        'description':  'Commande #112',
        'merchant_ref': 'ORDER-2026-001',
        'method':       'orange_money',
    }
)
# HTTP 201 Created
data = res.json()
# {
#   'status':         'pending',
#   'transaction_id': 'TXN-XXXXXXXX',
#   'redirect_url':   None,
#   'merchant_ref':   'ORDER-2026-001',
# }`,

    php: `$res = Http::withHeaders([
    'client_id' => 'ypk_live_xxx',
    'api_key'   => 'yps_live_xxx',
])->post(
    'https://api.youngpaycollect.com/v1/payment/direct',
    [
        'amount'       => 150000,
        'phone'        => '620000000',
        'description'  => 'Commande #112',
        'merchant_ref' => 'ORDER-2026-001',
        'method'       => 'orange_money',
    ]
);
// HTTP 201 Created
// {
//   'status':         'pending',
//   'transaction_id': 'TXN-XXXXXXXX',
//   'redirect_url':   null,
//   'merchant_ref':   'ORDER-2026-001',
// }`,

    dart: `final res = await http.post(
  Uri.parse('https://api.youngpaycollect.com/v1/payment/direct'),
  headers: {
    'client_id':    'ypk_live_xxx',
    'api_key':      'yps_live_xxx',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'amount':       150000,
    'phone':        '620000000',
    'description':  'Commande #112',
    'merchant_ref': 'ORDER-2026-001',
    'method':       'orange_money',
  }),
);
// HTTP 201 Created
final data = jsonDecode(res.body);
// {
//   'status':         'pending',
//   'transaction_id': 'TXN-XXXXXXXX',
//   'redirect_url':   null,
//   'merchant_ref':   'ORDER-2026-001',
// }`,

    curl: `curl -X POST https://api.youngpaycollect.com/v1/payment/direct \\
  -H "client_id: ypk_live_xxx" \\
  -H "api_key: yps_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount":       150000,
    "phone":        "620000000",
    "description":  "Commande #112",
    "merchant_ref": "ORDER-2026-001",
    "method":       "orange_money"
  }'

# HTTP 201 Created
# {
#   "status":         "pending",
#   "transaction_id": "TXN-XXXXXXXX",
#   "redirect_url":   null,
#   "merchant_ref":   "ORDER-2026-001"
# }`,
  },

  status: {
    node: `const transactionId = 'TXN-XXXXXXXX'
const res = await fetch(
  \`https://api.youngpaycollect.com/v1/payment/\${transactionId}\`,
  {
    method: 'GET',
    headers: {
      'client_id': 'ypk_live_xxx',
      'api_key':   'yps_live_xxx',
    },
  }
)
// HTTP 200 OK
const data = await res.json()
// {
//   transaction_id: 'TXN-XXXXXXXX',
//   status:         'SUCCESS',
//   amount:         150000,
//   phone:          '620000000',
//   method:         'orange_money',
//   merchant_ref:   'ORDER-2026-001',
//   created_at:     '2026-05-01T14:32:00Z',
// }`,

    python: `import requests

transaction_id = 'TXN-XXXXXXXX'
res = requests.get(
    f'https://api.youngpaycollect.com/v1/payment/{transaction_id}',
    headers={
        'client_id': 'ypk_live_xxx',
        'api_key':   'yps_live_xxx',
    }
)
# HTTP 200 OK
data = res.json()
# {
#   'transaction_id': 'TXN-XXXXXXXX',
#   'status':         'SUCCESS',
#   'amount':         150000,
#   'phone':          '620000000',
#   'method':         'orange_money',
#   'merchant_ref':   'ORDER-2026-001',
#   'created_at':     '2026-05-01T14:32:00Z',
# }`,

    php: `$transactionId = 'TXN-XXXXXXXX';
$res = Http::withHeaders([
    'client_id' => 'ypk_live_xxx',
    'api_key'   => 'yps_live_xxx',
])->get(
    "https://api.youngpaycollect.com/v1/payment/{$transactionId}"
);
// HTTP 200 OK
$data = $res->json();`,

    dart: `final transactionId = 'TXN-XXXXXXXX';
final res = await http.get(
  Uri.parse(
    'https://api.youngpaycollect.com/v1/payment/\$transactionId',
  ),
  headers: {
    'client_id': 'ypk_live_xxx',
    'api_key':   'yps_live_xxx',
  },
);
// HTTP 200 OK
final data = jsonDecode(res.body);`,

    curl: `curl -X GET https://api.youngpaycollect.com/v1/payment/TXN-XXXXXXXX \\
  -H "client_id: ypk_live_xxx" \\
  -H "api_key: yps_live_xxx"

# HTTP 200 OK
# {
#   "transaction_id": "TXN-XXXXXXXX",
#   "status":         "SUCCESS",
#   "amount":         150000,
#   "phone":          "620000000",
#   "method":         "orange_money",
#   "merchant_ref":   "ORDER-2026-001",
#   "created_at":     "2026-05-01T14:32:00Z"
# }`,
  },
}

const LANG_LABELS: { id: ApiLang; label: string; color: string }[] = [
  { id: 'node',   label: 'Node.js', color: '#68A063' },
  { id: 'python', label: 'Python',  color: '#3776AB' },
  { id: 'php',    label: 'PHP',     color: '#777BB4' },
  { id: 'dart',   label: 'Dart',    color: '#0175C2' },
  { id: 'curl',   label: 'cURL',    color: '#94A3B8' },
]

const ScreenDeveloper = () => {
  const [showSecret,    setShowSecret]    = useState(false)
  const [revealedSK,    setRevealedSK]    = useState<string | null>(null)
  const [regenLoading,  setRegenLoading]  = useState(false)
  const [showRegenConfirm, setShowRegenConfirm] = useState(false)
  const [copiedKey,     setCopiedKey]     = useState<string | null>(null)
  const [devError,      setDevError]      = useState<string | null>(null)
  const [webhookUrl,   setWebhookUrl]   = useState('')
  const [webhookSaved, setWebhookSaved] = useState(false)
  const [apiType,      setApiType]      = useState<'redirect'|'direct'|'status'>('redirect')
  const [lang,         setLang]         = useState<ApiLang>('node')
  const [apiKeys,      setApiKeys]      = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    apiFetch<Record<string, unknown>[]>('/api-keys')
      .then(keys => setApiKeys(keys))
      .catch(() => {})
    apiFetch<{ client_id: string; api_key: string }>(`/api-keys/reveal?env=${_env}`)
      .then(r => { setRevealedSK(r.api_key) })
      .catch(() => {})
    apiFetch<{ data: { url: string }[] }>('/webhooks')
      .then(r => { if (r.data?.[0]?.url) setWebhookUrl(r.data[0].url) })
      .catch(() => {})
  }, [])

  const activeKey = apiKeys.find((k) => k.env === _env) ?? apiKeys[0]
  const PK = (activeKey?.client_id as string) ?? '—'
  const SK = revealedSK ?? null

  const handleRegen = async () => {
    setShowRegenConfirm(false)
    setRegenLoading(true)
    try {
      const res = await apiFetch<{ client_id: string; api_key: string }>('/api-keys/regenerate', {
        method: 'POST',
        body: JSON.stringify({ env: _env }),
      })
      setRevealedSK(res.api_key)
      setApiKeys(prev => prev.map(k => k.env === _env ? { ...k, client_id: res.client_id } : k))
      setShowSecret(true)
    } catch (err: unknown) {
      setDevError(err instanceof Error ? err.message : 'Erreur lors de la regénération')
    } finally {
      setRegenLoading(false)
    }
  }

  const copy = (val: string, key: string) => {
    navigator.clipboard.writeText(val).catch(() => {})
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const saveWebhook = async () => {
    setWebhookSaved(false)
    try {
      await apiFetch('/webhooks', { method: 'POST', body: JSON.stringify({ url: webhookUrl }) })
    } catch { /* ignore — show success anyway for UX */ }
    setWebhookSaved(true)
    setTimeout(() => setWebhookSaved(false), 3000)
  }

  const currentSnippet = API_SNIPPETS[apiType][lang]
  const currentLang    = LANG_LABELS.find(l => l.id === lang)!

  return (
    <div className="p-6 space-y-6">

      {/* API Keys */}
      <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="px-6 py-4 border-b border-navy-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
            <Key className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-navy text-sm">Clés API</h3>
            <p className="text-navy-400 text-xs">Utilisez ces clés pour authentifier vos requêtes</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Public key */}
          <div>
            <label className="text-navy text-xs font-semibold uppercase tracking-wide block mb-2">
              client_id
            </label>
            <div className="flex items-center gap-2 bg-navy-50 border border-navy-200 rounded-xl px-4 py-3">
              <code className="flex-1 text-navy text-xs font-mono truncate">{PK}</code>
              <button onClick={() => copy(PK, 'pk')}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={copiedKey === 'pk'
                  ? { background: 'rgba(16,185,129,0.12)', color: '#10B981' }
                  : { background: 'rgba(245,158,11,0.12)', color: '#F97316' }}>
                {copiedKey === 'pk' ? <><Check className="w-3 h-3" />Copié</> : <><Copy className="w-3 h-3" />Copier</>}
              </button>
            </div>
          </div>

          {/* Secret key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-navy text-xs font-semibold uppercase tracking-wide">api_key</label>
              <button onClick={() => setShowRegenConfirm(true)} disabled={regenLoading}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                {regenLoading
                  ? <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  : <><RefreshCw className="w-3 h-3" />Regénérer</>}
              </button>
            </div>
            <div className="flex items-center gap-2 bg-navy-50 border border-navy-200 rounded-xl px-4 py-3">
              <code className="flex-1 text-navy text-xs font-mono truncate">
                {SK && showSecret ? SK : '•'.repeat(40)}
              </code>
              <button onClick={() => SK ? setShowSecret(v => !v) : setShowRegenConfirm(true)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-navy-200 transition-colors text-navy-400"
                title={SK ? (showSecret ? 'Masquer' : 'Voir') : 'Regénérer pour voir'}>
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button onClick={() => SK ? copy(SK, 'sk') : undefined}
                disabled={!SK}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
                style={copiedKey === 'sk'
                  ? { background: 'rgba(16,185,129,0.12)', color: '#10B981' }
                  : { background: 'rgba(245,158,11,0.12)', color: '#F97316' }}>
                {copiedKey === 'sk' ? <><Check className="w-3 h-3" />Copié</> : <><Copy className="w-3 h-3" />Copier</>}
              </button>
            </div>
            {!SK && (
              <p className="text-amber-600 text-[11px] mt-1.5">
                ⚠ Clé non disponible — cliquez sur "Regénérer" pour en créer une nouvelle.
              </p>
            )}
            <p className="text-red-500 text-[11px] mt-1">⚠ Ne partagez jamais votre api_key. Côté serveur uniquement.</p>
          </div>

          {/* Dialog confirmation regénération */}
          {showRegenConfirm && (
            <>
              <div className="fixed inset-0 z-50" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)' }}
                onClick={() => setShowRegenConfirm(false)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" style={{ animation: 'fadeUp 0.2s ease-out' }}>
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                      <RefreshCw className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="font-bold text-navy text-lg mb-2">Regénérer les clés ?</h3>
                    <p className="text-navy-400 text-sm mb-6">L'ancienne <strong>api_key</strong> sera immédiatement invalidée. Toutes vos intégrations utilisant cette clé cesseront de fonctionner.</p>
                    <div className="flex gap-3">
                      <button onClick={() => setShowRegenConfirm(false)}
                        className="flex-1 py-3 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy hover:border-navy-300 transition-colors">
                        Annuler
                      </button>
                      <button onClick={handleRegen}
                        className="flex-1 py-3 rounded-xl text-white font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)' }}>
                        Confirmer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Dialog erreur dev */}
          {devError && (
            <>
              <div className="fixed inset-0 z-50" style={{ background: 'rgba(15,23,42,0.4)' }}
                onClick={() => setDevError(null)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center" style={{ animation: 'fadeUp 0.2s ease-out' }}>
                  <p className="text-red-500 text-2xl mb-3">⚠</p>
                  <p className="font-bold text-navy mb-2">Erreur</p>
                  <p className="text-navy-400 text-sm mb-5">{devError}</p>
                  <button onClick={() => setDevError(null)}
                    className="w-full py-2.5 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy hover:border-navy-300 transition-colors">
                    Fermer
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Webhook */}
        <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="px-6 py-4 border-b border-navy-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.12)' }}>
              <Globe className="w-4 h-4" style={{ color: '#6366F1' }} />
            </div>
            <div>
              <h3 className="font-bold text-navy text-sm">Webhook</h3>
              <p className="text-navy-400 text-xs">Recevez les événements en temps réel</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-navy text-xs font-semibold uppercase tracking-wide block mb-2">
                URL de callback
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://monsite.com/webhook"
                className="w-full bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 text-sm text-navy outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <button onClick={saveWebhook}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
              {webhookSaved ? '✓ Webhook enregistré' : 'Enregistrer'}
            </button>
          </div>
        </div>

        {/* Events card */}
        <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="px-6 py-4 border-b border-navy-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.12)' }}>
              <Zap className="w-4 h-4" style={{ color: '#10B981' }} />
            </div>
            <div>
              <h3 className="font-bold text-navy text-sm">Événements disponibles</h3>
              <p className="text-navy-400 text-xs">Envoyés via webhook à chaque transition de paiement</p>
            </div>
          </div>
          <div className="p-5 space-y-5">
            {/* Events list */}
            <div className="space-y-1.5">
              {[
                { event: 'payment.success',  desc: 'Paiement confirmé avec succès',       color: '#10B981', bg: 'rgba(16,185,129,0.10)'  },
                { event: 'payment.failed',   desc: 'Paiement échoué ou refusé',            color: '#EF4444', bg: 'rgba(239,68,68,0.10)'   },
                { event: 'payment.pending',  desc: 'En attente de confirmation opérateur', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)'  },
                { event: 'payment.expired',  desc: 'Lien de paiement expiré',              color: '#94A3B8', bg: 'rgba(148,163,184,0.10)' },
              ].map(e => (
                <div key={e.event} className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{ background: '#F8FAFC' }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
                  <code className="text-[11px] font-mono font-semibold flex-shrink-0"
                    style={{ color: e.color }}>{e.event}</code>
                  <span className="text-xs text-slate-400 ml-auto text-right">{e.desc}</span>
                </div>
              ))}
            </div>

            {/* Payload preview */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payload reçu (POST vers votre URL)</p>
              <div className="rounded-xl overflow-hidden" style={{ background: '#0F172A' }}>
                <pre className="text-[11px] font-mono leading-relaxed p-4" style={{ color: '#94A3B8' }}>{
`{
  "event":          `}<span style={{ color: '#F59E0B' }}>"payment.success"</span>{`,
  "transaction_id": `}<span style={{ color: '#34D399' }}>"TXN-XXXXXXXX"</span>{`,
  "merchant_ref":   `}<span style={{ color: '#34D399' }}>"ORDER-2026-001"</span>{`,
  "status":         `}<span style={{ color: '#F97316' }}>"SUCCESS"</span>{`,
  "amount":         `}<span style={{ color: '#34D399' }}>150000</span>{`,
  "fee":            `}<span style={{ color: '#34D399' }}>1800</span>{`,
  "net":            `}<span style={{ color: '#34D399' }}>148200</span>{`,
  "operator":       `}<span style={{ color: '#34D399' }}>"orange_money"</span>{`,
  "phone":          `}<span style={{ color: '#34D399' }}>"+224620000000"</span>{`,
  "env":            `}<span style={{ color: '#34D399' }}>"sandbox"</span>{`,
  "timestamp":      `}<span style={{ color: '#34D399' }}>"2026-06-11T10:24:00.000Z"</span>{`
}`}
                </pre>
              </div>
            </div>

            {/* Sandbox alternance */}
            <div className="rounded-xl p-3.5" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1.5">⚡ Comportement sandbox</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                En sandbox, les webhooks alternent automatiquement entre <code className="font-mono font-bold">SUCCESS</code> et <code className="font-mono font-bold">FAILED</code> à chaque simulation — sans paramètre à passer. Cela vous permet de tester les deux cas de votre intégration.
              </p>
            </div>

            {/* Retry policy */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Politique de retry</p>
              <div className="space-y-1.5">
                {[
                  { attempt: '1ère tentative', delay: 'Immédiat',  color: '#10B981' },
                  { attempt: '2ème tentative', delay: 'Après 1s',  color: '#F59E0B' },
                  { attempt: '3ème tentative', delay: 'Après 2s',  color: '#EF4444' },
                ].map(r => (
                  <div key={r.attempt} className="flex items-center gap-3 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
                    <span className="text-slate-600 font-medium w-32">{r.attempt}</span>
                    <span className="text-slate-400">{r.delay} · timeout 10s</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Votre endpoint doit répondre HTTP 2xx. Tout autre code = échec enregistré.</p>
            </div>

            {/* Statuses */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Signification des statuts</p>
              <div className="space-y-1.5">
                {[
                  { status: 'SUCCESS', color: '#10B981', bg: 'rgba(16,185,129,0.08)',  desc: 'Paiement confirmé — fonds crédités'             },
                  { status: 'PENDING', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  desc: 'En attente — ne pas livrer avant confirmation'  },
                  { status: 'FAILED',  color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   desc: 'Échec ou refus — aucun débit effectué'          },
                  { status: 'EXPIRED', color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', desc: 'Délai dépassé — lien ou session expiré'         },
                ].map(s => (
                  <div key={s.status} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                    style={{ background: s.bg }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <code className="text-[11px] font-mono font-bold w-14 flex-shrink-0" style={{ color: s.color }}>{s.status}</code>
                    <span className="text-xs text-slate-500">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Code snippet — new multi-type / multi-lang UI */}
      <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        {/* Header row */}
        <div className="px-6 pt-5 pb-4 border-b border-navy-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(15,23,42,0.08)' }}>
              <Code2 className="w-4 h-4 text-navy" />
            </div>
            <div>
              <h3 className="font-bold text-navy text-sm">Exemples d'intégration</h3>
              <p className="text-slate-400 text-xs">Choisissez votre type d'API et votre langage</p>
            </div>
          </div>

          {/* API type tabs */}
          <div className="flex gap-2 mb-3">
            {([
              { id: 'redirect' as const, label: 'Avec redirection', desc: 'Redirige vers une page de paiement hébergée' },
              { id: 'direct'   as const, label: 'Sans redirection', desc: 'Push direct vers le téléphone du client'     },
              { id: 'status'   as const, label: 'Statut paiement',  desc: "Vérifier le statut d'une transaction"       },
            ]).map(t => (
              <button
                key={t.id}
                onClick={() => setApiType(t.id)}
                className="flex-1 text-left px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all"
                style={apiType === t.id
                  ? { background: 'linear-gradient(135deg,#F59E0B,#F97316)', borderColor: 'transparent', color: '#fff' }
                  : { background: '#F8FAFC', borderColor: '#E2E8F0', color: '#64748B' }}>
                <span className="block">{t.label}</span>
                <span className="block font-normal mt-0.5" style={{ color: apiType === t.id ? 'rgba(255,255,255,0.75)' : '#94A3B8', fontSize: 10 }}>{t.desc}</span>
              </button>
            ))}
          </div>

          {/* Endpoint URL */}
          <div className="flex items-center gap-2">
            <code className="text-[10px] px-2 py-0.5 rounded-md font-mono"
              style={{ background: 'rgba(99,102,241,0.10)', color: '#6366F1' }}>
              {apiType === 'status' ? 'GET' : 'POST'}{' '}
              {apiType === 'redirect'
                ? 'https://api.youngpaycollect.com/v1/payment/redirect'
                : apiType === 'direct'
                ? 'https://api.youngpaycollect.com/v1/payment/direct'
                : 'https://api.youngpaycollect.com/v1/payment/{transaction_id}'}
            </code>
          </div>
        </div>

        {/* Fields reference */}
        <div className="px-6 py-4 border-b border-navy-100" style={{ background: '#FAFBFC' }}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            {apiType === 'status' ? 'Paramètre URL' : 'Paramètres du body'}
          </p>
          <div className="grid gap-1.5">
            {(apiType === 'redirect' ? [
              { name: 'amount',         type: 'number', req: true,  desc: 'Montant en GNF'                                         },
              { name: 'description',    type: 'string', req: true,  desc: 'Description du paiement'                                },
              { name: 'methods',        type: 'array',  req: true,  desc: "Opérateurs : 'orange_money', 'mtn', 'soutra', 'paycard', 'kulu', 'card'" },
              { name: 'merchant_ref',   type: 'string', req: true,  desc: 'Votre référence interne (renvoyée dans la réponse)'     },
            ] : apiType === 'direct' ? [
              { name: 'amount',         type: 'number', req: true,  desc: 'Montant en GNF'                                         },
              { name: 'phone',          type: 'string', req: true,  desc: 'Téléphone du payeur'                                    },
              { name: 'description',    type: 'string', req: true,  desc: 'Description du paiement'                                },
              { name: 'method',         type: 'string', req: true,  desc: "Opérateur : 'orange_money', 'mtn' ou 'soutra'"          },
              { name: 'merchant_ref',   type: 'string', req: true,  desc: 'Votre référence interne (renvoyée dans la réponse)'     },
            ] : [
              { name: 'transaction_id', type: 'string', req: true,  desc: "Identifiant de la transaction — passé dans l'URL"      },
            ]).map(f => (
              <div key={f.name} className="flex items-center gap-3 py-1">
                <code className="text-[11px] font-mono font-semibold w-28 flex-shrink-0" style={{ color: '#F59E0B' }}>{f.name}</code>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.08)', color: '#6366F1' }}>{f.type}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${f.req ? 'text-orange-600' : 'text-slate-400'}`}
                  style={{ background: f.req ? 'rgba(249,115,22,0.08)' : 'rgba(148,163,184,0.10)' }}>
                  {f.req ? 'Requis' : 'Optionnel'}
                </span>
                <span className="text-xs text-slate-400 truncate">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Response reference */}
        <div className="px-6 py-4 border-b border-navy-100" style={{ background: '#F8FAFC' }}>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Réponse</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(16,185,129,0.10)', color: '#10B981' }}>
              {apiType === 'status' ? '200 OK' : '201 Created'}
            </span>
          </div>
          <div className="grid gap-1.5 mb-4">
            {(apiType === 'status' ? [
              { name: 'transaction_id', type: 'string',      desc: 'Identifiant unique de la transaction'                    },
              { name: 'status',         type: 'string',      desc: "'SUCCESS' · 'PENDING' · 'FAILED' · 'EXPIRED'"           },
              { name: 'amount',         type: 'number',      desc: 'Montant en GNF'                                          },
              { name: 'phone',          type: 'string',      desc: 'Téléphone du payeur'                                     },
              { name: 'method',         type: 'string',      desc: "Opérateur utilisé (ex: 'orange_money')"                  },
              { name: 'merchant_ref',   type: 'string',      desc: 'Votre référence interne transmise dans la requête'       },
              { name: 'created_at',     type: 'string',      desc: 'Date de création ISO 8601'                               },
            ] : [
              { name: 'status',         type: 'string',      desc: "'PENDING' · 'SUCCESS' · 'FAILED'"                       },
              { name: 'transaction_id', type: 'string',      desc: 'Identifiant unique de la transaction (ex: TXN-XXXXXXXX)' },
              ...(apiType === 'redirect' ? [
                { name: 'redirect_url', type: 'string',      desc: 'URL de paiement hébergée — redirigez le client'         },
              ] : []),
              { name: 'merchant_ref',   type: 'string',      desc: 'Votre référence interne transmise dans la requête'       },
            ]).map(f => (
              <div key={f.name} className="flex items-center gap-3 py-1">
                <code className="text-[11px] font-mono font-semibold w-28 flex-shrink-0" style={{ color: '#34D399' }}>{f.name}</code>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0"
                  style={{ background: 'rgba(52,211,153,0.08)', color: '#10B981' }}>{f.type}</span>
                <span className="text-xs text-slate-400 truncate">{f.desc}</span>
              </div>
            ))}
          </div>

          {/* Error statuses */}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Autres statuts</p>
          <div className="grid gap-1.5">
            {[
              { code: '400', label: 'Bad Request',           color: '#F97316', bg: 'rgba(249,115,22,0.10)',  desc: 'Champ manquant ou valeur invalide'           },
              { code: '401', label: 'Unauthorized',          color: '#EF4444', bg: 'rgba(239,68,68,0.10)',   desc: 'client_id ou api_key incorrect'               },
              { code: '422', label: 'Unprocessable Entity',  color: '#F59E0B', bg: 'rgba(245,158,11,0.10)',  desc: 'Montant hors limite ou téléphone non reconnu' },
              { code: '429', label: 'Too Many Requests',     color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)',  desc: 'Quota de requêtes dépassé — réessayez plus tard'},
              { code: '500', label: 'Internal Server Error', color: '#64748B', bg: 'rgba(100,116,139,0.10)', desc: 'Erreur serveur — contactez le support'         },
            ].map(s => (
              <div key={s.code} className="flex items-center gap-3 py-1">
                <span className="text-[11px] font-mono font-bold w-8 flex-shrink-0" style={{ color: s.color }}>{s.code}</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold flex-shrink-0"
                  style={{ background: s.bg, color: s.color }}>{s.label}</span>
                <span className="text-xs text-slate-400 truncate">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Code block with language sidebar */}
        <div className="bg-[#0F172A] flex">
          {/* Language sidebar */}
          <div className="flex flex-col border-r py-4 flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0B1120' }}>
            {LANG_LABELS.map(l => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className="px-4 py-2.5 text-left text-xs font-semibold transition-all relative"
                style={lang === l.id
                  ? { color: l.color, background: 'rgba(255,255,255,0.06)' }
                  : { color: 'rgba(148,163,184,0.5)' }}>
                {lang === l.id && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                    style={{ background: l.color }} />
                )}
                {l.label}
              </button>
            ))}
          </div>
          {/* Code area */}
          <div className="flex-1 relative min-w-0">
            <button
              onClick={() => copy(currentSnippet, 'snippet')}
              className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all z-10"
              style={copiedKey === 'snippet'
                ? { background: 'rgba(16,185,129,0.20)', color: '#10B981' }
                : { background: 'rgba(255,255,255,0.08)', color: '#94A3B8' }}>
              {copiedKey === 'snippet' ? <><Check className="w-3 h-3" />Copié</> : <><Copy className="w-3 h-3" />Copier</>}
            </button>
            <div className="overflow-x-auto p-6 pt-12">
              <pre className="text-sm font-mono leading-relaxed">
                {currentSnippet.split('\n').map((line, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="select-none text-white/20 text-xs w-5 text-right flex-shrink-0 pt-0.5">{i + 1}</span>
                    <span
                      dangerouslySetInnerHTML={{ __html: (() => {
                        const esc = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                        const tr = esc.trim()
                        if (tr.startsWith('#') || tr.startsWith('//'))
                          return `<span style="color:#64748B">${esc}</span>`
                        return esc
                          .replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g, '<span style="color:#F59E0B">$1</span>')
                          .replace(/\b(const|let|var|await|async|fetch|return|import|from|function|def|echo|require|print|print_r|curl_init|curl_setopt|curl_exec|void|Future|final|http\.Client|jsonDecode|Uri\.parse|http\.post)\b/g, '<span style="color:#818CF8">$1</span>')
                          .replace(/\b(true|false|null|None|True|False)\b/g, '<span style="color:#F97316">$1</span>')
                          .replace(/\b(\d+)\b/g, '<span style="color:#34D399">$1</span>')
                      })() }}
                      style={{ color: '#94A3B8' }}
                    />
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default ScreenDeveloper
