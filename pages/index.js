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
        window.addEventListener('mousemove', function (e) {
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
        });
      }

      // Header con efecto de scroll
      const header = document.querySelector('.header');
      window.addEventListener('scroll', () => {
          if (window.scrollY > 50) {
              header.classList.add('scrolled');
          } else {
              header.classList.remove('scrolled');
          }
      });

      // Particles solo en desktop para mejor rendimiento
      if (!isMobile) {
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
                    let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                    let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                    let directionX = (Math.random() * 0.3) - 0.15;
                    let directionY = (Math.random() * 0.3) - 0.15;
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

      // Animaciones adicionales para elementos interactivos
      const cards = document.querySelectorAll('.pricing-card');
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0) scale(1)';
        });
      });

      // Efecto de parallax suave en el hero
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero && !isMobile) {
          hero.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
      });
    }
  }, [isMobile]);

  return (
    <>
      <Head>
        <title>Umbra Coaching</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Cormorant+Garamond:wght@400;700&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      {!isMobile && <canvas id="particle-canvas"></canvas>}
      {!isMobile && <div className="cursor-dot"></div>}
      {!isMobile && <div className="cursor-outline"></div>}

      {/* Banner de Promoción SIMPLIFICADO */}
      {Object.keys(activePromotions).length > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(90deg, #CF2323, #8b0000)',
          color: 'white',
          padding: isMobile ? '8px' : '12px',
          textAlign: 'center',
          fontSize: isMobile ? '13px' : '14px',
          fontWeight: 'bold',
          zIndex: 9999,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          animation: 'slideDown 0.5s ease-out'
        }}>
          🔥 DESCUENTOS ACTIVOS: Hasta 50% OFF - Termina en {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </div>
      )}

      <header className="header" style={{ 
        paddingTop: Object.keys(activePromotions).length > 0 ? (isMobile ? '45px' : '50px') : '0' 
      }}>
        <div className="container">
          <a href="#" className="logo" style={{ 
            fontSize: isMobile ? '1.4rem' : '1.8rem',
            transition: 'all 0.3s ease'
          }}>
            Umbra Coaching
          </a>
          <nav className="nav-links" style={{ display: isMobile ? 'none' : 'flex' }}>
            <a href="#filosofia">Filosofía</a>
            <a href="#planes">Planes</a>
            <a href="#contacto">Contacto</a>
          </nav>
          
          {/* Menú hamburguesa animado para móvil */}
          {isMobile && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ 
                width: '20px', 
                height: '2px', 
                background: '#CF2323',
                transition: 'all 0.3s ease'
              }}></div>
              <div style={{ 
                width: '20px', 
                height: '2px', 
                background: '#CF2323',
                transition: 'all 0.3s ease'
              }}></div>
              <div style={{ 
                width: '20px', 
                height: '2px', 
                background: '#CF2323',
                transition: 'all 0.3s ease'
              }}></div>
            </div>
          )}
        </div>
      </header>

      <main>
        <section id="hero" className="hero" style={{ 
          minHeight: isMobile ? '80vh' : '100vh',
          padding: isMobile ? '2rem 0' : '0'
        }}>
          <div className="container">
            <h1 
              className="hero-title glitch reveal" 
              data-text="TRANSFORMA TU FÍSICO"
              style={{
                fontSize: isMobile ? 'clamp(2rem, 8vw, 3.5rem)' : 'clamp(3rem, 10vw, 6rem)',
                animation: 'fadeInUp 1s ease-out'
              }}
            >
              TRANSFORMA TU FÍSICO
            </h1>
            
            <p className="hero-subtitle reveal" style={{
              fontSize: isMobile ? '1rem' : '1.2rem',
              margin: isMobile ? '0 auto 30px auto' : '0 auto 40px auto',
              animation: 'fadeInUp 1s ease-out 0.2s both'
            }}>
              Planes de entrenamiento y nutrición personalizados para resultados reales. 
              Deja de adivinar y empieza a construir la mejor versión de ti.
            </p>
            
            {/* PROMOCIÓN HERO SIMPLIFICADA */}
            {Object.keys(activePromotions).length > 0 && (
              <div className="reveal promo-hero" style={{
                background: 'linear-gradient(135deg, rgba(207, 35, 35, 0.15), rgba(139, 0, 0, 0.15))',
                border: '2px solid #CF2323',
                borderRadius: '20px',
                padding: isMobile ? '25px' : '35px',
                margin: '40px auto',
                maxWidth: '550px',
                textAlign: 'center',
                animation: 'fadeInUp 1s ease-out 0.4s both, pulse 3s infinite 2s',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  fontSize: isMobile ? '1.3rem' : '1.5rem',
                  fontWeight: 'bold',
                  color: '#CF2323',
                  marginBottom: '20px',
                  textShadow: '0 0 10px rgba(207, 35, 35, 0.3)'
                }}>
                  ⚡ OFERTA ESPECIAL ACTIVA
                </div>
                
                <div style={{
                  fontSize: isMobile ? '2rem' : '2.5rem',
                  fontWeight: 'bold',
                  marginBottom: '20px',
                  background: 'linear-gradient(45deg, #CF2323, #ff4444)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'glow 2s ease-in-out infinite alternate'
                }}>
                  HASTA 50% DE DESCUENTO
                </div>
                
                {/* Countdown simplificado */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: isMobile ? '15px' : '25px',
                  marginBottom: '25px'
                }}>
                  <div className="countdown-item">
                    <div style={{ 
                      fontSize: isMobile ? '1.5rem' : '1.8rem', 
                      fontWeight: 'bold',
                      color: '#CF2323'
                    }}>
                      {timeLeft.days || 0}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#A1A1AA' }}>DÍAS</div>
                  </div>
                  <div className="countdown-item">
                    <div style={{ 
                      fontSize: isMobile ? '1.5rem' : '1.8rem', 
                      fontWeight: 'bold',
                      color: '#CF2323'
                    }}>
                      {timeLeft.hours || 0}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#A1A1AA' }}>HRS</div>
                  </div>
                  <div className="countdown-item">
                    <div style={{ 
                      fontSize: isMobile ? '1.5rem' : '1.8rem', 
                      fontWeight: 'bold',
                      color: '#CF2323'
                    }}>
                      {timeLeft.minutes || 0}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#A1A1AA' }}>MIN</div>
                  </div>
                </div>
                
                <div style={{
                  fontSize: isMobile ? '0.95rem' : '1.1rem',
                  color: '#E5E7EB',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  🎯 Usa el código <strong style={{color: '#CF2323'}}>BIENVENIDO50</strong> al pagar
                </div>
              </div>
            )}
            
            <a href="#planes" className="button reveal cta-button" style={{
              transitionDelay: '0.6s',
              fontSize: isMobile ? '0.9rem' : '1rem',
              padding: isMobile ? '16px 32px' : '18px 36px',
              animation: 'fadeInUp 1s ease-out 0.6s both'
            }}>
              Ver Planes Disponibles
            </a>
          </div>
        </section>

        <section id="filosofia" className="section" style={{
          padding: isMobile ? '80px 0' : '150px 0'
        }}>
          <div className="container">
            <div className="section-header reveal">
              <h2 className="section-title animated-title" style={{
                fontSize: isMobile ? 'clamp(1.8rem, 6vw, 2.2rem)' : 'clamp(2.2rem, 5vw, 3rem)'
              }}>
                El Método Umbra Coaching
              </h2>
              <p className="section-subtitle" style={{
                fontSize: isMobile ? '1rem' : 'clamp(1.1rem, 3vw, 1.3rem)'
              }}>
                Creemos en un enfoque inteligente y basado en la ciencia. Cada plan de entrenamiento y nutrición es una herramienta de precisión, diseñada para optimizar tu progreso y eliminar las conjeturas.
              </p>
            </div>
          </div>
        </section>

        <section id="planes" className="section" style={{
          padding: isMobile ? '80px 0' : '150px 0'
        }}>
          <div className="container">
            <div className="section-header reveal">
              <h2 className="section-title animated-title" style={{
                fontSize: isMobile ? 'clamp(1.8rem, 6vw, 2.2rem)' : 'clamp(2.2rem, 5vw, 3rem)'
              }}>
                Elige Tu Plan
              </h2>
              <p className="section-subtitle" style={{
                fontSize: isMobile ? '1rem' : 'clamp(1.1rem, 3vw, 1.3rem)'
              }}>
                Planes diseñados para adaptarse a tu nivel de compromiso y objetivos.
              </p>
            </div>

            <div className="pricing-grid" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: isMobile ? '30px' : '40px',
              alignItems: 'stretch'
            }}>
              {/* Plan Coaching Mensual */}
              <div className="pricing-card reveal animated-card" style={{
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                {activePromotions['Coaching Mensual'] && (
                  <div className="discount-badge">
                    -{getDiscountedPrice(1199, 'Coaching Mensual').percentage}% OFF
                  </div>
                )}
                
                <div className="card-content">
                  <p className="tag">Acceso por un Mes</p>
                  <h3 className="plan-name" style={{
                    fontSize: isMobile ? '1.6rem' : '2rem'
                  }}>
                    Coaching Mensual
                  </h3>
                  
                  <div className="price-container" style={{ marginBottom: '20px' }}>
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
                      style={{
                        width: '100%',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Evolucionar Completamente
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mensaje de descuento simplificado */}
            {Object.keys(activePromotions).length > 0 && (
              <div className="discount-info reveal" style={{
                marginTop: '50px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(207, 35, 35, 0.1), rgba(139, 0, 0, 0.1))',
                border: '2px solid rgba(207, 35, 35, 0.3)',
                borderRadius: '15px',
                padding: '30px',
                maxWidth: '600px',
                margin: '50px auto 0',
                animation: 'fadeInUp 1s ease-out'
              }}>
                <div style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: 'bold', 
                  marginBottom: '15px',
                  color: '#CF2323'
                }}>
                  💡 ¿Cómo obtener tu descuento?
                </div>
                <div style={{ 
                  fontSize: '1.1rem', 
                  marginBottom: '10px',
                  lineHeight: '1.6'
                }}>
                  Es súper fácil: Al hacer clic en cualquier plan, usa el código
                </div>
                <div style={{
                  display: 'inline-block',
                  background: '#CF2323',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  fontFamily: 'Inter, monospace',
                  letterSpacing: '1px',
                  margin: '10px 0',
                  animation: 'pulse 2s infinite'
                }}>
                  BIENVENIDO50
                </div>
                <div style={{ 
                  fontSize: '0.95rem', 
                  color: '#A1A1AA',
                  marginTop: '10px'
                }}>
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
          <p>Las comunicaciones se inician a través del nexo en <a href="https://t.me/kojicoachbot" target="_blank">Telegram</a>.</p>
        </div>
      </footer>

      <PaymentModal plan={selectedPlan} onClose={closeModal} />
      
      <style jsx>{`
        /* === ANIMACIONES === */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(207, 35, 35, 0.4);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(207, 35, 35, 0);
          }
        }
        
        @keyframes glow {
          from {
            text-shadow: 0 0 10px rgba(207, 35, 35, 0.5);
          }
          to {
            text-shadow: 0 0 20px rgba(207, 35, 35, 0.8), 0 0 30px rgba(207, 35, 35, 0.4);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* === ESTILOS DE PRECIOS MEJORADOS === */
        .price-container {
          margin: 20px 0;
        }
        
        .price-with-discount {
          text-align: center;
        }
        
        .original-price {
          font-size: 1.2rem;
          color: #9ca3af;
          text-decoration: line-through;
          margin-bottom: 5px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
        }
        
        .final-price {
          font-size: 3rem;
          font-weight: 800;
          color: #CF2323;
          margin-bottom: 5px;
          font-family: 'Inter', sans-serif;
          line-height: 1;
          text-shadow: 0 2px 4px rgba(207, 35, 35, 0.3);
        }
        
        .price-normal .final-price {
          color: var(--color-soul);
          font-size: 3rem;
        }
        
        .price-term {
          font-size: 1rem;
          color: var(--color-smoke);
          font-weight: 600;
          font-family: 'Inter', sans-serif;
        }

        /* === BADGES === */
        .discount-badge {
          position: absolute;
          top: -10px;
          right: 20px;
          background: linear-gradient(45deg, #CF2323, #ff4444);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: bold;
          z-index: 10;
          animation: pulse 2s infinite;
          box-shadow: 0 4px 15px rgba(207, 35, 35, 0.4);
        }
        
        .popular-badge {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(45deg, #gold, #orange);
          background: #FFD700;
          color: #000;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: bold;
          z-index: 10;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
          animation: float 3s ease-in-out infinite;
        }

        /* === CARDS ANIMADAS === */
        .animated-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animated-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(207, 35, 35, 0.2);
        }
        
        .popular-plan {
          transform: scale(1.05);
          border: 2px solid #FFD700;
        }
        
        .popular-plan:hover {
          transform: translateY(-8px) scale(1.07);
        }

        /* === BOTONES MEJORADOS === */
        .plan-button {
          position: relative;
          overflow: hidden;
        }
        
        .plan-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .plan-button:hover::before {
          left: 100%;
        }
        
        .popular-button {
          background: linear-gradient(45deg, #FFD700, #FFA500);
          color: #000;
          border: none;
        }
        
        .popular-button:hover {
          background: linear-gradient(45deg, #FFA500, #FFD700);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 215, 0, 0.4);
        }

        /* === CTA BUTTON === */
        .cta-button {
          position: relative;
          overflow: hidden;
          background: linear-gradient(45deg, #CF2323, #8b0000);
        }
        
        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.6s;
        }
        
        .cta-button:hover::before {
          left: 100%;
        }

        /* === FEATURES MEJORADAS === */
        .features {
          list-style: none;
          margin: 25px 0;
          flex-grow: 1;
        }
        
        .features li {
          margin-bottom: 12px;
          line-height: 1.6;
          font-size: 0.95rem;
          transition: color 0.3s ease;
          padding: 5px 0;
        }
        
        .features li:hover {
          color: var(--color-ember);
        }

        /* === COUNTDOWN === */
        .countdown-item {
          text-align: center;
          padding: 10px;
          background: rgba(0,0,0,0.3);
          border-radius: 10px;
          backdrop-filter: blur(5px);
          animation: pulse 2s infinite;
        }

        /* === PROMO HERO === */
        .promo-hero {
          backdrop-filter: blur(15px);
          border: 2px solid rgba(207, 35, 35, 0.5);
        }

        /* === TÍTULOS ANIMADOS === */
        .animated-title {
          position: relative;
          display: inline-block;
        }
        
        .animated-title::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 3px;
          background: linear-gradient(45deg, #CF2323, #ff4444);
          transition: width 0.8s ease;
        }
        
        .animated-title:hover::after {
          width: 100%;
        }

        /* === RESPONSIVE === */
        @media (max-width: 768px) {
          .final-price {
            font-size: 2.5rem !important;
          }
          
          .original-price {
            font-size: 1rem;
          }
          
          .popular-plan {
            transform: scale(1);
          }
          
          .popular-plan:hover {
            transform: translateY(-5px) scale(1.02);
          }
          
          .animated-card:hover {
            transform: translateY(-5px) scale(1.01);
          }
          
          .countdown-item {
            padding: 8px;
          }
          
          .discount-badge {
            font-size: 0.75rem;
            padding: 6px 12px;
            top: -8px;
            right: 15px;
          }
          
          .popular-badge {
            font-size: 0.7rem;
            padding: 6px 16px;
            top: -12px;
          }
        }
        
        @media (max-width: 480px) {
          .final-price {
            font-size: 2.2rem !important;
          }
          
          .promo-hero {
            padding: 20px !important;
            margin: 30px auto !important;
          }
        }

        /* === PERFORMANCE === */
        .reveal {
          will-change: transform, opacity;
        }
        
        .animated-card {
          will-change: transform, box-shadow;
        }
        
        /* Reducir animaciones en móvil para mejor rendimiento */
        @media (max-width: 768px) {
          .countdown-item {
            animation: none;
          }
          
          .popular-badge {
            animation: none;
          }
          
          .discount-badge {
            animation: pulse 3s infinite;
          }
        }
      `}</style>
    </>
  );
};

export default HomePage;
                      }}
                    >
                      Comenzar Ahora
                    </button>
                  </div>
                </div>
              </div>

              {/* Plan Transformación Acelerada */}
              <div className="pricing-card reveal animated-card popular-plan" style={{
                transitionDelay: '0.1s',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
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
                  <h3 className="plan-name" style={{
                    fontSize: isMobile ? '1.6rem' : '2rem'
                  }}>
                    Transformación Acelerada
                  </h3>
                  
                  <div className="price-container" style={{ marginBottom: '20px' }}>
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
                      style={{
                        width: '100%',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Transformarme Ahora
                    </button>
                  </div>
                </div>
              </div>

              {/* Plan Metamorfosis Completa */}
              <div className="pricing-card reveal animated-card" style={{
                transitionDelay: '0.2s',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                {activePromotions['Metamorfosis Completa'] && (
                  <div className="discount-badge">
                    -{getDiscountedPrice(4299, 'Metamorfosis Completa').percentage}% OFF
                  </div>
                )}
                
                <div className="card-content">
                  <p className="tag">Plan de 30 Semanas</p>
                  <h3 className="plan-name" style={{
                    fontSize: isMobile ? '1.6rem' : '2rem'
                  }}>
                    Metamorfosis Completa
                  </h3>
                  
                  <div className="price-container" style={{ marginBottom: '20px' }}>
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
                      style={{
                        width: '100%',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
