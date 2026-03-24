import React, { useState, useEffect } from 'react';
import Head from 'next/head';

const APP_URL = 'https://app.umbratraining.com';

// ── Pricing Data ──────
const GUIDES = [
  { name: 'Pérdida de Grasa', desc: 'Déficit real, refeeds, cardio. Sin perder músculo.', price: 399 },
  { name: 'Nutrición para Músculo', desc: 'Superávit óptimo, proteína, timing real.', price: 399 },
  { name: 'Selección de Ejercicios', desc: 'Los que funcionan, por grupo muscular, con variantes.', price: 399 },
  { name: 'Armar Tu Programa', desc: 'Volumen, frecuencia, RIR/RPE, periodización simple.', price: 399 },
];

const prices = {
  monthly:   { app: 299,   shadows: 799,   coaching: 1499,  appOrig: null, shadowsOrig: null, coachingOrig: null },
  quarterly: { app: 249,   shadows: 665,   coaching: 1249,  appOrig: 299,  shadowsOrig: 799,  coachingOrig: 1499 },
  biannual:  { app: 224,   shadows: 599,   coaching: 1124,  appOrig: 299,  shadowsOrig: 799,  coachingOrig: 1499 },
};

const packPrices = {
  monthly:   { shadows: null,          coaching: null },
  quarterly: { shadows: '$1,997 MXN',  coaching: '$3,747 MXN' },
  biannual:  { shadows: '$3,594 MXN',  coaching: '$6,894 MXN' },
};

const fmt = (n) => `$${n.toLocaleString('es-MX')}`;

const FLOW_STEPS = [
  { label: 'Blueprint', price: 'Gratis' },
  { label: 'Guías', price: '$399 MXN' },
  { label: 'Curso', price: '$1,497 MXN' },
  { label: 'App', price: '$299/mes' },
  { label: 'Shadows', price: '$799/mes' },
  { label: 'Coaching', price: '$1,499/mes' },
];

