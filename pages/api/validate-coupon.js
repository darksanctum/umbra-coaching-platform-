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
    
    // BASE DE CUPONES ATRACTIVOS PARA CONVERSIÓN
    const coupons = {
      // 🔥 CUPONES DE URGENCIA (Alta conversión)
      'AHORA40': {
        type: 'percentage',
        value: 40,
        description: '¡40% OFF por tiempo limitado! Solo hoy',
        expiresAt: new Date('2025-03-31'),
        usageLimit: 20,
        currentUsage: 3,
        minimumAmount: 1000,
        validPlans: ['all'],
        isActive: true,
        priority: 1
      },
      'ULTIMAHORA': {
        type: 'percentage',
        value: 35,
        description: 'Última hora: 35% de descuento',
        expiresAt: new Date('2025-03-15'),
        usageLimit: 15,
        currentUsage: 2,
        minimumAmount: 1000,
        validPlans: ['all'],
        isActive: true,
        priority: 2
      },
      
      // 🎯 CUPONES DE BIENVENIDA (Conversión de nuevos)
      'BIENVENIDO50': {
        type: 'percentage',
        value: 50,
        description: '¡Bienvenido! 50% de descuento en tu primer plan',
        expiresAt: new Date('2025-12-31'),
        usageLimit: 100,
        currentUsage: 8,
        minimumAmount: 1199,
        validPlans: ['all'],
        isActive: true,
        priority: 3
      },
      'PRIMERA600': {
        type: 'fixed',
        value: 600,
        description: 'Tu primera transformación: $600 MXN de descuento',
        expiresAt: new Date('2025-12-31'),
        usageLimit: 50,
        currentUsage: 5,
        minimumAmount: 1500,
        validPlans: ['all'],
        isActive: true,
        priority: 4
      },
      
      // 💪 CUPONES ESPECÍFICOS POR PLAN (Upselling)
      'METAMORFOSIS30': {
        type: 'percentage',
        value: 30,
        description: 'Descuento especial para Metamorfosis Completa',
        expiresAt: new Date('2025-06-30'),
        usageLimit: 25,
        currentUsage: 1,
        minimumAmount: 3000,
        validPlans: ['Metamorfosis Completa'],
        isActive: true,
        priority: 5
      },
      'TRANSFORM25': {
        type: 'percentage',
        value: 25,
        description: 'Acelera tu transformación con 25% OFF',
        expiresAt: new Date('2025-06-30'),
        usageLimit: 40,
        currentUsage: 7,
        minimumAmount: 2000,
        validPlans: ['Transformación Acelerada'],
        isActive: true,
        priority: 6
      },
      
      // 🏃‍♂️ CUPONES DE ACCIÓN RÁPIDA (FOMO)
      'SOLO24H': {
        type: 'percentage',
        value: 45,
        description: 'Solo 24 horas: 45% de descuento',
        expiresAt: new Date('2025-02-10'),
        usageLimit: 10,
        currentUsage: 1,
        minimumAmount: 1199,
        validPlans: ['all'],
        isActive: true,
        priority: 7
      },
      'QUEDAN5': {
        type: 'percentage',
        value: 38,
        description: 'Solo quedan 5 lugares con 38% OFF',
        expiresAt: new Date('2025-03-31'),
        usageLimit: 5,
        currentUsage: 0,
        minimumAmount: 1199,
        validPlans: ['all'],
        isActive: true,
        priority: 8
      },
      
      // 📱 CUPONES SOCIALES (Viral marketing)
      'INFLUENCER': {
        type: 'percentage',
        value: 55,
        description: 'Código exclusivo de influencer',
        expiresAt: new Date('2025-12-31'),
        usageLimit: 30,
        currentUsage: 12,
        minimumAmount: 1199,
        validPlans: ['all'],
        isActive: true,
        priority: 9
      },
      'REFERIDO': {
        type: 'percentage',
        value: 25,
        description: 'Descuento por referido de cliente',
        expiresAt: new Date('2025-12-31'),
        usageLimit: 200,
        currentUsage: 23,
        minimumAmount: 1199,
        validPlans: ['all'],
        isActive: true,
        priority: 10
      },
      
      // 🎂 CUPONES ESTACIONALES
      'FEBRERO2025': {
        type: 'percentage',
        value: 30,
        description: 'Febrero de transformación: 30% OFF',
        expiresAt: new Date('2025-02-28'),
        usageLimit: 50,
        currentUsage: 15,
        minimumAmount: 1199,
        validPlans: ['all'],
        isActive: true,
        priority: 11
      },
      'VERANO2025': {
        type: 'percentage',
        value: 35,
        description: 'Prepárate para el verano: 35% de descuento',
        expiresAt: new Date('2025-06-30'),
        usageLimit: 100,
        currentUsage: 8,
        minimumAmount: 1199,
        validPlans: ['all'],
        isActive: false, // Activar cuando llegue la temporada
        priority: 12
      },

      // 🎁 CUPONES PREMIUM (Para clientes VIP)
      'VIP60': {
        type: 'percentage',
        value: 60,
        description: 'Acceso VIP: 60% de descuento exclusivo',
        expiresAt: new Date('2025-12-31'),
        usageLimit: 10,
        currentUsage: 2,
        minimumAmount: 2000,
        validPlans: ['all'],
        isActive: true,
        priority: 13
      },
      'ELITE': {
        type: 'fixed',
        value: 1500,
        description: 'Cliente Elite: $1500 MXN de descuento',
        expiresAt: new Date('2025-12-31'),
        usageLimit: 5,
        currentUsage: 1,
        minimumAmount: 3000,
        validPlans: ['all'],
        isActive: true,
        priority: 14
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

    if (!coupon.isActive) {
      errors.push('Este código no está disponible actualmente');
    }

    if (now > new Date(coupon.expiresAt)) {
      errors.push('Este código ha expirado');
    }

    if (coupon.usageLimit && coupon.currentUsage >= coupon.usageLimit) {
      errors.push('Este código ha alcanzado su límite de uso');
    }

    if (originalPrice < coupon.minimumAmount) {
      errors.push(`Este descuento requiere una compra mínima de $${coupon.minimumAmount} MXN`);
    }

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
        valid: false
      });
    }

    // Calcular descuento
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = Math.round((originalPrice * coupon.value) / 100);
    } else if (coupon.type === 'fixed') {
      discountAmount = Math.min(coupon.value, originalPrice - 1);
    }

    const finalPrice = originalPrice - discountAmount;
    const savings = discountAmount;

    return res.status(200).json({
      valid: true,
      coupon: {
        code: code.toUpperCase(),
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
        priority: coupon.priority
      },
      pricing: {
        originalPrice,
        discountAmount,
        finalPrice,
        savings,
        discountPercentage: Math.round((discountAmount / originalPrice) * 100)
      },
      metadata: {
        remainingUses: coupon.usageLimit ? coupon.usageLimit - coupon.currentUsage : null,
        validUntil: coupon.expiresAt,
        appliedAt: now.toISOString(),
        urgencyMessage: coupon.usageLimit && (coupon.usageLimit - coupon.currentUsage) <= 5 
          ? `¡Solo quedan ${coupon.usageLimit - coupon.currentUsage} usos!` 
          : null
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
