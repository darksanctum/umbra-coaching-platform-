import React, { useState, useEffect } from 'react';
import Head from 'next/head';

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('umbra_auth_token');
    if (token === 'authenticated_umbra_2025') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Contraseña segura - puedes cambiarla
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
            <p style={{
              color: '#A1A1AA',
              marginBottom: '2rem'
            }}>
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
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 20px rgba(207, 35, 35, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      
      <div style={{
        background: '#000',
        minHeight: '100vh',
        color: '#E5E7EB',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Fondo animado */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '200%',
          height: '200%',
          background: `
            radial-gradient(circle at 20% 80%, rgba(207, 35, 35, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)
          `,
          animation: 'backgroundShift 20s ease-in-out infinite',
          zIndex: -1
        }} />

        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2rem',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(207, 35, 35, 0.2)',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden'
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
                fontSize: '1rem',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '50px'
              }}>
                Sistema Online
              </div>
              
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(207, 35, 35, 0.2)',
                  border: '1px solid #CF2323',
                  color: '#CF2323',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#CF2323';
                  e.target.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(207, 35, 35, 0.2)';
                  e.target.style.color = '#CF2323';
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Métricas principales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            <MetricCard 
              label="Ingresos del Mes"
              value="$47,850"
              change="+23% vs mes anterior"
              positive={true}
            />
            <MetricCard 
              label="Clientes Activos"
              value="89"
              change="+12 este mes"
              positive={true}
            />
            <MetricCard 
              label="Tasa de Conversión"
              value="8.4%"
              change="+1.2% esta semana"
              positive={true}
            />
            <MetricCard 
              label="Renovaciones"
              value="92%"
              change="+5% vs mes anterior"
              positive={true}
            />
          </div>

          {/* Contenido principal */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'window.innerWidth > 768 ? "2fr 1fr" : "1fr"',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            <ChartSection />
            <ClientsList />
          </div>

          {/* Sección inferior */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            <RecentPayments />
            <AlertsSection />
          </div>
        </div>

        <style jsx>{`
          @keyframes backgroundShift {
            0%, 100% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(-20px) translateY(-20px); }
            50% { transform: translateX(20px) translateY(10px); }
            75% { transform: translateX(-10px) translateY(20px); }
          }
        `}</style>
      </div>
    </>
  );
};

// Componente de tarjeta de métrica
const MetricCard = ({ label, value, change, positive }) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
      backdropFilter: 'blur(20px)',
      padding: '2rem',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
      e.currentTarget.style.borderColor = 'rgba(207, 35, 35, 0.5)';
      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(207, 35, 35, 0.2)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(135deg, #CF2323 0%, #8B5CF6 50%, #06B6D4 100%)',
        animation: 'slideGlow 3s ease-in-out infinite'
      }} />
      
      <div style={{
        color: '#A1A1AA',
        fontSize: '0.95rem',
        marginBottom: '1rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: '600'
      }}>
        {label}
      </div>
      
      <div style={{
        fontSize: '3rem',
        fontWeight: '900',
        background: 'linear-gradient(135deg, #CF2323 0%, #8B5CF6 50%, #06B6D4 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '1rem',
        lineHeight: 1
      }}>
        {value}
      </div>
      
      <div style={{
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: '600',
        color: positive ? '#10B981' : '#CF2323'
      }}>
        <span style={{ fontSize: '1.2rem' }}>
          {positive ? '↗' : '↘'}
        </span>
        {change}
      </div>
    </div>
  );
};

