import React, { useState, useEffect } from 'react';
import Head from 'next/head';

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Simulación de autenticación
  useEffect(() => {
    const authStatus = localStorage.getItem('dashboard_auth');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
      fetchDashboardData();
    }
    setIsLoading(false);
  }, []);

  // Función para cargar datos del dashboard
  const fetchDashboardData = async () => {
    setDataLoading(true);
    setDataError(null);
    
    try {
      const response = await fetch('/api/dashboard-metrics', {
        headers: {
          'Authorization': 'Bearer dashboard-access'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDataError(error.message);
      
      // Datos de fallback para demo
      setDashboardData({
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
        ]
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (password === 'umbra2025') {
      localStorage.setItem('dashboard_auth', 'authenticated');
      setIsAuthenticated(true);
      fetchDashboardData();
    } else {
      setLoginError('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dashboard_auth');
    setIsAuthenticated(false);
    setDashboardData(null);
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
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
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
        {dataLoading && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(207, 35, 35, 0.9)',
            padding: '12px 20px',
            borderRadius: '6px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
          }}>
            Actualizando datos...
          </div>
        )}

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
            border: '1px solid #333',
            backdropFilter: 'blur(10px)'
          }}>
            <div>
              <h1 style={{
                fontSize: '2.5rem',
                fontFamily: "'Russo One', sans-serif",
                color: '#CF2323',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textShadow: '0 0 20px rgba(207, 35, 35, 0.5)',
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
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={fetchDashboardData}
                disabled={dataLoading}
                style={{
                  padding: '10px 20px',
                  background: dataLoading ? '#666' : 'linear-gradient(45deg, #CF2323, #8b0000)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: dataLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {dataLoading ? 'Actualizando...' : 'Actualizar'}
              </button>
              
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
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease'
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {dataError && (
            <div style={{
              background: 'rgba(207, 35, 35, 0.1)',
              border: '1px solid rgba(207, 35, 35, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem',
              color: '#CF2323'
            }}>
              ⚠️ Error al cargar datos: {dataError}
              <br />
              <small>Mostrando datos de demostración</small>
            </div>
          )}

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
              border: '1px solid #333',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60px',
                height: '60px',
                background: 'linear-gradient(45deg, #CF2323, transparent)',
                borderRadius: '0 12px 0 100%',
                opacity: 0.3
              }}></div>
              <h3 style={{
                color: '#A1A1AA',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '1rem',
                fontWeight: 'normal'
              }}>
                Ingresos Totales
              </h3>
              <p style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#CF2323',
                margin: 0,
                fontFamily: "'Russo One', sans-serif"
              }}>
                {dashboardData ? formatCurrency(dashboardData.totalRevenue) : '...' }
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
              border: '1px solid #333',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60px',
                height: '60px',
                background: 'linear-gradient(45deg, #CF2323, transparent)',
                borderRadius: '0 12px 0 100%',
                opacity: 0.3
              }}></div>
              <h3 style={{
                color: '#A1A1AA',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '1rem',
                fontWeight: 'normal'
              }}>
                Clientes Activos
              </h3>
              <p style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#CF2323',
                margin: 0,
                fontFamily: "'Russo One', sans-serif"
              }}>
                {dashboardData ? dashboardData.activeClients : '...'}
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
              border: '1px solid #333',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60px',
                height: '60px',
                background: 'linear-gradient(45deg, #CF2323, transparent)',
                borderRadius: '0 12px 0 100%',
                opacity: 0.3
              }}></div>
              <h3 style={{
                color: '#A1A1AA',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '1rem',
                fontWeight: 'normal'
              }}>
                Pagos Pendientes
              </h3>
              <p style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#CF2323',
                margin: 0,
                fontFamily: "'Russo One', sans-serif"
              }}>
                {dashboardData ? dashboardData.pendingPayments : '...'}
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
              border: '1px solid #333',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60px',
                height: '60px',
                background: 'linear-gradient(45deg, #CF2323, transparent)',
                borderRadius: '0 12px 0 100%',
                opacity: 0.3
              }}></div>
              <h3 style={{
                color: '#A1A1AA',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '1rem',
                fontWeight: 'normal'
              }}>
                Tasa de Conversión
              </h3>
              <p style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#CF2323',
                margin: 0,
                fontFamily: "'Russo One', sans-serif"
              }}>
                {dashboardData ? `${dashboardData.conversionRate}%` : '...'}
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

          {/* Sección de pagos recientes y alertas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
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
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontFamily: "'Russo One', sans-serif"
              }}>
                Transacciones Recientes
              </h2>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {dashboardData?.recentPayments?.map((payment) => (
                  <div key={payment.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 0',
                    borderBottom: '1px solid #333',
                    transition: 'all 0.3s ease'
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
                        letterSpacing: '0.5px',
                        backgroundColor: payment.status === 'approved' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: payment.status === 'approved' ? '#22c55e' : '#f59e0b'
                      }}>
                        {payment.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                )) || <p style={{ color: '#A1A1AA' }}>Cargando transacciones...</p>}
              </div>
            </div>

            {/* Centro de Alertas */}
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
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontFamily: "'Russo One', sans-serif"
              }}>
                Centro de Alertas
              </h2>

              <div style={{
                background: 'rgba(207, 35, 35, 0.1)',
                border: '1px solid rgba(207, 35, 35, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>⚠️</span>
                  <strong style={{ color: '#CF2323' }}>CRÍTICO: 5 clientes vencen en 3 días</strong>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#A1A1AA'
                }}>
                  Activar protocolo de renovación automática
                </p>
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>📊</span>
                  <strong style={{ color: '#f59e0b' }}>Pico de conversión detectado</strong>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#A1A1AA'
                }}>
                  23:00-01:00 hrs tiene 40% más conversiones
                </p>
              </div>

              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>✅</span>
                  <strong style={{ color: '#22c55e' }}>Sistema funcionando óptimamente</strong>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#A1A1AA'
                }}>
                  Todos los servicios operativos
                </p>
              </div>
            </div>
          </div>

          {/* Distribución de Clientes */}
          <div style={{
            background: 'rgba(17, 17, 17, 0.8)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #333',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              color: '#CF2323',
              fontSize: '1.3rem',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: "'Russo One', sans-serif"
            }}>
              Distribución por Plan
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              {dashboardData?.clientDistribution?.map((item, index) => (
                <div key={index} style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    color: '#E5E7EB',
                    fontSize: '1rem',
                    marginBottom: '1rem',
                    fontWeight: 'normal'
                  }}>
                    {item.plan}
                  </h3>
                  <p style={{
                    fontSize: '2rem',
                    color: '#CF2323',
                    fontWeight: 'bold',
                    margin: '0.5rem 0',
                    fontFamily: "'Russo One', sans-serif"
                  }}>
                    {item.count}
                  </p>
                  <p style={{
                    color: '#A1A1AA',
                    fontSize: '0.9rem',
                    margin: 0
                  }}>
                    {item.percentage}% del total
                  </p>
                </div>
              )) || <p style={{ color: '#A1A1AA' }}>Cargando distribución...</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
