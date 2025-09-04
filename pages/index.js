import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import PaymentModal from '../components/PaymentModal';

const HomePage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activePromotions, setActivePromotions] = useState([]);
  const [featuredPromo, setFeaturedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(true);

  const openModal = (plan) => {
    setSelectedPlan(plan);
  };

  const closeModal = () => {
    setSelectedPlan(null);
  };

  // Cargar promociones activas
  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const response = await fetch('/api/active-promotions');
        const data = await response.json();
        
        if (data.success) {
          setActivePromotions(data.promotions);
          setFeaturedPromo(data.featured);
        }
      } catch (error) {
        console.warn('No se pudieron cargar promociones:', error);
      } finally {
        setPromoLoading(false);
      }
    };

    loadPromotions();

    // Actualizar promociones cada 5 minutos
    const interval = setInterval(loadPromotions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Calcular precio con descuento
  const calculateDiscountedPrice = (originalPrice, promotion) => {
    if (!promotion) return originalPrice;
    
    if (promotion.type === 'percentage') {
      return Math.round(originalPrice - (originalPrice * promotion.value / 100));
    } else if (promotion.type === 'fixed') {
      return Math.max(originalPrice - promotion.value, 1);
    }
    return originalPrice;
  };

  // Obtener mejor promoción para un plan
  const getBestPromotionForPlan = (planTitle, planPrice) => {
    return activePromotions.find(promo => {
      if (promo.plans[0] === 'all' || 
          promo.plans.some(validPlan => planTitle.toLowerCase().includes(validPlan.toLowerCase()))) {
        return planPrice >= promo.minimumAmount;
      }
      return false;
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Animations
      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.classList.add('visible');
              }
          });
      }, { threshold: 0.1 });
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

      // Header
      const header = document.querySelector('.header');
      window.addEventListener('scroll', () => {
          if (window.scrollY > 50) {
              header?.classList.add('scrolled');
          } else {
              header?.classList.remove('scrolled');
          }
      });

      // Particles
      const canvas = document.getElementById('particle-canvas');
      if (canvas) {
          const ctx = canvas.getContext('2d');
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          let particlesArray;

          let mouse = { x: null, y: null, radius: (canvas.height/120) * (canvas.width/120) };
          window.addEventListener('mousemove', e => {
              mouse.x = e.x;
              mouse.y = e.y;
          });

          class Particle {
              constructor(x, y, directionX, directionY, size, color) {
                  this.x = x; this.y = y; this.directionX = directionX; this.directionY = directionY; this.size = size; this.color = color;
              }
              draw() {
                  ctx.beginPath();
                  ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                  ctx.fillStyle = 'rgba(207, 35, 35, 0.5)';
                  ctx.fill();
              }
              update() {
                  if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
                  if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

                  let dx = mouse.x - this.x;
                  let dy = mouse.y - this.y;
                  let distance = Math.sqrt(dx*dx + dy*dy);
                  if (distance < mouse.radius + this.size) {
                      if (mouse.x < this.x && this.x < canvas.width - this.size * 10) this.x += 5;
                      if (mouse.x > this.x && this.x > this.size * 10) this.x -= 5;
                      if (mouse.y < this.y && this.y < canvas.height - this.size * 10) this.y += 5;
                      if (mouse.y > this.y && this.y > this.size * 10) this.y -= 5;
                  }
                  this.x += this.directionX;
                  this.y += this.directionY;
                  this.draw();
              }
          }

          function initParticles() {
              particlesArray = [];
              let numberOfParticles = (canvas.height * canvas.width) / 9000;
              for (let i = 0; i < numberOfParticles; i++) {
                  let size = (Math.random() * 2) + 1;
                  let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                  let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                  let directionX = (Math.random() * 0.4) - 0.2;
                  let directionY = (Math.random() * 0.4) - 0.2;
                  particlesArray.push(new Particle(x, y, directionX, directionY, size));
              }
          }

          function animateParticles() {
              requestAnimationFrame(animateParticles);
              ctx.clearRect(0, 0, innerWidth, innerHeight);
              for (let i = 0; i < particlesArray.length; i++) {
                  particlesArray[i].update();
              }
          }
          
          initParticles();
          animateParticles();
          
          window.addEventListener('resize', () => {
              canvas.width = innerWidth;
              canvas.height = innerHeight;
              mouse.radius = (canvas.height/120) * (canvas.width/120);
              initParticles();
          });
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>Umbra Coaching - Transformación Física Real</title>
        <meta name="description" content="Planes de entrenamiento y nutrición personalizados con resultados garantizados. Transforma tu físico con el método Umbra Coaching." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Cormorant+Garamond:wght@400;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      
      <canvas id="particle-canvas"></canvas>

      {/* Banner promocional flotante */}
      {featuredPromo && !promoLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: `linear-gradient(135deg, ${featuredPromo.bannerColor}, ${featuredPromo.bannerColor}CC)`,
          color: 'white',
          padding: '12px 20px',
          zIndex: 1001,
          textAlign: 'center',
          fontSize: '0.9rem',
          fontWeight: '600',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          animation: 'slideDown 0.5s ease-out'
        }}>
          🔥 {featuredPromo.bannerText}
          {featuredPromo.countdown && (
            <span style={{
              marginLeft: '10px',
              background: 'rgba(255,255,255,0.2)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.8rem'
            }}>
              ⏰ {featuredPromo.countdown}
            </span>
          )}
          <style jsx>{`
            @keyframes slideDown {
              from { transform: translateY(-100%); }
              to { transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      <header className="header" style={{ marginTop: featuredPromo ? '60px' : '0' }}>
        <div className="container">
          <a href="#" className="logo">Umbra Coaching</a>
          <nav className="nav-links">
            <a href="#filosofia">Filosofía</a>
            <a href="#planes">Planes</a>
            <a href="#contacto">Contacto</a>
          </nav>
        </div>
      </header>

      <main>
        <section id="hero" className="hero">
          <div className="container">
            <h1 className="hero-title glitch" data-text="TRANSFORMA TU FÍSICO">TRANSFORMA TU FÍSICO</h1>
            <p className="hero-subtitle reveal">Planes de entrenamiento y nutrición personalizados para resultados reales. Deja de adivinar y empieza a construir la mejor versión de ti.</p>
            
            {/* Mostrar promoción destacada en hero */}
            {featuredPromo && (
              <div className="reveal" style={{
                background: `linear-gradient(135deg, ${featuredPromo.bannerColor}20, ${featuredPromo.bannerColor}10)`,
                border: `2px solid ${featuredPromo.bannerColor}`,
                borderRadius: '16px',
                padding: '20px',
                margin: '30px auto',
                maxWidth: '500px',
                textAlign: 'center'
              }}>
                <h3 style={{
                  color: featuredPromo.bannerColor,
                  fontSize: '1.3rem',
                  fontFamily: 'var(--font-sigil)',
                  marginBottom: '10px'
                }}>
                  {featuredPromo.name}
                </h3>
                <p style={{
                  color: 'var(--color-soul)',
                  marginBottom: '15px'
                }}>
                  {featuredPromo.savings}
                </p>
                <div style={{
                  background: featuredPromo.bannerColor,
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'inline-block',
                  fontSize: '0.9rem',
                  fontWeight: '700'
                }}>
                  Código: {featuredPromo.code}
                </div>
              </div>
            )}
            
            <a href="#planes" className="button reveal" style={{transitionDelay: '0.2s'}}>Ver Planes</a>
          </div>
        </section>

        <section id="filosofia" className="section">
          <div className="container">
            <div className="section-header reveal">
              <h2 className="section-title">El Método Umbra Coaching</h2>
              <p className="section-subtitle">Creemos en un enfoque inteligente y basado en la ciencia. Cada plan de entrenamiento y nutrición es una herramienta de precisión, diseñada para optimizar tu progreso y eliminar las conjeturas. Dejamos atrás las rutinas genéricas para enfocarnos en lo que realmente funciona para ti.</p>
            </div>
          </div>
        </section>

        <section id="planes" className="section">
          <div className="container">
            <div className="section-header reveal">
              <h2 className="section-title">Elige Tu Plan</h2>
              <p className="section-subtitle">Planes diseñados para adaptarse a tu nivel de compromiso y tus objetivos. Ya sea que busques perder grasa, ganar músculo o mejorar tu rendimiento, aquí comienza tu transformación.</p>
            </div>

            <div className="pricing-grid">
              {/* Plan Coaching Mensual */}
              <div className="pricing-card reveal">
                <div className="card-content">
                  <p className="tag">Acceso por un Mes</p>
                  <h3 className="plan-name">Coaching Mensual</h3>
                  
                  {/* Precio con promoción */}
                  {(() => {
                    const promotion = getBestPromotionForPlan('Coaching Mensual', 1199);
                    const discountedPrice = calculateDiscountedPrice(1199, promotion);
                    return (
                      <div>
                        {promotion ? (
                          <div>
                            <p style={{
                              fontSize: '1.5rem',
                              color: '#9ca3af',
                              textDecoration: 'line-through',
                              margin: '0 0 5px 0'
                            }}>
                              $1,199
                            </p>
                            <p className="price">
                              ${discountedPrice} <span className="price-term">MXN/único</span>
                            </p>
                            <div style={{
                              background: promotion.bannerColor,
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              display: 'inline-block',
                              marginBottom: '15px'
                            }}>
                              🔥 {promotion.value}% OFF con {promotion.code}
                            </div>
                          </div>
                        ) : (
                          <p className="price">$1,199 <span className="price-term">MXN/único</span></p>
                        )}
                      </div>
                    );
                  })()}
                  
                  <ul className="features">
                    <li>Acceso completo a la plataforma Umbra</li>
                    <li>Supervisión y seguimiento personalizado</li>
                    <li>Soporte directo vía Telegram</li>
                    <li>Análisis de progreso mensual</li>
                    <li>Ajustes de rutina en tiempo real</li>
                    <li>Comunidad exclusiva de miembros</li>
                    <li><b>Válido por 30 días</b></li>
                  </ul>
                  <div className="checkout-btn-container">
                    <button onClick={() => openModal({ title: 'Coaching Mensual', price: 1199 })} className="button">Forjar Pacto</button>
                  </div>
                </div>
              </div>

              {/* Plan Transformación Acelerada */}
              <div className="pricing-card reveal" style={{transitionDelay: '0.2s'}}>
                <div className="card-content">
                  <p className="tag">Plan de 15 Semanas</p>
                  <h3 className="plan-name">Transformación Acelerada</h3>
                  
                  {/* Precio con promoción */}
                  {(() => {
                    const promotion = getBestPromotionForPlan('Transformación Acelerada', 2999);
                    const discountedPrice = calculateDiscountedPrice(2999, promotion);
                    return (
                      <div>
                        {promotion ? (
                          <div>
                            <p style={{
                              fontSize: '1.5rem',
                              color: '#9ca3af',
                              textDecoration: 'line-through',
                              margin: '0 0 5px 0'
                            }}>
                              $2,999
                            </p>
                            <p className="price">
                              ${discountedPrice} <span className="price-term">MXN</span>
                            </p>
                            <div style={{
                              background: promotion.bannerColor,
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              display: 'inline-block',
                              marginBottom: '15px'
                            }}>
                              🔥 {promotion.value}% OFF con {promotion.code}
                            </div>
                          </div>
                        ) : (
                          <p className="price">$2,999 <span className="price-term">MXN</span></p>
                        )}
                      </div>
                    );
                  })()}

                  <ul className="features">
                    <li>Protocolo de nutrición y entrenamiento</li>
                    <li>Estrategia de suplementación</li>
                    <li>Acceso completo a la App</li>
                    <li>Soporte 1-a-1 por Telegram</li>
                    <li><b>Sincronización quincenal por videollamada</b></li>
                  </ul>
                  <div className="checkout-btn-container">
                    <button onClick={() => openModal({ title: 'Transformación Acelerada', price: 2999 })} className="button">Forjar Pacto</button>
                  </div>
                </div>
              </div>

              {/* Plan Metamorfosis Completa */}
              <div className="pricing-card reveal" style={{transitionDelay: '0.4s'}}>
                <div className="card-content">
                  <p className="tag">Plan de 30 Semanas</p>
                  <h3 className="plan-name">Metamorfosis Completa</h3>
                  
                  {/* Precio con promoción */}
                  {(() => {
                    const promotion = getBestPromotionForPlan('Metamorfosis Completa', 4299);
                    const discountedPrice = calculateDiscountedPrice(4299, promotion);
                    return (
                      <div>
                        {promotion ? (
                          <div>
                            <p style={{
                              fontSize: '1.5rem',
                              color: '#9ca3af',
                              textDecoration: 'line-through',
                              margin: '0 0 5px 0'
                            }}>
                              $4,299
                            </p>
                            <p className="price">
                              ${discountedPrice} <span className="price-term">MXN</span>
                            </p>
                            <div style={{
                              background: promotion.bannerColor,
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              display: 'inline-block',
                              marginBottom: '15px'
                            }}>
                              🔥 {promotion.value}% OFF con {promotion.code}
                            </div>
                          </div>
                        ) : (
                          <p className="price">$4,299 <span className="price-term">MXN</span></p>
                        )}
                      </div>
                    );
                  })()}

                  <ul className="features">
                    <li>Todos los elementos del plan de 15 semanas</li>
                    <li>Planificación a largo plazo</li>
                    <li>Ajustes prioritarios del sistema</li>
                    <li><b>La transformación más profunda</b></li>
                  </ul>
                  <div className="checkout-btn-container">
                    <button onClick={() => openModal({ title: 'Metamorfosis Completa', price: 4299 })} className="button">Forjar Pacto</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de promociones especiales */}
            {activePromotions.length > 0 && (
              <div style={{
                marginTop: '4rem',
                textAlign: 'center'
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-sigil)',
                  fontSize: '1.8rem',
                  color: 'var(--color-ember)',
                  marginBottom: '2rem',
                  textTransform: 'uppercase'
                }}>
                  🎫 Cupones Activos
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem',
                  maxWidth: '1000px',
                  margin: '0 auto'
                }}>
                  {activePromotions.slice(0, 3).map((promo, index) => (
                    <div key={promo.id} style={{
                      background: `linear-gradient(135deg, ${promo.bannerColor}15, ${promo.bannerColor}05)`,
                      border: `2px solid ${promo.bannerColor}30`,
                      borderRadius: '16px',
                      padding: '1.5rem',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        background: promo.bannerColor,
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '0 0 0 16px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {promo.urgencyText}
                      </div>
                      
                      <h4 style={{
                        color: promo.bannerColor,
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        marginBottom: '0.5rem',
                        fontFamily: 'var(--font-sigil)'
                      }}>
                        {promo.value}% OFF
                      </h4>
                      
                      <p style={{
                        color: 'var(--color-soul)',
                        fontSize: '0.9rem',
                        marginBottom: '1rem'
                      }}>
                        {promo.description}
                      </p>
                      
                      <div style={{
                        background: 'var(--color-abyss)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: `1px solid ${promo.bannerColor}`,
                        marginBottom: '1rem'
                      }}>
                        <span style={{
                          color: 'var(--color-smoke)',
                          fontSize: '0.8rem'
                        }}>
                          Código:
                        </span>
                        <span style={{
                          color: promo.bannerColor,
                          fontSize: '1rem',
                          fontWeight: '700',
                          marginLeft: '8px',
                          fontFamily: 'var(--font-code)'
                        }}>
                          {promo.code}
                        </span>
                      </div>
                      
                      <p style={{
                        color: 'var(--color-ember)',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}>
                        {promo.savings}
                      </p>
                      
                      {promo.countdown && (
                        <p style={{
                          color: '#f59e0b',
                          fontSize: '0.8rem',
                          marginTop: '0.5rem',
                          fontWeight: '600'
                        }}>
                          ⏰ Termina en {promo.countdown}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div style={{
                  marginTop: '2rem',
                  padding: '1rem',
                  background: 'rgba(207, 35, 35, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(207, 35, 35, 0.3)'
                }}>
                  <p style={{
                    color: 'var(--color-ember)',
                    fontSize: '0.9rem',
                    margin: 0
                  }}>
                    💡 <strong>Tip:</strong> Usa estos códigos al momento del pago para obtener tu descuento automáticamente
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer id="contacto" className="footer">
        <div className="container">
          <p>&copy; 2025 Umbra Coaching // El Santuario es eterno.</p>
          <p>Las comunicaciones se inician a través del nexo en <a href="https://t.me/kojicoachbot" target="_blank">Telegram</a>.</p>
        </div>
      </footer>

      <PaymentModal plan={selectedPlan} onClose={closeModal} />
    </>
  );
};

export default HomePage;
