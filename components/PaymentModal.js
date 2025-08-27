import React, { useEffect, useState } from 'react';

const PaymentModal = ({ plan, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [cardForm, setCardForm] = useState(null);

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
        form: { id: "form-checkout" /* ... etc ... */ },
        callbacks: {
          onFormMounted: error => {
            if (error) return console.warn("Form Mounted error: ", error);
            setIsLoading(false);
          },
          onSubmit: async event => {
            event.preventDefault();
            setIsLoading(true);
            const cardFormData = form.getCardFormData();
            // Lógica de handlePayment aquí...
            console.log(cardFormData);
            setIsLoading(false);
          },
        },
      });
      setCardForm(form);
    };

    loadAndInit();

    return () => {
      // Limpieza
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
            {/* ... divs del formulario ... */}
            <button type="submit" disabled={isLoading}>Pagar</button>
        </form>
      </div>
      {/* ... estilos ... */}
    </div>
  );
};

export default PaymentModal;
