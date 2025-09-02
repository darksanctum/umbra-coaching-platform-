import React, { useState, useEffect } from 'react';
import Head from 'next/head';

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Datos simulados para demo
  const [dashboardData] = useState({
    totalRevenue: 156750,
    activeClients: 47,
    pendingPayments: 8,
    conversionRate: 23.5,
    recentPayments: [
      { id: 1, client: 'Carlos M.', amount: 2999, plan: 'Transformación Acelerada', date: '2025-01-31', status: 'approved' },
      { id: 2, client: 'Ana L.', amount: 1199, plan: 'Coaching Mensual', date: '2025-01-31', status: 'approved' },
      { id: 3, client: 'Miguel R.', amount: 4299, plan: 'Metamorfosis Completa', date: '2025-01-30', status: 'approved' },
      { id: 4, client: 'Sofia T.', amount: 1199, plan: 'Coaching Mensual', date: '2025-01-30', status: 'pending' },
      { id: 5, client: 'Diego P.', amount: 2999, plan: 'Transformación Acelerada', date: '2025-01-29', status: 'approved' }
    ]
  });

  useEffect(() => {
    // Verificar si ya está autenticado
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('dashboard_auth');
      if (authStatus === 'authenticated') {
        setIsAuthenticated(true);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (password === 'umbra2025') {
      localStorage.setItem('dashboard_auth', 'authenticated');
      setIsAuthenticated(true);
    } else {
      setLoginError('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dashboard_auth');
    setIsAuthenticated(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0a0a0a',
        color: '#fff'
      }}>
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Dashboard - Umbra Coaching</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #000000, #0a0a0a)',
          fontFamily: "'Space Mono', monospace"
        }}>
          <form onSubmit={handleLogin} style={{
            background: 'rgba(17, 17, 17, 0.9)',
            padding: '3rem',
            borderRadius: '12px',
            border: '1px solid #CF2323',
            boxShadow: '0 0 30px rgba(207, 35, 35, 0.3)',
            minWidth: '400px'
          }}>
            <h1 style={{
              color: '#CF2323',
              textAlign: 'center',
              marginBottom: '2rem',
              fontSize: '1.8rem',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              Acceso Restringido
            </h1>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#E5E7EB',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Código de Acceso
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
                placeholder="Ingresa el código"
                required
              />
            </div>
            
            {loginError && (
              <div style={{
                color: '#CF2323',
                background: 'rgba(207, 35, 35, 0.1)',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '1rem',
                textAlign: 'center',
                border: '1px solid rgba(207, 35, 35, 0.3)'
              }}>
                {loginError}
              </div>
            )}
            
            <button type="submit" style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(45deg, #CF2323, #8b0000)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '1rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 'bold'
            }}>
              Acceder al Santuario
            </button>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard Umbra - Control Central</title>
        <meta name="robots" content="noindex,nofollow" />
        <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000, #0a0a0a, #111111)',
        color: '#E5E7EB',
        fontFamily: "'Space Mono', monospace",
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem',
            padding: '2rem',
            background: 'rgba(17, 17, 17, 0.8)',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <div>
              <h1 style={{
                fontSize: '2.5rem',
                fontFamily: "'Russo One', sans-serif",
                color: '#CF2323',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                margin: 0
              }}>
                UMBRA CONTROL
              </h1>
              <p style={{
                color: '#A1A1AA',
                margin: '0.5rem 0 0 0',
                fontSize: '1rem'
              }}>
                Sistema de Control Central - {new Date().toLocaleDateString('es-MX')}
              </p>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid #CF2323',
                borderRadius: '6px',
                color: '#CF2323',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Cerrar Sesión
            </button>
          </div>

          {/* Métricas principales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            <div style={{
              background: 'rgba(17, 17, 17, 0.8)',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <h3 style={{
                color: '#A1A1AA',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                marginBottom: '1rem'
              }}>
                Ingresos Totales
              </h3>
              <p style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#CF2323',
                margin: 0
              }}>
                {formatCurrency(dashboardData.totalRevenue)}
              </p>
              <p style={{
                color: '#A1A1AA',
                fontSize: '0.8rem',
                marginTop: '0.5rem'
              }}>
                +12.5% vs mes anterior
              </p>
            </div>

            <div style={{
              background: 'rgba(17, 17, 17, 0.8)',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <h3 style={{
                color: '#A1A1AA',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                marginBottom: '1rem'
              }}>
                Clientes Activos
              </h3>
              <p style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#CF2323',
                margin: 0
              }}>
                {dashboardData.activeClients}
              </p>
              <p style={{
                color: '#A1A1AA',
                fontSize: '0.8rem',
                marginTop: '0.5rem'
              }}>
                +8 nuevos esta semana
              </p>
            </div>

            <div style={{
              background: 'rgba(17, 17, 17, 0.8)',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <h3 style={{
                color: '#A1A1AA',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                marginBottom: '1rem'
              }}>
                Pagos Pendientes
              </h3>
              <p style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#CF2323',
                margin: 0
              }}>
                {dashboardData.pendingPayments}
              </p>
              <p style={{
                color: '#A1A1AA',
                fontSize: '0.8rem',
                marginTop: '0.5rem'
              }}>
                Requieren seguimiento
              </p>
            </div>

            <div style={{
              background: 'rgba(17, 17, 17, 0.8)',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <h3 style={{
                color: '#A1A1AA',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                marginBottom: '1rem'
              }}>
                Tasa de Conversión
              </h3>
              <p style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#CF2323',
                margin: 0
              }}>
                {dashboardData.conversionRate}%
              </p>
              <p style={{
                color: '#A1A1AA',
                fontSize: '0.8rem',
                marginTop: '0.5rem'
              }}>
                Visitantes a clientes
              </p>
            </div>
          </div>

          {/* Pagos Recientes */}
          <div style={{
            background: 'rgba(17, 17, 17, 0.8)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <h2 style={{
              color: '#CF2323',
              fontSize: '1.3rem',
              marginBottom: '1.5rem',
              textTransform: 'uppercase'
            }}>
              Transacciones Recientes
            </h2>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {dashboardData.recentPayments.map((payment) => (
                <div key={payment.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 0',
                  borderBottom: '1px solid #333'
                }}>
                  <div>
                    <p style={{
                      margin: 0,
                      color: '#E5E7EB',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}>
                      {payment.client}
                    </p>
                    <p style={{
                      margin: '0.2rem 0 0 0',
                      color: '#A1A1AA',
                      fontSize: '0.8rem'
                    }}>
                      {payment.plan} • {payment.date}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      margin: 0,
                      color: '#CF2323',
                      fontSize: '1.1rem',
                      fontWeight: 'bold'
                    }}>
                      {formatCurrency(payment.amount)}
                    </p>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      backgroundColor: payment.status === 'approved' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: payment.status === 'approved' ? '#22c55e' : '#f59e0b'
                    }}>
                      {payment.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
