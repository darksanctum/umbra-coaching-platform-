import React, { useEffect, useState } from 'react';

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [cardForm, setCardForm] = useState(null);

  const handlePayment = async (cardFormData) => {
    setIsLoading(true);
    const { token, issuerId, paymentMethodId, amount, installments, identificationNumber, identificationType } = cardFormData;
    const testEmail = "test_user_123456@testuser.com";

    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          issuer_id: issuerId,
          payment_method_id: paymentMethodId,
          transaction_amount: Number(amount),
          installments: Number(installments),
          description: plan.title,
          payer: {
            email: testEmail,
            identification: { type: identificationType, number: identificationNumber },
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error desconocido');
      }

      alert('¡Pago exitoso!');
      onClose();

    } catch (error) {
      alert(`Error en el pago: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!plan) return;

    let mp;
    let form;

    const loadAndInit = async () => {
      if (!window.MercadoPago) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://sdk.mercadopago.com/js/v2";
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }
      
      mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
      form = mp.cardForm({
        amount: String(plan.price),
        autoMount: true,
        form: {
          id: "form-checkout",
          cardholderName: { id: "form-cardholderName", placeholder: "Titular" },
          cardholderEmail: { id: "form-cardholderEmail", placeholder: "Email" },
          cardNumber: { id: "form-cardNumber", placeholder: "Número de tarjeta" },
          cardExpirationDate: { id: "form-cardExpirationDate", placeholder: "MM/YY" },
          securityCode: { id: "form-securityCode", placeholder: "CVC" },
          installments: { id: "form-installments", placeholder: "Cuotas" },
          identificationType: { id: "form-identificationType", placeholder: "Tipo de Doc." },
          identificationNumber: { id: "form-identificationNumber", placeholder: "Número de Doc." },
          issuer: { id: "form-issuer", placeholder: "Banco" },
        },
        callbacks: {
          onFormMounted: error => {
            if (error) return console.warn("Form Mounted error: ", error);
            setIsLoading(false);
          },
          onSubmit: event => {
            event.preventDefault();
            const cardFormData = form.getCardFormData();
            handlePayment(cardFormData);
          },
        },
      });
      setCardForm(form);
    };

    loadAndInit();

    return () => {
      if (form) {
        form.unmount();
      }
    };
  }, [plan]);

  if (!plan) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Completa tu pago</h2>
        <h3>{plan.title}</h3>
        <p>${plan.price} MXN</p>
        
        {isLoading && <p>Cargando formulario...</p>}
        <form id="form-checkout" style={{ display: isLoading ? 'none' : 'block' }}>
            <div id="form-cardholderName"></div>
            <div id="form-cardholderEmail"></div>
            <div id="form-cardNumber"></div>
            <div id="form-cardExpirationDate"></div>
            <div id="form-securityCode"></div>
            <div id="form-installments"></div>
            <div id="form-identificationType"></div>
            <div id="form-identificationNumber"></div>
            <div id="form-issuer"></div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Procesando...' : 'Pagar'}
            </button>
        </form>
      </div>
      {/* ... estilos ... */}
    </div>
  );
};

export default PaymentModal;
