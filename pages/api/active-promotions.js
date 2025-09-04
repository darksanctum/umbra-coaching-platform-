// pages/api/active-promotions.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = new Date();
    
    // Promociones activas - Se pueden configurar dinámicamente
    const promotions = {
      'Coaching Mensual': {
        type: 'percentage',
        value: 50,
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString(), // 7 días
        active: true,
        title: 'Oferta de Bienvenida',
        description: '50% de descuento en tu primer mes'
      },
      'Transformación Acelerada': {
        type: 'percentage',
        value: 35,
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString(),
        active: true,
        title: 'Transformación Flash',
        description: '35% de descuento por tiempo limitado'
      },
      'Metamorfosis Completa': {
        type: 'percentage',
        value: 25,
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString(),
        active: true,
        title: 'Metamorfosis Premium',
        description: '25% de descuento en el plan más completo'
      }
    };

    // Filtrar solo promociones activas y vigentes
    const activePromotions = {};
    Object.keys(promotions).forEach(planName => {
      const promo = promotions[planName];
      const promoStart = new Date(promo.startDate);
      const promoEnd = new Date(promo.endDate);
      
      if (promo.active && now >= promoStart && now <= promoEnd) {
        activePromotions[planName] = promo;
      }
    });

    // Información del countdown
    const countdownInfo = {
      timeLeft: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
      endDate: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString()
    };

    res.status(200).json({
      promotions: activePromotions,
      countdown: countdownInfo,
      hasActivePromotions: Object.keys(activePromotions).length > 0
    });

  } catch (error) {
    console.error('Error in active-promotions:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      promotions: {},
      countdown: null,
      hasActivePromotions: false
    });
  }
}
