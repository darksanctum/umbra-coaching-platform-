import React, { useEffect, useState } from 'react';

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para cupones
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  
  // Estados para precios
  const [originalPrice, setOriginalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  
  // Estado para promoción sugerida
  const [suggestedPromo, setSuggestedPromo] = useState(null);

  useEffect(() => {
    if (!plan) {
      setError('No se recibió información del plan');
      setIsLoading(false);
      return;
    }

    const price = plan.price || plan.amount || 0;
    if (!price || price <= 0) {
      setError(`Error: El plan "${plan.title || 'Sin título'}" no tiene un precio válido`);
      setIsLoading(false);
      return;
    }
    
    // Configurar precios iniciales
    setOriginalPrice(price);
    setFinalPrice(price);
    
    // Cargar promoción sugerida
    loadSuggestedPromotion();
    
    // Limpiar error previo
    setError(null);

    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    if (!publicKey) {
      setError('Error de configuración: Clave pública de Mercado Pago no encontrada');
      setIsLoading(false);
      return;
    }

    let mp;
    let cardPaymentBrickController;

    const initMercadoPago = async () => {
      try {
        // Cargar SDK de Mercado Pago
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

        // Crear Brick con precio actualizable
        const createBrick = async (amount) => {
          if (cardPaymentBrickController) {
            cardPaymentBrickController.unmount();
          }

          cardPaymentBrickController = await bricksBuilder.create(
            "cardPayment",
            "cardPaymentBrick_container",
            {
              initialization: {
                amount: Number(amount),
              },
              callbacks: {
                onReady: () => {
                  setIsLoading(false);
                },
                onSubmit: async (cardFormData) => {
                  try {
                    if (!cardFormData.token || !cardFormData.payment_method_id) {
                      throw new Error('Faltan datos de la tarjeta');
                    }

                    const paymentData = {
                      token: cardFormData.token,
                      issuer_id: cardFormData.issuer_id,
                      payment_method_id: cardFormData.payment_method_id,
                      transaction_amount: Number(finalPrice),
                      installments: Number(cardFormData.installments) || 1,
                      description: `${plan.title} - Umbra Coaching`,
                      payer: {
                        email: cardFormData.payer?.email || 'cliente@ejemplo.com',
                        identification: {
                          type: cardFormData.payer?.identification?.type || 'CURP',
                          number: cardFormData.payer?.identification?.number || '12345678901234567890',
                        },
                      },
                      // Metadata del cupón aplicado
                      metadata: appliedCoupon ? {
                        coupon_code: appliedCoupon.code,
                        original_price: originalPrice,
                        discount_amount: appliedCoupon.discountAmount,
                        discount_type: appliedCoupon.type,
                        savings: originalPrice - finalPrice
                      } : {}
                    };

                    const response = await fetch('/api/create-payment', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                      },
                      body: JSON.stringify(paymentData),
                    });

                    let result;
                    try {
                      const responseText = await response.text();
                      result = responseText ? JSON.parse(responseText) : {};
                    } catch (parseError) {
                      throw new Error(`Error del servidor (${response.status}): No se pudo procesar la respuesta`);
                    }
                    
                    if (!response.ok) {
                      throw new Error(result.error || `Error ${response.status}: ${response.statusText}`);
                    }

                    alert('¡Pago exitoso! Serás redirigido a la página de confirmación.');
                    onClose();
                    
                    if (typeof window !== 'undefined') {
                      window.location.href = '/gracias.html';
                    }
                      
                  } catch (error) {
                    alert(`Error en el pago: ${error.message}`);
                  }
                },
                onError: (error) => {
                  setError(`Error del formulario de pago: ${error.message || 'Error desconocido'}`);
                },
              },
            }
          );
        };

        // Crear Brick inicial
        await createBrick(finalPrice);

        // Función para actualizar precio del Brick
        window.updateBrickAmount = createBrick;

      } catch (error) {
        setError(`Error al inicializar el formulario de pago: ${error.message}`);
        setIsLoading(false);
      }
    };

    setTimeout(initMercadoPago, 100);

    return () => {
      if (cardPaymentBrickController) {
        try {
          cardPaymentBrickController.unmount();
        } catch (error) {
          console.warn('Error al desmontar Brick:', error);
        }
      }
    };
  }, [plan, finalPrice]);

  // Cargar promoción sugerida
  const loadSuggestedPromotion = async () => {
    try {
      const response = await fetch('/api/active-promotions');
      const data = await response.json();
      
      if (data.success && data.featured) {
        setSuggestedPromo(data.featured);
      }
    } catch (error) {
      console.warn('No se pudo cargar promoción sugerida:', error);
    }
  };

  // Validar cupón
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Ingresa un código de descuento');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          originalPrice: originalPrice,
          planName: plan.title
        })
      });

      const data = await response.json();

      if (data.valid) {
        const discountData = {
          code: data.coupon.code,
          type: data.coupon.type,
          value: data.coupon.value,
          discountAmount: data.pricing.discountAmount,
          description: data.coupon.description,
          savings: data.pricing.savings,
          urgencyMessage: data.metadata.urgencyMessage
        };
        
        setAppliedCoupon(discountData);
        setFinalPrice(data.pricing.finalPrice);
        setCouponError('');
        
        // Actualizar Brick con nuevo precio
        if (window.updateBrickAmount) {
          window.updateBrickAmount(data.pricing.finalPrice);
        }
        
        // Mensaje de éxito con savings
        alert(`¡Cupón aplicado! 🎉\nAhorras $${data.pricing.discountAmount} MXN\nNuevo precio: $${data.pricing.finalPrice} MXN`);
      } else {
        setCouponError(data.error || 'Código de descuento no válido');
      }
    } catch (error) {
      setCouponError('Error al validar el cupón. Intenta de nuevo.');
    } finally {
      setCouponLoading(false);
    }
  };

  // Aplicar promoción sugerida
  const applySuggestedPromo = () => {
    if (suggestedPromo) {
      setCouponCode(suggestedPromo.code);
      setTimeout(validateCoupon, 100);
    }
  };

  // Remover cupón
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setFinalPrice(originalPrice);
    
    // Forzar recreación del modal
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  if (!plan) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Botón cerrar */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.8rem',
            cursor: 'pointer',
            color: '#666',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
        
        {/* Header del modal */}
        <div style={{ marginBottom: '2rem', paddingRight: '3rem' }}>
          <h2 style={{
            color: '#333',
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            Completa tu pago
          </h2>
          <h3 style={{
            color: '#CF2323',
            fontSize: '1.2rem',
            marginBottom: '1rem',
            fontWeight: '500'
          }}>
            {plan.title}
          </h3>
          
          {/* Precios */}
          <div style={{ marginBottom: '1.5rem' }}>
            {appliedCoupon ? (
              <div>
                <p style={{
                  textDecoration: 'line-through',
                  color: '#9ca3af',
                  fontSize: '1rem',
                  margin: '0 0 0.25rem 0'
                }}>
                  ${originalPrice} MXN
                </p>
                <p style={{
                  color: '#CF2323',
                  fontSize: '2rem',
                  fontWeight: '700',
                  margin: '0 0 0.5rem 0'
                }}>
                  ${finalPrice} MXN
                </p>
                <div style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  🎉 Ahorras ${appliedCoupon.discountAmount} MXN ({Math.round((appliedCoupon.discountAmount / originalPrice) * 100)}% OFF)
                </div>
                {appliedCoupon.urgencyMessage && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    margin: '0.5rem 0 0 0',
                    fontWeight: '500'
                  }}>
                    ⚠️ {appliedCoupon.urgencyMessage}
                  </p>
                )}
              </div>
            ) : (
              <p style={{
                color: '#333',
                fontSize: '1.8rem',
                fontWeight: '700',
                margin: 0
              }}>
                ${originalPrice} MXN
              </p>
            )}
          </div>
        </div>

        {/* Promoción sugerida */}
        {!appliedCoupon && suggestedPromo && (
          <div style={{
            background: `linear-gradient(135deg, ${suggestedPromo.bannerColor}15, ${suggestedPromo.bannerColor}05)`,
            border: `2px solid ${suggestedPromo.bannerColor}30`,
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              background: suggestedPromo.bannerColor,
              color: 'white',
              padding: '4px 12px',
              borderRadius: '0 0 0 12px',
              fontSize: '0.7rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {suggestedPromo.urgencyText}
            </div>
            
            <h4 style={{
              color: suggestedPromo.bannerColor,
              fontSize: '1.1rem',
              fontWeight: '600',
              margin: '0 0 0.5rem 0'
            }}>
              {suggestedPromo.bannerText.split(':')[0]}
            </h4>
            <p style={{
              color: '#555',
              fontSize: '0.9rem',
              margin: '0 0 1rem 0'
            }}>
              {suggestedPromo.savings} • Código: <strong>{suggestedPromo.code}</strong>
            </p>
            
            <button
              onClick={applySuggestedPromo}
              style={{
                background: suggestedPromo.bannerColor,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {suggestedPromo.ctaText} 🚀
            </button>
          </div>
        )}

        {/* Sección de cupón */}
        <div style={{
          background: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{
            color: '#374151',
            fontSize: '1rem',
            marginBottom: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🎫 ¿Tienes un código de descuento?
          </h4>
          
          {!appliedCoupon ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Ej: BIENVENIDO50, AHORA40"
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    validateCoupon();
                  }
                }}
              />
              <button
                onClick={validateCoupon}
                disabled={couponLoading || !couponCode.trim()}
                style={{
                  padding: '12px 20px',
                  background: couponLoading ? '#9ca3af' : 'linear-gradient(135deg, #CF2323, #8b0000)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: couponLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  minWidth: '100px',
                  transition: 'all 0.2s ease'
                }}
              >
                {couponLoading ? 'Validando...' : 'Aplicar'}
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #10b981'
            }}>
              <div>
                <p style={{
                  color: '#065f46',
                  fontSize: '1rem',
                  fontWeight: '600',
                  margin: 0
                }}>
                  ✅ Código {appliedCoupon.code} aplicado
                </p>
                <p style={{
                  color: '#047857',
                  fontSize: '0.8rem',
                  margin: '0.25rem 0 0 0'
                }}>
                  {appliedCoupon.description}
                </p>
              </div>
              <button
                onClick={removeCoupon}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  padding: '6px 12px',
                  fontWeight: '500'
                }}
                title="Remover cupón"
              >
                Remover
              </button>
            </div>
          )}
          
          {couponError && (
            <div style={{
              color: '#dc2626',
              background: '#fee2e2',
              padding: '8px 12px',
              borderRadius: '6px',
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              border: '1px solid #fecaca'
            }}>
              {couponError}
            </div>
          )}

          {/* Cupones sugeridos */}
          <div style={{
            marginTop: '1rem',
            fontSize: '0.8rem',
            color: '#6b7280'
          }}>
            💡 <strong>Cupones populares:</strong> BIENVENIDO50 (50% OFF) • AHORA40 (40% OFF) • QUEDAN5 (38% OFF)
          </div>
        </div>
        
        {/* Área de error */}
        {error && (
          <div style={{
            color: '#dc2626',
            background: '#fee2e2',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid #fecaca',
            fontSize: '0.9rem'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {/* Loading state */}
        {isLoading && !error && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 2rem',
            color: '#666'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid #f3f4f6',
              borderTop: '3px solid #CF2323',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto'
            }}></div>
            <p style={{ margin: 0, fontWeight: '500' }}>
              Cargando formulario de pago...
            </p>
          </div>
        )}
        
        {/* Contenedor del Brick */}
        <div id="cardPaymentBrick_container" style={{
          minHeight: isLoading ? '0' : '400px'
        }}></div>

        {/* Información de seguridad y ahorros */}
        {!isLoading && !error && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            {appliedCoupon && (
              <div style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  🎉 ¡Felicidades! Estás ahorrando ${appliedCoupon.discountAmount} MXN
                </p>
              </div>
            )}
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{ color: '#059669', fontSize: '1.1rem' }}>🔒</span>
              <p style={{
                color: '#374151',
                fontSize: '0.9rem',
                fontWeight: '600',
                margin: 0
              }}>
                Pago 100% Seguro
              </p>
            </div>
            <p style={{
              color: '#6b7280',
              fontSize: '0.8rem',
              margin: 0,
              lineHeight: '1.4'
            }}>
              Tu información está protegida con encriptación SSL. Procesado por Mercado Pago.
            </p>
          </div>
        )}

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PaymentModal;
