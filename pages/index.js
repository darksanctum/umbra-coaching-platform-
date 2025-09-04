import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import PaymentModal from '../components/PaymentModal';

const HomePage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activePromotions, setActivePromotions] = useState({});
  const [timeLeft, setTimeLeft] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Obtener promociones activas
  const fetchActivePromotions = async () => {
    try {
      const response = await fetch('/api/active-promotions');
      if (response.ok) {
        const data = await response.json();
        setActivePromotions(data.promotions || {});
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      // Establecer promociones por defecto si falla la API
      setActivePromotions({
        'Coaching Mensual': { type: 'percentage', value: 50 },
        'Transformación Acelerada': { type: 'percentage', value: 35 },
        'Metamorfosis Completa': { type: 'percentage', value: 25 }
      });
    }
  };

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const promoEnd = now + (7 * 24 * 60 * 60 * 1000); // 7 días desde ahora
      
      const distance = promoEnd - now;
      
      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchActivePromotions();
  }, []);

  const openModal = (plan) => {
    setSelectedPlan(plan);
  };

  const closeModal = () => {
    setSelectedPlan(null);
  };

  // Calcular precio con descuento - SIMPLIFICADO
  const getDiscountedPrice = (originalPrice, planName) => {
    const promo = activePromotions[planName];
    if (!promo) return { final: originalPrice, discount: 0, hasDiscount: false };
    
    const discountAmount = promo.type === 'percentage' 
      ? Math.round((originalPrice * promo.value) / 100)
      : promo.value;
    
    return {
      final: Math.round(originalPrice - discountAmount),
      discount: discountAmount,
      percentage: promo.value,
      hasDiscount: true
    };
  };

  // Formatear precio sin decimales innecesarios
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('MX$', '$');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Animations con Intersection Observer
      const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry, index) => {
              if (entry.isIntersecting) {
                  setTimeout(() => {
                      entry.target.classList.add('visible');
                  }, index * 100); // Delay escalonado
              }
          });
      }, { threshold: 0.1 });
      
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

      // Solo cursor en desktop
      if (!isMobile) {
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorOutline = document.querySelector('.cursor-outline');
        
        const handleMouseMove = (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            if(cursorDot) {
                cursorDot.style.left = `${posX}px`;
                cursorDot.style.top = `${posY}px`;
            }
            if(cursorOutline) {
                cursorOutline.animate({
                    left: `${posX}px`,
                    top: `${posY}px`
                }, { duration: 500, fill: "forwards" });
            }
        };
        
        window.addEventListener('mousemove', handleMouseMove);
      }

      // Header con efecto de scroll
      const header = document.querySelector('.header');
      const handleScroll = () => {
          if (window.scrollY > 50) {
              header?.classList.add('scrolled');
          } else {
              header?.classList.remove('scrolled');
          }
      };
      
      window.addEventListener('scroll', handleScroll);

      // Particles solo en desktop para mejor rendimiento
      if (!isMobile) {
        const canvas = document.getElementById('particle-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            let particlesArray = [];

            let mouse = { x: null, y: null, radius: (canvas.height/120) * (canvas.width/120) };
            
            const handleMouseMoveCanvas = (e) => {
                mouse.x = e.x;
                mouse.y = e.y;
            };
            
            window.addEventListener('mousemove', handleMouseMoveCanvas);

            class Particle {
                constructor(x, y, directionX, directionY, size) {
                    this.x = x; 
                    this.y = y; 
                    this.directionX = directionX; 
                    this.directionY = directionY; 
                    this.size = size;
                }
                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                    ctx.fillStyle = 'rgba(207, 35, 35, 0.3)';
                    ctx.fill();
                }
                update() {
                    if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
                    if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx*dx + dy*dy);
                    if (distance < mouse.radius + this.size) {
                        if (mouse.x < this.x && this.x < canvas.width - this.size * 10) this.x += 3;
                        if (mouse.x > this.x && this.x > this.size * 10) this.x -= 3;
                        if (mouse.y < this.y && this.y < canvas.height - this.size * 10) this.y += 3;
                        if (mouse.y > this.y && this.y > this.size * 10) this.y -= 3;
                    }
                    this.x += this.directionX;
                    this.y += this.directionY;
                    this.draw();
                }
            }

            function initParticles() {
                particlesArray = [];
                let numberOfParticles = (canvas.height * canvas.width) / 12000;
                for (let i = 0; i < numberOfParticles; i++) {
                    let size = (Math.random() * 1.5) + 0.5;
                    let x = (Math.random() * ((window.innerWidth - size * 2) - (size * 2)) + size * 2);
                    let y = (Math.random() * ((window.innerHeight - size * 2) - (size * 2)) + size * 2);
                    let directionX = (Math.random() * 0.3) - 0.15;
                    let directionY = (Math.random() * 0.3) - 0.15;
                    particlesArray.push(new Particle(x, y, directionX, directionY, size));
                }
            }

            function animateParticles() {
                requestAnimationFrame(animateParticles);
                ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
                for (let i = 0; i < particlesArray.length; i++) {
                    particlesArray[i].update();
                }
            }
            
            initParticles();
            animateParticles();
            
            const handleResize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                mouse.radius = (canvas.height/120) * (canvas.width/120);
                initParticles();
            };
            
            window.addEventListener('resize', handleResize);
        }
      }

      // Animaciones adicionales para elementos interactivos
      const cards = document.querySelectorAll('.pricing-card');
      cards.forEach(card => {
        const handleMouseEnter = () => {
          if (!isMobile) {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.transition = 'all 0.3s ease';
          }
        };
        
        const handleMouseLeave = () => {
          if (!isMobile) {
            card.style.transform = 'translateY(0) scale(1)';
          }
        };
        
        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);
      });

      // Efecto de parallax suave en el hero
      const handleScrollParallax = () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero && !isMobile) {
          hero.style.transform = `translateY(${scrolled * 0.05}px)`;
        }
      };
      
      window.addEventListener('scroll', handleScrollParallax);

      // Cleanup function
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('scroll', handleScrollParallax);
      };
    }
  }, [isMobile]);

  return (
    <>
      <Head>
        <title>Umbra Coaching - Transforma Tu Físico</title>
        <meta name="description" content="Planes de entrenamiento y nutrición personalizados para resultados reales. Coaching profesional con hasta 50% de descuento." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Cormorant+Garamond:wght@400;700&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      
      {!isMobile && <canvas id="particle-canvas"></canvas>}
      {!isMobile && <div className="cursor-dot"></div>}
      {!isMobile && <div className="cursor-outline"></div>}

      {/* Banner de Promoción SIMPLIFICADO */}
      {Object.keys(activePromotions).length > 0 && (
        <div className="promo-banner">
          🔥 DESCUENTOS ACTIVOS: Hasta 50% OFF - Termina en {timeLeft.days || 0}d {timeLeft.hours || 0}h {timeLeft.minutes || 0}m
        </div>
      )}

      <header className={`header ${Object.keys(activePromotions).length > 0 ? 'with-banner' : ''}`}>
        <div className="container">
          <a href="#" className="logo">
            Umbra Coaching
          </a>
          <nav className="nav-links">
            <a href="#filosofia">Filosofía</a>
            <a href="#planes">Planes</a>
            <a href="#contacto">Contacto</a>
          </nav>
          
          {/* Menú hamburguesa animado para móvil */}
          {isMobile && (
            <div className="hamburger-menu">
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </div>
          )}
        </div>
      </header>

      <main>
        <section id="hero" className="hero">
          <div className="container">
            <h1 
              className="hero-title glitch reveal" 
              data-text="TRANSFORMA TU FÍSICO"
            >
              TRANSFORMA TU FÍSICO
            </h1>
            
            <p className="hero-subtitle reveal">
              Planes de entrenamiento y nutrición personalizados para resultados reales. 
              Deja de adivinar y empieza a construir la mejor versión de ti.
            </p>
            
            {/* PROMOCIÓN HERO SIMPLIFICADA */}
            {Object.keys(activePromotions).length > 0 && (
              <div className="promo-hero reveal">
                <div className="promo-title">
                  ⚡ OFERTA ESPECIAL ACTIVA
                </div>
                
                <div className="promo-discount">
                  HASTA 50% DE DESCUENTO
                </div>
                
                {/* Countdown simplificado */}
                <div className="countdown-container">
                  <div className="countdown-item">
                    <div className="countdown-number">{timeLeft.days || 0}</div>
                    <div className="countdown-label">DÍAS</div>
                  </div>
                  <div className="countdown-item">
                    <div className="countdown-number">{timeLeft.hours || 0}</div>
                    <div className="countdown-label">HRS</div>
                  </div>
                  <div className="countdown-item">
                    <div className="countdown-number">{timeLeft.minutes || 0}</div>
                    <div className="countdown-label">MIN</div>
                  </div>
                </div>
                
                <div className="promo-tip">
                  🎯 Usa el código <strong>BIENVENIDO50</strong> al pagar
                </div>
              </div>
            )}
            
            <a href="#planes" className="button reveal cta-button">
              Ver Planes Disponibles
            </a>
          </div>
        </section>

        <section id="filosofia" className="section">
          <div className="container">
            <div className="section-header reveal">
              <h2 className="section-title animated-title">
                El Método Umbra Coaching
              </h2>
              <p className="section-subtitle">
                Creemos en un enfoque inteligente y basado en la ciencia. Cada plan de entrenamiento y nutrición es una herramienta de precisión, diseñada para optimizar tu progreso y eliminar las conjeturas.
              </p>
            </div>
          </div>
        </section>

        <section id="planes" className="section">
          <div className="container">
            <div className="section-header reveal">
              <h2 className="section-title animated-title">
                Elige Tu Plan
              </h2>
              <p className="section-subtitle">
                Planes diseñados para adaptarse a tu nivel de compromiso y objetivos.
              </p>
            </div>

            <div className="pricing-grid">
              {/* Plan Coaching Mensual */}
              <div className="pricing-card reveal animated-card">
                {activePromotions['Coaching Mensual'] && (
                  <div className="discount-badge">
                    -{getDiscountedPrice(1199, 'Coaching Mensual').percentage}% OFF
                  </div>
                )}
                
                <div className="card-content">
                  <p className="tag">Acceso por un Mes</p>
                  <h3 className="plan-name">Coaching Mensual</h3>
                  
                  <div className="price-container">
                    {activePromotions['Coaching Mensual'] ? (
                      <div className="price-with-discount">
                        <div className="original-price">
                          {formatPrice(1199)}
                        </div>
                        <div className="final-price">
                          {formatPrice(getDiscountedPrice(1199, 'Coaching Mensual').final)}
                        </div>
                        <div className="price-term">MXN</div>
                      </div>
                    ) : (
                      <div className="price-normal">
                        <div className="final-price">
                          {formatPrice(1199)}
                        </div>
                        <div className="price-term">MXN</div>
                      </div>
                    )}
                  </div>
                  
                  <ul className="features">
                    <li>✓ Acceso completo a la plataforma Umbra</li>
                    <li>✓ Supervisión y seguimiento personalizado</li>
                    <li>✓ Soporte directo vía Telegram</li>
                    <li>✓ Análisis de progreso mensual</li>
                    <li>✓ Ajustes de rutina en tiempo real</li>
                    <li>✓ Comunidad exclusiva de miembros</li>
                    <li><strong>✓ Válido por 30 días</strong></li>
                  </ul>
                  
                  <div className="checkout-btn-container">
                    <button 
                      onClick={() => openModal({ 
                        title: 'Coaching Mensual', 
                        price: activePromotions['Coaching Mensual'] ? 
                               getDiscountedPrice(1199, 'Coaching Mensual').final : 1199 
                      })} 
                      className="button plan-button"
                    >
                      Comenzar Ahora
                    </button>
                  </div>
                </div>
              </div>

              {/* Plan Transformación Acelerada */}
              <div className="pricing-card reveal animated-card popular-plan">
                <div className="popular-badge">
                  MÁS POPULAR
                </div>
                
                {activePromotions['Transformación Acelerada'] && (
                  <div className="discount-badge">
                    -{getDiscountedPrice(2999, 'Transformación Acelerada').percentage}% OFF
                  </div>
                )}
                
                <div className="card-content">
                  <p className="tag">Plan de 15 Semanas</p>
                  <h3 className="plan-name">Transformación Acelerada</h3>
                  
                  <div className="price-container">
                    {activePromotions['Transformación Acelerada'] ? (
                      <div className="price-with-discount">
                        <div className="original-price">
                          {formatPrice(2999)}
                        </div>
                        <div className="final-price">
                          {formatPrice(getDiscountedPrice(2999, 'Transformación Acelerada').final)}
                        </div>
                        <div className="price-term">MXN</div>
                      </div>
                    ) : (
                      <div className="price-normal">
                        <div className="final-price">
                          {formatPrice(2999)}
                        </div>
                        <div className="price-term">MXN</div>
                      </div>
                    )}
                  </div>
                  
                  <ul className="features">
                    <li>✓ Protocolo de nutrición y entrenamiento</li>
                    <li>✓ Estrategia de suplementación</li>
                    <li>✓ Acceso completo a la App</li>
                    <li>✓ Soporte 1-a-1 por Telegram</li>
                    <li><strong>✓ Videollamadas quincenales</strong></li>
                  </ul>
                  
                  <div className="checkout-btn-container">
                    <button 
                      onClick={() => openModal({ 
                        title: 'Transformación Acelerada', 
                        price: activePromotions['Transformación Acelerada'] ? 
                               getDiscountedPrice(2999, 'Transformación Acelerada').final : 2999 
                      })} 
                      className="button plan-button popular-button"
                    >
                      Transformarme Ahora
                    </button>
                  </div>
                </div>
              </div>

              {/* Plan Metamorfosis Completa */}
              <div className="pricing-card reveal animated-card">
                {activePromotions['Metamorfosis Completa'] && (
                  <div className="discount-badge">
                    -{getDiscountedPrice(4299, 'Metamorfosis Completa').percentage}% OFF
                  </div>
                )}
                
                <div className="card-content">
                  <p className="tag">Plan de 30 Semanas</p>
                  <h3 className="plan-name">Metamorfosis Completa</h3>
                  
                  <div className="price-container">
                    {activePromotions['Metamorfosis Completa'] ? (
                      <div className="price-with-discount">
                        <div className="original-price">
                          {formatPrice(4299)}
                        </div>
                        <div className="final-price">
                          {formatPrice(getDiscountedPrice(4299, 'Metamorfosis Completa').final)}
                        </div>
                        <div className="price-term">MXN</div>
                      </div>
                    ) : (
                      <div className="price-normal">
                        <div className="final-price">
                          {formatPrice(4299)}
                        </div>
                        <div className="price-term">MXN</div>
                      </div>
                    )}
                  </div>
                  
                  <ul className="features">
                    <li>✓ Todo lo del plan de 15 semanas</li>
                    <li>✓ Planificación a largo plazo</li>
                    <li>✓ Ajustes prioritarios del sistema</li>
                    <li><strong>✓ La transformación más profunda</strong></li>
                  </ul>
                  
                  <div className="checkout-btn-container">
                    <button 
                      onClick={() => openModal({ 
                        title: 'Metamorfosis Completa', 
                        price: activePromotions['Metamorfosis Completa'] ? 
                               getDiscountedPrice(4299, 'Metamorfosis Completa').final : 4299 
                      })} 
                      className="button plan-button"
                    >
                      Evolucionar Completamente
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mensaje de descuento simplificado */}
            {Object.keys(activePromotions).length > 0 && (
              <div className="discount-info reveal">
                <div className="discount-info-title">
                  💡 ¿Cómo obtener tu descuento?
                </div>
                <div className="discount-info-text">
                  Es súper fácil: Al hacer clic en cualquier plan, usa el código
                </div>
                <div className="discount-code">
                  BIENVENIDO50
                </div>
                <div className="discount-info-sub">
                  Se aplicará automáticamente el 50% de descuento
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer id="contacto" className="footer">
        <div className="container">
          <p>&copy; 2025 Umbra Coaching // El Santuario es eterno.</p>
          <p>Las comunicaciones se inician a través del nexo en <a href="https://t.me/kojicoachbot" target="_blank" rel="noopener noreferrer">Telegram</a>.</p>
        </div>
      </footer>

      <PaymentModal plan={selectedPlan} onClose={closeModal} />
    </>
  );
};

export default HomePage;
