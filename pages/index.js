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

  // Calcular precio con descuento
  const getDiscountedPrice = (originalPrice, planName) => {
    const promo = activePromotions[planName];
    if (!promo) return { final: originalPrice, discount: 0 };
    
    const discount = promo.type === 'percentage' 
      ? (originalPrice * promo.value / 100)
      : promo.value;
    
    return {
      final: Math.max(0, originalPrice - discount),
      discount: discount,
      percentage: promo.type === 'percentage' ? promo.value : Math.round((discount / originalPrice) * 100)
    };
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

      // Header
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
    }
  }, [isMobile]);

  return (
    <>
      <Head>
        <title>Umbra Coaching</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Cormorant+Garamond:wght@400;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      
      {!isMobile && <canvas id="particle-canvas"></canvas>}
      {!isMobile && <div className="cursor-dot"></div>}
      {!isMobile && <div className="cursor-outline"></div>}

      {/* Banner de Promoción Móvil */}
      {isMobile && Object.keys(activePromotions).length > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(90deg, #CF2323, #8b0000)',
          color: 'white',
          padding: '10px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 9999,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          🔥 OFERTA ESPECIAL: Hasta 50% OFF - Solo {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
        </div>
      )}

      <header className="header" style={{ paddingTop: isMobile && Object.keys(activePromotions).length > 0 ? '50px' : '0' }}>
        <div className="container">
          <a href="#" className="logo" style={{ fontSize: isMobile ? '1.4rem' : '1.8rem' }}>
            Umbra Coaching
          </a>
          <nav className="nav-links" style={{ display: isMobile ? 'none' : 'flex' }}>
            <a href="#filosofia">Filosofía</a>
            <a href="#planes">Planes</a>
            <a href="#contacto">Contacto</a>
          </nav>
          
          {/* Menú hamburguesa para móvil */}
          {isMobile && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              cursor: 'pointer'
            }}>
              <div style={{ width: '20px', height: '2px', background: '#CF2323' }}></div>
              <div style={{ width: '20px', height: '2px', background: '#CF2323' }}></div>
              <div style={{ width: '20px', height: '2px', background: '#CF2323' }}></div>
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
            <h1 className="hero-title glitch" data-text="TRANSFORMA TU FÍSICO" style={{
              fontSize: isMobile ? 'clamp(2rem, 8vw, 3.5rem)' : 'clamp(3rem, 10vw, 6rem)'
            }}>
              TRANSFORMA TU FÍSICO
            </h1>
            <p className="hero-subtitle reveal" style={{
              fontSize: isMobile ? '1rem' : '1.2rem',
              margin: isMobile ? '0 auto 30px auto' : '0 auto 40px auto'
            }}>
              Planes de entrenamiento y nutrición personalizados para resultados reales. 
              Deja de adivinar y empieza a construir la mejor versión de ti.
            </p>
            
            {/* Promoción destacada en hero */}
            {Object.keys(activePromotions).length > 0 && (
              <div className="reveal" style={{
                background: 'linear-gradient(135deg, rgba(207, 35, 35, 0.2), rgba(139, 0, 0, 0.2))',
                border: '2px solid #CF2323',
                borderRadius: '15px',
                padding: isMobile ? '20px' : '30px',
                margin: '30px auto',
                maxWidth: '500px',
                textAlign: 'center',
                animation: 'pulse 2s infinite'
              }}>
                <div style={{
                  fontSize: isMobile ? '1.1rem' : '1.3rem',
                  fontWeight: 'bold',
                  color: '#CF2323',
                  marginBottom: '15px'
                }}>
                  🔥 OFERTA ESPECIAL POR TIEMPO LIMITADO
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: isMobile ? '10px' : '15px',
                  marginBottom: '15px',
                  fontSize: isMobile ? '1.8rem' : '2.2rem',
                  fontWeight: 'bold'
                }}>
                  <span style={{ color: '#CF2323' }}>HASTA 50% OFF</span>
                </div>
                
                {/* Countdown Timer */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: isMobile ? '10px' : '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: isMobile ? '1.2rem' : '1.5rem', 
                      fontWeight: 'bold',
                      color: '#CF2323'
                    }}>
                      {timeLeft.days || 0}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#A1A1AA' }}>DÍAS</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: isMobile ? '1.2rem' : '1.5rem', 
                      fontWeight: 'bold',
                      color: '#CF2323'
                    }}>
                      {timeLeft.hours || 0}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#A1A1AA' }}>HORAS</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: isMobile ? '1.2rem' : '1.5rem', 
                      fontWeight: 'bold',
                      color: '#CF2323'
                    }}>
                      {timeLeft.minutes || 0}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#A1A1AA' }}>MIN</div>
                  </div>
                </div>
                
                <div style={{
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  color: '#E5E7EB'
                }}>
                  ⚡ Solo quedan 7 días para aprovechar estos precios
                </div>
              </div>
            )}
            
            <a href="#planes" className="button reveal" style={{
              transitionDelay: '0.2s',
              fontSize: isMobile ? '0.9rem' : '1rem',
              padding: isMobile ? '14px 28px' : '16px 32px'
            }}>
              Ver Planes
            </a>
          </div>
        </section>

        <section id="filosofia" className="section" style={{
          padding: isMobile ? '80px 0' : '150px 0'
        }}>
          <div className="container">
            <div className="section-header reveal">
              <h2 className="section-title" style={{
                fontSize: isMobile ? 'clamp(1.8rem, 6vw, 2.2rem)' : 'clamp(2.2rem, 5vw, 3rem)'
              }}>
                El Método Umbra Coaching
              </h2>
              <p className="section-subtitle" style={{
                fontSize: isMobile ? '1rem' : 'clamp(1.1rem, 3vw, 1.3rem)'
              }}>
                Creemos en un enfoque inteligente y basado en la ciencia. Cada plan de entrenamiento y nutrición es una herramienta de precisión, diseñada para optimizar tu progreso y eliminar las conjeturas. Dejamos atrás las rutinas genéricas para enfocarnos en lo que realmente funciona para ti.
              </p>
            </div>
          </div>
        </section>

        <section id="planes" className="section" style={{
          padding: isMobile ? '80px 0' : '150px 0'
        }}>
          <div className="container">
            <div className="section-header reveal">
              <h2 className="section-title" style={{
                fontSize: isMobile ? 'clamp(1.8rem, 6vw, 2.2rem)' : 'clamp(2.2rem, 5vw, 3rem)'
              }}>
                Elige Tu Plan
              </h2>
              <p className="section-subtitle" style={{
                fontSize: isMobile ? '1rem' : 'clamp(1.1rem, 3vw, 1.3rem)'
              }}>
                Planes diseñados para adaptarse a tu nivel de compromiso y tus objetivos. Ya sea que busques perder grasa, ganar músculo o mejorar tu rendimiento, aquí comienza tu transformación.
              </p>
            </div>

            <div className="pricing-grid" style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: isMobile ? '30px' : '40px',
              alignItems: 'stretch'
            }}>
              {/* Plan Coaching Mensual */}
              <div className="pricing-card reveal" style={{
                position: 'relative'
              }}>
                {activePromotions['Coaching Mensual'] && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '20px',
                    background: '#CF2323',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    zIndex: 10
                  }}>
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
                  
                  <div style={{ marginBottom: '4px' }}>
                    {activePromotions['Coaching Mensual'] ? (
                      <div>
                        <p style={{ 
                          fontSize: '1.5rem', 
                          textDecoration: 'line-through', 
                          color: '#A1A1AA',
                          margin: 0
                        }}>
                          ${1199}
                        </p>
                        <p className="price" style={{
                          fontSize: isMobile ? '2.8rem' : '3.5rem',
                          color: '#CF2323',
                          margin: 0
                        }}>
                          ${getDiscountedPrice(1199, 'Coaching Mensual').final}
                        </p>
                      </div>
                    ) : (
                      <p className="price" style={{
                        fontSize: isMobile ? '2.8rem' : '3.5rem'
                      }}>
                        $1,199
                      </p>
                    )}
                    <span className="price-term">MXN/único</span>
                  </div>
                  
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
                    <button 
                      onClick={() => openModal({ 
                        title: 'Coaching Mensual', 
                        price: activePromotions['Coaching Mensual'] ? 
                               getDiscountedPrice(1199, 'Coaching Mensual').final : 1199 
                      })} 
                      className="button"
                      style={{
                        width: isMobile ? '100%' : 'auto',
                        fontSize: isMobile ? '0.9rem' : '1rem'
                      }}
                    >
                      Forjar Pacto
                    </button>
                  </div>
                </div>
              </div>

              {/* Plan Transformación Acelerada */}
              <div className="pricing-card reveal" style={{
                transitionDelay: '0.2s',
                position: 'relative'
              }}>
                {activePromotions['Transformación Acelerada'] && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '20px',
                    background: '#CF2323',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    zIndex: 10
                  }}>
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
                  
                  <div style={{ marginBottom: '4px' }}>
                    {activePromotions['Transformación Acelerada'] ? (
                      <div>
                        <p style={{ 
                          fontSize: '1.5rem', 
                          textDecoration: 'line-through', 
                          color: '#A1A1AA',
                          margin: 0
                        }}>
                          ${2999}
                        </p>
                        <p className="price" style={{
                          fontSize: isMobile ? '2.8rem' : '3.5rem',
                          color: '#CF2323',
                          margin: 0
                        }}>
                          ${getDiscountedPrice(2999, 'Transformación Acelerada').final}
                        </p>
                      </div>
                    ) : (
                      <p className="price" style={{
                        fontSize: isMobile ? '2.8rem' : '3.5rem'
                      }}>
                        $2999
                      </p>
                    )}
                    <span className="price-term">MXN</span>
                  </div>
                  
                  <ul className="features">
                    <li>Protocolo de nutrición y entrenamiento</li>
                    <li>Estrategia de suplementación</li>
                    <li>Acceso completo a la App</li>
                    <li>Soporte 1-a-1 por Telegram</li>
                    <li><b>Sincronización quincenal por videollamada</b></li>
                  </ul>
                  <div className="checkout-btn-container">
                    <button 
                      onClick={() => openModal({ 
                        title: 'Transformación Acelerada', 
                        price: activePromotions['Transformación Acelerada'] ? 
                               getDiscountedPrice(2999, 'Transformación Acelerada').final : 2999 
                      })} 
                      className="button"
                      style={{
                        width: isMobile ? '100%' : 'auto',
                        fontSize: isMobile ? '0.9rem' : '1rem'
                      }}
                    >
                      Forjar Pacto
                    </button>
                  </div>
                </div>
              </div>

              {/* Plan Metamorfosis Completa */}
              <div className="pricing-card reveal" style={{
                transitionDelay: '0.4s',
                position: 'relative'
              }}>
                {activePromotions['Metamorfosis Completa'] && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '20px',
                    background: '#CF2323',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    zIndex: 10
                  }}>
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
                  
                  <div style={{ marginBottom: '4px' }}>
                    {activePromotions['Metamorfosis Completa'] ? (
                      <div>
                        <p style={{ 
                          fontSize: '1.5rem', 
                          textDecoration: 'line-through', 
                          color: '#A1A1AA',
                          margin: 0
                        }}>
                          ${4299}
                        </p>
                        <p className="price" style={{
                          fontSize: isMobile ? '2.8rem' : '3.5rem',
                          color: '#CF2323',
                          margin: 0
                        }}>
                          ${getDiscountedPrice(4299, 'Metamorfosis Completa').final}
                        </p>
                      </div>
                    ) : (
                      <p className="price" style={{
                        fontSize: isMobile ? '2.8rem' : '3.5rem'
                      }}>
                        $4299
                      </p>
                    )}
                    <span className="price-term">MXN</span>
                  </div>
                  
                  <ul className="features">
                    <li>Todos los elementos del plan de 15 semanas</li>
                    <li>Planificación a largo plazo</li>
                    <li>Ajustes prioritarios del sistema</li>
                    <li><b>La transformación más profunda</b></li>
                  </ul>
                  <div className="checkout-btn-container">
                    <button 
                      onClick={() => openModal({ 
                        title: 'Metamorfosis Completa', 
                        price: activePromotions['Metamorfosis Completa'] ? 
                               getDiscountedPrice(4299, 'Metamorfosis Completa').final : 4299 
                      })} 
                      className="button"
                      style={{
                        width: isMobile ? '100%' : 'auto',
                        fontSize: isMobile ? '0.9rem' : '1rem'
                      }}
                    >
                      Forjar Pacto
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Urgencia adicional para móvil */}
            {isMobile && Object.keys(activePromotions).length > 0 && (
              <div style={{
                marginTop: '40px',
                textAlign: 'center',
                background: 'rgba(207, 35, 35, 0.1)',
                border: '1px solid #CF2323',
                borderRadius: '10px',
                padding: '20px'
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>
                  ⚠️ ADVERTENCIA
                </div>
                <div style={{ fontSize: '0.9rem', color: '#A1A1AA' }}>
                  Estos descuentos desaparecerán en {timeLeft.days} días, {timeLeft.hours} horas y {timeLeft.minutes} minutos.
                  No podrás obtener estos precios después.
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
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 0 20px;
          }
          
          .hero-title {
            line-height: 1.2;
            margin-bottom: 20px;
          }
          
          .section {
            padding: 60px 0 !important;
          }
          
          .pricing-card {
            margin-bottom: 20px;
          }
          
          .pricing-card .features li {
            font-size: 0.95rem;
            margin-bottom: 12px;
          }
          
          .nav-links {
            display: none;
          }
          
          .cursor-dot, .cursor-outline {
            display: none;
          }
          
          body {
            cursor: default;
          }
          
          .glitch::before, .glitch::after {
            display: none;
          }
          
          .pricing-card:hover::before {
            opacity: 0.3;
          }
        }
        
        @media (max-width: 480px) {
          .hero {
            min-height: 70vh;
          }
          
          .hero-title {
            font-size: 2.2rem !important;
          }
          
          .pricing-card .card-content {
            padding: 25px;
          }
          
          .pricing-card .price {
            font-size: 2.5rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default HomePage;
