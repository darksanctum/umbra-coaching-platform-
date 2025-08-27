import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Verificar que el access token esté configurado
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('MP_ACCESS_TOKEN no está configurado');
      return res.status(500).json({ 
        error: 'Error de configuración: Access Token de Mercado Pago no encontrado' 
      });
    }

    console.log('Inicializando Mercado Pago con token:', accessToken.substring(0, 10) + '...');
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    // Validar datos requeridos
    const requiredFields = ['transaction_amount', 'token', 'description', 'installments', 'payment_method_id', 'payer'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Campos faltantes: ${missingFields.join(', ')}` 
      });
    }

    const paymentData = {
      transaction_amount: parseFloat(req.body.transaction_amount),
      token: req.body.token,
      description: req.body.description,
      installments: parseInt(req.body.installments),
      payment_method_id: req.body.payment_method_id,
      issuer_id: req.body.issuer_id,
      payer: {
        email: req.body.payer.email,
        identification: {
          type: req.body.payer.identification.type,
          number: req.body.payer.identification.number,
        },
      },
      // Cambiar a tu URL real de webhook
      notification_url: `${process.env.VERCEL_URL || 'https://umbra-coaching-platform-fo04qqgba-carlos-projects-12ab8d68.vercel.app'}/api/payment-webhook`,
    };

    console.log('Datos del pago:', {
      ...paymentData,
      token: paymentData.token.substring(0, 10) + '...',
    });

    const result = await payment.create({ body: paymentData });

    console.log('Pago creado exitosamente:', {
      id: result.id,
      status: result.status,
      detail: result.status_detail,
    });

    res.status(201).json({
      id: result.id,
      status: result.status,
      detail: result.status_detail,
      amount: result.transaction_amount,
      currency: result.currency_id,
    });

  } catch (error) {
    console.error("Error detallado al crear el pago:", {
      message: error.message,
      cause: error.cause,
      status: error.status,
      response: error.cause?.[0]?.description || error.cause?.message,
    });

    // Manejar errores específicos de Mercado Pago
    let errorMessage = 'Error interno del servidor';
    let statusCode = 500;

    if (error.cause && Array.isArray(error.cause)) {
      const mpError = error.cause[0];
      errorMessage = mpError.description || mpError.message || errorMessage;
      
      // Errores comunes de Mercado Pago
      if (mpError.code === 'invalid_parameter') {
        statusCode = 400;
      } else if (mpError.code === 'unauthorized') {
        statusCode = 401;
        errorMessage = 'Credenciales inválidas de Mercado Pago';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.cause : undefined
    });
  }
}
