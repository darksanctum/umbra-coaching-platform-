// pages/api/validate-coupon.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, originalPrice, planName } = req.body;

    if (!code || !originalPrice) {
      return res.status(400).json({ error: 'Código y precio son requeridos' });
    }

    const now = new Date();
    
    // Base de datos de cupones (en producción esto estaría en una base de datos real)
    const coupons = {
      // Cupones activos permanentes
      'UMBRA15': {
        type: 'percentage',
        value: 15,
        description: 'Descuento del 15% en todos los planes',
        expiresAt: new Date('2025-12-31'),
        usageLimit: null,
        currentUsage: 0,
        minimumAmount: 1000,
        validPlans: ['all'],
        isActive: true
      },
      'PRIMERA50': {
        type: 'fixed',
        value: 500,
        description: 'Descuento fijo de $500 para nuevos clientes',
        expiresAt: new Date('2025-06-30'),
        usageLimit: 100,
        currentUsage: 23,
        minimumAmount: 1500,
        validPlans: ['all'],
        isActive: true
      },
      'TRANSFORM25': {
        type: 'percentage',
        value: 25,
        description: 'Descuento especial del 25% para Transformación',
        expiresAt: new Date('2025-03-31'),
        usageLimit: 50,
        currentUsage: 12,
        minimumAmount: 2000,
        validPlans: ['Transformación Acelerada', 'Metamorfosis Completa'],
        isActive: true
      },
      'SATORI20': {
        type: 'percentage',
        value: 20,
        description: 'Descuento del 20% - Promoción Satori',
        expiresAt: new Date('2025-02-28'),
        usageLimit: 30,
        currentUsage: 8,
        minimumAmount: 1200,
        validPlans: ['all'],
        isActive: true
      },
      
      // Cupones de temporada (ejemplo - se pueden activar/desactivar)
      'VERANO30': {
        type: 'percentage',
        value: 30,
        description: 'Descuento de verano del 30%',
        expiresAt: new Date('2025-08-31'),
        usageLimit: 200,
        currentUsage: 0,
        minimumAmount: 2000,
        validPlans: ['all'],
        isActive: false // Desactivado por ahora
      },
      
      // Cupones para clientes VIP o influencers
      'INFLUENCER40': {
        type: 'percentage',
        value: 40,
        description: 'Descuento especial para influencers',
        expiresAt: new Date('2025-12-31'),
        usageLimit: 20,
        currentUsage: 3,
        minimumAmount: 1000,
        validPlans: ['all'],
        isActive: true
      }
    };

    const coupon = coupons[code.toUpperCase()];

    if (!coupon) {
      return res.status(404).json({ 
        error: 'Código de descuento no válido',
        valid: false 
      });
    }

    // Validaciones
    const errors = [];

    // Verificar si el cupón está activo
    if (!coupon.isActive) {
      errors.push('Este código de descuento no está disponible actualmente');
    }

    // Verificar expiración
    if (now > new Date(coupon.expiresAt)) {
      errors.push('Este código de descuento ha expirado');
    }

    // Verificar límite de uso
    if (coupon.usageLimit && coupon.currentUsage >= coupon.usageLimit) {
      errors.push('Este código de descuento ha alcanzado su límite de uso');
    }

    // Verificar monto mínimo
    if (originalPrice < coupon.minimumAmount) {
      errors.push(`Este descuento requiere una compra mínima de $${coupon.minimumAmount} MXN`);
    }

    // Verificar planes válidos
    if (planName && coupon.validPlans[0] !== 'all') {
      const isValidPlan = coupon.validPlans.some(validPlan => 
        planName.toLowerCase().includes(validPlan.toLowerCase())
      );
      if (!isValidPlan) {
        errors.push('Este código no es válido para el plan seleccionado');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        error: errors[0],
        valid: false,
        errors: errors
      });
    }

    // Calcular descuento
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = Math.round((originalPrice * coupon.value) / 100);
    } else if (coupon.type === 'fixed') {
      discountAmount = Math.min(coupon.value, originalPrice - 1); // No puede ser mayor al precio
    }

    const finalPrice = originalPrice - discountAmount;

    // Respuesta exitosa
    return res.status(200).json({
      valid: true,
      coupon: {
        code: code.toUpperCase(),
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
        expiresAt: coupon.expiresAt
      },
      pricing: {
        originalPrice,
        discountAmount,
        finalPrice,
        discountPercentage: Math.round((discountAmount / originalPrice) * 100)
      },
      metadata: {
        remainingUses: coupon.usageLimit ? coupon.usageLimit - coupon.currentUsage : null,
        minimumAmount: coupon.minimumAmount,
        validUntil: coupon.expiresAt,
        appliedAt: now.toISOString()
      }
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      valid: false 
    });
  }
}
