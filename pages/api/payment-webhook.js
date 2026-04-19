import { MercadoPagoConfig, Payment } from 'mercadopago';
import crypto from 'crypto';

const APP_BASE_URL = process.env.APP_BASE_URL || 'https://umbratraining.com';
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || '';

function normalizeHeaderValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function extractPaymentId(req) {
  return req.query?.['data.id'] || req.body?.data?.id || null;
}

function isMercadoPagoSignatureValid(req) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  const xSignature = normalizeHeaderValue(req.headers['x-signature']);
  const xRequestId = normalizeHeaderValue(req.headers['x-request-id']);
  const paymentId = extractPaymentId(req);

  if (!xSignature || !xRequestId || !paymentId) {
    return false;
  }

  const parts = String(xSignature).split(',');
  let ts = '';
  let v1 = '';

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 'ts') ts = value;
    if (key === 'v1') v1 = value;
  }

  if (!ts || !v1) {
    return false;
  }

  const manifest = crypto
    .createHmac('sha256', secret)
    .update(`id:${paymentId};request-id:${xRequestId};ts:${ts};`)
    .digest('hex');

  const expected = Buffer.from(v1);
  const actual = Buffer.from(manifest);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export default async function handler(req, res) {
  // Solo acepta POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const paymentId = extractPaymentId(req);

    if (!isMercadoPagoSignatureValid(req)) {
      return res.status(401).json({ error: 'Invalid Mercado Pago signature' });
    }

    const { type } = req.body;

    // Verificar que es una notificación de pago
    if (type !== 'payment') {
      return res.status(200).json({ received: true });
    }

    if (!paymentId) {
      console.error('No se recibió payment ID');
      return res.status(400).json({ error: 'Payment ID missing' });
    }

    // Si es una simulación, responder OK sin procesar solo fuera de prod
    if (process.env.NODE_ENV !== 'production' && (paymentId === '123456' || paymentId === 123456 || String(paymentId) === '123456')) {
      return res.status(200).json({
        received: true,
        simulation: true,
        payment_id: paymentId,
        message: 'Simulación procesada correctamente'
      });
    }

    // Solo para pagos reales, verificar credenciales
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('MP_ACCESS_TOKEN no configurado');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    // Obtener detalles completos del pago
    const paymentData = await payment.get({ id: paymentId });

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
    res.status(500).json({ error: 'Internal server error', payment_id: req.body?.data?.id });
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
    fecha: new Date().toISOString(),
    appBaseUrl: APP_BASE_URL,
  };

  try {
    // Notificar por Telegram (si tienes bot configurado)
    await enviarNotificacionTelegram(clienteData);

    if (MAKE_WEBHOOK_URL) {
      console.log('📤 Enviando datos a Make para automatización...');

      const makeResponse = await fetch(MAKE_WEBHOOK_URL, {
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
    } else {
      console.log('ℹ️ MAKE_WEBHOOK_URL no configurado, saltando automatización externa');
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
