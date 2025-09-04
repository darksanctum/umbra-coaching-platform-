import React, { useEffect, useState } from 'react';

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
