// pages/api/validate-coupon.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, originalPrice, planName } = req.body;

    if (!code || !originalPrice) {
      return res.status(400).json({ error: 'Código y precio original son requeridos' });
    }

    // Base de datos de cupones válidos
    // En producción, estos estarían en una base de datos
    const validCoupons = {
      // Cupones de descuento porcentual
      'UMBRA50': {
        type: 'percentage',
        discount: 50,
        description: '50% de descuento',
        minAmount: 1000,
        maxUses: 100,
        currentUses: 23,
        expiryDate: new Date('2025-12-31'),
        applicablePlans: ['all'] // 'all' o array de nombres de planes específicos
      },
      'NUEVO2025': {
        type: 'percentage',
        discount: 25,
        description: '25% de descuento - Clientes nuevos',
        minAmount: 500,
        maxUses: 50,
        currentUses: 12,
        expiryDate: new Date('2025-03-31'),
        applicablePlans: ['all']
      },
      'STUDENT': {
        type: 'percentage',
        discount: 30,
        description: '30% descuento estudiantes',
        minAmount: 1000,
        maxUses: 200,
        currentUses: 45,
        expiryDate: new Date('2025-06-30'),
        applicablePlans: ['Coaching Mensual', 'Transformación Acelerada']
      },
      
      // Cupones de descuento fijo
      'PROMO500': {
        type: 'fixed',
        discount: 500,
        description: '$500 MXN de descuento',
        minAmount: 2000,
        maxUses: 30,
        currentUses: 8,
        expiryDate: new Date('2025-02-28'),
        applicablePlans: ['Transformación Acelerada', 'Metamorfosis Completa']
      },
      'COMEBACK': {
        type: 'fixed',
        discount: 300,
        description: '$300 MXN - Cliente frecuente',
        minAmount: 1000,
        maxUses: 75,
        currentUses: 22,
        expiryDate: new Date('2025-04-30'),
        applicablePlans: ['all']
      },
      
      // Cupones especiales por fechas
      'VALENTINE25': {
        type: 'percentage',
        discount: 25,
        description: '25% San Valentín - Transforma juntos',
        minAmount: 1500,
        maxUses: 40,
        currentUses: 5,
        expiryDate: new Date('2025-02-20'),
        applicablePlans: ['all']
      },
      'BLACKFRIDAY': {
        type: 'percentage',
        discount: 40,
        description: '40% Black Friday - Oferta limitada',
        minAmount: 1000,
        maxUses: 100,
        currentUses: 0,
        expiryDate: new Date('2025-11-30'),
        applicablePlans: ['all']
      }
    };

    const coupon = validCoupons[code.toUpperCase()];

    // Validar si el cupón existe
    if (!coupon) {
      return res.status(404).json({ error: 'Código de cupón no válido' });
    }

    // Validar si el cupón no ha expirado
    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ error: 'Este cupón ha expirado' });
    }

    // Validar si el cupón no ha alcanzado el límite de usos
    if (coupon.currentUses >= coupon.maxUses) {
      return res.status(400).json({ error: 'Este cupón ya no tiene usos disponibles' });
    }

    // Validar monto mínimo
    if (originalPrice < coupon.minAmount) {
      return res.status(400).json({ 
        error: `Monto mínimo requerido: $${coupon.minAmount} MXN` 
      });
    }

    // Validar si aplica al plan seleccionado
    if (coupon.applicablePlans[0] !== 'all' && 
        !coupon.applicablePlans.includes(planName)) {
      return res.status(400).json({ 
        error: `Este cupón no aplica para el plan ${planName}` 
      });
    }

    // Calcular precio final
    let finalPrice = originalPrice;
    let savings = 0;

    if (coupon.type === 'percentage') {
      savings = Math.round(originalPrice * (coupon.discount / 100));
      finalPrice = originalPrice - savings;
    } else if (coupon.type === 'fixed') {
      savings = Math.min(coupon.discount, originalPrice); // No puede ser mayor al precio original
      finalPrice = Math.max(0, originalPrice - savings);
    }

    // En producción, aquí actualizarías el contador de usos en la base de datos
    // await updateCouponUsage(code);

    console.log(`Cupón aplicado: ${code} | Descuento: $${savings} | Precio final: $${finalPrice}`);

    // Respuesta exitosa
    res.status(200).json({
      valid: true,
      code: code.toUpperCase(),
      type: coupon.type,
      discount: coupon.discount,
      description: coupon.description,
      savings: savings,
      originalPrice: originalPrice,
      finalPrice: finalPrice,
      formattedSavings: `$${savings.toLocaleString()} MXN`,
      formattedFinalPrice: `$${finalPrice.toLocaleString()} MXN`
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al validar el cupón',
      message: error.message 
    });
  }
}