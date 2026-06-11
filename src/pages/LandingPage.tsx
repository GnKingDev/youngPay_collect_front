import { lazy, Suspense, useEffect, useRef, useState } from 'react'

// Above the fold — chargés immédiatement
import Navbar from '../components/Navbar'
import Hero   from '../components/Hero'

// Below the fold — lazy loaded
const PaymentMethods   = lazy(() => import('../components/PaymentMethods'))
const Features         = lazy(() => import('../components/Features'))
const MerchantSection  = lazy(() => import('../components/MerchantSection'))
const HowItWorks       = lazy(() => import('../components/HowItWorks'))
const DeveloperSection = lazy(() => import('../components/DeveloperSection'))
const Pricing          = lazy(() => import('../components/Pricing'))
const Footer           = lazy(() => import('../components/Footer'))

function useLazySection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible])

  return { ref, visible }
}

const SectionFallback = () => (
  <div className="h-24 flex items-center justify-center">
    <div className="w-5 h-5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin opacity-30" />
  </div>
)

function LazySection({ children }: { children: React.ReactNode }) {
  const { ref, visible } = useLazySection()
  return (
    <div ref={ref}>
      {visible
        ? <Suspense fallback={<SectionFallback />}>{children}</Suspense>
        : <SectionFallback />}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />
      <main>
        <Hero />
        <LazySection><PaymentMethods /></LazySection>
        <LazySection><Features /></LazySection>
        <LazySection><MerchantSection /></LazySection>
        <LazySection><HowItWorks /></LazySection>
        <LazySection><DeveloperSection /></LazySection>
        <LazySection><Pricing /></LazySection>
      </main>
      <LazySection><Footer /></LazySection>
    </div>
  )
}
