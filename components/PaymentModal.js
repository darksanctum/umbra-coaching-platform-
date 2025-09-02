import React, { useEffect, useState } from 'react';

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!plan) {
      setError('No se recibió información del plan');
      setIsLoading(false);
      return;
    }

    // Validar que el plan tenga precio
    if (!plan.price || plan.price <= 0) {
      setError(`Error: El plan "${plan.title}" no tiene un precio válido (${plan.price})`);
      setIsLoading(false);
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    if (!publicKey) {
      setError('Error de configuración: Clave pública de Mercado Pago no encontrada');
      setIsLoading(false);
      return;
    }

    console.log('Inicializando pago para:', {
      plan: plan.title,
      price: plan.price,
      publicKey: publicKey.substring(0, 20) + '...'
    });

    let mp;
    let cardPaymentBrickController;

    const initMercadoPago = async () => {
      try {
        // Cargar SDK de Mercado Pago
        if (!window.MercadoPago) {
          console.log('Cargando SDK de Mercado Pago...');
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://sdk.mercadopago.com/js/v2";
            script.onload = () => {
              console.log('SDK de Mercado Pago cargado exitosamente');
              resolve();
            };
            script.onerror = (err) => {
              console.error('Error cargando SDK:', err);
              reject(new Error('No se pudo cargar el SDK de Mercado Pago'));
            };
            document.body.appendChild(script);
          });
        }

        // Inicializar Mercado Pago
        console.log('Inicializando Mercado Pago con clave pública...');
        mp = new window.MercadoPago(publicKey);
        
        const bricksBuilder = mp.bricks();

        // Configuración del Brick con validaciones
        const brickConfig = {
          initialization: {
            amount: Number(plan.price), // Asegurar que sea número
          },
          customization: {
            paymentMethods: {
              ticket: "all",
              creditCard: "all",
              debitCard: "all",
              mercadoPago: "all",
            },
          },
          callbacks: {
            onReady: () => {
              console.log('Brick listo para usar');
              setIsLoading(false);
            },
            onSubmit: async (cardFormData) => {
              try {
                console.log('Iniciando proceso de pago...');
                console.log('Datos del formulario:', cardFormData);
                
                // Validar datos mínimos
                if (!cardFormData.token) {
                  throw new Error('No se pudo generar el token de la tarjeta');
                }
                
                if (!cardFormData.payment_method_id) {
                  throw new Error('Método de pago no seleccionado');
                }

                const paymentData = {
                  token: cardFormData.token,
                  issuer_id: cardFormData.issuer_id,
                  payment_method_id: cardFormData.payment_method_id,
                  transaction_amount: Number(plan.price),
                  installments: Number(cardFormData.installments) || 1,
                  description: `${plan.title} - Umbra Coaching`,
                  payer: {
                    email: cardFormData.payer?.email || 'cliente@ejemplo.com',
                    identification: {
                      type: cardFormData.payer?.identification?.type || 'CURP',
                      number: cardFormData.payer?.identification?.number || '12345678901234567890',
                    },
                  },
                };

                console.log('Enviando datos de pago:', {
                  ...paymentData,
                  token: paymentData.token.substring(0, 10) + '...'
                });

                // Mostrar loading
                const submitButton = document.querySelector('[data-cy="submit-button-mp"]');
                if (submitButton) {
                  submitButton.textContent = 'Procesando...';
                  submitButton.disabled = true;
                }

                const response = await fetch('/api/create-payment', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify(paymentData),
                });

                console.log('Respuesta del servidor:', response.status, response.statusText);

                let result;
                try {
                  const responseText = await response.text();
                  console.log('Respuesta completa:', responseText);
                  result = responseText ? JSON.parse(responseText) : {};
                } catch (parseError) {
                  console.error('Error parsing respuesta:', parseError);
                  throw new Error(`Error del servidor (${response.status}): No se pudo procesar la respuesta`);
                }
                
                if (!response.ok) {
                  throw new Error(result.error || `Error ${response.status}: ${response.statusText}`);
                }

                console.log('Pago procesado exitosamente:', result);
                
                // Mostrar mensaje de éxito y redireccionar
                alert('¡Pago exitoso! Serás redirigido a la página de confirmación.');
                
                // Cerrar modal
                onClose();
                
                // Opcional: redireccionar a página de éxito
                if (typeof window !== 'undefined') {
                  window.location.href = '/gracias.html';
                }
                  
              } catch (error) {
                console.error('Error en el proceso de pago:', error);
                
                // Restaurar botón
                const submitButton = document.querySelector('[data-cy="submit-button-mp"]');
                if (submitButton) {
                  submitButton.textContent = 'Pagar';
                  submitButton.disabled = false;
                }
                
                // Mostrar error al usuario
                alert(`Error en el pago: ${error.message}`);
              }
            },
            onError: (error) => {
              console.error('Error del Brick de Mercado Pago:', error);
              setError(`Error del formulario de pago: ${error.message || 'Error desconocido'}`);
            },
          },
        };

        console.log('Creando Brick con configuración:', {
          amount: brickConfig.initialization.amount,
          planTitle: plan.title
        });

        // Crear el Brick
        cardPaymentBrickController = await bricksBuilder.create(
          "cardPayment",
          "cardPaymentBrick_container",
          brickConfig
        );

        console.log('Brick creado exitosamente');

      } catch (error) {
        console.error('Error en initMercadoPago:', error);
        setError(`Error al inicializar el formulario de pago: ${error.message}`);
        setIsLoading(false);
      }
    };

    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(initMercadoPago, 100);

    // Cleanup function
    return () => {
      if (cardPaymentBrickController) {
        try {
          cardPaymentBrickController.unmount();
          console.log('Brick desmontado correctamente');
        } catch (error) {
          console.warn('Error al desmontar Brick:', error);
        }
      }
    };
  }, [plan, onClose]);

  if (!plan) {
    return null;
  }

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
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f0f0f0';
            e.target.style.color = '#333';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = '#666';
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
            marginBottom: '0.5rem',
            fontWeight: '500'
          }}>
            {plan.title}
          </h3>
          <p style={{
            color: '#333',
            fontSize: '1.4rem',
            fontWeight: '700',
            margin: 0
          }}>
            ${plan.price} MXN
          </p>
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
            fontSize: '0.9rem',
            lineHeight: '1.4'
          }}>
            <strong>Error:</strong> {error}
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#991b1b' }}>
              Si el problema persiste, contacta a soporte.
            </div>
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
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>
              Cargando formulario de pago...
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>
              Inicializando Mercado Pago
            </p>
          </div>
        )}
        
        {/* Contenedor del Brick */}
        <div id="cardPaymentBrick_container" style={{
          minHeight: isLoading ? '0' : '400px'
        }}></div>

        {/* Información de seguridad */}
        {!isLoading && !error && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
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

        {/* CSS para animación de loading */}
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
