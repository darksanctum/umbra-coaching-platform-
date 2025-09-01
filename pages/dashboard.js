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

  // Función para cargar datos del dashboard
  const fetchDashboardData = async () => {
    setDataLoading(true);
    setDataError(null);
    
    try {
      const response = await fetch('/api/dashboard-metrics', {
        headers: {
          'Authorization': 'Bearer umbra_dashboard_2025'
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar datos del dashboard');
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDataError(error.message);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('umbra_auth_token');
    if (token === 'authenticated_umbra_2025') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Cargar datos cuando se autentica
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      
      // Actualizar datos cada 5 minutos
      const interval = setInterval(fetchDashboardData, 300000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'UmbraCommand2025!') {
      localStorage.setItem('umbra_auth_token', 'authenticated_umbra_2025');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Contraseña incorrecta');
      setTimeout(() => setLoginError(''), 3000);
    }
    setPassword('');
  };

  const handleLogout = () => {
    localStorage.removeItem('umbra_auth_token');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div style={{
        background: '#000',
        color: '#fff',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem'
      }}>
        Cargando Dashboard...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Acceso Dashboard - Umbra Training</title>
        </Head>
        <div style={{
          background: 'linear-gradient(135deg, #000000 0%, #111111 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'rgba(17, 17, 17, 0.9)',
            backdropFilter: 'blur(20px)',
            padding: '3rem',
            borderRadius: '20px',
            border: '1px solid rgba(207, 35, 35, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h1 style={{
              fontSize: '2rem',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #CF2323, #8B5CF6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              Umbra Command
            </h1>
            <p style={{ color: '#A1A1AA', marginBottom: '2rem' }}>
              Acceso restringido - Solo personal autorizado
            </p>
            
            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña de acceso"
                style={{
                  width: '100%',
                  padding: '1rem',
                  marginBottom: '1rem',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(207, 35, 35, 0.3)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              
              {loginError && (
                <div style={{
                  color: '#CF2323',
                  marginBottom: '1rem',
                  fontSize: '0.9rem'
                }}>
                  {loginError}
                </div>
              )}
              
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #CF2323, #8B0000)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Acceder al Dashboard
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Umbra Training</title>
      </Head>
      
      <div style={{
        background: '#000',
        minHeight: '100vh',
        color: '#E5E7EB',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2rem'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem',
            padding: '2rem',
            background: 'rgba(17, 17, 17, 0.8)',
            borderRadius: '20px',
            border: '1px solid rgba(207, 35, 35, 0.2)'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #CF2323 0%, #8B5CF6 50%, #06B6D4 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              Umbra Command Center
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                color: '#06B6D4',
                fontSize: '0.9rem',
                padding: '0.5rem 1rem',
                background: 'rgba(6, 182, 212, 0.1)',
                borderRadius: '20px'
              }}>
                {dashboardData ? 
                  `Actualizado: ${new Date(dashboardData.lastUpdated).toLocaleTimeString('es-MX')}` :
                  'Cargando...'
                }
              </div>
              
              <button
                onClick={fetchDashboardData}
                disabled={dataLoading}
                style={{
                  background: dataLoading ? 'rgba(100, 100, 100, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                  border: '1px solid #06B6D4',
                  color: '#06B6D4',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  cursor: dataLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                {dataLoading ? 'Actualizando...' : 'Actualizar'}
              </button>
              
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(207, 35, 35, 0.2)',
                  border: '1px solid #CF2323',
                  color: '#CF2323',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Error de carga */}
          {dataError && (
            <div style={{
              background: 'rgba(207, 35, 35, 0.1)',
              border: '1px solid #CF2323',
              color: '#CF2323',
              padding: '1rem',
              borderRadius: '10px',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              Error al cargar datos: {dataError}
            </div>
          )}

          {/* Métricas principales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            <MetricCard 
              label="INGRESOS DEL MES"
              value={dashboardData ? dashboardData.metrics.revenue.formatted : '$--,---'}
              change={dashboardData ? `+${dashboardData.metrics.revenue.growth}% vs mes anterior` : 'Cargando...'}
              positive={true}
              loading={dataLoading}
            />
            <MetricCard 
              label="CLIENTES ACTIVOS"
              value={dashboardData ? dashboardData.metrics.clients.formatted : '--'}
              change={dashboardData ? `+${dashboardData.metrics.clients.growth} este mes` : 'Cargando...'}
              positive={true}
              loading={dataLoading}
            />
            <MetricCard 
              label="TASA DE CONVERSIÓN"
              value={dashboardData ? dashboardData.metrics.conversion.formatted : '--%'}
              change={dashboardData ? `+${dashboardData.metrics.conversion.growth}% esta semana` : 'Cargando...'}
              positive={true}
              loading={dataLoading}
            />
            <MetricCard 
              label="RENOVACIONES"
              value={dashboardData ? dashboardData.metrics.retention.formatted : '--%'}
              change={dashboardData ? `+${dashboardData.metrics.retention.growth}% vs mes anterior` : 'Cargando...'}
              positive={true}
              loading={dataLoading}
            />
          </div>

          {/* Sección de pagos recientes */}
          <div style={{
            background: 'rgba(17, 17, 17, 0.8)',
            padding: '2rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              textTransform: 'uppercase'
            }}>
              Transacciones Recientes
            </h3>
            
            {dataLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#A1A1AA' }}>
                Cargando transacciones...
              </div>
            ) : dashboardData?.recentPayments ? (
              dashboardData.recentPayments.map((payment, index) => (
                <div key={payment.id} style={{ 
                  borderBottom: index < dashboardData.recentPayments.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none', 
                  padding: '1rem 0' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{payment.clientName}</strong><br />
                      <span style={{ color: '#A1A1AA', fontSize: '0.9rem' }}>
                        {payment.plan} • {payment.timeAgo}
                      </span>
                    </div>
                    <div style={{ color: '#10B981', fontWeight: '700' }}>
                      {payment.formattedAmount}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#A1A1AA' }}>
                No hay transacciones recientes
              </div>
            )}
          </div>

          {/* Alertas */}
          <div style={{
            background: 'rgba(17, 17, 17, 0.8)',
            padding: '2rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              textTransform: 'uppercase'
            }}>
              Centro de Alertas
            </h3>
            
            {dataLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#A1A1AA' }}>
                Cargando alertas...
              </div>
            ) : dashboardData?.alerts ? (
              dashboardData.alerts.map((alert, index) => {
                const getAlertColor = (type) => {
                  switch(type) {
                    case 'critical': return { bg: 'rgba(207, 35, 35, 0.1)', border: '#CF2323' };
                    case 'warning': return { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B' };
                    default: return { bg: 'rgba(6, 182, 212, 0.1)', border: '#06B6D4' };
                  }
                };
                const colors = getAlertColor(alert.type);
                
                return (
                  <div key={index} style={{
                    background: colors.bg,
                    borderLeft: `4px solid ${colors.border}`,
                    padding: '1.5rem',
                    marginBottom: index < dashboardData.alerts.length - 1 ? '1rem' : '0',
                    borderRadius: '0 15px 15px 0'
                  }}>
                    <strong>{alert.title}</strong><br />
                    {alert.description}
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#A1A1AA' }}>
                No hay alertas activas
              </div>
            )}
          </div>CRÍTICO: 5 clientes vencen en 3 días</strong><br />
              Activar protocolo de renovación automática
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              borderLeft: '4px solid #F59E0B',
              padding: '1.5rem',
              marginBottom: '1rem',
              borderRadius: '0 15px 15px 0'
            }}>
              <strong>SEGUIMIENTO: 12 formularios pendientes</strong><br />
              Bot de onboarding requiere intervención
            </div>

            <div style={{
              background: 'rgba(6, 182, 212, 0.1)',
              borderLeft: '4px solid #06B6D4',
              padding: '1.5rem',
              borderRadius: '0 15px 15px 0'
            }}>
              <strong>META: 85% objetivo mensual alcanzado</strong><br />
              $42,750 / $50,000 - Acelerar conversiones
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;