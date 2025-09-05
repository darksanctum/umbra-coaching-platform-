// pages/api/active-promotions.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = new Date();
    
    // Promociones activas - puedes modificar estas fechas y descuentos
    const activePromotions = {
      // Promoción para el plan más popular
      'Transformación Acelerada': {
        hasPromotion: true,
        originalPrice: 2999,
        discountedPrice: 1499,
        discountPercentage: 50,
        promotionText: '¡50% DE DESCUENTO!',
        validFrom: '2025-01-01T00:00:00Z',
        validUntil: '2025-01-31T23:59:59Z',
        description: 'Oferta especial de año nuevo'
      },
      
      // Promoción para coaching mensual
      'Coaching Mensual': {
        hasPromotion: true,
        originalPrice: 1199,
        discountedPrice: 899,
        discountPercentage: 25,
        promotionText: '¡25% DE DESCUENTO!',
        validFrom: '2025-01-01T00:00:00Z',
        validUntil: '2025-01-31T23:59:59Z',
        description: 'Descuento especial para nuevos clientes'
      },
      
      // Sin promoción para el plan premium (opcional)
      'Metamorfosis Completa': {
        hasPromotion: false,
        originalPrice: 4299,
        discountedPrice: 4299,
        discountPercentage: 0,
        promotionText: null,
        validFrom: null,
        validUntil: null,
        description: 'Precio regular'
      }
    };

    // Verificar que las promociones estén dentro del rango de fechas válidas
    const validPromotions = {};
    
    Object.keys(activePromotions).forEach(planName => {
      const promo = activePromotions[planName];
      
      if (!promo.hasPromotion) {
        validPromotions[planName] = promo;
        return;
      }
      
      const validFrom = new Date(promo.validFrom);
      const validUntil = new Date(promo.validUntil);
      
      // Verificar si la promoción está activa
      if (now >= validFrom && now <= validUntil) {
        validPromotions[planName] = promo;
      } else {
        // Promoción expirada o no activa
        validPromotions[planName] = {
          hasPromotion: false,
          originalPrice: promo.originalPrice,
          discountedPrice: promo.originalPrice,
          discountPercentage: 0,
          promotionText: null,
          validFrom: null,
          validUntil: null,
          description: 'Promoción expirada'
        };
      }
    });

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      promotions: validPromotions,
      timestamp: now.toISOString(),
      message: 'Promociones activas obtenidas correctamente'
    });

  } catch (error) {
    console.error('Error fetching active promotions:', error);
    
    // En caso de error, devolver promociones por defecto
    res.status(200).json({
      success: false,
      promotions: {
        'Transformación Acelerada': {
          hasPromotion: true,
          originalPrice: 2999,
          discountedPrice: 1499,
          discountPercentage: 50,
          promotionText: '¡50% DE DESCUENTO!',
          description: 'Promoción por defecto'
        },
        'Coaching Mensual': {
          hasPromotion: false,
          originalPrice: 1199,
          discountedPrice: 1199,
          discountPercentage: 0,
          promotionText: null,
          description: 'Sin promoción'
        },
        'Metamorfosis Completa': {
          hasPromotion: false,
          originalPrice: 4299,
          discountedPrice: 4299,
          discountPercentage: 0,
          promotionText: null,
          description: 'Sin promoción'
        }
      },
      error: 'Error interno, usando promociones por defecto'
    });
  }
}
