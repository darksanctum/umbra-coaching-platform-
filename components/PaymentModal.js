import React, { useEffect, useState, useRef } from 'react';

const SCRIPT_URL = "https://sdk.mercadopago.com/js/v2";

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const cardFormRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Carga el script de Mercado Pago solo una vez
  useEffect(() => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => alert("No se pudo cargar el script de Mercado Pago.");
    document.body.appendChild(script);

    return () => {
      // Limpia el script si el componente se desmonta
      document.body.removeChild(script);
    };
  }, []);

  // Inicializa y destruye el Card Form
  useEffect(() => {
    if (plan && isScriptLoaded) {
      setIsLoading(false);
      const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
      const cardForm = mp.cardForm({
        amount: String(plan.price),
        autoMount: true,
        form: { id: "form-checkout" /* ... etc ... */ },
        callbacks: {
          onSubmit: event => {
            event.preventDefault();
            const cardFormData = cardFormRef.current.getCardFormData();
            // Aquí iría la lógica de handlePayment que ya teníamos
          },
          // ... otros callbacks
        },
      });
      cardFormRef.current = cardForm;

      // **LA SOLUCIÓN CLAVE ESTÁ AQUÍ**
      // Retornamos una función de "limpieza" que se ejecuta cuando el modal se cierra
      return () => {
        if (cardFormRef.current) {
          cardFormRef.current.unmount();
          cardFormRef.current = null;
        }
      };
    }
  }, [plan, isScriptLoaded]);

  if (!plan) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Completa tu pago</h2>
        <h3>{plan.title}</h3>
        <p>${plan.price} MXN</p>
        
        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <form id="form-checkout">
            {/* ... divs del formulario ... */}
            <button type="submit">Pagar</button>
          </form>
        )}
      </div>
      {/* ... estilos ... */}
    </div>
  );
};

export default PaymentModal;
