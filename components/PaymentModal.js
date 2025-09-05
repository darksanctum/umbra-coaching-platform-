import React, { useEffect, useState } from 'react';

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Calcular precio final
  const finalPrice = appliedCoupon 
    ? appliedCoupon.discountType === 'percentage'
      ? plan.price * (1 - appliedCoupon.discountValue / 100)
      : plan.price - appliedCoupon.discountValue
    : plan.price;

  // Validar cupón
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Ingresa un código de cupón');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    
    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          originalPrice: plan.price,
          planName: plan.title
        })
      });

      const result = await response.json();

      if (response.ok && result.valid) {
        setAppliedCoupon(result.coupon);
        setCouponError('');
      } else {
        setCouponError(result.message || 'Cupón inválido');
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError('Error al validar cupón');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Remover cupón
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
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
        // Cargar SDK
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
                    description: `${plan.title}${appliedCoupon ? ` (Cupón: ${appliedCoupon.code})` : ''}`,
                    payer: {
                      email: cardFormData.payer?.email || 'test_user_123456@testuser.com',
                      identification: {
                        type: cardFormData.payer?.identification?.type || 'CURP',
                        number: cardFormData.payer?.identification?.number || '12345678901234567890',
                      },
                    },
                    metadata: {
                      original_price: plan.price,
                      final_price: finalPrice,
                      coupon_used: appliedCoupon?.code || null,
                      discount_amount: appliedCoupon ? plan.price - finalPrice : 0
                    }
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
  }, [plan, finalPrice]);

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
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #111111, #0a0a0a)',
        padding: '2rem',
        borderRadius: '16px',
        maxWidth: '550px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        border: '1px solid #333',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#CF2323',
          }}
        >
          &times;
        </button>
        
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#E5E7EB', marginBottom: '0.5rem' }}>Completa tu pago</h2>
          <h3 style={{ color: '#CF2323', fontSize: '1.5rem' }}>{plan.title}</h3>
          
          <div style={{ margin: '1rem 0' }}>
            {appliedCoupon ? (
              <div>
                <div style={{ 
                  textDecoration: 'line-through', 
                  color: '#A1A1AA', 
                  fontSize: '1.2rem' 
                }}>
                  ${plan.price} MXN
                </div>
                <div style={{ 
                  color: '#4CAF50', 
                  fontSize: '2rem', 
                  fontWeight: 'bold',
                  textShadow: '0 0 10px rgba(76, 175, 79, 0.5)'
                }}>
                  ${Math.round(finalPrice)} MXN
                </div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #4CAF50, #2196F3)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  display: 'inline-block',
                  marginTop: '0.5rem'
                }}>
                  ¡Ahorras ${Math.round(plan.price - finalPrice)}!
                </div>
              </div>
            ) : (
              <div style={{ 
                color: '#E5E7EB', 
                fontSize: '2rem', 
                fontWeight: 'bold' 
              }}>
                ${plan.price} MXN
              </div>
            )}
          </div>
        </div>

        <div style={{ 
          background: 'rgba(17, 17, 17, 0.8)',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          border: '1px solid rgba(207, 35, 35, 0.3)'
        }}>
          <h4 style={{ color: '#CF2323', marginBottom: '1rem' }}>
            💰 ¿Tienes un código de descuento?
          </h4>
          
          {!appliedCoupon ? (
            <div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Ingresa tu código"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    background: '#1f1f1f',
                    color: '#E5E7EB',
                    fontSize: '1rem'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
                />
                <button
                  onClick={validateCoupon}
                  disabled={couponLoading}
                  style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #CF2323, #FF6B35)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: couponLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {couponLoading ? '...' : 'Aplicar'}
                </button>
              </div>
              
              {couponError && (
                <div style={{ color: '#ff4444', fontSize: '0.9rem' }}>
                  {couponError}
                </div>
              )}
              
              <div style={{ fontSize: '0.8rem', color: '#A1A1AA' }}>
                💡 Códigos disponibles: BIENVENIDO50, TRANSFORMACION30, AHORRA20
              </div>
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, rgba(76, 175, 79, 0.2), rgba(33, 150, 243, 0.2))',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #4CAF50'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <div>
                  <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    ✅ Cupón aplicado: {appliedCoupon.code}
                  </div>
                  <div style={{ color: '#E5E7EB', fontSize: '0.9rem' }}>
                    Descuento: {appliedCoupon.discountType === 'percentage' 
                      ? `${appliedCoupon.discountValue}%` 
                      : `$${appliedCoupon.discountValue}`}
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  style={{
                    background: 'none',
                    border: '1px solid #666',
                    color: '#A1A1AA',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Quitar
                </button>
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div style={{
            color: '#ff4444',
            background: 'rgba(255, 68, 68, 0.1)',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            border: '1px solid rgba(255, 68, 68, 0.3)'
          }}>
            {error}
          </div>
        )}
        
        {isLoading && !error && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: '#A1A1AA'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '3px solid #333',
              borderTop: '3px solid #CF2323',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            Cargando formulario de pago...
          </div>
        )}
        
        <div id="cardPaymentBrick_container"></div>
      </div>
    </div>
  );
};

export default PaymentModal;
