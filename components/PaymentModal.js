import React, { useEffect, useState, useRef } from 'react';

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const cardFormRef = useRef(null); // Usamos una referencia para mantener el objeto cardForm

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
        throw new Error(result.error);
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
    if (plan && window.MercadoPago) {
      const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
      const cardForm = mp.cardForm({
        amount: String(plan.price),
        autoMount: true,
        form: {
          id: "form-checkout",
          // ... (el resto de la configuración del form es igual)
        },
        callbacks: {
          onFormMounted: error => {
            if (error) return console.warn("Form Mounted handling error: ", error);
          },
          onSubmit: event => {
            event.preventDefault();
            const cardFormData = cardFormRef.current.getCardFormData();
            handlePayment(cardFormData);
          },
        },
      });
      cardFormRef.current = cardForm; // Guardamos la instancia en la referencia
    }
  }, [plan]);

  if (!plan) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Completa tu pago</h2>
        <h3>{plan.title}</h3>
        <p>${plan.price} MXN</p>
        
        <form id="form-checkout">
          {/* ... (todos los divs del formulario son iguales) */}
          <button type="submit" id="form-submit-btn" disabled={isLoading}>
            {isLoading ? 'Procesando...' : 'Pagar'}
          </button>
        </form>
      </div>
      {/* ... (los estilos son iguales) */}
    </div>
  );
};

export default PaymentModal;
