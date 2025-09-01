// pages/api/dashboard-metrics.js
import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar autenticación básica
  const { authorization } = req.headers;
  if (authorization !== 'Bearer umbra_dashboard_2025') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(500).json({ error: 'MP_ACCESS_TOKEN not configured' });
    }

    // Configurar cliente de Mercado Pago
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    // Obtener fechas para cálculos
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Aquí normalmente consultarías tu base de datos
    // Por ahora simularemos con datos que podrías tener almacenados
    
    // En una implementación real, tendrías algo como:
    // const payments = await getPaymentsFromDatabase(startOfMonth, now);
    // const lastMonthPayments = await getPaymentsFromDatabase(startOfLastMonth, endOfLastMonth);

    // Datos simulados basados en tu flujo actual
    const currentMonthRevenue = 47850;
    const lastMonthRevenue = 38920;
    const activeClients = 89;
    const lastMonthClients = 77;
    
    // Calcular métricas
    const revenueGrowth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1);
    const clientGrowth = activeClients - lastMonthClients;
    
    // Pagos recientes simulados (en producción vendrían de tu base de datos)
    const recentPayments = [
      {
        id: 'MP001',
        clientName: 'María González',
        amount: 2999,
        plan: 'Transformación Acelerada',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // hace 2 horas
        status: 'approved'
      },
      {
        id: 'MP002',
        clientName: 'Pedro Jiménez',
        amount: 1199,
        plan: 'Coaching Mensual',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000), // hace 5 horas
        status: 'approved'
      },
      {
        id: 'MP003',
        clientName: 'Sofia Castro',
        amount: 4299,
        plan: 'Metamorfosis Completa',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // ayer
        status: 'approved'
      }
    ];

    // Clientes activos (simulated - en producción de tu base de datos)
    const activeClientsList = [
      {
        name: 'María González',
        plan: 'Transformación Acelerada',
        amount: 2999,
        status: 'active',
        startDate: new Date('2025-01-15'),
        expiryDate: new Date('2025-05-15')
      },
      {
        name: 'Carlos Mendoza',
        plan: 'Coaching Mensual',
        amount: 1199,
        status: 'pending',
        startDate: new Date('2025-01-20'),
        expiryDate: new Date('2025-02-20')
      },
      {
        name: 'Ana Rodríguez',
        plan: 'Metamorfosis Completa',
        amount: 4299,
        status: 'active',
        startDate: new Date('2025-01-10'),
        expiryDate: new Date('2025-08-10')
      }
    ];

    // Alertas basadas en datos reales
    const expiringClients = activeClientsList.filter(client => {
      const daysToExpiry = Math.ceil((client.expiryDate - now) / (1000 * 60 * 60 * 24));
      return daysToExpiry <= 7 && daysToExpiry > 0;
    });

    const pendingClients = activeClientsList.filter(client => client.status === 'pending');

    const alerts = [
      ...(expiringClients.length > 0 ? [{
        type: 'critical',
        title: `CRÍTICO: ${expiringClients.length} clientes vencen en 7 días`,
        description: 'Activar protocolo de renovación automática',
        count: expiringClients.length
      }] : []),
      ...(pendingClients.length > 0 ? [{
        type: 'warning',
        title: `SEGUIMIENTO: ${pendingClients.length} formularios pendientes`,
        description: 'Bot de onboarding requiere intervención',
        count: pendingClients.length
      }] : []),
      {
        type: 'info',
        title: 'META: 85% objetivo mensual alcanzado',
        description: `$${currentMonthRevenue.toLocaleString()} / $50,000 - Acelerar conversiones`,
        progress: (currentMonthRevenue / 50000 * 100).toFixed(1)
      }
    ];

    // Respuesta con todas las métricas
    const dashboardData = {
      metrics: {
        revenue: {
          current: currentMonthRevenue,
          growth: revenueGrowth,
          formatted: `$${currentMonthRevenue.toLocaleString()}`
        },
        clients: {
          active: activeClients,
          growth: clientGrowth,
          formatted: activeClients.toString()
        },
        conversion: {
          rate: 8.4,
          growth: 1.2,
          formatted: '8.4%'
        },
        retention: {
          rate: 92,
          growth: 5,
          formatted: '92%'
        }
      },
      recentPayments: recentPayments.map(payment => ({
        ...payment,
        timeAgo: getTimeAgo(payment.date),
        formattedAmount: `+$${payment.amount.toLocaleString()}`
      })),
      activeClients: activeClientsList.map(client => ({
        ...client,
        formattedAmount: `$${client.amount.toLocaleString()}`,
        daysToExpiry: Math.ceil((client.expiryDate - now) / (1000 * 60 * 60 * 24))
      })),
      alerts,
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(dashboardData);

  } catch (error) {
    console.error('Dashboard API Error:', error);
    res.status(500).json({ 
      error: 'Error retrieving dashboard data',
      message: error.message 
    });
  }
}

// Función auxiliar para calcular "hace X tiempo"
function getTimeAgo(date) {
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
  }
}