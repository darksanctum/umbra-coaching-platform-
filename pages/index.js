import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

// ─── Pricing Data ──────
const GUIDES = [
  { name: 'Pérdida de Grasa', desc: 'Déficit inteligente, refeeds, diet breaks. Todo para bajar sin destruir tu metabolismo.', price: 399 },
  { name: 'Nutrición para Músculo', desc: 'Superávit controlado, timing, y cómo maximizar síntesis proteica sin acumular grasa.', price: 399 },
  { name: 'Selección de Ejercicios', desc: 'Qué ejercicios elegir según tu anatomía. Sin ejercicios inútiles.', price: 399 },
  { name: 'Armar Tu Programa', desc: 'Volumen, frecuencia, intensidad. Cómo estructurar tu semana de entrenamiento.', price: 399 },
];

const COACHING_PLANS = {
  shadows: {
    name: 'Shadows',
    desc: 'Entrenamiento + nutrición automatizados. Tu sistema inteligente de training.',
    features: [
      'Programa personalizado AI',
      'Nutrición adaptativa',
      'Tracking de progreso',
      'Auto-ajuste semanal',
      'Soporte en la app',
    ],
    monthly: 799,
    quarterly: 1997,
    biannual: 3594,
  },
  coaching: {
    name: 'Coaching',
    desc: 'Supervisión directa 1:1. Tu coach contigo todo el proceso.',
    features: [
      'Todo lo de Shadows',
      'Check-ins semanales 1:1',
      'Plan 100% personalizado',
      'Telegram directo con Carlo',
      'Ajustes en tiempo real',
      'Videollamada mensual',
    ],
    monthly: 1499,
    quarterly: 3747,
    biannual: 6894,
  },
};

const APP_URL = 'https://app.umbratraining.com';

// ─── Components ──────

const PricingToggle = ({ period, setPeriod }) => (
  <div className="pricing-toggle-center">
    <div className="pricing-toggle-wrap">
      {[
        { key: 'monthly', label: 'Mensual' },
        { key: 'quarterly', label: '3 meses' },
        { key: 'biannual', label: '6 meses' },
      ].map(({ key, label }) => (
        <button
          key={key}
          className={`pricing-toggle-btn${period === key ? ' active' : ''}`}
          onClick={() => setPeriod(key)}
        >
          {label}
          {key === 'biannual' && <span className="pricing-save">-25%</span>}
        </button>
      ))}
    </div>
  </div>
);

const formatPrice = (n) => `$${n.toLocaleString('es-MX')}`;

const periodLabel = { monthly: '/mes', quarterly: '/3 meses', biannual: '/6 meses' };

// ─── Main Page ──────

