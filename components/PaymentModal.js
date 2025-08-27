import React, { useEffect, useState } from 'react';

const SCRIPT_URL = "https://sdk.mercadopago.com/js/v2";

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [cardForm, setCardForm] = useState(null);

  // Efecto para cargar el script de MP
  useEffect(() => {
    if (window.MercadoPago) {
      setIsLoading(false);
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => setIsLoading(false);
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src="${SCRIPT_URL}"]`);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // Efecto para inicializar y destruir el formulario
  useEffect(() => {
    if (!isLoading && plan && window.MercadoPago) {
      const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, {
        locale: 'es-MX'
      });
      
      const form = mp.cardForm({
        amount: String(plan.price),
        autoMount: true,
        form: {
          id: "form-checkout",
          cardholderName: { id: "form-cardholderName", placeholder: "Titular de la tarjeta" },
          cardholderEmail: { id: "form-cardholderEmail", placeholder: "E-mail" },
          cardNumber: { id: "form-cardNumber", placeholder: "Número de tarjeta" },
          cardExpirationDate: { id: "form-cardExpirationDate", placeholder: "MM/YY" },
          securityCode: { id: "form-securityCode", placeholder: "CVC" },
          installments: { id: "form-installments", placeholder: "Cuotas" },
          identificationType: { id: "form-identificationType", placeholder: "Tipo de documento" },
          identificationNumber: { id: "form-identificationNumber", placeholder: "Número de documento" },
          issuer: { id: "form-issuer", placeholder: "Banco emisor" },
        },
        callbacks: {
          onFormMounted: error => {
            if (error) return console.warn("Form Mounted handling error: ", error);
          },
          onSubmit: async (event) => {
            event.preventDefault();
            setIsLoading(true);
            
            try {
              const { token, ...rest } = cardForm.getCardFormData();
              // Lógica de handlePayment aquí...
            } catch (e) {
              console.error('Error al obtener datos del form:', e);
            } finally {
              setIsLoading(false);
            }
          },
        },
      });
      setCardForm(form);
    }

    return () => {
      // Limpieza cuando el componente se desmonta o el plan cambia
      if (cardForm) {
        cardForm.unmount();
      }
    };
  }, [isLoading, plan]);

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
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Procesando...' : 'Pagar'}
            </button>
          </form>
        )}
      </div>
      {/* ... estilos ... */}
    </div>
  );
};

export default PaymentModal;
