import React, { useEffect, useState } from 'react';

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [cardForm, setCardForm] = useState(null);
  const [error, setError] = useState(null);

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
      console.error('Error en el pago:', error);
      alert(`Error en el pago: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!plan) return;

    // Verificar que la clave pública existe
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    if (!publicKey) {
      console.error('NEXT_PUBLIC_MP_PUBLIC_KEY no está configurada');
      setError('Error de configuración: Clave pública de Mercado Pago no encontrada');
      setIsLoading(false);
      return;
    }

    let mp;
    let form;

    const loadAndInit = async () => {
      try {
        // Cargar SDK de Mercado Pago si no está disponible
        if (!window.MercadoPago) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://sdk.mercadopago.com/js/v2";
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }
        
        console.log('Inicializando Mercado Pago con clave:', publicKey.substring(0, 10) + '...');
        mp = new window.MercadoPago(publicKey);
        
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
              if (error) {
                console.error("Form Mounted error: ", error);
                setError(`Error al montar el formulario: ${error.message || error}`);
                setIsLoading(false);
                return;
              }
              console.log('Formulario montado exitosamente');
              setIsLoading(false);
            },
            onSubmit: event => {
              event.preventDefault();
              const cardFormData = form.getCardFormData();
              handlePayment(cardFormData);
            },
            onFetching: (resource) => {
              console.log("Fetching resource: ", resource);
            }
          },
        });
        
        setCardForm(form);
      } catch (error) {
        console.error('Error al inicializar Mercado Pago:', error);
        setError(`Error al cargar Mercado Pago: ${error.message}`);
        setIsLoading(false);
      }
    };

    loadAndInit();

    return () => {
      if (form) {
        try {
          form.unmount();
        } catch (error) {
          console.error('Error al desmontar el formulario:', error);
        }
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
        
        {error && (
          <div className="error-message" style={{
            color: 'red',
            background: '#ffebee',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            {error}
          </div>
        )}
        
        {isLoading && !error && <p>Cargando formulario...</p>}
        
        <form id="form-checkout" style={{ display: (isLoading || error) ? 'none' : 'block' }}>
            <div id="form-cardholderName"></div>
            <div id="form-cardholderEmail"></div>
            <div id="form-cardNumber"></div>
            <div id="form-cardExpirationDate"></div>
            <div id="form-securityCode"></div>
            <div id="form-installments"></div>
            <div id="form-identificationType"></div>
            <div id="form-identificationNumber"></div>
            <div id="form-issuer"></div>
            <button type="submit" disabled={isLoading || error}>
              {isLoading ? 'Procesando...' : 'Pagar'}
            </button>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }
        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
        }
        .close-button:hover {
          color: #000;
        }
        #form-checkout div {
          margin-bottom: 1rem;
        }
        button[type="submit"] {
          background: #009ee3;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          width: 100%;
        }
        button[type="submit"]:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        button[type="submit"]:hover:not(:disabled) {
          background: #007ab8;
        }
      `}</style>
    </div>
  );
};

export default PaymentModal;
