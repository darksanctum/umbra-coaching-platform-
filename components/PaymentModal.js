import React, { useEffect, useState } from 'react';

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cardForm, setCardForm] = useState(null);

  useEffect(() => {
    if (plan && window.MercadoPago) {
      const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
      const form = mp.cardForm({
        amount: String(plan.price),
        autoMount: true,
        form: {
          id: "form-checkout",
          cardholderName: {
            id: "form-cardholderName",
            placeholder: "Titular de la tarjeta",
          },
          cardholderEmail: {
            id: "form-cardholderEmail",
            placeholder: "E-mail",
          },
          cardNumber: {
            id: "form-cardNumber",
            placeholder: "Número de la tarjeta",
          },
          cardExpirationMonth: {
            id: "form-cardExpirationMonth",
            placeholder: "Mes de vencimiento",
          },
          cardExpirationYear: {
            id: "form-cardExpirationYear",
            placeholder: "Año de vencimiento",
          },
          securityCode: {
            id: "form-securityCode",
            placeholder: "Código de seguridad",
          },
          installments: {
            id: "form-installments",
            placeholder: "Cuotas",
          },
          identificationType: {
            id: "form-identificationType",
            placeholder: "Tipo de documento",
          },
          identificationNumber: {
            id: "form-identificationNumber",
            placeholder: "Número de documento",
          },
          issuer: {
            id: "form-issuer",
            placeholder: "Banco emisor",
          },
        },
        callbacks: {
          onFormMounted: error => {
            if (error) return console.warn("Form Mounted handling error: ", error);
          },
          onSubmit: async (event) => {
            event.preventDefault();
            setIsLoading(true);

            const { 
              paymentMethodId, 
              issuerId, 
              cardholderEmail: email, 
              amount, 
              token, 
              installments,
              identificationNumber,
              identificationType,
            } = cardForm.getCardFormData();

            const testEmail = "test_user_123456@testuser.com";

            try {
              const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  token,
                  issuer_id: issuerId,
                  payment_method_id: paymentMethodId,
                  transaction_amount: amount,
                  installments,
                  description: plan.title,
                  payer: {
                    email: testEmail,
                    identification: {
                      type: identificationType,
                      number: identificationNumber,
                    },
                  },
                }),
              });

              const result = await response.json();

              if (response.ok) {
                alert('¡Pago exitoso!');
                onClose();
              } else {
                const errorMessage = result.error || 'Error desconocido del servidor.';
                alert(`Error en el pago: ${errorMessage}`);
              }
            } catch (error) {
              alert('Ocurrió un error de red o el servidor no respondió. Intenta de nuevo.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      });
      setCardForm(form);
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
          <div id="form-cardholderName"></div>
          <div id="form-cardholderEmail"></div>
          <div id="form-cardNumber"></div>
          <div id="form-cardExpirationMonth"></div>
          <div id="form-cardExpirationYear"></div>
          <div id="form-securityCode"></div>
          <div id="form-installments"></div>
          <div id="form-identificationType"></div>
          <div id="form-identificationNumber"></div>
          <div id="form-issuer"></div>
          <button type="submit" id="form-submit-btn" disabled={isLoading}>
            {isLoading ? 'Procesando...' : 'Pagar'}
          </button>
        </form>

      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: #111;
          padding: 30px;
          border-radius: 10px;
          width: 90%;
          max-width: 500px;
          position: relative;
        }
        .close-button {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          color: #fff;
          font-size: 2rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default PaymentModal;
