import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X, ArrowRight } from 'lucide-react'
import { navLinks } from '../data/mockData'
import logo from '../assets/logo.webp'

export default function Navbar() {
  const navigate = useNavigate()
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-navy-200/60'
          : 'bg-transparent'
      }`}
    >
      <div className="container-max px-6">
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src={logo} alt="YoungPay Collect" className="h-14 w-auto" style={{ mixBlendMode: 'multiply' }} />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-navy-600 hover:text-navy font-medium text-sm rounded-lg hover:bg-navy-50 transition-all duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/connexion')}
              className="px-5 py-2.5 text-navy font-semibold text-sm rounded-xl border-2 border-navy-200 hover:border-primary hover:text-primary transition-all duration-150 bg-white"
            >
              Connexion
            </button>
            <button onClick={() => navigate('/inscription')} className="btn-primary text-sm py-2.5 px-5">
              Commencer
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-navy-100 transition-colors text-navy"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="bg-white border-t border-navy-100 px-6 py-5 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-navy-700 font-medium text-sm rounded-xl hover:bg-navy-50 transition-all"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <button onClick={() => navigate('/connexion')} className="btn-secondary justify-center">Connexion</button>
            <button onClick={() => navigate('/inscription')} className="btn-primary justify-center">
              Commencer <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
