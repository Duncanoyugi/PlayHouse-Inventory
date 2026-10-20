import { Link, Navigate } from 'react-router-dom'
import { ArrowRight, Boxes, ClipboardCheck, Gamepad2, LineChart, ShieldCheck, Truck } from 'lucide-react'
import { ROUTES } from '../routes/route-constants'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'

const FEATURES = [
  { icon: Boxes, title: 'Live stock levels', text: 'Always know what is on the shelf, what is running low and what needs reordering.' },
  { icon: Truck, title: 'Incoming & outgoing', text: 'Store keepers record every delivery and every sale in seconds, with a full trail.' },
  { icon: ClipboardCheck, title: 'Purchasing control', text: 'Managers raise, approve and track purchase orders from supplier to shelf.' },
  { icon: LineChart, title: 'Reports that matter', text: 'Valuation, movement and top-seller reports ready whenever you need them.' },
  { icon: ShieldCheck, title: 'Role-based access', text: 'Each person only sees and does what their job requires.' },
]

export default function LandingPage() {
  usePageTitle('Stock control for Playhouse')
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />

  return (
    <div className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white"><Gamepad2 className="h-5 w-5" /></span>
          <span className="text-lg font-bold tracking-tight text-fg">Playhouse <span className="text-brand-600">Inventory</span></span>
        </div>
        <Link to={ROUTES.LOGIN} className="btn btn-primary">Sign in</Link>
      </header>

      <section className="relative mx-auto max-w-6xl overflow-hidden px-5 pb-16 pt-12 sm:pt-20">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="badge badge-blue">Built for Playhouse Electronics</span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-fg sm:text-6xl">
            Every item in. Every item out. <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">Accounted for.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
            A fast, reliable inventory system for the shop floor and the back office. No more guesswork, no more missing stock.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to={ROUTES.LOGIN} className="btn btn-primary btn-lg">Open the system <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card card-pad transition hover:-translate-y-0.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/12 text-brand-600 dark:text-brand-300"><Icon className="h-5 w-5" /></span>
            <h3 className="mt-4 text-base font-semibold text-fg">{title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted">{text}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-line py-6 text-center text-sm text-muted">&copy; {new Date().getFullYear()} Playhouse Electronics. All rights reserved.</footer>
    </div>
  )
}
