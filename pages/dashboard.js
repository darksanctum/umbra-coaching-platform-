import React, { useState, useEffect } from 'react';
import Head from 'next/head';

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  
  // Estados para datos del dashboard
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // Verificar si ya está autenticado
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('dashboard_auth');
      if (authStatus === 'authenticated') {
        setIsAuthenticated(true);
        fetchDashboardData(); // Cargar datos automáticamente
      }
    }
    setIsLoading(false);
  }, []);

  // Función para obtener datos reales del dashboard
  const fetchDashboardData = async () => {
    setDataLoading(true);
    setDataError(null);
    
    try {
      const response = await fetch('/api/dashboard-metrics', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer dashboard-access',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDashboardData(data);
      setLastUpdated(new Date().toLocaleString('es-MX'));
      
      // Si hay warning (datos demo), mostrar alerta
      if (data.warning) {
        setDataError(`⚠️ ${data.warning}`);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDataError(`Error al cargar datos: ${error.message}`);
      
      // Datos de fallback local si falla todo
      setDashboardData({
        totalRevenue: 0,
        activeClients: 0,
        pendingPayments: 0,
        conversionRate: 0,
        recentPayments: [],
        monthlyRevenue: [],
        clientDistribution: [],
        dataSource: 'error',
        lastUpdated: new Date().toISOString()
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
      fetchDashboardData(); // Cargar datos después del login
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

  const getDataSourceIcon = () => {
    if (!dashboardData) return '📊';
    switch(dashboardData.dataSource) {
      case 'mercadopago': return '💳';
      case 'demo': return '🧪';
      case 'error': return '⚠️';
      default: return '📊';
    }
  };

  const getDataSourceText = () => {
    if (!dashboardData) return 'Cargando...';
    switch(dashboardData.dataSource) {
      case 'mercadopago': return 'Datos reales de Mercado Pago';
      case 'demo': return 'Datos de demostración';
      case 'error': return 'Error - Datos locales';
      default: return 'Datos mixtos';
    }
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
        Inicializando sistema...
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
        {/* Indicador de carga */}
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
            🔄 Actualizando datos...
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
                {getDataSourceIcon()} {getDataSourceText()} - {new Date().toLocaleDateString('es-MX')}
              </p>
              {lastUpdated && (
                <p style={{
                  color: '#6b7280',
                  margin: '0.25rem 0 0 0',
                  fontSize: '0.8rem'
                }}>
                  Última actualización: {lastUpdated}
                </p>
              )}
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
                {dataLoading ? 'Actualizando...' : '🔄 Actualizar'}
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
                  letterSpacing: '1px'
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Error o warning */}
          {dataError && (
            <div style={{
              background: dataError.includes('⚠️') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(207, 35, 35, 0.1)',
              border: `1px solid ${dataError.includes('⚠️') ? 'rgba(245, 158, 11, 0.3)' : 'rgba(207, 35, 35, 0.3)'}`,
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem',
              color: dataError.includes('⚠️') ? '#f59e0b' : '#CF2323'
            }}>
              {dataError}
            </div>
          )}

          {/* Métricas principales */}
          {dashboardData && (
            <>
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
                    marginBottom: '1rem',
                    fontWeight: 'normal'
                  }}>
                    💰 Ingresos Totales
                  </h3>
                  <p style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#CF2323',
                    margin: 0,
                    fontFamily: "'Russo One', sans-serif"
                  }}>
                    {formatCurrency(dashboardData.totalRevenue)}
                  </p>
                  <p style={{
                    color: '#A1A1AA',
                    fontSize: '0.8rem',
                    marginTop: '0.5rem'
                  }}>
                    {dashboardData.dataSource === 'mercadopago' ? 'Últimos 30 días' : 'Datos simulados'}
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
                    marginBottom: '1rem',
                    fontWeight: 'normal'
                  }}>
                    👥 Clientes Activos
                  </h3>
                  <p style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#CF2323',
                    margin: 0,
                    fontFamily: "'Russo One', sans-serif"
                  }}>
                    {dashboardData.activeClients}
                  </p>
                  <p style={{
                    color: '#A1A1AA',
                    fontSize: '0.8rem',
                    marginTop: '0.5rem'
                  }}>
                    Pagos aprobados
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
                    marginBottom: '1rem',
                    fontWeight: 'normal'
                  }}>
                    ⏳ Pagos Pendientes
                  </h3>
                  <p style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#CF2323',
                    margin: 0,
                    fontFamily: "'Russo One', sans-serif"
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
                    marginBottom: '1rem',
                    fontWeight: 'normal'
                  }}>
                    📈 Tasa de Conversión
                  </h3>
                  <p style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#CF2323',
                    margin: 0,
                    fontFamily: "'Russo One', sans-serif"
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

              {/* Transacciones recientes */}
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
                  fontFamily: "'Russo One', sans-serif"
                }}>
                  💳 Transacciones Recientes
                </h2>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {dashboardData.recentPayments && dashboardData.recentPayments.length > 0 ? (
                    dashboardData.recentPayments.map((payment, index) => (
                      <div key={payment.id || index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem 0',
                        borderBottom: index < dashboardData.recentPayments.length - 1 ? '1px solid #333' : 'none'
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
                            {payment.status === 'approved' ? 'Aprobado' : payment.status === 'pending' ? 'Pendiente' : payment.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '3rem',
                      color: '#6b7280'
                    }}>
                      <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>📊</p>
                      <p style={{ margin: 0 }}>
                        {dashboardData.dataSource === 'mercadopago' 
                          ? 'No hay transacciones en los últimos 30 días'
                          : 'Sin datos de transacciones'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Estado sin datos */}
          {!dashboardData && !dataLoading && (
            <div style={{
              textAlign: 'center',
              padding: '4rem',
              background: 'rgba(17, 17, 17, 0.8)',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <p style={{ fontSize: '4rem', margin: '0 0 1rem 0' }}>📊</p>
              <h2 style={{ color: '#CF2323', marginBottom: '1rem' }}>Dashboard Sin Datos</h2>
              <p style={{ color: '#A1A1AA', marginBottom: '2rem' }}>
                Haz clic en "Actualizar" para cargar las métricas
              </p>
              <button 
                onClick={fetchDashboardData}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(45deg, #CF2323, #8b0000)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                🔄 Cargar Datos
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
