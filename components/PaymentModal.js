import React, { useEffect, useState } from 'react';

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [finalPrice, setFinalPrice] = useState(plan?.price || 0);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (plan) {
      setFinalPrice(plan.price);
    }
  }, [plan]);

  // Función para aplicar cupón
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Ingresa un código de cupón');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setCouponLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: couponCode.toUpperCase(),
          originalPrice: plan.price,
          planName: plan.title 
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Cupón no válido');
      }

      setFinalPrice(result.finalPrice);
      setCouponApplied({
        code: couponCode.toUpperCase(),
        discount: result.discount,
        type: result.type,
        description: result.description
      });
      
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setCouponLoading(false);
    }
  };

  // Función para remover cupón
  const removeCoupon = () => {
    setCouponApplied(null);
    setFinalPrice(plan.price);
    setCouponCode('');
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
              amount: finalPrice, // Usar precio final con descuento
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
                    transaction_amount: Number(finalPrice), // Usar precio final
                    installments: Number(cardFormData.installments) || 1,
                    description: `${plan.title}${couponApplied ? ` (Cupón: ${couponApplied.code})` : ''}`,
                    payer: {
                      email: cardFormData.payer?.email || 'test_user_123456@testuser.com',
                      identification: {
                        type: cardFormData.payer?.identification?.type || 'CURP',
                        number: cardFormData.payer?.identification?.number || '12345678901234567890',
                      },
                    },
                    // Metadatos para tracking del cupón
                    metadata: {
                      original_price: plan.price,
                      final_price: finalPrice,
                      coupon_code: couponApplied?.code || null,
                      coupon_discount: couponApplied?.discount || null
                    }
                  };

                  console.log('Enviando datos:', paymentData);

                  const response = await fetch('/api/create-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentData),
                  });

                  const responseText = await response.text();
                  console.log('Response text:', responseText);

                  let result;
                  try {
                    result = responseText ? JSON.parse(responseText) : {};
                  } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    throw new Error(`Error del servidor: ${response.status} - ${responseText}`);
                  }
                  
                  if (!response.ok) {
                    throw new Error(result.error || 'Error en el pago');
                  }

                  alert('¡Pago exitoso!');
                  onClose();
                  
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
  }, [plan, finalPrice]); // Re-inicializar cuando cambie el precio final

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
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
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
            color: '#666'
          }}
        >
          ×
        </button>
        
        <h2 style={{ marginBottom: '1rem', color: '#333' }}>Completa tu pago</h2>
        <h3 style={{ marginBottom: '0.5rem', color: '#666' }}>{plan.title}</h3>
        
        {/* Sección de precios */}
        <div style={{
          background: '#f8f9fa',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: couponApplied ? '0.5rem' : '0'
          }}>
            <span style={{ color: '#666' }}>
              {couponApplied ? 'Precio original:' : 'Precio:'}
            </span>
            <span style={{
              color: couponApplied ? '#999' : '#333',
              textDecoration: couponApplied ? 'line-through' : 'none',
              fontWeight: couponApplied ? 'normal' : 'bold',
              fontSize: couponApplied ? '0.9rem' : '1.2rem'
            }}>
              ${plan.price.toLocaleString()} MXN
            </span>
          </div>
          
          {couponApplied && (
            <>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#10B981', fontSize: '0.9rem' }}>
                  Descuento ({couponApplied.code}):
                </span>
                <span style={{ color: '#10B981', fontSize: '0.9rem' }}>
                  -{couponApplied.type === 'percentage' ? 
                    `${couponApplied.discount}%` : 
                    `$${couponApplied.discount} MXN`
                  }
                </span>
              </div>
              
              <hr style={{ margin: '0.5rem 0', border: '1px solid #e0e0e0' }} />
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 'bold', color: '#333' }}>Total a pagar:</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#10B981' }}>
                  ${finalPrice.toLocaleString()} MXN
                </span>
              </div>
            </>
          )}
        </div>
        
        {/* Sección de cupón */}
        {!couponApplied ? (
          <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500'
            }}>
              ¿Tienes un código de descuento?
            </label>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Ingresa tu código"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    applyCoupon();
                  }
                }}
              />
              
              <button
                onClick={applyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                style={{
                  padding: '0.75rem 1rem',
                  background: couponLoading || !couponCode.trim() ? '#ccc' : '#CF2323',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: couponLoading || !couponCode.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                {couponLoading ? 'Validando...' : 'Aplicar'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            border: '2px solid #10B981',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            background: '#f0fdf4'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ color: '#10B981', fontWeight: 'bold' }}>
                  ✓ Cupón aplicado: {couponApplied.code}
                </span>
                <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {couponApplied.description}
                </div>
              </div>
              
              <button
                onClick={removeCoupon}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0.25rem'
                }}
                title="Remover cupón"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <div style={{
            color: 'red',
            background: '#ffebee',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
        
        {isLoading && !error && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>Cargando formulario de pago...</p>
          </div>
        )}
        
        <div id="cardPaymentBrick_container"></div>
      </div>
    </div>
  );
};

export default PaymentModal;