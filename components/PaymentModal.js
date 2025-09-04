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
    
    // Actualizar Brick con precio original
    if (window.update
