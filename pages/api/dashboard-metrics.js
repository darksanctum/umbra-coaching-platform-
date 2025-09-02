// pages/api/dashboard-metrics.js
import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar autorización básica
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer dashboard-access') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    
    if (accessToken) {
      // Obtener datos reales de Mercado Pago
      const client = new MercadoPagoConfig({ accessToken });
      const payment = new Payment(client);
      
      try {
        // Obtener pagos de los últimos 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Búsqueda con criterios específicos
        const searchResult = await payment.search({
          options: {
            sort: 'date_created',
            criteria: 'desc',
            range: 'date_created',
            begin_date: thirtyDaysAgo.toISOString(),
            end_date: new Date().toISOString(),
            limit: 50
          }
        });

        // Procesar datos reales
        const recentPayments = searchResult.results?.slice(0, 10).map(p => ({
          id: p.id,
          client: p.payer?.email?.split('@')[0] || 'Cliente',
          amount: p.transaction_amount,
          plan: p.description || 'Plan no especificado',
          date: new Date(p.date_created).toLocaleDateString('es-MX'),
          status: p.status
        })) || [];

        // Calcular métricas
        const approvedPayments = searchResult.results?.filter(p => p.status === 'approved') || [];
        const totalRevenue = approvedPayments.reduce((sum, p) => sum + p.transaction_amount, 0);
        const activeClients = approvedPayments.length;
        const pendingPayments = searchResult.results?.filter(p => p.status === 'pending').length || 0;

        // Calcular ingresos por mes (últimos 4 meses)
        const monthlyRevenue = calculateMonthlyRevenue(searchResult.results || []);
        const clientDistribution = calculateClientDistribution(recentPayments);

        return res.status(200).json({
          totalRevenue,
          activeClients,
          pendingPayments,
          conversionRate: 23.5, // Este requiere integración con Google Analytics
          recentPayments,
          monthlyRevenue,
          clientDistribution,
          lastUpdated: new Date().toISOString(),
          dataSource: 'mercadopago'
        });

      } catch (mpError) {
        console.warn('Error conectando con MercadoPago:', mpError.message);
        // Si falla MP, usar datos demo pero avisar
      }
    }

    // Datos de demostración (fallback)
    const demoData = {
      totalRevenue: 156750,
      activeClients: 47,
      pendingPayments: 8,
      conversionRate: 23.5,
      recentPayments: [
        { 
          id: Date.now(), 
          client: 'Carlos M.', 
          amount: 2999, 
          plan: 'Transformación Acelerada', 
          date: new Date().toLocaleDateString('es-MX'), 
          status: 'approved' 
        },
        { 
          id: Date.now() + 1, 
          client: 'Ana L.', 
          amount: 1199, 
          plan: 'Coaching Mensual', 
          date: new Date(Date.now() - 86400000).toLocaleDateString('es-MX'), 
          status: 'approved' 
        },
        { 
          id: Date.now() + 2, 
          client: 'Miguel R.', 
          amount: 4299, 
          plan: 'Metamorfosis Completa', 
          date: new Date(Date.now() - 172800000).toLocaleDateString('es-MX'), 
          status: 'approved' 
        }
      ],
      monthlyRevenue: [
        { month: 'Oct', amount: 89450 },
        { month: 'Nov', amount: 127300 },
        { month: 'Dic', amount: 156750 },
        { month: 'Ene', amount: 142100 }
      ],
      clientDistribution: [
        { plan: 'Coaching Mensual', count: 22, percentage: 46.8 },
        { plan: 'Transformación Acelerada', count: 18, percentage: 38.3 },
        { plan: 'Metamorfosis Completa', count: 7, percentage: 14.9 }
      ],
      lastUpdated: new Date().toISOString(),
      dataSource: 'demo',
      warning: 'Datos de demostración - Configura MP_ACCESS_TOKEN para datos reales'
    };

    res.status(200).json(demoData);

  } catch (error) {
    console.error('Error en dashboard metrics:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
}

function calculateMonthlyRevenue(payments) {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthlyData = {};
  
  payments.forEach(payment => {
    if (payment.status === 'approved') {
      const date = new Date(payment.date_created);
      const monthKey = months[date.getMonth()];
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + payment.transaction_amount;
    }
  });

  // Retornar últimos 4 meses
  const currentMonth = new Date().getMonth();
  const result = [];
  for (let i = 3; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const monthName = months[monthIndex];
    result.push({
      month: monthName,
      amount: monthlyData[monthName] || 0
    });
  }
  
  return result;
}

function calculateClientDistribution(payments) {
  const planCounts = {};
  const total = payments.length;

  payments.forEach(payment => {
    const plan = payment.plan || 'Sin especificar';
    planCounts[plan] = (planCounts[plan] || 0) + 1;
  });

  return Object.entries(planCounts).map(([plan, count]) => ({
    plan,
    count,
    percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0
  }));
}
