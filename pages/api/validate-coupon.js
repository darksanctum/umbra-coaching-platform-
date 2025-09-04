// pages/api/validate-coupon.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, originalPrice, planName } = req.body;

    // CUPONES CORREGIDOS - El descuento coincide exactamente con lo mostrado
    const coupons = {
      'BIENVENIDO50': {
        type: 'percentage',
        value: 50, // Da exactamente 50% OFF
        minAmount: 500,
        maxUses: 1000,
        currentUses: 45,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: 'Descuento de bienvenida del 50%',
        validPlans: ['Coaching Mensual'],
        // Precios específicos para cada plan
        specificDiscounts: {
          'Coaching Mensual': { type: 'percentage', value: 50 } // $1199 -> $599
        }
      },
      'TRANSFORMACION30': {
        type: 'percentage', 
        value: 35, // CORREGIDO: Da 35% que es lo que se muestra en la página
        minAmount: 2000,
        maxUses: 500,
        currentUses: 12,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: 'Descuento especial para transformación del 35%',
        validPlans: ['Transformación Acelerada'],
        specificDiscounts: {
          'Transformación Acelerada': { type: 'percentage', value: 35 } // $2999 -> $1949
        }
      },
      'AHORRA20': {
        type: 'percentage',
        value: 25, // CORREGIDO: Da 25% que es lo que se muestra para Metamorfosis
        minAmount: 1000,
        maxUses: 2000,
        currentUses: 234,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: 'Descuento especial del 25%',
        validPlans: ['Metamorfosis Completa'],
        specificDiscounts: {
          'Metamorfosis Completa': { type: 'percentage', value: 25 } // $4299 -> $3224
        }
      },
      // Cupones adicionales que SÍ son independientes
      'FLASH15': {
        type: 'percentage',
        value: 15,
        minAmount: 0,
        maxUses: 100,
        currentUses: 78,
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        description: 'Oferta flash del 15%',
        validPlans: ['Coaching Mensual', 'Transformación Acelerada', 'Metamorfosis Completa']
      },
      'PRIMERA500': {
        type: 'fixed',
        value: 500,
        minAmount: 2000,
        maxUses: 50,
        currentUses: 8,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: 'Descuento fijo de $500 MXN',
        validPlans: ['Transformación Acelerada', 'Metamorfosis Completa']
      }
    };

    // Si el código es "SUGGEST", devolver cupones sugeridos
    if (code === 'SUGGEST') {
      const suggestions = [];
      
      // Sugerir el cupón específico para cada plan
      const planSpecificCoupons = {
        'Coaching Mensual': ['BIENVENIDO50'],
        'Transformación Acelerada': ['TRANSFORMACION30'],
        'Metamorfosis Completa': ['AHORRA20']
      };
      
      const recommendedCoupons = planSpecificCoupons[planName] || ['BIENVENIDO50'];
      
      recommendedCoupons.forEach(couponCode => {
        const coupon = coupons[couponCode];
        if (coupon && coupon.validPlans.includes(planName)) {
          const specificDiscount = coupon.specificDiscounts?.[planName] || coupon;
          const discount = specificDiscount.type === 'percentage' 
            ? `${specificDiscount.value}% OFF`
            : `$${specificDiscount.value} OFF`;
          
          suggestions.push({
            code: couponCode,
            discount: discount,
            description: coupon.description,
            savings: specificDiscount.type === 'percentage' 
              ? Math.round(originalPrice * specificDiscount.value / 100)
              : specificDiscount.value,
            urgency: coupon.expiryDate.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
          });
        }
      });

      return res.status(200).json({
        suggestions: suggestions
      });
    }

    // Validar cupón específico
    const coupon = coupons[code];
    
    if (!coupon) {
      return res.status(400).json({
        valid: false,
        error: 'Código de cupón no existe'
      });
    }

    const now = new Date();

    // Verificar expiración
    if (now > coupon.expiryDate) {
      return res.status(400).json({
        valid: false,
        error: 'El cupón ha expirado'
      });
    }

    // Verificar límite de usos
    if (coupon.currentUses >= coupon.maxUses) {
      return res.status(400).json({
        valid: false,
        error: 'El cupón ha alcanzado su límite de usos'
      });
    }

    // Verificar monto mínimo
    if (originalPrice < coupon.minAmount) {
      return res.status(400).json({
        valid: false,
        error: `Monto mínimo requerido: $${coupon.minAmount} MXN`
      });
    }

    // Verificar plan válido
    if (!coupon.validPlans.includes(planName)) {
      return res.status(400).json({
        valid: false,
        error: 'Este cupón no es válido para el plan seleccionado'
      });
    }

    // CALCULAR DESCUENTO ESPECÍFICO PARA EL PLAN
    const specificDiscount = coupon.specificDiscounts?.[planName] || coupon;
    let discount, finalPrice;
    
    if (specificDiscount.type === 'percentage') {
      discount = Math.round(originalPrice * specificDiscount.value / 100);
      finalPrice = originalPrice - discount;
    } else {
      discount = specificDiscount.value;
      finalPrice = Math.max(0, originalPrice - discount);
    }

    res.status(200).json({
      valid: true,
      coupon: {
        code: code,
        type: specificDiscount.type,
        value: specificDiscount.value,
        description: coupon.description
      },
      originalPrice: originalPrice,
      discount: discount,
      finalPrice: finalPrice,
      savings: discount,
      message: `¡Cupón aplicado! Ahorras $${discount} MXN`
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      valid: false,
      error: 'Error interno del servidor'
    });
  }
}
