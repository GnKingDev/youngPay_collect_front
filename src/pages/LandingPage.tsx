import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import PaymentMethods from '../components/PaymentMethods'
import Features from '../components/Features'
import MerchantSection from '../components/MerchantSection'
import HowItWorks from '../components/HowItWorks'
import DeveloperSection from '../components/DeveloperSection'
import Pricing from '../components/Pricing'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />
      <main>
        <Hero />
        <PaymentMethods />
        <Features />
        <MerchantSection />
        <HowItWorks />
        <DeveloperSection />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
