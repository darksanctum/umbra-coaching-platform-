import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(req, res) {
  console.log('=== INICIO DE REQUEST ===');
  console.log('Method:', req.method);
  console.log('Body recibido:', req.body);
  
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
    const requiredFields = ['transaction_amount', 'token', 'description', 'payment_method_id'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.error('Campos faltantes:', missingFields, 'Datos recibidos:', req.body);
      return res.status(400).json({ 
        error: `Campos faltantes: ${missingFields.join(', ')}` 
      });
    }

    // Validar estructura del payer
    if (!req.body.payer || !req.body.payer.email) {
      console.error('Datos del payer incompletos:', req.body.payer);
      return res.status(400).json({ 
        error: 'Datos del pagador incompletos' 
      });
    }

    const paymentData = {
      transaction_amount: parseFloat(req.body.transaction_amount),
      token: req.body.token,
      description: req.body.description,
      installments: parseInt(req.body.installments) || 1,
      payment_method_id: req.body.payment_method_id,
      issuer_id: req.body.issuer_id,
      payer: {
        email: req.body.payer.email,
        identification: {
          type: req.body.payer.identification?.type || 'CURP',
          number: req.body.payer.identification?.number || '12345678901234567890',
        },
      },
      // URL de webhook
      notification_url: `https://umbratraining.com/api/payment-webhook`,
      // URLs de redirección después del pago
      back_urls: {
        success: "https://umbratraining.com/gracias.html",
        failure: "https://umbratraining.com/pago-fallido.html",
        pending: "https://umbratraining.com/pago-pendiente.html"
      },
      auto_return: "approved"
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
    console.error("=== ERROR COMPLETO ===");
    console.error("Error message:", error.message);
    console.error("Error cause:", error.cause);
    console.error("Error stack:", error.stack);
    console.error("Error object:", JSON.stringify(error, null, 2));

    // Manejar errores específicos de Mercado Pago
    let errorMessage = 'Error interno del servidor';
    let statusCode = 500;

    if (error.cause && Array.isArray(error.cause)) {
      const mpError = error.cause[0];
      console.error("MP Error details:", mpError);
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

    console.error("=== ENVIANDO RESPUESTA DE ERROR ===");
    console.error("Status:", statusCode);
    console.error("Message:", errorMessage);

    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.cause : undefined
    });
  }
}
