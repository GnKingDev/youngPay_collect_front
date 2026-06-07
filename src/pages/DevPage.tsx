import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Key, Globe, Zap, Code2, Check, Copy,
  Terminal, ChevronRight, Lock, ArrowRight,
} from 'lucide-react'
import logoImg from '../assets/logo.png'

type ApiLang = 'node' | 'python' | 'php' | 'dart' | 'curl'

const API_SNIPPETS: Record<'redirect' | 'direct' | 'status', Record<ApiLang, string>> = {
  redirect: {
    node: `const res = await fetch(
  'https://api.youngpaycollect.com/v1/payment/redirect',
  {
    method: 'POST',
    headers: {
      'client_id':    'YOUR_CLIENT_ID',
      'api_key':      'YOUR_API_KEY',
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
//   status:         'PENDING',
//   transaction_id: 'TXN-XXXXXXXX',
//   redirect_url:   'https://pay.youngpaycollect.com/...',
//   merchant_ref:   'ORDER-2026-001',
// }
window.location.href = data.redirect_url`,

    python: `import requests

res = requests.post(
    'https://api.youngpaycollect.com/v1/payment/redirect',
    headers={
        'client_id': 'YOUR_CLIENT_ID',
        'api_key':   'YOUR_API_KEY',
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
#   'status':         'PENDING',
#   'transaction_id': 'TXN-XXXXXXXX',
#   'redirect_url':   'https://pay.youngpaycollect.com/...',
#   'merchant_ref':   'ORDER-2026-001',
# }
print(data['redirect_url'])`,

    php: `$res = Http::withHeaders([
    'client_id' => 'YOUR_CLIENT_ID',
    'api_key'   => 'YOUR_API_KEY',
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
return redirect($res->json('redirect_url'));`,

    dart: `final res = await http.post(
  Uri.parse('https://api.youngpaycollect.com/v1/payment/redirect'),
  headers: {
    'client_id':    'YOUR_CLIENT_ID',
    'api_key':      'YOUR_API_KEY',
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
final data = jsonDecode(res.body);`,

    curl: `curl -X POST https://api.youngpaycollect.com/v1/payment/redirect \\
  -H "client_id: YOUR_CLIENT_ID" \\
  -H "api_key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount":       150000,
    "description":  "Commande #112",
    "merchant_ref": "ORDER-2026-001",
    "methods":      ["orange_money", "mtn", "soutra", "paycard", "kulu", "card"]
  }'

# HTTP 201 Created
# {
#   "status":         "PENDING",
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
      'client_id':    'YOUR_CLIENT_ID',
      'api_key':      'YOUR_API_KEY',
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
//   status:         'PENDING',
//   transaction_id: 'TXN-XXXXXXXX',
//   redirect_url:   null,
//   merchant_ref:   'ORDER-2026-001',
// }`,

    python: `import requests

res = requests.post(
    'https://api.youngpaycollect.com/v1/payment/direct',
    headers={
        'client_id': 'YOUR_CLIENT_ID',
        'api_key':   'YOUR_API_KEY',
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
data = res.json()`,

    php: `$res = Http::withHeaders([
    'client_id' => 'YOUR_CLIENT_ID',
    'api_key'   => 'YOUR_API_KEY',
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
// HTTP 201 Created`,

    dart: `final res = await http.post(
  Uri.parse('https://api.youngpaycollect.com/v1/payment/direct'),
  headers: {
    'client_id':    'YOUR_CLIENT_ID',
    'api_key':      'YOUR_API_KEY',
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
final data = jsonDecode(res.body);`,

    curl: `curl -X POST https://api.youngpaycollect.com/v1/payment/direct \\
  -H "client_id: YOUR_CLIENT_ID" \\
  -H "api_key: YOUR_API_KEY" \\
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
#   "status":         "PENDING",
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
      'client_id': 'YOUR_CLIENT_ID',
      'api_key':   'YOUR_API_KEY',
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
        'client_id': 'YOUR_CLIENT_ID',
        'api_key':   'YOUR_API_KEY',
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
    'client_id' => 'YOUR_CLIENT_ID',
    'api_key'   => 'YOUR_API_KEY',
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
    'client_id': 'YOUR_CLIENT_ID',
    'api_key':   'YOUR_API_KEY',
  },
);
// HTTP 200 OK
final data = jsonDecode(res.body);`,

    curl: `curl -X GET https://api.youngpaycollect.com/v1/payment/TXN-XXXXXXXX \\
  -H "client_id: YOUR_CLIENT_ID" \\
  -H "api_key: YOUR_API_KEY"

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

export default function DevPage() {
  const navigate = useNavigate()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [apiType,   setApiType]   = useState<'redirect' | 'direct' | 'status'>('redirect')
  const [lang,      setLang]      = useState<ApiLang>('node')
  const [activeNav, setActiveNav] = useState('keys')

  const copy = (val: string, key: string) => {
    navigator.clipboard.writeText(val).catch(() => {})
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const currentSnippet = API_SNIPPETS[apiType][lang]

  const highlight = (line: string) => {
    const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const trimmed = escaped.trim()
    if (trimmed.startsWith('#') || trimmed.startsWith('//'))
      return `<span style="color:#64748B">${escaped}</span>`
    return escaped
      .replace(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g, '<span style="color:#F59E0B">$1</span>')
      .replace(/\b(const|let|var|await|async|fetch|return|import|from|function|def|echo|require|print|print_r|curl_init|curl_setopt|curl_exec|void|Future|final|http\.Client|jsonDecode|Uri\.parse|http\.post)\b/g, '<span style="color:#818CF8">$1</span>')
      .replace(/\b(true|false|null|None|True|False)\b/g, '<span style="color:#F97316">$1</span>')
      .replace(/\b(\d+)\b/g, '<span style="color:#34D399">$1</span>')
  }

  const scrollTo = (id: string) => {
    setActiveNav(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', minHeight: '100vh', background: '#F8FAFC' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        .dev-section { animation: fadeUp 0.4s ease-out both; }
      `}</style>

      {/* ── TOP NAV ── */}
      <header style={{ background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 24 }}>
          <button onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: 12, fontWeight: 600, fontFamily: 'Poppins,sans-serif' }}>
            <ArrowLeft size={14} /> Retour
          </button>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
          <img src={logoImg} alt="YoungPay" style={{ height: 24 }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600 }}>/ Documentation API</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            {[
              { id: 'keys',    label: 'Authentification' },
              { id: 'api',     label: 'API Reference'    },
              { id: 'webhook', label: 'Webhook'          },
            ].map(n => (
              <button key={n.id} onClick={() => scrollTo(n.id)}
                style={{ background: activeNav === n.id ? 'rgba(249,115,22,0.15)' : 'none', border: 'none', cursor: 'pointer', color: activeNav === n.id ? '#F97316' : '#64748B', fontSize: 12, fontWeight: 600, fontFamily: 'Poppins,sans-serif', padding: '6px 12px', borderRadius: 8, transition: 'all 0.18s' }}>
                {n.label}
              </button>
            ))}
          </div>
          <button onClick={() => navigate('/inscription')}
            style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', border: 'none', borderRadius: 8, padding: '7px 16px', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'Poppins,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            Créer un compte <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <div style={{ background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 999, padding: '4px 14px', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F97316', display: 'block' }} />
            <span style={{ color: '#F97316', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>API v1 · REST</span>
          </div>
          <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 48px)', margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Documentation API<br />
            <span style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              YoungPay Collect
            </span>
          </h1>
          <p style={{ color: '#64748B', fontSize: 15, margin: '0 0 32px', maxWidth: 560, lineHeight: 1.75 }}>
            Intégrez les paiements Mobile Money et carte en quelques lignes de code. Deux modes disponibles : avec redirection ou push direct.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Base URL',  value: 'https://api.youngpaycollect.com/v1', color: '#6366F1' },
              { label: 'Auth',      value: 'client_id + api_key (headers)',      color: '#10B981' },
              { label: 'Format',    value: 'JSON',                               color: '#F59E0B' },
              { label: 'Réponse',   value: 'HTTP 201 Created',                   color: '#F97316' },
            ].map(b => (
              <div key={b.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 16px' }}>
                <span style={{ color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>{b.label}</span>
                <code style={{ color: b.color, fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>{b.value}</code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>

        {/* Sticky sidebar */}
        <aside style={{ width: 200, flexShrink: 0, position: 'sticky', top: 80 }}>
          <p style={{ color: '#94A3B8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Sur cette page</p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { id: 'keys',    label: 'Authentification' },
              { id: 'api',     label: 'Exemples de code' },
              { id: 'webhook', label: 'Webhook'          },
              { id: 'events',  label: 'Événements'       },
            ].map(n => (
              <button key={n.id} onClick={() => scrollTo(n.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', fontSize: 12, fontWeight: 500, fontFamily: 'Poppins,sans-serif', padding: '6px 10px', borderRadius: 8, textAlign: 'left', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.06)'; e.currentTarget.style.color = '#F97316' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748B' }}>
                <ChevronRight size={12} /> {n.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* ── Authentification ── */}
          <section id="keys" className="dev-section">
            <h2 style={{ color: '#0F172A', fontWeight: 800, fontSize: 18, margin: '0 0 16px', letterSpacing: '-0.01em' }}>Authentification</h2>
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#F59E0B,#F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Key size={16} color="#fff" />
                </div>
                <div>
                  <p style={{ color: '#0F172A', fontWeight: 700, fontSize: 14, margin: 0 }}>Clés API</p>
                  <p style={{ color: '#94A3B8', fontSize: 12, margin: 0 }}>Transmises dans les headers de chaque requête</p>
                </div>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Two key types explained */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { name: 'client_id',  label: 'Clé publique', icon: Key,  color: '#F97316', bg: 'rgba(249,115,22,0.08)',  desc: 'Identifie votre compte marchand. Peut être exposée côté client.' },
                    { name: 'api_key',    label: 'Clé secrète',  icon: Lock, color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   desc: 'Authentifie vos requêtes. Ne jamais exposer côté client.' },
                  ].map(k => (
                    <div key={k.name} style={{ padding: 16, borderRadius: 14, border: '1.5px solid #E2E8F0', background: '#FAFBFC' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <k.icon size={13} color={k.color} />
                        </div>
                        <div>
                          <p style={{ color: '#0F172A', fontWeight: 700, fontSize: 12, margin: 0 }}>{k.label}</p>
                          <code style={{ color: k.color, fontSize: 10, fontFamily: 'monospace', fontWeight: 600 }}>{k.name}</code>
                        </div>
                      </div>
                      <p style={{ color: '#64748B', fontSize: 11, margin: 0, lineHeight: 1.6 }}>{k.desc}</p>
                    </div>
                  ))}
                </div>

                {/* CTA to get keys */}
                <div style={{ background: 'rgba(249,115,22,0.05)', border: '1.5px dashed rgba(249,115,22,0.30)', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <p style={{ color: '#0F172A', fontWeight: 700, fontSize: 13, margin: '0 0 4px' }}>Obtenez vos clés API</p>
                    <p style={{ color: '#64748B', fontSize: 12, margin: 0 }}>Créez un compte marchand pour accéder à vos clés depuis le tableau de bord.</p>
                  </div>
                  <button onClick={() => navigate('/inscription')}
                    style={{ flexShrink: 0, background: 'linear-gradient(135deg,#F59E0B,#F97316)', border: 'none', borderRadius: 10, padding: '10px 18px', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'Poppins,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    Créer un compte <ArrowRight size={13} />
                  </button>
                </div>

                {/* Headers example */}
                <div>
                  <p style={{ color: '#94A3B8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Format des headers</p>
                  <div style={{ background: '#0F172A', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Headers requis — chaque requête</span>
                    </div>
                    <pre style={{ margin: 0, padding: '16px', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.9, color: '#94A3B8' }}>
                      <span style={{ color: '#818CF8' }}>client_id</span>:    <span style={{ color: '#F59E0B' }}>YOUR_CLIENT_ID{'\n'}</span>
                      <span style={{ color: '#818CF8' }}>api_key</span>:      <span style={{ color: '#F59E0B' }}>YOUR_API_KEY{'\n'}</span>
                      <span style={{ color: '#818CF8' }}>Content-Type</span>: <span style={{ color: '#F59E0B' }}>application/json</span>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Code Examples ── */}
          <section id="api" className="dev-section" style={{ animationDelay: '0.08s' }}>
            <h2 style={{ color: '#0F172A', fontWeight: 800, fontSize: 18, margin: '0 0 16px', letterSpacing: '-0.01em' }}>Exemples d'intégration</h2>
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(15,23,42,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Code2 size={16} color="#0F172A" />
                  </div>
                  <div>
                    <p style={{ color: '#0F172A', fontWeight: 700, fontSize: 14, margin: 0 }}>API Reference</p>
                    <p style={{ color: '#94A3B8', fontSize: 12, margin: 0 }}>Choisissez votre type d'API et votre langage</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  {([
                    { id: 'redirect' as const, label: 'Avec redirection', desc: 'Redirige vers une page de paiement hébergée' },
                    { id: 'direct'   as const, label: 'Sans redirection', desc: 'Push direct vers le téléphone du client'     },
                    { id: 'status'   as const, label: 'Statut paiement',  desc: 'Vérifier le statut d\'une transaction'       },
                  ]).map(t => (
                    <button key={t.id} onClick={() => setApiType(t.id)}
                      style={{ flex: 1, textAlign: 'left', padding: '10px 16px', borderRadius: 12, border: '1.5px solid', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', transition: 'all 0.2s',
                        ...(apiType === t.id
                          ? { background: 'linear-gradient(135deg,#F59E0B,#F97316)', borderColor: 'transparent', color: '#fff' }
                          : { background: '#F8FAFC', borderColor: '#E2E8F0', color: '#64748B' }) }}>
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 700 }}>{t.label}</span>
                      <span style={{ display: 'block', fontSize: 10, fontWeight: 400, marginTop: 2, color: apiType === t.id ? 'rgba(255,255,255,0.75)' : '#94A3B8' }}>{t.desc}</span>
                    </button>
                  ))}
                </div>
                <code style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace', fontWeight: 600, background: 'rgba(99,102,241,0.10)', color: '#6366F1' }}>
                  {apiType === 'status' ? 'GET' : 'POST'}{' '}
                  {apiType === 'redirect'
                    ? 'https://api.youngpaycollect.com/v1/payment/redirect'
                    : apiType === 'direct'
                    ? 'https://api.youngpaycollect.com/v1/payment/direct'
                    : 'https://api.youngpaycollect.com/v1/payment/{transaction_id}'}
                </code>
              </div>

              {/* Fields */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', background: '#FAFBFC' }}>
                <p style={{ color: '#94A3B8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  {apiType === 'status' ? 'Paramètre URL' : 'Paramètres du body'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {(apiType === 'redirect' ? [
                    { name: 'amount',          type: 'number', req: true,  desc: 'Montant en GNF'                                                        },
                    { name: 'description',     type: 'string', req: true,  desc: 'Description du paiement'                                               },
                    { name: 'methods',         type: 'array',  req: true,  desc: "Opérateurs : 'orange_money', 'mtn', 'soutra', 'paycard', 'kulu', 'card'" },
                    { name: 'merchant_ref',    type: 'string', req: true,  desc: 'Votre référence interne (renvoyée dans la réponse)'                    },
                  ] : apiType === 'direct' ? [
                    { name: 'amount',          type: 'number', req: true,  desc: 'Montant en GNF'                                                        },
                    { name: 'phone',           type: 'string', req: true,  desc: 'Téléphone du payeur'                                                   },
                    { name: 'description',     type: 'string', req: true,  desc: 'Description du paiement'                                               },
                    { name: 'method',          type: 'string', req: true,  desc: "Opérateur : 'orange_money', 'mtn' ou 'soutra'"                         },
                    { name: 'merchant_ref',    type: 'string', req: true,  desc: 'Votre référence interne (renvoyée dans la réponse)'                    },
                  ] : [
                    { name: 'transaction_id',  type: 'string', req: true,  desc: 'Identifiant de la transaction — passé dans l\'URL'                     },
                  ]).map(f => (
                    <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <code style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#F59E0B', width: 108, flexShrink: 0 }}>{f.name}</code>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', background: 'rgba(99,102,241,0.08)', color: '#6366F1', flexShrink: 0 }}>{f.type}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, fontWeight: 700, flexShrink: 0, background: f.req ? 'rgba(249,115,22,0.08)' : 'rgba(148,163,184,0.10)', color: f.req ? '#F97316' : '#94A3B8' }}>
                        {f.req ? 'Requis' : 'Optionnel'}
                      </span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>{f.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <p style={{ color: '#94A3B8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Réponse</p>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, fontWeight: 700, background: 'rgba(16,185,129,0.10)', color: '#10B981' }}>
                    {apiType === 'status' ? '200 OK' : '201 Created'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
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
                    <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <code style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#34D399', width: 108, flexShrink: 0 }}>{f.name}</code>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', background: 'rgba(52,211,153,0.08)', color: '#10B981', flexShrink: 0 }}>{f.type}</span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>{f.desc}</span>
                    </div>
                  ))}
                </div>
                <p style={{ color: '#94A3B8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Autres statuts HTTP</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {[
                    { code: '400', label: 'Bad Request',           color: '#F97316', bg: 'rgba(249,115,22,0.08)',  desc: 'Champ manquant ou valeur invalide'             },
                    { code: '401', label: 'Unauthorized',          color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   desc: 'client_id ou api_key incorrect'                 },
                    { code: '422', label: 'Unprocessable Entity',  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  desc: 'Montant hors limite ou téléphone non reconnu'   },
                    { code: '429', label: 'Too Many Requests',     color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)',  desc: 'Quota dépassé — réessayez plus tard'            },
                    { code: '500', label: 'Internal Server Error', color: '#64748B', bg: 'rgba(100,116,139,0.08)', desc: 'Erreur serveur — contactez le support'          },
                  ].map(s => (
                    <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <code style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: s.color, width: 36, flexShrink: 0 }}>{s.code}</code>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600, background: s.bg, color: s.color, flexShrink: 0 }}>{s.label}</span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code block */}
              <div style={{ background: '#0F172A', display: 'flex' }}>
                <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)', background: '#0B1120', flexShrink: 0, padding: '8px 0' }}>
                  {LANG_LABELS.map(l => (
                    <button key={l.id} onClick={() => setLang(l.id)}
                      style={{ padding: '10px 18px', textAlign: 'left', fontSize: 12, fontWeight: 600, fontFamily: 'Poppins,sans-serif', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.15s',
                        background: lang === l.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                        color: lang === l.id ? l.color : 'rgba(148,163,184,0.5)' }}>
                      {lang === l.id && <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 2, height: 20, background: l.color, borderRadius: '0 2px 2px 0' }} />}
                      {l.label}
                    </button>
                  ))}
                </div>
                <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                  <button onClick={() => copy(currentSnippet, 'snippet')}
                    style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', zIndex: 10, transition: 'all 0.2s',
                      background: copiedKey === 'snippet' ? 'rgba(16,185,129,0.20)' : 'rgba(255,255,255,0.08)',
                      color: copiedKey === 'snippet' ? '#10B981' : '#94A3B8' }}>
                    {copiedKey === 'snippet' ? <><Check size={12} />Copié</> : <><Copy size={12} />Copier</>}
                  </button>
                  <div style={{ overflowX: 'auto', padding: '48px 24px 24px' }}>
                    <pre style={{ margin: 0, fontSize: 13, fontFamily: 'monospace', lineHeight: 1.75 }}>
                      {currentSnippet.split('\n').map((line, i) => (
                        <div key={i} style={{ display: 'flex', gap: 16 }}>
                          <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11, width: 20, textAlign: 'right', flexShrink: 0, paddingTop: 2, userSelect: 'none' }}>{i + 1}</span>
                          <span dangerouslySetInnerHTML={{ __html: highlight(line) }} style={{ color: '#94A3B8' }} />
                        </div>
                      ))}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Webhook + Events ── */}
          <section id="webhook" className="dev-section" style={{ animationDelay: '0.16s' }}>
            <h2 style={{ color: '#0F172A', fontWeight: 800, fontSize: 18, margin: '0 0 16px', letterSpacing: '-0.01em' }}>Webhook</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Left — webhook explainer */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#F59E0B,#F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Globe size={15} color="#fff" />
                  </div>
                  <div>
                    <p style={{ color: '#0F172A', fontWeight: 700, fontSize: 13, margin: 0 }}>Configuration Webhook</p>
                    <p style={{ color: '#94A3B8', fontSize: 11, margin: 0 }}>Recevez les notifications en temps réel</p>
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <p style={{ color: '#64748B', fontSize: 12, lineHeight: 1.75, margin: '0 0 16px' }}>
                    Configurez une URL webhook dans votre tableau de bord marchand pour recevoir automatiquement les mises à jour de statut de chaque transaction.
                  </p>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                    <p style={{ color: '#94A3B8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Exemple d'URL</p>
                    <code style={{ color: '#F59E0B', fontSize: 11, fontFamily: 'monospace', fontWeight: 600, wordBreak: 'break-all' }}>
                      https://votresite.com/webhooks/youngpay
                    </code>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {[
                      'Renseignez votre URL dans les paramètres du compte',
                      'YoungPay envoie un POST à chaque changement de statut',
                      'Répondez avec HTTP 200 pour confirmer la réception',
                      'En cas d\'échec, 3 tentatives sont effectuées automatiquement',
                    ].map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#F59E0B,#F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <span style={{ color: '#fff', fontSize: 9, fontWeight: 800 }}>{i + 1}</span>
                        </div>
                        <p style={{ color: '#64748B', fontSize: 11, margin: 0, lineHeight: 1.6 }}>{step}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate('/inscription')}
                    style={{ width: '100%', background: 'linear-gradient(135deg,#F59E0B,#F97316)', border: 'none', borderRadius: 10, padding: '10px 0', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'Poppins,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    Accéder au tableau de bord <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Right — events + payload */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Zap size={15} color="#F97316" />
                  </div>
                  <div>
                    <p style={{ color: '#0F172A', fontWeight: 700, fontSize: 13, margin: 0 }}>Événements disponibles</p>
                    <p style={{ color: '#94A3B8', fontSize: 11, margin: 0 }}>Envoyés via webhook à chaque transition de paiement</p>
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  {/* Events list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                    {[
                      { event: 'payment.success', status: 'SUCCESS', color: '#10B981', bg: 'rgba(16,185,129,0.08)',  desc: 'Paiement confirmé'          },
                      { event: 'payment.pending',  status: 'PENDING',  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  desc: 'En attente de confirmation' },
                      { event: 'payment.failed',   status: 'FAILED',   color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   desc: 'Paiement échoué'            },
                      { event: 'payment.expired',  status: 'EXPIRED',  color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', desc: 'Session expirée'            },
                    ].map(e => (
                      <div key={e.event} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: e.bg }}>
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, fontWeight: 700, background: '#fff', color: e.color, flexShrink: 0, border: `1px solid ${e.color}30` }}>{e.status}</span>
                        <code style={{ color: e.color, fontSize: 10, fontFamily: 'monospace', fontWeight: 600, flex: 1 }}>{e.event}</code>
                        <span style={{ color: '#94A3B8', fontSize: 10 }}>{e.desc}</span>
                      </div>
                    ))}
                  </div>

                  {/* Payload preview */}
                  <p style={{ color: '#94A3B8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Format du payload</p>
                  <div style={{ background: '#0F172A', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
                    <pre style={{ margin: 0, padding: '14px 16px', fontSize: 11, fontFamily: 'monospace', lineHeight: 1.8, color: '#94A3B8' }}>{
`{
  "event":          `}<span style={{ color: '#F59E0B' }}>"payment.success"</span>{`,
  "transaction_id": `}<span style={{ color: '#F59E0B' }}>"TXN-XXXXXXXX"</span>{`,
  "merchant_ref":   `}<span style={{ color: '#F59E0B' }}>"ORDER-2026-001"</span>{`,
  "status":         `}<span style={{ color: '#10B981' }}>"SUCCESS"</span>{`,
  "amount":         `}<span style={{ color: '#34D399' }}>150000</span>{`,
  "date":           `}<span style={{ color: '#F59E0B' }}>"2026-05-01T14:32:00Z"</span>{`
}`}
                    </pre>
                  </div>

                  {/* Status meanings */}
                  <p style={{ color: '#94A3B8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Signification des statuts</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {[
                      { status: 'SUCCESS', color: '#10B981', bg: 'rgba(16,185,129,0.08)',  desc: 'Paiement reçu et validé par l\'opérateur'                },
                      { status: 'PENDING',  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  desc: 'Transaction initiée, en attente de confirmation Mobile Money' },
                      { status: 'FAILED',   color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   desc: 'Paiement rejeté (solde insuffisant, annulation…)'           },
                      { status: 'EXPIRED',  color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', desc: 'Délai de paiement dépassé (timeout session)'               },
                    ].map(s => (
                      <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, fontWeight: 700, background: s.bg, color: s.color, flexShrink: 0, minWidth: 64, textAlign: 'center' }}>{s.status}</span>
                        <span style={{ fontSize: 11, color: '#64748B' }}>{s.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </section>

        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#334155', fontSize: 12, margin: 0 }}>© 2026 YoungPay Collect · Documentation API v1</p>
      </footer>
    </div>
  )
}
