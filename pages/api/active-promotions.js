// pages/api/active-promotions.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = new Date();
    
    // Promociones activas por plan
    // En producción, esto vendría de tu base de datos
    const currentPromotions = {
      // Ejemplo: Promoción de Año Nuevo
      'Coaching Mensual': {
        type: 'percentage',
        discount: 25,
        description: '25% descuento Año Nuevo',
        autoApplyCode: 'NUEVO2025',
        expiryDate: '2025-02-15T23:59:59Z',
        isActive: new Date('2025-02-15T23:59:59Z') > now
      },
      
      // Ejemplo: Promoción de San Valentín
      'Transformación Acelerada': {
        type: 'fixed',
        discount: 500,
        description: '$500 descuento San Valentín',
        autoApplyCode: 'VALENTINE25',
        expiryDate: '2025-02-20T23:59:59Z',
        isActive: new Date('2025-02-20T23:59:59Z') > now
      }
    };

    // Filtrar solo promociones activas
    const activePromotions = {};
    
    for (const [planName, promotion] of Object.entries(currentPromotions)) {
      if (promotion.isActive && new Date(promotion.expiryDate) > now) {
        activePromotions[planName] = {
          type: promotion.type,
          discount: promotion.discount,
          description: promotion.description,
          expiryDate: promotion.expiryDate,
          autoApplyCode: promotion.autoApplyCode
        };
      }
    }

    res.status(200).json(activePromotions);

  } catch (error) {
    console.error('Error fetching active promotions:', error);
    res.status(500).json({ error: 'Error retrieving promotions' });
  }
}