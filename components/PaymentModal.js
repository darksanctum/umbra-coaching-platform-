import React, { useEffect, useState } from 'react';

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [suggestedCoupons, setSuggestedCoupons] = useState([]);
  const [popularCoupons, setPopularCoupons] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Obtener cupones sugeridos y populares
  useEffect(() => {
    if (plan) {
      fetchSuggestedCoupons();
      fetchPopularCoupons();
    }
  }, [plan]);

  const fetchSuggestedCoupons = async () => {
    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'SUGGEST',
          originalPrice: plan.price,
          planName: plan.title
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestedCoupons(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggested coupons:', error);
    }
  };

  const fetchPopularCoupons = async () => {
    setPopularCoupons([
      { code: 'BIENVENIDO50', discount: '50% OFF', description: 'Primer descuento especial' },
      { code: 'TRANSFORMACION30', discount: '30% OFF', description: 'Para planes de transformación' },
      { code: 'AHORRA20', discount: '20% OFF', description: 'Descuento general' }
    ]);
  };

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
        
        // Reinicializar el modal con el nuevo precio
        setTimeout(() => {
          onClose();
          setTimeout(() => {
            const newPlan = { ...plan, price: data.finalPrice };
            // Esto requeriría pasar una función para actualizar el plan
            window.dispatchEvent(new CustomEvent('updatePlan', { detail: newPlan }));
          }, 100);
        }, 500);
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

  const applySuggestedCoupon = (coupon) => {
    setCouponCode(coupon.code);
    validateAndApplyCoupon(coupon.code);
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

        cardPaymentBrickController = await bricksBuilder.create(
          "cardPayment",
          "cardPaymentBrick_container",
          {
            initialization: {
              amount: plan.price,
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
                    transaction_amount: Number(plan.price),
                    installments: Number(cardFormData.installments) || 1,
                    description: plan.title,
                    payer: {
                      email: cardFormData.payer?.email || 'test_user_123456@testuser.com',
                      identification: {
                        type: cardFormData.payer?.identification?.type || 'CURP',
                        number: cardFormData.payer?.identification?.number || '12345678901234567890',
                      },
                    },
                    // Agregar información del cupón si se aplicó
                    metadata: couponApplied ? {
                      coupon_code: couponApplied.code,
                      original_price: (plan.price / (1 - couponApplied.discount/100)).toFixed(2),
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

                  // Redirigir a página de éxito
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

  if (!plan) return null;

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
    },
    modal: {
      background: 'white',
      borderRadius: isMobile ? '20px 20px 0 0' : '12px',
      maxWidth: isMobile ? '100%' : '600px',
      width: isMobile ? '100%' : '90%',
      maxHeight: isMobile ? '95vh' : '90vh',
      overflow: 'auto',
      position: 'relative',
      marginTop: isMobile ? '5vh' : '0',
      marginBottom: isMobile ? '0' : 'auto',
    },
    header: {
      padding: isMobile ? '1.5rem 1.5rem 1rem' : '2rem 2rem 1rem',
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky',
      top: 0,
      background: 'white',
      zIndex: 10,
    },
    content: {
      padding: isMobile ? '1rem 1.5rem' : '1.5rem 2rem',
    },
    closeButton: {
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
      transition: 'background-color 0.2s',
    },
  };

  return (
    <div style={modalStyles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <button 
            onClick={onClose}
            style={modalStyles.closeButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
          
          <h2 style={{ 
            margin: 0, 
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            color: '#111827',
            paddingRight: '50px'
          }}>
            Completa tu pago
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
            
            <div style={{ 
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              {couponApplied ? (
                <>
                  <span style={{ 
                    fontSize: isMobile ? '1rem' : '1.1rem', 
                    textDecoration: 'line-through', 
                    color: '#9ca3af'
                  }}>
                    ${plan.price * (couponApplied.type === 'percentage' ? (100/(100-couponApplied.value)) : (plan.price/(plan.price-couponApplied.value)))} MXN
                  </span>
                  <span style={{ 
                    fontSize: isMobile ? '1.3rem' : '1.5rem', 
                    fontWeight: 'bold',
                    color: '#dc2626'
                  }}>
                    ${plan.price} MXN
                  </span>
                  <span style={{
                    background: '#dc2626',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    -{couponApplied.type === 'percentage' ? `${couponApplied.value}%` : `${couponApplied.value}`} OFF
                  </span>
                </>
              ) : (
                <span style={{ 
                  fontSize: isMobile ? '1.3rem' : '1.5rem', 
                  fontWeight: 'bold',
                  color: '#111827'
                }}>
                  ${plan.price} MXN
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={modalStyles.content}>
          {/* Sistema de Cupones */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ 
              fontSize: isMobile ? '1rem' : '1.1rem',
              marginBottom: '1rem',
              color: '#374151'
            }}>
              💰 ¿Tienes un código de descuento?
            </h4>
            
            {/* Cupones sugeridos */}
            {suggestedCoupons.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: '#6b7280', 
                  marginBottom: '0.5rem' 
                }}>
                  🎉 Promoción especial disponible:
                </p>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem' 
                }}>
                  {suggestedCoupons.map((coupon, index) => (
                    <button
                      key={index}
                      onClick={() => applySuggestedCoupon(coupon)}
                      style={{
                        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                        color: 'white',
                        border: 'none',
                        padding: isMobile ? '8px 12px' : '10px 16px',
                        borderRadius: '8px',
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      {coupon.code} - {coupon.discount}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Campo de cupón manual */}
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem',
              marginBottom: '1rem',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <input
                type="text"
                placeholder="Ingresa tu código"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  padding: isMobile ? '12px' : '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: isMobile ? '16px' : '14px', // 16px previene zoom en iOS
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <button
                onClick={() => validateAndApplyCoupon(couponCode)}
                disabled={!couponCode.trim()}
                style={{
                  padding: isMobile ? '12px 20px' : '10px 16px',
                  background: couponCode.trim() ? '#dc2626' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: couponCode.trim() ? 'pointer' : 'not-allowed',
                  fontSize: isMobile ? '14px' : '13px',
                  fontWeight: '600',
                  minWidth: isMobile ? 'auto' : '80px',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                Aplicar
              </button>
            </div>

            {/* Cupón aplicado */}
            {couponApplied && (
              <div style={{
                background: '#dcfce7',
                border: '1px solid #16a34a',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: '#16a34a' }}>
                    ✅ {couponApplied.code} aplicado
                  </span>
                  <div style={{ fontSize: '0.9rem', color: '#15803d' }}>
                    Ahorro: ${(plan.price * (couponApplied.type === 'percentage' ? (100/(100-couponApplied.value)) : (plan.price/(plan.price-couponApplied.value))) - plan.price).toFixed(2)} MXN
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '4px'
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
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}>
                {couponError}
              </div>
            )}

            {/* Cupones populares */}
            {popularCoupons.length > 0 && !couponApplied && (
              <div>
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: '#6b7280', 
                  marginBottom: '0.5rem' 
                }}>
                  Códigos populares:
                </p>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem' 
                }}>
                  {popularCoupons.map((coupon, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCouponCode(coupon.code);
                        validateAndApplyCoupon(coupon.code);
                      }}
                      style={{
                        background: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#e5e7eb';
                        e.target.style.borderColor = '#9ca3af';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#f3f4f6';
                        e.target.style.borderColor = '#d1d5db';
                      }}
                    >
                      {coupon.code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error general */}
          {error && (
            <div style={{
              color: '#dc2626',
              background: '#fef2f2',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              border: '1px solid #fecaca',
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}>
              {error}
            </div>
          )}
          
          {/* Loading */}
          {isLoading && !error && (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: '#6b7280'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #f3f4f6',
                borderTop: '3px solid #dc2626',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <p>Cargando formulario de pago...</p>
            </div>
          )}
          
          {/* Container del Brick de Mercado Pago */}
          <div 
            id="cardPaymentBrick_container" 
            style={{
              minHeight: isLoading ? '0' : '400px',
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.3s ease'
            }}
          ></div>

          {/* Información de seguridad */}
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: '#64748b',
            textAlign: 'center'
          }}>
            🔒 Pago 100% seguro procesado por Mercado Pago
          </div>
        </div>

        {/* Estilos CSS en línea para animaciones */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            /* Prevenir zoom en inputs en iOS */
            input[type="text"], input[type="email"], input[type="tel"] {
              font-size: 16px !important;
            }
            
            /* Mejorar scroll en modal */
            .modal-content {
              -webkit-overflow-scrolling: touch;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PaymentModal;
