// pages/api/validate-coupon.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, originalPrice, planName } = req.body;

    // Cupones disponibles
    const coupons = {
      'BIENVENIDO50': {
        type: 'percentage',
        value: 50,
        minAmount: 500,
        maxUses: 1000,
        currentUses: 45,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        description: 'Descuento de bienvenida del 50%',
        validPlans: ['Coaching Mensual', 'Transformación Acelerada', 'Metamorfosis Completa']
      },
      'TRANSFORMACION30': {
        type: 'percentage',
        value: 30,
        minAmount: 2000,
        maxUses: 500,
        currentUses: 12,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: 'Descuento especial para transformación',
        validPlans: ['Transformación Acelerada', 'Metamorfosis Completa']
      },
      'AHORRA20': {
        type: 'percentage',
        value: 20,
        minAmount: 1000,
        maxUses: 2000,
        currentUses: 234,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: 'Descuento general del 20%',
        validPlans: ['Coaching Mensual', 'Transformación Acelerada', 'Metamorfosis Completa']
      },
      'FLASH15': {
        type: 'percentage',
        value: 15,
        minAmount: 0,
        maxUses: 100,
        currentUses: 78,
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días
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
      },
      'ESTUDIANTE25': {
        type: 'percentage',
        value: 25,
        minAmount: 1000,
        maxUses: 200,
        currentUses: 67,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        description: 'Descuento para estudiantes',
        validPlans: ['Coaching Mensual', 'Transformación Acelerada']
      }
    };

    // Si el código es "SUGGEST", devolver cupones sugeridos
    if (code === 'SUGGEST') {
      const suggestions = [];
      
      // Sugerir el mejor cupón disponible para el plan
      Object.keys(coupons).forEach(couponCode => {
        const coupon = coupons[couponCode];
        const now = new Date();
        
        if (
          coupon.validPlans.includes(planName) &&
          originalPrice >= coupon.minAmount &&
          coupon.currentUses < coupon.maxUses &&
          now < coupon.expiryDate
        ) {
          const discount = coupon.type === 'percentage' 
            ? `${coupon.value}% OFF`
            : `$${coupon.value} OFF`;
          
          suggestions.push({
            code: couponCode,
            discount: discount,
            description: coupon.description,
            savings: coupon.type === 'percentage' 
              ? Math.round(originalPrice * coupon.value / 100)
              : coupon.value,
            urgency: coupon.expiryDate.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000 // Menos de 3 días
          });
        }
      });

      // Ordenar por mayor descuento
      suggestions.sort((a, b) => b.savings - a.savings);

      return res.status(200).json({
        suggestions: suggestions.slice(0, 2) // Solo las 2 mejores sugerencias
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

    // Calcular descuento
    let discount, finalPrice;
    
    if (coupon.type === 'percentage') {
      discount = Math.round(originalPrice * coupon.value / 100);
      finalPrice = originalPrice - discount;
    } else {
      discount = coupon.value;
      finalPrice = Math.max(0, originalPrice - discount);
    }

    // Incrementar contador de usos (en un sistema real, esto se haría en base de datos)
    // coupons[code].currentUses += 1;

    res.status(200).json({
      valid: true,
      coupon: {
        code: code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description
      },
      originalPrice: originalPrice,
      discount: discount,
      finalPrice: finalPrice,
      savings: discount,
      message: `¡Cupón aplicado! Ahorras ${discount} MXN`
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      valid: false,
      error: 'Error interno del servidor'
    });
  }
}
