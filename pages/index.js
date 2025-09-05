import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import PaymentModal from '../components/PaymentModal';

const HomePage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activePromotions, setActivePromotions] = useState({});
  const [countdownData, setCountdownData] = useState({
    days: 7,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });
  const [showPromoBanner, setShowPromoBanner] = useState(true);

  // Función para abrir modal
  const openModal = (plan) => {
    setSelectedPlan(plan);
  };

  // Función para cerrar modal
  const closeModal = () => {
    setSelectedPlan(null);
  };

  // Función para obtener promociones activas
  const fetchActivePromotions = async () => {
    try {
      const response = await fetch('/api/active-promotions');
      if (response.ok) {
        const data = await response.json();
        setActivePromotions(data.promotions || {});
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      // Promociones por defecto si falla la API
      setActivePromotions({
        'Transformación Acelerada': {
          hasPromotion: true,
          originalPrice: 2999,
          discountedPrice: 1499,
          discountPercentage: 50,
          promotionText: '¡50% DE DESCUENTO!'
        }
      });
    }
  };

  // Countdown timer
  useEffect(() => {
    // Calcular fecha de expiración (7 días desde ahora)
    const now = new Date();
    const expirationDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    // Guardar fecha en localStorage para persistencia
    if (typeof window !== 'undefined') {
      const savedExpiration = localStorage.getItem('promoExpiration');
      if (!savedExpiration) {
        localStorage.setItem('promoExpiration', expirationDate.getTime());
      }
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      let targetTime;
      
      if (typeof window !== 'undefined') {
        const savedExpiration = localStorage.getItem('promoExpiration');
        targetTime = savedExpiration ? parseInt(savedExpiration) : expirationDate.getTime();
      } else {
        targetTime = expirationDate.getTime();
      }

      const distance = targetTime - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdownData({
          days,
          hours,
          minutes,
          seconds,
          isExpired: false
        });
      } else {
        setCountdownData({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        });
      }
    };

    // Actualizar inmediatamente
    updateCountdown();
    
    // Actualizar cada segundo
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Cargar promociones al montar el componente
  useEffect(() => {
    fetchActivePromotions();
  }, []);

  // Efectos visuales y animaciones
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Intersection Observer para animaciones
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      // Observar elementos con clase reveal
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

      // Cursor personalizado (solo desktop)
      const setupCustomCursor = () => {
        if (window.innerWidth > 768) {
          const cursorDot = document.querySelector('.cursor-dot');
          const cursorOutline = document.querySelector('.cursor-outline');
          
          const moveCursor = (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            
            if (cursorDot) {
              cursorDot.style.left = `${posX}px`;
              cursorDot.style.top = `${posY}px`;
            }
            
            if (cursorOutline) {
              cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
              }, { duration: 500, fill: "forwards" });
            }
          };

          window.addEventListener('mousemove', moveCursor);
          
          return () => window.removeEventListener('mousemove', moveCursor);
        }
      };

      const cleanupCursor = setupCustomCursor();

      // Header scroll effect
      const header = document.querySelector('.header');
      const handleScroll = () => {
        if (window.scrollY > 50) {
          header?.classList.add('scrolled');
          if (showPromoBanner) {
            header?.classList.add('with-promo');
          }
        } else {
          header?.classList.remove('scrolled');
          header?.classList.remove('with-promo');
        }
      };

      window.addEventListener('scroll', handleScroll);

      // Particles system (optimizado para móvil)
      const initParticles = () => {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        let particlesArray = [];
        const isMobile = window.innerWidth <= 768;
        
        // Menos partículas en móvil para mejor rendimiento
        const particleCount = isMobile ? 30 : 80;
        
        let mouse = { 
          x: null, 
          y: null, 
          radius: isMobile ? 50 : (canvas.height/120) * (canvas.width/120) 
        };

        const updateMousePosition = (e) => {
          mouse.x = e.clientX;
          mouse.y = e.clientY;
        };

        // Solo en desktop para mejor rendimiento móvil
        if (!isMobile) {
          window.addEventListener('mousemove', updateMousePosition);
        }

        class Particle {
          constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
          }

          draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = 'rgba(207, 35, 35, 0.5)';
            ctx.fill();
          }

          update() {
            if (this.x > canvas.width || this.x < 0) {
              this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
              this.directionY = -this.directionY;
            }

            // Interacción con mouse solo en desktop
            if (!isMobile && mouse.x !== null && mouse.y !== null) {
              let dx = mouse.x - this.x;
              let dy = mouse.y - this.y;
              let distance = Math.sqrt(dx*dx + dy*dy);
              
              if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                  this.x += 3;
                }
                if (mouse.x > this.x && this.x > this.size * 10) {
                  this.x -= 3;
                }
                if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                  this.y += 3;
                }
                if (mouse.y > this.y && this.y > this.size * 10) {
                  this.y -= 3;
                }
              }
            }

            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
          }
        }

        const initParticleArray = () => {
          particlesArray = [];
          for (let i = 0; i < particleCount; i++) {
            let size = (Math.random() * 2) + 1;
            let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            
            particlesArray.push(new Particle(x, y, directionX, directionY, size));
          }
        };

        const animateParticles = () => {
          requestAnimationFrame(animateParticles);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
          }
        };

        initParticleArray();
        animateParticles();

        // Redimensionar canvas
        const handleResize = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          mouse.radius = isMobile ? 50 : (canvas.height/120) * (canvas.width/120);
          initParticleArray();
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          if (!isMobile) {
            window.removeEventListener('mousemove', updateMousePosition);
          }
        };
      };

      const cleanupParticles = initParticles();

      // Smooth scrolling para enlaces internos
      const setupSmoothScrolling = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
              const headerHeight = showPromoBanner ? 140 : 80;
              const targetPosition = target.offsetTop - headerHeight;
              
              window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
              });
            }
          });
        });
      };

      setupSmoothScrolling();

      // Cleanup
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (cleanupCursor) cleanupCursor();
        if (cleanupParticles) cleanupParticles();
      };
    }
  }, [showPromoBanner]);

  // Función para cerrar banner promocional
  const closePromoBanner = () => {
    setShowPromoBanner(false);
  };

  // Función para obtener precio con promoción
  const getPriceWithPromotion = (planName, originalPrice) => {
    const promotion = activePromotions[planName];
    if (promotion && promotion.hasPromotion) {
      return {
        hasPromotion: true,
        originalPrice: promotion.originalPrice,
        discountedPrice: promotion.discountedPrice,
        savings: promotion.originalPrice - promotion.discountedPrice,
        discountPercentage: promotion.discountPercentage
      };
    }
    return {
      hasPromotion: false,
      originalPrice: originalPrice,
      discountedPrice: originalPrice
    };
  };

  // Datos de los planes
  const plans = [
    {
      id: 'monthly',
      tag: 'Acceso por un Mes',
      title: 'Coaching Mensual',
      originalPrice: 1199,
      features: [
        'Acceso completo a la plataforma Umbra',
        'Supervisión y seguimiento personalizado',
        'Soporte directo vía Telegram',
        'Análisis de progreso mensual',
        'Ajustes de rutina en tiempo real',
        'Comunidad exclusiva de miembros',
        'Válido por 30 días'
      ]
    },
    {
      id: 'transformation',
      tag: 'Plan de 15 Semanas',
      title: 'Transformación Acelerada',
      originalPrice: 2999,
      isPopular: true,
      features: [
        'Protocolo de nutrición y entrenamiento',
        'Estrategia de suplementación',
        'Acceso completo a la App',
        'Soporte 1-a-1 por Telegram',
        'Sincronización quincenal por videollamada'
      ]
    },
    {
      id: 'metamorphosis',
      tag: 'Plan de 30 Semanas',
      title: 'Metamorfosis Completa',
      originalPrice: 4299,
      features: [
        'Todos los elementos del plan de 15 semanas',
        'Planificación a largo plazo',
        'Ajustes prioritarios del sistema',
        'La transformación más profunda'
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>Umbra Coaching - Transforma Tu Físico</title>
        <meta name="description" content="Planes de entrenamiento y nutrición personalizados para resultados reales. Coaching profesional con seguimiento integral." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
        <meta name="theme-color" content="#CF2323" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Umbra Coaching - Transforma Tu Físico" />
        <meta property="og:description" content="Planes de entrenamiento y nutrición personalizados para resultados reales." />
        <meta property="og:type" content="website" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Cormorant+Garamond:wght@400;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Banner Promocional */}
      {showPromoBanner && !countdownData.isExpired && (
        <div className="promo-banner active">
          <div className="promo-text">
            🔥 <span className="promo-highlight">¡OFERTA LIMITADA!</span> 
            Hasta 50% de descuento en todos los planes 🔥
            <button 
              onClick={closePromoBanner}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                marginLeft: '20px',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Canvas de partículas */}
      <canvas id="particle-canvas"></canvas>
      
      {/* Cursor personalizado (solo desktop) */}
      <div className="cursor-dot"></div>
      <div className="cursor-outline"></div>

      {/* Header */}
      <header className={`header ${showPromoBanner ? 'with-promo' : ''}`}>
        <div className="container">
          <a href="#" className="logo">Umbra Coaching</a>
          <nav className="nav-links hide-mobile">
            <a href="#filosofia">Filosofía</a>
            <a href="#planes">Planes</a>
            <a href="#contacto">Contacto</a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="hero" className="hero">
          <div className="container">
            <h1 className="hero-title glitch" data-text="TRANSFORMA TU FÍSICO">
              TRANSFORMA TU FÍSICO
            </h1>
            <p className="hero-subtitle reveal">
              Planes de entrenamiento y nutrición personalizados para resultados reales. 
              Deja de adivinar y empieza a construir la mejor versión de ti.
            </p>
            <a href="#planes" className="button reveal" style={{transitionDelay: '0.2s'}}>
              Ver Planes
            </a>
          </div>
        </section>

        {/* Filosofía Section */}
        <section id="filosofia" className="section">
          <div className="container">
            <div className="section-header reveal">
              <h2 className="section-title">El Método Umbra Coaching</h2>
              <p className="section-subtitle">
                Creemos en un enfoque inteligente y basado en la ciencia. Cada plan de entrenamiento 
                y nutrición es una herramienta de precisión, diseñada para optimizar tu progreso y 
                eliminar las conjeturas. Dejamos atrás las rutinas genéricas para enfocarnos en lo 
                que realmente funciona para ti.
              </p>
            </div>
          </div>
        </section>

        {/* Planes Section */}
        <section id="planes" className="section">
          <div className="container">
            <div className="section-header reveal">
              <h2 className="section-title">Elige Tu Plan</h2>
              <p className="section-subtitle">
                Planes diseñados para adaptarse a tu nivel de compromiso y tus objetivos. 
                Ya sea que busques perder grasa, ganar músculo o mejorar tu rendimiento, 
                aquí comienza tu transformación.
              </p>
            </div>

            {/* Countdown Timer */}
            {!countdownData.isExpired && (
              <div className="countdown-container reveal">
                <h3 className="countdown-title">¡Oferta por tiempo limitado!</h3>
                <div className="countdown-timer">
                  <div className="countdown-unit">
                    <span className="countdown-number">{countdownData.days}</span>
                    <span className="countdown-label">Días</span>
                  </div>
                  <div className="countdown-unit">
                    <span className="countdown-number">{countdownData.hours}</span>
                    <span className="countdown-label">Horas</span>
                  </div>
                  <div className="countdown-unit">
                    <span className="countdown-number">{countdownData.minutes}</span>
                    <span className="countdown-label">Min</span>
                  </div>
                  <div className="countdown-unit">
                    <span className="countdown-number">{countdownData.seconds}</span>
                    <span className="countdown-label">Seg</span>
                  </div>
                </div>
                <p className="countdown-message">
                  {countdownData.days < 1 ? (
                    <span className="countdown-urgent">¡Últimas horas! No te quedes sin tu descuento</span>
                  ) : (
                    'Aprovecha estos precios especiales antes de que terminen'
                  )}
                </p>
              </div>
            )}

            {/* Grid de Planes */}
            <div className="pricing-grid">
              {plans.map((plan, index) => {
                const priceInfo = getPriceWithPromotion(plan.title, plan.originalPrice);
                const isConversionPlan = plan.isPopular;
                
                return (
                  <div 
                    key={plan.id}
                    className={`pricing-card reveal ${isConversionPlan ? 'conversion-plan' : ''}`}
                    style={{transitionDelay: `${index * 0.2}s`}}
                  >
                    {isConversionPlan && (
                      <>
                        <div className="popular-badge-premium">Más Popular</div>
                        {priceInfo.hasPromotion && (
                          <div className="savings-badge">
                            Ahorra ${priceInfo.savings}
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="card-content">
                      <p className="tag">{plan.tag}</p>
                      <h3 className={`plan-name ${isConversionPlan ? 'premium-title' : ''}`}>
                        {plan.title}
                      </h3>
                      
                      {priceInfo.hasPromotion ? (
                        <div className="price-container">
                          <div className="original-price">
                            ${priceInfo.originalPrice.toLocaleString()}
                          </div>
                          <div className={`discount-price ${isConversionPlan ? 'price-highlight' : ''}`}>
                            ${priceInfo.discountedPrice.toLocaleString()}
                          </div>
                          <div className="savings-amount">
                            ¡Ahorras ${priceInfo.savings.toLocaleString()} MXN!
                          </div>
                          <span className="price-term">MXN</span>
                        </div>
                      ) : (
                        <div>
                          <p className={`price ${isConversionPlan ? 'price-highlight' : ''}`}>
                            ${plan.originalPrice.toLocaleString()}
                          </p>
                          <span className="price-term">MXN</span>
                        </div>
                      )}

                      <ul className={`features ${isConversionPlan ? 'premium-features' : ''}`}>
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex}>{feature}</li>
                        ))}
                      </ul>

                      {isConversionPlan && priceInfo.hasPromotion && (
                        <div className="urgency-indicator">
                          <p className="urgency-text">
                            ¡Solo por {countdownData.days} días más!
                          </p>
                        </div>
                      )}

                      <div className="checkout-btn-container">
                        <button 
                          onClick={() => openModal({
                            title: plan.title,
                            price: priceInfo.discountedPrice
                          })}
                          className={`button ${isConversionPlan ? 'conversion-button' : ''}`}
                        >
                          Forjar Pacto
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contacto" className="footer">
        <div className="container">
          <p>&copy; 2025 Umbra Coaching // El Santuario es eterno.</p>
          <p>
            Las comunicaciones se inician a través del nexo en{' '}
            <a href="https://t.me/kojicoachbot" target="_blank" rel="noopener noreferrer">
              Telegram
            </a>.
          </p>
        </div>
      </footer>

      {/* Modal de Pago */}
      <PaymentModal plan={selectedPlan} onClose={closeModal} />
    </>
  );
};

export default HomePage;
