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

// CUPONES ESPECÍFICOS POR PLAN - Solo mostrar el código correcto
  const getQuickCouponsForPlan = (planTitle) => {
    const couponsByPlan = {
      'Coaching Mensual': [
        { code: 'BIENVENIDO50', discount: '50%', color: '#CF2323', description: 'Obtén exactamente el descuento mostrado' }
      ],
      'Transformación Acelerada': [
        { code: 'TRANSFORMACION30', discount: '35%', color: '#FF6B35', description: 'Obtén exactamente el descuento mostrado' }
      ],
      'Metamorfosis Completa': [
        { code: 'AHORRA20', discount: '25%', color: '#4ECDC4', description: 'Obtén exactamente el descuento mostrado' }
      ]
    };
    
    return couponsByPlan[planTitle] || [
      { code: 'BIENVENIDO50', discount: '50%', color: '#CF2323' }
    ];
  };

  const quickCoupons = getQuickCouponsForPlan(plan.title);
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

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className={`payment-modal ${isVisible ? 'visible' : ''}`}>
        {/* Header */}
        <div className="modal-header">
          <button onClick={handleClose} className="close-button">
            ×
          </button>
          
          <h2 className="modal-title">
            🚀 Completa tu transformación
          </h2>
          
          <div className="plan-info">
            <h3 className="plan-title">{plan.title}</h3>
            
            {/* Precio con mejor tipografía */}
            <div className="price-display">
              {couponApplied ? (
                <>
                  <span className="original-price-modal">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="final-price-modal">
                    {formatPrice(finalPrice)}
                  </span>
                  <span className="savings-badge">
                    ¡Ahorras {formatPrice(couponApplied.discount)}!
                  </span>
                </>
              ) : (
                <span className="final-price-modal">
                  {formatPrice(plan.price)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="modal-content">
          {/* Sistema de Cupones SÚPER SIMPLIFICADO */}
          <div className="coupon-section">
            <h4 className="coupon-title">
              🎁 ¿Tienes un código de descuento?
            </h4>
            
            {/* Cupones rápidos MUY VISIBLES */}
            <div className="quick-coupons">
              {quickCoupons.map((coupon, index) => (
                <button
                  key={index}
                  onClick={() => applyCouponCode(coupon.code)}
                  className="coupon-button"
                  style={{ backgroundColor: coupon.color }}
                >
                  <div className="coupon-discount">{coupon.discount} OFF</div>
                  <div className="coupon-code">{coupon.code}</div>
                </button>
              ))}
            </div>

            {/* Campo manual SIMPLIFICADO */}
            <div className="manual-coupon">
              <input
                type="text"
                placeholder="O escribe tu código aquí..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="coupon-input"
              />
              <button
                onClick={() => validateAndApplyCoupon(couponCode)}
                disabled={!couponCode.trim()}
                className="apply-button"
              >
                ✨ Aplicar
              </button>
            </div>

            {/* Cupón aplicado */}
            {couponApplied && (
              <div className="coupon-applied">
                <div className="coupon-success">
                  <div className="success-title">
                    🎉 ¡{couponApplied.code} aplicado!
                  </div>
                  <div className="success-savings">
                    Ahorras: {formatPrice(couponApplied.discount)}
                  </div>
                </div>
                <button onClick={removeCoupon} className="remove-coupon">
                  ✕
                </button>
              </div>
            )}

            {/* Error de cupón */}
            {couponError && (
              <div className="coupon-error">
                ❌ {couponError}
              </div>
            )}

            {/* Mensaje de ayuda */}
            {!couponApplied && (
              <div className="coupon-tip">
                💡 <strong>Tip:</strong> Usa <code>BIENVENIDO50</code> para 50% de descuento
              </div>
            )}
          </div>

          {/* Error general */}
          {error && (
            <div className="error-message">
              <div className="error-title">⚠️ Error de procesamiento</div>
              {error}
            </div>
          )}
          
          {/* Loading mejorado */}
          {isLoading && !error && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-title">🔐 Cargando pago seguro...</p>
              <p className="loading-subtitle">Esto solo toma unos segundos</p>
            </div>
          )}
          
          {/* Container del Brick de Mercado Pago */}
          <div 
            id="cardPaymentBrick_container" 
            className="payment-brick-container"
            style={{
              minHeight: isLoading ? '0' : '450px',
              opacity: isLoading ? 0 : 1
            }}
          />

          {/* Información de seguridad mejorada */}
          <div className="security-info">
            <div className="security-title">🔒 Pago 100% Seguro</div>
            <div className="security-subtitle">
              Procesado por <strong>Mercado Pago</strong> con encriptación SSL. 
              Tus datos están protegidos.
            </div>
          </div>

          {/* Garantía */}
          {!isLoading && (
            <div className="guarantee-info">
              ✅ Garantía de satisfacción de 30 días
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: ${isMobile ? 'flex-start' : 'center'};
          z-index: 1000;
          padding: ${isMobile ? '0' : '2rem'};
          overflow-y: auto;
          opacity: ${isVisible ? 1 : 0};
          transition: opacity 0.3s ease;
          backdrop-filter: blur(5px);
        }

        .payment-modal {
          background: white;
          border-radius: ${isMobile ? '20px 20px 0 0' : '16px'};
          max-width: ${isMobile ? '100%' : '650px'};
          width: ${isMobile ? '100%' : '90%'};
          max-height: ${isMobile ? '95vh' : '90vh'};
          overflow: hidden;
          position: relative;
          margin-top: ${isMobile ? '5vh' : '0'};
          margin-bottom: ${isMobile ? '0' : 'auto'};
          transform: ${isVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)'};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }

        .payment-modal.visible {
          transform: translateY(0) scale(1);
        }

        .modal-header {
          padding: ${isMobile ? '1.5rem 1.5rem 1rem' : '2rem 2rem 1rem'};
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          z-index: 10;
          animation: slideDown 0.5s ease-out;
        }

        .close-button {
          position: absolute;
          top: ${isMobile ? '1rem' : '1.5rem'};
          right: ${isMobile ? '1rem' : '1.5rem'};
          background: none;
          border: none;
          font-size: ${isMobile ? '1.8rem' : '2rem'};
          cursor: pointer;
          color: #6b7280;
          z-index: 11;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .close-button:hover {
          background-color: #f3f4f6;
          transform: scale(1.1);
        }

        .modal-title {
          margin: 0;
          font-size: ${isMobile ? '1.4rem' : '1.6rem'};
          color: #111827;
          padding-right: 50px;
          font-weight: 700;
        }

        .plan-info {
          margin-top: 0.5rem;
        }

        .plan-title {
          margin: 0;
          font-size: ${isMobile ? '1.1rem' : '1.2rem'};
          color: #374151;
          font-weight: 600;
        }

        .price-display {
          margin-top: 15px;
          display: flex;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
        }

        .original-price-modal {
          font-size: 1rem;
          text-decoration: line-through;
          color: #9ca3af;
          font-family: 'Inter', sans-serif;
        }

        .final-price-modal {
          font-size: ${isMobile ? '1.8rem' : '2rem'};
          font-weight: 800;
          color: #dc2626;
          font-family: 'Inter', sans-serif;
        }

        .savings-badge {
          background: linear-gradient(45deg, #dc2626, #ef4444);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
          animation: pulse 2s infinite;
        }

        .modal-content {
          padding: ${isMobile ? '1rem 1.5rem' : '1.5rem 2rem'};
          overflow-y: auto;
          max-height: calc(95vh - 200px);
        }

        .coupon-section {
          margin-bottom: 2rem;
          padding: 20px;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 12px;
          border: 1px solid #0ea5e9;
        }

        .coupon-title {
          font-size: 1.1rem;
          margin-bottom: 15px;
          color: #0c4a6e;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .quick-coupons {
          margin-bottom: 15px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }

        .coupon-button {
          color: white;
          border: none;
          padding: ${isMobile ? '12px 16px' : '15px 20px'};
          border-radius: 12px;
          font-size: ${isMobile ? '0.9rem' : '1rem'};
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transform: scale(1);
          flex: ${isMobile ? '1' : 'none'};
          min-width: ${isMobile ? '0' : '140px'};
        }

        .coupon-button:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .coupon-discount {
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .coupon-code {
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.5px;
        }

        .manual-coupon {
          display: flex;
          gap: 10px;
          flex-direction: ${isMobile ? 'column' : 'row'};
        }

        .coupon-input {
          flex: 1;
          padding: ${isMobile ? '14px' : '12px 16px'};
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: ${isMobile ? '16px' : '14px'};
          outline: none;
          transition: all 0.3s ease;
          font-family: 'Space Mono', monospace;
        }

        .coupon-input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .apply-button {
          padding: ${isMobile ? '14px 24px' : '12px 20px'};
          background: linear-gradient(45deg, #0ea5e9, #0284c7);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          width: ${isMobile ? '100%' : 'auto'};
          transition: all 0.3s ease;
        }

        .apply-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .apply-button:not(:disabled):hover {
          transform: scale(1.02);
        }

        .coupon-applied {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          border: 2px solid #16a34a;
          border-radius: 12px;
          padding: 15px;
          margin-top: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: slideDown 0.5s ease-out;
        }

        .coupon-success {
          flex: 1;
        }

        .success-title {
          font-weight: bold;
          color: #16a34a;
          font-size: 1.1rem;
          margin-bottom: 5px;
        }

        .success-savings {
          font-size: 0.9rem;
          color: #15803d;
          font-weight: 600;
        }

        .remove-coupon {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          font-size: 1.5rem;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .remove-coupon:hover {
          background: #fee2e2;
          transform: scale(1.1);
        }

        .coupon-error {
          color: #dc2626;
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border: 2px solid #fca5a5;
          border-radius: 8px;
          padding: 12px;
          font-size: 0.9rem;
          margin-top: 15px;
          animation: shake 0.5s ease-in-out;
        }

        .coupon-tip {
          margin-top: 15px;
          padding: 12px;
          background: #fef3c7;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #92400e;
          text-align: center;
        }

        .coupon-tip code {
          background: #fff;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Space Mono', monospace;
        }

        .error-message {
          color: #dc2626;
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          border: 2px solid #fca5a5;
          font-size: ${isMobile ? '0.9rem' : '1rem'};
          animation: slideDown 0.5s ease-out;
        }

        .error-title {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .loading-container {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #0ea5e9;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1.5rem;
        }

        .loading-title {
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .loading-subtitle {
          font-size: 0.9rem;
          color: #9ca3af;
        }

        .payment-brick-container {
          border-radius: 12px;
          overflow: hidden;
          transition: opacity 0.5s ease;
        }

        .security-info {
          margin-top: 1.5rem;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 12px;
          text-align: center;
          border: 1px solid #e2e8f0;
        }

        .security-title {
          font-size: 1rem;
          color: #475569;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .security-subtitle {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.5;
        }

        .guarantee-info {
          margin-top: 1rem;
          padding: 15px;
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border-radius: 10px;
          text-align: center;
          border: 1px solid #86efac;
          animation: fadeInUp 0.8s ease-out;
          font-size: 0.9rem;
          color: #166534;
          font-weight: 600;
        }

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
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
          }
        }

        @media (max-width: 768px) {
          input[type="text"] {
            font-size: 16px !important;
            transform: scale(1);
          }

          .modal-content {
            -webkit-overflow-scrolling: touch;
          }

          * {
            animation-duration: 0.3s !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentModal;