// Componente de sección de gráficos
const ChartSection = () => (
  <div style={{
    background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
    backdropFilter: 'blur(20px)',
    padding: '2rem',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }}>
    <h3 style={{
      fontSize: '1.4rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}>
      Flujo de Ingresos Neural
    </h3>
    <div style={{
      height: '350px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px dashed rgba(207, 35, 35, 0.3)',
      fontSize: '1.2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div>📊 Gráfico de ingresos en tiempo real</div>
    </div>
  </div>
);

// Componente de lista de clientes
const ClientsList = () => (
  <div style={{
    background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
    backdropFilter: 'blur(20px)',
    padding: '2rem',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }}>
    <h3 style={{
      fontSize: '1.4rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}>
      Clientes Activos
    </h3>
    
    {[
      { name: 'María González', plan: 'Transformación Acelerada', amount: 2999, status: 'active' },
      { name: 'Carlos Mendoza', plan: 'Coaching Mensual', amount: 1199, status: 'pending' },
      { name: 'Ana Rodríguez', plan: 'Metamorfosis Completa', amount: 4299, status: 'active' },
      { name: 'Luis Fernando', plan: 'Coaching Mensual', amount: 1199, status: 'expired' }
    ].map((client, index) => (
      <ClientItem key={index} client={client} />
    ))}
  </div>
);

// Componente de item de cliente
const ClientItem = ({ client }) => {
  const getStatusStyle = (status) => {
    const styles = {
      active: { bg: 'rgba(16, 185, 129, 0.2)', color: '#10B981', glow: 'rgba(16, 185, 129, 0.3)' },
      pending: { bg: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.3)' },
      expired: { bg: 'rgba(207, 35, 35, 0.2)', color: '#CF2323', glow: 'rgba(207, 35, 35, 0.3)' }
    };
    return styles[status];
  };

  const statusStyle = getStatusStyle(client.status);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.paddingLeft = '1rem';
      e.currentTarget.style.background = 'rgba(207, 35, 35, 0.05)';
      e.currentTarget.style.borderRadius = '10px';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.paddingLeft = '0';
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.borderRadius = '0';
    }}>
      <div>
        <h4 style={{
          color: '#E5E7EB',
          fontSize: '1.1rem',
          marginBottom: '0.5rem',
          fontWeight: '600'
        }}>
          {client.name}
        </h4>
        <p style={{
          color: '#A1A1AA',
          fontSize: '0.9rem'
        }}>
          {client.plan} • ${client.amount.toLocaleString()}
        </p>
      </div>
      
      <span style={{
        padding: '0.5rem 1rem',
        borderRadius: '25px',
        fontSize: '0.8rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        background: statusStyle.bg,
        color: statusStyle.color,
        boxShadow: `0 0 20px ${statusStyle.glow}`
      }}>
        {client.status === 'active' ? 'Activo' : 
         client.status === 'pending' ? 'Pendiente' : 'Vencido'}
      </span>
    </div>
  );
};

// Componente de pagos recientes
const RecentPayments = () => (
  <div style={{
    background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
    backdropFilter: 'blur(20px)',
    padding: '2rem',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }}>
    <h3 style={{
      fontSize: '1.4rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}>
      Transacciones Recientes
    </h3>
    
    {[
      { name: 'María González', amount: 2999, time: 'Hace 2 horas' },
      { name: 'Pedro Jiménez', amount: 1199, time: 'Hace 5 horas' },
      { name: 'Sofia Castro', amount: 4299, time: 'Ayer' },
      { name: 'Roberto Valle', amount: 1199, time: 'Ayer' }
    ].map((payment, index) => (
      <div key={index} style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.paddingLeft = '1rem';
        e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
        e.currentTarget.style.borderRadius = '10px';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.paddingLeft = '0';
        e.currentTarget.style.background = 'transparent';
      }}>
        <div>
          <strong style={{ color: '#E5E7EB' }}>{payment.name}</strong><br />
          <span style={{ color: '#A1A1AA', fontSize: '0.9rem' }}>
            {payment.time}
          </span>
        </div>
        <div style={{
          color: '#10B981',
          fontWeight: '700',
          fontSize: '1.2rem'
        }}>
          +${payment.amount.toLocaleString()}
        </div>
      </div>
    ))}
  </div>
);

// Componente de alertas
const AlertsSection = () => (
  <div style={{
    background: 'linear-gradient(135deg, rgba(17, 17, 17, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
    backdropFilter: 'blur(20px)',
    padding: '2rem',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }}>
    <h3 style={{
      fontSize: '1.4rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    }}>
      Centro de Alertas
    </h3>
    
    <AlertItem 
      type="critical"
      title="CRÍTICO: 5 clientes vencen en 3 días"
      description="Activar protocolo de renovación automática"
    />
    <AlertItem 
      type="warning"
      title="SEGUIMIENTO: 12 formularios pendientes"
      description="Bot de onboarding requiere intervención"
    />
    <AlertItem 
      type="info"
      title="META: 85% objetivo mensual alcanzado"
      description="$42,750 / $50,000 - Acelerar conversiones"
    />
  </div>
);

// Componente de alerta individual
const AlertItem = ({ type, title, description }) => {
  const getAlertStyle = (type) => {
    const styles = {
      critical: { bg: 'rgba(207, 35, 35, 0.1)', border: '#CF2323', glow: 'rgba(207, 35, 35, 0.3)' },
      warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B', glow: '