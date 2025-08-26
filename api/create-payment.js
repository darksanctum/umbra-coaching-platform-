import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const payment = new Payment(client);

    const paymentData = {
      transaction_amount: req.body.transaction_amount,
      token: req.body.token,
      description: req.body.description,
      installments: req.body.installments,
      payment_method_id: req.body.payment_method_id,
      issuer_id: req.body.issuer_id,
      payer: {
        email: req.body.payer.email,
        identification: {
          type: req.body.payer.identification.type,
          number: req.body.payer.identification.number,
        },
      },
      notification_url: "https://darktraining-santuario.vercel.app/api/payment-webhook",
    };

    const result = await payment.create({ body: paymentData });

    res.status(201).json({
      id: result.id,
      status: result.status,
      detail: result.status_detail,
    });

  } catch (error) {
    console.error("Error al crear el pago:", error);
    const errorMessage = error.cause?.message || error.message;
    res.status(500).json({ error: errorMessage });
  }
}