export default function HomePage() {
  const [period, setPeriod] = useState('monthly');
  const [blueprintEmail, setBlueprintEmail] = useState('');
  const [blueprintSent, setBlueprintSent] = useState(false);
  const [b2bEmail, setB2bEmail] = useState('');
  const [b2bSent, setB2bSent] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const header = document.querySelector('.site-nav');
    const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 40);
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

  const p = prices[period];

  return (
    <>
      <Head>
        <title>Umbra Training — Entrenamiento basado en evidencia</title>
        <meta name="description" content="Desde guías PDF hasta coaching 1:1 con la app más avanzada de fitness en español. Deja de adivinar." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ── NAV ── */}
      <nav className="site-nav">
        <div className="nav-logo">UMBRA <span>Training</span></div>
        <ul className="nav-links">
          <li><a href="#guias">Guías</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="#coaching">Coaching</a></li>
          <li><a href="#planes">Planes</a></li>
        </ul>
        <a href={APP_URL} className="btn-nav-cta">Empezar gratis</a>
      </nav>

      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-badge reveal">Entrenamiento basado en evidencia</div>
        <h1 className="hero-title reveal">
          El sistema completo.<br /><em>Sin adivinar.</em>
        </h1>
        <p className="hero-subtitle reveal">
          Desde guías PDF hasta coaching 1:1 con la app más avanzada de fitness en español.
        </p>
      </div>

      {/* ── ECOSYSTEM FLOW ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="flow-label reveal">Ecosistema</div>
        <p className="flow-sub reveal">Entra gratis. Avanza cuando quieras.</p>
        <div className="flow reveal">
          {FLOW_STEPS.map((step, i) => (
            <React.Fragment key={step.label}>
              {i > 0 && <div className="flow-arrow">→</div>}
              <div className="flow-step">
                <div className="flow-step-label">{step.label}</div>
                <div className="flow-step-price">{step.price}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      <hr className="divider" />

      {/* ── BLUEPRINT ── */}
      <section id="blueprint" className="section">
        <div className="section-inner">
          <div className="blueprint-card reveal">
            <div className="blueprint-content">
              <p className="section-label">Gratis</p>
              <h2 className="section-title" style={{ marginBottom: 12 }}>Blueprint PDF</h2>
              <p className="section-sub">
                Tu punto de partida. Los fundamentos de entrenamiento y nutrición que necesitas antes de cualquier programa.
              </p>
            </div>
            <div className="blueprint-form">
              {blueprintSent ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>¡Listo! Revisa tu email</p>
                  <p style={{ fontSize: 13, color: '#888' }}>Te enviamos el Blueprint PDF.</p>
                </div>
              ) : (
                <form onSubmit={handleBlueprint}>
                  <input type="email" placeholder="tu@email.com" value={blueprintEmail} onChange={(e) => setBlueprintEmail(e.target.value)} required />
                  <button type="submit" className="btn-primary" style={{ width: '100%' }}>Descargar Blueprint gratis</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ── GUÍAS ── */}
      <section id="guias" className="section">
        <div className="section-inner">
          <div className="section-label reveal">Información</div>
          <div className="section-title reveal">Guías y cursos</div>
          <div className="section-sub reveal" style={{ marginBottom: 48 }}>Compra una sola vez. Sin suscripción.</div>

          <div className="guides-grid reveal">
            {GUIDES.map((g) => (
              <div key={g.name} className="guide-card">
                <div className="guide-title">{g.name}</div>
                <div className="guide-desc">{g.desc}</div>
                <div className="guide-price">{fmt(g.price)} <span>MXN</span></div>
              </div>
            ))}
          </div>

          <div className="bundle-card reveal">
            <div className="bundle-info">
              <h3>Pack Completo — Las 4 guías</h3>
              <p>Ahorra $599 MXN comprando el pack</p>
            </div>
            <div className="bundle-right">
              <div className="bundle-save">Ahorras $599</div>
              <div className="bundle-price">{fmt(997)} <span>MXN</span></div>
              <a href="/guias#pack" className="btn-nav-cta">Comprar pack</a>
            </div>
          </div>

          {/* Curso */}
          <div className="bundle-card reveal" style={{ marginTop: 16 }}>
            <div className="bundle-info">
              <h3>Curso en Video — Pérdida de Grasa</h3>
              <p>Curso completo paso a paso con ejemplos reales</p>
            </div>
            <div className="bundle-right">
              <div className="bundle-price">{fmt(1497)} <span>MXN</span></div>
              <a href="/courses" className="btn-nav-cta">Ver curso</a>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ── APP + COACHING ── */}
      <section id="coaching" className="section">
        <div className="section-inner">
          <div className="section-label reveal">App & Coaching</div>
          <div className="section-title reveal">Umbra Shadows</div>
          <div className="section-sub reveal" style={{ marginBottom: 40 }}>La app más completa de fitness en español. Con o sin Carlo.</div>

          {/* Toggle */}
          <div className="toggle-wrapper reveal">
            {[
              { key: 'monthly', label: 'Mensual' },
              { key: 'quarterly', label: '3 meses', save: '−17%' },
              { key: 'biannual', label: '6 meses', save: '−25%' },
            ].map(({ key, label, save }) => (
              <button
                key={key}
                className={`toggle-btn${period === key ? ' active' : ''}`}
                onClick={() => setPeriod(key)}
              >
                {label}
                {save && <span className="toggle-save">{save}</span>}
              </button>
            ))}
          </div>

          {/* 3-Column Pricing Grid */}
          <div className="pricing-grid reveal" id="planes">
            {/* APP */}
            <div className="pricing-card">
              <div className="plan-name">App</div>
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="amount">{p.app.toLocaleString('es-MX')}</span>
                <span className="period">MXN/mes</span>
                {p.appOrig && <div className="original">${p.appOrig.toLocaleString('es-MX')} MXN/mes</div>}
                {packPrices[period].shadows === null && period !== 'monthly' && <div className="savings">Pack: {fmt(p.app * (period === 'quarterly' ? 3 : 6))} MXN</div>}
              </div>
              <div className="plan-desc">Engines completos. Sin Carlo. Trabaja solo con el sistema.</div>
              <ul className="features-list">
                <li className="highlight">Auto-ajuste de macros semanal</li>
                <li className="highlight">Generación de programas basados en evidencia</li>
                <li className="highlight">Periodización automatizada</li>
                <li>Bot de Telegram incluido</li>
                <li>Tracking offline</li>
                <li>Generador de listas del super</li>
                <li>Contest prep tools</li>
                <li className="muted">Sin acceso a Carlo</li>
              </ul>
              <a href={`${APP_URL}/register`} className="plan-cta secondary">Empezar gratis 7 días</a>
            </div>

            {/* SHADOWS — Featured */}
            <div className="pricing-card featured">
              <div className="featured-badge">MÁS POPULAR</div>
              <div className="plan-name">Shadows</div>
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="amount">{p.shadows.toLocaleString('es-MX')}</span>
                <span className="period">MXN/mes</span>
                {p.shadowsOrig && <div className="original">${p.shadowsOrig.toLocaleString('es-MX')} MXN/mes</div>}
                {packPrices[period].shadows && <div className="savings">Pack: {packPrices[period].shadows}</div>}
              </div>
              <div className="plan-desc">La app completa más check-in semanal con Carlo y Telegram.</div>
              <ul className="features-list">
                <li className="highlight">Todo lo del plan App</li>
                <li className="highlight">Check-in semanal con Carlo</li>
                <li className="highlight">Feedback personalizado semanal</li>
                <li>Telegram con respuesta &lt;24h</li>
                <li>Ajustes revisados por Carlo</li>
                <li>Análisis de correlación sueño/progreso</li>
                <li>Historial de ajustes y decisiones</li>
              </ul>
              <a href={`${APP_URL}/register`} className="plan-cta primary">Empezar ahora</a>
            </div>

            {/* COACHING */}
            <div className="pricing-card">
              <div className="plan-name">Coaching Full</div>
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="amount">{p.coaching.toLocaleString('es-MX')}</span>
                <span className="period">MXN/mes</span>
                {p.coachingOrig && <div className="original">${p.coachingOrig.toLocaleString('es-MX')} MXN/mes</div>}
                {packPrices[period].coaching && <div className="savings">Pack: {packPrices[period].coaching}</div>}
              </div>
              <div className="plan-desc">Atención 1:1 ilimitada. Carlo diseña, ajusta y responde todo.</div>
              <ul className="features-list">
                <li className="highlight">Todo lo del plan Shadows</li>
                <li className="highlight">Comunicación directa ilimitada</li>
                <li className="highlight">Programa 100% personalizado</li>
                <li>Ajustes en tiempo real</li>
                <li>Responde Carlo, no un equipo</li>
                <li>Mínimo 3 meses</li>
              </ul>
              <a href="#coaches" className="plan-cta secondary">Solicitar lugar</a>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ── B2B COACHES ── */}
      <section id="coaches" className="section">
        <div className="section-inner">
          <div className="section-label reveal">Para entrenadores</div>
          <div className="section-title reveal">Umbra para Coaches</div>
          <div className="section-sub reveal" style={{ marginBottom: 40 }}>Gestiona más clientes con la misma infraestructura que usa Carlo.</div>

          <div className="b2b-grid reveal">
            <div className="b2b-card">
              <div className="plan-name">Básico</div>
              <div className="b2b-seats">Hasta 15 atletas</div>
              <div className="b2b-price">{fmt(999)} <span>MXN/mes</span></div>
              <div className="b2b-extra">+ $55 MXN por atleta adicional</div>
              <ul className="features-list">
                <li className="highlight">Gestión completa de atletas</li>
                <li className="highlight">Workout logging, nutrición, check-ins</li>
                <li>Templates de programas</li>
                <li>Panel del coach</li>
                <li className="muted">Sin engines automáticos</li>
              </ul>
            </div>
            <div className="b2b-card" style={{ borderColor: '#222' }}>
              <div className="plan-name">Pro</div>
              <div className="b2b-seats">Hasta 40 atletas</div>
              <div className="b2b-price">{fmt(1499)} <span>MXN/mes</span></div>
              <div className="b2b-extra">+ $35 MXN por atleta adicional</div>
              <ul className="features-list">
                <li className="highlight">Todo lo del plan Básico</li>
                <li className="highlight">30+ engines algorítmicos activos</li>
                <li className="highlight">Auto-ajustes automáticos</li>
                <li>Historial y seguimiento por atleta</li>
                <li>Cola de decisiones pendientes</li>
                <li>Alertas de riesgo de abandono</li>
              </ul>
            </div>
          </div>

          {/* Waitlist */}
          <div className="waitlist-card reveal">
            <h3>Acceso anticipado para coaches</h3>
            <p>Actualmente en beta privada. Deja tu correo para ser de los primeros.</p>
            {b2bSent ? (
              <p className="waitlist-success">Te avisaremos cuando lancemos. Gracias.</p>
            ) : (
              <form className="waitlist-form" onSubmit={handleB2bWaitlist}>
                <input type="email" placeholder="tucorreo@gmail.com" value={b2bEmail} onChange={(e) => setB2bEmail(e.target.value)} required />
                <button type="submit">Unirme</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="site-footer">
        <p>© 2026 Umbra Training · <span>@carlomgf</span> · contacto@umbratraining.com</p>
        <p style={{ marginTop: 8 }}>Precios en pesos mexicanos (MXN) · IVA incluido</p>
      </footer>
    </>
  );
}
