/* Campo manual SIMPLIFICADO */
            <div style={{ 
              display: 'flex', 
              gap: '10px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <input
                type="text"
                placeholder="O escribe tu código aquí..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  padding: isMobile ? '14px' : '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: isMobile ? '16px' : '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  fontFamily: 'mono'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0ea5e9';
                  e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                onClick={() => validateAndApplyCoupon(couponCode)}
                disabled={!couponCode.trim()}
                style={{
                  padding: isMobile ? '14px 24px' : '12px 20px',
                  background: couponCode.trim() ? 'linear-gradient(45deg, #0ea5e9, #0284c7)' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: couponCode.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600',
                  width: isMobile ? '100%' : 'auto',
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (couponCode.trim()) {
                    e.target.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ✨ Aplicar
              </button>
            </div>

            {/* Cupón aplicado */}
            {couponApplied && (
              <div style={{
                background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                border: '2px solid #16a34a',
                borderRadius: '12px',
                padding: '15px',
                marginTop: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                animation: 'slideDown 0.5s ease-out'
              }}>
                <div>
                  <div style={{ 
                    fontWeight: 'bold', 
                    color: '#16a34a',
                    fontSize: '1.1rem',
                    marginBottom: '5px'
                  }}>
                    🎉 ¡{couponApplied.code} aplicado!
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#15803d',
                    fontWeight: '600'
                  }}>
                    Ahorras: {formatPrice(couponApplied.discount)}
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    padding: '8px',
                    borderRadius: '50%',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#fee2e2';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'none';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Error de cupón */}
            {couponError && (
              <div style={{
                color: '#dc2626',
                background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                border: '2px solid #fca5a5',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.9rem',
                marginTop: '15px',
                animation: 'shake 0.5s ease-in-out'
              }}>
                ❌ {couponError}
              </div>
            )}

            {/* Mensaje de ayuda */}
            {!couponApplied && (
              <div style={{
                marginTop: '15px',
                padding: '12px',
                background: '#fef3c7',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#92400e',
                textAlign: 'center'
              }}>
                💡 <strong>Tip:</strong> Usa <code style={{background: '#fff', padding: '2px 6px', borderRadius: '4px'}}>BIENVENIDO50</code> para 50% de descuento
              </div>
            )}
          </div>

          {/* Error general */}
          {error && (
            <div style={{
              color: '#dc2626',
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '2px solid #fca5a5',
              fontSize: isMobile ? '0.9rem' : '1rem',
              animation: 'slideDown 0.5s ease-out'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                ⚠️ Error de procesamiento
              </div>
              {error}
            </div>
          )}
          
          {/* Loading mejorado */}
          {isLoading && !error && (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#6b7280'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #0ea5e9',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1.5rem'
              }}></div>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                🔐 Cargando pago seguro...
              </p>
              <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                Esto solo toma unos segundos
              </p>
            </div>
          )}
          
          {/* Container del Brick de Mercado Pago */}
          <div 
            id="cardPaymentBrick_container" 
            style={{
              minHeight: isLoading ? '0' : '450px',
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.5s ease',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          ></div>

          {/* Información de seguridad mejorada */}
          <div style={{
            marginTop: '1.5rem',
            padding: '20px',
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '1rem',
              color: '#475569',
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              🔒 Pago 100% Seguro
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: '#64748b',
              lineHeight: '1.5'
            }}>
              Procesado por <strong>Mercado Pago</strong> con encriptación SSL. 
              Tus datos están protegidos.
            </div>
          </div>

          {/* Garantía */}
          {!isLoading && (
            <div style={{
              marginTop: '1rem',
              padding: '15px',
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              borderRadius: '10px',
              textAlign: 'center',
              border: '1px solid #86efac',
              animation: 'fadeInUp 0.8s ease-out'
            }}>
              <div style={{
                fontSize: '0.9rem',
                color: '#166534',
                fontWeight: '600'
              }}>
                ✅ Garantía de satisfacción de 30 días
              </div>
            </div>
          )}
        </div>

        {/* Estilos CSS en línea para animaciones */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
            }
            50% { 
              transform: scale(1.05)import React, { useEffect, useState } from 'react';

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Animación de entrada
  useEffect(() => {
    if (plan) {
      setTimeout(() => setIsVisible(true), 10);
    }
  }, [plan]);

  // Formatear precio sin decimales innecesarios
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('MX$', '$');
  };

  // CUPONES SIMPLIFICADOS - Solo los más importantes
  const quickCoupons = [
    { code: 'BIENVENIDO50', discount: '50%', color: '#CF2323' },
    { code: 'TRANSFORMACION30', discount: '30%', color: '#FF6B35' },
    { code: 'AHORRA20', discount: '20%', color: '#4ECDC4' }
  ];

  const validateAndApplyCoupon = async (code) => {
    if (!code.trim()) return;

    setCouponError('');
    
    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          originalPrice: plan.price,
          planName: plan.title
        })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setCouponApplied({
          code: data.coupon.code,
          discount: data.discount,
          finalPrice: data.finalPrice,
          type: data.coupon.type,
          value: data.coupon.value
        });
        setCouponCode(code.trim());
      } else {
        setCouponError(data.error || 'Cupón inválido');
      }
    } catch (error) {
      setCouponError('Error al validar el cupón');
    }
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    setCouponError('');
  };

  const applyCouponCode = (code) => {
    setCouponCode(code);
    validateAndApplyCoupon(code);
  };

  useEffect(() => {
    if (!plan) return;

    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    if (!publicKey) {
      setError('Error de configuración: Clave pública no encontrada');
      setIsLoading(false);
      return;
    }

    let mp;
    let cardPaymentBrickController;

    const initMercadoPago = async () => {
      try {
        if (!window.MercadoPago) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://sdk.mercadopago.com/js/v2";
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }

        mp = new window.MercadoPago(publicKey);
        const bricksBuilder = mp.bricks();

        const finalPrice = couponApplied ? couponApplied.finalPrice : plan.price;

        cardPaymentBrickController = await bricksBuilder.create(
          "cardPayment",
          "cardPaymentBrick_container",
          {
            initialization: {
              amount: finalPrice,
            },
            callbacks: {
              onReady: () => {
                setIsLoading(false);
              },
              onSubmit: async (cardFormData) => {
                try {
                  console.log('Datos recibidos:', cardFormData);
                  
                  if (!cardFormData.token || !cardFormData.payment_method_id) {
                    throw new Error('Faltan datos de la tarjeta');
                  }

                  const paymentData = {
                    token: cardFormData.token,
                    issuer_id: cardFormData.issuer_id,
                    payment_method_id: cardFormData.payment_method_id,
                    transaction_amount: Number(finalPrice),
                    installments: Number(cardFormData.installments) || 1,
                    description: plan.title,
                    payer: {
                      email: cardFormData.payer?.email || 'test_user_123456@testuser.com',
                      identification: {
                        type: cardFormData.payer?.identification?.type || 'CURP',
                        number: cardFormData.payer?.identification?.number || '12345678901234567890',
                      },
                    },
                    metadata: couponApplied ? {
                      coupon_code: couponApplied.code,
                      original_price: plan.price,
                      discount_applied: couponApplied.discount
                    } : {}
                  };

                  console.log('Enviando datos:', paymentData);

                  const response = await fetch('/api/create-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentData),
                  });

                  const responseText = await response.text();
                  let result;
                  try {
                    result = responseText ? JSON.parse(responseText) : {};
                  } catch (parseError) {
                    throw new Error(`Error del servidor: ${response.status} - ${responseText}`);
                  }
                  
                  if (!response.ok) {
                    throw new Error(result.error || 'Error en el pago');
                  }

                  window.location.href = '/gracias.html';
                  
                } catch (error) {
                  alert(`Error: ${error.message}`);
                }
              },
              onError: (error) => {
                console.error('Error en Brick:', error);
                setError(`Error: ${error.message || 'Error desconocido'}`);
              },
            },
          }
        );

      } catch (error) {
        console.error('Error al inicializar:', error);
        setError(`Error al cargar el formulario: ${error.message}`);
        setIsLoading(false);
      }
    };

    initMercadoPago();

    return () => {
      if (cardPaymentBrickController) {
        cardPaymentBrickController.unmount();
      }
    };
  }, [plan, couponApplied]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!plan) return null;

  const finalPrice = couponApplied ? couponApplied.finalPrice : plan.price;

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: isMobile ? 'flex-start' : 'center',
      zIndex: 1000,
      padding: isMobile ? '0' : '2rem',
      overflowY: 'auto',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.3s ease',
      backdropFilter: 'blur(5px)'
    },
    modal: {
      background: 'white',
      borderRadius: isMobile ? '20px 20px 0 0' : '16px',
      maxWidth: isMobile ? '100%' : '650px',
      width: isMobile ? '100%' : '90%',
      maxHeight: isMobile ? '95vh' : '90vh',
      overflow: 'hidden',
      position: 'relative',
      marginTop: isMobile ? '5vh' : '0',
      marginBottom: isMobile ? '0' : 'auto',
      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div style={modalStyles.modal}>
        {/* Header con animación */}
        <div style={{
          padding: isMobile ? '1.5rem 1.5rem 1rem' : '2rem 2rem 1rem',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
          zIndex: 10,
          animation: 'slideDown 0.5s ease-out'
        }}>
          <button 
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: isMobile ? '1rem' : '1.5rem',
              right: isMobile ? '1rem' : '1.5rem',
              background: 'none',
              border: 'none',
              fontSize: isMobile ? '1.8rem' : '2rem',
              cursor: 'pointer',
              color: '#6b7280',
              zIndex: 11,
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>
          
          <h2 style={{ 
            margin: 0, 
            fontSize: isMobile ? '1.4rem' : '1.6rem',
            color: '#111827',
            paddingRight: '50px',
            fontWeight: '700'
          }}>
            🚀 Completa tu transformación
          </h2>
          
          <div style={{ marginTop: '0.5rem' }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: isMobile ? '1.1rem' : '1.2rem',
              color: '#374151',
              fontWeight: '600'
            }}>
              {plan.title}
            </h3>
            
            {/* Precio con mejor tipografía */}
            <div style={{ 
              marginTop: '15px',
              display: 'flex',
              alignItems: 'baseline',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              {couponApplied ? (
                <>
                  <span style={{ 
                    fontSize: '1rem', 
                    textDecoration: 'line-through', 
                    color: '#9ca3af',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {formatPrice(plan.price)}
                  </span>
                  <span style={{ 
                    fontSize: isMobile ? '1.8rem' : '2rem', 
                    fontWeight: '800',
                    color: '#dc2626',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {formatPrice(finalPrice)}
                  </span>
                  <span style={{
                    background: 'linear-gradient(45deg, #dc2626, #ef4444)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    animation: 'pulse 2s infinite'
                  }}>
                    ¡Ahorras {formatPrice(couponApplied.discount)}!
                  </span>
                </>
              ) : (
                <span style={{ 
                  fontSize: isMobile ? '1.8rem' : '2rem', 
                  fontWeight: '800',
                  color: '#111827',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {formatPrice(plan.price)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ 
          padding: isMobile ? '1rem 1.5rem' : '1.5rem 2rem',
          overflowY: 'auto',
          maxHeight: 'calc(95vh - 200px)'
        }}>
          {/* Sistema de Cupones SÚPER SIMPLIFICADO */}
          <div style={{ 
            marginBottom: '2rem',
            padding: '20px',
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            borderRadius: '12px',
            border: '1px solid #0ea5e9'
          }}>
            <h4 style={{ 
              fontSize: '1.1rem',
              marginBottom: '15px',
              color: '#0c4a6e',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🎁 ¿Tienes un código de descuento?
            </h4>
            
            {/* Cupones rápidos MUY VISIBLES */}
            <div style={{ 
              marginBottom: '15px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center'
            }}>
              {quickCoupons.map((coupon, index) => (
                <button
                  key={index}
                  onClick={() => applyCouponCode(coupon.code)}
                  style={{
                    background: `linear-gradient(45deg, ${coupon.color}, ${coupon.color}dd)`,
                    color: 'white',
                    border: 'none',
                    padding: isMobile ? '12px 16px' : '15px 20px',
                    borderRadius: '12px',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 4px 15px ${coupon.color}33`,
                    transform: 'scale(1)',
                    flex: isMobile ? '1' : 'none',
                    minWidth: isMobile ? '0' : '140px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05) translateY(-2px)';
                    e.target.style.boxShadow = `0 8px 25px ${coupon.color}55`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1) translateY(0)';
                    e.target.style.boxShadow = `0 4px 15px ${coupon.color}33`;
                  }}
                >
                  <div style={{ fontSize: '0.8rem', opacity: '0.9' }}>
                    {coupon.discount} OFF
                  </div>
                  <div style={{ fontFamily: 'mono', letterSpacing: '0.5px' }}>
                    {coupon.code}
                  </div>
                </button>
              ))}
            </div>

            {/* Campo manual SIMPLIFICADO */}
            <div style={{ 
              display: 'flex', 
              gap: '10px',
