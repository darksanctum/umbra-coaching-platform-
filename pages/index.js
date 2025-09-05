import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import PaymentModal from '../components/PaymentModal';

const HomePage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activePromotions, setActivePromotions] = useState({});

  const openModal = (plan) => {
    setSelectedPlan(plan);
  };

  const closeModal = () => {
    setSelectedPlan(null);
  };

  // Cargar promociones activas al montar el componente
  const fetchActivePromotions = async () => {
    try {
      const response = await fetch('/api/active-promotions');
      if (response.ok) {
        const promotions = await response.json();
        setActivePromotions(promotions);
      }
    } catch (error) {
      console.error('Error cargando promociones:', error);
    }
  };

  useEffect(() => {
    fetchActivePromotions();

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

      // Cursor
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

      // Header
      const header = document.querySelector('.header');
      window.addEventListener('scroll', () => {
          if (window.scrollY > 50) {
              header.classList.add('scrolled');
          } else {
              header.classList.remove('scrolled');
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
        <title>Umbra Coaching</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Cormorant+Garamond:wght@400;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <canvas id="particle-canvas"></canvas>
      <div className="cursor-dot"></div>
      <div className="cursor-outline"></div>

      <header className="header">
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

            {/* AQUÍ VA TU CÓDIGO DE DESCUENTOS */}
            {Object.keys(activePromotions).length > 0 && (
              <div className="discount-info reveal">
                <div className="discount-info-title">
                  💡 ¿Cómo obtener tu descuento?
                </div>
                <div className="discount-info-text">
                  Es súper fácil: Cada plan tiene su código específico
                </div>
                {/* Mostrar códigos específicos por plan */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px', 
                  margin: '20px 0' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px', 
                    flexWrap: 'wrap' 
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#A1A1AA' }}>Coaching Mensual:</span>
                    <code style={{ 
                      background: '#CF2323', 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '0.85rem', 
                      fontWeight: 'bold' 
                    }}>
                      BIENVENIDO50
                    </code>
                    <span style={{ fontSize: '0.8rem', color: '#4ECDC4' }}>(50% OFF)</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px', 
                    flexWrap: 'wrap' 
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#A1A1AA' }}>Transformación Acelerada:</span>
                    <code style={{ 
                      background: '#FF6B35', 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '0.85rem', 
                      fontWeight: 'bold' 
                    }}>
                      TRANSFORMACION30
                    </code>
                    <span style={{ fontSize: '0.8rem', color: '#4ECDC4' }}>(35% OFF)</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px', 
                    flexWrap: 'wrap' 
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#A1A1AA' }}>Metamorfosis Completa:</span>
                    <code style={{ 
                      background: '#4ECDC4', 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '0.85rem', 
                      fontWeight: 'bold' 
                    }}>
                      AHORRA20
                    </code>
                    <span style={{ fontSize: '0.8rem', color: '#4ECDC4' }}>(25% OFF)</span>
                  </div>
                </div>
                <div className="discount-info-sub">
                  Los códigos dan exactamente el descuento mostrado en cada plan
                </div>
              </div>
            )}

            <div className="pricing-grid">
              {/* Plan Coaching Mensual */}
              <div className="pricing-card reveal">
                <div className="card-content">
                  <p className="tag">Acceso por un Mes</p>
                  <h3 className="plan-name">Coaching Mensual</h3>
                  <p className="price">$1,199 <span className="price-term">MXN/único</span></p>
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

              <div className="pricing-card reveal" style={{transitionDelay: '0.2s'}}>
                <div className="card-content">
                  <p className="tag">Plan de 15 Semanas</p>
                  <h3 className="plan-name">Transformación Acelerada</h3>
                  <p className="price">$2999 <span className="price-term">MXN</span></p>
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

              <div className="pricing-card reveal" style={{transitionDelay: '0.4s'}}>
                <div className="card-content">
                  <p className="tag">Plan de 30 Semanas</p>
                  <h3 className="plan-name">Metamorfosis Completa</h3>
                  <p className="price">$4299 <span className="price-term">MXN</span></p>
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
