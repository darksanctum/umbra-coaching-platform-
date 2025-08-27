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
        
        console.log('Inicializando Mercado Pago...');
        mp = new window.MercadoPago(publicKey);
        
        // Configuración del formulario con la estructura correcta
        form = mp.cardForm({
          amount: String(plan.price),
          autoMount: true,
          form: {
            id: "form-checkout",
            cardholderName: { 
              id: "form-checkout__cardholderName", 
              placeholder: "Titular de la tarjeta" 
            },
            cardholderEmail: { 
              id: "form-checkout__cardholderEmail", 
              placeholder: "Email" 
            },
            cardNumber: { 
              id: "form-checkout__cardNumber", 
              placeholder: "Número de tarjeta" 
            },
            cardExpirationDate: { 
              id: "form-checkout__cardExpirationDate", 
              placeholder: "MM/YY" 
            },
            securityCode: { 
              id: "form-checkout__securityCode", 
              placeholder: "Código de seguridad" 
            },
            installments: { 
              id: "form-checkout__installments", 
              placeholder: "Cuotas" 
            },
            identificationType: { 
              id: "form-checkout__identificationType", 
              placeholder: "Tipo de documento" 
            },
            identificationNumber: { 
              id: "form-checkout__identificationNumber", 
              placeholder: "Número de documento" 
            },
            issuer: { 
              id: "form-checkout__issuer", 
              placeholder: "Banco emisor" 
            },
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
          <div className="error-message">
            {error}
          </div>
        )}
        
        {isLoading && !error && <p>Cargando formulario de pago...</p>}
        
        <form id="form-checkout" style={{ display: (isLoading || error) ? 'none' : 'block' }}>
          <div className="form-row">
            <div id="form-checkout__cardNumber" className="form-field"></div>
          </div>
          <div className="form-row">
            <div id="form-checkout__cardExpirationDate" className="form-field"></div>
            <div id="form-checkout__securityCode" className="form-field"></div>
          </div>
          <div className="form-row">
            <div id="form-checkout__cardholderName" className="form-field"></div>
          </div>
          <div className="form-row">
            <div id="form-checkout__cardholderEmail" className="form-field"></div>
          </div>
          <div className="form-row">
            <div id="form-checkout__identificationType" className="form-field"></div>
            <div id="form-checkout__identificationNumber" className="form-field"></div>
          </div>
          <div className="form-row">
            <div id="form-checkout__issuer" className="form-field"></div>
          </div>
          <div className="form-row">
            <div id="form-checkout__installments" className="form-field"></div>
          </div>
          <button type="submit" disabled={isLoading || error} className="submit-button">
            {isLoading ? 'Procesando...' : 'Pagar ahora'}
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
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
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
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-button:hover {
          background: #f0f0f0;
          color: #000;
        }
        
        .error-message {
          color: #d32f2f;
          background: #ffebee;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 16px;
          border: 1px solid #ffcdd2;
        }
        
        #form-checkout {
          margin-top: 20px;
        }
        
        .form-row {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .form-field {
          flex: 1;
          min-height: 50px;
        }
        
        .submit-button {
          background: #009ee3;
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          width: 100%;
          transition: all 0.3s ease;
        }
        
        .submit-button:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
        
        .submit-button:hover:not(:disabled) {
          background: #007ab8;
          transform: translateY(-1px);
        }
        
        h2 {
          margin: 0 0 8px 0;
          color: #333;
        }
        
        h3 {
          margin: 0 0 4px 0;
          color: #666;
          font-weight: 500;
        }
        
        p {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #009ee3;
        }
      `}</style>
    </div>
  );
};

export default PaymentModal;
