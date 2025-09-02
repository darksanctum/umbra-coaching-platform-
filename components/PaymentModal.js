import React, { useEffect, useState } from 'react';

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Precio original y final
  const [originalPrice, setOriginalPrice] = useState(plan?.price || 0);
  const [finalPrice, setFinalPrice] = useState(plan?.price || 0);

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
                  
                  // Verificar datos obligatorios
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
                    // Agregar metadata del cupón si se aplicó uno
                    metadata: appliedCoupon ? {
                      coupon_code: appliedCoupon.code,
                      original_price: originalPrice,
                      discount_amount: appliedCoupon.discountAmount,
                      discount_type: appliedCoupon.type
                    } : {}
                  };

                  console.log('Enviando datos:', paymentData);

                  const response = await fetch('/api/create-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentData),
                  });

                  console.log('Response status:', response.status);

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
  }, [plan, finalPrice]); // Agregar finalPrice como dependencia

  // Función para validar cupón
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
          originalPrice: plan.price,
          planName: plan.title
        })
      });

      const data = await response.json();

      if (data.valid) {
        const discountData = {
          code: data.coupon.code,
          type: data.coupon.type,
          discountAmount: data.pricing.discountAmount,
          description: data.coupon.description
        };
        
        setAppliedCoupon(discountData);
        setFinalPrice(data.pricing.finalPrice);
        setCouponData(data);
        setCouponError('');
        
        // Mensaje de éxito
        alert(`¡Cupón aplicado! Ahorras $${data.pricing.discountAmount} MXN`);
      } else {
        setCouponError(data.error || 'Código de descuento no válido');
        setAppliedCoupon(null);
        setFinalPrice(originalPrice);
        setCouponData(null);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Error al validar el cupón');
      setAppliedCoupon(null);
      setFinalPrice(originalPrice);
    } finally {
      setCouponLoading(false);
    }
  };

  // Función para remover cupón
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponData(null);
    setCouponCode('');
    setCouponError('');
    setFinalPrice(originalPrice);
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
        background: 'linear-gradient(135deg, #fff, #f8f9fa)',
        padding: '2rem',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow:
