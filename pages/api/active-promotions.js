// pages/api/active-promotions.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = new Date();
    
    // PROMOCIONES ACTIVAS CON ALTA CONVERSIÓN
    const promotions = [
      {
        id: 'promo_urgencia_40',
        name: 'Oferta Flash 40%',
        description: '¡Solo por tiempo limitado! 40% de descuento en todos los planes',
        type: 'percentage',
        value: 40,
        code: 'AHORA40',
        startDate: '2025-02-01T00:00:00Z',
        endDate: '2025-03-31T23:59:59Z',
        plans: ['all'],
        minimumAmount: 1000,
        isActive: true, // 🔥 ACTIVA PARA CONVERSIÓN INMEDIATA
        priority: 1,
        bannerText: '🔥 OFERTA FLASH: 40% OFF - ¡Solo por tiempo limitado!',
        bannerColor: '#DC2626',
        urgencyText: 'Termina pronto',
        ctaText: 'Aprovechar ahora',
        savings: 'Ahorra hasta $1,719 MXN'
      },
      {
        id: 'promo_bienvenida_50',
        name: 'Bienvenida Especial',
        description: '50% de descuento para nuevos clientes',
        type: 'percentage',
        value: 50,
        code: 'BIENVENIDO50',
        startDate: '2025-02-01T00:00:00Z',
        endDate: '2025-12-31T23:59:59Z',
        plans: ['all'],
        minimumAmount: 1199,
        isActive: true, // 🎯 PERFECTA PARA NUEVOS CLIENTES
        priority: 2,
        bannerText: '🎯 BIENVENIDO: 50% OFF en tu primera transformación',
        bannerColor: '#7C3AED',
        urgencyText: 'Primera compra',
        ctaText: 'Comenzar transformación',
        savings: 'Ahorra hasta $2,149 MXN'
      },
      {
        id: 'promo_24_horas',
        name: 'Solo 24 Horas',
        description: '45% de descuento válido solo por 24 horas',
        type: 'percentage',
        value: 45,
        code: 'SOLO24H',
        startDate: '2025-02-09T00:00:00Z',
        endDate: '2025-02-10T23:59:59Z',
        plans: ['all'],
        minimumAmount: 1199,
        isActive: false, // Activar para campañas específicas
        priority: 3,
        bannerText: '⏰ SOLO 24H: 45% OFF - ¡No te quedes sin tu lugar!',
        bannerColor: '#EF4444',
        urgencyText: 'Termina en 24h',
        ctaText: 'Asegurar mi lugar',
        savings: 'Ahorra hasta $1,934 MXN'
      },
      {
        id: 'promo_quedan_pocos',
        name: 'Últimos Lugares',
        description: '38% de descuento - Solo quedan 5 lugares',
        type: 'percentage',
        value: 38,
        code: 'QUEDAN5',
        startDate: '2025-02-01T00:00:00Z',
        endDate: '2025-03-31T23:59:59Z',
        plans: ['all'],
        minimumAmount: 1199,
        isActive: true, // 🏃‍♂️ FOMO ACTIVATION
        priority: 4,
        bannerText: '🏃‍♂️ ¡ÚLTIMOS 5 LUGARES! 38% OFF',
        bannerColor: '#F59E0B',
        urgencyText: 'Solo 5 lugares',
        ctaText: 'Reservar mi lugar',
        savings: 'Ahorra hasta $1,633 MXN'
      },
      {
        id: 'promo_metamorfosis_30',
        name: 'Metamorfosis Premium',
        description: '30% OFF en el plan más completo',
        type: 'percentage',
        value: 30,
        code: 'METAMORFOSIS30',
        startDate: '2025-02-01T00:00:00Z',
        endDate: '2025-06-30T23:59:59Z',
        plans: ['Metamorfosis Completa'],
        minimumAmount: 3000,
        isActive: true, // 💪 UPSELLING ACTIVATION
        priority: 5,
        bannerText: '💪 METAMORFOSIS PREMIUM: 30% OFF en plan completo',
        bannerColor: '#10B981',
        urgencyText: 'Plan premium',
        ctaText: 'Elegir metamorfosis',
        savings: 'Ahorra $1,289 MXN'
      },
      {
        id: 'promo_febrero_2025',
        name: 'Febrero de Transformación',
        description: '30% de descuento especial de febrero',
        type: 'percentage',
        value: 30,
        code: 'FEBRERO2025',
        startDate: '2025-02-01T00:00:00Z',
        endDate: '2025-02-28T23:59:59Z',
        plans: ['all'],
        minimumAmount: 1199,
        isActive: true, // 📅 TEMPORAL ACTIVATION
        priority: 6,
        bannerText: '📅 FEBRERO 2025: 30% OFF - Tu mes de transformación',
        bannerColor: '#8B5CF6',
        urgencyText: 'Solo en febrero',
        ctaText: 'Transformarme en febrero',
        savings: 'Ahorra hasta $1,289 MXN'
      }
    ];

    // Filtrar promociones activas y vigentes
    const activePromotions = promotions.filter(promo => {
      if (!promo.isActive) return false;
      
      const startDate = new Date(promo.startDate);
      const endDate = new Date(promo.endDate);
      
      return now >= startDate && now <= endDate;
    });

    // Ordenar por prioridad (menor número = mayor prioridad)
    activePromotions.sort((a, b) => a.priority - b.priority);

    // Calcular tiempo restante para promociones con urgencia
    const promotionsWithCountdown = activePromotions.map(promo => {
      const endTime = new Date(promo.endDate).getTime();
      const currentTime = now.getTime();
      const timeLeft = endTime - currentTime;
      
      let countdown = null;
      if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          countdown = `${days}d ${hours}h`;
        } else if (hours > 0) {
          countdown = `${hours}h ${minutes}m`;
        } else {
          countdown = `${minutes}m`;
        }
      }
      
      return {
        ...promo,
        countdown,
        isUrgent: timeLeft < (24 * 60 * 60 * 1000) // Menos de 24 horas
      };
    });

    const response = {
      success: true,
      count: promotionsWithCountdown.length,
      promotions: promotionsWithCountdown,
      
      // Promoción destacada (la de mayor prioridad)
      featured: promotionsWithCountdown.length > 0 ? {
        ...promotionsWithCountdown[0],
        displayText: `${promotionsWithCountdown[0].bannerText} ${promotionsWithCountdown[0].countdown ? `- Termina en ${promotionsWithCountdown[0].countdown}` : ''}`
      } : null,
      
      // Mejores ofertas por categoría
      bestOffers: {
        highest: promotionsWithCountdown.find(p => p.value >= 45),
        welcome: promotionsWithCountdown.find(p => p.code.includes('BIENVENIDO')),
        urgent: promotionsWithCountdown.find(p => p.isUrgent),
        premium: promotionsWithCountdown.find(p => p.plans[0] !== 'all')
      },
      
      lastUpdated: now.toISOString()
    };

    // Headers para cache optimizado
    res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=300'); // Cache por 3 minutos
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching active promotions:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor',
      promotions: [],
      count: 0,
      featured: null
    });
  }
}
