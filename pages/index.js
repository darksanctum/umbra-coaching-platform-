// Calcular precio con descuento - CORREGIDO
  const getDiscountedPrice = (originalPrice, planName) => {
    const promo = activePromotions[planName];
    if (!promo) return { 
      final: originalPrice, 
      discount: 0, 
      hasDiscount: false,
      originalPrice: originalPrice,
      percentage: 0
    };
    
    const discountAmount = promo.type === 'percentage' 
      ? Math.round((originalPrice * promo.value) / 100)
      : promo.value;
    
    return {
      final: Math.round(originalPrice - discountAmount),
      discount: discountAmount,
      percentage: promo.value,
      hasDiscount: true,
      originalPrice: originalPrice
    };
  };

  // Obtener el código de cupón correcto para cada plan
  const getCorrectCouponCode = (planName) => {
    const promo = activePromotions[planName];
    if (!promo) return null;
    
    // Mapear cada plan a su código de cupón correspondiente
    const couponMap = {
      'Coaching Mensual': 'BIENVENIDO50',      // 50% OFF
      'Transformación Acelerada': 'TRANSFORMACION30', // 35% OFF (pero el código da exactamente este descuento)
      'Metamorfosis Completa': 'AHORRA20'      // 25% OFF (pero el código da exactamente este descuento)
    };
    
    return couponMap[planName] || 'BIENVENIDO50';
  };
