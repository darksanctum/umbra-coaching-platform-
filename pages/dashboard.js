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
        fetchDashboardData();
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
      
      if (data.warning) {
        setDataError(`⚠️ ${data.warning}`);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDataError(`Error al cargar datos: ${error.message}`);
      
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

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-MX').format(num);
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
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#e2e8f0'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(99, 102, 241, 0.3)',
            borderTop: '3px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Dashboard - Umbra Coaching</title>
          <meta name="robots" content="noindex,nofollow" />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </Head>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          <form onSubmit={handleLogin} style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            padding: '3rem',
            borderRadius: '24px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            minWidth: '400px'
          }}>
            <h1 style={{
              color: '#e2e8f0',
              textAlign: 'center',
              marginBottom: '2rem',
              fontSize: '1.8rem',
              fontWeight: '600',
              letterSpacing: '-0.02em'
            }}>
              Acceso al Dashboard
            </h1>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#94a3b8',
                marginBottom: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500'
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
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                placeholder="Ingresa el código"
                required
              />
            </div>
            
            {loginError && (
              <div style={{
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '1rem',
                textAlign: 'center',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                fontSize: '0.9rem'
              }}>
                {loginError}
              </div>
            )}
            
            <button type="submit" style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)'
            }}>
              Acceder
            </button>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Umbra Coaching</title>
        <meta name="robots" content="noindex,nofollow" />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .metric-card {
            transition: all 0.2s ease;
          }
          .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          }
          .stat-trend-up {
            color: #10b981;
          }
          .stat-trend-down {
            color: #ef4444;
          }
        `}</style>
      </Head>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#e2e8f0',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: 'flex'
      }}>
        {/* Sidebar */}
        <div style={{
          width: '280px',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(99, 102, 241, 0.1)',
          padding: '2rem 0',
          position: 'fixed',
          left: 0,
          top: 0
        }}>
          {/* Logo */}
          <div style={{ padding: '0 2rem', marginBottom: '3rem' }}>
            <h1 style={{
              color: '#e2e8f0',
              fontSize: '1.5rem',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              margin: 0
            }}>
              Umbra UI
            </h1>
          </div>

          {/* Navigation */}
          <nav>
            <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
              <div style={{
                padding: '12px 16px',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '12px',
                color: '#6366f1',
                fontSize: '0.9rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                📊 Dashboard
              </div>
            </div>

            <div style={{ padding: '0 2rem' }}>
              <p style={{
                color: '#64748b',
                fontSize: '0.8rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: '0 0 1rem 0'
              }}>
                Management
              </p>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  👥 Clientes
                </div>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  💳 Pagos
                </div>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  📈 Analytics
                </div>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  ⚙️ Configuración
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div style={{
              position: 'absolute',
              bottom: '2rem',
              left: '2rem',
              right: '2rem'
            }}>
              <button 
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div style={{
          marginLeft: '280px',
          padding: '2rem 3rem',
          width: 'calc(100% - 280px)'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                letterSpacing: '-0.02em',
                margin: '0 0 0.5rem 0',
                color: '#e2e8f0'
              }}>
                Dashboard
              </h1>
              <p style={{
                color: '#64748b',
                margin: 0,
                fontSize: '1rem'
              }}>
                {getDataSourceIcon()} {getDataSourceText()}
              </p>
              {lastUpdated && (
                <p style={{
                  color: '#475569',
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
                  background: dataLoading ? 'rgba(99, 102, 241, 0.3)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  cursor: dataLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  boxShadow: dataLoading ? 'none' : '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {dataLoading ? (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                ) : '🔄'}
                {dataLoading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>

          {/* Error o warning */}
          {dataError && (
            <div style={{
              background: dataError.includes('⚠️') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${dataError.includes('⚠️') ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              borderRadius: '16px',
              padding: '1rem',
              marginBottom: '2rem',
              color: dataError.includes('⚠️') ? '#f59e0b' : '#ef4444'
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
                gap: '1.5rem',
                marginBottom: '3rem'
              }}>
                {[
                  {
                    title: 'Revenue',
                    value: formatCurrency(dashboardData.totalRevenue),
                    change: '+12.5%',
                    trend: 'up',
                    icon: '💰'
                  },
                  {
                    title: 'Visitors',
                    value: formatNumber(dashboardData.activeClients * 50),
                    change: '+8.3%',
                    trend: 'up',
                    icon: '👥'
                  },
                  {
                    title: 'Conversion',
                    value: `${dashboardData.conversionRate}%`,
                    change: '-1.8%',
                    trend: 'down',
                    icon: '📈'
                  },
                  {
                    title: 'Session',
                    value: '4m 32s',
                    change: '+10.3%',
                    trend: 'up',
                    icon: '⏱️'
                  }
                ].map((metric, index) => (
                  <div key={index} className="metric-card" style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100px',
                      height: '100px',
                      background: `linear-gradient(135deg, ${
                        index === 0 ? 'rgba(99, 102, 241, 0.1)' :
                        index === 1 ? 'rgba(16, 185, 129, 0.1)' :
                        index === 2 ? 'rgba(245, 158, 11, 0.1)' :
                        'rgba(139, 92, 246, 0.1)'
                      }, transparent)`,
                      borderRadius: '50%',
                      transform: 'translate(30px, -30px)'
                    }}></div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <p style={{
                          color: '#64748b',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          margin: 0
                        }}>
                          {metric.title}
                        </p>
                        <h3 style={{
                          color: '#e2e8f0',
                          fontSize: '1.8rem',
                          fontWeight: '700',
                          margin: '0.5rem 0 0 0',
                          letterSpacing: '-0.02em'
                        }}>
                          {metric.value}
                        </h3>
                      </div>
                      <span style={{ fontSize: '1.5rem' }}>{metric.icon}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`stat-trend-${metric.trend}`} style={{
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {metric.trend === 'up' ? '↗' : '↘'} {metric.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Transacciones recientes */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                padding: '2rem'
              }}>
                <h2 style={{
                  color: '#e2e8f0',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem'
                }}>
                  Transacciones Recientes
                </h2>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {dashboardData.recentPayments && dashboardData.recentPayments.length > 0 ? (
                    dashboardData.recentPayments.map((payment, index) => (
                      <div key={payment.id || index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem 0',
                        borderBottom: index < dashboardData.recentPayments.length - 1 ? '1px solid rgba(99, 102, 241, 0.1)' : 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem'
                          }}>
                            💳
                          </div>
                          <div>
                            <p style={{
                              margin: 0,
                              color: '#e2e8f0',
                              fontSize: '1rem',
                              fontWeight: '500'
                            }}>
                              {payment.client}
                            </p>
                            <p style={{
                              margin: '0.2rem 0 0 0',
                              color: '#64748b',
                              fontSize: '0.8rem'
                            }}>
                              {payment.plan} • {payment.date}
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{
                            margin: 0,
                            color: '#e2e8f0',
                            fontSize: '1rem',
                            fontWeight: '600'
                          }}>
                            {formatCurrency(payment.amount)}
                          </p>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            backgroundColor: payment.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: payment.status === 'approved' ? '#10b981' : '#f59e0b',
                            fontWeight: '500'
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
                      color: '#64748b'
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
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(99, 102, 241, 0.1)'
            }}>
              <p style={{ fontSize: '4rem', margin: '0 0 1rem 0' }}>📊</p>
              <h2 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>Dashboard Sin Datos</h2>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                Haz clic en "Actualizar" para cargar las métricas
              </p>
              <button 
                onClick={fetchDashboardData}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)'
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
