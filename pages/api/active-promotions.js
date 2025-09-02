// pages/api/active-promotions.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = new Date();
    
    // Promociones activas - configurar según tus necesidades
    const promotions = [
      {
        id: 'promo_satori_2025',
        name: 'Promoción Satori',
        description: '¡Descuento especial del 20% por tiempo limitado!',
        type: 'percentage',
        value: 20,
        code: 'SATORI20',
        startDate: '2025-01-15T00:00:00Z',
        endDate: '2025-02-28T23:59:59Z',
        plans: ['all'], // 'all' o nombres específicos de planes
        minimumAmount: 1200,
        isActive: true,
        priority: 1, // Prioridad para mostrar (1 = más alta)
        bannerText: '🔥 Oferta Limitada: 20% OFF con código SATORI20',
        bannerColor: '#CF2323'
      },
      {
        id: 'promo_transform_feb',
        name: 'Transformación Especial',
        description: 'Descuento del 25% en planes de transformación',
        type: 'percentage',
        value: 25,
        code: 'TRANSFORM25',
        startDate: '2025-02-01T00:00:00Z',
        endDate: '2025-03-31T23:59:59Z',
        plans: ['Transformación Acelerada', 'Metamorfosis Completa'],
        minimumAmount: 2000,
        isActive: true,
        priority: 2,
        bannerText: '⚡ Transforma tu físico: 25% OFF en planes avanzados',
        bannerColor: '#8b0000'
      },
      {
        id: 'promo_new_client',
        name: 'Bienvenida Nuevos Clientes',
        description: '$500 de descuento para nuevos clientes',
        type: 'fixed',
        value: 500,
        code: 'PRIMERA50', // Error intencional en el nombre para mostrar flexibilidad
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-06-30T23:59:59Z',
        plans: ['all'],
        minimumAmount: 1500,
        isActive: true,
        priority: 3,
        bannerText: '🎯 Primera vez: $500 MXN de descuento',
        bannerColor: '#CF2323'
      },
      
      // Ejemplo de promoción desactivada
      {
        id: 'promo_holiday_2024',
        name: 'Promoción Navideña 2024',
        description: 'Descuento navideño del 30%',
        type: 'percentage',
        value: 30,
        code: 'NAVIDAD30',
        startDate: '2024-12-15T00:00:00Z',
        endDate: '2025-01-15T23:59:59Z',
        plans: ['all'],
        minimumAmount: 1000,
        isActive: false, // Desactivada
        priority: 4,
        bannerText: '🎄 Oferta Navideña: 30% OFF',
        bannerColor: '#22c55e'
      },
      
      // Ejemplo de promoción futura
      {
        id: 'promo_summer_2025',
        name: 'Promoción de Verano 2025',
        description: 'Descuento de verano del 30%',
        type: 'percentage',
        value: 30,
        code: 'VERANO30',
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-08-31T23:59:59Z',
        plans: ['all'],
        minimumAmount: 2000,
        isActive: true,
        priority: 5,
        bannerText: '🏖️ Verano Fit: 30% OFF en todos los planes',
        bannerColor: '#f59e0b'
      }
    ];

    // Filtrar promociones activas y vigentes
    const activePromotions = promotions.filter(promo => {
      // Verificar si está activa
      if (!promo.isActive) return false;
      
      // Verificar fechas
      const startDate = new Date(promo.startDate);
      const endDate = new Date(promo.endDate);
      
      return now >= startDate && now <= endDate;
    });

    // Ordenar por prioridad
    activePromotions.sort((a, b) => a.priority - b.priority);

    // Crear respuesta con información útil para el frontend
    const response = {
      success: true,
      count: activePromotions.length,
      promotions: activePromotions.map(promo => ({
        id: promo.id,
        name: promo.name,
        description: promo.description,
        code: promo.code,
        type: promo.type,
        value: promo.value,
        plans: promo.plans,
        minimumAmount: promo.minimumAmount,
        endDate: promo.endDate,
        bannerText: promo.bannerText,
        bannerColor: promo.bannerColor,
        priority: promo.priority,
        timeRemaining: getTimeRemaining(promo.endDate)
      })),
      // Promoción destacada (la de mayor prioridad)
      featured: activePromotions.length > 0 ? {
        code: activePromotions[0].code,
        bannerText: activePromotions[0].bannerText,
        bannerColor: activePromotions[0].bannerColor,
        discount: activePromotions[0].value,
        type: activePromotions[0].type
      } : null,
      lastUpdated: now.toISOString()
    };

    // Headers para cache (opcional)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600'); // Cache por 5 minutos
    
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

// Función helper para calcular tiempo restante
function getTimeRemaining(endDate) {
  const now = new Date().getTime();
  const end = new Date(endDate).getTime();
  const difference = end - now;

  if (difference <= 0) {
    return { expired: true };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

  return {
    expired: false,
    days,
    hours,
    minutes,
    totalHours: Math.floor(difference / (1000 * 60 * 60)),
    formatted: days > 0 
      ? `${days}d ${hours}h` 
      : hours > 0 
      ? `${hours}h ${minutes}m`
      : `${minutes}m`
  };
}
