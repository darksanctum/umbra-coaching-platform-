import React, { useEffect, useState, useRef } from 'react';

const SCRIPT_URL = "https://sdk.mercadopago.com/js/v2";

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(true); // Inicia en true hasta que el script cargue
  const cardFormRef = useRef(null);

  const loadMercadoPagoScript = () => {
    return new Promise((resolve, reject) => {
      if (window.MercadoPago) {
        return resolve();
      }
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => {
        resolve();
      };
      script.onerror = () => {
        reject(new Error("No se pudo cargar el script de Mercado Pago."));
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (cardFormData) => {
    // ... (La función handlePayment se queda exactamente igual que en la versión anterior)
  };

  useEffect(() => {
    if (!plan) return;

    loadMercadoPagoScript()
      .then(() => {
        setIsLoading(false); // El script cargó, podemos mostrar el form
        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
        const cardForm = mp.cardForm({
          amount: String(plan.price),
          autoMount: true,
          form: { id: "form-checkout" /* ... etc ... */ },
          callbacks: {
            onSubmit: event => {
              event.preventDefault();
              const cardFormData = cardFormRef.current.getCardFormData();
              handlePayment(cardFormData);
            },
            // ... otros callbacks
          },
        });
        cardFormRef.current = cardForm;
      })
      .catch(error => {
        console.error(error);
        alert(error.message);
      });

  }, [plan]);

  if (!plan) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Completa tu pago</h2>
        <h3>{plan.title}</h3>
        <p>${plan.price} MXN</p>
        
        {isLoading ? (
          <p>Cargando formulario de pago...</p>
        ) : (
          <form id="form-checkout">
            {/* ... (los divs del formulario son iguales) */}
            <button type="submit" id="form-submit-btn">Pagar</button>
          </form>
        )}
      </div>
      {/* ... (los estilos son iguales) */}
    </div>
  );
};

export default PaymentModal;
