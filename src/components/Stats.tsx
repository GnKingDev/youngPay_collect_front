import { useEffect, useRef, useState } from 'react'
import { stats } from '../data/mockData'

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    const isDecimal = target % 1 !== 0
    const step = target / (duration / 16)
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(isDecimal ? Math.round(current * 10) / 10 : Math.floor(current))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, start])
  return count
}

function StatCard({ stat, animate }: { stat: typeof stats[0]; animate: boolean }) {
  const count = useCountUp(stat.value, 1800, animate)
  const display = stat.value % 1 !== 0 ? count.toFixed(1) : count.toLocaleString('fr-FR')
  return (
    <div className="text-center">
      <div className="font-bold text-5xl md:text-6xl text-white mb-2 tabular-nums">
        <span className="opacity-80">{stat.prefix}</span>
        {display}
        <span className="text-3xl md:text-4xl opacity-90">{stat.suffix}</span>
      </div>
      <p className="text-white/70 font-medium text-base">{stat.label}</p>
    </div>
  )
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimate(true) },
      { threshold: 0.4 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="section-pad relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-black/5 translate-y-1/2 -translate-x-1/3 pointer-events-none" />
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="container-max relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-bold text-3xl md:text-4xl text-white mb-2">
            YoungPay Collect en chiffres
          </h2>
          <p className="text-white/70 text-base">Nos résultats depuis le lancement en Guinée</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-14">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} animate={animate} />
          ))}
        </div>
      </div>
    </section>
  )
}