export default function HomePage() {
  const [period, setPeriod] = useState('monthly');
  const [blueprintEmail, setBlueprintEmail] = useState('');
  const [blueprintSent, setBlueprintSent] = useState(false);
  const [b2bEmail, setB2bEmail] = useState('');
  const [b2bSent, setB2bSent] = useState(false);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Header scroll
  useEffect(() => {
    const header = document.querySelector('.header');
    const onScroll = () => {
      header?.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleBlueprint = async (e) => {
    e.preventDefault();
    if (!blueprintEmail) return;
    try {
      await fetch('/api/blueprint-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: blueprintEmail }),
      });
    } catch (_) {}
    setBlueprintSent(true);
  };

  const handleB2bWaitlist = async (e) => {
    e.preventDefault();
    if (!b2bEmail) return;
    try {
      await fetch('/api/b2b-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: b2bEmail }),
      });
    } catch (_) {}
    setB2bSent(true);
  };

  return (
    <>
      <Head>
        <title>Umbra Training — Entrenamiento basado en ciencia</title>
        <meta name="description" content="Guías, app y coaching personalizado de entrenamiento y nutrición. Deja de adivinar, empieza a progresar." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ─── Header ─── */}
      <header className="header">
        <div className="container">
          <a href="#" className="logo">Umbra Training</a>
          <nav className="nav-links">
            <a href="#blueprint">Blueprint</a>
            <a href="#guias">Guías</a>
            <a href="#app">App</a>
            <a href="#coaching">Coaching</a>
            <a href={APP_URL} className="nav-cta">Iniciar sesión</a>
          </nav>
        </div>
      </header>

      <main>
        {/* ─── Hero ─── */}
        <section className="hero">
          <div className="container">
            <div className="hero-badge reveal">
              <span className="hero-badge-dot" />
              Entrenamiento basado en ciencia
            </div>
            <h1 className="hero-title reveal reveal-delay-1">
              Deja de adivinar.<br />
              <span>Empieza a progresar.</span>
            </h1>
            <p className="hero-subtitle reveal reveal-delay-2">
              Guías, app y coaching personalizado para transformar tu físico con un sistema inteligente de entrenamiento y nutrición.
            </p>
            <div className="hero-actions reveal reveal-delay-3">
              <a href="#blueprint" className="btn-primary">Blueprint gratis →</a>
              <a href="#coaching" className="btn-secondary">Ver planes</a>
            </div>
          </div>
        </section>

        {/* ─── Blueprint (Lead Magnet) ─── */}
        <section id="blueprint" className="section">
          <div className="container">
            <div className="blueprint-card reveal">
              <div className="blueprint-card-content">
                <p className="section-label">Gratis</p>
                <h2 className="section-title" style={{ marginBottom: 12 }}>Blueprint PDF</h2>
                <p className="section-subtitle" style={{ marginBottom: 0 }}>
                  Tu punto de partida. Los fundamentos de entrenamiento y nutrición que necesitas antes de cualquier programa. Sin relleno, solo lo que funciona.
                </p>
              </div>
              <div className="blueprint-card-form">
                {blueprintSent ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>¡Listo! Revisa tu email</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Te enviamos el Blueprint PDF.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBlueprint}>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={blueprintEmail}
                      onChange={(e) => setBlueprintEmail(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                      Descargar Blueprint gratis
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Guías (Información) ─── */}
        <section id="guias" className="section">
          <div className="container">
            <div className="section-header reveal">
              <p className="section-label">Información</p>
              <h2 className="section-title">Guías de Entrenamiento</h2>
              <p className="section-subtitle">
                Todo el conocimiento que necesitas para entrenar con intención. Cada guía es una pieza del sistema.
              </p>
            </div>

            <div className="cards-grid">
              {GUIDES.map((g, i) => (
                <div key={g.name} className={`card reveal reveal-delay-${Math.min(i + 1, 3)}`}>
                  <p className="card-tag">Guía individual</p>
                  <h3 className="card-title">{g.name}</h3>
                  <p className="card-desc">{g.desc}</p>
                  <p className="card-price">{formatPrice(g.price)} <span>MXN</span></p>
                  <div className="card-cta">
                    <a href="/guias" className="btn-secondary">Ver más</a>
                  </div>
                </div>
              ))}
            </div>

            {/* Pack completo */}
            <div className="reveal mt-48" style={{ maxWidth: 540, margin: '48px auto 0' }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <p className="card-tag">Pack 4 guías</p>
                <h3 className="card-title">Pack Completo</h3>
                <p className="card-desc">Las 4 guías en un solo pago. Ahorra más de $500.</p>
                <p className="card-price" style={{ fontSize: 36 }}>{formatPrice(997)} <span>MXN</span></p>
                <div className="card-cta">
                  <a href="/guias#pack-completo" className="btn-primary">Obtener pack</a>
                </div>
              </div>
            </div>

            {/* Curso */}
            <div className="reveal mt-48" style={{ maxWidth: 540, margin: '48px auto 0' }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <p className="card-tag">Curso en video</p>
                <h3 className="card-title">Curso: Pérdida de Grasa</h3>
                <p className="card-desc">Curso completo en video. Aprende el sistema paso a paso con ejemplos reales.</p>
                <p className="card-price" style={{ fontSize: 36 }}>{formatPrice(1497)} <span>MXN</span></p>
                <div className="card-cta">
                  <a href="/courses" className="btn-primary">Ver curso</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── App ─── */}
        <section id="app" className="section">
          <div className="container">
            <div className="app-showcase reveal">
              <div style={{ flex: 1 }}>
                <p className="section-label">App</p>
                <h2 className="section-title" style={{ marginBottom: 12 }}>Tu entrenamiento, resuelto</h2>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.65 }}>
                  25+ programas, tracking inteligente, y recomendación personalizada. Funciona como app en tu teléfono.
                </p>
                <div className="app-features-list">
                  {['25+ Programas', 'Tracking de progreso', 'Recomendación AI', 'PWA instalable', 'Auto-ajuste', 'Para tu objetivo'].map((f) => (
                    <div key={f} className="app-feature-item">{f}</div>
                  ))}
                </div>
                <p className="card-price" style={{ marginTop: 24 }}>
                  {formatPrice(299)} <span>MXN / mes</span>
                </p>
                <div style={{ marginTop: 20 }}>
                  <a href={APP_URL + '/register'} className="btn-primary">Empezar →</a>
                </div>
              </div>
              <div style={{ flex: '0 0 280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: 220, height: 400,
                  borderRadius: 28,
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  color: 'var(--text-faint)',
                }}>
                  app.umbratraining.com
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Coaching (Shadows + Coaching) ─── */}
        <section id="coaching" className="section">
          <div className="container">
            <div className="section-header reveal text-center">
              <p className="section-label">Coaching</p>
              <h2 className="section-title" style={{ maxWidth: 600, margin: '0 auto 16px' }}>
                Supervisión inteligente o coaching directo
              </h2>
              <p className="section-subtitle mx-auto">
                Elige el nivel de acompañamiento que necesitas. Desde sistemas automatizados hasta coaching 1:1 conmigo.
              </p>
            </div>

            <PricingToggle period={period} setPeriod={setPeriod} />

            <div className="coaching-grid" style={{ marginTop: 32 }}>
              {Object.entries(COACHING_PLANS).map(([key, plan]) => (
                <div key={key} className={`coaching-card reveal${key === 'coaching' ? ' featured' : ''}`}>
                  <p className="card-tag">{key === 'coaching' ? 'Coaching 1:1' : 'Automatizado'}</p>
                  <h3 className="coaching-name">{plan.name}</h3>
                  <p className="coaching-desc">{plan.desc}</p>
                  <p className="coaching-price">
                    {formatPrice(plan[period])}
                    <span className="coaching-price-label"> MXN {periodLabel[period]}</span>
                  </p>
                  <ul className="card-features">
                    {plan.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <div className="card-cta">
                    <a href={APP_URL + '/register'} className="btn-primary">
                      {key === 'coaching' ? 'Aplicar a coaching' : 'Comenzar'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── B2B Coaches ─── */}
        <section id="coaches" className="section">
          <div className="container">
            <div className="b2b-card reveal">
              <p className="section-label">Para Coaches</p>
              <h2 className="section-title" style={{ marginBottom: 12 }}>
                Usa Umbra con tus atletas
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 560, lineHeight: 1.65 }}>
                Plataforma completa para coaches: onboarding, engines de nutrición y entrenamiento, tracking y comunicación. Próximamente.
              </p>

              <div className="b2b-tiers">
                <div className="b2b-tier">
                  <p className="b2b-tier-name">Básico</p>
                  <p className="b2b-tier-cap">Hasta 15 atletas</p>
                  <p className="b2b-tier-price">{formatPrice(999)} <span>MXN / mes</span></p>
                </div>
                <div className="b2b-tier">
                  <p className="b2b-tier-name">Pro</p>
                  <p className="b2b-tier-cap">Hasta 40 atletas</p>
                  <p className="b2b-tier-price">{formatPrice(1499)} <span>MXN / mes</span></p>
                </div>
              </div>

              {b2bSent ? (
                <p style={{ marginTop: 32, fontSize: 14, color: 'var(--text-secondary)' }}>
                  ✓ Te avisaremos cuando lancemos. Gracias.
                </p>
              ) : (
                <form className="b2b-form" onSubmit={handleB2bWaitlist}>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={b2bEmail}
                    onChange={(e) => setB2bEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-secondary">Unirme a la lista</button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <p className="footer-brand">Umbra Training</p>
              <p className="footer-brand-desc">
                Entrenamiento y nutrición basados en ciencia. Tu sistema inteligente para progresar.
              </p>
            </div>
            <div className="footer-col">
              <p className="footer-col-title">Información</p>
              <a href="/blueprint">Blueprint</a>
              <a href="/guias">Guías</a>
              <a href="/courses">Cursos</a>
              <a href="/blog">Blog</a>
            </div>
            <div className="footer-col">
              <p className="footer-col-title">Producto</p>
              <a href={APP_URL}>App</a>
              <a href="#coaching">Coaching</a>
              <a href="#coaches">Para Coaches</a>
            </div>
            <div className="footer-col">
              <p className="footer-col-title">Contacto</p>
              <a href="https://instagram.com/umbratraining" target="_blank" rel="noopener">Instagram</a>
              <a href="https://t.me/Umbratraining" target="_blank" rel="noopener">Telegram</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">© 2026 Umbra Training. Todos los derechos reservados.</p>
            <div className="footer-legal">
              <a href="/privacy">Privacidad</a>
              <a href="/terms">Términos</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
