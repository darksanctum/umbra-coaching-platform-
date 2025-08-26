import React, { useEffect, useState } from 'react';

const SCRIPT_URL = "https://sdk.mercadopago.com/js/v2";
let cardForm = null; // Mantenemos el cardForm fuera del estado de React

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

useEffect(() => {
  if (window.MercadoPago) {
    setIsScriptLoaded(true);
  }
}, []);

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
      if (!response.ok) throw new Error(result.error);

      alert('¡Pago exitoso!');
      onClose();

    } catch (error) {
      alert(`Error en el pago: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Si el script no está cargado, lo cargamos.
    if (!isScriptLoaded) {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(script);
      return () => { document.body.removeChild(script); };
    }
  }, [isScriptLoaded]);

  useEffect(() => {
    if (isScriptLoaded && plan) {
      // Destruimos cualquier instancia anterior antes de crear una nueva
      if (cardForm) {
        cardForm.unmount();
        cardForm = null;
      }
      
      const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
      cardForm = mp.cardForm({
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
          onSubmit: event => {
            event.preventDefault();
            const cardFormData = cardForm.getCardFormData();
            handlePayment(cardFormData);
          },
          onError: (error) => console.error(error),
        },
      });
      setIsLoading(false);
    }

    // Función de limpieza para cuando el modal se cierra
    return () => {
      if (cardForm) {
        cardForm.unmount();
        cardForm = null;
      }
    };
  }, [plan, isScriptLoaded]);

  if (!plan) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Completa tu pago</h2>
        <h3>{plan.title}</h3>
        <p>${plan.price} MXN</p>
        
        {isLoading ? <p>Cargando...</p> : (
          <form id="form-checkout">
            <div id="form-cardholderName"></div>
            <div id="form-cardholderEmail"></div>
            <div id="form-cardNumber"></div>
            <div id="form-cardExpirationDate"></div>
            <div id="form-securityCode"></div>
            <div id="form-installments"></div>
            <div id="form-identificationType"></div>
            <div id="form-identificationNumber"></div>
            <div id="form-issuer"></div>
            <button type="submit">Pagar</button>
          </form>
        )}
      </div>
      {/* ... estilos ... */}
    </div>
  );
};

export default PaymentModal;
