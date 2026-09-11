import { ArrowRight, Boxes, ClipboardList, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import '../styles/landing.css'

export const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <a className="landing-brand" href="/" aria-label="PlayHouse Inventory home">
          <span className="landing-brand-mark"><Boxes size={19} strokeWidth={2.4} /></span>
          <span>PlayHouse Inventory</span>
        </a>
        <nav className="landing-nav-links" aria-label="Main navigation">
          <a href="#capabilities">Capabilities</a>
          <a href="#how-it-works">How it works</a>
          <a href="/login" className="landing-login-link">Team sign in <ArrowRight size={14} /></a>
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-hero" id="overview">
          <div className="landing-copy">
            <div className="landing-eyebrow">Inventory operations, made clear</div>
            <h1>Know what you have. <em>Move with confidence.</em></h1>
            <p className="landing-description">PlayHouse Inventory gives your team one reliable place to manage products, suppliers, purchase orders, and every stock movement in between.</p>
            <div className="landing-hero-actions"><a className="landing-primary-button" href="/login">Enter your workspace <ArrowRight size={16} /></a><a className="landing-text-button" href="#capabilities">See what it does <ArrowRight size={15} /></a></div>
            <p className="landing-note"><ShieldCheck size={15} /> Built for accountable, everyday operations</p>
          </div>
          <div className="landing-hero-art" aria-label="Illustration of connected inventory operations">
            <div className="landing-art-sun" />
            <div className="landing-art-rack"><span /><span /><span /></div>
            <div className="landing-art-box landing-art-box-one"><PackageCheck size={24} /></div>
            <div className="landing-art-box landing-art-box-two"><Boxes size={20} /></div>
            <div className="landing-art-box landing-art-box-three"><ClipboardList size={22} /></div>
            <div className="landing-art-label landing-art-label-one">Stock levels</div>
            <div className="landing-art-label landing-art-label-two">Purchase orders</div>
            <div className="landing-art-label landing-art-label-three">Every movement</div>
          </div>
        </section>

        <section className="landing-intro-band"><span>From receiving bay to stock report</span><strong>One source of truth for the whole team.</strong><span>Always know the next right move <ArrowRight size={15} /></span></section>

        <section className="landing-capabilities" id="capabilities">
          <div className="landing-section-heading"><div className="landing-eyebrow">Everything in its place</div><h2>The practical clarity your operation needs.</h2><p>Replace scattered spreadsheets and guesswork with a system that keeps the important details connected.</p></div>
          <div className="landing-capability-grid">
            <article className="landing-capability landing-capability-featured"><span className="landing-capability-icon"><Boxes size={22} /></span><h3>See your real inventory position</h3><p>Track products, categories, brands, locations, and low-stock signals without chasing updates across different tools.</p><a href="/login">Explore inventory <ArrowRight size={15} /></a></article>
            <article className="landing-capability"><span className="landing-capability-icon"><Truck size={22} /></span><h3>Bring purchasing into the picture</h3><p>Keep suppliers, purchase orders, and goods receipts connected from request to arrival.</p></article>
            <article className="landing-capability"><span className="landing-capability-icon"><ShieldCheck size={22} /></span><h3>Make every movement accountable</h3><p>Understand what changed, when it changed, and who made the update with a dependable audit trail.</p></article>
          </div>
        </section>

        <section className="landing-process" id="how-it-works">
          <div className="landing-process-heading"><div className="landing-eyebrow">A simpler rhythm</div><h2>Move inventory forward, one clear step at a time.</h2></div>
          <div className="landing-process-steps"><div><span>01</span><h3>Receive</h3><p>Record what arrived and match it to the order.</p></div><div><span>02</span><h3>Organise</h3><p>Keep stock, locations, and product details current.</p></div><div><span>03</span><h3>Decide</h3><p>Use reports and alerts to act before issues become delays.</p></div></div>
        </section>
      </main>

      <footer className="landing-footer"><p>© 2026 PlayHouse Inventory</p><div className="landing-footer-links"><a href="#capabilities">Capabilities</a><a href="#how-it-works">How it works</a><a href="/login">Team sign in</a></div></footer>
    </div>
  )
}
