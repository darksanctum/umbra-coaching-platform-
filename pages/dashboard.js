<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Umbra Training</title>
    <style>
        :root {
            --color-void: #000000;
            --color-surface: #111111;
            --color-accent: #1a1a1a;
            --color-ember: #CF2323;
            --color-soul: #E5E7EB;
            --color-smoke: #A1A1AA;
            --color-success: #10B981;
            --color-warning: #F59E0B;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            background: linear-gradient(135deg, var(--color-void) 0%, var(--color-surface) 100%);
            color: var(--color-soul);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            min-height: 100vh;
        }

        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }

        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(207, 35, 35, 0.2);
        }

        .dashboard-title {
            font-size: 2rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--color-soul), var(--color-ember));
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .last-update {
            color: var(--color-smoke);
            font-size: 0.9rem;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }

        .metric-card {
            background: var(--color-accent);
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid rgba(207, 35, 35, 0.1);
            position: relative;
            overflow: hidden;
        }

        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--color-ember), var(--color-success));
        }

        .metric-label {
            color: var(--color-smoke);
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .metric-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--color-soul);
            margin-bottom: 0.5rem;
        }

        .metric-change {
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .metric-change.positive { color: var(--color-success); }
        .metric-change.negative { color: var(--color-ember); }

        .dashboard-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .chart-section {
            background: var(--color-accent);
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid rgba(207, 35, 35, 0.1);
        }

        .section-title {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--color-soul);
        }

        .chart-placeholder {
            height: 300px;
            background: var(--color-surface);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-smoke);
            border: 2px dashed rgba(207, 35, 35, 0.3);
        }

        .clients-list {
            background: var(--color-accent);
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid rgba(207, 35, 35, 0.1);
        }

        .client-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .client-item:last-child {
            border-bottom: none;
        }

        .client-info h4 {
            color: var(--color-soul);
            font-size: 0.95rem;
            margin-bottom: 0.25rem;
        }

        .client-info p {
            color: var(--color-smoke);
            font-size: 0.85rem;
        }

        .client-status {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
        }

        .status-active { background: rgba(16, 185, 129, 0.2); color: var(--color-success); }
        .status-pending { background: rgba(245, 158, 11, 0.2); color: var(--color-warning); }
        .status-expired { background: rgba(207, 35, 35, 0.2); color: var(--color-ember); }

        .bottom-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }

        .recent-payments {
            background: var(--color-accent);
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid rgba(207, 35, 35, 0.1);
        }

        .payment-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .payment-item:last-child {
            border-bottom: none;
        }

        .payment-amount {
            color: var(--color-success);
            font-weight: 600;
        }

        .payment-date {
            color: var(--color-smoke);
            font-size: 0.85rem;
        }

        .alerts-section {
            background: var(--color-accent);
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid rgba(207, 35, 35, 0.1);
        }

        .alert-item {
            background: rgba(245, 158, 11, 0.1);
            border-left: 3px solid var(--color-warning);
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 0 8px 8px 0;
        }

        .alert-item:last-child {
            margin-bottom: 0;
        }

        .alert-item.critical {
            background: rgba(207, 35, 35, 0.1);
            border-left-color: var(--color-ember);
        }

        @media (max-width: 768px) {
            .dashboard-container {
                padding: 1rem;
            }

            .dashboard-header {
                flex-direction: column;
                gap: 1rem;
                text-align: center;
            }

            .dashboard-content {
                grid-template-columns: 1fr;
            }

            .metrics-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .metric-value {
                font-size: 2rem;
            }
        }

        @media (max-width: 480px) {
            .metrics-grid {
                grid-template-columns: 1fr;
            }

            .bottom-section {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <div class="dashboard-header">
            <h1 class="dashboard-title">Dashboard Umbra Training</h1>
            <div class="last-update">Última actualización: Hoy 19:45</div>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Ingresos del Mes</div>
                <div class="metric-value">$47,850</div>
                <div class="metric-change positive">↗ +23% vs mes anterior</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Clientes Activos</div>
                <div class="metric-value">89</div>
                <div class="metric-change positive">↗ +12 este mes</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Tasa de Conversión</div>
                <div class="metric-value">8.4%</div>
                <div class="metric-change positive">↗ +1.2% esta semana</div>
            </div>

            <div class="metric-card">
                <div class="metric-label">Renovaciones</div>
                <div class="metric-value">92%</div>
                <div class="metric-change positive">↗ +5% vs mes anterior</div>
            </div>
        </div>

        <div class="dashboard-content">
            <div class="chart-section">
                <h3 class="section-title">Ingresos por Día (Últimos 30 días)</h3>
                <div class="chart-placeholder">
                    📈 Gráfico de ingresos - Integrar con Chart.js
                </div>
            </div>

            <div class="clients-list">
                <h3 class="section-title">Clientes Recientes</h3>
                <div class="client-item">
                    <div class="client-info">
                        <h4>María González</h4>
                        <p>Transformación Acelerada • $2,999</p>
                    </div>
                    <span class="client-status status-active">Activo</span>
                </div>
                <div class="client-item">
                    <div class="client-info">
                        <h4>Carlos Mendoza</h4>
                        <p>Coaching Mensual • $1,199</p>
                    </div>
                    <span class="client-status status-pending">Pendiente</span>
                </div>
                <div class="client-item">
                    <div class="client-info">
                        <h4>Ana Rodríguez</h4>
                        <p>Metamorfosis Completa • $4,299</p>
                    </div>
                    <span class="client-status status-active">Activo</span>
                </div>
                <div class="client-item">
                    <div class="client-info">
                        <h4>Luis Fernando</h4>
                        <p>Coaching Mensual • $1,199</p>
                    </div>
                    <span class="client-status status-expired">Vencido</span>
                </div>
            </div>
        </div>

        <div class="bottom-section">
            <div class="recent-payments">
                <h3 class="section-title">Pagos Recientes</h3>
                <div class="payment-item">
                    <div>
                        <strong>María González</strong><br>
                        <span class="payment-date">Hace 2 horas</span>
                    </div>
                    <div class="payment-amount">+$2,999</div>
                </div>
                <div class="payment-item">
                    <div>
                        <strong>Pedro Jiménez</strong><br>
                        <span class="payment-date">Hace 5 horas</span>
                    </div>
                    <div class="payment-amount">+$1,199</div>
                </div>
                <div class="payment-item">
                    <div>
                        <strong>Sofia Castro</strong><br>
                        <span class="payment-date">Ayer</span>
                    </div>
                    <div class="payment-amount">+$4,299</div>
                </div>
                <div class="payment-item">
                    <div>
                        <strong>Roberto Valle</strong><br>
                        <span class="payment-date">Ayer</span>
                    </div>
                    <div class="payment-amount">+$1,199</div>
                </div>
            </div>

            <div class="alerts-section">
                <h3 class="section-title">Alertas y Notificaciones</h3>
                <div class="alert-item critical">
                    <strong>5 clientes vencen en 3 días</strong><br>
                    Enviar recordatorios de renovación
                </div>
                <div class="alert-item">
                    <strong>12 formularios pendientes</strong><br>
                    Seguimiento necesario para onboarding
                </div>
                <div class="alert-item">
                    <strong>Meta mensual: 85% alcanzada</strong><br>
                    $42,750 / $50,000 objetivo
                </div>
            </div>
        </div>
    </div>

    <script>
        // Simulación de datos en tiempo real
        function updateMetrics() {
            // Aquí conectarías con tu API o base de datos
            console.log('Actualizando métricas...');
        }

        // Actualizar cada 5 minutos
        setInterval(updateMetrics, 300000);

        // Mostrar última actualización
        document.querySelector('.last-update').textContent = 
            `Última actualización: ${new Date().toLocaleString('es-MX')}`;
    </script>
</body>
</html>
