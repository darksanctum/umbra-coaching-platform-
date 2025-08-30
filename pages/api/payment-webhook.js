import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(req, res) {
  // Solo acepta POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== WEBHOOK RECIBIDO ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    const { type, data, action } = req.body;

    // Verificar que es una notificación de pago
    if (type !== 'payment') {
      console.log('Tipo de notificación ignorado:', type);
      return res.status(200).json({ received: true });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      console.error('No se recibió payment ID');
      return res.status(400).json({ error: 'Payment ID missing' });
    }

    console.log('Payment ID recibido:', paymentId, 'Tipo:', typeof paymentId);

    // Si es una simulación, responder OK sin procesar
    if (paymentId === "123456" || paymentId === 123456 || String(paymentId) === "123456") {
      console.log('🧪 Simulación detectada - respondiendo OK');
      return res.status(200).json({ 
        received: true, 
        simulation: true,
        payment_id: paymentId,
        message: "Simulación procesada correctamente"
      });
    }

    // Solo para pagos reales, verificar credenciales
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('MP_ACCESS_TOKEN no configurado');
      return res.status(200).json({ 
        received: true,
        error: 'Server configuration error',
        payment_id: paymentId 
      });
    }

    console.log('Procesando pago real con ID:', paymentId);
    
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    // Obtener detalles completos del pago
    const paymentData = await payment.get({ id: paymentId });
    
    console.log('=== DATOS DEL PAGO ===');
    console.log('ID:', paymentData.id);
    console.log('Status:', paymentData.status);
    console.log('Amount:', paymentData.transaction_amount);
    console.log('Description:', paymentData.description);
    console.log('Payer Email:', paymentData.payer?.email);

    // Procesar según el estado del pago
    switch (paymentData.status) {
      case 'approved':
        await procesarPagoAprobado(paymentData);
        break;
      case 'rejected':
        await procesarPagoRechazado(paymentData);
        break;
      case 'pending':
        await procesarPagoPendiente(paymentData);
        break;
      default:
        console.log('Estado de pago no manejado:', paymentData.status);
    }

    // Responder OK a Mercado Pago
    res.status(200).json({ 
      received: true, 
      payment_id: paymentId,
      status: paymentData.status 
    });

  } catch (error) {
    console.error('=== ERROR EN WEBHOOK ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    // SIEMPRE responder OK para evitar reintentos infinitos
    console.log('Respondiendo OK para evitar reintentos');
    res.status(200).json({ 
      received: true, 
      error: 'Internal server error handled',
      message: error.message,
      payment_id: req.body?.data?.id 
    });
  }
}

// Función para procesar pagos aprobados
async function procesarPagoAprobado(payment) {
  console.log('🎉 PAGO APROBADO - Iniciando flujo de automatización');
  
  const clienteData = {
    email: payment.payer?.email,
    plan: payment.description,
    monto: payment.transaction_amount,
    paymentId: payment.id,
    fecha: new Date().toISOString()
  };

  try {
    // Notificar por Telegram (si tienes bot configurado)
    await enviarNotificacionTelegram(clienteData);
    
    // INTEGRACIÓN CON MAKE - Enviar datos para automatización completa
    const makeWebhookUrl = "https://hook.us2.make.com/ui9ogao6usp81vgc9x1yewzfhc4y8uq5";
    
    console.log('📤 Enviando datos a Make para automatización...');
    
    const makeResponse = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'nuevo_pago',
        plan: payment.description,
        email: payment.payer?.email,
        monto: payment.transaction_amount,
        payment_id: payment.id,
        fecha_pago: new Date().toISOString()
      })
    });
    
    if (makeResponse.ok) {
      console.log('✅ Datos enviados a Make exitosamente');
    } else {
      console.error('❌ Error enviando a Make:', await makeResponse.text());
    }
    
    console.log('✅ Flujo de automatización completado');
  } catch (error) {
    console.error('❌ Error en automatización:', error);
  }
}

// Función para procesar pagos rechazados
async function procesarPagoRechazado(payment) {
  console.log('❌ PAGO RECHAZADO - Notificar para seguimiento');
}

// Función para procesar pagos pendientes
async function procesarPagoPendiente(payment) {
  console.log('⏳ PAGO PENDIENTE - En espera de confirmación');
}

// Función básica para notificación Telegram
async function enviarNotificacionTelegram(clienteData) {
  console.log('📱 Enviando notificación por Telegram');
  
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!telegramBotToken || !telegramChatId) {
    console.log('Telegram no configurado - saltando notificación');
    return;
  }

  const mensaje = `🎉 *NUEVO PAGO APROBADO*
  
📋 Plan: ${clienteData.plan}
💰 Monto: $${clienteData.monto} MXN
📧 Cliente: ${clienteData.email}
🆔 Payment ID: ${clienteData.paymentId}
📅 Fecha: ${new Date(clienteData.fecha).toLocaleString('es-MX')}

🚀 Iniciar proceso de onboarding`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: mensaje,
        parse_mode: 'Markdown'
      })
    });
    
    if (response.ok) {
      console.log('✅ Notificación Telegram enviada');
    } else {
      console.error('❌ Error enviando Telegram:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error en Telegram:', error);
  }
}
