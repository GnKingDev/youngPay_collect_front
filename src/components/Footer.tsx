import { Linkedin, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import logo from '../assets/logo.webp'

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
)

const footerLinks = {
  Produit: [
    { label: 'Fonctionnalités',     href: '#fonctionnalites' },
    { label: 'Tarifs',              href: '#tarifs' },
    { label: 'Moyens de paiement',  href: '#paiements' },
    { label: 'Sécurité',            href: '#' },
    { label: 'Mises à jour',        href: '#' },
  ],
  Développeurs: [
    { label: 'Documentation API', href: '/docs' },
    { label: 'Référence API',     href: '/docs' },
    { label: 'Webhooks',          href: '#' },
    { label: 'SDK & Librairies',  href: '#' },
    { label: 'Sandbox de test',   href: '#' },
  ],
  Entreprise: [
    { label: 'À propos',    href: '#' },
    { label: 'Blog',        href: '#' },
    { label: 'Partenaires', href: '#' },
    { label: 'Carrières',   href: '#' },
    { label: 'Contact',     href: '#' },
  ],
  Légal: [
    { label: "Conditions d'utilisation",   href: '#' },
    { label: 'Politique de confidentialité', href: '#' },
    { label: 'Cookies',                    href: '#' },
    { label: 'Conformité KYB/KYC',         href: '#' },
  ],
}

const socials = [
  { icon: <XIcon />,             href: '#', label: 'X (Twitter)' },
  { icon: <Linkedin className="w-4 h-4" />, href: '#', label: 'LinkedIn' },
  { icon: <FacebookIcon />,      href: '#', label: 'Facebook' },
  { icon: <InstagramIcon />,     href: '#', label: 'Instagram' },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: '#0F172A' }}>
      <div className="container-max px-6 relative z-10">

        {/* CTA Banner */}
        <div className="relative overflow-hidden rounded-2xl my-16 p-10 md:p-14 text-center"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', boxShadow: '0 20px 60px rgba(249,115,22,0.35)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-black/10 translate-y-1/2 -translate-x-1/3 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-bold text-3xl md:text-4xl text-white mb-3">
              Prêt à accepter des paiements en Guinée ?
            </h2>
            <p className="text-white/80 text-base mb-8 max-w-xl mx-auto">
              Rejoignez les premiers marchands guinéens qui font confiance à YoungPay Collect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#" className="inline-flex items-center justify-center gap-2 bg-white text-navy font-bold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5">
                Créer un compte gratuit <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#" className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 border border-white/30">
                Parler à un expert
              </a>
            </div>
          </div>
        </div>

        {/* Footer body */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-12 pb-12">

          {/* Brand */}
          <div className="col-span-2">
            <a href="#" className="inline-flex items-center mb-5">
              <div className="bg-white rounded-xl px-3 py-2">
                <img src={logo} alt="YoungPay Collect" className="h-8 w-auto" />
              </div>
            </a>
            <p className="text-navy-400 text-sm leading-relaxed mb-6 max-w-xs">
              La solution de paiement de référence pour les entreprises guinéennes.
              Simple, rapide et sécurisé.
            </p>

            <div className="space-y-2.5 mb-7">
              {[
                { icon: <MapPin className="w-3.5 h-3.5" />, text: 'Conakry, Guinée' },
                { icon: <Mail   className="w-3.5 h-3.5" />, text: 'contact@youngpaycollect.com' },
                { icon: <Phone  className="w-3.5 h-3.5" />, text: '+224 620 000 000' },
              ].map((c) => (
                <div key={c.text} className="flex items-center gap-2.5 text-navy-400 text-sm">
                  <span className="text-navy-600">{c.icon}</span>
                  {c.text}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {socials.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="w-9 h-9 rounded-lg border border-white/8 flex items-center justify-center text-navy-500 hover:text-white hover:border-primary hover:bg-primary/10 transition-all duration-200">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="col-span-1">
              <h4 className="font-bold text-white text-sm mb-4 tracking-wide">{group}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-navy-500 hover:text-white text-sm transition-colors duration-150">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-navy-600 text-sm">
            © {new Date().getFullYear()} YoungPay Collect. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-navy-600 text-xs">Tous les systèmes opérationnels</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-navy-600 hover:text-navy-400 text-xs transition-colors">CGU</a>
            <a href="#" className="text-navy-600 hover:text-navy-400 text-xs transition-colors">Confidentialité</a>
            <a href="#" className="text-navy-600 hover:text-navy-400 text-xs transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
